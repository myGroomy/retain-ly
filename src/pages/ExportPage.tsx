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
    <div className="flex-1 flex flex-col md:pl-sidebar-width min-h-screen bg-canvas-soft">
      <header className="sticky top-0 z-30 bg-canvas-base shadow-sm">
        <div className="flex justify-between items-center w-full px-4 h-top-nav-height max-w-container-max-width mx-auto">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-surface-subtle flex items-center justify-center text-text-ink">
              <span className="material-symbols-outlined">storefront</span>
            </div>
            <div>
              <h1 className="font-headline-md text-headline-md font-semibold text-text-ink tracking-tight">Export Data</h1>
              <p className="font-caption text-caption text-text-body hidden sm:block">Backup data ke CSV</p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-form-max-width mx-auto px-4 py-4 md:py-6 pb-24 md:pb-8 space-y-5">
        <section className="bg-surface-card border border-hairline-strong rounded-xl p-4 md:p-6 space-y-5">
          <div>
            <h2 className="font-headline-sm text-headline-sm text-text-ink">Pilih Data Export</h2>
            <p className="font-caption text-caption text-text-body mt-0.5">Pilih jenis data yang ingin di-export ke CSV</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setExportType('customers')}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                exportType === 'customers'
                  ? 'border-text-ink bg-surface-subtle'
                  : 'border-hairline-strong bg-canvas-base hover:border-hairline-strong'
              }`}
            >
              <span className="material-symbols-outlined text-[24px] text-text-ink mb-2">group</span>
              <div className="font-body-strong text-body-strong text-text-ink">Data Customer</div>
              <div className="font-caption text-caption text-text-body mt-0.5">Daftar semua customer unik</div>
            </button>
            <button
              onClick={() => setExportType('orders')}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                exportType === 'orders'
                  ? 'border-text-ink bg-surface-subtle'
                  : 'border-hairline-strong bg-canvas-base hover:border-hairline-strong'
              }`}
            >
              <span className="material-symbols-outlined text-[24px] text-text-ink mb-2">receipt_long</span>
              <div className="font-body-strong text-body-strong text-text-ink">Data Order</div>
              <div className="font-caption text-caption text-text-body mt-0.5">Riwayat semua transaksi</div>
            </button>
          </div>

          {exportType === 'orders' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-body-strong text-body-strong text-text-ink mb-1.5">Dari Tanggal</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full h-11 px-3.5 bg-canvas-base border border-hairline-strong rounded-lg text-body-md font-body-md text-text-ink focus:border-text-ink focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block font-body-strong text-body-strong text-text-ink mb-1.5">Sampai Tanggal</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full h-11 px-3.5 bg-canvas-base border border-hairline-strong rounded-lg text-body-md font-body-md text-text-ink focus:border-text-ink focus:outline-none transition-colors"
                />
              </div>
            </div>
          )}

          <button
            onClick={handleExport}
            disabled={loading}
            className="w-full h-12 bg-cta-black hover:bg-cta-black-active text-on-primary rounded-lg font-button text-button font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">file_download</span>
                Export ke CSV
              </>
            )}
          </button>
        </section>
      </main>
    </div>
  )
}
