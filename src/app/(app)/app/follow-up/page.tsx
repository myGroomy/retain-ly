'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { CheckSquare, MessageCircle, UserPlus, Download, CheckCircle } from 'lucide-react'
import { getCustomersWithStats } from '@/services/customerService'
import { getRetentionStatus, getRetentionLabel } from '@/utils/churnStatus'
import { buildWaLink } from '@/utils/waLinkBuilder'
import { downloadVCard, downloadBulkVCard } from '@/utils/vcardGenerator'
import { DEFAULT_THRESHOLDS } from '@/constants'
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
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-transparent" />
      </div>
    )
  }

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-zinc-100 bg-white">
        <div className="mx-auto flex h-14 w-full max-w-3xl items-center justify-between px-6">
          <div>
            <h1 className="text-base font-semibold text-zinc-900">Follow-up Harian</h1>
            <p className="text-xs text-zinc-400">{customers.length} customer perlu dihubungi</p>
          </div>
          {customers.length > 0 && (
            <button onClick={handleBulkDownload} className="flex h-8 items-center gap-1.5 rounded-lg bg-zinc-100 px-3 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-200">
              <Download className="h-3.5 w-3.5" />
              Download .vcf
            </button>
          )}
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl space-y-2 px-6 py-6 pb-24 md:pb-8">
        {customers.map((c) => {
          const isChecked = checked.has(c.id)
          const days = Math.floor((Date.now() - new Date(c.last_order_date).getTime()) / 86400000)
          return (
            <div key={c.id} className={`flex items-center justify-between rounded-xl border border-zinc-100 bg-white p-4 transition-all ${isChecked ? 'opacity-40' : ''}`}>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleCheck(c.id)}
                  className={`flex h-5 w-5 items-center justify-center rounded border-2 transition-colors ${
                    isChecked ? 'border-green-500 bg-green-500 text-white' : 'border-zinc-300 hover:border-zinc-500'
                  }`}
                >
                  {isChecked && <CheckSquare className="h-3 w-3" />}
                </button>
                <div className={isChecked ? 'line-through' : ''}>
                  <div className="text-sm font-medium text-zinc-900">{c.name}</div>
                  <div className="text-xs text-zinc-400">{c.phone_normalized} &middot; {days} hari lalu</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                  c.retention_status === 'at_risk'
                    ? 'border border-amber-200 bg-amber-50 text-amber-700'
                    : 'border border-red-200 bg-red-50 text-red-600'
                }`}>
                  {getRetentionLabel(c.retention_status)}
                </span>
                <a
                  href={buildWaLink(c.phone_normalized, c.name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500 text-white transition-colors hover:bg-green-600"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                </a>
                <button
                  onClick={() => downloadVCard(c.name, c.phone_normalized)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 text-zinc-400 transition-colors hover:bg-zinc-50"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )
        })}
        {customers.length === 0 && (
          <div className="py-16 text-center">
            <CheckCircle className="mx-auto mb-2 h-10 w-10 text-green-300" />
            <p className="text-sm font-medium text-zinc-900">Semua customer aktif!</p>
            <p className="mt-1 text-xs text-zinc-400">Tidak ada yang perlu di-follow up hari ini</p>
          </div>
        )}
      </main>
    </>
  )
}
