'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Repeat, AlertTriangle, UserMinus } from 'lucide-react'
import { getCustomersWithStats } from '@/services/customerService'
import { getRetentionStatus, getRetentionLabel } from '@/utils/churnStatus'
import { DEFAULT_THRESHOLDS } from '@/constants'
import type { CustomerWithStats } from '@/types'

export default function DashboardPage() {
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

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-transparent" />
      </div>
    )
  }

  const counts = { active: 0, at_risk: 0, churned: 0 }
  customers.forEach((c) => counts[c.retention_status as keyof typeof counts]++)
  const total = customers.length
  const repeatRate = total > 0 ? Math.round((customers.filter((c) => c.order_count > 1).length / total) * 100) : 0

  const statIcons = { Total: Users, Repeat: Repeat, AtRisk: AlertTriangle, Churned: UserMinus }

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-zinc-100 bg-white">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-6">
          <div>
            <h1 className="text-base font-semibold text-zinc-900">Dashboard Retensi</h1>
            <p className="text-xs text-zinc-400">Overview semua customer</p>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-2.5 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            <span className="text-xs font-medium text-green-700">Online</span>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl space-y-6 px-6 py-6 pb-24 md:pb-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { label: 'Total Customer', value: total, icon: statIcons.Total, accent: 'text-zinc-900' },
            { label: 'Repeat Rate', value: `${repeatRate}%`, icon: statIcons.Repeat, accent: 'text-green-600' },
            { label: 'At Risk', value: counts.at_risk, icon: statIcons.AtRisk, accent: 'text-amber-600' },
            { label: 'Churned', value: counts.churned, icon: UserMinus, accent: 'text-red-500' },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-zinc-100 bg-white p-5">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">{s.label}</span>
                <s.icon className={`h-[18px] w-[18px] ${s.accent}`} />
              </div>
              <div className={`text-3xl font-bold tracking-tight ${s.accent}`}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Segmentation */}
        <div className="rounded-xl border border-zinc-100 bg-white p-6">
          <h2 className="mb-5 text-base font-semibold text-zinc-900">Segmentasi Customer</h2>
          <div className="space-y-4">
            {([
              { key: 'active', label: 'Active', range: '0-30 hari', count: counts.active, color: 'bg-green-500' },
              { key: 'at_risk', label: 'At Risk', range: '31-60 hari', count: counts.at_risk, color: 'bg-amber-500' },
              { key: 'churned', label: 'Churned', range: '61+ hari', count: counts.churned, color: 'bg-red-400' },
            ] as const).map((s) => (
              <div key={s.key}>
                <div className="mb-1.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${s.color}`} />
                    <span className="text-sm text-zinc-700">{s.label}</span>
                    <span className="text-xs text-zinc-400">{s.range}</span>
                  </div>
                  <span className="text-sm font-semibold text-zinc-900">{s.count}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: total > 0 ? `${(s.count / total) * 100}%` : '0%' }}
                    transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
                    className={`h-full rounded-full ${s.color}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Follow-up needed */}
        <div className="rounded-xl border border-zinc-100 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-zinc-900">Perlu Follow-up</h2>
            <span className="text-xs text-zinc-400">{counts.at_risk + counts.churned} customer</span>
          </div>
          <div className="space-y-2">
            {customers
              .filter((c) => c.retention_status !== 'active')
              .sort((a, b) => new Date(a.last_order_date).getTime() - new Date(b.last_order_date).getTime())
              .slice(0, 5)
              .map((c) => {
                const days = Math.floor((Date.now() - new Date(c.last_order_date).getTime()) / 86400000)
                return (
                  <div key={c.id} className="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-zinc-50">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-9 w-9 items-center justify-center rounded-lg text-xs font-semibold ${
                        c.retention_status === 'at_risk'
                          ? 'border border-amber-200 bg-amber-50 text-amber-700'
                          : 'border border-red-200 bg-red-50 text-red-600'
                      }`}>
                        {c.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-zinc-900">{c.name}</div>
                        <div className="text-xs text-zinc-400">{c.phone_normalized} &middot; {days} hari lalu</div>
                      </div>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                      c.retention_status === 'at_risk'
                        ? 'border border-amber-200 bg-amber-50 text-amber-700'
                        : 'border border-red-200 bg-red-50 text-red-600'
                    }`}>
                      {getRetentionLabel(c.retention_status)}
                    </span>
                  </div>
                )
              })}
            {customers.filter((c) => c.retention_status !== 'active').length === 0 && (
              <p className="py-8 text-center text-sm text-zinc-400">Semua customer aktif</p>
            )}
          </div>
        </div>
      </main>
    </>
  )
}
