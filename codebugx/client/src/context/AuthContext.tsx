import React, { createContext, useContext, useMemo, useState } from 'react'

type AuthContextValue = {
  token: string | null
  login: (newToken: string) => void
  logout: (reason?: string) => void
  logoutReason: string | null
  clearLogoutReason: () => void
  apiFetch: (input: RequestInfo, init?: RequestInit) => Promise<Response>
  isTokenExpired: (tokenValue: string) => boolean
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const parseJwtPayload = (tokenValue: string) => {
  try {
    const base64Url = tokenValue.split('.')[1]
    if (!base64Url) {
      return null
    }
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((char) => `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join('')
    )
    return JSON.parse(jsonPayload) as { exp?: number }
  } catch {
    return null
  }
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'))
  const [logoutReason, setLogoutReason] = useState<string | null>(null)

  const isTokenExpired = (tokenValue: string) => {
    const payload = parseJwtPayload(tokenValue)
    if (!payload?.exp) {
      return false
    }
    const nowInSeconds = Math.floor(Date.now() / 1000)
    return payload.exp <= nowInSeconds
  }

  const login = (newToken: string) => {
    if (isTokenExpired(newToken)) {
      localStorage.removeItem('token')
      setToken(null)
      setLogoutReason('Session expired. Please sign in again.')
      return
    }
    localStorage.setItem('token', newToken)
    setToken(newToken)
    setLogoutReason(null)
  }

  const logout = (reason?: string) => {
    localStorage.removeItem('token')
    setToken(null)
    setLogoutReason(reason || null)
  }

  const clearLogoutReason = () => {
    setLogoutReason(null)
  }

  const apiFetch = async (input: RequestInfo, init: RequestInit = {}) => {
    const headers = new Headers(init.headers || {})
    if (token) {
      if (isTokenExpired(token)) {
        logout('Session expired. Please sign in again.')
      } else {
        headers.set('Authorization', `Bearer ${token}`)
      }
    }

    return fetch(input, {
      ...init,
      headers,
    })
  }

  const value = useMemo(
    () => ({ token, login, logout, logoutReason, clearLogoutReason, apiFetch, isTokenExpired }),
    [token, logoutReason]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
