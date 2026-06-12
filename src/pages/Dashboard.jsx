import React, { useEffect, useState } from 'react'
import { authFetch } from '../utils/api'
import MaintenanceState from '../components/MaintenanceState'

export default function Dashboard(){
  const [stats, setStats] = useState({ users: 0, products: 0, purchases: 0, totalRevenue: 0 })
  const [recentPurchases, setRecentPurchases] = useState([])

  useEffect(() => {
    async function loadStats() {
      try {
        const [users, products, purchases] = await Promise.all([
          authFetch('/usuarios').catch(() => []),
          authFetch('/productos').catch(() => []),
          authFetch('/compras').catch(() => [])
        ])
        const validPurchases = Array.isArray(purchases) ? purchases : []
        const revenue = validPurchases.reduce((acc, p) => acc + (Number(p.total) || 0), 0)
        
        setStats({
          users: Array.isArray(users) ? users.length : 0,
          products: Array.isArray(products) ? products.length : 0,
          purchases: validPurchases.length,
          totalRevenue: revenue
        })
        
        setRecentPurchases(validPurchases.slice(0, 5))
      } catch (e) {
        console.warn('Error loading stats:', e)
      }
    }
    loadStats()
  }, [])

  return (
    <div className="admin-page">
      <div className="admin-hero surface-card">
        <div>
          <p className="auth-kicker mb-1">Resumen General</p>
          <h2 className="mb-2">Panel Ejecutivo</h2>
          <p className="admin-hero-copy mb-0 text-muted">
            Bienvenido al centro de control. Supervisa las métricas clave de tu tienda en tiempo real.
          </p>
        </div>
      </div>

      <div className="stats-grid mt-2">
        <div className="stat-card surface-card">
          <span className="stat-label">Ingresos Totales</span>
          <strong className="stat-value">${stats.totalRevenue.toLocaleString('es-CO')}</strong>
          <p className="stat-copy mb-0 text-success">▲ Generado históricamente</p>
        </div>
        <div className="stat-card surface-card">
          <span className="stat-label">Ventas Promedio</span>
          <strong className="stat-value">${stats.purchases > 0 ? (stats.totalRevenue / stats.purchases).toLocaleString('es-CO', { maximumFractionDigits: 0 }) : 0}</strong>
          <p className="stat-copy mb-0 text-success">▲ Ticket promedio de compra</p>
        </div>
        <div className="stat-card surface-card">
          <span className="stat-label">Usuarios Registrados</span>
          <strong className="stat-value">{stats.users}</strong>
          <p className="stat-copy mb-0">Cuentas activas en la plataforma.</p>
        </div>
        <div className="stat-card surface-card">
          <span className="stat-label">Productos Catálogo</span>
          <strong className="stat-value">{stats.products}</strong>
          <p className="stat-copy mb-0">Artículos disponibles para venta.</p>
        </div>
      </div>
      
      <div className="mt-4 surface-card p-4 border rounded shadow-sm bg-white">
        <p className="auth-kicker mb-3">Actividad Reciente</p>
        {recentPurchases.length === 0 ? (
          <p className="text-muted">No hay transacciones recientes para mostrar.</p>
        ) : (
          <div className="table-responsive">
            <table className="table admin-table mb-0">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Cliente</th>
                  <th>Total</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {recentPurchases.map(p => (
                  <tr key={p.id}>
                    <td className="fw-medium text-muted">#{p.id}</td>
                    <td>{p.cliente || `ID ${p.usuario_id}`}</td>
                    <td className="fw-bold">${Number(p.total).toLocaleString('es-CO')}</td>
                    <td className="text-muted">{p.fecha || 'Reciente'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
