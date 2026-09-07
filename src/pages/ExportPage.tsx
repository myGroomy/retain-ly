import { useState } from 'react'
import { getCustomersWithStats } from '@/services/customerService'
import { getOrdersByCustomer } from '@/services/orderService'
import { DEFAULT_THRESHOLDS } from '@/constants'
import { getRetentionStatus, getRetentionLabel } from '@/utils/churnStatus'

export function ExportPage() {
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
      <header className="sticky top-0 z-30 bg-white border-b border-zinc-100">
        <div className="flex justify-between items-center w-full px-6 h-14 max-w-3xl mx-auto">
          <div>
            <h1 className="text-base font-semibold text-zinc-900">Export Data</h1>
            <p className="text-xs text-zinc-400">Backup data ke CSV</p>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-3xl mx-auto px-6 py-6 pb-24 md:pb-8 space-y-5">
        <div className="bg-white rounded-2xl border border-zinc-100 p-5 md:p-6 space-y-5">
          <div>
            <h2 className="text-base font-semibold text-zinc-900">Pilih Data Export</h2>
            <p className="text-xs text-zinc-400 mt-0.5">Pilih jenis data yang ingin di-export ke CSV</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setExportType('customers')}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                exportType === 'customers'
                  ? 'border-zinc-900 bg-zinc-50'
                  : 'border-zinc-200 hover:border-zinc-300'
              }`}
            >
              <span className="material-symbols-outlined text-[20px] text-zinc-700 mb-2">group</span>
              <div className="text-sm font-semibold text-zinc-900">Data Customer</div>
              <div className="text-xs text-zinc-400 mt-0.5">Daftar semua customer unik</div>
            </button>
            <button
              onClick={() => setExportType('orders')}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                exportType === 'orders'
                  ? 'border-zinc-900 bg-zinc-50'
                  : 'border-zinc-200 hover:border-zinc-300'
              }`}
            >
              <span className="material-symbols-outlined text-[20px] text-zinc-700 mb-2">receipt_long</span>
              <div className="text-sm font-semibold text-zinc-900">Data Order</div>
              <div className="text-xs text-zinc-400 mt-0.5">Riwayat semua transaksi</div>
            </button>
          </div>

          {exportType === 'orders' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">Dari Tanggal</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full h-11 px-3.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm text-zinc-900 focus:border-zinc-900 focus:ring-0 focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">Sampai Tanggal</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full h-11 px-3.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm text-zinc-900 focus:border-zinc-900 focus:ring-0 focus:outline-none transition-colors"
                />
              </div>
            </div>
          )}

          <button
            onClick={handleExport}
            disabled={loading}
            className="w-full h-12 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <span className="material-symbols-outlined text-[16px]">file_download</span>
                Export ke CSV
              </>
            )}
          </button>
        </div>
      </main>
    </>
  )
}
