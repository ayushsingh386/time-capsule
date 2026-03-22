import React, { createContext, useContext, useEffect, useState } from 'react'
import api from '../lib/api'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: 'student' | 'teacher' | 'admin'
  batch_id: string | null
  avatar_url?: string
}

interface AuthContextType {
  user: AuthUser | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, role: string, batchId?: string, branch?: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem('tc_token')
    const storedUser = localStorage.getItem('tc_user')
    if (storedToken && storedUser) {
      setToken(storedToken)
      try {
        setUser(JSON.parse(storedUser))
      } catch {
        localStorage.removeItem('tc_user')
      }
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password })
    const { token: jwt, user: userData } = res.data
    localStorage.setItem('tc_token', jwt)
    localStorage.setItem('tc_user', JSON.stringify(userData))
    setToken(jwt)
    setUser(userData)
  }

  const register = async (name: string, email: string, password: string, role: string, batchId?: string, branch?: string) => {
    const res = await api.post('/auth/register', { name, email, password, role, batch_id: batchId, branch })
    const { token: jwt, user: userData } = res.data
    localStorage.setItem('tc_token', jwt)
    localStorage.setItem('tc_user', JSON.stringify(userData))
    setToken(jwt)
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('tc_token')
    localStorage.removeItem('tc_user')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{
      user, token, loading, login, register, logout,
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
