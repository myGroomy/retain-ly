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

  if (loading) return <div className="flex-1 flex items-center justify-center"><span className="material-symbols-outlined animate-spin text-text-muted">progress_activity</span></div>
  if (!customer) return <div className="flex-1 flex items-center justify-center text-text-muted">Customer not found</div>

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

  return (
    <div className="flex-1 flex flex-col md:pl-sidebar-width min-h-screen bg-canvas-soft">
      <header className="sticky top-0 z-30 bg-canvas-base border-b border-hairline-default px-gutter-mobile h-top-nav-height flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/customers" className="w-10 h-10 -ml-2 rounded-lg flex items-center justify-center text-text-ink hover:bg-surface-subtle active:scale-[0.96] transition-all">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <h1 className="font-headline-md text-headline-md text-text-ink">Profil Pelanggan</h1>
        </div>
        <div className="flex items-center gap-1.5 bg-semantic-active-surface border border-semantic-active-border px-2.5 py-1 rounded-full">
          <span className="w-2 h-2 rounded-full bg-semantic-active animate-pulse"></span>
          <span className="font-caption-uppercase text-caption-uppercase text-semantic-active uppercase">Online</span>
        </div>
      </header>

      <main className="flex-1 px-gutter-mobile pt-5 pb-44 space-y-6">
        <section className="bg-surface-card border border-hairline-strong rounded-xl p-md">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <h2 className="font-display-hero-mobile md:font-display-hero text-display-hero-mobile md:text-display-hero text-text-ink tracking-tight">{customer.name}</h2>
              <div className="flex items-center gap-2 pt-0.5">
                <a href={`tel:${customer.phone_normalized}`} className="font-body-strong text-body-strong text-text-body hover:text-text-ink flex items-center gap-1 transition-colors">
                  <span className="material-symbols-outlined text-[18px]">phone</span>
                  {customer.phone_normalized}
                </a>
                <span className="inline-flex items-center gap-1 bg-semantic-active-surface border border-semantic-active-border text-semantic-active text-[11px] font-medium px-2 py-0.5 rounded-full">
                  <span className="material-symbols-outlined fill text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  WhatsApp Terverifikasi
                </span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-surface-subtle border border-hairline-strong flex items-center justify-center font-headline-md text-headline-md text-text-ink shrink-0">{initials}</div>
          </div>
          <div className="mt-4 pt-3.5 border-t border-hairline-default flex flex-wrap items-center gap-2">
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${status === 'active' ? 'bg-semantic-active-surface text-semantic-active border border-semantic-active-border' : status === 'at_risk' ? 'bg-semantic-risk-surface text-semantic-risk border border-semantic-risk-border' : 'bg-semantic-churned-surface text-semantic-churned border border-semantic-churned-border'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${status === 'active' ? 'bg-semantic-active' : status === 'at_risk' ? 'bg-semantic-risk' : 'bg-semantic-churned'}`}></span>
              <span className="font-caption-uppercase text-caption-uppercase">{getRetentionLabel(status)}</span>
            </div>
            <div className="inline-flex items-center gap-1.5 bg-surface-subtle text-text-ink border border-hairline-strong px-2.5 py-1 rounded-full">
              <span className="material-symbols-outlined text-[15px]">loyalty</span>
              <span className="font-caption-uppercase text-caption-uppercase">Loyal Customer ({customer.order_count}x order)</span>
            </div>
            <div className="ml-auto inline-flex items-center gap-1 text-text-body font-caption text-caption">
              <span className="material-symbols-outlined text-[15px]">history_toggle_off</span>
              Siklus: 7-10 Hari
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3">
          <div className="bg-surface-card border border-hairline-strong rounded-xl p-3.5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-text-body mb-2">
              <span className="font-caption-uppercase text-caption-uppercase">TOTAL ORDER</span>
              <span className="material-symbols-outlined text-[18px] text-text-muted">shopping_bag</span>
            </div>
            <div>
              <div className="font-numeric-stat text-numeric-stat text-text-ink">{customer.order_count} Kali</div>
              <div className="font-caption text-caption text-text-body mt-0.5">{customer.order_count > 5 ? 'Frekuensi Tinggi' : 'Frekuensi Normal'}</div>
            </div>
          </div>
          <div className="bg-surface-card border border-hairline-strong rounded-xl p-3.5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-text-body mb-2">
              <span className="font-caption-uppercase text-caption-uppercase">CHANNEL FAVORIT</span>
              <span className="material-symbols-outlined text-[18px] text-text-muted">moped</span>
            </div>
            <div>
              <div className="font-headline-lg text-headline-lg text-text-ink">{fav?.label || 'N/A'} {fav && <span className="font-body-md text-body-md text-text-body">({fav.pct}%)</span>}</div>
              <div className="font-caption text-caption text-text-body mt-0.5">{fav ? `${fav.count} dari ${orders.length} pesanan` : 'Belum ada data'}</div>
            </div>
          </div>
          <div className="bg-surface-card border border-hairline-strong rounded-xl p-3.5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-text-body mb-2">
              <span className="font-caption-uppercase text-caption-uppercase">ORDER TERAKHIR</span>
              <span className="material-symbols-outlined text-[18px] text-text-muted">update</span>
            </div>
            <div>
              <div className="font-body-strong text-body-strong text-text-ink">{customer.last_order_date}</div>
              <div className={`inline-flex items-center gap-1 font-caption text-caption mt-0.5 ${status === 'active' ? 'text-semantic-active' : status === 'at_risk' ? 'text-semantic-risk' : 'text-semantic-churned'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${status === 'active' ? 'bg-semantic-active' : status === 'at_risk' ? 'bg-semantic-risk' : 'bg-semantic-churned'}`}></span>
                {days === 0 ? 'Hari ini' : days === 1 ? 'Kemarin' : `${days} hari lalu`}
              </div>
            </div>
          </div>
          <div className="bg-surface-card border border-hairline-strong rounded-xl p-3.5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-text-body mb-2">
              <span className="font-caption-uppercase text-caption-uppercase">ORDER PERTAMA</span>
              <span className="material-symbols-outlined text-[18px] text-text-muted">calendar_month</span>
            </div>
            <div>
              <div className="font-body-strong text-body-strong text-text-ink">{customer.first_order_date}</div>
              <div className="font-caption text-caption text-text-body mt-0.5">{Math.floor((Date.now() - new Date(customer.first_order_date).getTime()) / 2592000000)} bulan berlangganan</div>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <h3 className="font-headline-sm text-headline-sm text-text-ink">Riwayat Transaksi</h3>
              <span className="inline-flex items-center justify-center bg-surface-subtle border border-hairline-strong font-caption-uppercase text-caption-uppercase px-2 py-0.5 rounded-full text-text-ink">{orders.length}</span>
            </div>
          </div>
          <div className="space-y-2.5">
            {orders.map((order) => {
              const ch = CHANNELS.find((c) => c.id === order.channel)
              return (
                <article key={order.id} className="bg-surface-card border border-hairline-strong rounded-xl p-3.5 hover:border-text-ink transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-surface-subtle flex items-center justify-center text-text-ink">
                        <span className="material-symbols-outlined text-[16px]">local_mall</span>
                      </span>
                      <div>
                        <div className="font-body-strong text-body-strong text-text-ink">{order.order_date}</div>
                        <div className="font-caption text-caption text-text-body">Cabang Senopati</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-surface-subtle text-text-ink border border-hairline-strong">{ch?.label || order.channel}</span>
                      <span className="font-caption text-caption text-text-muted shrink-0">Selesai</span>
                    </div>
                  </div>
                </article>
              )
            })}
            {orders.length === 0 && <p className="py-4 text-center text-sm text-text-muted">Belum ada riwayat order</p>}
          </div>
        </section>

        <section className="bg-surface-subtle border border-hairline-strong rounded-xl p-3.5">
          <div className="flex items-start gap-2.5">
            <span className="material-symbols-outlined text-text-ink text-[20px] mt-0.5">lightbulb</span>
            <div>
              <div className="font-body-strong text-body-strong text-text-ink">Rekomendasi Follow-up Kasir</div>
              <p className="font-body-sm text-body-sm text-text-body mt-1">
                {status === 'churned'
                  ? `Customer ini sudah ${days} hari tidak order. Kirim pesan WhatsApp personal untuk menawarkan promo kembali.`
                  : status === 'at_risk'
                    ? `Customer ini sudah ${days} hari tidak order. Pertimbangkan untuk follow-up sebelum churned.`
                    : `Customer aktif dengan ${customer.order_count} order. Pertahankan hubungan baik!`
                }
              </p>
            </div>
          </div>
        </section>
      </main>

      <div className="fixed bottom-0 left-0 md:left-sidebar-width right-0 p-4 bg-canvas-base/95 backdrop-blur-md border-t border-hairline-default z-30">
        <div className="w-full max-w-form-max-width mx-auto flex items-center gap-3">
          <a
            href={buildWaLink(customer.phone_normalized, customer.name)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 h-12 bg-semantic-active hover:bg-green-700 text-white rounded-lg font-button text-button font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">chat</span>
            Kirim WhatsApp
          </a>
          <button
            onClick={() => downloadVCard(customer.name, customer.phone_normalized)}
            className="h-12 px-4 rounded-lg border border-hairline-strong bg-canvas-base hover:bg-surface-subtle text-text-ink font-button text-button font-medium flex items-center gap-2 active:scale-[0.98] transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">contacts</span>
            Download vCard
          </button>
        </div>
      </div>
    </div>
  )
}
