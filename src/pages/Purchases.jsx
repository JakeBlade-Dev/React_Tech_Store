import React, { useEffect, useState } from 'react'
import { authFetch, getCompras } from '../utils/api'

export default function Purchases(){
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedPurchase, setSelectedPurchase] = useState(null)

  async function loadPurchases() {
    const data = await getCompras()
    setList(Array.isArray(data) ? data : [])
  }

  useEffect(() => {
    let active = true

    async function init() {
      try {
        setLoading(true)
        setError('')
        const data = await authFetch('/compras')

        if (!active) return

        setList(Array.isArray(data) ? data : [])
      } catch (err) {
        if (!active) return
        setError(err instanceof Error ? err.message : 'No se pudieron cargar las compras')
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
      await loadPurchases()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar las compras')
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
          <p className="mb-0 admin-page-copy">Historial operativo con espacio para seguimiento y lectura rápida.</p>
        </div>
        <button type="button" className="btn btn-outline-primary" onClick={refreshPurchases}>Refrescar</button>
      </div>

      {loading && <p className="mt-3 mb-0">Cargando compras...</p>}
      {error && <p className="text-danger mt-3 mb-0">{error}</p>}

      {!loading && !error && (
        <div className="surface-card admin-table-card mt-3">
          <div className="table-responsive">
          <table className="table align-middle admin-table mb-0">
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
              {list.map(purchase => (
                <tr key={purchase.id || purchase.compra_id || purchase.numero}>
                  <td>{purchase.id || purchase.compra_id || '-'}</td>
                  <td>{purchase.cliente || purchase.usuario || purchase.correo || '-'}</td>
                  <td>{purchase.fecha || purchase.created_at || '-'}</td>
                  <td>{purchase.total != null ? `$${Number(purchase.total).toLocaleString('es-CO')}` : '-'}</td>
                  <td>
                    <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => openPurchaseDetail(purchase)}>
                      Ver detalle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {selectedPurchase && (
        <div className="surface-card admin-panel mt-3">
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
            <div className="col-md-4"><strong>Cliente:</strong><br />{selectedPurchase.cliente || selectedPurchase.usuario || selectedPurchase.correo || '-'}</div>
            <div className="col-md-4"><strong>Fecha:</strong><br />{selectedPurchase.fecha || selectedPurchase.created_at || '-'}</div>
            <div className="col-md-4"><strong>Total:</strong><br />{selectedPurchase.total != null ? `$${Number(selectedPurchase.total).toLocaleString('es-CO')}` : '-'}</div>
          </div>
        </div>
      )}
    </div>
  )
}
