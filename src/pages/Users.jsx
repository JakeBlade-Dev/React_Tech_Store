import React, { useEffect, useState } from 'react'
import { authFetch, deleteUsuario, updateUsuario, reactivateUsuario } from '../utils/api'

const emptyForm = {
  id: '',
  nombre: '',
  correo: '',
  rol: 'cliente',
}

export default function Users(){
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [actionMessage, setActionMessage] = useState('')

  async function loadUsers() {
    const data = await authFetch('/usuarios')
    setList(Array.isArray(data) ? data : [])
  }

  useEffect(() => {
    (async () => {
      try{
        setLoading(true)
        await loadUsers()
      } catch(e) {
        setErr(e.message)
      } finally {
        setLoading(false)
      }
    })()
  },[])

  function resetForm() {
    setForm(emptyForm)
    setActionMessage('')
    setErr(null)
  }

  function editUser(user) {
    setForm({
      id: user.id || '',
      nombre: user.nombre || user.name || user.displayName || '',
      correo: user.correo || user.email || '',
      rol: user.rol || user.role || 'cliente',
    })
    setActionMessage('')
    setErr(null)
  }

  async function handleSubmit(e) {
    e.preventDefault()

    try {
      setSaving(true)
      setErr(null)
      setActionMessage('')

      await updateUsuario(form.id, {
        nombre: form.nombre.trim(),
        correo: form.correo.trim(),
        rol: form.rol,
      })

      setActionMessage('Usuario actualizado correctamente.')
      resetForm()
      await loadUsers()
    } catch (e) {
      setErr(e.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(user) {
    const userId = user.id
    const confirmed = window.confirm(`¿Desactivar a ${user.nombre || user.name || user.email || 'este usuario'}?`)
    if (!confirmed) return

    try {
      setErr(null)
      setActionMessage('')
      await deleteUsuario(userId)
      setActionMessage('Usuario desactivado correctamente.')
      if (form.id === userId) {
        resetForm()
      }
      await loadUsers()
    } catch (e) {
      setErr(e.message)
    }
  }

  async function handleReactivate(user) {
    const userId = user.id
    const confirmed = window.confirm(`¿Volver a activar a ${user.nombre || user.name || user.email || 'este usuario'}?`)
    if (!confirmed) return
    try {
      setErr(null)
      setActionMessage('')
      await reactivateUsuario(userId)
      setActionMessage('Usuario activado correctamente.')
      await loadUsers()
    } catch (e) {
      setErr(e.message)
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header surface-card">
        <div>
          <p className="auth-kicker">Administración</p>
          <h2 className="mb-0">Usuarios</h2>
          <p className="mb-0 admin-page-copy">Consulta las cuentas registradas, cambia su rol y elimina accesos obsoletos.</p>
        </div>
      </div>

      {loading && <p className="mt-3 mb-0">Cargando usuarios...</p>}
      {err && <p className="text-danger mt-3 mb-0">{err}</p>}
      {!err && actionMessage && <p className="text-success mt-3 mb-0">{actionMessage}</p>}

      {!loading && !err && (
        <div className="admin-panels-grid mt-3">
          <div className="surface-card admin-panel">
            <div className="admin-panel-header">
              <div>
                <p className="auth-kicker mb-1">Formulario</p>
                <h3 className="mb-0">{form.id ? 'Editar usuario' : 'Selecciona un usuario'}</h3>
              </div>
            </div>

            <form className="d-grid gap-3" onSubmit={handleSubmit}>
              <div>
                <label className="form-label" htmlFor="user-name">Nombre</label>
                <input
                  id="user-name"
                  className="form-control"
                  value={form.nombre}
                  onChange={e => setForm(prev => ({ ...prev, nombre: e.target.value }))}
                  placeholder="Nombre completo"
                  required
                />
              </div>

              <div>
                <label className="form-label" htmlFor="user-email">Correo</label>
                <input
                  id="user-email"
                  className="form-control"
                  type="email"
                  value={form.correo}
                  onChange={e => setForm(prev => ({ ...prev, correo: e.target.value }))}
                  placeholder="usuario@correo.com"
                  required
                />
              </div>

              <div>
                <label className="form-label" htmlFor="user-role">Rol</label>
                <select
                  id="user-role"
                  className="form-select"
                  value={form.rol}
                  onChange={e => setForm(prev => ({ ...prev, rol: e.target.value }))}
                >
                  <option value="cliente">Cliente</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="d-flex gap-2 flex-wrap">
                <button type="submit" className="btn btn-primary" disabled={saving || !form.id}>
                  {saving ? 'Guardando...' : 'Actualizar usuario'}
                </button>
                <button type="button" className="btn btn-outline-secondary" onClick={resetForm}>
                  Limpiar
                </button>
              </div>
              <small className="text-muted">Selecciona un usuario de la tabla para habilitar la actualización.</small>
            </form>
          </div>

          <div className="surface-card admin-table-card">
            <div className="table-responsive">
              <table className="table align-middle admin-table mb-0">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Correo</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map(user => {
                    const userId = user.id || user.firebase_uid || user.uid
                    const isEliminado = user.eliminado === true || user.eliminado === "true" || user.eliminado === 1

                    return (
                      <tr key={userId || user.email} style={{ opacity: isEliminado ? 0.6 : 1 }}>
                        <td>{user.nombre || user.name || user.displayName || '-'}</td>
                        <td>{user.correo || user.email || '-'}</td>
                        <td>{user.rol || user.role || 'cliente'}</td>
                        <td>
                          {isEliminado ? (
                            <span className="badge text-bg-secondary">Desactivado</span>
                          ) : (
                            <span className="badge text-bg-success">Activo</span>
                          )}
                        </td>
                        <td>
                          <div className="d-flex gap-2 flex-wrap">
                            <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => editUser(user)} disabled={isEliminado}>
                              Editar
                            </button>
                            {isEliminado ? (
                              <button type="button" className="btn btn-success btn-sm" onClick={() => handleReactivate(user)}>
                                Activar
                              </button>
                            ) : (
                              <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(user)}>
                                Desactivar
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
