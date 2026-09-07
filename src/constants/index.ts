import type { Channel, RetentionThresholds } from '@/types'

export const CHANNELS: Channel[] = [
  { id: 'dine_in', label: 'Dine-in' },
  { id: 'takeaway', label: 'Takeaway' },
  { id: 'gofood', label: 'Gofood' },
  { id: 'grab', label: 'Grab' },
  { id: 'shopee', label: 'Shopee' },
  { id: 'whatsapp', label: 'WhatsApp' },
  { id: 'custom', label: 'Lainnya' },
]

export const DEFAULT_THRESHOLDS: RetentionThresholds = {
  activeDays: Number(process.env.NEXT_PUBLIC_DEFAULT_CHURN_ACTIVE_DAYS) || 30,
  atRiskDays: Number(process.env.NEXT_PUBLIC_DEFAULT_CHURN_AT_RISK_DAYS) || 60,
}

export const PAGE_SIZE = 20

export const WHATSAPP_TEMPLATE =
  'Halo {nama}, terima kasih sudah order di toko kami! 😊 Ada yang bisa kami bantu?'

export const APP_NAME = 'Retain-ly'
