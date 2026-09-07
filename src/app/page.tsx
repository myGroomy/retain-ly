'use client'

import Link from 'next/link'
import {
  Storefront,
  ArrowRight,
  ArrowUpRight,
  Receipt,
  UsersThree,
  ChartBar,
  WhatsappLogo,
  Lightning,
  ShieldCheck,
} from '@phosphor-icons/react'

const FEATURES = [
  {
    icon: Receipt,
    title: 'Catat Order Sekali Ketuk',
    desc: 'Rekam transaksi dari semua channel — dine-in, takeaway, Gofood, Grab, Shopee — dalam satu layar.',
  },
  {
    icon: UsersThree,
    title: 'Database Customer Otomatis',
    desc: 'Setiap order otomatis membangun profil customer. Nomor WhatsApp ter-normalize, siap dihubungi.',
  },
  {
    icon: ChartBar,
    title: 'Retensi Real-Time',
    desc: 'Lihat siapa yang aktif, siapa yang mulai jarang, dan siapa yang sudah hilang — semua tersegmentasi otomatis.',
  },
  {
    icon: WhatsappLogo,
    title: 'Follow-up via WhatsApp',
    desc: 'Satu ketik untuk kirim pesan WhatsApp. Tanpa copy-paste, tanpa aplikasi tambahan.',
  },
]

const STEPS = [
  { num: '01', title: 'Buka Terminal Kasir', desc: 'Login dengan PIN cabang Anda. Tidak perlu install aplikasi baru.' },
  { num: '02', title: 'Catat Setiap Order', desc: 'Ketik nama atau nomor HP, pilih channel, selesai. Data tersimpan otomatis.' },
  { num: '03', title: 'Pantau & Follow-up', desc: 'Dashboard retensi memberi tahu siapa yang perlu dihubungi hari ini.' },
]

const METRICS = [
  { value: '120+', label: 'Outlet Aktif' },
  { value: '45k+', label: 'Customer Terpantau' },
  { value: '73%', label: 'Repeat Rate' },
  { value: '2.4x', label: 'Order per Customer' },
]

export default function LandingPage() {
  return (
    <div className="min-h-dvh bg-canvas">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-hairline bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-[0.9rem] bg-accent text-white" style={{ boxShadow: '0 6px 16px -6px rgba(47, 108, 255, 0.55)' }}>
              <Storefront size={18} weight="fill" />
            </div>
            <span className="text-lg font-semibold tracking-tight text-ink">Retain-ly</span>
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
            {[
              ['Fitur', '#features'],
              ['Cara Kerja', '#how-it-works'],
              ['Harga', '#pricing'],
            ].map(([label, href]) => (
              <a key={href} href={href} className="text-sm font-medium text-ash transition-colors duration-300 hover:text-ink">
                {label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden text-sm font-semibold text-ink-soft transition-colors duration-300 hover:text-ink sm:inline-flex">
              Masuk
            </Link>
            <Link href="/login" className="btn-primary group">
              Daftar
              <ArrowRight size={15} weight="bold" className="transition-transform duration-500 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="sky-hero px-4 pb-16 pt-20 sm:px-6 sm:pb-20 sm:pt-28 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <span className="eyebrow mb-6">
            <span className="mr-1.5 h-1.5 w-1.5 animate-pulse rounded-full bg-emerald" />
            Dipakai oleh 120+ outlet F&B
          </span>

          <h1 className="text-4xl font-semibold tracking-tight text-ink sm:text-5xl lg:text-6xl">
            Jangan sampai pelanggan{' '}
            <span className="text-accent">lupa</span> balik lagi.
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-ash sm:text-lg">
            Retain-ly membantu bisnis F&B melacak repeat order dan menghubungi
            pelanggan yang mulai jarang datang — lewat WhatsApp.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/login" className="btn-primary group px-8 py-3.5 text-base">
              Mulai Sekarang
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 transition-transform duration-500 group-hover:translate-x-0.5">
                <ArrowRight size={14} weight="bold" />
              </span>
            </Link>
            <a href="#features" className="btn-ghost group px-6 py-3.5 text-base">
              Lihat Fitur
              <ArrowUpRight size={16} weight="bold" className="transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </div>

          {/* Product Preview */}
          <div className="mt-16 sm:mt-20">
            <div className="doppel-outer mx-auto max-w-4xl rounded-[2.25rem] p-2.5">
              <div className="overflow-hidden rounded-[calc(2.25rem-0.75rem)] border border-hairline bg-white">
                <div className="flex items-center gap-2 border-b border-hairline bg-white px-5 py-3.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose/40" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber/40" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald/40" />
                  <div className="ml-4 flex-1 rounded-lg bg-sunken px-3 py-1.5 text-left font-mono text-xs text-ash">
                    retainly.app/app
                  </div>
                </div>
                <div className="grid grid-cols-12 gap-5 bg-canvas p-5 sm:p-7">
                  <div className="col-span-3 hidden border-r border-hairline pr-5 sm:block">
                    <div className="space-y-2">
                      {[
                        ['Input Order', false],
                        ['Customer', false],
                        ['Dashboard', true],
                        ['Follow-up', false],
                        ['Settings', false],
                      ].map(([item, active]) => (
                        <div
                          key={item as string}
                          className={`flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm transition-colors duration-300 ${
                            active ? 'bg-accent text-white font-semibold shadow-[0_6px_16px_-6px_rgba(47,108,255,0.5)]' : 'text-ash'
                          }`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-white/60' : 'bg-mist/50'}`} />
                          {item as string}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="col-span-12 sm:col-span-9">
                    <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {[
                        ['Total Customer', '1,247', 'text-ink'],
                        ['Repeat Rate', '73%', 'text-accent'],
                        ['At Risk', '89', 'text-amber-600'],
                        ['Churned', '34', 'text-rose-600'],
                      ].map(([label, value, hue]) => (
                        <div key={label as string} className="rounded-2xl border border-hairline bg-white p-3 sm:p-4">
                          <div className="text-[10px] font-semibold uppercase tracking-wider text-ash sm:text-xs">{label as string}</div>
                          <div className={`mt-1 text-xl font-semibold tracking-tight sm:text-2xl ${hue as string}`}>{value as string}</div>
                        </div>
                      ))}
                    </div>
                    <div className="rounded-2xl border border-hairline bg-white p-4">
                      <div className="mb-3 text-sm font-semibold text-ink">Segmentasi Customer</div>
                      <div className="space-y-3">
                        {[
                          { label: 'Active', color: 'bg-emerald', width: '65%' },
                          { label: 'At Risk', color: 'bg-amber', width: '25%' },
                          { label: 'Churned', color: 'bg-rose', width: '10%' },
                        ].map((seg) => (
                          <div key={seg.label}>
                            <div className="mb-1 flex items-center justify-between text-xs">
                              <span className="text-ash">{seg.label}</span>
                            </div>
                            <div className="h-2 w-full overflow-hidden rounded-full bg-sunken">
                              <div className={`h-full rounded-full ${seg.color}`} style={{ width: seg.width }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-hairline bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-12 sm:px-6 md:grid-cols-4 lg:px-8">
          {METRICS.map((m) => (
            <div key={m.label} className="text-center">
              <div className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">{m.value}</div>
              <div className="mt-1 text-sm text-ash">{m.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center sm:mb-16">
            <span className="eyebrow">Fitur</span>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              Satu layar, semua data pelanggan.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-ash sm:text-lg">
              Tidak perlu Excel, tidak perlu catatan manual. Semua tersimpan otomatis.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-6">
            {FEATURES.map((f) => {
              const Icon = f.icon
              return (
                <div
                  key={f.title}
                  className="group rounded-3xl border border-hairline bg-white p-6 transition-all duration-500 hover:-translate-y-1 hover:border-accent/25 hover:shadow-[0_16px_40px_-20px_rgba(47,108,255,0.3)]"
                >
                  <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-accent-wash text-accent transition-all duration-500 group-hover:bg-accent group-hover:text-white group-hover:shadow-[0_6px_16px_-6px_rgba(47,108,255,0.5)]">
                    <Icon size={22} weight="duotone" />
                  </div>
                  <h3 className="mb-2 text-base font-semibold text-ink sm:text-lg">{f.title}</h3>
                  <p className="text-sm leading-relaxed text-ash sm:text-base">{f.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="bg-white px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center sm:mb-16">
            <span className="eyebrow">Cara Kerja</span>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              Tiga langkah, selesai.
            </h2>
            <p className="mt-4 text-base text-ash sm:text-lg">
              Tidak perlu training panjang. Tim Anda bisa langsung pakai.
            </p>
          </div>

          <div className="grid gap-6 sm:gap-8 md:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.num} className="text-center md:text-left">
                <div className="mb-4 text-5xl font-bold text-accent/15 select-none sm:text-6xl">{s.num}</div>
                <h3 className="mb-2 text-lg font-semibold text-ink sm:text-xl">{s.title}</h3>
                <p className="text-sm leading-relaxed text-ash sm:text-base">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Retain-ly */}
      <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center sm:mb-16">
            <span className="eyebrow">Keunggulan</span>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              Kenapa Retain-ly?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-ash sm:text-lg">
              Dirancang khusus untuk bisnis F&B Indonesia.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Lightning,
                title: 'Setup 2 Menit',
                desc: 'Tanpa install aplikasi. Langsung buka dari browser HP kasir Anda.',
              },
              {
                icon: ShieldCheck,
                title: 'Data Aman',
                desc: 'Semua data tersimpan di cloud dengan enkripsi. Tidak perlu khawatir kehilangan.',
              },
              {
                icon: WhatsappLogo,
                title: 'Follow-up Otomatis',
                desc: 'Kirim pesan WhatsApp personal ke pelanggan yang mulai jarang datang.',
              },
            ].map((f) => {
              const Icon = f.icon
              return (
                <div
                  key={f.title}
                  className="doppel-outer transition-all duration-500 hover:-translate-y-1"
                >
                  <div className="doppel-inner flex flex-col gap-3 p-6 sm:p-8">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent-wash text-accent">
                      <Icon size={22} weight="duotone" />
                    </span>
                    <h3 className="mb-1 mt-2 text-lg font-semibold text-ink">{f.title}</h3>
                    <p className="text-sm leading-relaxed text-ash sm:text-base">{f.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="pricing" className="px-4 pb-24 pt-8 sm:px-6 sm:pb-28 lg:px-8">
        <div className="doppel-outer mx-auto max-w-4xl rounded-[2.5rem]">
          <div className="doppel-inner rounded-[calc(2.5rem-0.375rem)] px-6 py-14 text-center sm:py-16">
            <span className="eyebrow">Mulai Sekarang</span>
            <h2 className="mx-auto mt-5 max-w-2xl text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              Siap mempertahankan pelanggan Anda?
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-base text-ash sm:text-lg">
              Mulai gratis. Tidak perlu kartu kredit. Setup dalam 2 menit.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/login" className="btn-primary group px-8 py-4 text-lg">
                Mulai Sekarang
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 transition-transform duration-500 group-hover:translate-x-0.5">
                  <ArrowRight size={15} weight="bold" />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-hairline px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-sm text-ash sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-wash text-accent">
              <Storefront size={14} weight="fill" />
            </div>
            <span className="font-medium text-ink-soft">Retain-ly</span>
          </div>
          <div>&copy; {new Date().getFullYear()} Retain-ly. Semua hak dilindungi.</div>
        </div>
      </footer>
    </div>
  )
}