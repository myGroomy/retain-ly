'use client'

import { useState } from 'react'
import { Save, Info } from 'lucide-react'

export default function SettingsPage() {
  const [activeDays, setActiveDays] = useState(30)
  const [atRiskDays, setAtRiskDays] = useState(60)
  const [template, setTemplate] = useState('Halo {nama}, terima kasih sudah order di toko kami! Ada yang bisa kami bantu?')

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-zinc-100 bg-white">
        <div className="mx-auto flex h-14 w-full max-w-3xl items-center justify-between px-6">
          <div>
            <h1 className="text-base font-semibold text-zinc-900">Settings</h1>
            <p className="text-xs text-zinc-400">Konfigurasi retensi & preferensi</p>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl space-y-5 px-6 py-6 pb-24 md:pb-8">
        {/* Threshold */}
        <div className="space-y-5 rounded-2xl border border-zinc-100 bg-white p-5 md:p-6">
          <div>
            <h2 className="text-base font-semibold text-zinc-900">Threshold Retensi</h2>
            <p className="mt-0.5 text-xs text-zinc-400">Atur batas hari untuk segmentasi customer</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-700">Active (hari)</label>
              <input
                type="number"
                value={activeDays}
                onChange={(e) => setActiveDays(Number(e.target.value))}
                className="h-11 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3.5 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-0 transition-colors"
              />
              <p className="mt-1 text-xs text-zinc-400">0 &ndash; {activeDays} hari</p>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-700">At Risk (hari)</label>
              <input
                type="number"
                value={atRiskDays}
                onChange={(e) => setAtRiskDays(Number(e.target.value))}
                className="h-11 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3.5 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-0 transition-colors"
              />
              <p className="mt-1 text-xs text-zinc-400">{activeDays + 1} &ndash; {atRiskDays} hari</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5 rounded-lg bg-zinc-50 p-3">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" />
            <p className="text-xs text-zinc-500">Customer melewati {atRiskDays} hari tanpa order akan masuk status Churned.</p>
          </div>
        </div>

        {/* Template */}
        <div className="space-y-4 rounded-2xl border border-zinc-100 bg-white p-5 md:p-6">
          <div>
            <h2 className="text-base font-semibold text-zinc-900">Template Pesan WhatsApp</h2>
            <p className="mt-0.5 text-xs text-zinc-400">Gunakan {'{nama}'} untuk menyisipkan nama customer</p>
          </div>
          <textarea
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
            rows={3}
            className="w-full resize-none rounded-lg border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-0 transition-colors"
          />
          <div className="rounded-lg bg-zinc-50 p-3">
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Preview</p>
            <p className="text-sm text-zinc-700">{template.replace('{nama}', 'Budi Santoso')}</p>
          </div>
        </div>

        {/* Channels */}
        <div className="space-y-4 rounded-2xl border border-zinc-100 bg-white p-5 md:p-6">
          <div>
            <h2 className="text-base font-semibold text-zinc-900">Channel Order</h2>
            <p className="mt-0.5 text-xs text-zinc-400">Platform yang tersedia untuk pencatatan order</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {['Dine-in', 'Takeaway', 'Gofood', 'Grab', 'Shopee', 'WhatsApp', 'Lainnya'].map((ch) => (
              <span key={ch} className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-medium text-zinc-600">{ch}</span>
            ))}
          </div>
        </div>

        <button className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 text-sm font-medium text-white transition-all hover:bg-zinc-800 active:scale-[0.98]">
          <Save className="h-4 w-4" />
          Simpan Perubahan
        </button>
      </main>
    </>
  )
}
