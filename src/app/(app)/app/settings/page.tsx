'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FloppyDisk,
  Info,
  Gear,
  Storefront,
  WhatsappLogo,
  Plus,
  Trash,
  Check,
  DownloadSimple,
  Spinner,
} from '@phosphor-icons/react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { syncSettingsFromSheets, saveAppSettings, type AppSettings, DEFAULT_APP_SETTINGS } from '@/services/settingsService'
import { fadeUp } from '@/lib/motion'
import { useMounted } from '@/lib/useMounted'

export default function SettingsPage() {
  const ready = useMounted()
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_APP_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [newChannelInput, setNewChannelInput] = useState('')
  const [savedToast, setSavedToast] = useState(false)
  const [recalculating, setRecalculating] = useState(false)
  const [recalcResult, setRecalcResult] = useState<string | null>(null)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    setLoading(true)
    try {
      const s = await syncSettingsFromSheets()
      setSettings(s)
    } catch {
      // Use defaults
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await saveAppSettings(settings)
      setSavedToast(true)
      setTimeout(() => setSavedToast(false), 2500)
    } catch {
      // Handle error
    } finally {
      setSaving(false)
    }
  }

  const handleAddChannel = () => {
    if (!newChannelInput.trim()) return
    setNewChannelInput('')
  }

  const handleRemoveChannel = (channelName: string) => {
    // Channels are now fixed in the app, this is just for display
  }

  const handleRecalculate = async () => {
    setRecalculating(true)
    setRecalcResult(null)
    try {
      const res = await fetch('/api/orders/recalculate', { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        setRecalcResult(`Selesai. ${data.total_orders} orders, ${data.updated} customer diperbarui.`)
      } else {
        setRecalcResult(`Gagal: ${data.error}`)
      }
    } catch {
      setRecalcResult('Gagal menghubungi server')
    } finally {
      setRecalculating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[70dvh] items-center justify-center">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-ink/15 border-t-accent" />
      </div>
    )
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 md:py-10 pb-28 md:pb-20">
      {/* Toast */}
      <AnimatePresence>
        {savedToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-emerald px-5 py-2.5 text-sm font-semibold text-white shadow-xl shadow-emerald/30"
          >
            <Check size={18} weight="bold" /> Pengaturan Berhasil Disimpan!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Heading */}
      <motion.div variants={fadeUp} custom={0} initial="hidden" animate={ready ? 'show' : 'hidden'} className="mb-8">
        <Badge className="h-auto rounded-full border-hairline bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">Preferensi</Badge>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-ink sm:text-4xl">Pengaturan Aplikasi</h1>
        <p className="mt-1.5 text-xs text-ash sm:text-sm">Kustomisasi identitas toko, ambang retensi, dan template WhatsApp (tersimpan di cloud)</p>
      </motion.div>

      <div className="space-y-5">
        {/* Store Profile */}
        <motion.div variants={fadeUp} custom={1} initial="hidden" animate={ready ? 'show' : 'hidden'}>
          <div className="doppel-outer">
            <div className="doppel-inner p-5 sm:p-7">
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent-wash text-accent">
                  <Storefront size={20} weight="duotone" />
                </span>
                <div>
                  <h2 className="text-base font-semibold text-ink">Identitas Cabang / Toko</h2>
                  <p className="mt-0.5 text-xs text-ash">Nama toko yang akan tampil pada sidebar dan template WA</p>
                </div>
              </div>

              <div>
                <Label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ash">Nama Cabang / Outlet</Label>
                <Input
                  value={settings.storeName}
                  onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                  placeholder="Misal: Cabang Senopati / Outlet Sudirman"
                  className="h-12 text-sm font-medium"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Retention Threshold */}
        <motion.div variants={fadeUp} custom={2} initial="hidden" animate={ready ? 'show' : 'hidden'}>
          <div className="doppel-outer">
            <div className="doppel-inner p-5 sm:p-7">
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent-wash text-accent">
                  <Gear size={20} weight="duotone" />
                </span>
                <div>
                  <h2 className="text-base font-semibold text-ink">Threshold Retensi (Status Churn)</h2>
                  <p className="mt-0.5 text-xs text-ash">Atur batas hari tanpa order untuk mengklasifikasikan status customer</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ash">Batas Active (Hari)</Label>
                  <Input
                    type="number"
                    value={settings.activeDays}
                    onChange={(e) => setSettings({ ...settings, activeDays: Number(e.target.value) || 30 })}
                    className="h-11 bg-sunken/50 font-semibold"
                  />
                  <p className="mt-1.5 text-[11px] text-ash">0 &ndash; {settings.activeDays} hari = <strong className="text-emerald">Active</strong></p>
                </div>
                <div>
                  <Label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ash">Batas At Risk (Hari)</Label>
                  <Input
                    type="number"
                    value={settings.atRiskDays}
                    onChange={(e) => setSettings({ ...settings, atRiskDays: Number(e.target.value) || 60 })}
                    className="h-11 bg-sunken/50 font-semibold"
                  />
                  <p className="mt-1.5 text-[11px] text-ash">{settings.activeDays + 1} &ndash; {settings.atRiskDays} hari = <strong className="text-accent-deep">At Risk</strong></p>
                </div>
              </div>

              <div className="mt-5 flex items-start gap-3 rounded-2xl border border-amber/20 bg-amber/5 p-3.5">
                <Info size={18} weight="duotone" className="mt-0.5 shrink-0 text-accent-deep" />
                <p className="text-xs leading-relaxed text-ash">
                  Customer yang tidak melakukan transaksi lebih dari <strong>{settings.atRiskDays} hari</strong> akan otomatis dimasukkan ke status <strong className="text-ink">Churned</strong> di seluruh dashboard & laporan.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* WhatsApp Message Template */}
        <motion.div variants={fadeUp} custom={3} initial="hidden" animate={ready ? 'show' : 'hidden'}>
          <div className="doppel-outer">
            <div className="doppel-inner p-5 sm:p-7">
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald/10 text-emerald">
                  <WhatsappLogo size={20} weight="fill" />
                </span>
                <div>
                  <h2 className="text-base font-semibold text-ink">Template Pesan WhatsApp Follow-up</h2>
                  <p className="mt-0.5 text-xs text-ash">Variabel yang didukung: <code className="text-accent font-semibold">{'{nama}'}</code> dan <code className="text-accent font-semibold">{'{toko}'}</code></p>
                </div>
              </div>

              <Textarea
                value={settings.waTemplate}
                onChange={(e) => setSettings({ ...settings, waTemplate: e.target.value })}
                rows={3}
                className="resize-none text-sm leading-relaxed"
              />

              <div className="mt-3 rounded-2xl border border-hairline bg-sunken/40 p-4">
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-mist">Preview Hasil Chat WA</p>
                <p className="text-xs leading-relaxed text-ink font-medium">
                  {settings.waTemplate.replace('{nama}', 'Budi Santoso').replace('{toko}', settings.storeName)}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Info about sync */}
        <motion.div variants={fadeUp} custom={4} initial="hidden" animate={ready ? 'show' : 'hidden'}>
          <div className="rounded-2xl border border-accent/20 bg-accent/5 p-4">
            <p className="text-xs text-ash">
              <strong className="text-accent">☁️ Tersimpan di Cloud</strong> — Pengaturan ini disimpan di Google Sheets dan akan sync ke semua perangkat yang login dengan akun yang sama.
            </p>
          </div>
        </motion.div>

        {/* Save Button */}
        <motion.div variants={fadeUp} custom={5} initial="hidden" animate={ready ? 'show' : 'hidden'}>
          <button
            onClick={handleSave}
            disabled={saving}
            className="group flex min-h-[50px] h-13 w-full items-center justify-center gap-3 rounded-full bg-accent text-sm font-semibold text-white transition-all duration-500 hover:-translate-y-px active:scale-[0.98] disabled:opacity-50"
            style={{ boxShadow: '0 8px 24px -8px rgba(27, 44, 193, 0.5)' }}
          >
            {saving ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <>
                <FloppyDisk size={18} weight="bold" />
                <span>Simpan Semua Pengaturan</span>
              </>
            )}
          </button>
        </motion.div>

        {/* Hidden Recalculate (admin tool) */}
        <motion.div variants={fadeUp} custom={6} initial="hidden" animate={ready ? 'show' : 'hidden'} className="mt-8 border-t border-hairline pt-4">
          <button
            onClick={handleRecalculate}
            disabled={recalculating}
            className="text-[11px] text-mist/60 hover:text-mist transition-colors"
          >
            {recalculating ? 'Menghitung ulang order_count...' : 'Recalculate order_count'}
          </button>
          {recalcResult && (
            <p className="mt-1 text-[11px] text-ash">{recalcResult}</p>
          )}
        </motion.div>
      </div>
    </main>
  )
}
