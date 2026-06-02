import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { login, getStoredProfile } from '../firebase'
import { isAdminUser } from '../utils/admin'
import { getUsuarioByFirebaseUid } from '../utils/api'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const nav = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      const user = await login(email, password)
      const storedProfile = getStoredProfile(user.uid)
      const backendProfile = await getUsuarioByFirebaseUid(user.uid)
      const nextUser = { ...user, ...storedProfile, ...backendProfile }

      if (storedProfile || backendProfile) {
        localStorage.setItem(`profile:${user.uid}`, JSON.stringify(nextUser))
      }

      nav(isAdminUser(nextUser) ? '/admin' : '/')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="container page-shell">
      <div className="auth-shell">
        <div className="auth-header">
          <div>
            <p className="auth-kicker">Acceso seguro</p>
            <h2 className="mb-0">Iniciar sesión</h2>
          </div>
          <Link to="/" className="auth-link">Volver al inicio</Link>
        </div>

        <form onSubmit={handleSubmit}>
          <div>
            <label className="form-label" htmlFor="login-email">Correo electrónico</label>
            <input
              id="login-email"
              className="form-control"
              type="email"
              placeholder="usuario@correo.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div>
            <label className="form-label" htmlFor="login-password">Contraseña</label>
            <input
              id="login-password"
              className="form-control"
              type="password"
              placeholder="Tu contraseña"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="btn btn-primary w-100">Entrar</button>
        </form>

        {error && <p className="text-danger mt-3 mb-0">{error}</p>}

        <div className="auth-footer">
          <span>¿No tienes cuenta?</span>
          <Link to="/register" className="auth-link">Regístrate</Link>
        </div>
      </div>
    </div>
  )
}
