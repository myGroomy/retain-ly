import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: 'Retain-ly — Jangan sampai pelanggan lupa balik lagi',
  description: 'Catatan kasir yang jadi database pelanggan & pelacak retensi bisnis F&B.',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.png', type: 'image/png' },
    ],
    shortcut: '/favicon.png',
    apple: '/brand-assets/logo-icon.png',
  },
  openGraph: {
    title: 'Retain-ly — Pelacak Retensi Bisnis F&B',
    description: 'Jangan sampai pelanggan lupa balik lagi. Rekam transaksi kasir jadi database pelanggan otomatis.',
    images: [
      {
        url: '/brand-assets/logo-full.png',
        width: 1200,
        height: 600,
        alt: 'Retain-ly Logo',
      },
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" className={cn("font-sans", geist.variable)}>
      <body className={`min-h-screen antialiased ${GeistSans.variable} ${GeistMono.variable}`}>
        {children}
      </body>
    </html>
  )
}
