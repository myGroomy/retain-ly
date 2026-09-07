import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { getCustomersWithStats, searchCustomers } from '@/services/customerService'
import { getRetentionStatus, getRetentionLabel } from '@/utils/churnStatus'
import { CHANNELS, DEFAULT_THRESHOLDS, PAGE_SIZE } from '@/constants'
import type { CustomerWithStats, RetentionStatus } from '@/types'

export function CustomerListPage() {
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

  const getAvatarColor = (status: RetentionStatus) => {
    if (status === 'active') return 'bg-hairline-soft border-hairline-default text-text-ink'
    if (status === 'at_risk') return 'bg-semantic-risk-surface border-semantic-risk-border text-semantic-risk'
    return 'bg-semantic-churned-surface border-semantic-churned-border text-semantic-churned'
  }

  const getStatusColor = (status: RetentionStatus) => {
    if (status === 'active') return 'bg-semantic-active-surface border-semantic-active-border text-semantic-active'
    if (status === 'at_risk') return 'bg-semantic-risk-surface border-semantic-risk-border text-semantic-risk'
    return 'bg-semantic-churned-surface border-semantic-churned-border text-semantic-churned'
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
    <div className="flex-1 flex flex-col md:pl-sidebar-width min-h-screen bg-canvas-soft">
      <header className="sticky top-0 z-30 bg-canvas-base shadow-sm">
        <div className="flex justify-between items-center w-full px-4 h-top-nav-height max-w-container-max-width mx-auto">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-surface-subtle flex items-center justify-center text-text-ink">
              <span className="material-symbols-outlined">storefront</span>
            </div>
            <div>
              <h1 className="font-headline-md text-headline-md font-semibold text-text-ink tracking-tight">Daftar Customer</h1>
              <p className="font-caption text-caption text-text-body hidden sm:block">Cabang Senopati • Terminal 04</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-semantic-active-surface border border-semantic-active-border rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-semantic-active"></span>
              <span className="font-caption text-caption text-semantic-active font-medium">Online</span>
            </div>
            <button className="w-9 h-9 flex items-center justify-center rounded-lg bg-surface-subtle hover:bg-hairline-strong transition-colors text-text-ink">
              <span className="material-symbols-outlined">file_download</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-container-max-width mx-auto px-4 py-4 md:py-6 pb-24 md:pb-8">
        <section className="mb-4">
          <div className="relative w-full max-w-2xl">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted">
              <span className="material-symbols-outlined">search</span>
            </div>
            <input
              type="text"
              placeholder="Cari nama customer atau no. telepon (08...)"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(0) }}
              className="w-full h-11 pl-11 pr-10 bg-canvas-base border border-hairline-strong rounded-lg text-text-ink font-body-md text-body-md placeholder:text-text-muted focus:outline-none focus:border-text-ink focus:ring-0 transition-all"
            />
          </div>
        </section>

        <section className="mb-5 space-y-3">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
            {([
              { key: 'all' as const, label: 'Semua', count: total, dot: '', bg: '' },
              { key: 'active' as const, label: 'Active', count: counts.active, dot: 'bg-semantic-active', bg: 'bg-semantic-active-surface text-semantic-active border-semantic-active-border' },
              { key: 'at_risk' as const, label: 'At Risk', count: counts.at_risk, dot: 'bg-semantic-risk', bg: 'bg-semantic-risk-surface text-semantic-risk border-semantic-risk-border' },
              { key: 'churned' as const, label: 'Churned', count: counts.churned, dot: 'bg-semantic-churned', bg: 'bg-semantic-churned-surface text-semantic-churned border-semantic-churned-border' },
            ]).map((f) => (
              <button
                key={f.key}
                onClick={() => { setFilter(f.key); setPage(0) }}
                className={`flex-shrink-0 flex items-center gap-2 px-3.5 py-1.5 rounded-full font-caption-uppercase text-caption-uppercase tracking-wider transition-all duration-150 active:scale-[0.98] ${
                  filter === f.key
                    ? 'bg-text-ink text-text-on-dark'
                    : 'bg-canvas-base text-text-body hover:bg-surface-subtle border border-hairline-strong'
                }`}
              >
                {f.dot && <span className={`w-2 h-2 rounded-full ${f.dot}`}></span>}
                <span>{f.label}</span>
                <span className={`px-1.5 py-0.2 text-[10px] rounded-full font-mono font-semibold ${
                  filter === f.key
                    ? 'bg-surface-dark-elevated text-text-on-dark'
                    : f.bg || 'bg-surface-subtle text-text-ink border border-hairline-strong'
                }`}>{f.count}</span>
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between pt-1">
            <p className="font-caption text-caption text-text-body">
              Menampilkan <span className="font-body-strong text-body-strong text-text-ink">{filtered.length}</span> dari <span className="font-body-strong text-body-strong text-text-ink">{total}</span> customer
            </p>
          </div>
        </section>

        <section className="space-y-3">
          {loading && [1, 2, 3].map((i) => (
            <div key={i} className="bg-canvas-base border border-hairline-strong rounded-xl p-4 sm:p-5 animate-pulse">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-lg bg-hairline-soft"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-1/3 rounded bg-hairline-soft"></div>
                  <div className="h-3 w-1/4 rounded bg-hairline-soft"></div>
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
                to={`/customers/${customer.id}`}
                className="block bg-canvas-base border border-hairline-strong rounded-xl p-4 sm:p-5 transition-shadow duration-150 hover:shadow-[0_4px_12px_rgba(0,0,0,0.04)]"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3.5">
                    <div className={`w-11 h-11 rounded-lg border flex items-center justify-center font-headline-sm text-headline-sm shrink-0 ${getAvatarColor(status)}`}>
                      {getInitials(customer.name)}
                    </div>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-headline-sm text-headline-sm text-text-ink tracking-tight">{customer.name}</h2>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-surface-subtle border border-hairline-strong text-text-ink font-caption text-caption font-medium">{customer.order_count}x Order</span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-caption-uppercase text-caption-uppercase ${getStatusColor(status)}`}>
                          {status === 'at_risk' ? `At Risk (${days} hari)` : status === 'churned' ? `Churned (${days} hari)` : getRetentionLabel(status)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-text-body font-body-sm text-body-sm">
                        <span className="font-mono text-text-ink font-medium">{customer.phone_normalized}</span>
                        <span className="text-hairline-strong">•</span>
                        <span className="text-text-muted">{favCh ? `Sering: ${favCh}` : 'Baru'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-2.5 sm:pt-0 border-hairline-default gap-1 text-right">
                    {favCh && (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-subtle text-text-ink font-caption text-caption font-medium">
                        <span className="material-symbols-outlined text-[16px] text-semantic-active">restaurant</span>
                        <span>Sering: {favCh}</span>
                      </div>
                    )}
                    <span className="font-caption text-caption text-text-muted">
                      Order terakhir: <strong className={`font-medium ${status === 'active' ? 'text-text-ink' : status === 'at_risk' ? 'text-semantic-risk' : 'text-semantic-churned'}`}>{days === 0 ? 'Hari ini' : days === 1 ? 'Kemarin' : `${days} hari lalu`}</strong>
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}

          {!loading && filtered.length === 0 && (
            <div className="py-12 text-center">
              <span className="material-symbols-outlined text-[48px] text-text-muted mb-2">group_off</span>
              <p className="font-body-md text-body-md text-text-muted">Tidak ada customer ditemukan</p>
            </div>
          )}
        </section>

        {totalPages > 1 && (
          <footer className="mt-6 pt-4 border-t border-hairline-default flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="font-caption text-caption text-text-body">
              Halaman <strong className="text-text-ink font-semibold">{page + 1}</strong> dari <strong className="text-text-ink font-semibold">{totalPages}</strong>
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} className="px-4 py-2 rounded-lg border border-hairline-strong bg-canvas-base text-text-disabled font-button text-button flex items-center gap-1.5 cursor-not-allowed select-none disabled:opacity-50">
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                <span>Sebelumnya</span>
              </button>
              <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="px-4 py-2 rounded-lg border border-hairline-strong bg-canvas-base hover:bg-surface-subtle text-text-ink font-button text-button flex items-center gap-1.5 transition-colors active:scale-[0.98] disabled:opacity-50">
                <span>Selanjutnya</span>
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </div>
          </footer>
        )}
      </main>
    </div>
  )
}
