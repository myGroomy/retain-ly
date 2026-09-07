import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
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

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
}

export function InputOrderPage() {
  const navigate = useNavigate()
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
      setTimeout(() => navigate('/app/customers'), 1500)
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
      <header className="sticky top-0 z-30 bg-white border-b border-zinc-100">
        <div className="flex justify-between items-center w-full px-6 h-14 max-w-3xl mx-auto">
          <div>
            <h1 className="text-base font-semibold text-zinc-900">Input Order</h1>
            <p className="text-xs text-zinc-400">Rekam transaksi & data pelanggan</p>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 border border-green-200 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
            <span className="text-xs text-green-700 font-medium">Online</span>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-3xl mx-auto px-6 py-6 pb-32 md:pb-8 space-y-5">
        <motion.form
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.4 }}
          className="bg-white rounded-2xl border border-zinc-100 p-5 md:p-6 space-y-5"
          onSubmit={handleSubmit}
        >
          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">Tanggal Transaksi</label>
            <input
              type="date"
              value={orderDate}
              onChange={(e) => setOrderDate(e.target.value)}
              className="w-full h-11 px-3.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm text-zinc-900 font-medium focus:border-zinc-900 focus:ring-0 focus:outline-none transition-colors"
            />
          </div>

          {/* Search */}
          <div className="relative">
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">Cari Nama atau No. HP</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none">
                <span className="material-symbols-outlined text-[18px]">search</span>
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Ketik 4 digit nomor HP atau nama..."
                className="w-full h-12 pl-10 pr-10 bg-white border-2 border-zinc-900 rounded-lg text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none transition-all"
              />
              {searchQuery && (
                <button type="button" onClick={() => { setSearchQuery(''); setName(''); setPhone(''); setSelectedCustomer(null) }} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 p-1 rounded">
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              )}
            </div>

            {/* Search Results Dropdown */}
            <AnimatePresence>
              {results.length > 0 && !selectedCustomer && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className="absolute left-0 right-0 mt-2 bg-white border border-zinc-200 rounded-xl shadow-xl overflow-hidden z-20"
                >
                  <div className="px-3 py-2 border-b border-zinc-100 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Hasil Pencarian</span>
                    <span className="text-xs text-zinc-500">{results.length} ditemukan</span>
                  </div>
                  {results.map((customer) => (
                    <div
                      key={customer.id}
                      className="p-3 hover:bg-zinc-50 cursor-pointer transition-colors border-b border-zinc-50"
                      onClick={() => handleSelectCustomer(customer.id, customer.name, customer.phone_normalized)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-zinc-900 text-white flex items-center justify-center text-xs font-semibold">
                            {customer.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-zinc-900">{customer.name}</div>
                            <div className="text-xs text-zinc-400 font-mono">{customer.phone_normalized}</div>
                          </div>
                        </div>
                        <span className="material-symbols-outlined text-green-500 text-[16px]">check_circle</span>
                      </div>
                    </div>
                  ))}
                  <div
                    className="p-3 hover:bg-zinc-50 cursor-pointer transition-colors flex items-center justify-between"
                    onClick={handleAddNew}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500">
                        <span className="material-symbols-outlined text-[16px]">person_add</span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-zinc-900">Buat Baru</div>
                        <div className="text-xs text-zinc-400">Gunakan &apos;{searchQuery}&apos; sebagai nama</div>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-zinc-300 text-[18px]">chevron_right</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Duplicate Alert */}
            <AnimatePresence>
              {showDuplicateAlert && duplicateData && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className="absolute left-0 right-0 mt-2 bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3 z-20"
                >
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-amber-600 text-[20px] mt-0.5">contact_phone</span>
                    <div>
                      <div className="text-sm font-semibold text-amber-800">Nomor Sudah Terdaftar</div>
                      <p className="text-xs text-amber-700 mt-0.5">
                        <strong>{duplicateData.name}</strong> ({duplicateData.phone}) sudah ada di database.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={handleApplyExisting} className="flex-1 h-9 bg-zinc-900 text-white rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all">
                      <span className="material-symbols-outlined text-[14px]">check</span>
                      Pakai Data Ini
                    </button>
                    <button type="button" onClick={() => { setShowDuplicateAlert(false); setDuplicateData(null) }} className="h-9 px-3 bg-white border border-zinc-200 text-zinc-700 rounded-lg text-xs font-medium active:scale-[0.98] transition-all">
                      Buat Baru
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5" htmlFor="name">Nama Customer *</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama lengkap"
                className="w-full h-11 px-3.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-0 focus:outline-none transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">No. WhatsApp *</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="08xxxxxxxxxx"
                className="w-full h-11 px-3.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm text-zinc-900 font-mono placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-0 focus:outline-none transition-colors"
                required
              />
            </div>
          </div>

          {/* Channel */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">Channel Order *</label>
            <div className="flex flex-wrap gap-2">
              {CHANNELS.map((ch) => (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => setChannel(ch.id)}
                  className={`px-3.5 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all active:scale-[0.96] ${
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
                className="w-full h-10 px-3.5 mt-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-0 focus:outline-none"
              />
            )}
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700"
            >
              {error}
            </motion.div>
          )}
        </motion.form>
      </main>

      {/* Fixed bottom CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="fixed bottom-16 md:bottom-0 left-0 md:left-60 right-0 p-4 bg-white/95 backdrop-blur-md border-t border-zinc-100 z-30"
      >
        <div className="w-full max-w-3xl mx-auto flex items-center gap-3">
          <AnimatePresence>
            {showToast && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-full left-4 right-4 mb-2 bg-zinc-900 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-lg"
              >
                <span className="material-symbols-outlined text-green-400 text-[16px]">check_circle</span>
                <span className="text-sm font-medium">Order tersimpan!</span>
              </motion.div>
            )}
          </AnimatePresence>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 h-12 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">save</span>
                <span>Simpan Order</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => { setSearchQuery(''); setName(''); setPhone(''); setChannel('takeaway') }}
            className="h-12 w-12 rounded-lg border border-zinc-200 flex items-center justify-center text-zinc-400 hover:bg-zinc-50 active:scale-[0.96] transition-transform"
          >
            <span className="material-symbols-outlined text-[18px]">refresh</span>
          </button>
        </div>
      </motion.div>
    </>
  )
}
