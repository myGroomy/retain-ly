import { useEffect, useState } from 'react'
import { getCustomersWithStats } from '@/services/customerService'
import { getRetentionStatus, getRetentionLabel } from '@/utils/churnStatus'
import { DEFAULT_THRESHOLDS } from '@/constants'
import type { CustomerWithStats } from '@/types'

export function DashboardPage() {
  const [customers, setCustomers] = useState<CustomerWithStats[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        const r = await getCustomersWithStats(0, 10000)
        setCustomers(r.data.map((c) => ({ ...c, retention_status: getRetentionStatus(c.last_order_date, DEFAULT_THRESHOLDS) })))
      } catch { /* silent */ } finally { setLoading(false) }
    })()
  }, [])

  if (loading) return <div className="flex-1 flex items-center justify-center"><span className="material-symbols-outlined animate-spin text-text-muted">progress_activity</span></div>

  const counts = { active: 0, at_risk: 0, churned: 0 }
  customers.forEach((c) => counts[c.retention_status as keyof typeof counts]++)
  const total = customers.length
  const repeatRate = total > 0 ? Math.round((customers.filter((c) => c.order_count > 1).length / total) * 100) : 0

  return (
    <div className="flex-1 flex flex-col md:pl-sidebar-width min-h-screen bg-canvas-soft">
      <header className="sticky top-0 z-30 bg-canvas-base shadow-sm">
        <div className="flex justify-between items-center w-full px-4 h-top-nav-height max-w-container-max-width mx-auto">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-surface-subtle flex items-center justify-center text-text-ink">
              <span className="material-symbols-outlined">storefront</span>
            </div>
            <div>
              <h1 className="font-headline-md text-headline-md font-semibold text-text-ink tracking-tight">Retention Dashboard</h1>
              <p className="font-caption text-caption text-text-body hidden sm:block">Cabang Senopati • Overview</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-semantic-active-surface border border-semantic-active-border rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-semantic-active"></span>
              <span className="font-caption text-caption text-semantic-active font-medium">Online</span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-container-max-width mx-auto px-4 py-4 md:py-6 pb-24 md:pb-8 space-y-5">
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'TOTAL CUSTOMER', value: total, icon: 'group', color: 'text-text-ink' },
            { label: 'REPEAT RATE', value: `${repeatRate}%`, icon: 'repeat', color: 'text-semantic-active' },
            { label: 'AT RISK', value: counts.at_risk, icon: 'warning', color: 'text-semantic-risk' },
            { label: 'CHURNED', value: counts.churned, icon: 'person_off', color: 'text-semantic-churned' },
          ].map((s) => (
            <div key={s.label} className="bg-surface-card border border-hairline-strong rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-caption-uppercase text-caption-uppercase text-text-muted">{s.label}</span>
                <span className={`material-symbols-outlined text-[20px] ${s.color}`}>{s.icon}</span>
              </div>
              <div className={`font-numeric-stat text-numeric-stat ${s.color}`}>{s.value}</div>
            </div>
          ))}
        </section>

        <section className="bg-surface-card border border-hairline-strong rounded-xl p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-headline-sm text-headline-sm text-text-ink">Segmentasi Customer</h2>
          </div>
          <div className="space-y-4">
            {([
              { key: 'active', label: 'Active (0-30 hari)', count: counts.active, color: 'bg-semantic-active', surface: 'bg-semantic-active-surface' },
              { key: 'at_risk', label: 'At Risk (31-60 hari)', count: counts.at_risk, color: 'bg-semantic-risk', surface: 'bg-semantic-risk-surface' },
              { key: 'churned', label: 'Churned (61+ hari)', count: counts.churned, color: 'bg-semantic-churned', surface: 'bg-semantic-churned-surface' },
            ] as const).map((s) => (
              <div key={s.key}>
                <div className="mb-1.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${s.color}`}></span>
                    <span className="font-body-sm text-body-sm text-text-ink">{s.label}</span>
                  </div>
                  <span className="font-body-strong text-body-strong text-text-ink">{s.count}</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-surface-subtle overflow-hidden">
                  <div className={`h-full ${s.color} rounded-full transition-all duration-500`} style={{ width: total > 0 ? `${(s.count / total) * 100}%` : '0%' }}></div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-surface-card border border-hairline-strong rounded-xl p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-headline-sm text-headline-sm text-text-ink">Perlu Follow-up</h2>
            <span className="font-caption text-caption text-text-muted">{counts.at_risk + counts.churned} customer</span>
          </div>
          <div className="space-y-2">
            {customers
              .filter((c) => c.retention_status !== 'active')
              .sort((a, b) => new Date(a.last_order_date).getTime() - new Date(b.last_order_date).getTime())
              .slice(0, 5)
              .map((c) => {
                const days = Math.floor((Date.now() - new Date(c.last_order_date).getTime()) / 86400000)
                return (
                  <div key={c.id} className="flex items-center justify-between p-3 rounded-lg bg-surface-subtle hover:bg-hairline-default transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg border flex items-center justify-center font-headline-sm text-headline-sm text-xs ${c.retention_status === 'at_risk' ? 'bg-semantic-risk-surface border-semantic-risk-border text-semantic-risk' : 'bg-semantic-churned-surface border-semantic-churned-border text-semantic-churned'}`}>
                        {c.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <div className="font-body-strong text-body-strong text-text-ink">{c.name}</div>
                        <div className="font-caption text-caption text-text-body">{c.phone_normalized} • {days} hari lalu</div>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-caption-uppercase text-caption-uppercase ${c.retention_status === 'at_risk' ? 'bg-semantic-risk-surface text-semantic-risk border border-semantic-risk-border' : 'bg-semantic-churned-surface text-semantic-churned border border-semantic-churned-border'}`}>
                      {getRetentionLabel(c.retention_status)}
                    </span>
                  </div>
                )
              })}
            {customers.filter((c) => c.retention_status !== 'active').length === 0 && (
              <p className="py-6 text-center text-sm text-text-muted">Semua customer aktif</p>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}
