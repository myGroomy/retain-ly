'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MagnifyingGlass,
  X,
  Check,
  UserPlus,
  ArrowRight,
  FloppyDisk,
  ArrowCounterClockwise,
  Phone,
  Basket,
} from '@phosphor-icons/react'
import { supabase } from '@/services/supabaseClient'
import { findCustomerByPhone, createCustomer } from '@/services/customerService'
import { createOrder } from '@/services/orderService'
import { normalizePhone } from '@/utils/normalizePhone'
import { FLUID_EASE } from '@/lib/motion'
import type { ChannelType, Customer } from '@/types'

const CHANNELS = [
  { id: 'dine_in' as ChannelType, label: 'Dine-in' },
  { id: 'takeaway' as ChannelType, label: 'Takeaway' },
  { id: 'gofood' as ChannelType, label: 'Gofood' },
  { id: 'grab' as ChannelType, label: 'Grab' },
  { id: 'shopee' as ChannelType, label: 'Shopee' },
  { id: 'whatsapp' as ChannelType, label: 'WhatsApp' },
  { id: 'custom' as ChannelType, label: 'Lainnya' },
]

const fadeUp = {
  hidden: { opacity: 0, y: 20, filter: 'blur(4px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.6, ease: FLUID_EASE } },
}

export default function InputOrderPage() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Customer[]>([])
  const [searching, setSearching] = useState(false)
  const [debounceTimer, setDebounceTimer] = useState<ReturnType<typeof setTimeout> | null>(null)

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [isCreatingNew, setIsCreatingNew] = useState(false)

  const [newName, setNewName] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [channel, setChannel] = useState<ChannelType>('takeaway')
  const [customChannel, setCustomChannel] = useState('')
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showToast, setShowToast] = useState(false)

  useEffect(() => () => { if (debounceTimer) clearTimeout(debounceTimer) }, [debounceTimer])

  const handleSearch = (value: string) => {
    setQuery(value)
    setSelectedCustomer(null)
    setIsCreatingNew(false)
    setError(null)
    if (debounceTimer) clearTimeout(debounceTimer)

    if (!value || value.length < 2) {
      setResults([])
      setSearching(false)
      return
    }

    setSearching(true)
    const timer = setTimeout(async () => {
      const { data } = await supabase
        .from('customers')
        .select('*')
        .or(`phone_normalized.ilike.%${value}%,name.ilike.%${value}%`)
        .order('name')
        .limit(8)
      setResults(data || [])
      setSearching(false)
    }, 300)
    setDebounceTimer(timer)
  }

  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer)
    setQuery(`${customer.name} — ${customer.phone_normalized}`)
    setResults([])
    setIsCreatingNew(false)
  }

  const handleCreateNew = () => {
    setIsCreatingNew(true)
    setSelectedCustomer(null)
    setNewName(query)
    setNewPhone('')
  }

  const isPhone = (val: string) => /^\d{8,15}$/.test(val.replace(/\D/g, ''))

  useEffect(() => {
    if (query.length >= 8 && isPhone(query) && !selectedCustomer && !isCreatingNew) {
      setNewPhone(query)
      setNewName('')
      setIsCreatingNew(true)
    }
  }, [query])

  const handleReset = () => {
    setQuery('')
    setResults([])
    setSelectedCustomer(null)
    setIsCreatingNew(false)
    setNewName('')
    setNewPhone('')
    setChannel('takeaway')
    setCustomChannel('')
    setOrderDate(new Date().toISOString().split('T')[0])
    setError(null)
    inputRef.current?.focus()
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    try {
      let customerId = selectedCustomer?.id
      if (!customerId) {
        if (!newName.trim()) { setError('Nama customer wajib diisi'); setLoading(false); return }
        if (!newPhone.trim()) { setError('Nomor WhatsApp wajib diisi'); setLoading(false); return }
        const normalizedPhone = normalizePhone(newPhone)
        const existing = await findCustomerByPhone(newPhone)
        if (existing) {
          customerId = existing.id
        } else {
          const newCustomer = await createCustomer({
            phone_normalized: normalizedPhone,
            name: newName.trim(),
            first_order_date: orderDate,
          })
          customerId = newCustomer.id
        }
      }
      await createOrder({
        customer_id: customerId!,
        order_date: orderDate,
        channel: channel === 'custom' ? 'custom' : channel,
        raw_phone_input: newPhone || selectedCustomer?.phone_normalized || '',
      })
      setShowToast(true)
      setTimeout(() => { setShowToast(false); handleReset() }, 2200)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan order')
    } finally {
      setLoading(false)
    }
  }

  const showDropdown = (results.length > 0 || (query.length >= 2 && !searching))
  const canSubmit = (selectedCustomer || (isCreatingNew && newName.trim() && newPhone.trim())) && !loading

  return (
    <main className="mx-auto w-full max-w-2xl px-5 py-8 sm:px-6 md:py-12">
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: FLUID_EASE }}
          className="mb-6 rounded-2xl border border-rose/20 bg-rose/10 p-3.5 text-sm text-rose-600"
        >
          {error}
        </motion.div>
      )}

      <motion.div variants={fadeUp} initial="hidden" animate="show" className="mb-8">
        <span className="eyebrow">Rekam Transaksi</span>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Input Order</h1>
        <p className="mt-2 text-sm text-ash">Cari pelanggan, atau daftarkan yang baru</p>
      </motion.div>

      {/* Combined search */}
      <div className="doppel-outer">
        <div className="doppel-inner p-4 sm:p-5">
          <motion.div variants={fadeUp} initial="hidden" animate="show" className="relative">
            <div className="relative">
              <MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-mist" size={20} weight="light" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Ketik nama atau nomor HP..."
                className="field h-13 pl-11"
              />
              {query && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="absolute right-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full text-mist transition-colors duration-300 hover:bg-sunken hover:text-ink"
                >
                  <X size={16} weight="bold" />
                </button>
              )}
            </div>

            <AnimatePresence>
              {showDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.98 }}
                  transition={{ duration: 0.2, ease: FLUID_EASE }}
                  className="absolute left-0 right-0 z-20 mt-3 overflow-hidden rounded-3xl border border-hairline bg-white shadow-2xl shadow-ink/10"
                >
                  {results.length > 0 && (
                    <>
                      <div className="flex items-center justify-between border-b border-hairline px-4 py-2.5">
                        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-mist">Pelanggan Ditemukan</span>
                        <span className="text-xs text-mist">{results.length}</span>
                      </div>
                      {results.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => handleSelectCustomer(c)}
                          className="group flex w-full items-center gap-3 border-b border-hairline/60 p-3.5 text-left transition-colors duration-300 hover:bg-sunken"
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-accent-wash text-xs font-semibold text-accent-deep">
                            {c.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-medium text-ink">{c.name}</div>
                            <div className="flex items-center gap-1 font-mono text-xs text-ash"><Phone size={12} />{c.phone_normalized}</div>
                          </div>
                          <ArrowRight size={16} weight="bold" className="shrink-0 text-mist transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-accent" />
                        </button>
                      ))}
                    </>
                  )}

                  <button
                    type="button"
                    onClick={handleCreateNew}
                    className="flex w-full items-center gap-3 p-3.5 text-left transition-colors duration-300 hover:bg-sunken"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-sunken text-accent">
                      <UserPlus size={20} weight="duotone" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-ink">Buat Pelanggan Baru</div>
                      <div className="text-xs text-ash">
                        {isPhone(query) ? `Nomor ${query}` : `Nama "${query}"`}
                      </div>
                    </div>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      {/* Selected customer */}
      <AnimatePresence>
        {selectedCustomer && !isCreatingNew && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.5, ease: FLUID_EASE }}
            className="mt-4"
          >
            <div className="doppel-outer">
              <div className="doppel-inner flex items-center gap-4 p-4 sm:p-5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent-wash text-sm font-semibold text-accent-deep">
                  {selectedCustomer.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-base font-semibold text-ink">{selectedCustomer.name}</div>
                  <div className="flex items-center gap-1 font-mono text-xs text-ash">
                    <Phone size={12} weight="bold" />{selectedCustomer.phone_normalized}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 rounded-full border border-emerald/25 bg-emerald/10 px-3 py-1">
                  <Check size={13} weight="bold" className="text-emerald" />
                  <span className="text-xs font-semibold text-emerald">Terpilih</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* New customer form */}
      <AnimatePresence>
        {isCreatingNew && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.5, ease: FLUID_EASE }}
            className="mt-4"
          >
            <div className="doppel-outer">
              <div className="doppel-inner p-4 sm:p-5">
                <div className="mb-4 flex items-center gap-2">
                  <UserPlus size={18} weight="duotone" className="text-accent" />
                  <span className="text-base font-semibold text-ink">Pelanggan Baru</span>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ash">Nama *</label>
                    <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nama lengkap" className="field h-11" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ash">No. WhatsApp *</label>
                    <input type="tel" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} placeholder="08xxxxxxxxxx" className="field h-11 font-mono" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Channel & date */}
      {(selectedCustomer || isCreatingNew) && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05, ease: FLUID_EASE }}
          className="mt-4 grid grid-cols-1 gap-4"
        >
          <div className="doppel-outer">
            <div className="doppel-inner p-4 sm:p-5">
              <label className="mb-3 block text-xs font-semibold uppercase tracking-wider text-ash">Channel Order *</label>
              <div className="flex flex-wrap gap-2">
                {CHANNELS.map((ch) => (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => setChannel(ch.id)}
                    className={`rounded-full px-4 py-2 text-xs font-semibold transition-all duration-500 active:scale-[0.96] ${
                      channel === ch.id
                        ? 'bg-accent text-white shadow-[0_6px_16px_-6px_rgba(47,108,255,0.5)]'
                        : 'border border-hairline bg-white text-ash hover:bg-sunken hover:text-ink'
                    }`}
                  >
                    {ch.label}
                  </button>
                ))}
              </div>
              {channel === 'custom' && (
                <input
                  type="text"
                  value={customChannel}
                  onChange={(e) => setCustomChannel(e.target.value)}
                  placeholder="Sebutkan channel..."
                  className="field mt-3 h-10"
                />
              )}
            </div>
          </div>

          <div className="doppel-outer">
            <div className="doppel-inner p-4 sm:p-5">
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ash">Tanggal Transaksi</label>
              <input
                type="date"
                value={orderDate}
                onChange={(e) => setOrderDate(e.target.value)}
                className="field h-11"
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* Fixed bottom CTA */}
      {(selectedCustomer || isCreatingNew) ? (
        <div className="fixed inset-x-0 bottom-0 z-30 md:left-64">
          <div className="mx-auto max-w-2xl p-4">
            <div className="relative">
              <AnimatePresence>
                {showToast && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute -top-14 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-emerald px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-emerald/30"
                  >
                    <Check size={16} weight="bold" /> Order tersimpan
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="doppel-outer rounded-[1.75rem]">
                <div className="doppel-inner flex items-center gap-3 rounded-[calc(1.75rem-0.375rem)] p-3">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!canSubmit}
                    className="group flex h-13 flex-1 items-center justify-center gap-3 rounded-full bg-accent text-sm font-semibold text-white transition-all duration-700 hover:-translate-y-px active:scale-[0.98] disabled:opacity-40"
                    style={{ boxShadow: '0 8px 24px -8px rgba(47, 108, 255, 0.5)' }}
                  >
                    {loading ? (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    ) : (
                      <>
                        <FloppyDisk size={18} weight="bold" />
                        <span>Simpan Order</span>
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 transition-transform duration-500 group-hover:translate-x-0.5">
                          <ArrowRight size={15} weight="bold" />
                        </span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="flex h-13 w-13 items-center justify-center rounded-full border border-hairline bg-white text-ash transition-all duration-500 hover:bg-sunken hover:text-ink active:scale-[0.96]"
                  >
                    <ArrowCounterClockwise size={18} weight="bold" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 flex items-center justify-center gap-2 text-sm text-mist"
        >
          <Basket size={16} weight="duotone" className="text-accent" />
          Pilih atau buat pelanggan untuk melanjutkan
        </motion.p>
      )}
    </main>
  )
}