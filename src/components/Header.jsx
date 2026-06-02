import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { logout } from '../firebase'

export default function Header(){
  const nav = useNavigate()
  const { user } = useAuth()

  async function handleLogout() {
    await logout()
    nav('/')
  }

  return (
    <header className="site-header">
      <div className="site-top container d-flex align-items-center">
        <div className="brand">
          <div className="brand-logo">TechStore</div>
          <div className="brand-copy d-none d-md-block">Tu tienda de tecnología</div>
        </div>

        <div className="search-bar">
          <input className="search-input" placeholder="Buscar productos, marcas y más" aria-label="Buscar productos" />
        </div>

        <div className="nav-actions">
          {user ? (
            <>
              {user.isAdmin && (
                <Link to="/admin" className="btn btn-outline-light btn-sm me-2">Panel admin</Link>
              )}
              <span className="nav-link-soft d-none d-md-inline">
                Hola, {user.displayName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email}
              </span>
              <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline-light btn-sm">Ingresar</Link>
              <button className="btn btn-primary btn-sm" onClick={()=>nav('/register')}>Crear cuenta</button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
