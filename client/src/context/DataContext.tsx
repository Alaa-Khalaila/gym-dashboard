import { createContext, useContext, useState, type ReactNode } from 'react'
import type { Member, Plan, Subscription } from '../types'
import { MEMBERS, SUBSCRIPTIONS, PLANS, type MemberRow } from '../services/mockData'
import { getSubscriptionStatus, getDaysRemaining } from '../utils/subscription'

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
  getMemberRows: () => MemberRow[]
  getDashboardStats: () => DashboardStats
  getMemberById: (id: string) => Member | undefined
  getSubscriptionsForMember: (memberId: string) => (Subscription & { plan: Plan })[]
  getLatestSubscription: (memberId: string) => (Subscription & { plan: Plan }) | undefined
  addMember: (member: Member, subscription?: Subscription & { plan: Plan }) => void
  updateMember: (id: string, updates: Partial<Member>) => void
  deleteMember: (id: string) => void
  addSubscription: (sub: Subscription & { plan: Plan }) => void
}

const DataContext = createContext<DataContextValue | null>(null)

export function DataProvider({ children }: { children: ReactNode }) {
  const [members, setMembers] = useState<Member[]>(MEMBERS)
  const [subscriptions, setSubscriptions] = useState<(Subscription & { plan: Plan })[]>(SUBSCRIPTIONS)

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
    const expiringSoon = rows.filter((r) => r.status === 'expiring_soon').length
    const newThisMonth = members.filter((m) => m.createdAt >= monthStart).length
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

  function addMember(member: Member, subscription?: Subscription & { plan: Plan }) {
    setMembers((prev) => [...prev, member])
    if (subscription) setSubscriptions((prev) => [...prev, subscription])
  }

  function updateMember(id: string, updates: Partial<Member>) {
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, ...updates } : m)))
  }

  function deleteMember(id: string) {
    setMembers((prev) => prev.filter((m) => m.id !== id))
    setSubscriptions((prev) => prev.filter((s) => s.memberId !== id))
  }

  function addSubscription(sub: Subscription & { plan: Plan }) {
    setSubscriptions((prev) => [...prev, sub])
  }

  return (
    <DataContext.Provider value={{
      members, subscriptions, plans: PLANS,
      getMemberRows, getDashboardStats,
      getMemberById, getSubscriptionsForMember, getLatestSubscription,
      addMember, updateMember, deleteMember, addSubscription,
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
