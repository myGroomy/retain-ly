'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  Storefront,
  Basket,
  Users as UsersIcon,
  ChartBar,
  CheckSquare,
  Gear,
  SignOut,
  DotOutline,
} from '@phosphor-icons/react'
import type { ReactNode } from 'react'

interface User {
  username: string
  role: string
}

const NAV_ITEMS = [
  { href: '/app', icon: Basket, label: 'Input Order' },
  { href: '/app/customers', icon: UsersIcon, label: 'Customer' },
  { href: '/app/dashboard', icon: ChartBar, label: 'Dashboard' },
  { href: '/app/follow-up', icon: CheckSquare, label: 'Follow-up' },
  { href: '/app/settings', icon: Gear, label: 'Settings' },
]

function NavLink({ href, icon: Icon, label }: { href: string; icon: React.ElementType; label: string }) {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <Link
      href={href}
      className={`group relative flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm transition-all duration-500 active:scale-[0.98] ${
        isActive
          ? 'bg-white font-semibold text-accent shadow-[0_2px_8px_-4px_rgba(47,108,255,0.4)] ring-1 ring-hairline'
          : 'text-ash hover:bg-sunken hover:text-ink'
      }`}
    >
      {isActive && (
        <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-accent" />
      )}
      <Icon size={20} weight={isActive ? 'fill' : 'regular'} className={isActive ? 'text-accent' : ''} />
      <span>{label}</span>
    </Link>
  )
}

function Sidebar({ user, onLogout }: { user: User | null; onLogout: () => void }) {
  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-full w-64 flex-col p-4 md:flex">
      <div className="doppel-outer flex-1 rounded-[2rem]">
        <div className="doppel-inner flex h-full flex-col justify-between rounded-[calc(2rem-0.375rem)]">
          <div className="flex flex-col gap-6 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent text-white">
                <Storefront size={22} weight="fill" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-ink">Cabang Senopati</div>
                <div className="mt-0.5 flex items-center gap-1.5">
                  <DotOutline size={14} weight="fill" className="text-emerald" />
                  <span className="text-xs font-semibold text-emerald">Online</span>
                </div>
              </div>
            </div>

            <nav className="flex flex-col gap-1">
              {NAV_ITEMS.map((item) => (
                <NavLink key={item.href} {...item} />
              ))}
            </nav>
          </div>

          <div className="border-t border-hairline p-5">
            {user && (
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-wash text-xs font-semibold text-accent-deep">
                    {user.username.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-ink">{user.username}</span>
                </div>
                <button
                  onClick={onLogout}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-hairline text-ash transition-colors duration-300 hover:bg-sunken hover:text-ink"
                  title="Logout"
                >
                  <SignOut size={16} weight="bold" />
                </button>
              </div>
            )}
            <div className="text-xs text-mist">Retain-ly v2.5</div>
          </div>
        </div>
      </div>
    </aside>
  )
}

function BottomNav({ onLogout }: { onLogout: () => void }) {
  const pathname = usePathname()

  return (
    <nav className="fixed inset-x-4 bottom-4 z-50 md:hidden">
      <div className="doppel-outer rounded-[1.75rem]">
        <div className="doppel-inner flex h-16 items-center justify-around rounded-[calc(1.75rem-0.375rem)] px-2">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl py-1.5 transition-all duration-300 active:scale-[0.95] ${
                  isActive ? 'text-white' : 'text-mist'
                }`}
              >
                <span className={`flex h-8 w-12 items-center justify-center rounded-full ${isActive ? 'bg-accent' : ''}`}>
                  <item.icon size={22} weight={isActive ? 'fill' : 'regular'} className={isActive ? 'text-white' : 'text-mist'} />
                </span>
                <span className={`text-[9px] font-medium ${isActive ? 'text-accent' : 'text-ash/70'}`}>{item.label.split(' ')[0]}</span>
              </Link>
            )
          })}
          <button
            onClick={onLogout}
            className="flex flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl py-1.5 text-mist transition-all duration-300 active:scale-[0.95]"
          >
            <SignOut size={22} weight="bold" />
            <span className="text-[9px] font-medium text-ash/70">Keluar</span>
          </button>
        </div>
      </div>
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
    <div className="sky-hero grain relative min-h-[100dvh] md:pl-64">
      <Sidebar user={user} onLogout={handleLogout} />
      <main className="relative pb-28 md:pb-10">{children}</main>
      <BottomNav onLogout={handleLogout} />
    </div>
  )
}