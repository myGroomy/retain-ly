'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { CheckSquare, WhatsappLogo, DownloadSimple, CheckCircle, UserPlus } from '@phosphor-icons/react'
import { getCustomersWithStats } from '@/services/customerService'
import { getRetentionStatus, getRetentionLabel } from '@/utils/churnStatus'
import { buildWaLink } from '@/utils/waLinkBuilder'
import { downloadVCard, downloadBulkVCard } from '@/utils/vcardGenerator'
import { DEFAULT_THRESHOLDS } from '@/constants'
import { fadeUp, FLUID_EASE } from '@/lib/motion'
import type { CustomerWithStats } from '@/types'

export default function FollowUpPage() {
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
      <div className="flex flex-1 items-center justify-center">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-ink/15 border-t-accent" />
      </div>
    )
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-8 sm:px-6 md:py-12">
      {/* Heading */}
      <motion.div variants={fadeUp} custom={0} initial="hidden" animate="show" className="mb-10 flex flex-wrap items-start justify-between gap-4">
        <div>
          <span className="eyebrow">Jadwal Harian</span>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Follow-up</h1>
          <p className="mt-2 text-sm text-ash">{customers.length} customer perlu dihubungi</p>
        </div>
        {customers.length > 0 && (
          <button
            onClick={handleBulkDownload}
            className="group flex h-11 items-center gap-2 rounded-full border border-hairline bg-white px-4 text-xs font-semibold text-ink-soft transition-all duration-300 hover:bg-sunken hover:text-ink active:scale-[0.98]"
          >
            <DownloadSimple size={16} weight="duotone" className="text-accent" />
            Download .vcf
          </button>
        )}
      </motion.div>

      <motion.div variants={fadeUp} custom={1} initial="hidden" animate="show" className="space-y-3">
        {customers.map((c) => {
          const isChecked = checked.has(c.id)
          const days = Math.floor((Date.now() - new Date(c.last_order_date).getTime()) / 86400000)
          const isRisk = c.retention_status === 'at_risk'
          const statusColor = isRisk ? 'border-amber/25 bg-amber/10 text-amber-600' : 'border-rose/25 bg-rose/10 text-rose-600'
          return (
            <div key={c.id} className={`doppel-outer transition-opacity duration-500 ${isChecked ? 'opacity-45' : ''}`}>
              <div className="doppel-inner flex items-center justify-between gap-3 p-4 sm:p-5">
                <div className="flex items-center gap-3.5">
                  <button
                    onClick={() => toggleCheck(c.id)}
                    className={`flex h-6 w-6 items-center justify-center rounded-lg border-2 transition-all duration-300 active:scale-90 ${
                      isChecked ? 'border-accent bg-accent text-white' : 'border-mist bg-white hover:border-accent'
                    }`}
                  >
                    {isChecked && <CheckSquare size={13} weight="fill" />}
                  </button>
                  <div className={isChecked ? 'line-through opacity-60' : ''}>
                    <div className="text-sm font-semibold text-ink">{c.name}</div>
                    <div className="mt-0.5 font-mono text-xs text-ash">{c.phone_normalized} &middot; {days} hari lalu</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${statusColor}`}>
                    {getRetentionLabel(c.retention_status)}
                  </span>
                  <a
                    href={buildWaLink(c.phone_normalized, c.name)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald text-white transition-all duration-500 hover:-translate-y-px active:scale-[0.94]"
                    style={{ boxShadow: '0 6px 16px -6px rgba(16, 185, 129, 0.5)' }}
                  >
                    <WhatsappLogo size={16} weight="fill" />
                  </a>
                  <button
                    onClick={() => downloadVCard(c.name, c.phone_normalized)}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-hairline bg-white text-ash transition-all duration-300 hover:bg-sunken hover:text-ink active:scale-[0.94]"
                  >
                    <UserPlus size={15} weight="duotone" />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
        {customers.length === 0 && (
          <div className="py-16 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald/10 text-emerald">
              <CheckCircle size={28} weight="duotone" />
            </span>
            <p className="mt-3 text-sm font-semibold text-ink">Semua customer aktif!</p>
            <p className="mt-1 text-xs text-ash">Tidak ada yang perlu di-follow up hari ini</p>
          </div>
        )}
      </motion.div>
    </main>
  )
}