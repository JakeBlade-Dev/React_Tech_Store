import React from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { logout } from '../firebase'

export default function AdminLayout() {
  const nav = useNavigate()
  const { user } = useAuth()

  async function handleLogout() {
    await logout()
    nav('/login')
  }

  return (
    <div className="container-fluid admin-shell page-shell">
      <div className="admin-layout">
        <aside className="admin-sidebar surface-card">
          <div className="admin-sidebar-brand">
            <p className="auth-kicker mb-1">Panel administrativo</p>
            <h2 className="mb-2">Tech Store 360</h2>
            <p className="admin-sidebar-copy mb-0">
              Gestiona usuarios, productos y compras desde un solo lugar.
            </p>
          </div>

          <nav className="admin-nav">
            <NavLink end to="/admin" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
              Dashboard
            </NavLink>
            <NavLink to="/admin/users" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
              Usuarios
            </NavLink>
            <NavLink to="/admin/products" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
              Productos
            </NavLink>
            <NavLink to="/admin/purchases" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
              Compras
            </NavLink>
          </nav>

          <div className="admin-session-card">
            <p className="admin-session-label mb-1">Sesión actual</p>
            <p className="admin-session-user mb-3">{user?.displayName || user?.email}</p>
            <button type="button" className="btn btn-dark w-100" onClick={handleLogout}>
              Cerrar sesión
            </button>
          </div>
        </aside>

        <section className="admin-content">
          <Outlet />
        </section>
      </div>
    </div>
  )
}