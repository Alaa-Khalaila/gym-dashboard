import type { Member, Plan, Subscription } from '../types'
import { getSubscriptionStatus, getDaysRemaining } from '../utils/subscription'

export const PLANS: Plan[] = [
  { id: 'p1', name: '1 Month', durationMonths: 1, price: 50, isActive: true },
  { id: 'p2', name: '3 Months', durationMonths: 3, price: 120, isActive: true },
  { id: 'p3', name: '6 Months', durationMonths: 6, price: 200, isActive: true },
  { id: 'p4', name: '12 Months', durationMonths: 12, price: 350, isActive: true },
]

export const MEMBERS: Member[] = [
  { id: 'm1',  name: 'John Smith',      phone: '+1 (555) 123-4567', email: 'john.smith@email.com',    gender: 'male',   createdAt: '2026-01-20', createdBy: '1' },
  { id: 'm2',  name: 'Sarah Johnson',   phone: '+1 (555) 234-5678', email: 'sarah.j@email.com',       gender: 'female', createdAt: '2026-03-21', createdBy: '1' },
  { id: 'm3',  name: 'Mike Davis',      phone: '+1 (555) 345-6789', email: 'mike.davis@email.com',    gender: 'male',   createdAt: '2025-10-23', createdBy: '1' },
  { id: 'm4',  name: 'Emily Brown',     phone: '+1 (555) 456-7890', email: 'emily.b@email.com',       gender: 'female', createdAt: '2026-03-24', createdBy: '1' },
  { id: 'm5',  name: 'Alex Wilson',     phone: '+1 (555) 567-8901', email: 'alex.w@email.com',        gender: 'male',   createdAt: '2026-01-25', createdBy: '1' },
  { id: 'm6',  name: 'Ryan Thompson',   phone: '+1 (555) 678-9012', email: 'ryan.t@email.com',        gender: 'male',   createdAt: '2025-12-01', createdBy: '1' },
  { id: 'm7',  name: 'Nicole Martinez', phone: '+1 (555) 789-0123', email: 'nicole.m@email.com',      gender: 'female', createdAt: '2026-03-15', createdBy: '1' },
  { id: 'm8',  name: 'Chris Anderson',  phone: '+1 (555) 111-2222', email: 'chris.a@email.com',       gender: 'male',   createdAt: '2026-04-10', createdBy: '1' },
  { id: 'm9',  name: 'Laura White',     phone: '+1 (555) 333-4444', email: 'laura.w@email.com',       gender: 'female', createdAt: '2026-01-20', createdBy: '1' },
  { id: 'm10', name: 'David Miller',    phone: '+1 (555) 555-6666', email: 'david.m@email.com',       gender: 'male',   createdAt: '2026-04-01', createdBy: '1' },
  { id: 'm11', name: 'Jessica Lee',     phone: '+1 (555) 777-8888', email: 'jessica.l@email.com',     gender: 'female', createdAt: '2026-02-15', createdBy: '1' },
  { id: 'm12', name: 'Marcus Johnson',  phone: '+1 (555) 999-0000', email: 'marcus.j@email.com',      gender: 'male',   createdAt: '2025-11-01', createdBy: '1' },
  { id: 'm13', name: 'Amanda Garcia',   phone: '+1 (555) 121-3434', email: 'amanda.g@email.com',      gender: 'female', createdAt: '2026-02-20', createdBy: '1' },
  { id: 'm14', name: 'James Brown',     phone: '+1 (555) 565-7878', email: 'james.b@email.com',       gender: 'male',   createdAt: '2026-04-05', createdBy: '1' },
  { id: 'm15', name: 'Sophia Martinez', phone: '+1 (555) 909-1212', email: 'sophia.m@email.com',      gender: 'female', createdAt: '2025-12-18', createdBy: '1' },
  { id: 'm16', name: 'Emma Davis',      phone: '+1 (555) 343-5656', email: 'emma.d@email.com',        gender: 'female', createdAt: '2026-04-02', createdBy: '1' },
  { id: 'm17', name: 'Tom Wilson',      phone: '+1 (555) 787-9090', email: 'tom.w@email.com',         gender: 'male',   createdAt: '2026-04-08', createdBy: '1' },
  { id: 'm18', name: 'Mia Brown',       phone: '+1 (555) 232-4545', email: 'mia.b@email.com',         gender: 'female', createdAt: '2026-04-12', createdBy: '1' },
]

export const SUBSCRIPTIONS: (Subscription & { plan: Plan })[] = [
  { id: 's1',  memberId: 'm1',  planId: 'p2', plan: PLANS[1], startDate: '2026-01-20', endDate: '2026-04-20', paidAmount: 120, paymentStatus: 'paid', createdAt: '2026-01-20', createdBy: '1' },
  { id: 's2',  memberId: 'm2',  planId: 'p1', plan: PLANS[0], startDate: '2026-03-21', endDate: '2026-04-21', paidAmount: 50,  paymentStatus: 'paid', createdAt: '2026-03-21', createdBy: '1' },
  { id: 's3',  memberId: 'm3',  planId: 'p3', plan: PLANS[2], startDate: '2025-10-23', endDate: '2026-04-23', paidAmount: 200, paymentStatus: 'paid', createdAt: '2025-10-23', createdBy: '1' },
  { id: 's4',  memberId: 'm4',  planId: 'p1', plan: PLANS[0], startDate: '2026-03-24', endDate: '2026-04-24', paidAmount: 50,  paymentStatus: 'paid', createdAt: '2026-03-24', createdBy: '1' },
  { id: 's5',  memberId: 'm5',  planId: 'p2', plan: PLANS[1], startDate: '2026-01-25', endDate: '2026-04-25', paidAmount: 120, paymentStatus: 'paid', createdAt: '2026-01-25', createdBy: '1' },
  { id: 's6',  memberId: 'm6',  planId: 'p4', plan: PLANS[3], startDate: '2025-12-01', endDate: '2026-12-01', paidAmount: 350, paymentStatus: 'paid', createdAt: '2025-12-01', createdBy: '1' },
  { id: 's7',  memberId: 'm7',  planId: 'p3', plan: PLANS[2], startDate: '2026-03-15', endDate: '2026-09-15', paidAmount: 200, paymentStatus: 'paid', createdAt: '2026-03-15', createdBy: '1' },
  { id: 's8',  memberId: 'm8',  planId: 'p1', plan: PLANS[0], startDate: '2026-04-10', endDate: '2026-05-10', paidAmount: 50,  paymentStatus: 'paid', createdAt: '2026-04-10', createdBy: '1' },
  { id: 's9',  memberId: 'm9',  planId: 'p4', plan: PLANS[3], startDate: '2026-01-20', endDate: '2027-01-20', paidAmount: 350, paymentStatus: 'paid', createdAt: '2026-01-20', createdBy: '1' },
  { id: 's10', memberId: 'm10', planId: 'p2', plan: PLANS[1], startDate: '2026-04-01', endDate: '2026-07-01', paidAmount: 120, paymentStatus: 'paid', createdAt: '2026-04-01', createdBy: '1' },
  { id: 's11', memberId: 'm11', planId: 'p1', plan: PLANS[0], startDate: '2026-02-15', endDate: '2026-03-15', paidAmount: 50,  paymentStatus: 'paid', createdAt: '2026-02-15', createdBy: '1' },
  { id: 's12', memberId: 'm12', planId: 'p2', plan: PLANS[1], startDate: '2025-11-01', endDate: '2026-02-01', paidAmount: 120, paymentStatus: 'paid', createdAt: '2025-11-01', createdBy: '1' },
  { id: 's13', memberId: 'm13', planId: 'p3', plan: PLANS[2], startDate: '2026-02-20', endDate: '2026-08-20', paidAmount: 200, paymentStatus: 'paid', createdAt: '2026-02-20', createdBy: '1' },
  { id: 's14', memberId: 'm14', planId: 'p1', plan: PLANS[0], startDate: '2026-04-05', endDate: '2026-05-05', paidAmount: 50,  paymentStatus: 'paid', createdAt: '2026-04-05', createdBy: '1' },
  { id: 's15', memberId: 'm15', planId: 'p4', plan: PLANS[3], startDate: '2025-12-18', endDate: '2026-12-18', paidAmount: 350, paymentStatus: 'paid', createdAt: '2025-12-18', createdBy: '1' },
  { id: 's16', memberId: 'm16', planId: 'p3', plan: PLANS[2], startDate: '2026-04-02', endDate: '2026-10-02', paidAmount: 200, paymentStatus: 'paid', createdAt: '2026-04-02', createdBy: '1' },
  { id: 's17', memberId: 'm17', planId: 'p2', plan: PLANS[1], startDate: '2026-04-08', endDate: '2026-07-08', paidAmount: 120, paymentStatus: 'paid', createdAt: '2026-04-08', createdBy: '1' },
  { id: 's18', memberId: 'm18', planId: 'p4', plan: PLANS[3], startDate: '2026-04-12', endDate: '2027-04-12', paidAmount: 350, paymentStatus: 'paid', createdAt: '2026-04-12', createdBy: '1' },
]

export interface MemberRow {
  member: Member
  subscription: (Subscription & { plan: Plan }) | undefined
  status: 'active' | 'expiring_soon' | 'expired' | 'no_subscription'
  daysRemaining: number
}

export function getMemberRows(): MemberRow[] {
  return MEMBERS.map((member) => {
    const sub = SUBSCRIPTIONS.find((s) => s.memberId === member.id)
    if (!sub) return { member, subscription: undefined, status: 'no_subscription', daysRemaining: 0 }
    const status = getSubscriptionStatus(sub.endDate)
    const daysRemaining = getDaysRemaining(sub.endDate)
    return { member, subscription: sub, status, daysRemaining }
  })
}

export function getDashboardStats() {
  const rows = getMemberRows()
  const today = new Date()
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10)

  const activeMembers = rows.filter((r) => r.status === 'active' || r.status === 'expiring_soon').length
  const expiringSoon = rows.filter((r) => r.status === 'expiring_soon').length
  const newThisMonth = MEMBERS.filter((m) => m.createdAt >= monthStart).length
  const revenueThisMonth = SUBSCRIPTIONS
    .filter((s) => s.startDate >= monthStart)
    .reduce((sum, s) => sum + s.paidAmount, 0)

  return { activeMembers, expiringSoon, newThisMonth, revenueThisMonth }
}
