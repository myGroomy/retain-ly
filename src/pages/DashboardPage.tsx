import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { getCustomersWithStats } from '@/services/customerService'
import { getRetentionStatus, getRetentionLabel } from '@/utils/churnStatus'
import { DEFAULT_THRESHOLDS } from '@/constants'
import type { CustomerWithStats } from '@/types'

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
}

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
}

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

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <span className="material-symbols-outlined animate-spin text-zinc-300">progress_activity</span>
      </div>
    )
  }

  const counts = { active: 0, at_risk: 0, churned: 0 }
  customers.forEach((c) => counts[c.retention_status as keyof typeof counts]++)
  const total = customers.length
  const repeatRate = total > 0 ? Math.round((customers.filter((c) => c.order_count > 1).length / total) * 100) : 0

  return (
    <div className="flex-1 flex flex-col md:pl-60 min-h-screen bg-zinc-50">
      <header className="sticky top-0 z-30 bg-white border-b border-zinc-100">
        <div className="flex justify-between items-center w-full px-6 h-14 max-w-5xl mx-auto">
          <div>
            <h1 className="text-base font-semibold text-zinc-900">Dashboard Retensi</h1>
            <p className="text-xs text-zinc-400">Overview semua customer</p>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 border border-green-200 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
            <span className="text-xs text-green-700 font-medium">Online</span>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-5xl mx-auto px-6 py-6 pb-24 md:pb-8 space-y-6">
        {/* Stats Grid */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {[
            { label: 'Total Customer', value: total, icon: 'group', accent: 'text-zinc-900' },
            { label: 'Repeat Rate', value: `${repeatRate}%`, icon: 'repeat', accent: 'text-green-600' },
            { label: 'At Risk', value: counts.at_risk, icon: 'warning', accent: 'text-amber-600' },
            { label: 'Churned', value: counts.churned, icon: 'person_off', accent: 'text-red-500' },
          ].map((s) => (
            <motion.div
              key={s.label}
              variants={fadeUp}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl border border-zinc-100 p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">{s.label}</span>
                <span className={`material-symbols-outlined text-[18px] ${s.accent}`}>{s.icon}</span>
              </div>
              <div className={`text-3xl font-bold tracking-tight ${s.accent}`}>{s.value}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Segmentation */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.4, delay: 0.3 }}
          className="bg-white rounded-xl border border-zinc-100 p-6"
        >
          <h2 className="text-base font-semibold text-zinc-900 mb-5">Segmentasi Customer</h2>
          <div className="space-y-4">
            {([
              { key: 'active', label: 'Active', range: '0-30 hari', count: counts.active, color: 'bg-green-500' },
              { key: 'at_risk', label: 'At Risk', range: '31-60 hari', count: counts.at_risk, color: 'bg-amber-500' },
              { key: 'churned', label: 'Churned', range: '61+ hari', count: counts.churned, color: 'bg-red-400' },
            ] as const).map((s) => (
              <div key={s.key}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${s.color}`}></span>
                    <span className="text-sm text-zinc-700">{s.label}</span>
                    <span className="text-xs text-zinc-400">{s.range}</span>
                  </div>
                  <span className="text-sm font-semibold text-zinc-900">{s.count}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-zinc-100 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: total > 0 ? `${(s.count / total) * 100}%` : '0%' }}
                    transition={{ duration: 0.8, delay: 0.5, ease: 'easeOut' }}
                    className={`h-full ${s.color} rounded-full`}
                  ></motion.div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Follow-up needed */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.4, delay: 0.4 }}
          className="bg-white rounded-xl border border-zinc-100 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-zinc-900">Perlu Follow-up</h2>
            <span className="text-xs text-zinc-400">{counts.at_risk + counts.churned} customer</span>
          </div>
          <div className="space-y-2">
            {customers
              .filter((c) => c.retention_status !== 'active')
              .sort((a, b) => new Date(a.last_order_date).getTime() - new Date(b.last_order_date).getTime())
              .slice(0, 5)
              .map((c, i) => {
                const days = Math.floor((Date.now() - new Date(c.last_order_date).getTime()) / 86400000)
                return (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.5 + i * 0.05 }}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-zinc-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-semibold ${
                        c.retention_status === 'at_risk'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-red-50 text-red-600 border border-red-200'
                      }`}>
                        {c.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-zinc-900">{c.name}</div>
                        <div className="text-xs text-zinc-400">{c.phone_normalized} &middot; {days} hari lalu</div>
                      </div>
                    </div>
                    <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      c.retention_status === 'at_risk'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-red-50 text-red-600 border border-red-200'
                    }`}>
                      {getRetentionLabel(c.retention_status)}
                    </span>
                  </motion.div>
                )
              })}
            {customers.filter((c) => c.retention_status !== 'active').length === 0 && (
              <p className="py-8 text-center text-sm text-zinc-400">Semua customer aktif</p>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  )
}
