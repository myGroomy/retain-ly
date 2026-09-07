import { describe, it, expect } from 'vitest'
import { getRetentionStatus, getRetentionLabel, getRetentionColor } from './churnStatus'

describe('getRetentionStatus', () => {
  it('should return active for recent orders', () => {
    const lastOrder = new Date()
    lastOrder.setDate(lastOrder.getDate() - 5)
    expect(getRetentionStatus(lastOrder)).toBe('active')
  })

  it('should return at_risk for orders between 31-60 days', () => {
    const lastOrder = new Date()
    lastOrder.setDate(lastOrder.getDate() - 45)
    expect(getRetentionStatus(lastOrder)).toBe('at_risk')
  })

  it('should return churned for old orders', () => {
    const lastOrder = new Date()
    lastOrder.setDate(lastOrder.getDate() - 90)
    expect(getRetentionStatus(lastOrder)).toBe('churned')
  })

  it('should handle string dates', () => {
    const lastOrder = new Date()
    lastOrder.setDate(lastOrder.getDate() - 5)
    expect(getRetentionStatus(lastOrder.toISOString())).toBe('active')
  })
})

describe('getRetentionLabel', () => {
  it('should return correct labels', () => {
    expect(getRetentionLabel('active')).toBe('Active')
    expect(getRetentionLabel('at_risk')).toBe('At Risk')
    expect(getRetentionLabel('churned')).toBe('Churned')
  })
})

describe('getRetentionColor', () => {
  it('should return correct colors', () => {
    expect(getRetentionColor('active')).toBe('#16a34a')
    expect(getRetentionColor('at_risk')).toBe('#d97706')
    expect(getRetentionColor('churned')).toBe('#dc2626')
  })
})
