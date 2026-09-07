'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { FloppyDisk, Info, Gear } from '@phosphor-icons/react'
import { fadeUp } from '@/lib/motion'

export default function SettingsPage() {
  const [activeDays, setActiveDays] = useState(30)
  const [atRiskDays, setAtRiskDays] = useState(60)
  const [template, setTemplate] = useState('Halo {nama}, terima kasih sudah order di toko kami! Ada yang bisa kami bantu?')

  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-8 sm:px-6 md:py-12">
      {/* Heading */}
      <motion.div variants={fadeUp} custom={0} initial="hidden" animate="show" className="mb-10">
        <span className="eyebrow">Preferensi</span>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Settings</h1>
        <p className="mt-2 text-sm text-ash">Konfigurasi retensi & preferensi</p>
      </motion.div>

      <div className="space-y-5">
        {/* Threshold */}
        <motion.div variants={fadeUp} custom={1} initial="hidden" animate="show">
          <div className="doppel-outer">
            <div className="doppel-inner p-5 sm:p-7">
              <div className="mb-6 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent-wash text-accent">
                  <Gear size={20} weight="duotone" />
                </span>
                <div>
                  <h2 className="text-base font-semibold text-ink">Threshold Retensi</h2>
                  <p className="mt-0.5 text-xs text-ash">Atur batas hari untuk segmentasi customer</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ash">Active (hari)</label>
                  <input
                    type="number"
                    value={activeDays}
                    onChange={(e) => setActiveDays(Number(e.target.value))}
                    className="field h-11 bg-sunken/50"
                  />
                  <p className="mt-1.5 text-xs text-ash">0 &ndash; {activeDays} hari</p>
                </div>
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ash">At Risk (hari)</label>
                  <input
                    type="number"
                    value={atRiskDays}
                    onChange={(e) => setAtRiskDays(Number(e.target.value))}
                    className="field h-11 bg-sunken/50"
                  />
                  <p className="mt-1.5 text-xs text-ash">{activeDays + 1} &ndash; {atRiskDays} hari</p>
                </div>
              </div>
              <div className="mt-5 flex items-start gap-3 rounded-2xl border border-amber/20 bg-amber/5 p-4">
                <Info size={18} weight="duotone" className="mt-0.5 shrink-0 text-amber-600" />
                <p className="text-xs leading-relaxed text-ash">Customer melewati {atRiskDays} hari tanpa order akan masuk status Churned.</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Template */}
        <motion.div variants={fadeUp} custom={2} initial="hidden" animate="show">
          <div className="doppel-outer">
            <div className="doppel-inner p-5 sm:p-7">
              <h2 className="text-base font-semibold text-ink">Template Pesan WhatsApp</h2>
              <p className="mt-0.5 text-xs text-ash">Gunakan {'{nama}'} untuk menyisipkan nama customer</p>
              <textarea
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
                rows={3}
                className="field mt-4 resize-none bg-sunken/50"
              />
              <div className="mt-3 rounded-2xl border border-hairline bg-white p-4">
                <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-mist">Preview</p>
                <p className="text-sm leading-relaxed text-ink-soft">{template.replace('{nama}', 'Budi Santoso')}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Channels */}
        <motion.div variants={fadeUp} custom={3} initial="hidden" animate="show">
          <div className="doppel-outer">
            <div className="doppel-inner p-5 sm:p-7">
              <h2 className="text-base font-semibold text-ink">Channel Order</h2>
              <p className="mt-0.5 text-xs text-ash">Platform yang tersedia untuk pencatatan order</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {['Dine-in', 'Takeaway', 'Gofood', 'Grab', 'Shopee', 'WhatsApp', 'Lainnya'].map((ch) => (
                  <span key={ch} className="rounded-full border border-hairline bg-white px-3.5 py-1.5 text-xs font-medium text-ink-soft">
                    {ch}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Save */}
        <motion.div variants={fadeUp} custom={4} initial="hidden" animate="show">
          <button className="group flex h-13 w-full items-center justify-center gap-3 rounded-full bg-accent text-sm font-semibold text-white transition-all duration-700 hover:-translate-y-px active:scale-[0.98]"
            style={{ boxShadow: '0 8px 24px -8px rgba(47, 108, 255, 0.5)' }}
          >
            <FloppyDisk size={18} weight="bold" />
            <span>Simpan Perubahan</span>
          </button>
        </motion.div>
      </div>
    </main>
  )
}