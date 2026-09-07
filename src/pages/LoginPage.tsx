import { useState } from 'react'
import { supabase } from '@/services/supabaseClient'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [pin, setPin] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [, setError] = useState<string | null>(null)

  const handlePinChange = (index: number, value: string) => {
    if (value.length > 1) return
    const newPin = [...pin]
    newPin[index] = value
    setPin(newPin)
    if (value && index < 5) {
      const next = document.getElementById(`pin-${index + 1}`)
      next?.focus()
    }
  }

  const handlePinKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      const prev = document.getElementById(`pin-${index - 1}`)
      prev?.focus()
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const password = pin.join('')
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) setError(authError.message)
    setLoading(false)
  }

  return (
    <div className="bg-canvas-base text-text-ink min-h-screen flex flex-col font-body-md text-body-md antialiased selection:bg-surface-subtle selection:text-text-ink">
      <header className="w-full bg-canvas-base">
        <div className="max-w-container-max-width mx-auto px-gutter-mobile md:px-gutter-desktop h-top-nav-height flex items-center justify-between">
          <div className="flex items-center gap-xs">
            <span className="material-symbols-outlined text-text-ink text-[20px]">storefront</span>
            <span className="text-caption font-caption text-text-body">POS Station #04</span>
          </div>
          <div className="flex items-center gap-xs">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-caption-uppercase font-caption-uppercase text-semantic-active bg-semantic-active-surface border border-semantic-active-border">
              <span className="w-1.5 h-1.5 rounded-full bg-semantic-active animate-pulse"></span>
              Terminal Online
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col justify-center items-center px-gutter-mobile py-8 md:py-12">
        <div className="w-full max-w-form-max-width">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-surface-dark text-canvas-base mb-4">
              <span className="material-symbols-outlined text-[24px]">point_of_sale</span>
            </div>
            <div className="flex items-center justify-center gap-2 mb-1.5">
              <h1 className="text-headline-lg font-headline-lg text-text-ink tracking-tight">Retain-ly</h1>
              <span className="px-2 py-0.5 rounded-full text-caption-uppercase font-caption-uppercase bg-surface-subtle border border-hairline-strong text-text-ink">Branch Terminal</span>
            </div>
            <p className="text-body-sm font-body-sm text-text-body">Customer Retention & Order Logger F&B</p>
          </div>

          <div className="bg-surface-card border border-hairline-strong rounded-xl p-6 md:p-8">
            <div className="mb-6">
              <h2 className="text-headline-sm font-headline-sm text-text-ink">Autentikasi Cabang</h2>
              <p className="text-caption font-caption text-text-body mt-0.5">Gunakan kredensial resmi outlet untuk membuka sesi kasir harian.</p>
            </div>

            <form className="space-y-4" onSubmit={handleLogin}>
              <div className="space-y-1.5">
                <label className="block text-caption font-caption text-text-ink font-medium" htmlFor="email">Username Cabang</label>
                <div className="relative">
                  <input
                    id="email"
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="misal: senopati_pos"
                    className="w-full h-11 px-3.5 bg-canvas-base border border-hairline-strong rounded-lg text-body-md font-body-md text-text-ink placeholder:text-text-muted focus:border-text-ink focus:outline-none transition-colors duration-150"
                    required
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-text-muted">
                    <span className="material-symbols-outlined text-[18px]">badge</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-caption font-caption text-text-ink font-medium">PIN Cabang (6 Digit)</label>
                  <span className="text-[10px] text-text-muted">Hanya angka</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  {pin.map((digit, i) => (
                    <input
                      key={i}
                      id={`pin-${i}`}
                      type="password"
                      maxLength={1}
                      inputMode="numeric"
                      pattern="[0-9]"
                      value={digit}
                      onChange={(e) => handlePinChange(i, e.target.value)}
                      onKeyDown={(e) => handlePinKeyDown(i, e)}
                      className="w-12 h-12 text-center text-[20px] font-semibold bg-canvas-base border border-hairline-strong rounded-lg text-text-ink focus:border-text-ink focus:outline-none transition-colors duration-150"
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-hairline-strong text-primary focus:ring-0" />
                  <span className="text-caption font-caption text-text-body">Kunci sesi di perangkat ini</span>
                </label>
                <span className="text-caption font-caption text-text-muted">ID: SEN-04</span>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-cta-black hover:bg-cta-black-active active:scale-[0.99] text-text-on-dark rounded-lg text-button font-button flex items-center justify-center gap-2 transition-all duration-150 disabled:opacity-50"
                >
                  {loading ? (
                    <span className="inline-block w-4 h-4 border-2 border-text-on-dark border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <>
                      <span>Masuk ke Kasir</span>
                      <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6 pt-5 border-t border-hairline-default text-center">
              <a className="text-caption font-caption text-text-body hover:text-text-ink hover:underline inline-flex items-center gap-1.5 transition-colors" href="#">
                <span className="material-symbols-outlined text-[16px]">support_agent</span>
                <span>Lupa PIN cabang? Hubungi Manajer</span>
              </a>
            </div>
          </div>

          <div className="mt-5 p-3.5 bg-canvas-soft border border-hairline-default rounded-lg flex items-start gap-3">
            <span className="material-symbols-outlined text-text-muted text-[18px] mt-0.5">info</span>
            <p className="text-caption font-caption text-text-body">
              Akun ini ditautkan khusus pada device kasir outlet <strong className="text-text-ink font-semibold">Senopati Kitchen</strong>. Sesi kasir aktif akan merekam riwayat repeat order dan auto-sync ke WhatsApp blast engine.
            </p>
          </div>
        </div>
      </main>

      <footer className="w-full bg-canvas-base py-4 border-t border-hairline-default">
        <div className="max-w-container-max-width mx-auto px-gutter-mobile md:px-gutter-desktop flex flex-col sm:flex-row items-center justify-between gap-2 text-caption font-caption text-text-muted">
          <div className="flex items-center gap-2">
            <span className="font-medium text-text-ink">Retain-ly Terminal</span>
            <span>•</span>
            <span>PWA Build v2.4.1 (Sync Engine r18)</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-semantic-active"></span>
              <span className="text-text-body">Database: Terhubung (Jakarta Cloud Node)</span>
            </div>
            <span className="hidden sm:inline text-hairline-strong">|</span>
            <span className="text-text-body">Latensi: 24ms</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
