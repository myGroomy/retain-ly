import { useEffect, useState } from 'react'
import { getCustomersWithStats } from '@/services/customerService'
import { getRetentionStatus, getRetentionLabel } from '@/utils/churnStatus'
import { buildWaLink } from '@/utils/waLinkBuilder'
import { downloadVCard, downloadBulkVCard } from '@/utils/vcardGenerator'
import { DEFAULT_THRESHOLDS } from '@/constants'
import type { CustomerWithStats } from '@/types'

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

  if (loading) return <div className="flex-1 flex items-center justify-center"><span className="material-symbols-outlined animate-spin text-text-muted">progress_activity</span></div>

  return (
    <div className="flex-1 flex flex-col md:pl-sidebar-width min-h-screen bg-canvas-soft">
      <header className="sticky top-0 z-30 bg-canvas-base shadow-sm">
        <div className="flex justify-between items-center w-full px-4 h-top-nav-height max-w-container-max-width mx-auto">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-surface-subtle flex items-center justify-center text-text-ink">
              <span className="material-symbols-outlined">storefront</span>
            </div>
            <div>
              <h1 className="font-headline-md text-headline-md font-semibold text-text-ink tracking-tight">Daily Follow-up</h1>
              <p className="font-caption text-caption text-text-body hidden sm:block">{customers.length} customer perlu di-follow up</p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-container-max-width mx-auto px-4 py-4 md:py-6 pb-24 md:pb-8 space-y-4">
        {customers.length > 0 && (
          <div className="bg-surface-card border border-hairline-strong rounded-xl p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-surface-dark flex items-center justify-center text-text-on-dark">
                <span className="material-symbols-outlined">checklist</span>
              </div>
              <div>
                <div className="font-headline-sm text-headline-sm text-text-ink leading-tight">{customers.length} Customer Perlu Follow-up</div>
                <div className="font-caption text-caption text-text-body">At Risk & Churned — kirim WA atau simpan kontak</div>
              </div>
            </div>
            <button onClick={handleBulkDownload} className="h-9 px-3 rounded-lg bg-surface-subtle border border-hairline-strong hover:bg-hairline-strong font-button text-button text-text-ink flex items-center gap-1.5 transition-colors">
              <span className="material-symbols-outlined text-[16px]">contacts</span>
              Download Semua (.vcf)
            </button>
          </div>
        )}

        <div className="space-y-2">
          {customers.map((c) => {
            const isChecked = checked.has(c.id)
            const days = Math.floor((Date.now() - new Date(c.last_order_date).getTime()) / 86400000)
            return (
              <div key={c.id} className={`bg-surface-card border border-hairline-strong rounded-xl p-3.5 flex items-center justify-between transition-all ${isChecked ? 'opacity-50' : ''}`}>
                <div className="flex items-center gap-3">
                  <button onClick={() => toggleCheck(c.id)} className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${isChecked ? 'bg-semantic-active border-semantic-active text-white' : 'border-hairline-strong hover:border-text-ink'}`}>
                    {isChecked && <span className="material-symbols-outlined text-[16px] fill" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>}
                  </button>
                  <div className={isChecked ? 'line-through' : ''}>
                    <div className="font-body-strong text-body-strong text-text-ink">{c.name}</div>
                    <div className="font-caption text-caption text-text-body">{c.phone_normalized} • {days} hari lalu</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-caption-uppercase text-caption-uppercase text-[10px] ${c.retention_status === 'at_risk' ? 'bg-semantic-risk-surface text-semantic-risk border border-semantic-risk-border' : 'bg-semantic-churned-surface text-semantic-churned border border-semantic-churned-border'}`}>
                    {getRetentionLabel(c.retention_status)}
                  </span>
                  <a href={buildWaLink(c.phone_normalized, c.name)} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-semantic-active flex items-center justify-center text-white hover:bg-green-700 transition-colors">
                    <span className="material-symbols-outlined text-[16px]">chat</span>
                  </a>
                  <button onClick={() => downloadVCard(c.name, c.phone_normalized)} className="w-8 h-8 rounded-lg border border-hairline-strong flex items-center justify-center text-text-body hover:bg-surface-subtle transition-colors">
                    <span className="material-symbols-outlined text-[16px]">person_add</span>
                  </button>
                </div>
              </div>
            )
          })}
          {customers.length === 0 && (
            <div className="py-12 text-center">
              <span className="material-symbols-outlined text-[48px] text-semantic-active mb-2">check_circle</span>
              <p className="font-body-md text-body-md text-text-ink font-medium">Semua customer aktif!</p>
              <p className="font-caption text-caption text-text-muted mt-1">Tidak ada yang perlu di-follow up hari ini</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
