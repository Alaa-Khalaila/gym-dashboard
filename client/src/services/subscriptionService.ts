import { apiClient } from './apiClient'
import type { Plan, Subscription, PaymentStatus } from '../types'

function normalizePlan(raw: Record<string, unknown>): Plan {
  return {
    id:             raw.id as string,
    name:           raw.name as string,
    durationMonths: raw.durationMonths as 1 | 3 | 6 | 12,
    price:          raw.price as number,
    isActive:       raw.isActive as boolean,
  }
}

function normalizeSub(raw: Record<string, unknown>): Subscription & { plan: Plan } {
  const plan = normalizePlan(raw.plan as Record<string, unknown>)
  return {
    id:            raw.id as string,
    memberId:      raw.memberId as string,
    planId:        raw.planId as string,
    startDate:     (raw.startDate as string).slice(0, 10),
    endDate:       (raw.endDate as string).slice(0, 10),
    paidAmount:    raw.paidAmount as number,
    paymentStatus: raw.paymentStatus as PaymentStatus,
    createdAt:     (raw.createdAt as string).slice(0, 10),
    createdBy:     raw.createdById as string,
    plan,
  }
}

async function unwrap<T>(call: Promise<{ success: boolean; data?: T; message?: string }>): Promise<T> {
  const res = await call
  if (!res.success) throw new Error((res as { message: string }).message)
  return (res as { success: true; data: T }).data
}

export const subscriptionService = {
  async getPlans(): Promise<Plan[]> {
    const raw = await unwrap(apiClient.get<Record<string, unknown>[]>('/subscriptions/plans'))
    return raw.map(normalizePlan)
  },

  async getAll(): Promise<(Subscription & { plan: Plan })[]> {
    const raw = await unwrap(apiClient.get<Record<string, unknown>[]>('/subscriptions'))
    return raw.map(normalizeSub)
  },

  async create(data: {
    memberId: string
    planId: string
    startDate: string
    paidAmount: number
    paymentStatus: PaymentStatus
  }): Promise<Subscription & { plan: Plan }> {
    const raw = await unwrap(apiClient.post<Record<string, unknown>>('/subscriptions', data))
    return normalizeSub(raw)
  },

  async updatePlanPrice(id: string, price: number): Promise<Plan> {
    const raw = await unwrap(apiClient.patch<Record<string, unknown>>(`/subscriptions/plans/${id}/price`, { price }))
    return normalizePlan(raw)
  },
}
