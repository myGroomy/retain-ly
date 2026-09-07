'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Save, RefreshCw, Search, X, Check, UserPlus, ChevronRight, AlertTriangle } from 'lucide-react'
import { useCustomerSearch } from '@/hooks/useCustomerSearch'
import { findCustomerByPhone, createCustomer } from '@/services/customerService'
import { createOrder } from '@/services/orderService'
import { normalizePhone } from '@/utils/normalizePhone'
import type { ChannelType } from '@/types'

const CHANNELS = [
  { id: 'dine_in' as ChannelType, label: 'Dine-in' },
  { id: 'takeaway' as ChannelType, label: 'Takeaway' },
  { id: 'gofood' as ChannelType, label: 'Gofood' },
  { id: 'grab' as ChannelType, label: 'Grab' },
  { id: 'shopee' as ChannelType, label: 'Shopee' },
  { id: 'whatsapp' as ChannelType, label: 'WhatsApp' },
  { id: 'custom' as ChannelType, label: 'Lainnya' },
]

export default function InputOrderPage() {
  const router = useRouter()
  const { results, search } = useCustomerSearch()

  const [searchQuery, setSearchQuery] = useState('')
  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')
  const [channel, setChannel] = useState<ChannelType>('takeaway')
  const [customChannel, setCustomChannel] = useState('')
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null)
  const [showDuplicateAlert, setShowDuplicateAlert] = useState(false)
  const [duplicateData, setDuplicateData] = useState<{ name: string; phone: string; id: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showToast, setShowToast] = useState(false)

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    setSelectedCustomer(null)
    search(value)
  }

  const handleSelectCustomer = (customerId: string, customerName: string, customerPhone: string) => {
    setSelectedCustomer(customerId)
    setName(customerName)
    setPhone(customerPhone)
    setSearchQuery(`${customerName} (${customerPhone})`)
  }

  const handleAddNew = () => {
    setName(searchQuery || '')
    setPhone('')
    setSelectedCustomer(null)
    setSearchQuery(searchQuery)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const normalizedPhone = normalizePhone(phone)
      let customerId = selectedCustomer

      if (!customerId) {
        const existing = await findCustomerByPhone(phone)
        if (existing) {
          setDuplicateData({ name: existing.name, phone: existing.phone_normalized, id: existing.id })
          setShowDuplicateAlert(true)
          setLoading(false)
          return
        }

        const newCustomer = await createCustomer({
          phone_normalized: normalizedPhone,
          name,
          first_order_date: orderDate,
        })
        customerId = newCustomer.id
      }

      await createOrder({
        customer_id: customerId,
        order_date: orderDate,
        channel: channel === 'custom' ? 'custom' : channel,
        raw_phone_input: phone,
      })

      setShowToast(true)
      setTimeout(() => setShowToast(false), 4000)
      setTimeout(() => router.push('/app/customers'), 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan order')
    } finally {
      setLoading(false)
    }
  }

  const handleApplyExisting = () => {
    if (duplicateData) {
      handleSelectCustomer(duplicateData.id, duplicateData.name, duplicateData.phone)
      setShowDuplicateAlert(false)
      setDuplicateData(null)
    }
  }

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-zinc-100 bg-white">
        <div className="mx-auto flex h-14 w-full max-w-3xl items-center justify-between px-6">
          <div>
            <h1 className="text-base font-semibold text-zinc-900">Input Order</h1>
            <p className="text-xs text-zinc-400">Rekam transaksi & data pelanggan</p>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-2.5 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            <span className="text-xs font-medium text-green-700">Online</span>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl space-y-5 px-6 py-6 pb-32 md:pb-8">
        <form className="space-y-5 rounded-2xl border border-zinc-100 bg-white p-5 md:p-6" onSubmit={handleSubmit}>
          {/* Date */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700">Tanggal Transaksi</label>
            <input
              type="date"
              value={orderDate}
              onChange={(e) => setOrderDate(e.target.value)}
              className="h-11 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3.5 text-sm font-medium text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-0 transition-colors"
            />
          </div>

          {/* Search */}
          <div className="relative">
            <label className="mb-1.5 block text-sm font-medium text-zinc-700">Cari Nama atau No. HP</label>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-zinc-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Ketik 4 digit nomor HP atau nama..."
                className="h-12 w-full rounded-lg border-2 border-zinc-900 bg-white pl-10 pr-10 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => { setSearchQuery(''); setName(''); setPhone(''); setSelectedCustomer(null) }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-zinc-400 hover:text-zinc-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Search Results Dropdown */}
            <AnimatePresence>
              {results.length > 0 && !selectedCustomer && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="absolute left-0 right-0 z-20 mt-2 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl"
                >
                  <div className="flex items-center justify-between border-b border-zinc-100 px-3 py-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Hasil Pencarian</span>
                    <span className="text-xs text-zinc-500">{results.length} ditemukan</span>
                  </div>
                  {results.map((customer) => (
                    <div
                      key={customer.id}
                      className="cursor-pointer border-b border-zinc-50 p-3 transition-colors hover:bg-zinc-50"
                      onClick={() => handleSelectCustomer(customer.id, customer.name, customer.phone_normalized)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-xs font-semibold text-white">
                            {customer.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-zinc-900">{customer.name}</div>
                            <div className="font-mono text-xs text-zinc-400">{customer.phone_normalized}</div>
                          </div>
                        </div>
                        <Check className="h-4 w-4 text-green-500" />
                      </div>
                    </div>
                  ))}
                  <div
                    className="flex cursor-pointer items-center justify-between p-3 transition-colors hover:bg-zinc-50"
                    onClick={handleAddNew}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-zinc-500">
                        <UserPlus className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-zinc-900">Buat Baru</div>
                        <div className="text-xs text-zinc-400">Gunakan &apos;{searchQuery}&apos; sebagai nama</div>
                      </div>
                    </div>
                    <ChevronRight className="h-[18px] w-[18px] text-zinc-300" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Duplicate Alert */}
            <AnimatePresence>
              {showDuplicateAlert && duplicateData && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="absolute left-0 right-0 z-20 mt-2 space-y-3 rounded-xl border border-amber-200 bg-amber-50 p-4"
                >
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                    <div>
                      <div className="text-sm font-semibold text-amber-800">Nomor Sudah Terdaftar</div>
                      <p className="mt-0.5 text-xs text-amber-700">
                        <strong>{duplicateData.name}</strong> ({duplicateData.phone}) sudah ada di database.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleApplyExisting}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-2 text-xs font-medium text-white active:scale-[0.98] transition-all"
                    >
                      <Check className="h-3.5 w-3.5" />
                      Pakai Data Ini
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowDuplicateAlert(false); setDuplicateData(null) }}
                      className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-700 active:scale-[0.98] transition-all"
                    >
                      Buat Baru
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Name & Phone */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-700" htmlFor="name">Nama Customer *</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama lengkap"
                className="h-11 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-0 transition-colors"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-700">No. WhatsApp *</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="08xxxxxxxxxx"
                className="h-11 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3.5 font-mono text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-0 transition-colors"
                required
              />
            </div>
          </div>

          {/* Channel */}
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700">Channel Order *</label>
            <div className="flex flex-wrap gap-2">
              {CHANNELS.map((ch) => (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => setChannel(ch.id)}
                  className={`rounded-lg px-3.5 py-2 text-xs font-semibold uppercase tracking-wider transition-all active:scale-[0.96] ${
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
                className="mt-2 h-10 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-0"
              />
            )}
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
          )}
        </form>
      </main>

      {/* Fixed bottom CTA */}
      <div className="fixed bottom-16 left-0 right-0 z-30 border-t border-zinc-100 bg-white/95 backdrop-blur-md md:bottom-0 md:left-60">
        <div className="mx-auto flex w-full max-w-3xl items-center gap-3 p-4">
          <AnimatePresence>
            {showToast && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-full left-4 right-4 mb-2 flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white shadow-lg"
              >
                <Check className="h-4 w-4 text-green-400" />
                Order tersimpan!
              </motion.div>
            )}
          </AnimatePresence>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-lg bg-zinc-900 text-sm font-medium text-white hover:bg-zinc-800 active:scale-[0.98] transition-all disabled:opacity-50"
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
            onClick={() => { setSearchQuery(''); setName(''); setPhone(''); setChannel('takeaway') }}
            className="flex h-12 w-12 items-center justify-center rounded-lg border border-zinc-200 text-zinc-400 hover:bg-zinc-50 active:scale-[0.96] transition-transform"
          >
            <RefreshCw className="h-[18px] w-[18px]" />
          </button>
        </div>
      </div>
    </>
  )
}
