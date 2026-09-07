import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getCustomerById } from '@/services/customerService'
import { getOrdersByCustomer } from '@/services/orderService'
import { getRetentionStatus, getRetentionLabel } from '@/utils/churnStatus'
import { buildWaLink } from '@/utils/waLinkBuilder'
import { downloadVCard } from '@/utils/vcardGenerator'
import { CHANNELS, DEFAULT_THRESHOLDS, PAGE_SIZE } from '@/constants'
import type { CustomerWithStats, Order } from '@/types'

export function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [customer, setCustomer] = useState<CustomerWithStats | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [page] = useState(0)
  const [, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => { if (id) loadData() }, [id, page])

  const loadData = async () => {
    if (!id) return
    setLoading(true)
    try {
      const [c, o] = await Promise.all([getCustomerById(id), getOrdersByCustomer(id, page, PAGE_SIZE)])
      if (c) {
        const status = getRetentionStatus(c.last_order_date, DEFAULT_THRESHOLDS)
        setCustomer({ ...c, retention_status: status })
      }
      setOrders(o.data)
      setTotalPages(o.totalPages)
    } catch { /* silent */ } finally { setLoading(false) }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <span className="material-symbols-outlined animate-spin text-zinc-300">progress_activity</span>
      </div>
    )
  }
  if (!customer) return <div className="flex-1 flex items-center justify-center text-zinc-400">Customer not found</div>

  const status = customer.retention_status
  const days = Math.floor((Date.now() - new Date(customer.last_order_date).getTime()) / 86400000)
  const initials = customer.name.split(' ').map((n) => n[0]).join('').slice(0, 2)

  const getFavChannel = () => {
    if (!orders.length) return null
    const freq: Record<string, number> = {}
    orders.forEach((o) => { freq[o.channel] = (freq[o.channel] || 0) + 1 })
    const top = Object.entries(freq).sort((a, b) => b[1] - a[1])[0]
    const pct = Math.round((top[1] / orders.length) * 100)
    const ch = CHANNELS.find((c) => c.id === top[0])
    return { label: ch?.label || top[0], pct, count: top[1] }
  }

  const fav = getFavChannel()

  const getStatusStyle = () => {
    if (status === 'active') return 'bg-green-50 text-green-700 border border-green-200'
    if (status === 'at_risk') return 'bg-amber-50 text-amber-700 border border-amber-200'
    return 'bg-red-50 text-red-600 border border-red-200'
  }

  return (
    <div className="flex-1 flex flex-col md:pl-60 min-h-screen bg-zinc-50">
      <header className="sticky top-0 z-30 bg-white border-b border-zinc-100">
        <div className="flex items-center w-full px-6 h-14 max-w-3xl mx-auto gap-4">
          <Link to="/app/customers" className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:bg-zinc-100 active:scale-[0.96] transition-all">
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </Link>
          <h1 className="text-base font-semibold text-zinc-900">Profil Pelanggan</h1>
        </div>
      </header>

      <main className="flex-1 w-full max-w-3xl mx-auto px-6 py-6 pb-32 md:pb-8 space-y-5">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-zinc-100 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-zinc-900">{customer.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <a href={`tel:${customer.phone_normalized}`} className="text-sm text-zinc-500 hover:text-zinc-900 flex items-center gap-1 transition-colors">
                  <span className="material-symbols-outlined text-[16px]">phone</span>
                  {customer.phone_normalized}
                </a>
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                  <span className="material-symbols-outlined text-[12px]">check_circle</span>
                  WA Verified
                </span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-zinc-100 flex items-center justify-center text-lg font-semibold text-zinc-600 shrink-0">
              {initials}
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-zinc-100 flex flex-wrap items-center gap-2">
            <span className={`text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${getStatusStyle()}`}>
              {getRetentionLabel(status)}
            </span>
            <span className="text-xs text-zinc-400 bg-zinc-50 border border-zinc-200 px-2 py-0.5 rounded-full">
              {customer.order_count}x Order
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Total Order', value: `${customer.order_count}x`, icon: 'shopping_bag' },
            { label: 'Channel Favorit', value: fav?.label || 'N/A', icon: 'restaurant' },
            { label: 'Order Terakhir', value: customer.last_order_date, sub: days === 0 ? 'Hari ini' : `${days} hari lalu`, icon: 'update' },
            { label: 'Order Pertama', value: customer.first_order_date, icon: 'calendar_month' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-zinc-100 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">{s.label}</span>
                <span className="material-symbols-outlined text-[16px] text-zinc-300">{s.icon}</span>
              </div>
              <div className="text-sm font-semibold text-zinc-900">{s.value}</div>
              {s.sub && <div className="text-xs text-zinc-400 mt-0.5">{s.sub}</div>}
            </div>
          ))}
        </div>

        {/* Order History */}
        <div>
          <h3 className="text-sm font-semibold text-zinc-900 mb-3">Riwayat Transaksi</h3>
          <div className="space-y-2">
            {orders.map((order) => {
              const ch = CHANNELS.find((c) => c.id === order.channel)
              return (
                <div key={order.id} className="bg-white border border-zinc-100 rounded-xl p-3.5 hover:shadow-sm transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-zinc-50 flex items-center justify-center">
                        <span className="material-symbols-outlined text-[16px] text-zinc-400">local_mall</span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-zinc-900">{order.order_date}</div>
                        <div className="text-xs text-zinc-400">Cabang Senopati</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-medium bg-zinc-50 text-zinc-600 border border-zinc-200 px-2 py-0.5 rounded">
                        {ch?.label || order.channel}
                      </span>
                      <span className="text-xs text-zinc-400">Selesai</span>
                    </div>
                  </div>
                </div>
              )
            })}
            {orders.length === 0 && <p className="py-8 text-center text-sm text-zinc-400">Belum ada riwayat order</p>}
          </div>
        </div>

        {/* Recommendation */}
        <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-zinc-500 text-[18px] mt-0.5">lightbulb</span>
            <div>
              <div className="text-sm font-semibold text-zinc-900">Rekomendasi</div>
              <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                {status === 'churned'
                  ? `Customer ini sudah ${days} hari tidak order. Kirim pesan WhatsApp personal untuk menawarkan promo kembali.`
                  : status === 'at_risk'
                    ? `Customer ini sudah ${days} hari tidak order. Pertimbangkan untuk follow-up sebelum churned.`
                    : `Customer aktif dengan ${customer.order_count} order. Pertahankan hubungan baik!`
                }
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Fixed bottom CTA */}
      <div className="fixed bottom-16 md:bottom-0 left-0 md:left-60 right-0 p-4 bg-white/95 backdrop-blur-md border-t border-zinc-100 z-30">
        <div className="w-full max-w-3xl mx-auto flex items-center gap-3">
          <a
            href={buildWaLink(customer.phone_normalized, customer.name)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 h-12 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">chat</span>
            Kirim WhatsApp
          </a>
          <button
            onClick={() => downloadVCard(customer.name, customer.phone_normalized)}
            className="h-12 px-4 rounded-lg border border-zinc-200 bg-white text-zinc-700 text-sm font-medium flex items-center gap-2 active:scale-[0.98] transition-all hover:bg-zinc-50"
          >
            <span className="material-symbols-outlined text-[16px]">contacts</span>
            vCard
          </button>
        </div>
      </div>
    </div>
  )
}
