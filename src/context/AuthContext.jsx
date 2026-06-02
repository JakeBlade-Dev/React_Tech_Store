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
        const storedProfile = getStoredProfile(firebaseUser.uid)
        const backendProfile = await getUsuarioByFirebaseUid(firebaseUser.uid)
        const nextUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          ...storedProfile,
          ...backendProfile,
        }

        localStorage.setItem('token', token)
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
