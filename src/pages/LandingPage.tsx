import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
}

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
}

const FEATURES = [
  {
    icon: 'receipt_long',
    title: 'Catat Order Sekali Ketuk',
    desc: 'Rekam transaksi dari semua channel — dine-in, takeaway, Gofood, Grab, Shopee — dalam satu layar.',
  },
  {
    icon: 'group',
    title: 'Database Customer Otomatis',
    desc: 'Setiap order otomatis membangun profil customer. Nomor WhatsApp ter-normalize, siap dihubungi.',
  },
  {
    icon: 'analytics',
    title: 'Retensi Real-Time',
    desc: 'Lihat siapa yang aktif, siapa yang mulai jarang, dan siapa yang sudah hilang — semua tersegmentasi otomatis.',
  },
  {
    icon: 'chat',
    title: 'Follow-up via WhatsApp',
    desc: 'Satu ketik untuk kirim pesan WhatsApp. Tanpa copy-paste, tanpa aplikasi tambahan.',
  },
]

const STEPS = [
  { num: '01', title: 'Buka Terminal Kasir', desc: 'Login dengan PIN cabang Anda. Tidak perlu install aplikasi baru.' },
  { num: '02', title: 'Catat Setiap Order', desc: 'Ketik nama atau nomor HP, pilih channel, selesai. Data tersimpan otomatis.' },
  { num: '03', title: 'Pantau & Follow-up', desc: 'Dashboard retensi memberi tahu siapa yang perlu dihubungi hari ini.' },
]

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans antialiased">
      {/* Nav */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-zinc-100"
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-[18px]">storefront</span>
            </div>
            <span className="text-lg font-semibold tracking-tight">Retain-ly</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
            >
              Masuk
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-zinc-900 text-white text-sm font-medium rounded-full hover:bg-zinc-800 active:scale-[0.98] transition-all"
            >
              Coba Gratis
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full text-sm text-green-700 font-medium mb-6"
          >
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
            Sudah dipakai oleh 120+ outlet F&B
          </motion.div>
          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.1] mb-6"
          >
            Jangan sampai pelanggan{' '}
            <span className="text-green-600">lupa</span> balik lagi.
          </motion.h1>
          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-lg sm:text-xl text-zinc-500 max-w-2xl mx-auto leading-relaxed mb-8"
          >
            Retain-ly membantu bisnis F&B melacak repeat order dan menghubungi pelanggan yang mulai jarang datang — lewat WhatsApp.
          </motion.p>
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-900 text-white text-base font-medium rounded-full hover:bg-zinc-800 active:scale-[0.98] transition-all shadow-lg shadow-zinc-900/10"
            >
              Mulai Sekarang
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
            <a
              href="#features"
              className="inline-flex items-center gap-2 px-6 py-3 text-zinc-600 text-base font-medium hover:text-zinc-900 transition-colors"
            >
              Lihat Fitur
              <span className="material-symbols-outlined text-[18px]">expand_more</span>
            </a>
          </motion.div>
        </div>
      </section>

      {/* Metrics strip */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.6 }}
        className="border-y border-zinc-100 bg-zinc-50/50"
      >
        <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: '120+', label: 'Outlet Aktif' },
            { value: '45k+', label: 'Customer Terpantau' },
            { value: '73%', label: 'Repeat Rate Rata-rata' },
            { value: '2.4x', label: 'Order per Customer' },
          ].map((m, i) => (
            <motion.div
              key={m.label}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="text-center"
            >
              <div className="text-3xl sm:text-4xl font-bold tracking-tight">{m.value}</div>
              <div className="text-sm text-zinc-500 mt-1">{m.label}</div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Satu layar, semua data pelanggan.</h2>
            <p className="text-lg text-zinc-500 max-w-xl mx-auto">Tidak perlu Excel, tidak perlu catatan manual. Semua tersimpan otomatis.</p>
          </motion.div>
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {FEATURES.map((f) => (
              <motion.div
                key={f.title}
                variants={fadeUp}
                transition={{ duration: 0.4 }}
                className="group p-6 rounded-2xl border border-zinc-100 hover:border-zinc-200 hover:shadow-lg hover:shadow-zinc-100/50 transition-all duration-300"
              >
                <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-white text-[20px]">{f.icon}</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-zinc-500 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6 bg-zinc-50">
        <div className="max-w-5xl mx-auto">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Tiga langkah, selesai.</h2>
            <p className="text-lg text-zinc-500">Tidak perlu training panjang. Tim Anda bisa langsung pakai.</p>
          </motion.div>
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {STEPS.map((s) => (
              <motion.div
                key={s.num}
                variants={fadeUp}
                transition={{ duration: 0.4 }}
                className="relative"
              >
                <div className="text-6xl font-bold text-zinc-100 mb-4">{s.num}</div>
                <h3 className="text-xl font-semibold mb-2">{s.title}</h3>
                <p className="text-zinc-500 leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.h2
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl sm:text-4xl font-bold tracking-tight mb-4"
          >
            Siap mempertahankan pelanggan Anda?
          </motion.h2>
          <motion.p
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-zinc-500 mb-8 max-w-lg mx-auto"
          >
            Mulai gratis. Tidak perlu kartu kredit. Setup dalam 2 menit.
          </motion.p>
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-8 py-4 bg-zinc-900 text-white text-lg font-medium rounded-full hover:bg-zinc-800 active:scale-[0.98] transition-all shadow-xl shadow-zinc-900/10"
            >
              Mulai Sekarang
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-100 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-zinc-400">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-zinc-200 rounded flex items-center justify-center">
              <span className="material-symbols-outlined text-zinc-500 text-[14px]">storefront</span>
            </div>
            <span>Retain-ly</span>
          </div>
          <div>&copy; {new Date().getFullYear()} Retain-ly. Semua hak dilindungi.</div>
        </div>
      </footer>
    </div>
  )
}
