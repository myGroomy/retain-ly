import { describe, it, expect } from 'vitest'
import { buildWaLink } from './waLinkBuilder'

describe('buildWaLink', () => {
  it('should build correct wa.me link from 08xxx', () => {
    const link = buildWaLink('08123456789')
    expect(link).toBe('https://wa.me/628123456789')
  })

  it('should build correct wa.me link from +628xxx', () => {
    const link = buildWaLink('+628123456789')
    expect(link).toBe('https://wa.me/628123456789')
  })

  it('should include message template with name', () => {
    const link = buildWaLink('08123456789', 'Budi')
    expect(link).toContain('wa.me/628123456789?text=')
    expect(link).toContain('Budi')
  })

  it('should not include message if no name', () => {
    const link = buildWaLink('08123456789')
    expect(link).not.toContain('text=')
  })
})
