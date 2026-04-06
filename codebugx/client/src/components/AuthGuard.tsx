import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

type AuthGuardProps = {
  children: React.ReactElement
}

const AuthGuard = ({ children }: AuthGuardProps) => {
  const location = useLocation()
  const { token, logout, isTokenExpired } = useAuth()

  if (token && isTokenExpired(token)) {
    logout('Session expired. Please sign in again.')
    return <Navigate to="/" replace state={{ from: location }} />
  }

  if (!token) {
    return <Navigate to="/" replace state={{ from: location }} />
  }

  return children
}

export default AuthGuard
