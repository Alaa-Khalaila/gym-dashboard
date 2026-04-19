import { apiClient } from './apiClient'
import type { Member, Gender, PaymentStatus } from '../types'

function normalizeMember(raw: Record<string, unknown>): Member {
  return {
    id:        raw.id as string,
    name:      raw.name as string,
    phone:     raw.phone as string,
    email:     raw.email as string | undefined,
    gender:    raw.gender as Gender,
    birthDate: raw.birthDate ? (raw.birthDate as string).slice(0, 10) : undefined,
    notes:     raw.notes as string | undefined,
    createdAt: (raw.createdAt as string).slice(0, 10),
    createdBy: raw.createdById as string,
  }
}

async function unwrap<T>(call: Promise<{ success: boolean; data?: T; message?: string }>): Promise<T> {
  const res = await call
  if (!res.success) throw new Error((res as { message: string }).message)
  return (res as { success: true; data: T }).data
}

export const memberService = {
  async getAll(): Promise<Member[]> {
    const raw = await unwrap(apiClient.get<Record<string, unknown>[]>('/members'))
    return raw.map(normalizeMember)
  },

  async getById(id: string): Promise<Member> {
    const raw = await unwrap(apiClient.get<Record<string, unknown>>(`/members/${id}`))
    return normalizeMember(raw)
  },

  async create(data: {
    name: string
    phone: string
    email?: string
    gender: Gender
    birthDate?: string
    notes?: string
  }): Promise<Member> {
    const raw = await unwrap(apiClient.post<Record<string, unknown>>('/members', data))
    return normalizeMember(raw)
  },

  async update(id: string, data: Partial<Omit<Member, 'id' | 'createdAt' | 'createdBy'>>): Promise<Member> {
    const raw = await unwrap(apiClient.put<Record<string, unknown>>(`/members/${id}`, data))
    return normalizeMember(raw)
  },

  async remove(id: string): Promise<void> {
    await unwrap(apiClient.delete<null>(`/members/${id}`))
  },
}

export type CreateSubscriptionInput = {
  planId: string
  startDate: string
  paidAmount: number
  paymentStatus: PaymentStatus
}
