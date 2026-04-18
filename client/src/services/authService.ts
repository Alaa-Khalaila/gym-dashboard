import type { ApiResponse } from '../types'

interface LoginResponse {
  token: string
}

// Placeholder — replace with real API call when backend is ready
export const authService = {
  async login(email: string, password: string): Promise<ApiResponse<LoginResponse>> {
    // TODO: replace with real API call
    // return apiClient.post('/auth/login', { email, password })

    // Temporary mock for frontend development
    await new Promise((r) => setTimeout(r, 800))

    if (email === 'admin@gym.com' && password === 'password') {
      const mockPayload = {
        sub: '1',
        name: 'Super Admin',
        email: 'admin@gym.com',
        role: 'super_admin',
      }
      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
      const payload = btoa(JSON.stringify(mockPayload))
      const token = `${header}.${payload}.mock_signature`
      return { success: true, data: { token } }
    }

    if (email === 'staff@gym.com' && password === 'password') {
      const mockPayload = {
        sub: '2',
        name: 'Staff Admin',
        email: 'staff@gym.com',
        role: 'admin',
      }
      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
      const payload = btoa(JSON.stringify(mockPayload))
      const token = `${header}.${payload}.mock_signature`
      return { success: true, data: { token } }
    }

    return { success: false, message: 'Invalid credentials' }
  },
}
