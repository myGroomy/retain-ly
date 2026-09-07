export interface AppSettings {
  storeName: string
  activeDays: number
  atRiskDays: number
  waTemplate: string
  customChannels: string[]
}

export const DEFAULT_APP_SETTINGS: AppSettings = {
  storeName: 'Cabang Senopati',
  activeDays: 30,
  atRiskDays: 60,
  waTemplate: 'Halo {nama}, terima kasih sudah order di {toko}! 😊 Ada yang bisa kami bantu?',
  customChannels: ['Dine-in', 'Takeaway', 'GoFood', 'GrabFood', 'ShopeeFood', 'TikTok Shop', 'WhatsApp', 'Lainnya'],
}

const SETTINGS_KEY = 'retainly_settings'

export function getAppSettings(): AppSettings {
  if (typeof window === 'undefined') return DEFAULT_APP_SETTINGS
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return DEFAULT_APP_SETTINGS
    const parsed = JSON.parse(raw)
    return {
      storeName: parsed.storeName || DEFAULT_APP_SETTINGS.storeName,
      activeDays: Number(parsed.activeDays) || DEFAULT_APP_SETTINGS.activeDays,
      atRiskDays: Number(parsed.atRiskDays) || DEFAULT_APP_SETTINGS.atRiskDays,
      waTemplate: parsed.waTemplate || DEFAULT_APP_SETTINGS.waTemplate,
      customChannels: Array.isArray(parsed.customChannels) && parsed.customChannels.length > 0
        ? parsed.customChannels
        : DEFAULT_APP_SETTINGS.customChannels,
    }
  } catch {
    return DEFAULT_APP_SETTINGS
  }
}

export function saveAppSettings(settings: AppSettings): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  window.dispatchEvent(new Event('retainly_settings_changed'))
}
