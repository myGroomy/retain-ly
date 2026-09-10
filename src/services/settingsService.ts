import { getSheetData, appendRow, updateRow } from './sheetsService'

const SETTINGS_SHEET = 'settings'
const SETTINGS_KEY = 'retainly_settings'

export interface AppSettings {
  storeName: string
  activeDays: number
  atRiskDays: number
  waTemplate: string
}

export const DEFAULT_APP_SETTINGS: AppSettings = {
  storeName: 'Cabang Senopati',
  activeDays: 30,
  atRiskDays: 60,
  waTemplate: 'Halo {nama}, terima kasih sudah order di {toko}! 😊 Ada yang bisa kami bantu?',
}

// Convert rows to key-value object
function rowsToSettings(rows: Record<string, string>[]): AppSettings {
  const map = new Map(rows.map(r => [r.key, r.value]))

  return {
    storeName: map.get('storeName') || DEFAULT_APP_SETTINGS.storeName,
    activeDays: parseInt(map.get('activeDays') || '') || DEFAULT_APP_SETTINGS.activeDays,
    atRiskDays: parseInt(map.get('atRiskDays') || '') || DEFAULT_APP_SETTINGS.atRiskDays,
    waTemplate: map.get('waTemplate') || DEFAULT_APP_SETTINGS.waTemplate,
  }
}

// Get settings from localStorage (fast, synchronous)
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
    }
  } catch {
    return DEFAULT_APP_SETTINGS
  }
}

// Save settings to localStorage (fast, synchronous)
function saveToLocalStorage(settings: AppSettings): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  window.dispatchEvent(new Event('retainly_settings_changed'))
}

// Sync settings FROM Sheets to localStorage
export async function syncSettingsFromSheets(): Promise<AppSettings> {
  try {
    const rows = await getSheetData(SETTINGS_SHEET)
    if (rows.length > 0) {
      const settings = rowsToSettings(rows)
      saveToLocalStorage(settings)
      return settings
    }
  } catch {
    // Fallback to localStorage
  }
  return getAppSettings()
}

// Save settings TO Sheets AND localStorage
export async function saveAppSettings(settings: AppSettings): Promise<void> {
  // Save to localStorage first (instant)
  saveToLocalStorage(settings)

  // Then save to Sheets (async)
  try {
    const rows = await getSheetData(SETTINGS_SHEET)
    const map = new Map(rows.map((r, idx) => [r.key, idx]))

    const updates = [
      { key: 'storeName', value: settings.storeName },
      { key: 'activeDays', value: String(settings.activeDays) },
      { key: 'atRiskDays', value: String(settings.atRiskDays) },
      { key: 'waTemplate', value: settings.waTemplate },
    ]

    for (const item of updates) {
      const existingIndex = map.get(item.key)
      if (existingIndex !== undefined) {
        await updateRow(SETTINGS_SHEET, existingIndex, { key: item.key, value: item.value })
      } else {
        await appendRow(SETTINGS_SHEET, { key: item.key, value: item.value })
      }
    }
  } catch {
    // localStorage already saved, Sheets sync will happen later
  }
}
