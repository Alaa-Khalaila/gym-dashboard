import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { Member, Plan, Subscription, Gender, PaymentStatus } from '../types'
import { type MemberRow } from '../services/mockData'
import { getSubscriptionStatus, getDaysRemaining } from '../utils/subscription'
import { memberService } from '../services/memberService'
import { subscriptionService } from '../services/subscriptionService'

interface DashboardStats {
  activeMembers: number
  expiringSoon: number
  newThisMonth: number
  revenueThisMonth: number
}

interface DataContextValue {
  members: Member[]
  subscriptions: (Subscription & { plan: Plan })[]
  plans: Plan[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  getMemberRows: () => MemberRow[]
  getDashboardStats: () => DashboardStats
  getMemberById: (id: string) => Member | undefined
  getSubscriptionsForMember: (memberId: string) => (Subscription & { plan: Plan })[]
  getLatestSubscription: (memberId: string) => (Subscription & { plan: Plan }) | undefined
  addMember: (
    memberData: { name: string; phone: string; email?: string; gender: Gender; birthDate?: string; notes?: string },
    subData: { planId: string; startDate: string; paidAmount: number; paymentStatus: PaymentStatus }
  ) => Promise<string>
  updateMember: (id: string, updates: Partial<Omit<Member, 'id' | 'createdAt' | 'createdBy'>>) => Promise<void>
  deleteMember: (id: string) => Promise<void>
  addSubscription: (data: { memberId: string; planId: string; startDate: string; paidAmount: number; paymentStatus: PaymentStatus }) => Promise<void>
  updatePlan: (id: string, price: number) => Promise<void>
}

const DataContext = createContext<DataContextValue | null>(null)

export function DataProvider({ children }: { children: ReactNode }) {
  const [members, setMembers]           = useState<Member[]>([])
  const [subscriptions, setSubscriptions] = useState<(Subscription & { plan: Plan })[]>([])
  const [plans, setPlans]               = useState<Plan[]>([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [m, s, p] = await Promise.allSettled([
        memberService.getAll(),
        subscriptionService.getAll(),
        subscriptionService.getPlans(),
      ])
      if (m.status === 'fulfilled') setMembers(m.value)
      if (s.status === 'fulfilled') setSubscriptions(s.value)
      if (p.status === 'fulfilled') setPlans(p.value)

      const firstFailure = [m, s, p].find((r) => r.status === 'rejected')
      if (firstFailure?.status === 'rejected') {
        setError(firstFailure.reason?.message ?? 'Failed to load some data')
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { refresh() }, [refresh])

  function getMemberRows(): MemberRow[] {
    return members.map((member) => {
      const sub = subscriptions.find((s) => s.memberId === member.id)
      if (!sub) return { member, subscription: undefined, status: 'no_subscription', daysRemaining: 0 }
      const status = getSubscriptionStatus(sub.endDate)
      const daysRemaining = getDaysRemaining(sub.endDate)
      return { member, subscription: sub, status, daysRemaining }
    })
  }

  function getDashboardStats(): DashboardStats {
    const rows = getMemberRows()
    const today = new Date()
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10)
    const activeMembers = rows.filter((r) => r.status === 'active' || r.status === 'expiring_soon').length
    const expiringSoon  = rows.filter((r) => r.status === 'expiring_soon').length
    const newThisMonth  = members.filter((m) => m.createdAt >= monthStart).length
    const revenueThisMonth = subscriptions
      .filter((s) => s.startDate >= monthStart)
      .reduce((sum, s) => sum + s.paidAmount, 0)
    return { activeMembers, expiringSoon, newThisMonth, revenueThisMonth }
  }

  function getMemberById(id: string) {
    return members.find((m) => m.id === id)
  }

  function getSubscriptionsForMember(memberId: string) {
    return subscriptions
      .filter((s) => s.memberId === memberId)
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
  }

  function getLatestSubscription(memberId: string) {
    return getSubscriptionsForMember(memberId)[0]
  }

  async function addMember(
    memberData: { name: string; phone: string; email?: string; gender: Gender; birthDate?: string; notes?: string },
    subData: { planId: string; startDate: string; paidAmount: number; paymentStatus: PaymentStatus }
  ): Promise<string> {
    const member = await memberService.create(memberData)
    setMembers((prev) => [...prev, member])
    const sub = await subscriptionService.create({ memberId: member.id, ...subData })
    setSubscriptions((prev) => [...prev, sub])
    return member.id
  }

  async function updateMember(id: string, updates: Partial<Omit<Member, 'id' | 'createdAt' | 'createdBy'>>) {
    const updated = await memberService.update(id, updates)
    setMembers((prev) => prev.map((m) => (m.id === id ? updated : m)))
  }

  async function deleteMember(id: string) {
    await memberService.remove(id)
    setMembers((prev) => prev.filter((m) => m.id !== id))
    setSubscriptions((prev) => prev.filter((s) => s.memberId !== id))
  }

  async function addSubscription(data: {
    memberId: string; planId: string; startDate: string; paidAmount: number; paymentStatus: PaymentStatus
  }) {
    const sub = await subscriptionService.create(data)
    setSubscriptions((prev) => [...prev, sub])
  }

  async function updatePlan(id: string, price: number) {
    const updated = await subscriptionService.updatePlanPrice(id, price)
    setPlans((prev) => prev.map((p) => (p.id === id ? updated : p)))
  }

  return (
    <DataContext.Provider value={{
      members, subscriptions, plans, loading, error, refresh,
      getMemberRows, getDashboardStats,
      getMemberById, getSubscriptionsForMember, getLatestSubscription,
      addMember, updateMember, deleteMember, addSubscription, updatePlan,
    }}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within DataProvider')
  return ctx
}
