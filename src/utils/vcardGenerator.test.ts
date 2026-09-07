import { describe, it, expect } from 'vitest'
import { generateVCard } from './vcardGenerator'

describe('generateVCard', () => {
  it('should generate valid vCard format', () => {
    const vcard = generateVCard('Budi Santoso', '08123456789')
    expect(vcard).toContain('BEGIN:VCARD')
    expect(vcard).toContain('END:VCARD')
    expect(vcard).toContain('VERSION:3.0')
    expect(vcard).toContain('FN:Budi Santoso')
    expect(vcard).toContain('TEL;TYPE=CELL:08123456789')
  })

  it('should handle name with multiple words', () => {
    const vcard = generateVCard('Budi Santoso Pratama', '08123456789')
    expect(vcard).toContain('FN:Budi Santoso Pratama')
  })
})
