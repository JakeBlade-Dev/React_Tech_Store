const adminEmails = (import.meta.env.VITE_ADMIN_EMAILS || '')
  .split(',')
  .map(email => email.trim().toLowerCase())
  .filter(Boolean)

export function isAdminUser(user) {
  if (!user) return false

  const role = String(user.role || user.rol || '').toLowerCase()
  if (role === 'admin') return true

  if (user.isAdmin === true) return true

  const email = String(user.email || '').toLowerCase()
  return adminEmails.includes(email)
}