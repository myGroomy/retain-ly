import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Retain-ly',
  description: 'Customer Retention & Order Logger F&B',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-white text-zinc-900 antialiased">
        {children}
      </body>
    </html>
  )
}
