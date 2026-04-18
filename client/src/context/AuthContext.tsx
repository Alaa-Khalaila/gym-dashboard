import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react'
import type { AuthState, AuthUser } from '../types'
import { TOKEN_KEY } from '../constants'

type AuthAction =
  | { type: 'LOGIN'; user: AuthUser; token: string }
  | { type: 'LOGOUT' }

function parseToken(token: string): AuthUser | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return {
      id: payload.sub,
      name: payload.name,
      email: payload.email,
      role: payload.role,
    }
  } catch {
    return null
  }
}

function reducer(_state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN':
      return { user: action.user, token: action.token, isAuthenticated: true }
    case 'LOGOUT':
      return { user: null, token: null, isAuthenticated: false }
  }
}

function initState(): AuthState {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    const user = parseToken(token)
    if (user) return { user, token, isAuthenticated: true }
  }
  return { user: null, token: null, isAuthenticated: false }
}

interface AuthContextValue extends AuthState {
  login: (token: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, initState)

  function login(token: string) {
    const user = parseToken(token)
    if (!user) return
    localStorage.setItem(TOKEN_KEY, token)
    dispatch({ type: 'LOGIN', user, token })
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY)
    dispatch({ type: 'LOGOUT' })
  }

  useEffect(() => {
    // Sync across tabs
    function onStorage(e: StorageEvent) {
      if (e.key === TOKEN_KEY && !e.newValue) logout()
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
