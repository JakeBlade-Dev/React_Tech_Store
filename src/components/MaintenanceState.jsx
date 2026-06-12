import React from 'react'

export default function MaintenanceState({ 
  title = "Servicio no disponible", 
  message = "Estamos realizando tareas de mantenimiento o experimentando intermitencias. Vuelve a intentarlo en unos instantes.",
  onRetry = null
}) {
  return (
    <div className="surface-card p-5 mt-4 text-center d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '350px' }}>
      <div 
        className="mb-4 d-flex align-items-center justify-content-center" 
        style={{ 
          width: '80px', 
          height: '80px', 
          borderRadius: '50%', 
          backgroundColor: '#fee2e2',
          color: '#ef4444'
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
      </div>
      <h3 className="mb-2">{title}</h3>
      <p className="text-muted mb-4" style={{ maxWidth: '400px' }}>{message}</p>
      
      {onRetry && (
        <button className="btn btn-primary" onClick={onRetry}>
          <div className="d-flex align-items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10"></polyline>
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
            </svg>
            Reintentar
          </div>
        </button>
      )}
    </div>
  )
}
