'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Search, Users } from 'lucide-react'
import { getCustomersWithStats, searchCustomers } from '@/services/customerService'
import { getRetentionStatus, getRetentionLabel } from '@/utils/churnStatus'
import { CHANNELS, DEFAULT_THRESHOLDS, PAGE_SIZE } from '@/constants'
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
    if (status === 'active') return 'bg-green-50 text-green-700 border border-green-200'
    if (status === 'at_risk') return 'bg-amber-50 text-amber-700 border border-amber-200'
    return 'bg-red-50 text-red-600 border border-red-200'
  }

  const getAvatarStyle = (status: RetentionStatus) => {
    if (status === 'active') return 'bg-zinc-100 text-zinc-600'
    if (status === 'at_risk') return 'bg-amber-50 text-amber-700'
    return 'bg-red-50 text-red-600'
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

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-zinc-100 bg-white">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-6">
          <div>
            <h1 className="text-base font-semibold text-zinc-900">Daftar Customer</h1>
            <p className="text-xs text-zinc-400">{total} customer terdaftar</p>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-2.5 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            <span className="text-xs font-medium text-green-700">Online</span>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-6 py-6 pb-24 md:pb-8">
        {/* Search */}
        <div className="relative mb-5 w-full max-w-lg">
          <Search className="absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-zinc-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Cari nama atau no. telepon..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(0) }}
            className="h-11 w-full rounded-lg border border-zinc-200 bg-white pl-10 pr-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-0 transition-all"
          />
        </div>

        {/* Filter Chips */}
        <div className="mb-5 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {([
            { key: 'all' as const, label: 'Semua', count: total },
            { key: 'active' as const, label: 'Active', count: counts.active },
            { key: 'at_risk' as const, label: 'At Risk', count: counts.at_risk },
            { key: 'churned' as const, label: 'Churned', count: counts.churned },
          ]).map((f) => (
            <button
              key={f.key}
              onClick={() => { setFilter(f.key); setPage(0) }}
              className={`flex flex-shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all active:scale-[0.98] ${
                filter === f.key
                  ? 'bg-zinc-900 text-white'
                  : 'border border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50'
              }`}
            >
              <span>{f.label}</span>
              <span className={`rounded-full px-1 py-0.5 text-[10px] font-bold ${
                filter === f.key ? 'bg-zinc-700' : 'bg-zinc-100'
              }`}>{f.count}</span>
            </button>
          ))}
        </div>

        {/* Customer List */}
        <div className="space-y-2">
          {loading && [1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse rounded-xl border border-zinc-100 bg-white p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-zinc-100" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 w-1/3 rounded bg-zinc-100" />
                  <div className="h-2.5 w-1/4 rounded bg-zinc-100" />
                </div>
              </div>
            </div>
          ))}

          {!loading && filtered.map((customer) => {
            const status = customer.retention_status
            const days = getDaysSince(customer.last_order_date)
            const favCh = getFavChannel(customer)
            return (
              <Link
                key={customer.id}
                href={`/app/customers/${customer.id}`}
                className="block rounded-xl border border-zinc-100 bg-white p-4 transition-all duration-200 hover:shadow-md hover:shadow-zinc-100/50"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg text-xs font-semibold ${getAvatarStyle(status)}`}>
                      {getInitials(customer.name)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-zinc-900">{customer.name}</span>
                        <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${getStatusStyle(status)}`}>
                          {status === 'at_risk' ? `${days}d` : status === 'churned' ? `${days}d` : getRetentionLabel(status)}
                        </span>
                      </div>
                      <div className="mt-0.5 flex items-center gap-1.5 text-xs text-zinc-400">
                        <span className="font-mono text-zinc-500">{customer.phone_normalized}</span>
                        <span>&middot;</span>
                        <span>{customer.order_count}x order</span>
                        {favCh && <><span>&middot;</span><span>{favCh}</span></>}
                      </div>
                    </div>
                  </div>
                  <div className="text-right text-xs text-zinc-400">
                    {days === 0 ? 'Hari ini' : days === 1 ? 'Kemarin' : `${days}h lalu`}
                  </div>
                </div>
              </Link>
            )
          })}

          {!loading && filtered.length === 0 && (
            <div className="py-16 text-center">
              <Users className="mx-auto mb-2 h-10 w-10 text-zinc-200" />
              <p className="text-sm text-zinc-400">Tidak ada customer ditemukan</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between border-t border-zinc-100 pt-4">
            <p className="text-xs text-zinc-400">
              Halaman <strong className="text-zinc-600">{page + 1}</strong> dari <strong className="text-zinc-600">{totalPages}</strong>
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-500 transition-all active:scale-[0.98] disabled:opacity-40"
              >
                Sebelumnya
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition-all hover:bg-zinc-50 active:scale-[0.98] disabled:opacity-40"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        )}
      </main>
    </>
  )
}
