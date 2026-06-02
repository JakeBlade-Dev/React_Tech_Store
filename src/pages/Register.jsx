import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { register } from '../firebase'
import { createUsuario } from '../utils/api'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [documentNumber, setDocumentNumber] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [error, setError] = useState(null)
  const nav = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      const user = await register(email, password, {
        firstName,
        lastName,
        phone,
        documentNumber,
        address,
        city,
      })

      await createUsuario({
        firebase_uid: user.uid,
        correo: user.email,
        nombre: [firstName, lastName].filter(Boolean).join(' ').trim(),
      })

      nav('/')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="container page-shell">
      <div className="auth-shell">
        <div className="auth-header">
          <div>
            <p className="auth-kicker">Crear cuenta</p>
            <h2 className="mb-0">Registro</h2>
          </div>
          <Link to="/" className="auth-link">Volver al inicio</Link>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="auth-grid">
            <div>
              <label className="form-label" htmlFor="register-first-name">Nombre</label>
              <input
                id="register-first-name"
                className="form-control"
                type="text"
                placeholder="Juan"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                autoComplete="given-name"
                required
              />
            </div>

            <div>
              <label className="form-label" htmlFor="register-last-name">Apellido</label>
              <input
                id="register-last-name"
                className="form-control"
                type="text"
                placeholder="Pérez"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                autoComplete="family-name"
                required
              />
            </div>

            <div>
              <label className="form-label" htmlFor="register-email">Correo electrónico</label>
              <input
                id="register-email"
                className="form-control"
                type="email"
                placeholder="usuario@correo.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div>
              <label className="form-label" htmlFor="register-phone">Teléfono</label>
              <input
                id="register-phone"
                className="form-control"
                type="tel"
                placeholder="300 000 0000"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                autoComplete="tel"
              />
            </div>

            <div>
              <label className="form-label" htmlFor="register-document">Documento / ID</label>
              <input
                id="register-document"
                className="form-control"
                type="text"
                placeholder="123456789"
                value={documentNumber}
                onChange={e => setDocumentNumber(e.target.value)}
                autoComplete="off"
              />
            </div>

            <div>
              <label className="form-label" htmlFor="register-city">Ciudad</label>
              <input
                id="register-city"
                className="form-control"
                type="text"
                placeholder="Bogotá"
                value={city}
                onChange={e => setCity(e.target.value)}
                autoComplete="address-level2"
              />
            </div>
          </div>

          <div className="mt-3">
            <label className="form-label" htmlFor="register-address">Dirección</label>
            <input
              id="register-address"
              className="form-control"
              type="text"
              placeholder="Calle 123 # 45-67"
              value={address}
              onChange={e => setAddress(e.target.value)}
              autoComplete="street-address"
            />
          </div>

          <div className="mt-3">
            <label className="form-label" htmlFor="register-password">Contraseña</label>
            <input
              id="register-password"
              className="form-control"
              type="password"
              placeholder="Crea una contraseña segura"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-100">Crear cuenta</button>
        </form>

        {error && <p className="text-danger mt-3 mb-0">{error}</p>}

        <div className="auth-footer">
          <span>¿Ya tienes cuenta?</span>
          <Link to="/login" className="auth-link">Inicia sesión</Link>
        </div>
      </div>
    </div>
  )
}
