import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'

import Dashboard from './pages/Dashboard'
import Users from './pages/Users'
import Products from './pages/Products'
import Purchases from './pages/Purchases'
import AdminLayout from './components/AdminLayout'
import AdminGuard from './components/AdminGuard'
import { AuthProvider } from './context/AuthContext'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />

        <Route path="/admin" element={<AdminGuard><AdminLayout /></AdminGuard>}>
          <Route index element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="products" element={<Products />} />
          <Route path="purchases" element={<Purchases />} />
        </Route>
        <Route path="/users" element={<Navigate to="/admin/users" replace />} />
        <Route path="/products" element={<Navigate to="/admin/products" replace />} />
        <Route path="/purchases" element={<Navigate to="/admin/purchases" replace />} />
      </Routes>
    </AuthProvider>
  )
}
