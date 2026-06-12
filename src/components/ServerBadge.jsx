import React, { useState, useEffect } from 'react'

export default function ServerBadge() {
  const [serverInfo, setServerInfo] = useState('Verificando servidor...')
  const [isError, setIsError] = useState(false)

  useEffect(() => {
    async function checkServer() {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || '/api'
        // Remove trailing slash if exists to avoid double slash
        const baseUrl = apiUrl.replace(/\/+$/, '')
        
        const res = await fetch(`${baseUrl}/`)
        if (!res.ok) throw new Error('Error al conectar')
        
        const data = await res.json()
        
        if (data.mensaje && data.mensaje.includes('Aiven')) {
          setServerInfo('Aiven (Réplica)')
        } else if (data.mensaje && data.mensaje.includes('Supabase')) {
          setServerInfo('Supabase (Principal)')
        } else {
          setServerInfo('Conectado al API')
        }
        setIsError(false)
      } catch (e) {
        setServerInfo('Desconectado')
        setIsError(true)
      }
    }

    checkServer()
    
    // Check every 10 seconds to catch failovers in real time
    const intervalId = setInterval(checkServer, 10000)
    return () => clearInterval(intervalId)
  }, [])

  return (
    <div 
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        backgroundColor: isError ? 'var(--error-color, #ef4444)' : 'var(--surface-color)',
        color: isError ? 'white' : 'var(--text-color)',
        padding: '8px 16px',
        borderRadius: '50px',
        boxShadow: 'var(--shadow-md)',
        fontSize: '0.85rem',
        fontWeight: '500',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        zIndex: 9999,
        border: `1px solid ${isError ? 'transparent' : 'var(--border-color)'}`
      }}
    >
      <div 
        style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: isError ? 'white' : (serverInfo.includes('Supabase') ? '#10b981' : '#f59e0b'),
          boxShadow: '0 0 8px currentColor'
        }}
      />
      {serverInfo}
    </div>
  )
}
