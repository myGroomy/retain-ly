'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Save, RefreshCw, Search, X, Check, UserPlus, ArrowRight, Phone } from 'lucide-react'
import { supabase } from '@/services/supabaseClient'
import { findCustomerByPhone, createCustomer } from '@/services/customerService'
import { createOrder } from '@/services/orderService'
import { normalizePhone } from '@/utils/normalizePhone'
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

type Step = 'search' | 'confirm'

export default function InputOrderPage() {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Customer[]>([])
  const [searching, setSearching] = useState(false)
  const [debounceTimer, setDebounceTimer] = useState<ReturnType<typeof setTimeout> | null>(null)

  const [step, setStep] = useState<Step>('search')
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

  useEffect(() => {
    return () => { if (debounceTimer) clearTimeout(debounceTimer) }
  }, [debounceTimer])

  const handleSearch = (value: string) => {
    setQuery(value)
    setStep('search')
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
    setStep('search')
    inputRef.current?.focus()
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)

    try {
      let customerId = selectedCustomer?.id

      if (!customerId) {
        if (!newName.trim()) {
          setError('Nama customer wajib diisi')
          setLoading(false)
          return
        }
        if (!newPhone.trim()) {
          setError('Nomor WhatsApp wajib diisi')
          setLoading(false)
          return
        }

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
      setTimeout(() => {
        setShowToast(false)
        handleReset()
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan order')
    } finally {
      setLoading(false)
    }
  }

  const showDropdown = step === 'search' && (results.length > 0 || (query.length >= 2 && !searching))
  const canSubmit = (selectedCustomer || (isCreatingNew && newName.trim() && newPhone.trim())) && !loading

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-zinc-100 bg-white">
        <div className="mx-auto flex h-14 w-full max-w-2xl items-center justify-between px-6">
          <div>
            <h1 className="text-base font-semibold text-zinc-900">Input Order</h1>
            <p className="text-xs text-zinc-400">Cari pelanggan atau buat baru</p>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-2.5 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            <span className="text-xs font-medium text-green-700">Online</span>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl px-6 py-6 pb-32 md:pb-8">
        <div className="space-y-4">
          {/* Search / Input Field */}
          <div className="relative">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-zinc-400 pointer-events-none" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => step === 'search' && results.length > 0 && setResults(results)}
                placeholder="Ketik nama atau nomor HP..."
                className="h-13 w-full rounded-xl border-2 border-zinc-900 bg-white pl-10 pr-10 text-sm font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none transition-all"
              />
              {query && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Search Results Dropdown */}
            <AnimatePresence>
              {showDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 right-0 z-20 mt-2 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl"
                >
                  {results.length > 0 && (
                    <>
                      <div className="flex items-center justify-between border-b border-zinc-100 px-3.5 py-2">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Pelanggan Ditemukan</span>
                        <span className="text-xs text-zinc-500">{results.length}</span>
                      </div>
                      {results.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => handleSelectCustomer(c)}
                          className="flex w-full items-center gap-3 border-b border-zinc-50 p-3.5 text-left transition-colors hover:bg-zinc-50"
                        >
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-xs font-semibold text-white">
                            {c.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-zinc-900 truncate">{c.name}</div>
                            <div className="font-mono text-xs text-zinc-400">{c.phone_normalized}</div>
                          </div>
                          <ArrowRight className="h-4 w-4 shrink-0 text-zinc-300" />
                        </button>
                      ))}
                    </>
                  )}

                  {/* Add New Option */}
                  <button
                    type="button"
                    onClick={handleCreateNew}
                    className="flex w-full items-center gap-3 p-3.5 text-left transition-colors hover:bg-zinc-50"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-500">
                      <UserPlus className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-zinc-900">Buat Pelanggan Baru</div>
                      <div className="text-xs text-zinc-400">
                        {isPhone(query) ? `Nomor ${query}` : `Nama "${query}"`}
                      </div>
                    </div>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Selected Customer */}
          <AnimatePresence>
            {selectedCustomer && !isCreatingNew && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="rounded-xl border border-zinc-200 bg-white p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-sm font-semibold text-white">
                    {selectedCustomer.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-zinc-900">{selectedCustomer.name}</div>
                    <div className="flex items-center gap-1.5 font-mono text-xs text-zinc-400">
                      <Phone className="h-3 w-3" />
                      {selectedCustomer.phone_normalized}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5">
                    <Check className="h-3 w-3 text-green-600" />
                    <span className="text-[11px] font-medium text-green-700">Terpilih</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* New Customer Form */}
          <AnimatePresence>
            {isCreatingNew && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="space-y-3 rounded-xl border border-zinc-200 bg-white p-4"
              >
                <div className="flex items-center gap-2 mb-1">
                  <UserPlus className="h-4 w-4 text-zinc-500" />
                  <span className="text-sm font-semibold text-zinc-900">Pelanggan Baru</span>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-500">Nama *</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Nama lengkap"
                    className="h-10 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-0"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-500">No. WhatsApp *</label>
                  <input
                    type="tel"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="08xxxxxxxxxx"
                    className="h-10 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 font-mono text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-0"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Channel */}
          {(selectedCustomer || isCreatingNew) && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-zinc-200 bg-white p-4"
            >
              <label className="mb-2 block text-xs font-medium text-zinc-500">Channel Order *</label>
              <div className="flex flex-wrap gap-1.5">
                {CHANNELS.map((ch) => (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => setChannel(ch.id)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all active:scale-[0.96] ${
                      channel === ch.id
                        ? 'bg-zinc-900 text-white'
                        : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
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
                  className="mt-2 h-9 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-0"
                />
              )}
            </motion.div>
          )}

          {/* Date */}
          {(selectedCustomer || isCreatingNew) && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-zinc-200 bg-white p-4"
            >
              <label className="mb-1 block text-xs font-medium text-zinc-500">Tanggal Transaksi</label>
              <input
                type="date"
                value={orderDate}
                onChange={(e) => setOrderDate(e.target.value)}
                className="h-10 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-sm font-medium text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-0"
              />
            </motion.div>
          )}

          {/* Error */}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
          )}
        </div>
      </main>

      {/* Fixed Bottom CTA */}
      {(selectedCustomer || isCreatingNew) && (
        <div className="fixed bottom-16 left-0 right-0 z-30 border-t border-zinc-100 bg-white/95 backdrop-blur-md md:bottom-0 md:left-60">
          <div className="mx-auto flex w-full max-w-2xl items-center gap-3 p-4">
            <AnimatePresence>
              {showToast && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute bottom-full left-4 right-4 mb-2 flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg"
                >
                  <Check className="h-4 w-4" />
                  Order tersimpan!
                </motion.div>
              )}
            </AnimatePresence>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-zinc-900 text-sm font-medium text-white hover:bg-zinc-800 active:scale-[0.98] transition-all disabled:opacity-40"
            >
              {loading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <Save className="h-[18px] w-[18px]" />
                  <span>Simpan Order</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-200 text-zinc-400 hover:bg-zinc-50 active:scale-[0.96] transition-transform"
            >
              <RefreshCw className="h-[18px] w-[18px]" />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
