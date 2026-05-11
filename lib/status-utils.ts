/**
 * Utility functions for status badge styling and formatting
 */

import { STATUS_COLOR_MAP } from '@/lib/types'

export function getStatusColor(status: string): string {
  return STATUS_COLOR_MAP[status] || 'bg-gray-100 text-gray-800'
}

export function formatStatusLabel(status: string): string {
  // Convert ACTIVE_USER to "Active User", BORROWED to "Borrowed"
  return status
    .split('_')
    .map(word => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ')
}

export function getStatusBadgeClass(status: string): string {
  return `inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(status)}`
}
