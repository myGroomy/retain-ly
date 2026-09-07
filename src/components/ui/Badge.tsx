import type { RetentionStatus } from '@/types'
import { getRetentionLabel, getRetentionColor } from '@/utils/churnStatus'

interface BadgeProps {
  status: RetentionStatus
  className?: string
}

export function Badge({ status, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}
      style={{
        backgroundColor: getRetentionColor(status) + '20',
        color: getRetentionColor(status),
      }}
    >
      {getRetentionLabel(status)}
    </span>
  )
}
