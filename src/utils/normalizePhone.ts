/**
 * Normalize Indonesian phone number to 08xxxxxxxxx format.
 * Handles: 08xxx, +628xxx, 628xxx, 8xxx
 */
export function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '')

  if (digits.startsWith('62')) {
    return '0' + digits.slice(2)
  }

  if (digits.startsWith('8')) {
    return '0' + digits
  }

  if (digits.startsWith('0')) {
    return digits
  }

  return digits
}

export function isValidPhone(raw: string): boolean {
  const normalized = normalizePhone(raw)
  return /^08\d{8,13}$/.test(normalized)
}
