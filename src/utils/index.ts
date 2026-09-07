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
