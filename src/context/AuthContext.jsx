import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, getStoredProfile } from '../firebase'
import { isAdminUser } from '../utils/admin'
import { getUsuarioByFirebaseUid } from '../utils/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async firebaseUser => {
      if (firebaseUser) {
        const token = await firebaseUser.getIdToken()
        localStorage.setItem('token', token)
        const storedProfile = getStoredProfile(firebaseUser.uid)
        let backendProfile = null
        let backendError = null
        
        try {
          backendProfile = await getUsuarioByFirebaseUid(firebaseUser.uid)
        } catch (err) {
          console.error('Error crítico al obtener perfil del backend:', err)
          backendError = err.message || 'Error de red'
        }

        const nextUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          ...storedProfile,
          ...(backendProfile || {}),
          backendError
        }

        localStorage.setItem(`profile:${firebaseUser.uid}`, JSON.stringify(nextUser))
        setUser({
          ...nextUser,
          isAdmin: isAdminUser(nextUser),
        })
      } else {
        localStorage.removeItem('token')
        setUser(null)
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const value = useMemo(() => ({ user, loading }), [user, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}
