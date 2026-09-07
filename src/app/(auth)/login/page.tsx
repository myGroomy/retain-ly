'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Store, ArrowRight } from 'lucide-react'
import { supabase } from '@/services/supabaseClient'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [pin, setPin] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

    const pinCode = pin.join('')

    const { data, error: queryError } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .eq('pin', pinCode)
      .single()

    if (queryError || !data) {
      setError('Username atau PIN salah')
    } else {
      localStorage.setItem('retainly_user', JSON.stringify(data))
      window.location.href = '/app'
    }
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="sticky top-0 z-50 border-b border-zinc-100 bg-white/80 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-7xl items-center px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900">
              <Store className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-semibold tracking-tight">Retain-ly</span>
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 pt-16">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold tracking-tight">Masuk ke Terminal Kasir</h1>
            <p className="mt-2 text-sm text-zinc-500">Gunakan akun kasir Anda</p>
          </div>

          <div className="rounded-2xl border border-zinc-200 p-6 shadow-sm">
            <form className="space-y-5" onSubmit={handleLogin}>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-700" htmlFor="username">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username"
                  className="h-11 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-0 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-700">PIN (6 Digit)</label>
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
                      className="h-12 w-12 rounded-lg border border-zinc-200 bg-zinc-50 text-center text-lg font-semibold text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-0 transition-colors"
                    />
                  ))}
                </div>
              </div>

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 text-sm font-medium text-white hover:bg-zinc-800 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {loading ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <span>Masuk</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          <p className="mt-6 text-center text-sm text-zinc-400">
            <Link href="/" className="text-zinc-500 hover:text-zinc-700 transition-colors">
              &larr; Kembali ke beranda
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
