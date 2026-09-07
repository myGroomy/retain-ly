import { useMemo } from 'react'
import type { CustomerWithStats, RetentionStatus } from '@/types'
import { getRetentionStatus } from '@/utils/churnStatus'
import { DEFAULT_THRESHOLDS } from '@/constants'

export function useChurnSegments(customers: CustomerWithStats[]) {
  return useMemo(() => {
    const segments: Record<RetentionStatus, CustomerWithStats[]> = {
      active: [],
      at_risk: [],
      churned: [],
    }

    for (const customer of customers) {
      const status = getRetentionStatus(customer.last_order_date, DEFAULT_THRESHOLDS)
      segments[status].push({ ...customer, retention_status: status })
    }

    return {
      segments,
      active: segments.active,
      atRisk: segments.at_risk,
      churned: segments.churned,
      total: customers.length,
    }
  }, [customers])
}
