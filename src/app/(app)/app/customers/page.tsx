'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { MagnifyingGlass, UsersThree, ArrowRight } from '@phosphor-icons/react'
import { getCustomersWithStats, searchCustomers } from '@/services/customerService'
import { getRetentionStatus, getRetentionLabel } from '@/utils/churnStatus'
import { CHANNELS, DEFAULT_THRESHOLDS, PAGE_SIZE } from '@/constants'
import { fadeUp, FLUID_EASE } from '@/lib/motion'
import type { CustomerWithStats, RetentionStatus } from '@/types'

export default function CustomerListPage() {
  const [customers, setCustomers] = useState<CustomerWithStats[]>([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<RetentionStatus | 'all'>('all')

  const loadCustomers = useCallback(async () => {
    setLoading(true)
    try {
      if (searchQuery) {
        const result = await searchCustomers(searchQuery, page, PAGE_SIZE)
        const withStats: CustomerWithStats[] = result.data.map((c) => ({
          ...c,
          order_count: 0,
          last_order_date: c.first_order_date,
          retention_status: getRetentionStatus(c.first_order_date, DEFAULT_THRESHOLDS),
        }))
        setCustomers(withStats)
        setTotalPages(result.totalPages)
        setTotal(result.count)
      } else {
        const result = await getCustomersWithStats(page, PAGE_SIZE)
        const withStatus = result.data.map((c) => ({
          ...c,
          retention_status: getRetentionStatus(c.last_order_date, DEFAULT_THRESHOLDS),
        }))
        setCustomers(withStatus)
        setTotalPages(result.totalPages)
        setTotal(result.count)
      }
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [page, searchQuery])

  useEffect(() => { loadCustomers() }, [loadCustomers])

  const filtered = filter === 'all' ? customers : customers.filter((c) => c.retention_status === filter)

  const getInitials = (name: string) => name.split(' ').map((n) => n[0]).join('').slice(0, 2)
  const getDaysSince = (date: string) => Math.floor((Date.now() - new Date(date).getTime()) / 86400000)

  const getStatusStyle = (status: RetentionStatus) => {
    if (status === 'active') return 'border-emerald/25 bg-emerald/10 text-emerald'
    if (status === 'at_risk') return 'border-amber/25 bg-amber/10 text-amber-600'
    return 'border-rose/25 bg-rose/10 text-rose-600'
  }

  const getAvatarStyle = (status: RetentionStatus) => {
    if (status === 'active') return 'bg-accent-wash text-accent-deep'
    if (status === 'at_risk') return 'bg-amber/10 text-amber-600'
    return 'bg-rose/10 text-rose-600'
  }

  const getFavChannel = (c: CustomerWithStats) => {
    if (!c.orders || !Array.isArray(c.orders) || c.orders.length === 0) return null
    const freq: Record<string, number> = {}
    for (const o of c.orders) { freq[o.channel] = (freq[o.channel] || 0) + 1 }
    const top = Object.entries(freq).sort((a, b) => b[1] - a[1])[0]
    return CHANNELS.find((ch) => ch.id === top[0])?.label || top[0]
  }

  const counts = { active: 0, at_risk: 0, churned: 0 }
  customers.forEach((c) => counts[c.retention_status as keyof typeof counts]++)

  const filters = [
    { key: 'all' as const, label: 'Semua', count: total },
    { key: 'active' as const, label: 'Active', count: counts.active },
    { key: 'at_risk' as const, label: 'At Risk', count: counts.at_risk },
    { key: 'churned' as const, label: 'Churned', count: counts.churned },
  ]

  return (
    <main className="mx-auto w-full max-w-5xl px-5 py-8 sm:px-6 md:py-12">
      {/* Heading */}
      <motion.div variants={fadeUp} custom={0} initial="hidden" animate="show" className="mb-10">
        <span className="eyebrow">Database</span>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Daftar Customer</h1>
        <p className="mt-2 text-sm text-ash">{total} customer terdaftar</p>
      </motion.div>

      {/* Search */}
      <motion.div variants={fadeUp} custom={1} initial="hidden" animate="show" className="mb-5 max-w-lg">
        <div className="relative">
          <MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-mist" size={20} weight="light" />
          <input
            type="text"
            placeholder="Cari nama atau no. telepon..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(0) }}
            className="field h-12 pl-11"
          />
        </div>
      </motion.div>

      {/* Filter Chips */}
      <motion.div variants={fadeUp} custom={2} initial="hidden" animate="show" className="mb-6 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => { setFilter(f.key); setPage(0) }}
            className={`group flex flex-shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition-all duration-500 active:scale-[0.98] ${
              filter === f.key
                ? 'bg-accent text-white shadow-[0_6px_16px_-6px_rgba(47,108,255,0.5)]'
                : 'border border-hairline bg-white text-ash hover:bg-sunken hover:text-ink'
            }`}
          >
            <span>{f.label}</span>
            <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
              filter === f.key ? 'bg-white/20' : 'bg-sunken text-ash'
            }`}>{f.count}</span>
          </button>
        ))}
      </motion.div>

      {/* Customer List */}
      <div className="space-y-3">
        {loading && [1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="doppel-outer">
              <div className="doppel-inner p-4">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-2xl bg-sunken" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 w-1/3 rounded bg-sunken" />
                    <div className="h-2.5 w-1/4 rounded bg-sunken" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        <motion.div variants={fadeUp} custom={3} initial="hidden" animate="show" className="space-y-3">
          {!loading && filtered.map((customer) => {
            const status = customer.retention_status
            const days = getDaysSince(customer.last_order_date)
            const favCh = getFavChannel(customer)
            return (
              <Link key={customer.id} href={`/app/customers/${customer.id}`} className="group block">
                <div className="doppel-outer transition-all duration-500 group-hover:-translate-y-0.5">
                  <div className="doppel-inner flex items-center justify-between gap-4 p-4 sm:p-5">
                    <div className="flex items-center gap-3.5">
                      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-xs font-semibold ${getAvatarStyle(status)}`}>
                        {getInitials(customer.name)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-ink">{customer.name}</span>
                          <span className={`rounded-full border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${getStatusStyle(status)}`}>
                            {status === 'at_risk' ? `${days}d` : status === 'churned' ? `${days}d` : getRetentionLabel(status)}
                          </span>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-ash">
                          <span className="font-mono">{customer.phone_normalized}</span>
                          <span>&middot;</span>
                          <span>{customer.order_count}x order</span>
                          {favCh && <><span>&middot;</span><span>{favCh}</span></>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right text-xs text-ash">
                        {days === 0 ? 'Hari ini' : days === 1 ? 'Kemarin' : `${days}h lalu`}
                      </div>
                      <ArrowRight size={16} weight="bold" className="text-mist transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-accent" />
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </motion.div>

        {!loading && filtered.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-16 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sunken text-mist">
              <UsersThree size={28} weight="duotone" className="text-mist" />
            </span>
            <p className="mt-3 text-sm text-ash">Tidak ada customer ditemukan</p>
          </motion.div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-between border-t border-hairline pt-5">
          <p className="text-xs text-ash">
            Halaman <strong className="text-ink">{page + 1}</strong> dari <strong className="text-ink">{totalPages}</strong>
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="rounded-full border border-hairline bg-white px-4 py-2 text-xs font-semibold text-ash transition-all duration-300 hover:bg-sunken hover:text-ink active:scale-[0.98] disabled:opacity-40"
            >
              Sebelumnya
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="rounded-full border border-hairline bg-white px-4 py-2 text-xs font-semibold text-ink transition-all duration-300 hover:bg-sunken active:scale-[0.98] disabled:opacity-40"
            >
              Selanjutnya
            </button>
          </div>
        </div>
      )}
    </main>
  )
}