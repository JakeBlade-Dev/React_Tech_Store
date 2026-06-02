import React from 'react'

export default function ProductCard({product}){
  return (
    <div className="product-card">
      <div className="product-img">
        <img src={product.image} alt={product.title} />
      </div>
      <div className="product-title">{product.title}</div>
      <div className="product-meta">
        <div>
          <div className="product-badge">Oferta</div>
          <div className="product-price">${product.price}</div>
        </div>
        <button className="btn btn-sm btn-outline-primary">Agregar</button>
      </div>
    </div>
  )
}
