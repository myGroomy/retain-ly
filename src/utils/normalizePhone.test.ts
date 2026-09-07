import { describe, it, expect } from 'vitest'
import { normalizePhone, isValidPhone } from './normalizePhone'

describe('normalizePhone', () => {
  it('should handle 08xxx format', () => {
    expect(normalizePhone('08123456789')).toBe('08123456789')
  })

  it('should handle +628xxx format', () => {
    expect(normalizePhone('+628123456789')).toBe('08123456789')
  })

  it('should handle 628xxx format', () => {
    expect(normalizePhone('628123456789')).toBe('08123456789')
  })

  it('should handle 8xxx format', () => {
    expect(normalizePhone('8123456789')).toBe('08123456789')
  })

  it('should strip non-numeric characters', () => {
    expect(normalizePhone('0812-345-6789')).toBe('08123456789')
    expect(normalizePhone('+62 812 345 6789')).toBe('08123456789')
    expect(normalizePhone('(0812) 345-6789')).toBe('08123456789')
  })
})

describe('isValidPhone', () => {
  it('should return true for valid phone numbers', () => {
    expect(isValidPhone('08123456789')).toBe(true)
    expect(isValidPhone('081234567890')).toBe(true)
    expect(isValidPhone('+628123456789')).toBe(true)
    expect(isValidPhone('628123456789')).toBe(true)
  })

  it('should return false for invalid phone numbers', () => {
    expect(isValidPhone('123')).toBe(false)
    expect(isValidPhone('abc')).toBe(false)
    expect(isValidPhone('')).toBe(false)
  })
})
