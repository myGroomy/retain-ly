import Link from 'next/link'
import {
  Store,
  ArrowRight,
  Receipt,
  Users,
  BarChart3,
  MessageCircle,
  ChevronRight,
  CheckCircle2,
  Zap,
  Shield,
} from 'lucide-react'

const FEATURES = [
  {
    icon: Receipt,
    title: 'Catat Order Sekali Ketuk',
    desc: 'Rekam transaksi dari semua channel — dine-in, takeaway, Gofood, Grab, Shopee — dalam satu layar.',
  },
  {
    icon: Users,
    title: 'Database Customer Otomatis',
    desc: 'Setiap order otomatis membangun profil customer. Nomor WhatsApp ter-normalize, siap dihubungi.',
  },
  {
    icon: BarChart3,
    title: 'Retensi Real-Time',
    desc: 'Lihat siapa yang aktif, siapa yang mulai jarang, dan siapa yang sudah hilang — semua tersegmentasi otomatis.',
  },
  {
    icon: MessageCircle,
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
    <div className="min-h-screen bg-white">

      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-zinc-100 bg-white/80 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900">
              <Store className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-semibold tracking-tight">Retain-ly</span>
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors">
              Fitur
            </a>
            <a href="#how-it-works" className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors">
              Cara Kerja
            </a>
            <a href="#pricing" className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors">
              Harga
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors sm:inline-flex"
            >
              Masuk
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 active:scale-[0.98] transition-all"
            >
              Daftar
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="px-4 pt-20 pb-16 sm:px-6 sm:pt-28 sm:pb-20 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-1.5 text-sm font-medium text-green-700">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            Sudah dipakai oleh 120+ outlet F&B
          </div>

          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Jangan sampai pelanggan{' '}
            <span className="text-green-600">lupa</span> balik lagi.
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base text-zinc-500 sm:text-lg leading-relaxed">
            Retain-ly membantu bisnis F&B melacak repeat order dan menghubungi
            pelanggan yang mulai jarang datang — lewat WhatsApp.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-6 py-3 text-base font-medium text-white shadow-lg shadow-zinc-900/10 hover:bg-zinc-800 active:scale-[0.98] transition-all"
            >
              Mulai Sekarang
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#features"
              className="inline-flex items-center gap-2 px-6 py-3 text-base font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
            >
              Lihat Fitur
              <ChevronRight className="h-4 w-4" />
            </a>
          </div>

          {/* Product Preview */}
          <div className="mt-16 sm:mt-20">
            <div className="relative mx-auto max-w-4xl overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50 shadow-2xl shadow-zinc-200/50">
              <div className="flex items-center gap-2 border-b border-zinc-200 bg-white px-4 py-3">
                <div className="h-3 w-3 rounded-full bg-zinc-200" />
                <div className="h-3 w-3 rounded-full bg-zinc-200" />
                <div className="h-3 w-3 rounded-full bg-zinc-200" />
                <div className="ml-4 flex-1 rounded-md bg-zinc-100 px-3 py-1.5 text-xs text-zinc-400">
                  retainly.app/app
                </div>
              </div>
              <div className="grid grid-cols-12 gap-4 p-4 sm:gap-6 sm:p-6">
                <div className="col-span-3 hidden border-r border-zinc-200 pr-4 sm:block">
                  <div className="space-y-2">
                    {['Input Order', 'Customer', 'Dashboard', 'Follow-up', 'Settings'].map((item, i) => (
                      <div
                        key={item}
                        className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                          i === 2 ? 'bg-zinc-900 text-white font-medium' : 'text-zinc-500'
                        }`}
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="col-span-12 sm:col-span-9">
                  <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {['Total Customer', 'Repeat Rate', 'At Risk', 'Churned'].map((label) => (
                      <div key={label} className="rounded-xl border border-zinc-200 bg-white p-3 sm:p-4">
                        <div className="text-[10px] font-medium uppercase tracking-wider text-zinc-400 sm:text-xs">
                          {label}
                        </div>
                        <div className="mt-1 text-xl font-bold sm:text-2xl">
                          {label === 'Total Customer' ? '1,247' : label === 'Repeat Rate' ? '73%' : label === 'At Risk' ? '89' : '34'}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-xl border border-zinc-200 bg-white p-4">
                    <div className="mb-3 text-sm font-semibold">Segmentasi Customer</div>
                    <div className="space-y-3">
                      {[
                        { label: 'Active', color: 'bg-green-500', width: '65%' },
                        { label: 'At Risk', color: 'bg-amber-500', width: '25%' },
                        { label: 'Churned', color: 'bg-red-400', width: '10%' },
                      ].map((seg) => (
                        <div key={seg.label}>
                          <div className="mb-1 flex items-center justify-between text-xs">
                            <span className="text-zinc-500">{seg.label}</span>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100">
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
      </section>

      {/* Stats Bar */}
      <section className="border-y border-zinc-100 bg-zinc-50/50">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-10 sm:px-6 md:grid-cols-4 lg:px-8">
          {METRICS.map((m) => (
            <div key={m.label} className="text-center">
              <div className="text-3xl font-bold tracking-tight sm:text-4xl">{m.value}</div>
              <div className="mt-1 text-sm text-zinc-500">{m.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center sm:mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Satu layar, semua data pelanggan.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-zinc-500 sm:text-lg">
              Tidak perlu Excel, tidak perlu catatan manual. Semua tersimpan otomatis.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-6">
            {FEATURES.map((f) => {
              const Icon = f.icon
              return (
                <div
                  key={f.title}
                  className="group rounded-2xl border border-zinc-100 p-5 transition-all duration-300 hover:border-zinc-200 hover:shadow-lg hover:shadow-zinc-100/50 sm:p-6"
                >
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 transition-transform group-hover:scale-110">
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="mb-2 text-base font-semibold sm:text-lg">{f.title}</h3>
                  <p className="text-sm leading-relaxed text-zinc-500 sm:text-base">{f.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="bg-zinc-50 px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center sm:mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Tiga langkah, selesai.
            </h2>
            <p className="mt-4 text-base text-zinc-500 sm:text-lg">
              Tidak perlu training panjang. Tim Anda bisa langsung pakai.
            </p>
          </div>

          <div className="grid gap-6 sm:gap-8 md:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.num}>
                <div className="mb-4 text-5xl font-bold text-zinc-100 select-none sm:text-6xl">
                  {s.num}
                </div>
                <h3 className="mb-2 text-lg font-semibold sm:text-xl">{s.title}</h3>
                <p className="text-sm leading-relaxed text-zinc-500 sm:text-base">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Retain-ly */}
      <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center sm:mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Kenapa Retain-ly?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-zinc-500 sm:text-lg">
              Dirancang khusus untuk bisnis F&B Indonesia.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Zap,
                title: 'Setup 2 Menit',
                desc: 'Tanpa install aplikasi. Langsung buka dari browser HP kasir Anda.',
              },
              {
                icon: Shield,
                title: 'Data Aman',
                desc: 'Semua data tersimpan di cloud dengan enkripsi. Tidak perlu khawatir kehilangan.',
              },
              {
                icon: MessageCircle,
                title: 'Follow-up Otomatis',
                desc: 'Kirim pesan WhatsApp personal ke pelanggan yang mulai jarang datang.',
              },
            ].map((f) => {
              const Icon = f.icon
              return (
                <div
                  key={f.title}
                  className="rounded-2xl border border-zinc-100 p-6 transition-all hover:border-zinc-200 hover:shadow-md sm:p-8"
                >
                  <Icon className="mb-4 h-6 w-6 text-zinc-900" />
                  <h3 className="mb-2 text-lg font-semibold">{f.title}</h3>
                  <p className="text-sm leading-relaxed text-zinc-500 sm:text-base">{f.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="pricing" className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Siap mempertahankan pelanggan Anda?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-base text-zinc-500 sm:text-lg">
            Mulai gratis. Tidak perlu kartu kredit. Setup dalam 2 menit.
          </p>
          <div className="mt-8">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-8 py-4 text-lg font-medium text-white shadow-xl shadow-zinc-900/10 hover:bg-zinc-800 active:scale-[0.98] transition-all"
            >
              Mulai Sekarang
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-100 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-sm text-zinc-400 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-zinc-200">
              <Store className="h-3.5 w-3.5 text-zinc-500" />
            </div>
            <span>Retain-ly</span>
          </div>
          <div>&copy; {new Date().getFullYear()} Retain-ly. Semua hak dilindungi.</div>
        </div>
      </footer>
    </div>
  )
}
