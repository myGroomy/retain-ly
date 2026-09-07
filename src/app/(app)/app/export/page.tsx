'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { DownloadSimple, UsersThree, Receipt, ArrowDown } from '@phosphor-icons/react'
import { getCustomersWithStats } from '@/services/customerService'
import { getOrdersByCustomer } from '@/services/orderService'
import { DEFAULT_THRESHOLDS } from '@/constants'
import { getRetentionStatus, getRetentionLabel } from '@/utils/churnStatus'
import { fadeUp, FLUID_EASE } from '@/lib/motion'
import { useMounted } from '@/lib/useMounted'

export default function ExportPage() {
  const ready = useMounted()
  const [loading, setLoading] = useState(false)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [exportType, setExportType] = useState<'customers' | 'orders'>('customers')

  const handleExport = async () => {
    setLoading(true)
    try {
      if (exportType === 'customers') {
        const result = await getCustomersWithStats(0, 10000)
        const rows = result.data.map((c) => ({
          nama: c.name,
          telepon: c.phone_normalized,
          order_pertama: c.first_order_date,
          order_terakhir: c.last_order_date,
          jumlah_order: c.order_count,
          status_retensi: getRetentionLabel(getRetentionStatus(c.last_order_date, DEFAULT_THRESHOLDS)),
        }))
        downloadCsv(rows, 'customers.csv')
      } else {
        const result = await getCustomersWithStats(0, 10000)
        const allOrders: Array<{ tanggal: string; customer: string; telepon: string; channel: string }> = []
        for (const c of result.data.slice(0, 100)) {
          const orders = await getOrdersByCustomer(c.id, 0, 1000)
          for (const o of orders.data) {
            if (dateFrom && o.order_date < dateFrom) continue
            if (dateTo && o.order_date > dateTo) continue
            allOrders.push({
              tanggal: o.order_date,
              customer: c.name,
              telepon: c.phone_normalized,
              channel: o.channel,
            })
          }
        }
        downloadCsv(allOrders, 'orders.csv')
      }
    } catch (err) {
      console.error('Export failed:', err)
    } finally {
      setLoading(false)
    }
  }

  const downloadCsv = (rows: Record<string, string | number>[], filename: string) => {
    if (rows.length === 0) return
    const headers = Object.keys(rows[0])
    const csv = [
      headers.join(','),
      ...rows.map((row) => headers.map((h) => `"${row[h]}"`).join(','))
    ].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const options = [
    { key: 'customers' as const, label: 'Data Customer', desc: 'Daftar semua customer unik', icon: UsersThree },
    { key: 'orders' as const, label: 'Data Order', desc: 'Riwayat semua transaksi', icon: Receipt },
  ]

  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-8 sm:px-6 md:py-12">
      {/* Heading */}
      <motion.div variants={fadeUp} custom={0} initial="hidden" animate={ready ? 'show' : 'hidden'} className="mb-10">
        <span className="eyebrow">Backup</span>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Export Data</h1>
        <p className="mt-2 text-sm text-ash">Backup data ke CSV</p>
      </motion.div>

      <motion.div variants={fadeUp} custom={1} initial="hidden" animate={ready ? 'show' : 'hidden'}>
        <div className="doppel-outer">
          <div className="doppel-inner p-5 sm:p-7">
            <h2 className="text-base font-semibold text-ink">Pilih Data Export</h2>
            <p className="mt-0.5 text-xs text-ash">Pilih jenis data yang ingin di-export ke CSV</p>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4">
              {options.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setExportType(opt.key)}
                  className={`group rounded-3xl p-4 text-left transition-all duration-500 sm:p-5 ${
                    exportType === opt.key
                      ? 'border-2 border-accent bg-accent-wash/50'
                      : 'border border-hairline bg-white hover:bg-sunken/60'
                  }`}
                >
                  <span className={`mb-3 flex h-11 w-11 items-center justify-center rounded-2xl transition-all duration-500 ${
                    exportType === opt.key ? 'bg-accent text-white shadow-[0_6px_16px_-6px_rgba(47,108,255,0.5)]' : 'bg-accent-wash text-accent'
                  }`}>
                    <opt.icon size={22} weight="duotone" />
                  </span>
                  <div className="text-sm font-semibold text-ink">{opt.label}</div>
                  <div className="mt-0.5 text-xs text-ash">{opt.desc}</div>
                </button>
              ))}
            </div>

            {exportType === 'orders' && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: FLUID_EASE }}
                className="mt-6 grid grid-cols-2 gap-3 sm:gap-4"
              >
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ash">Dari Tanggal</label>
                  <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="field h-11" />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ash">Sampai Tanggal</label>
                  <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="field h-11" />
                </div>
              </motion.div>
            )}

            <button
              onClick={handleExport}
              disabled={loading}
              className="group flex h-13 w-full items-center justify-center gap-3 rounded-full bg-accent text-sm font-semibold text-white transition-all duration-700 hover:-translate-y-px active:scale-[0.98] disabled:opacity-50"
              style={{ boxShadow: '0 8px 24px -8px rgba(47, 108, 255, 0.5)' }}
            >
              {loading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <>
                  <DownloadSimple size={18} weight="bold" />
                  <span>Export ke CSV</span>
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 transition-transform duration-500 group-hover:translate-y-0.5">
                    <ArrowDown size={15} weight="bold" />
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </main>
  )
}