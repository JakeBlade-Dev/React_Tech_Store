import React, { useEffect, useState } from 'react'
import Header from '../components/Header'
import ProductCard from '../components/ProductCard'
import { getProductos } from '../utils/api'

export default function Home(){
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function loadProducts() {
      try {
        setLoading(true)
        setError('')
        const data = await getProductos()

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

  return (
    <div>
      <Header />
      <main className="container page-shell">
        <section className="hero-banner">
          <span className="toolbar-chip">Tecnología seleccionada</span>
          <h1 className="mt-3 mb-2 fw-bold">Descubre la tienda con estilo limpio, moderno y profesional</h1>
          <p className="mb-0">Una experiencia visual inspirada en grandes marketplaces: jerarquía clara, búsqueda visible, tarjetas limpias y una paleta profesional basada en grises y azules.</p>
        </section>

        <section>
          <div className="section-title">
            <div>
              <h2>Ofertas destacadas</h2>
              <small>Encuentra las mejores ofertas en tecnología</small>
            </div>
            <span className="toolbar-chip">Envío rápido</span>
          </div>

          {loading && <p>Cargando productos...</p>}
          {error && <p className="text-danger">{error}</p>}

          {!loading && !error && (
            <div className="products-grid">
              {products.map(product => <ProductCard key={product.id} product={product} />)}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
