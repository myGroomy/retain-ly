'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, Phone, CheckCircle, ShoppingBag, Utensils, RefreshCw, Calendar, MessageCircle, Contact2, Lightbulb } from 'lucide-react'
import { getCustomerById } from '@/services/customerService'
import { getOrdersByCustomer } from '@/services/orderService'
import { getRetentionStatus, getRetentionLabel } from '@/utils/churnStatus'
import { buildWaLink } from '@/utils/waLinkBuilder'
import { downloadVCard } from '@/utils/vcardGenerator'
import { CHANNELS, DEFAULT_THRESHOLDS, PAGE_SIZE } from '@/constants'
import type { CustomerWithStats, Order } from '@/types'

export default function CustomerDetailPage() {
  const params = useParams()
  const id = params.id as string
  const [customer, setCustomer] = useState<CustomerWithStats | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { if (id) loadData() }, [id])

  const loadData = async () => {
    if (!id) return
    setLoading(true)
    try {
      const [c, o] = await Promise.all([getCustomerById(id), getOrdersByCustomer(id, 0, PAGE_SIZE)])
      if (c) {
        const status = getRetentionStatus(c.last_order_date, DEFAULT_THRESHOLDS)
        setCustomer({ ...c, retention_status: status })
      }
      setOrders(o.data)
    } catch { /* silent */ } finally { setLoading(false) }
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-transparent" />
      </div>
    )
  }
  if (!customer) return <div className="flex flex-1 items-center justify-center text-zinc-400">Customer not found</div>

  const status = customer.retention_status
  const days = Math.floor((Date.now() - new Date(customer.last_order_date).getTime()) / 86400000)
  const initials = customer.name.split(' ').map((n) => n[0]).join('').slice(0, 2)

  const getFavChannel = () => {
    if (!orders.length) return null
    const freq: Record<string, number> = {}
    orders.forEach((o) => { freq[o.channel] = (freq[o.channel] || 0) + 1 })
    const top = Object.entries(freq).sort((a, b) => b[1] - a[1])[0]
    const ch = CHANNELS.find((c) => c.id === top[0])
    return { label: ch?.label || top[0], count: top[1] }
  }

  const fav = getFavChannel()

  const getStatusStyle = () => {
    if (status === 'active') return 'bg-green-50 text-green-700 border border-green-200'
    if (status === 'at_risk') return 'bg-amber-50 text-amber-700 border border-amber-200'
    return 'bg-red-50 text-red-600 border border-red-200'
  }

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-zinc-100 bg-white">
        <div className="mx-auto flex h-14 w-full max-w-3xl items-center gap-4 px-6">
          <Link href="/app/customers" className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition-all hover:bg-zinc-100 active:scale-[0.96]">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-base font-semibold text-zinc-900">Profil Pelanggan</h1>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl space-y-5 px-6 py-6 pb-32 md:pb-8">
        {/* Profile Card */}
        <div className="rounded-2xl border border-zinc-100 bg-white p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-zinc-900">{customer.name}</h2>
              <div className="mt-1 flex items-center gap-2">
                <a href={`tel:${customer.phone_normalized}`} className="flex items-center gap-1 text-sm text-zinc-500 transition-colors hover:text-zinc-900">
                  <Phone className="h-4 w-4" />
                  {customer.phone_normalized}
                </a>
                <span className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-[11px] font-medium text-green-600">
                  <CheckCircle className="h-3 w-3" />
                  WA Verified
                </span>
              </div>
            </div>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-lg font-semibold text-zinc-600">
              {initials}
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-zinc-100 pt-4">
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${getStatusStyle()}`}>
              {getRetentionLabel(status)}
            </span>
            <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-xs text-zinc-400">
              {customer.order_count}x Order
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Total Order', value: `${customer.order_count}x`, icon: ShoppingBag },
            { label: 'Channel Favorit', value: fav?.label || 'N/A', icon: Utensils },
            { label: 'Order Terakhir', value: customer.last_order_date, sub: days === 0 ? 'Hari ini' : `${days} hari lalu`, icon: RefreshCw },
            { label: 'Order Pertama', value: customer.first_order_date, icon: Calendar },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-zinc-100 bg-white p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">{s.label}</span>
                <s.icon className="h-4 w-4 text-zinc-300" />
              </div>
              <div className="text-sm font-semibold text-zinc-900">{s.value}</div>
              {s.sub && <div className="mt-0.5 text-xs text-zinc-400">{s.sub}</div>}
            </div>
          ))}
        </div>

        {/* Order History */}
        <div>
          <h3 className="mb-3 text-sm font-semibold text-zinc-900">Riwayat Transaksi</h3>
          <div className="space-y-2">
            {orders.map((order) => {
              const ch = CHANNELS.find((c) => c.id === order.channel)
              return (
                <div key={order.id} className="rounded-xl border border-zinc-100 bg-white p-3.5 transition-shadow hover:shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-50">
                        <span className="text-xs text-zinc-400">📦</span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-zinc-900">{order.order_date}</div>
                        <div className="text-xs text-zinc-400">Cabang Senopati</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[11px] font-medium text-zinc-600">
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
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
          <div className="flex items-start gap-3">
            <Lightbulb className="mt-0.5 h-[18px] w-[18px] shrink-0 text-zinc-500" />
            <div>
              <div className="text-sm font-semibold text-zinc-900">Rekomendasi</div>
              <p className="mt-1 text-xs leading-relaxed text-zinc-500">
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
      <div className="fixed bottom-16 left-0 right-0 z-30 border-t border-zinc-100 bg-white/95 backdrop-blur-md md:bottom-0 md:left-60">
        <div className="mx-auto flex w-full max-w-3xl items-center gap-3 p-4">
          <a
            href={buildWaLink(customer.phone_normalized, customer.name)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-lg bg-green-500 text-sm font-medium text-white transition-all hover:bg-green-600 active:scale-[0.98]"
          >
            <MessageCircle className="h-[18px] w-[18px]" />
            Kirim WhatsApp
          </a>
          <button
            onClick={() => downloadVCard(customer.name, customer.phone_normalized)}
            className="flex h-12 items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-700 transition-all hover:bg-zinc-50 active:scale-[0.98]"
          >
            <Contact2 className="h-4 w-4" />
            vCard
          </button>
        </div>
      </div>
    </>
  )
}
