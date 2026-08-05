import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { apiRequest, jsonBody } from '@/api/client'
import type { AdminUser } from '@/api/types'

interface AuthState {
  user: AdminUser | null
  loading: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)
  const refresh = useCallback(async () => {
    try { setUser(await apiRequest<AdminUser>('/api/auth/me')) } catch { setUser(null) } finally { setLoading(false) }
  }, [])
  useEffect(() => { refresh(); const expired = () => setUser(null); window.addEventListener('auth-expired', expired); return () => window.removeEventListener('auth-expired', expired) }, [refresh])
  const login = async (username: string, password: string) => setUser(await apiRequest<AdminUser>('/api/auth/login', { method: 'POST', ...jsonBody({ username, password }) }))
  const logout = async () => { try { await apiRequest<void>('/api/auth/logout', { method: 'POST' }) } finally { setUser(null) } }
  return <AuthContext.Provider value={{ user, loading, login, logout, refresh }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth must be used inside AuthProvider')
  return value
}

