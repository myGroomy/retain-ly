import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
      setTimeout(() => navigate('/customers'), 1500)
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
    <div className="flex-1 flex flex-col md:pl-sidebar-width w-full pb-36 md:pb-12 bg-canvas-soft">
      <header className="bg-canvas-base sticky top-0 z-30 shadow-sm md:shadow-none">
        <div className="flex justify-between items-center w-full px-4 h-top-nav-height max-w-container-max-width mx-auto">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-surface-subtle flex items-center justify-center text-text-ink">
              <span className="material-symbols-outlined text-[20px]">storefront</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-headline-sm text-headline-sm font-semibold text-text-ink leading-tight tracking-tight">Cabang Senopati</h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-semantic-active-surface border border-semantic-active-border text-semantic-active font-caption-uppercase text-caption-uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-semantic-active"></span>
                  Online
                </span>
              </div>
              <p className="font-caption text-caption text-text-body hidden sm:block">Jam Operasional: 09:00 - 22:00 WIB • Terminal #01</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right mr-1 hidden sm:block">
              <div className="font-caption-uppercase text-caption-uppercase text-text-muted">RETENSI HARI INI</div>
              <div className="font-headline-sm text-headline-sm font-bold text-text-ink">74.2%</div>
            </div>
            <button className="w-9 h-9 rounded-lg border border-hairline-strong flex items-center justify-center text-text-body hover:bg-surface-subtle active:scale-[0.96] transition-transform">
              <span className="material-symbols-outlined text-[18px]">sync</span>
            </button>
          </div>
        </div>
      </header>

      <main className="w-full max-w-form-max-width mx-auto px-gutter-mobile md:px-0 pt-4 md:pt-6 space-y-4">
        <div className="bg-surface-card rounded-xl border border-hairline-strong p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-surface-dark flex items-center justify-center text-text-on-dark font-headline-sm text-headline-sm">
              <span className="material-symbols-outlined">point_of_sale</span>
            </div>
            <div>
              <div className="font-headline-sm text-headline-sm text-text-ink leading-tight">Input Order Cepat</div>
              <div className="font-caption text-caption text-text-body">Rekam kontak WhatsApp & data retensi pelanggan</div>
            </div>
          </div>
          <span className="bg-surface-subtle border border-hairline-strong px-2.5 py-1 rounded-full font-caption-uppercase text-caption-uppercase text-text-ink font-semibold">Shift Pagi</span>
        </div>

        <form className="bg-surface-card rounded-xl border border-hairline-strong p-4 md:p-6 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block font-body-strong text-body-strong text-text-ink mb-1.5 flex items-center justify-between">
              <span>Tanggal Transaksi</span>
              <span className="font-caption text-caption text-text-muted">Auto-lock shift date</span>
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-text-body flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-[20px]">calendar_today</span>
              </span>
              <input
                type="date"
                value={orderDate}
                onChange={(e) => setOrderDate(e.target.value)}
                className="w-full h-11 pl-11 pr-10 bg-surface-subtle text-text-ink font-body-md text-body-md rounded-lg border border-hairline-strong focus:outline-none cursor-default font-medium"
              />
            </div>
          </div>

          <div className="relative">
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-body-strong text-body-strong text-text-ink">Cari Nama atau No. Telp</label>
              <span className="font-caption-uppercase text-caption-uppercase text-semantic-active font-semibold flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">bolt</span>
                Pencarian Cepat
              </span>
            </div>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-text-body flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-[20px]">search</span>
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Ketik 4 digit nomor HP atau nama..."
                className="w-full h-12 pl-11 pr-10 bg-canvas-base text-text-ink font-body-md text-body-md rounded-lg border-2 border-text-ink focus:outline-none transition-all placeholder:text-text-muted"
              />
              {searchQuery && (
                <button type="button" onClick={() => { setSearchQuery(''); setName(''); setPhone(''); setSelectedCustomer(null) }} className="absolute right-3 text-text-body hover:text-text-ink p-1 rounded">
                  <span className="material-symbols-outlined text-[18px]">cancel</span>
                </button>
              )}
            </div>

            {results.length > 0 && !selectedCustomer && (
              <div className="mt-2 bg-canvas-base border border-hairline-strong rounded-xl shadow-xl overflow-hidden z-20 transition-all">
                <div className="px-3 py-2 bg-hairline-soft border-b border-hairline-default flex items-center justify-between">
                  <span className="font-caption-uppercase text-caption-uppercase text-text-muted">Hasil Pencarian Database</span>
                  <span className="font-caption text-caption text-text-body">{results.length} Terdaftar</span>
                </div>
                {results.map((customer) => (
                  <div
                    key={customer.id}
                    className="p-3 hover:bg-surface-subtle cursor-pointer transition-colors border-b border-hairline-default"
                    onClick={() => handleSelectCustomer(customer.id, customer.name, customer.phone_normalized)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-text-ink text-on-primary flex items-center justify-center font-headline-sm text-headline-sm text-xs mt-0.5">
                          {customer.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <div className="font-headline-sm text-headline-sm text-text-ink font-semibold flex items-center gap-1.5">
                            {customer.name}
                            <span className="material-symbols-outlined text-semantic-active text-[16px] fill" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                          </div>
                          <div className="font-body-sm text-body-sm text-text-body font-mono">{customer.phone_normalized}</div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="h-[22px] px-2 rounded-full font-caption-uppercase text-caption-uppercase font-semibold flex items-center bg-semantic-active-surface text-semantic-active border border-semantic-active-border">ACTIVE</span>
                        <span className="font-caption text-caption text-text-body">Customer terdaftar</span>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="p-3 hover:bg-surface-subtle cursor-pointer transition-colors flex items-center justify-between text-text-ink" onClick={handleAddNew}>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-surface-subtle border border-hairline-strong flex items-center justify-center text-text-ink">
                      <span className="material-symbols-outlined text-[18px]">person_add</span>
                    </div>
                    <div>
                      <div className="font-body-strong text-body-strong text-text-ink leading-tight">Buat Kontak Baru</div>
                      <div className="font-caption text-caption text-text-body">Gunakan '{searchQuery}' sebagai nama pelanggan baru</div>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-text-body">chevron_right</span>
                </div>
              </div>
            )}

            {showDuplicateAlert && duplicateData && (
              <div className="mt-3 rounded-xl border border-semantic-risk-border bg-semantic-risk-surface p-3.5 space-y-3">
                <div className="flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-semantic-risk text-[22px] flex-shrink-0 mt-0.5">contact_phone</span>
                  <div className="text-text-ink">
                    <div className="font-headline-sm text-headline-sm text-semantic-risk font-semibold">Deteksi Nomor Pelanggan</div>
                    <p className="font-body-sm text-body-sm text-text-ink mt-0.5">
                      Nomor <strong className="font-semibold font-mono">{duplicateData.phone}</strong> sudah terdaftar atas nama <strong className="font-semibold">{duplicateData.name}</strong>. Gunakan data ini atau buat entry baru?
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <button type="button" onClick={handleApplyExisting} className="flex-1 h-10 bg-cta-black hover:bg-cta-black-active text-on-primary rounded-lg font-button text-button font-medium flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all">
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                    Pakai Data Ini
                  </button>
                  <button type="button" onClick={() => { setShowDuplicateAlert(false); setDuplicateData(null) }} className="h-10 px-3.5 bg-canvas-base border border-hairline-strong text-text-ink hover:bg-surface-subtle rounded-lg font-button text-button font-medium active:scale-[0.98] transition-all">
                    Tetap Buat Baru
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-body-strong text-body-strong text-text-ink mb-1.5" htmlFor="name">Nama Customer <span className="text-error">*</span></label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-text-body flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-[18px]">person</span>
                </span>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama lengkap pelanggan"
                  className="w-full h-11 pl-10 pr-3.5 bg-canvas-base text-text-ink font-body-md text-body-md rounded-lg border border-hairline-strong focus:border-2 focus:border-text-ink focus:outline-none transition-all"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block font-body-strong text-body-strong text-text-ink mb-1.5 flex items-center justify-between">
                <span>No. Handphone (WhatsApp) <span className="text-error">*</span></span>
                {phone && normalizePhone(phone).match(/^08\d{8,13}$/) && (
                  <span className="font-caption text-caption text-semantic-active font-semibold flex items-center gap-0.5">
                    <span className="material-symbols-outlined text-[14px] fill" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    Valid WA
                  </span>
                )}
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-text-body flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-[18px]">call</span>
                </span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="08xxxxxxxxxx"
                  className="w-full h-11 pl-10 pr-3.5 bg-canvas-base text-text-ink font-body-md text-body-md font-mono rounded-lg border border-hairline-strong focus:border-2 focus:border-text-ink focus:outline-none transition-all"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block font-body-strong text-body-strong text-text-ink mb-1.5 flex items-center justify-between">
              <span>Channel Order <span className="text-error">*</span></span>
              <span className="font-caption text-caption text-text-muted">Pilih platform transaksi</span>
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5 mb-2">
              {CHANNELS.map((ch) => (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => setChannel(ch.id)}
                  className={`py-2 px-1 rounded-lg text-center font-caption-uppercase text-caption-uppercase font-semibold transition-all active:scale-[0.96] ${
                    channel === ch.id
                      ? 'border-2 border-text-ink bg-text-ink text-on-primary'
                      : 'border border-hairline-strong bg-canvas-base text-text-body hover:border-text-ink'
                  }`}
                >
                  {ch.label}
                </button>
              ))}
            </div>
            <div className="relative flex items-center">
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value as ChannelType)}
                className="w-full h-11 px-3.5 bg-canvas-base text-text-ink font-body-md text-body-md rounded-lg border border-hairline-strong focus:border-2 focus:border-text-ink focus:outline-none appearance-none cursor-pointer"
              >
                {CHANNELS.map((ch) => (
                  <option key={ch.id} value={ch.id}>{ch.label}</option>
                ))}
              </select>
              <span className="absolute right-3 text-text-body pointer-events-none">
                <span className="material-symbols-outlined text-[20px]">expand_more</span>
              </span>
            </div>
            {channel === 'custom' && (
              <div className="mt-2 pt-2 border-t border-hairline-default">
                <label className="block font-caption text-caption text-text-body mb-1">Spesifikasi Channel 'Lainnya':</label>
                <input
                  type="text"
                  value={customChannel}
                  onChange={(e) => setCustomChannel(e.target.value)}
                  placeholder="Contoh: Bazaar Senopati, Catering Kantor..."
                  className="w-full h-10 px-3 bg-surface-subtle text-text-ink font-body-sm text-body-sm rounded-lg border border-hairline-strong focus:border-2 focus:border-text-ink focus:outline-none"
                />
              </div>
            )}
          </div>

          {error && (
            <div className="rounded-xl border border-error-container bg-error-container p-3 text-sm text-on-error-container">{error}</div>
          )}
        </form>
      </main>

      <div className="fixed bottom-bottom-nav-height md:bottom-0 left-0 md:left-sidebar-width right-0 p-3 md:p-4 bg-canvas-base/95 backdrop-blur-md border-t border-hairline-default z-30 flex flex-col items-center">
        <div className="w-full max-w-form-max-width mx-auto flex flex-col items-center">
          {showToast && (
            <div className="mb-2.5 w-full bg-cta-black text-on-primary px-3.5 py-2 rounded-lg flex items-center justify-between shadow-lg transition-all duration-300">
              <div className="flex items-center gap-2 font-body-sm text-body-sm">
                <span className="w-5 h-5 rounded-full bg-semantic-active flex items-center justify-center text-white">
                  <span className="material-symbols-outlined text-[14px] fill" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                </span>
                <span className="font-medium">Order tersimpan! Database pelanggan telah diperbarui.</span>
              </div>
              <button onClick={() => setShowToast(false)} className="text-text-muted hover:text-white p-0.5">
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>
          )}
          <div className="w-full flex items-center gap-2">
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 h-12 bg-cta-black hover:bg-cta-black-active text-on-primary rounded-lg font-button text-button font-semibold flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[20px]">save</span>
                  <span>Simpan Order Transaksi</span>
                </>
              )}
            </button>
            <button type="button" onClick={() => { setSearchQuery(''); setName(''); setPhone(''); setChannel('takeaway') }} className="h-12 w-12 rounded-lg border border-hairline-strong flex items-center justify-center text-text-body hover:bg-surface-subtle active:scale-[0.96] transition-transform">
              <span className="material-symbols-outlined text-[20px]">refresh</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
