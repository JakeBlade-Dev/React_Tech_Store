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
        <aside className="sidebar">
          <div className="sidebar-header">
            <p className="auth-kicker mb-1">Panel administrativo</p>
            <h2 className="mb-2">Tech Store 360</h2>
            <p className="text-muted mb-0" style={{ fontSize: '0.85rem' }}>
              Gestiona usuarios, productos y compras.
            </p>
          </div>

          <nav className="d-flex flex-column" style={{ flex: 1 }}>
            <NavLink end to="/admin" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              Dashboard
            </NavLink>
            <NavLink to="/admin/users" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              Usuarios
            </NavLink>
            <NavLink to="/admin/products" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              Productos
            </NavLink>
            <NavLink to="/admin/purchases" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              Compras
            </NavLink>
          </nav>

          <div className="mt-auto surface-card p-3 shadow-none border bg-light text-center">
            <p className="text-muted mb-1" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>Sesión actual</p>
            <p className="fw-medium mb-3" style={{ fontSize: '0.9rem' }}>{user?.displayName || user?.email}</p>
            <button type="button" className="btn btn-outline-danger w-100" onClick={handleLogout}>
              Cerrar sesión
            </button>
          </div>
        </aside>

        <section className="main-content">
          <Outlet />
        </section>
      </div>
    </div>
  )
}