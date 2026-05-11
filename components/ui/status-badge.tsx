/**
 * Reusable Status Badge Component
 * Displays status values with proper Prisma enum styling
 */

import { getStatusColor, formatStatusLabel } from '@/lib/status-utils'

interface StatusBadgeProps {
  status: string
  className?: string
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const colorClass = getStatusColor(status)
  const label = formatStatusLabel(status)

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${colorClass} ${className}`}>
      {label}
    </span>
  )
}
