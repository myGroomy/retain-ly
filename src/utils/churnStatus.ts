import { differenceInDays } from 'date-fns'
import type { RetentionStatus, RetentionThresholds } from '@/types'
import { getAppSettings } from '@/utils/appSettings'

export function getRetentionStatus(
  lastOrderDate: string | Date,
  thresholds?: RetentionThresholds,
): RetentionStatus {
  const settings = getAppSettings()
  const activeDays = thresholds?.activeDays ?? settings.activeDays
  const atRiskDays = thresholds?.atRiskDays ?? settings.atRiskDays

  const now = new Date()
  const lastOrder = typeof lastOrderDate === 'string' ? new Date(lastOrderDate) : lastOrderDate
  const daysSinceLastOrder = differenceInDays(now, lastOrder)

  if (daysSinceLastOrder <= activeDays) {
    return 'active'
  }

  if (daysSinceLastOrder <= atRiskDays) {
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