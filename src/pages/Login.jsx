import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { login } from '../firebase'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const nav = useNavigate()
  const { user } = useAuth()

  // Redirigir automáticamente si ya hay usuario cargado en el contexto
  useEffect(() => {
    if (user) {
      nav('/admin')
    }
  }, [user, nav])

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      setIsLoggingIn(true)
      setError(null)
      // Solo hacemos login, el AuthContext detectará el cambio y actualizará el perfil
      await login(email, password)
    } catch (err) {
      setIsLoggingIn(false)
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

        <form className="d-grid gap-3" onSubmit={handleSubmit}>
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

          <button type="submit" className="btn btn-primary w-100" disabled={isLoggingIn}>
            {isLoggingIn ? 'Entrando...' : 'Entrar'}
          </button>
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
