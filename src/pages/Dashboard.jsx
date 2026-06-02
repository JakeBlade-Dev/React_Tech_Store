import React from 'react'
import { Link } from 'react-router-dom'

export default function Dashboard(){
  return (
    <div className="admin-page">
      <div className="admin-hero surface-card">
        <div>
          <p className="auth-kicker mb-1">Resumen</p>
          <h2 className="mb-2">Panel administrativo</h2>
          <p className="admin-hero-copy mb-0">
            Controla la operación de la tienda desde una vista compacta, clara y pensada para trabajo diario.
          </p>
        </div>

        <div className="admin-hero-actions">
          <Link to="/admin/users" className="btn btn-primary">Gestionar usuarios</Link>
          <Link to="/admin/products" className="btn btn-outline-primary">Gestionar productos</Link>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card surface-card">
          <span className="stat-label">Usuarios</span>
          <strong className="stat-value">Acceso centralizado</strong>
          <p className="stat-copy mb-0">Revisa las cuentas registradas y el rol de cada usuario.</p>
        </div>
        <div className="stat-card surface-card">
          <span className="stat-label">Productos</span>
          <strong className="stat-value">Catálogo sincronizado</strong>
          <p className="stat-copy mb-0">Visualiza inventario y prepara altas o ediciones.</p>
        </div>
        <div className="stat-card surface-card">
          <span className="stat-label">Compras</span>
          <strong className="stat-value">Trazabilidad completa</strong>
          <p className="stat-copy mb-0">Consulta pedidos y controla el historial operativo.</p>
        </div>
      </div>

      <div className="admin-panels-grid">
        <div className="admin-panel surface-card">
          <div className="admin-panel-header">
            <div>
              <p className="auth-kicker mb-1">Accesos rápidos</p>
              <h3 className="mb-0">Acciones frecuentes</h3>
            </div>
          </div>

          <div className="admin-quick-list">
            <Link to="/admin/users" className="admin-quick-item">
              <span>Usuarios</span>
              <small>Ver y controlar cuentas</small>
            </Link>
            <Link to="/admin/products" className="admin-quick-item">
              <span>Productos</span>
              <small>Explorar catálogo completo</small>
            </Link>
            <Link to="/admin/purchases" className="admin-quick-item">
              <span>Compras</span>
              <small>Revisar movimientos recientes</small>
            </Link>
          </div>
        </div>

        <div className="admin-panel surface-card">
          <div className="admin-panel-header">
            <div>
              <p className="auth-kicker mb-1">Estado</p>
              <h3 className="mb-0">Resumen operativo</h3>
            </div>
          </div>

          <div className="admin-status-stack">
            <div className="admin-status-row">
              <span>Usuarios activos</span>
              <strong>Lista conectada a Flask</strong>
            </div>
            <div className="admin-status-row">
              <span>Productos visibles</span>
              <strong>Datos remotos sincronizados</strong>
            </div>
            <div className="admin-status-row">
              <span>Compras</span>
              <strong>Consulta protegida por admin</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
