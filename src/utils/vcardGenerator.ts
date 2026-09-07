export function generateVCard(name: string, phone: string): string {
  const digits = phone.replace(/\D/g, '')
  const formatted = phone.startsWith('0')
    ? phone
    : '0' + digits.slice(digits.startsWith('62') ? 2 : 0)

  return `BEGIN:VCARD
VERSION:3.0
N:${name.split(' ').reverse().join(';')};;;
FN:${name}
TEL;TYPE=CELL:${formatted}
END:VCARD`
}

export function downloadVCard(name: string, phone: string): void {
  const vcard = generateVCard(name, phone)
  const blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${name.replace(/\s+/g, '_')}.vcf`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function generateBulkVCard(
  contacts: Array<{ name: string; phone: string }>,
): string {
  return contacts.map((c) => generateVCard(c.name, c.phone)).join('\n')
}

export function downloadBulkVCard(contacts: Array<{ name: string; phone: string }>): void {
  const vcard = generateBulkVCard(contacts)
  const blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'contacts.vcf'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
