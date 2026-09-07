import { Link, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'

interface NavLinkProps {
  to: string
  icon: string
  label: string
  badge?: number
  children?: ReactNode
}

function NavLink({ to, icon, label, badge }: NavLinkProps) {
  const location = useLocation()
  const isActive = location.pathname === to

  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 active:scale-[0.98] ${
        isActive
          ? 'bg-zinc-100 text-zinc-900 font-semibold'
          : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
      }`}
    >
      <span
        className={`material-symbols-outlined ${isActive ? 'fill' : ''}`}
        style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
      >
        {icon}
      </span>
      <span className="text-sm">{label}</span>
      {badge !== undefined && (
        <span className="ml-auto bg-amber-50 text-amber-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-amber-200">
          {badge}
        </span>
      )}
    </Link>
  )
}

export function Sidebar() {
  return (
    <aside className="fixed top-0 left-0 h-full w-60 hidden md:flex flex-col bg-white border-r border-zinc-100 z-40">
      <div className="h-full w-60 p-4 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 p-2.5 mb-6">
            <div className="w-9 h-9 rounded-lg bg-zinc-900 text-white flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">storefront</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-zinc-900 truncate">Cabang Senopati</div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                <span className="text-xs text-green-600 font-medium">Online</span>
              </div>
            </div>
          </div>
          <nav className="space-y-0.5">
            <NavLink to="/app" icon="point_of_sale" label="Input Order" />
            <NavLink to="/app/customers" icon="group" label="Customer" />
            <NavLink to="/app/dashboard" icon="analytics" label="Dashboard" />
            <NavLink to="/app/follow-up" icon="checklist" label="Follow-up" />
            <NavLink to="/app/settings" icon="settings" label="Settings" />
          </nav>
        </div>
        <div className="border-t border-zinc-100 pt-3 px-2">
          <div className="text-xs text-zinc-400">Retain-ly v2.4</div>
        </div>
      </div>
    </aside>
  )
}

export function BottomNav() {
  const location = useLocation()

  const tabs = [
    { to: '/app', icon: 'point_of_sale', label: 'Home' },
    { to: '/app/customers', icon: 'group', label: 'Customer' },
    { to: '/app/dashboard', icon: 'analytics', label: 'Dashboard' },
    { to: '/app/follow-up', icon: 'checklist', label: 'Follow-up' },
    { to: '/app/settings', icon: 'settings', label: 'Settings' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-2 h-16 bg-white md:hidden border-t border-zinc-100">
      {tabs.map((tab) => {
        const isActive = location.pathname === tab.to
        return (
          <Link
            key={tab.to}
            to={tab.to}
            className={`flex flex-col items-center justify-center py-1 transition-colors duration-150 active:scale-[0.96] flex-1 ${
              isActive ? 'text-zinc-900 font-semibold' : 'text-zinc-400 hover:text-zinc-600'
            }`}
          >
            <span
              className={`material-symbols-outlined text-[22px] ${isActive ? 'fill' : ''}`}
              style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              {tab.icon}
            </span>
            <span className="text-[10px] font-medium mt-1 uppercase tracking-wider">{tab.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
