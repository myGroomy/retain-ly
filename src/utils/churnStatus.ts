import { differenceInDays } from 'date-fns'
import type { RetentionStatus, RetentionThresholds } from '@/types'
import { DEFAULT_THRESHOLDS } from '@/constants'

export function getRetentionStatus(
  lastOrderDate: string | Date,
  thresholds: RetentionThresholds = DEFAULT_THRESHOLDS,
): RetentionStatus {
  const now = new Date()
  const lastOrder = typeof lastOrderDate === 'string' ? new Date(lastOrderDate) : lastOrderDate
  const daysSinceLastOrder = differenceInDays(now, lastOrder)

  if (daysSinceLastOrder <= thresholds.activeDays) {
    return 'active'
  }

  if (daysSinceLastOrder <= thresholds.atRiskDays) {
    return 'at_risk'
  }

  return 'churned'
}

export function getRetentionLabel(status: RetentionStatus): string {
  const labels: Record<RetentionStatus, string> = {
    active: 'Active',
    at_risk: 'At Risk',
    churned: 'Churned',
  }
  return labels[status]
}

export function getRetentionColor(status: RetentionStatus): string {
  const colors: Record<RetentionStatus, string> = {
    active: '#16a34a',
    at_risk: '#d97706',
    churned: '#dc2626',
  }
  return colors[status]
}
