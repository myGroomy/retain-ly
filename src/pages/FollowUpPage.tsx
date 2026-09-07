import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { getCustomersWithStats } from '@/services/customerService'
import { getRetentionStatus, getRetentionLabel } from '@/utils/churnStatus'
import { buildWaLink } from '@/utils/waLinkBuilder'
import { downloadVCard, downloadBulkVCard } from '@/utils/vcardGenerator'
import { DEFAULT_THRESHOLDS } from '@/constants'
import type { CustomerWithStats } from '@/types'

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
}

export function FollowUpPage() {
  const [customers, setCustomers] = useState<CustomerWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [checked, setChecked] = useState<Set<string>>(new Set())

  useEffect(() => {
    (async () => {
      try {
        const r = await getCustomersWithStats(0, 10000)
        const filtered = r.data
          .map((c) => ({ ...c, retention_status: getRetentionStatus(c.last_order_date, DEFAULT_THRESHOLDS) }))
          .filter((c) => c.retention_status !== 'active')
          .sort((a, b) => new Date(a.last_order_date).getTime() - new Date(b.last_order_date).getTime())
        setCustomers(filtered)
      } catch { /* silent */ } finally { setLoading(false) }
    })()
  }, [])

  const toggleCheck = (id: string) => {
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleBulkDownload = () => {
    const contacts = customers.map((c) => ({ name: c.name, phone: c.phone_normalized }))
    downloadBulkVCard(contacts)
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <span className="material-symbols-outlined animate-spin text-zinc-300">progress_activity</span>
      </div>
    )
  }

  return (
    <>
      <header className="sticky top-0 z-30 bg-white border-b border-zinc-100">
        <div className="flex justify-between items-center w-full px-6 h-14 max-w-3xl mx-auto">
          <div>
            <h1 className="text-base font-semibold text-zinc-900">Follow-up Harian</h1>
            <p className="text-xs text-zinc-400">{customers.length} customer perlu dihubungi</p>
          </div>
          {customers.length > 0 && (
            <button onClick={handleBulkDownload} className="h-8 px-3 bg-zinc-100 rounded-lg text-xs font-medium text-zinc-600 hover:bg-zinc-200 flex items-center gap-1.5 transition-colors">
              <span className="material-symbols-outlined text-[14px]">contacts</span>
              Download .vcf
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 w-full max-w-3xl mx-auto px-6 py-6 pb-24 md:pb-8 space-y-2">
        {customers.map((c, i) => {
          const isChecked = checked.has(c.id)
          const days = Math.floor((Date.now() - new Date(c.last_order_date).getTime()) / 86400000)
          return (
            <motion.div
              key={c.id}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.25, delay: i * 0.03 }}
              className={`bg-white border border-zinc-100 rounded-xl p-4 flex items-center justify-between transition-all ${isChecked ? 'opacity-40' : ''}`}
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleCheck(c.id)}
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                    isChecked ? 'bg-green-500 border-green-500 text-white' : 'border-zinc-300 hover:border-zinc-500'
                  }`}
                >
                  {isChecked && <span className="material-symbols-outlined text-[12px]">check</span>}
                </button>
                <div className={isChecked ? 'line-through' : ''}>
                  <div className="text-sm font-medium text-zinc-900">{c.name}</div>
                  <div className="text-xs text-zinc-400">{c.phone_normalized} &middot; {days} hari lalu</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${
                  c.retention_status === 'at_risk'
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-red-50 text-red-600 border border-red-200'
                }`}>
                  {getRetentionLabel(c.retention_status)}
                </span>
                <a
                  href={buildWaLink(c.phone_normalized, c.name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center text-white hover:bg-green-600 transition-colors"
                >
                  <span className="material-symbols-outlined text-[14px]">chat</span>
                </a>
                <button
                  onClick={() => downloadVCard(c.name, c.phone_normalized)}
                  className="w-8 h-8 rounded-lg border border-zinc-200 flex items-center justify-center text-zinc-400 hover:bg-zinc-50 transition-colors"
                >
                  <span className="material-symbols-outlined text-[14px]">person_add</span>
                </button>
              </div>
            </motion.div>
          )
        })}
        {customers.length === 0 && (
          <div className="py-16 text-center">
            <span className="material-symbols-outlined text-[40px] text-green-300 mb-2">check_circle</span>
            <p className="text-sm font-medium text-zinc-900">Semua customer aktif!</p>
            <p className="text-xs text-zinc-400 mt-1">Tidak ada yang perlu di-follow up hari ini</p>
          </div>
        )}
      </main>
    </>
  )
}
