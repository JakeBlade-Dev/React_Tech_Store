import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { login } from '../firebase'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
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
            <div style={{ position: 'relative' }}>
              <input
                id="login-password"
                className="form-control"
                type={showPassword ? 'text' : 'password'}
                placeholder="Tu contraseña"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                style={{ paddingRight: '2.5rem' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '0.5rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-muted)'
                }}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-100" disabled={isLoggingIn}>
            {isLoggingIn ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        {error && <p className="text-danger mt-3 mb-0">{error}</p>}

        <div className="auth-footer">
          <span className="text-muted">Ingresa con tu cuenta de administración</span>
        </div>
      </div>
    </div>
  )
}
