const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000'

function resolveApiUrl(url) {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }

  return `${API_URL}${url.startsWith('/') ? '' : '/'}${url}`
}

export async function authFetch(url, options = {}) {
  const token = localStorage.getItem('token')
  const headers = { ...(options.headers || {}), 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(resolveApiUrl(url), { ...options, headers })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function getProductos() {
  const response = await fetch(`${API_URL}/productos`)
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  return response.json()
}

export async function createUsuario({ firebase_uid, correo, nombre }) {
  const response = await fetch(`${API_URL}/usuarios`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      firebase_uid,
      correo,
      nombre,
    }),
  })

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }

  return response.json()
}

export async function updateUsuario(usuarioId, payload) {
  return authFetch(`/usuarios/${usuarioId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export async function deleteUsuario(usuarioId) {
  return authFetch(`/usuarios/${usuarioId}`, {
    method: 'DELETE',
  })
}

export async function getUsuarioByFirebaseUid(firebaseUid) {
  const response = await authFetch('/usuarios')
  const usuarios = Array.isArray(response) ? response : []

  return usuarios.find(usuario => {
    const uid = usuario.firebase_uid || usuario.uid
    return uid === firebaseUid
  }) || null
}

export async function createProducto(payload) {
  return authFetch('/productos', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function updateProducto(productoId, payload) {
  return authFetch(`/productos/${productoId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export async function deleteProducto(productoId) {
  return authFetch(`/productos/${productoId}`, {
    method: 'DELETE',
  })
}

export async function getCompras() {
  return authFetch('/compras')
}
