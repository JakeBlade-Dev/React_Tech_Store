import React, { useEffect, useState } from 'react'
import { authFetch, createProducto, deleteProducto, updateProducto, reactivateProducto } from '../utils/api'

const emptyForm = {
  id: null,
  title: '',
  descripcion: '',
  price: '',
  stock: '',
  image: '',
}

export default function Products(){
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [actionMessage, setActionMessage] = useState('')
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    let active = true

    async function loadProducts() {
      try {
        setLoading(true)
        setError('')
        const data = await authFetch('/productos')

        if (!active) return

        const normalizedProducts = Array.isArray(data)
          ? data.map((product, index) => ({
              id: product.id ?? product.product_id ?? index,
              title: product.title ?? product.nombre ?? product.name ?? 'Producto sin nombre',
              descripcion: product.descripcion ?? '',
              price: product.price ?? product.precio ?? 0,
              stock: product.stock ?? 0,
              image: product.image ?? product.image_url ?? product.imagen ?? 'https://via.placeholder.com/220x140?text=Producto',
              eliminado: product.eliminado
            }))
          : []

        setProducts(normalizedProducts)
      } catch (err) {
        if (!active) return
        setError(err instanceof Error ? err.message : 'No se pudieron cargar los productos')
      } finally {
        if (active) setLoading(false)
      }
    }

    loadProducts()

    return () => {
      active = false
    }
  }, [])

  function resetForm() {
    setForm(emptyForm)
    setActionMessage('')
    setError('')
    setShowForm(false)
  }

  function handleEdit(product) {
    setForm({
      id: product.id,
      title: product.title,
      descripcion: product.descripcion || '',
      price: product.price,
      stock: product.stock || 0,
      image: product.image
    })
    setError('')
    setActionMessage('')
    setShowForm(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      setSaving(true)
      setError('')
      setActionMessage('')

      const payload = {
        nombre: form.title.trim(),
        descripcion: form.descripcion.trim(),
        precio: Number(form.price),
        stock: Number(form.stock),
        imagen: form.image.trim(),
      }

      if (form.id) {
        await updateProducto(form.id, payload)
        setActionMessage('Producto actualizado correctamente.')
      } else {
        await createProducto(payload)
        setActionMessage('Producto creado correctamente.')
      }

      resetForm()
      const data = await authFetch('/productos')
      setProducts(Array.isArray(data) ? data.map((product, index) => ({
        id: product.id ?? product.product_id ?? index,
        title: product.title ?? product.nombre ?? product.name ?? 'Producto sin nombre',
        descripcion: product.descripcion ?? '',
        price: product.price ?? product.precio ?? 0,
        stock: product.stock ?? 0,
        image: product.image ?? product.image_url ?? product.imagen ?? 'https://via.placeholder.com/220x140?text=Producto',
        eliminado: product.eliminado
      })) : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el producto')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(product) {
    const confirmed = window.confirm(`¿Desactivar el producto "${product.title}"?`)
    if (!confirmed) return

    try {
      setError('')
      setActionMessage('')
      await deleteProducto(product.id)
      setActionMessage('Producto desactivado correctamente.')
      const data = await authFetch('/productos')
      setProducts(Array.isArray(data) ? data.map((item, index) => ({
        id: item.id ?? item.product_id ?? index,
        title: item.title ?? item.nombre ?? item.name ?? 'Producto sin nombre',
        descripcion: item.descripcion ?? '',
        price: item.price ?? item.precio ?? 0,
        stock: item.stock ?? 0,
        image: item.image ?? item.image_url ?? item.imagen ?? 'https://via.placeholder.com/220x140?text=Producto',
        eliminado: item.eliminado
      })) : [])
      if (form.id === product.id) {
        resetForm()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo desactivar el producto')
    }
  }

  async function handleReactivate(product) {
    const confirmed = window.confirm(`¿Volver a activar el producto "${product.title}"?`)
    if (!confirmed) return

    try {
      setError('')
      setActionMessage('')
      await reactivateProducto(product.id)
      setActionMessage('Producto activado correctamente.')
      const data = await authFetch('/productos')
      setProducts(Array.isArray(data) ? data.map((item, index) => ({
        id: item.id ?? item.product_id ?? index,
        title: item.title ?? item.nombre ?? item.name ?? 'Producto sin nombre',
        descripcion: item.descripcion ?? '',
        price: item.price ?? item.precio ?? 0,
        stock: item.stock ?? 0,
        image: item.image ?? item.image_url ?? item.imagen ?? 'https://via.placeholder.com/220x140?text=Producto',
        eliminado: item.eliminado
      })) : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo activar el producto')
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header surface-card">
        <div>
          <p className="auth-kicker">Administración</p>
          <h2 className="mb-0">Productos</h2>
          <p className="mb-0 admin-page-copy">Catálogo remoto con espacio suficiente para lectura y manejo de inventario.</p>
        </div>
        <div className="d-flex gap-2">
          <button type="button" className="btn btn-primary" onClick={() => setShowForm(true)}>Nuevo producto</button>
        </div>
      </div>

      {loading && <p className="mt-3 mb-0 text-muted">Cargando productos...</p>}
      {error && <div className="mt-3 p-4 surface-card border-danger text-danger">Error: {error}</div>}
      {!error && actionMessage && <div className="mt-3 p-4 surface-card text-success">{actionMessage}</div>}

      {showForm && (
        <div className="modal-overlay" onClick={resetForm}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="admin-panel-header mb-4">
              <div>
                <p className="auth-kicker mb-1">Formulario</p>
                <h3 className="mb-0">{form.id ? 'Editar producto' : 'Crear producto'}</h3>
              </div>
              <button type="button" className="btn btn-outline-secondary btn-sm" onClick={resetForm}>Cerrar</button>
            </div>

            <form onSubmit={handleSubmit} className="d-grid gap-3">
              <div>
                <label className="form-label" htmlFor="product-title">Nombre</label>
                <input
                  id="product-title"
                  className="form-control"
                  value={form.title}
                  onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Nombre del producto"
                  required
                />
              </div>

              <div>
                <label className="form-label" htmlFor="product-desc">Descripción</label>
                <textarea
                  id="product-desc"
                  className="form-control"
                  value={form.descripcion}
                  onChange={e => setForm(prev => ({ ...prev, descripcion: e.target.value }))}
                  placeholder="Descripción detallada"
                  rows="2"
                />
              </div>

              <div className="row g-3">
                <div className="col-6">
                  <label className="form-label" htmlFor="product-price">Precio</label>
                  <div className="input-group">
                    <span className="input-group-text">$</span>
                    <input
                      id="product-price"
                      className="form-control"
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.price}
                      onChange={e => setForm(prev => ({ ...prev, price: e.target.value }))}
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>
                <div className="col-6">
                  <label className="form-label" htmlFor="product-stock">Stock</label>
                  <input
                    id="product-stock"
                    className="form-control"
                    type="number"
                    min="0"
                    value={form.stock}
                    onChange={e => setForm(prev => ({ ...prev, stock: e.target.value }))}
                    placeholder="0"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="form-label" htmlFor="product-image">URL de imagen</label>
                <input
                  id="product-image"
                  className="form-control"
                  value={form.image}
                  onChange={e => setForm(prev => ({ ...prev, image: e.target.value }))}
                  placeholder="https://..."
                />
              </div>

              <div className="mt-4 text-end">
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Guardando...' : (form.id ? 'Actualizar' : 'Crear')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {!loading && !error && (
        <div className="surface-card admin-table-card mt-4">
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Stock</th>
                  <th>Precio</th>
                  <th>Imagen</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center text-muted py-4">No se encontraron productos.</td>
                  </tr>
                ) : (
                  [...products]
                    .sort((a, b) => {
                      const aElim = a.eliminado === true || a.eliminado === "true" || a.eliminado === 1 ? 1 : 0;
                      const bElim = b.eliminado === true || b.eliminado === "true" || b.eliminado === 1 ? 1 : 0;
                      return aElim - bElim;
                    })
                    .map(product => {
                      const isEliminado = product.eliminado === true || product.eliminado === "true" || product.eliminado === 1
                    
                    return (
                      <tr key={product.id} style={{ opacity: isEliminado ? 0.6 : 1 }}>
                        <td className="fw-medium">
                          {product.title}
                          {product.descripcion && (
                            <div className="text-muted" style={{ fontSize: '0.8rem', fontWeight: 'normal' }}>{product.descripcion}</div>
                          )}
                        </td>
                        <td className="text-muted">{product.stock}</td>
                        <td className="text-muted">${Number(product.price).toLocaleString('es-CO')}</td>
                        <td className="text-truncate text-muted" style={{ maxWidth: '240px', fontSize: '0.85rem' }}>
                          {product.image}
                        </td>
                        <td>
                          {isEliminado ? (
                            <span className="badge text-bg-secondary">Desactivado</span>
                          ) : (
                            <span className="badge text-bg-success">Activo</span>
                          )}
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            {!isEliminado && (
                              <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => handleEdit(product)}>
                                Editar
                              </button>
                            )}
                            {isEliminado ? (
                              <button type="button" className="btn btn-success btn-sm" onClick={() => handleReactivate(product)}>
                                Activar
                              </button>
                            ) : (
                              <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(product)}>
                                Desactivar
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
