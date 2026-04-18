export type Role = 'super_admin' | 'admin'
export type Language = 'en' | 'ar'
export type SubscriptionStatus = 'active' | 'expiring_soon' | 'expired'
export type PaymentStatus = 'paid' | 'unpaid' | 'partial'
export type Gender = 'male' | 'female'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: Role
}

export interface AuthState {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
}

export interface Member {
  id: string
  name: string
  phone: string
  email?: string
  gender: Gender
  birthDate?: string
  notes?: string
  createdAt: string
  createdBy: string
}

export interface Plan {
  id: string
  name: string
  durationMonths: 1 | 3 | 6 | 12
  price: number
  isActive: boolean
}

export interface Subscription {
  id: string
  memberId: string
  planId: string
  startDate: string
  endDate: string
  paidAmount: number
  paymentStatus: PaymentStatus
  createdAt: string
  createdBy: string
}

export interface ApiSuccess<T> {
  success: true
  data: T
}

export interface ApiError {
  success: false
  message: string
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError
