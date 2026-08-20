import React, { createContext, useContext, useState, useEffect } from 'react'
import { create } from 'zustand'
import type { User } from '../types'
import { api } from '../lib/api'

// Auth store
interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (data: { username: string; password: string }) => Promise<void>
  register: (data: { username: string; password: string; email: string }) => Promise<void>
  logout: () => void
  fetchUser: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('auth_token'),
  isAuthenticated: !!localStorage.getItem('auth_token'),

  login: async (data) => {
    const result = await api.auth.login(data)
    localStorage.setItem('auth_token', result.access_token)
    set({ token: result.access_token, isAuthenticated: true })
    await useAuthStore.getState().fetchUser()
  },

  register: async (data) => {
    await api.auth.register(data)
    await useAuthStore.getState().login(data)
  },

  logout: () => {
    localStorage.removeItem('auth_token')
    set({ user: null, token: null, isAuthenticated: false })
  },

  fetchUser: async () => {
    try {
      const user = await api.auth.me()
      set({ user })
    } catch {
      useAuthStore.getState().logout()
    }
  },
}))

// Auth context
interface AuthContextType {
  user: { username: string } | null
  isAuthenticated: boolean
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  logout: () => {},
})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, isAuthenticated, logout } = useAuthStore()
  const [user, setUser] = useState<{ username: string } | null>(null)

  useEffect(() => {
    if (token) {
      fetch('/api/v1/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then(setUser)
        .catch(() => setUser(null))
    }
  }, [token])

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
