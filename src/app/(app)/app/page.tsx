'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
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
  ShoppingBag,
  ClockCounterClockwise,
  ArrowSquareOut,
  UserCheck,
} from '@phosphor-icons/react'
import { supabase } from '@/services/supabaseClient'
import { findCustomerByPhone, createCustomer, searchCustomers } from '@/services/customerService'
import { createOrder } from '@/services/orderService'
import { getRetentionStatus, getRetentionLabel } from '@/utils/churnStatus'
import { normalizePhone } from '@/utils/normalizePhone'
import { DEFAULT_THRESHOLDS } from '@/constants'
import { FLUID_EASE } from '@/lib/motion'
import { useMounted } from '@/lib/useMounted'
import type { ChannelType, CustomerWithStats } from '@/types'

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
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: FLUID_EASE } },
}

export default function InputOrderPage() {
  const ready = useMounted()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<CustomerWithStats[]>([])
  const [searching, setSearching] = useState(false)
  const [debounceTimer, setDebounceTimer] = useState<ReturnType<typeof setTimeout> | null>(null)

  const [selectedCustomer, setSelectedCustomer] = useState<CustomerWithStats | null>(null)
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

  const isPhone = (val: string) => /^\d{8,15}$/.test(val.replace(/\D/g, ''))

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
      try {
        const res = await searchCustomers(value, 0, 8)
        const withStatus = res.data.map((c) => ({
          ...c,
          retention_status: getRetentionStatus(c.last_order_date, DEFAULT_THRESHOLDS),
        }))
        setResults(withStatus)
      } catch {
        setResults([])
      } finally {
        setSearching(false)
      }
    }, 300)
    setDebounceTimer(timer)
  }

  const handleSelectCustomer = (customer: CustomerWithStats) => {
    const status = getRetentionStatus(customer.last_order_date, DEFAULT_THRESHOLDS)
    setSelectedCustomer({ ...customer, retention_status: status })
    setIsCreatingNew(false)
    setQuery(`${customer.name} (${customer.phone_normalized})`)
    setResults([])
  }

  const handleCreateNew = () => {
    setIsCreatingNew(true)
    setSelectedCustomer(null)
    setResults([])
    if (isPhone(query)) {
      setNewPhone(query)
      setNewName('')
    } else {
      setNewName(query)
      setNewPhone('')
    }
  }

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

  const showDropdown = !selectedCustomer && !isCreatingNew && (results.length > 0 || (query.length >= 2 && !searching))
  const canSubmit = (selectedCustomer || (isCreatingNew && newName.trim() && newPhone.trim())) && !loading

  const getStatusStyle = (status?: string) => {
    if (status === 'active') return 'border-emerald/25 bg-emerald/10 text-emerald'
    if (status === 'at_risk') return 'border-amber/25 bg-amber/10 text-amber-600'
    return 'border-rose/25 bg-rose/10 text-rose-600'
  }

  const daysSinceLastOrder = selectedCustomer
    ? Math.floor((Date.now() - new Date(selectedCustomer.last_order_date).getTime()) / 86400000)
    : 0

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6 md:py-10 pb-36 md:pb-32">
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

      <motion.div variants={fadeUp} initial="hidden" animate={ready ? 'show' : 'hidden'} className="mb-6">
        <span className="eyebrow">Rekam Transaksi</span>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-ink sm:text-4xl">Input Order Baru</h1>
        <p className="mt-1.5 text-xs text-ash sm:text-sm">Cari pelanggan atau daftarkan pelanggan baru</p>
      </motion.div>

      {/* Combined search */}
      <div className="doppel-outer">
        <div className="doppel-inner p-4 sm:p-5">
          <motion.div variants={fadeUp} initial="hidden" animate={ready ? 'show' : 'hidden'} className="relative">
            <div className="relative">
              <MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-mist" size={20} weight="light" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Ketik nama atau nomor HP..."
                className="field h-12 text-sm sm:h-13 sm:text-base pl-11"
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
                        <div
                          key={c.id}
                          onClick={() => handleSelectCustomer(c)}
                          className="group flex w-full items-center justify-between gap-3 border-b border-hairline/60 p-3.5 text-left transition-colors duration-300 hover:bg-sunken cursor-pointer"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-accent-wash text-xs font-semibold text-accent-deep">
                              {c.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="truncate text-sm font-medium text-ink">{c.name}</span>
                                <span className="rounded-full bg-accent-wash px-2 py-0.5 text-[10px] font-semibold text-accent-deep">
                                  {c.order_count || 0}x order
                                </span>
                              </div>
                              <div className="flex items-center gap-1 font-mono text-xs text-ash">
                                <Phone size={12} />{c.phone_normalized}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <Link
                              href={`/app/customers/${c.id}`}
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center gap-1 rounded-full border border-hairline bg-white px-2.5 py-1 text-xs font-medium text-ash transition-colors hover:bg-sunken hover:text-ink"
                              title="Lihat Profil Lengkap"
                            >
                              <ArrowSquareOut size={13} weight="bold" />
                              <span className="hidden sm:inline">Profil</span>
                            </Link>
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-white transition-transform group-hover:scale-105">
                              <Check size={14} weight="bold" />
                            </span>
                          </div>
                        </div>
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

      {/* Selected customer — Rich Profile Card */}
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
              <div className="doppel-inner p-4 sm:p-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent-wash text-sm font-semibold text-accent-deep">
                      {selectedCustomer.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h2 className="truncate text-base font-semibold text-ink sm:text-lg">{selectedCustomer.name}</h2>
                        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${getStatusStyle(selectedCustomer.retention_status)}`}>
                          {getRetentionLabel(selectedCustomer.retention_status)}
                        </span>
                      </div>
                      <a href={`tel:${selectedCustomer.phone_normalized}`} className="mt-1 flex items-center gap-1 font-mono text-xs text-ash hover:text-accent">
                        <Phone size={12} weight="bold" />{selectedCustomer.phone_normalized}
                      </a>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleReset}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-hairline bg-white text-mist transition-colors hover:bg-sunken hover:text-ink"
                    title="Ganti Pelanggan"
                  >
                    <X size={14} weight="bold" />
                  </button>
                </div>

                {/* Sub Stats Grid */}
                <div className="mt-4 grid grid-cols-2 gap-2.5 border-t border-hairline pt-4">
                  <div className="rounded-2xl border border-hairline bg-white p-3">
                    <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-ash">
                      <span>Total Order</span>
                      <ShoppingBag size={14} weight="duotone" className="text-accent" />
                    </div>
                    <div className="mt-1 text-base font-semibold text-ink sm:text-lg">
                      {selectedCustomer.order_count}x <span className="text-xs font-normal text-ash">order</span>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-hairline bg-white p-3">
                    <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-ash">
                      <span>Order Terakhir</span>
                      <ClockCounterClockwise size={14} weight="duotone" className="text-accent" />
                    </div>
                    <div className="mt-1 truncate text-xs font-semibold text-ink sm:text-sm">
                      {daysSinceLastOrder === 0 ? 'Hari ini' : `${daysSinceLastOrder} hari lalu`}
                    </div>
                  </div>
                </div>

                {/* Direct Link to Profile */}
                <div className="mt-3 flex justify-end">
                  <Link
                    href={`/app/customers/${selectedCustomer.id}`}
                    className="group inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:text-accent-deep"
                  >
                    <span>Lihat Profil & Riwayat Transaksi Lengkap</span>
                    <ArrowSquareOut size={14} weight="bold" className="transition-transform group-hover:translate-x-0.5" />
                  </Link>
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
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserPlus size={18} weight="duotone" className="text-accent" />
                    <span className="text-base font-semibold text-ink">Pelanggan Baru</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsCreatingNew(false)}
                    className="flex h-7 w-7 items-center justify-center rounded-full text-mist transition-colors hover:bg-sunken hover:text-ink"
                  >
                    <X size={16} weight="bold" />
                  </button>
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
              <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                {CHANNELS.map((ch) => (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => setChannel(ch.id)}
                    className={`min-h-[44px] rounded-full px-4 py-2.5 text-xs font-semibold transition-all duration-300 active:scale-[0.96] ${
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
                  className="field mt-3 h-11"
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

      {/* Fixed bottom CTA — mobile responsive spacing above bottom nav */}
      {(selectedCustomer || isCreatingNew) ? (
        <div className="fixed inset-x-0 bottom-20 md:bottom-0 z-30 md:left-64">
          <div className="mx-auto max-w-2xl px-4 py-3">
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
                <div className="doppel-inner flex items-center gap-2.5 rounded-[calc(1.75rem-0.375rem)] p-2.5 sm:p-3">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!canSubmit}
                    className="group flex min-h-[48px] h-12 sm:h-13 flex-1 items-center justify-center gap-2.5 rounded-full bg-accent text-sm font-semibold text-white transition-all duration-500 hover:-translate-y-px active:scale-[0.98] disabled:opacity-40"
                    style={{ boxShadow: '0 8px 24px -8px rgba(47, 108, 255, 0.5)' }}
                  >
                    {loading ? (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    ) : (
                      <>
                        <FloppyDisk size={18} weight="bold" />
                        <span>Simpan Order</span>
                        <span className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-white/20 transition-transform duration-500 group-hover:translate-x-0.5">
                          <ArrowRight size={15} weight="bold" />
                        </span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="flex min-h-[48px] h-12 w-12 sm:h-13 sm:w-13 items-center justify-center rounded-full border border-hairline bg-white text-ash transition-all duration-500 hover:bg-sunken hover:text-ink active:scale-[0.96]"
                    title="Batal / Reset"
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