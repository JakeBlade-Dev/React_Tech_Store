import { initializeApp } from 'firebase/app'

import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut as firebaseSignOut,
  updateProfile
} from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyC8Zup7oB8tjTg2DNJeDAaxkk9c-MWej68",
  authDomain: "techstore360.firebaseapp.com",
  projectId: "techstore360",
  storageBucket: "techstore360.firebasestorage.app",
  messagingSenderId: "961796766267",
  appId: "1:961796766267:web:05bf22d7c60f8bf28d3a1e"
}

const app = initializeApp(firebaseConfig)

const auth = getAuth(app)

export async function login(email, password) {

  const cred = await signInWithEmailAndPassword(
    auth,
    email,
    password
  )

  const token = await cred.user.getIdToken()

  localStorage.setItem('token', token)

  return cred.user
}

export async function register(email, password, profile = {}) {

  const cred = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  )

  const displayName = [profile.firstName, profile.lastName].filter(Boolean).join(' ').trim()

  if (displayName) {
    await updateProfile(cred.user, { displayName })
  }

  const token = await cred.user.getIdToken()

  localStorage.setItem('token', token)
  localStorage.setItem(`profile:${cred.user.uid}`, JSON.stringify({
    uid: cred.user.uid,
    email,
    displayName,
    ...profile
  }))

  return cred.user
}

export function logout() {
  const currentUser = auth.currentUser
  localStorage.removeItem('token')
  clearStoredProfile(currentUser?.uid)
  return firebaseSignOut(auth)
}

export function getToken() {
  return localStorage.getItem('token')
}

export function getStoredProfile(uid) {
  if (!uid) return null

  const profile = localStorage.getItem(`profile:${uid}`)
  return profile ? JSON.parse(profile) : null
}

export function clearStoredProfile(uid) {
  if (uid) {
    localStorage.removeItem(`profile:${uid}`)
  }
}

export function onSessionChanged(callback) {
  return onAuthStateChanged(auth, callback)
}

export { auth }
