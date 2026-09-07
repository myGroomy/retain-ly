'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { UsersThree, ArrowsClockwise, Warning, PersonSimpleWalk, ArrowRight } from '@phosphor-icons/react'
import { getCustomersWithStats } from '@/services/customerService'
import { getRetentionStatus, getRetentionLabel } from '@/utils/churnStatus'
import { DEFAULT_THRESHOLDS } from '@/constants'
import { fadeUp, FLUID_EASE } from '@/lib/motion'
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
      <div className="flex min-h-[70dvh] items-center justify-center">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-color-ink/15 border-t-accent" />
      </div>
    )
  }

  const counts = { active: 0, at_risk: 0, churned: 0 }
  customers.forEach((c) => counts[c.retention_status as keyof typeof counts]++)
  const total = customers.length
  const repeatRate = total > 0 ? Math.round((customers.filter((c) => c.order_count > 1).length / total) * 100) : 0

  const stats = [
    { label: 'Total Customer', value: total, unit: '', icon: UsersThree, hue: 'text-accent', glow: 'bg-accent/10' },
    { label: 'Repeat Rate', value: repeatRate, unit: '%', icon: ArrowsClockwise, hue: 'text-emerald', glow: 'bg-emerald/10' },
    { label: 'At Risk', value: counts.at_risk, unit: '', icon: Warning, hue: 'text-amber', glow: 'bg-amber/10' },
    { label: 'Churned', value: counts.churned, unit: '', icon: PersonSimpleWalk, hue: 'text-rose', glow: 'bg-rose/10' },
  ]

  const segments = [
    { key: 'active' as const, label: 'Aktif', range: '0–30 hari', count: counts.active, color: 'bg-emerald' },
    { key: 'at_risk' as const, label: 'At Risk', range: '31–60 hari', count: counts.at_risk, color: 'bg-amber' },
    { key: 'churned' as const, label: 'Churned', range: '61+ hari', count: counts.churned, color: 'bg-rose' },
  ]

  const followUps = customers
    .filter((c) => c.retention_status !== 'active')
    .sort((a, b) => new Date(a.last_order_date).getTime() - new Date(b.last_order_date).getTime())
    .slice(0, 5)

  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-6 md:py-12">
      {/* Heading */}
      <motion.div variants={fadeUp} custom={0} initial="hidden" animate="show" className="mb-10">
        <span className="eyebrow">Overview</span>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Dashboard Retensi</h1>
        <p className="mt-2 text-sm text-ash">Pemetaan kesehatan seluruh basis customer</p>
      </motion.div>

      {/* Asymmetrical Bento Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-5">
        {/* Stat cards */}
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            variants={fadeUp}
            custom={i + 1}
            initial="hidden"
            animate="show"
            className="md:col-span-3"
          >
            <div className="doppel-outer h-full">
              <div className="doppel-inner flex h-full flex-col justify-between p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-ash">{s.label}</span>
                  <span className={`flex h-9 w-9 items-center justify-center rounded-2xl ${s.glow}`}>
                    <s.icon size={18} weight="duotone" className={s.hue} />
                  </span>
                </div>
                <div className="mt-6">
                  <span className="text-4xl font-semibold tracking-tight text-ink">
                    {s.value}
                    {s.unit && <span className="text-2xl text-mist">{s.unit}</span>}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Segmentation — col-span-7 */}
        <motion.div variants={fadeUp} custom={5} initial="hidden" animate="show" className="md:col-span-7">
          <div className="doppel-outer h-full">
            <div className="doppel-inner flex h-full flex-col p-6 sm:p-7">
              <h2 className="text-lg font-semibold text-ink">Segmentasi Customer</h2>
              <div className="mt-6 flex-1 space-y-5">
                {segments.map((s) => (
                  <div key={s.key}>
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className={`h-2.5 w-2.5 rounded-full ${s.color}`} />
                        <span className="text-sm font-medium text-ink-soft">{s.label}</span>
                        <span className="text-xs text-mist">{s.range}</span>
                      </div>
                      <span className="text-lg font-semibold text-ink">{s.count}</span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-sunken">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: total > 0 ? `${(s.count / total) * 100}%` : '0%' }}
                        transition={{ duration: 1, delay: 0.4 + segments.indexOf(s) * 0.1, ease: FLUID_EASE }}
                        className={`h-full rounded-full ${s.color}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Follow-up needed — col-span-5 */}
        <motion.div variants={fadeUp} custom={6} initial="hidden" animate="show" className="md:col-span-5">
          <div className="doppel-outer h-full">
            <div className="doppel-inner flex h-full flex-col p-6 sm:p-7">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-ink">Perlu Follow-up</h2>
                <span className="rounded-full border border-hairline bg-white px-2.5 py-1 text-xs font-medium text-ink-soft">
                  {counts.at_risk + counts.churned} customer
                </span>
              </div>
              <div className="mt-5 flex-1 space-y-2.5">
                {followUps.length > 0 ? followUps.map((c) => {
                  const days = Math.floor((Date.now() - new Date(c.last_order_date).getTime()) / 86400000)
                  const isRisk = c.retention_status === 'at_risk'
                  return (
                    <div key={c.id} className="group flex items-center justify-between rounded-2xl border border-hairline bg-white p-3 transition-all duration-500 hover:border-accent/30 hover:bg-accent-wash/40">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-9 w-9 items-center justify-center rounded-xl text-xs font-semibold ${
                          isRisk ? 'border border-amber/25 bg-amber/10 text-amber-600' : 'border border-rose/25 bg-rose/10 text-rose-600'
                        }`}>
                          {c.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-ink">{c.name}</div>
                          <div className="text-xs text-ash">{days} hari lalu</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                          isRisk ? 'border border-amber/25 bg-amber/10 text-amber-600' : 'border border-rose/25 bg-rose/10 text-rose-600'
                        }`}>
                          {getRetentionLabel(c.retention_status)}
                        </span>
                        <ArrowRight size={14} weight="bold" className="text-mist transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-accent" />
                      </div>
                    </div>
                  )
                }) : (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald/10 text-emerald">
                      <ArrowsClockwise size={22} weight="duotone" />
                    </span>
                    <p className="mt-3 text-sm text-ash">Semua customer aktif</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  )
}