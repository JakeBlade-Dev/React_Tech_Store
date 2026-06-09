import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { logout } from '../firebase'

export default function AdminGuard({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="container page-shell">Cargando sesión...</div>
  }

  if (!user) return <Navigate to="/login" replace />

  if (!user.isAdmin) {
    return (
      <div className="container page-shell d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <div className="surface-card p-5 text-center admin-panel">
          <h2 className="text-danger mb-3">Acceso Denegado</h2>
          <p className="mb-4">No tienes permisos de administrador para acceder a este panel.</p>
          <button className="btn btn-primary" onClick={() => logout()}>
            Cerrar sesión
          </button>
        </div>
      </div>
    )
  }

  return children
}