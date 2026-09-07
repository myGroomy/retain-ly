'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  Store,
  ShoppingCart,
  Users,
  BarChart3,
  CheckSquare,
  Settings,
  LogOut,
} from 'lucide-react'
import type { ReactNode } from 'react'

interface User {
  username: string
  role: string
}

const NAV_ITEMS = [
  { href: '/app', icon: ShoppingCart, label: 'Input Order' },
  { href: '/app/customers', icon: Users, label: 'Customer' },
  { href: '/app/dashboard', icon: BarChart3, label: 'Dashboard' },
  { href: '/app/follow-up', icon: CheckSquare, label: 'Follow-up' },
  { href: '/app/settings', icon: Settings, label: 'Settings' },
]

function NavLink({ href, icon: Icon, label }: { href: string; icon: React.ElementType; label: string }) {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all active:scale-[0.98] ${
        isActive
          ? 'bg-zinc-100 font-semibold text-zinc-900'
          : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
      }`}
    >
      <Icon className="h-5 w-5" />
      <span>{label}</span>
    </Link>
  )
}

function Sidebar({ user, onLogout }: { user: User | null; onLogout: () => void }) {
  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-full w-60 flex-col border-r border-zinc-100 bg-white md:flex">
      <div className="flex h-full w-60 flex-col justify-between p-4">
        <div>
          <div className="mb-6 flex items-center gap-3 p-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900 text-white">
              <Store className="h-4.5 w-4.5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="truncate text-sm font-semibold text-zinc-900">Cabang Senopati</div>
              <div className="mt-0.5 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                <span className="text-xs font-medium text-green-600">Online</span>
              </div>
            </div>
          </div>
          <nav className="space-y-0.5">
            {NAV_ITEMS.map((item) => (
              <NavLink key={item.href} {...item} />
            ))}
          </nav>
        </div>
        <div className="border-t border-zinc-100 px-2 pt-3">
          {user && (
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-500">{user.username}</span>
              <button
                onClick={onLogout}
                className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors"
                title="Logout"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
          <div className="text-xs text-zinc-400">Retain-ly v2.4</div>
        </div>
      </div>
    </aside>
  )
}

function BottomNav({ onLogout }: { onLogout: () => void }) {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 z-50 flex h-16 w-full items-center justify-around border-t border-zinc-100 bg-white md:hidden">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-1 flex-col items-center justify-center py-1 transition-colors active:scale-[0.96] ${
              isActive ? 'font-semibold text-zinc-900' : 'text-zinc-400'
            }`}
          >
            <item.icon className="h-[22px] w-[22px]" />
            <span className="mt-1 text-[10px] font-medium uppercase tracking-wider">{item.label}</span>
          </Link>
        )
      })}
      <button
        onClick={onLogout}
        className="flex flex-1 flex-col items-center justify-center py-1 text-zinc-400 transition-colors active:scale-[0.96]"
      >
        <LogOut className="h-[22px] w-[22px]" />
        <span className="mt-1 text-[10px] font-medium uppercase tracking-wider">Keluar</span>
      </button>
    </nav>
  )
}

export default function AppLayout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('retainly_user')
    if (!stored) {
      router.replace('/login')
      return
    }
    setUser(JSON.parse(stored))
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('retainly_user')
    router.replace('/login')
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 md:pl-60">
      <Sidebar user={user} onLogout={handleLogout} />
      <main className="flex-1 pb-16 md:pb-0">{children}</main>
      <BottomNav onLogout={handleLogout} />
    </div>
  )
}
