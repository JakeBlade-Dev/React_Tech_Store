import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AdminGuard({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="container page-shell">Cargando sesión...</div>
  }

  if (!user) return <Navigate to="/login" replace />
  if (!user.isAdmin) return <Navigate to="/" replace />

  return children
}