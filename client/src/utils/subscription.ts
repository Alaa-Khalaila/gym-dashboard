import { differenceInDays } from 'date-fns'
import type { SubscriptionStatus } from '../types'

export function getSubscriptionStatus(endDate: string): SubscriptionStatus {
  const end = new Date(endDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const days = differenceInDays(end, today)
  if (days < 0) return 'expired'
  if (days <= 7) return 'expiring_soon'
  return 'active'
}

export function getDaysRemaining(endDate: string): number {
  const end = new Date(endDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return differenceInDays(end, today)
}

export function isActiveOrExpiring(status: SubscriptionStatus): boolean {
  return status === 'active' || status === 'expiring_soon'
}
