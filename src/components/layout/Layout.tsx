import type { ReactNode } from 'react'
import { Sidebar, BottomNav } from './Navigation'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex-1 flex flex-col md:pl-60 min-h-screen bg-zinc-50">
      <Sidebar />
      <main className="flex-1 pb-16 md:pb-0">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
