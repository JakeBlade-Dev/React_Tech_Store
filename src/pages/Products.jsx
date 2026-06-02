import React, { useEffect, useState } from 'react'
import { authFetch, createProducto, deleteProducto, updateProducto } from '../utils/api'

const emptyForm = {
  id: null,
  title: '',
  price: '',
  image: '',
}

export default function Products(){
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [actionMessage, setActionMessage] = useState('')

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
              price: product.price ?? product.precio ?? 0,
              image: product.image ?? product.image_url ?? product.imagen ?? 'https://via.placeholder.com/220x140?text=Producto',
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
  }

  function editProduct(product) {
    setForm({
      id: product.id,
      title: product.title || '',
      price: product.price ?? '',
      image: product.image || '',
    })
    setActionMessage('')
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()

    try {
      setSaving(true)
      setError('')
      setActionMessage('')

      const payload = {
        title: form.title.trim(),
        price: Number(form.price),
        image: form.image.trim(),
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
        price: product.price ?? product.precio ?? 0,
        image: product.image ?? product.image_url ?? product.imagen ?? 'https://via.placeholder.com/220x140?text=Producto',
      })) : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el producto')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(product) {
    const confirmed = window.confirm(`¿Eliminar el producto "${product.title}"?`)
    if (!confirmed) return

    try {
      setError('')
      setActionMessage('')
      await deleteProducto(product.id)
      setActionMessage('Producto eliminado correctamente.')
      const data = await authFetch('/productos')
      setProducts(Array.isArray(data) ? data.map((item, index) => ({
        id: item.id ?? item.product_id ?? index,
        title: item.title ?? item.nombre ?? item.name ?? 'Producto sin nombre',
        price: item.price ?? item.precio ?? 0,
        image: item.image ?? item.image_url ?? item.imagen ?? 'https://via.placeholder.com/220x140?text=Producto',
      })) : [])
      if (form.id === product.id) {
        resetForm()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar el producto')
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header surface-card">
        <div>
          <p className="auth-kicker">Administración</p>
          <h2 className="mb-0">Productos</h2>
          <p className="mb-0 admin-page-copy">Catálogo remoto de Flask con espacio suficiente para lectura y acciones.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={resetForm}>Nuevo producto</button>
      </div>

      {loading && <p className="mt-3 mb-0">Cargando productos...</p>}
      {error && <p className="text-danger mt-3 mb-0">{error}</p>}
      {!error && actionMessage && <p className="text-success mt-3 mb-0">{actionMessage}</p>}

      {!loading && !error && (
        <div className="admin-panels-grid mt-3">
          <div className="surface-card admin-panel">
            <div className="admin-panel-header">
              <div>
                <p className="auth-kicker mb-1">Formulario</p>
                <h3 className="mb-0">{form.id ? 'Editar producto' : 'Crear producto'}</h3>
              </div>
            </div>

            <form className="d-grid gap-3" onSubmit={handleSubmit}>
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
                <label className="form-label" htmlFor="product-price">Precio</label>
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

              <div className="d-flex gap-2 flex-wrap">
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Guardando...' : form.id ? 'Actualizar' : 'Crear'}
                </button>
                <button type="button" className="btn btn-outline-secondary" onClick={resetForm}>
                  Limpiar
                </button>
              </div>
            </form>
          </div>

          <div className="surface-card admin-table-card">
            <div className="table-responsive">
              <table className="table align-middle admin-table mb-0">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Precio</th>
                    <th>Imagen</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(product => (
                    <tr key={product.id}>
                      <td>{product.title}</td>
                      <td>${Number(product.price).toLocaleString('es-CO')}</td>
                      <td className="text-truncate" style={{ maxWidth: '240px' }}>{product.image}</td>
                      <td>
                        <div className="d-flex gap-2 flex-wrap">
                          <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => editProduct(product)}>
                            Editar
                          </button>
                          <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(product)}>
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
