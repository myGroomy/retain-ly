'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowUUpLeft,
  Phone,
  CheckCircle,
  ShoppingBag,
  ForkKnife,
  ClockCounterClockwise,
  Calendar,
  WhatsappLogo,
  UserPlus,
  Lightbulb,
  PencilSimple,
  Check,
  X,
  FloppyDisk,
} from '@phosphor-icons/react'
import { getCustomerById, updateCustomer } from '@/services/customerService'
import { getOrdersByCustomer } from '@/services/orderService'
import { getRetentionStatus, getRetentionLabel } from '@/utils/churnStatus'
import { buildWaLink } from '@/utils/waLinkBuilder'
import { downloadVCard } from '@/utils/vcardGenerator'
import { CHANNELS, DEFAULT_THRESHOLDS, PAGE_SIZE } from '@/constants'
import { fadeUp, FLUID_EASE } from '@/lib/motion'
import { useMounted } from '@/lib/useMounted'
import type { CustomerWithStats, Order } from '@/types'

export default function CustomerDetailPage() {
  const ready = useMounted()
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [customer, setCustomer] = useState<CustomerWithStats | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => { if (id) loadData() }, [id])

  const loadData = async () => {
    if (!id) return
    setLoading(true)
    try {
      const [c, o] = await Promise.all([getCustomerById(id), getOrdersByCustomer(id, 0, PAGE_SIZE)])
      if (c) {
        const status = getRetentionStatus(c.last_order_date, DEFAULT_THRESHOLDS)
        setCustomer({ ...c, retention_status: status })
        setEditName(c.name)
        setEditPhone(c.phone_normalized)
      }
      setOrders(o.data)
    } catch { /* silent */ } finally { setLoading(false) }
  }

  const handleSaveCustomer = async () => {
    if (!customer) return
    if (!editName.trim()) { setSaveError('Nama tidak boleh kosong'); return }
    if (!editPhone.trim()) { setSaveError('Nomor HP tidak boleh kosong'); return }

    setSaving(true)
    setSaveError(null)
    try {
      const updated = await updateCustomer(customer.id, {
        name: editName,
        phone_normalized: editPhone,
      })
      setCustomer((prev) => prev ? { ...prev, name: updated.name, phone_normalized: updated.phone_normalized } : null)
      setIsEditing(false)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Gagal mengubah data customer')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center min-h-[60dvh]">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-ink/15 border-t-accent" />
      </div>
    )
  }
  if (!customer) return <div className="flex flex-1 items-center justify-center text-ash min-h-[60dvh]">Customer not found</div>

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
    if (status === 'active') return 'border-emerald/25 bg-emerald/10 text-emerald'
    if (status === 'at_risk') return 'border-amber/25 bg-amber/10 text-amber-600'
    return 'border-rose/25 bg-rose/10 text-rose-600'
  }

  const stats = [
    { label: 'Total Order', value: `${customer.order_count}x`, icon: ShoppingBag, hue: 'text-ink' },
    { label: 'Channel Favorit', value: fav?.label || 'N/A', icon: ForkKnife, hue: 'text-ink' },
    { label: 'Order Terakhir', value: customer.last_order_date, sub: days === 0 ? 'Hari ini' : `${days} hari lalu`, icon: ClockCounterClockwise, hue: 'text-ink' },
    { label: 'Order Pertama', value: customer.first_order_date, icon: Calendar, hue: 'text-ink' },
  ]

  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-8 sm:px-6 md:py-12">
      {/* Back */}
      <motion.button
        variants={fadeUp}
        custom={0}
        initial="hidden"
        animate={ready ? 'show' : 'hidden'}
        onClick={() => router.back()}
        className="group mb-10 inline-flex items-center gap-2 text-sm font-medium text-ash transition-colors duration-300 hover:text-ink"
      >
        <ArrowUUpLeft size={18} weight="bold" className="transition-transform duration-300 group-hover:-translate-x-0.5" />
        Kembali
      </motion.button>

      {/* Profile Card */}
      <motion.div variants={fadeUp} custom={1} initial="hidden" animate={ready ? 'show' : 'hidden'}>
        <div className="doppel-outer">
          <div className="doppel-inner p-6 sm:p-7">
            {!isEditing ? (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">{customer.name}</h1>
                    <a href={`tel:${customer.phone_normalized}`} className="mt-2 inline-flex items-center gap-2 text-sm text-ash transition-colors duration-300 hover:text-accent">
                      <Phone size={16} weight="bold" className="text-accent" />
                      {customer.phone_normalized}
                    </a>
                    <div className="mt-3 flex items-center gap-2">
                      <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${getStatusStyle()}`}>
                        {getRetentionLabel(status)}
                      </span>
                      <span className="rounded-full border border-hairline bg-white px-2.5 py-0.5 text-[11px] font-medium text-ash">
                        {customer.order_count}x Order
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-accent-wash text-xl font-semibold text-accent-deep">
                      {initials}
                    </div>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="group flex items-center gap-1.5 rounded-full border border-hairline bg-white px-3 py-1.5 text-xs font-semibold text-ash transition-all duration-300 hover:bg-sunken hover:text-ink active:scale-[0.96]"
                    >
                      <PencilSimple size={14} weight="bold" className="text-accent" />
                      Edit Kontak
                    </button>
                  </div>
                </div>
                <div className="mt-5 flex items-center gap-1.5 rounded-2xl border border-emerald/25 bg-emerald/10 px-3 py-2 text-xs font-medium text-emerald">
                  <CheckCircle size={14} weight="fill" />
                  WA Verified
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-ink">Edit Profil Customer</span>
                  <button
                    onClick={() => { setIsEditing(false); setSaveError(null) }}
                    className="flex h-7 w-7 items-center justify-center rounded-full text-mist transition-colors hover:bg-sunken hover:text-ink"
                  >
                    <X size={16} weight="bold" />
                  </button>
                </div>

                {saveError && (
                  <div className="rounded-2xl border border-rose/20 bg-rose/10 p-3 text-xs text-rose-600">
                    {saveError}
                  </div>
                )}

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ash">Nama Lengkap</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="field h-11"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ash">No. WhatsApp</label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="field h-11 font-mono"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={handleSaveCustomer}
                    disabled={saving}
                    className="group flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-accent text-xs font-semibold text-white transition-all duration-300 hover:-translate-y-px active:scale-[0.98] disabled:opacity-40"
                  >
                    {saving ? (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    ) : (
                      <>
                        <FloppyDisk size={16} weight="bold" />
                        Simpan Perubahan
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => { setIsEditing(false); setSaveError(null) }}
                    className="flex h-11 items-center justify-center rounded-full border border-hairline bg-white px-5 text-xs font-semibold text-ash transition-all hover:bg-sunken"
                  >
                    Batal
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={fadeUp} custom={2} initial="hidden" animate={ready ? 'show' : 'hidden'} className="mt-4 grid grid-cols-2 gap-3 sm:gap-4">
        {stats.map((s) => (
          <div key={s.label} className="doppel-outer">
            <div className="doppel-inner p-4 sm:p-5">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-ash">{s.label}</span>
                <s.icon size={16} weight="light" className="text-mist" />
              </div>
              <div className="truncate text-sm font-semibold text-ink">{s.value}</div>
              {s.sub && <div className="mt-0.5 text-xs text-ash">{s.sub}</div>}
            </div>
          </div>
        ))}
      </motion.div>

      {/* Order History */}
      <motion.div variants={fadeUp} custom={3} initial="hidden" animate={ready ? 'show' : 'hidden'} className="mt-10">
        <h3 className="mb-3 text-base font-semibold text-ink">Riwayat Transaksi</h3>
        <div className="space-y-3">
          {orders.map((order) => {
            const ch = CHANNELS.find((c) => c.id === order.channel)
            return (
              <div key={order.id} className="doppel-outer">
                <div className="doppel-inner flex items-center justify-between p-4">
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent-wash text-accent">
                      <ShoppingBag size={18} weight="duotone" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-ink">{order.order_date}</div>
                      <div className="text-xs text-ash">Cabang Senopati</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full border border-hairline bg-white px-3 py-1 text-[11px] font-semibold text-ink-soft">
                      {ch?.label || order.channel}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-emerald">
                      <CheckCircle size={13} weight="fill" /> Selesai
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
          {orders.length === 0 && (
            <div className="py-10 text-center text-sm text-ash">Belum ada riwayat order</div>
          )}
        </div>
      </motion.div>

      {/* Recommendation */}
      <motion.div variants={fadeUp} custom={4} initial="hidden" animate={ready ? 'show' : 'hidden'} className="mt-4">
        <div className="rounded-3xl border border-hairline bg-white p-5">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-amber/10 text-amber-600">
              <Lightbulb size={18} weight="duotone" />
            </span>
            <div>
              <div className="text-sm font-semibold text-ink">Rekomendasi</div>
              <p className="mt-1 text-sm leading-relaxed text-ash">
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
      </motion.div>

      {/* Fixed bottom CTA */}
      <div className="fixed inset-x-0 bottom-0 z-30 md:left-64">
        <div className="mx-auto max-w-3xl p-4">
          <div className="doppel-outer rounded-[1.75rem]">
            <div className="doppel-inner flex items-center gap-3 rounded-[calc(1.75rem-0.375rem)] p-3">
              <a
                href={buildWaLink(customer.phone_normalized, customer.name)}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex h-13 flex-1 items-center justify-center gap-3 rounded-full bg-emerald text-sm font-semibold text-white transition-all duration-700 hover:-translate-y-px active:scale-[0.98]"
                style={{ boxShadow: '0 8px 24px -8px rgba(16, 185, 129, 0.5)' }}
              >
                <WhatsappLogo size={20} weight="fill" />
                Kirim WhatsApp
              </a>
              <button
                onClick={() => downloadVCard(customer.name, customer.phone_normalized)}
                className="flex h-13 items-center gap-2 rounded-full border border-hairline bg-white px-5 text-sm font-semibold text-ink-soft transition-all duration-500 hover:bg-sunken hover:text-ink active:scale-[0.96]"
              >
                <UserPlus size={18} weight="duotone" className="text-accent" />
                vCard
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}