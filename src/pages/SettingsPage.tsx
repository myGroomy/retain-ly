import { useState } from 'react'

export function SettingsPage() {
  const [activeDays, setActiveDays] = useState(30)
  const [atRiskDays, setAtRiskDays] = useState(60)
  const [template, setTemplate] = useState('Halo {nama}, terima kasih sudah order di toko kami! Ada yang bisa kami bantu?')

  return (
    <div className="flex-1 flex flex-col md:pl-60 min-h-screen bg-zinc-50">
      <header className="sticky top-0 z-30 bg-white border-b border-zinc-100">
        <div className="flex justify-between items-center w-full px-6 h-14 max-w-3xl mx-auto">
          <div>
            <h1 className="text-base font-semibold text-zinc-900">Settings</h1>
            <p className="text-xs text-zinc-400">Konfigurasi retensi & preferensi</p>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-3xl mx-auto px-6 py-6 pb-24 md:pb-8 space-y-5">
        {/* Threshold */}
        <div className="bg-white rounded-2xl border border-zinc-100 p-5 md:p-6 space-y-5">
          <div>
            <h2 className="text-base font-semibold text-zinc-900">Threshold Retensi</h2>
            <p className="text-xs text-zinc-400 mt-0.5">Atur batas hari untuk segmentasi customer</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">Active (hari)</label>
              <input
                type="number"
                value={activeDays}
                onChange={(e) => setActiveDays(Number(e.target.value))}
                className="w-full h-11 px-3.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm text-zinc-900 focus:border-zinc-900 focus:ring-0 focus:outline-none transition-colors"
              />
              <p className="text-xs text-zinc-400 mt-1">0 &ndash; {activeDays} hari</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">At Risk (hari)</label>
              <input
                type="number"
                value={atRiskDays}
                onChange={(e) => setAtRiskDays(Number(e.target.value))}
                className="w-full h-11 px-3.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm text-zinc-900 focus:border-zinc-900 focus:ring-0 focus:outline-none transition-colors"
              />
              <p className="text-xs text-zinc-400 mt-1">{activeDays + 1} &ndash; {atRiskDays} hari</p>
            </div>
          </div>
          <div className="p-3 bg-zinc-50 rounded-lg flex items-start gap-2.5">
            <span className="material-symbols-outlined text-zinc-400 text-[16px] mt-0.5">info</span>
            <p className="text-xs text-zinc-500">Customer melewati {atRiskDays} hari tanpa order akan masuk status Churned.</p>
          </div>
        </div>

        {/* Template */}
        <div className="bg-white rounded-2xl border border-zinc-100 p-5 md:p-6 space-y-4">
          <div>
            <h2 className="text-base font-semibold text-zinc-900">Template Pesan WhatsApp</h2>
            <p className="text-xs text-zinc-400 mt-0.5">Gunakan {'{nama}'} untuk menyisipkan nama customer</p>
          </div>
          <textarea
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
            rows={3}
            className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm text-zinc-900 focus:border-zinc-900 focus:ring-0 focus:outline-none transition-colors resize-none"
          />
          <div className="p-3 bg-zinc-50 rounded-lg">
            <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">Preview</p>
            <p className="text-sm text-zinc-700">{template.replace('{nama}', 'Budi Santoso')}</p>
          </div>
        </div>

        {/* Channels */}
        <div className="bg-white rounded-2xl border border-zinc-100 p-5 md:p-6 space-y-4">
          <div>
            <h2 className="text-base font-semibold text-zinc-900">Channel Order</h2>
            <p className="text-xs text-zinc-400 mt-0.5">Platform yang tersedia untuk pencatatan order</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {['Dine-in', 'Takeaway', 'Gofood', 'Grab', 'Shopee', 'WhatsApp', 'Lainnya'].map((ch) => (
              <span key={ch} className="px-3 py-1.5 rounded-lg bg-zinc-50 border border-zinc-200 text-xs font-medium text-zinc-600">{ch}</span>
            ))}
          </div>
        </div>

        <button className="w-full h-12 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 active:scale-[0.98] transition-all">
          <span className="material-symbols-outlined text-[16px]">save</span>
          Simpan Perubahan
        </button>
      </main>
    </div>
  )
}
