import React, { useEffect, useState } from 'react'
import { authFetch, getCompras } from '../utils/api'

export default function Purchases(){
  const [list, setList] = useState([])
  const [clients, setClients] = useState([])
  const [productsDict, setProductsDict] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedPurchase, setSelectedPurchase] = useState(null)

  async function loadPurchasesAndClients() {
    try {
      const [comprasData, usuariosData, productosData] = await Promise.all([
        authFetch('/compras'),
        authFetch('/usuarios').catch(() => []),
        authFetch('/productos').catch(() => [])
      ])
      const comprasArray = Array.isArray(comprasData) ? comprasData : []
      setList(comprasArray)
      
      if (Array.isArray(usuariosData)) {
        setClients(usuariosData.filter(u => u.eliminado !== true && (u.rol === 'cliente' || u.role === 'cliente')))
      } else {
        setClients([])
      }
      
      if (Array.isArray(productosData)) {
        const dict = {}
        productosData.forEach(p => dict[p.id] = p.nombre || p.title)
        setProductsDict(dict)
      }
    } catch (e) {
      throw e
    }
  }

  useEffect(() => {
    let active = true

    async function init() {
      try {
        setLoading(true)
        setError('')
        await loadPurchasesAndClients()
      } catch (err) {
        if (!active) return
        setError(err instanceof Error ? err.message : 'No se pudieron cargar los datos')
      } finally {
        if (active) setLoading(false)
      }
    }

    init()

    return () => {
      active = false
    }
  }, [])

  async function refreshPurchases() {
    try {
      setError('')
      setLoading(true)
      await loadPurchasesAndClients()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar los datos')
    } finally {
      setLoading(false)
    }
  }

  function openPurchaseDetail(purchase) {
    setSelectedPurchase(purchase)
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header surface-card">
        <div>
          <p className="auth-kicker">Administración</p>
          <h2 className="mb-0">Compras</h2>
          <p className="mb-0 admin-page-copy">Historial operativo con espacio para seguimiento y creación de nuevos pedidos.</p>
        </div>
        <div className="d-flex gap-2">
          <button type="button" className="btn btn-outline-secondary" onClick={refreshPurchases}>Refrescar</button>
        </div>
      </div>

      {loading && <p className="mt-3 mb-0 text-muted">Cargando datos...</p>}
      {error ? <MaintenanceState onRetry={() => { setLoading(true); fetchPurchases().finally(() => setLoading(false)) }} /> : null}

      {!loading && !error && (
        <div className="surface-card admin-table-card mt-4">
          <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Cliente</th>
                <th>Fecha</th>
                <th>Total</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {list.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center text-muted py-4">No se encontraron compras.</td>
                </tr>
              ) : (
                list.map(purchase => (
                  <tr key={purchase.id || purchase.compra_id || purchase.numero}>
                    <td className="fw-medium">{purchase.id || purchase.compra_id || '-'}</td>
                    <td>{purchase.cliente || `ID: ${purchase.usuario_id}` || '-'}</td>
                    <td className="text-muted">{purchase.fecha || purchase.created_at || '-'}</td>
                    <td>{purchase.total != null ? `$${Number(purchase.total).toLocaleString('es-CO')}` : '-'}</td>
                    <td>
                      <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => openPurchaseDetail(purchase)}>
                        Ver detalle
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {selectedPurchase && (
        <div className="surface-card admin-panel mt-4 border-primary" style={{ border: '1px solid var(--border-color)' }}>
          <div className="admin-panel-header">
            <div>
              <p className="auth-kicker mb-1">Detalle</p>
              <h3 className="mb-0">Compra #{selectedPurchase.id || selectedPurchase.compra_id || '-'}</h3>
            </div>
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setSelectedPurchase(null)}>
              Cerrar
            </button>
          </div>

          <div className="row g-3 mt-1">
            <div className="col-md-4">
              <span className="text-muted d-block mb-1" style={{ fontSize: '0.85rem' }}>Cliente</span>
              <strong>{selectedPurchase.cliente || `ID: ${selectedPurchase.usuario_id}` || '-'}</strong>
            </div>
            <div className="col-md-4">
              <span className="text-muted d-block mb-1" style={{ fontSize: '0.85rem' }}>Fecha</span>
              <strong>{selectedPurchase.fecha || selectedPurchase.created_at || '-'}</strong>
            </div>
            <div className="col-md-4">
              <span className="text-muted d-block mb-1" style={{ fontSize: '0.85rem' }}>Total</span>
              <strong>{selectedPurchase.total != null ? `$${Number(selectedPurchase.total).toLocaleString('es-CO')}` : '-'}</strong>
            </div>
          </div>
          
          {selectedPurchase.detalles && selectedPurchase.detalles.length > 0 && (
            <div className="mt-4">
              <span className="text-muted d-block mb-2" style={{ fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>Artículos comprados</span>
              <ul className="list-group list-group-flush border rounded">
                {selectedPurchase.detalles.map((detalle, idx) => (
                  <li key={idx} className="list-group-item d-flex justify-content-between align-items-center bg-transparent">
                    <span><strong>{productsDict[detalle.producto_id] || `Producto ID: ${detalle.producto_id}`}</strong></span>
                    <span>
                      {detalle.cantidad} x ${Number(detalle.precio_unitario).toLocaleString('es-CO')}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
