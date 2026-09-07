'use client'

import { useState } from 'react'
import { Download, Users, Receipt } from 'lucide-react'
import { getCustomersWithStats } from '@/services/customerService'
import { getOrdersByCustomer } from '@/services/orderService'
import { DEFAULT_THRESHOLDS } from '@/constants'
import { getRetentionStatus, getRetentionLabel } from '@/utils/churnStatus'

export default function ExportPage() {
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

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-zinc-100 bg-white">
        <div className="mx-auto flex h-14 w-full max-w-3xl items-center justify-between px-6">
          <div>
            <h1 className="text-base font-semibold text-zinc-900">Export Data</h1>
            <p className="text-xs text-zinc-400">Backup data ke CSV</p>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl space-y-5 px-6 py-6 pb-24 md:pb-8">
        <div className="space-y-5 rounded-2xl border border-zinc-100 bg-white p-5 md:p-6">
          <div>
            <h2 className="text-base font-semibold text-zinc-900">Pilih Data Export</h2>
            <p className="mt-0.5 text-xs text-zinc-400">Pilih jenis data yang ingin di-export ke CSV</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setExportType('customers')}
              className={`rounded-xl border-2 p-4 text-left transition-all ${
                exportType === 'customers'
                  ? 'border-zinc-900 bg-zinc-50'
                  : 'border-zinc-200 hover:border-zinc-300'
              }`}
            >
              <Users className="mb-2 h-5 w-5 text-zinc-700" />
              <div className="text-sm font-semibold text-zinc-900">Data Customer</div>
              <div className="mt-0.5 text-xs text-zinc-400">Daftar semua customer unik</div>
            </button>
            <button
              onClick={() => setExportType('orders')}
              className={`rounded-xl border-2 p-4 text-left transition-all ${
                exportType === 'orders'
                  ? 'border-zinc-900 bg-zinc-50'
                  : 'border-zinc-200 hover:border-zinc-300'
              }`}
            >
              <Receipt className="mb-2 h-5 w-5 text-zinc-700" />
              <div className="text-sm font-semibold text-zinc-900">Data Order</div>
              <div className="mt-0.5 text-xs text-zinc-400">Riwayat semua transaksi</div>
            </button>
          </div>

          {exportType === 'orders' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-700">Dari Tanggal</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="h-11 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3.5 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-0 transition-colors"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-700">Sampai Tanggal</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="h-11 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3.5 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-0 transition-colors"
                />
              </div>
            </div>
          )}

          <button
            onClick={handleExport}
            disabled={loading}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 text-sm font-medium text-white transition-all hover:bg-zinc-800 active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <>
                <Download className="h-4 w-4" />
                Export ke CSV
              </>
            )}
          </button>
        </div>
      </main>
    </>
  )
}
