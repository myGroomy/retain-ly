import type { ReactNode } from 'react'
import { Sidebar, BottomNav } from './Navigation'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex-1 flex flex-col md:pl-sidebar-width min-h-screen bg-canvas-soft">
      <Sidebar />
      <main className="flex-1 pb-bottom-nav-height md:pb-0">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
