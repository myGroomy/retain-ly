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
          ? 'bg-surface-subtle text-primary font-semibold'
          : 'text-text-body hover:bg-surface-subtle hover:text-text-ink'
      }`}
    >
      <span
        className={`material-symbols-outlined ${isActive ? 'fill' : ''}`}
        style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
      >
        {icon}
      </span>
      <span className="font-body-md text-body-md">{label}</span>
      {badge !== undefined && (
        <span className="ml-auto bg-semantic-risk-surface text-semantic-risk text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-semantic-risk-border">
          {badge}
        </span>
      )}
    </Link>
  )
}

export function Sidebar() {
  return (
    <aside className="fixed top-0 left-0 h-full w-sidebar-width hidden md:flex flex-col bg-canvas-base border-r border-hairline-default z-40">
      <div className="h-full w-sidebar-width p-4 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 p-2.5 mb-6 rounded-lg bg-surface-subtle">
            <div className="w-10 h-10 rounded-lg bg-cta-black text-on-primary flex items-center justify-center font-headline-sm text-headline-sm">
              <span className="material-symbols-outlined">storefront</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-headline-sm text-headline-sm text-text-ink truncate leading-tight">Cabang Senopati</div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-semantic-active animate-pulse"></span>
                <span className="font-caption text-caption text-semantic-active font-medium">Online</span>
                <span className="font-caption text-caption text-text-body">• Store #04</span>
              </div>
            </div>
          </div>
          <p className="font-caption-uppercase text-caption-uppercase text-text-muted px-3 mb-2 tracking-wider">TERMINAL KASIR</p>
          <nav className="space-y-1">
            <NavLink to="/" icon="point_of_sale" label="Input Order" />
            <NavLink to="/customers" icon="group" label="Customer List" />
            <NavLink to="/dashboard" icon="analytics" label="Retention Dashboard" />
            <NavLink to="/follow-up" icon="checklist" label="Daily Follow-up" />
            <NavLink to="/settings" icon="settings" label="Settings" />
          </nav>
        </div>
        <div className="border-t border-hairline-default pt-3 px-2">
          <div className="font-caption text-caption text-text-body">F&B Counter Terminal</div>
          <div className="font-caption-uppercase text-caption-uppercase text-text-muted mt-0.5">Retain-ly POS Core v2.4</div>
        </div>
      </div>
    </aside>
  )
}

export function BottomNav() {
  const location = useLocation()

  const tabs = [
    { to: '/', icon: 'point_of_sale', label: 'Home' },
    { to: '/customers', icon: 'group', label: 'Customer' },
    { to: '/dashboard', icon: 'analytics', label: 'Dashboard' },
    { to: '/follow-up', icon: 'checklist', label: 'Follow-up' },
    { to: '/settings', icon: 'settings', label: 'Settings' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-2 h-bottom-nav-height bg-canvas-base md:hidden shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
      {tabs.map((tab) => {
        const isActive = location.pathname === tab.to
        return (
          <Link
            key={tab.to}
            to={tab.to}
            className={`flex flex-col items-center justify-center py-1 transition-colors duration-150 active:scale-[0.96] flex-1 ${
              isActive ? 'text-primary font-semibold' : 'text-text-muted hover:text-primary'
            }`}
          >
            <span
              className={`material-symbols-outlined text-[22px] ${isActive ? 'fill' : ''}`}
              style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              {tab.icon}
            </span>
            <span className="font-caption-uppercase text-caption-uppercase mt-1">{tab.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
