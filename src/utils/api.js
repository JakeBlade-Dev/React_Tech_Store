const API_URL = import.meta.env.VITE_API_URL || '/api'

function resolveApiUrl(url) {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  return `${API_URL}${url.startsWith('/') ? '' : '/'}${url}`
}

// CACHÉ Y DEDUPLICACIÓN DE PETICIONES (Evita HTTP 429)
const activeRequests = new Map() // Para no disparar la misma ruta dos veces a la vez
const fetchCache = new Map() // Caché de corto plazo

function getCached(key) {
  const cached = fetchCache.get(key)
  if (!cached) return null
  // Expirar caché después de 60 segundos
  if (Date.now() - cached.timestamp > 60000) {
    fetchCache.delete(key)
    return null
  }
  return cached.data
}

// Cola de peticiones globales para evitar saturar el Nginx o Vercel con 429
const requestQueue = []
let isProcessingQueue = false

async function processQueue() {
  if (isProcessingQueue || requestQueue.length === 0) return
  isProcessingQueue = true
  
  while (requestQueue.length > 0) {
    const { fetchFunction, resolve, reject } = requestQueue.shift()
    try {
      const result = await fetchFunction()
      resolve(result)
    } catch (err) {
      reject(err)
    }
    // Pequeño delay entre peticiones para engañar al rate limit (300ms)
    await new Promise(r => setTimeout(r, 300))
  }
  
  isProcessingQueue = false
}

export async function authFetch(url, options = {}, retries = 3) {
  const token = localStorage.getItem('token')
  const headers = { ...(options.headers || {}), 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const method = options.method || 'GET'
  const isQuery = method === 'GET'
  const cacheKey = url

  if (!isQuery) {
    fetchCache.clear()
  }

  if (isQuery) {
    const cachedData = getCached(cacheKey)
    if (cachedData) return cachedData
  }

  const requestKey = `${method}:${url}`
  if (activeRequests.has(requestKey)) {
    return activeRequests.get(requestKey)
  }

  // 4. Encolar la petición real en lugar de dispararla inmediatamente
  const fetchPromise = new Promise((resolve, reject) => {
    
    const fetchFunction = async () => {
      let currentRetries = retries;
      let res;
      
      while (currentRetries >= 0) {
        res = await fetch(resolveApiUrl(url), { ...options, headers })
        
        if (res.status === 429 && currentRetries > 0) {
          // Jitter aleatorio entre 1s y 3s para evitar colisiones sincronizadas
          const delay = 1000 + Math.random() * 2000;
          console.warn(`HTTP 429 detectado para ${url}. Reintentando en ${Math.round(delay)}ms... (Quedan ${currentRetries} intentos)`)
          await new Promise(r => setTimeout(r, delay))
          currentRetries--
          continue 
        }
        break
      }

      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      
      const data = await res.json()
      
      if (isQuery) {
        fetchCache.set(cacheKey, { data, timestamp: Date.now() })
      }
      return data
    }

    requestQueue.push({ fetchFunction, resolve, reject })
    processQueue() // Intenta procesar la cola
    
  }).finally(() => {
    activeRequests.delete(requestKey)
  })

  activeRequests.set(requestKey, fetchPromise)
  return fetchPromise
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

export async function reactivateUsuario(usuarioId) {
  return authFetch(`/usuarios/${usuarioId}`, {
    method: 'PUT',
    body: JSON.stringify({ eliminado: false }),
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

export async function reactivateProducto(productoId) {
  return authFetch(`/productos/${productoId}`, {
    method: 'PUT',
    body: JSON.stringify({ eliminado: false }),
  })
}

export async function getCompras() {
  return authFetch('/compras')
}
