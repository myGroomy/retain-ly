import { useState } from 'react'

export function SettingsPage() {
  const [activeDays, setActiveDays] = useState(30)
  const [atRiskDays, setAtRiskDays] = useState(60)
  const [template, setTemplate] = useState('Halo {nama}, terima kasih sudah order di toko kami! Ada yang bisa kami bantu?')

  return (
    <div className="flex-1 flex flex-col md:pl-sidebar-width min-h-screen bg-canvas-soft">
      <header className="sticky top-0 z-30 bg-canvas-base shadow-sm">
        <div className="flex justify-between items-center w-full px-4 h-top-nav-height max-w-container-max-width mx-auto">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-surface-subtle flex items-center justify-center text-text-ink">
              <span className="material-symbols-outlined">storefront</span>
            </div>
            <div>
              <h1 className="font-headline-md text-headline-md font-semibold text-text-ink tracking-tight">Settings</h1>
              <p className="font-caption text-caption text-text-body hidden sm:block">Konfigurasi retensi & preferensi</p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-form-max-width mx-auto px-4 py-4 md:py-6 pb-24 md:pb-8 space-y-5">
        <section className="bg-surface-card border border-hairline-strong rounded-xl p-4 md:p-6 space-y-5">
          <div>
            <h2 className="font-headline-sm text-headline-sm text-text-ink">Threshold Retensi</h2>
            <p className="font-caption text-caption text-text-body mt-0.5">Atur batas hari untuk segmentasi customer</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-body-strong text-body-strong text-text-ink mb-1.5">Active (hari)</label>
              <input type="number" value={activeDays} onChange={(e) => setActiveDays(Number(e.target.value))} className="w-full h-11 px-3.5 bg-canvas-base border border-hairline-strong rounded-lg text-body-md font-body-md text-text-ink focus:border-text-ink focus:outline-none transition-colors" />
              <p className="font-caption text-caption text-text-muted mt-1">0 - {activeDays} hari = Active</p>
            </div>
            <div>
              <label className="block font-body-strong text-body-strong text-text-ink mb-1.5">At Risk (hari)</label>
              <input type="number" value={atRiskDays} onChange={(e) => setAtRiskDays(Number(e.target.value))} className="w-full h-11 px-3.5 bg-canvas-base border border-hairline-strong rounded-lg text-body-md font-body-md text-text-ink focus:border-text-ink focus:outline-none transition-colors" />
              <p className="font-caption text-caption text-text-muted mt-1">{activeDays + 1} - {atRiskDays} hari = At Risk</p>
            </div>
          </div>
          <div className="p-3 bg-surface-subtle rounded-lg flex items-start gap-2.5">
            <span className="material-symbols-outlined text-text-muted text-[18px] mt-0.5">info</span>
            <p className="font-caption text-caption text-text-body">Customer melewati {atRiskDays} hari tanpa order akan masuk status Churned.</p>
          </div>
        </section>

        <section className="bg-surface-card border border-hairline-strong rounded-xl p-4 md:p-6 space-y-4">
          <div>
            <h2 className="font-headline-sm text-headline-sm text-text-ink">Template Pesan WhatsApp</h2>
            <p className="font-caption text-caption text-text-body mt-0.5">Gunakan {'{nama}'} untuk menyisipkan nama customer</p>
          </div>
          <textarea
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
            rows={3}
            className="w-full px-3.5 py-2.5 bg-canvas-base border border-hairline-strong rounded-lg text-body-md font-body-md text-text-ink focus:border-text-ink focus:outline-none transition-colors resize-none"
          />
          <div className="p-3 bg-surface-subtle rounded-lg">
            <p className="font-caption-uppercase text-caption-uppercase text-text-muted mb-1">Preview</p>
            <p className="font-body-sm text-body-sm text-text-ink">{template.replace('{nama}', 'Budi Santoso')}</p>
          </div>
        </section>

        <section className="bg-surface-card border border-hairline-strong rounded-xl p-4 md:p-6 space-y-4">
          <div>
            <h2 className="font-headline-sm text-headline-sm text-text-ink">Channel Order</h2>
            <p className="font-caption text-caption text-text-body mt-0.5">Platform yang tersedia untuk pencatatan order</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {['Dine-in', 'Takeaway', 'Gofood', 'Grab', 'Shopee', 'WhatsApp', 'Lainnya'].map((ch) => (
              <span key={ch} className="inline-flex items-center px-3 py-1.5 rounded-lg bg-surface-subtle border border-hairline-strong text-body-sm font-body-sm text-text-ink">{ch}</span>
            ))}
          </div>
        </section>

        <button className="w-full h-12 bg-cta-black hover:bg-cta-black-active text-on-primary rounded-lg font-button text-button font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-all">
          <span className="material-symbols-outlined text-[18px]">save</span>
          Simpan Perubahan
        </button>
      </main>
    </div>
  )
}
