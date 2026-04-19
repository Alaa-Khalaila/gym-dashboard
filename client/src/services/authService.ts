import { apiClient } from './apiClient'
import type { ApiResponse } from '../types'

interface LoginResponse {
  token: string
  user: { id: string; name: string; email: string; role: string }
}

export const authService = {
  async login(email: string, password: string): Promise<ApiResponse<{ token: string }>> {
    const res = await apiClient.post<LoginResponse>('/auth/login', { email, password })
    if (!res.success) return res
    return { success: true, data: { token: res.data.token } }
  },
}
