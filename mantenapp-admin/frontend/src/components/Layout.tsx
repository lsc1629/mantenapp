import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { 
  LayoutDashboard, 
  Users, 
  AlertTriangle, 
  Settings, 
  LogOut
} from 'lucide-react'

interface LayoutProps {
  children: React.ReactNode
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Clientes', icon: Users, path: '/clients' },
    { name: 'Alertas', icon: AlertTriangle, path: '/alerts' },
    { name: 'Configuración', icon: Settings, path: '/settings' },
  ]

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const sidebarStyle = {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    width: '280px',
    height: '100vh',
    backgroundColor: 'white',
    borderRight: '1px solid #e5e7eb',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column' as const,
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f9fafb' }}>

      {/* Sidebar */}
      <div style={sidebarStyle}>
        {/* Header del sidebar */}
        <div style={{ 
          padding: '24px', 
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '18px',
              fontWeight: 'bold'
            }}>
              M
            </div>
            <div>
              <h2 style={{ 
                fontSize: '18px', 
                fontWeight: 'bold', 
                color: '#111827', 
                margin: 0 
              }}>
                MantenApp
              </h2>
              <p style={{ 
                fontSize: '12px', 
                color: '#6b7280', 
                margin: 0 
              }}>
                Admin Panel
              </p>
            </div>
          </div>
        </div>

        {/* Navegación */}
        <nav style={{ flex: 1, padding: '24px 0' }}>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path
            const Icon = item.icon
            
            return (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path)
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 24px',
                  border: 'none',
                  background: isActive ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent',
                  color: isActive ? 'white' : '#6b7280',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  textAlign: 'left',
                  transition: 'all 0.2s ease-in-out',
                  borderRadius: isActive ? '0 25px 25px 0' : '0',
                  marginRight: isActive ? '24px' : '0'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = '#f3f4f6'
                    e.currentTarget.style.color = '#374151'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent'
                    e.currentTarget.style.color = '#6b7280'
                  }
                }}
              >
                <Icon style={{ width: '20px', height: '20px' }} />
                {item.name}
              </button>
            )
          })}
        </nav>

        {/* Usuario y logout */}
        <div style={{ 
          padding: '24px', 
          borderTop: '1px solid #e5e7eb' 
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px', 
            marginBottom: '16px' 
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '14px',
              fontWeight: 'bold'
            }}>
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div>
              <p style={{ 
                fontSize: '14px', 
                fontWeight: '500', 
                color: '#111827', 
                margin: 0 
              }}>
                {user?.name || 'Administrador'}
              </p>
              <p style={{ 
                fontSize: '12px', 
                color: '#6b7280', 
                margin: 0 
              }}>
                {user?.email || 'admin@mantenapp.com'}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              border: '1px solid #e5e7eb',
              background: 'white',
              color: '#6b7280',
              cursor: 'pointer',
              fontSize: '14px',
              borderRadius: '6px',
              transition: 'all 0.2s ease-in-out'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#fee2e2'
              e.currentTarget.style.borderColor = '#fca5a5'
              e.currentTarget.style.color = '#dc2626'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'white'
              e.currentTarget.style.borderColor = '#e5e7eb'
              e.currentTarget.style.color = '#6b7280'
            }}
          >
            <LogOut style={{ width: '16px', height: '16px' }} />
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Contenido principal */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        marginLeft: '280px'
      }}>

        {/* Contenido */}
        <main style={{ 
          flex: 1, 
          padding: '24px',
          backgroundColor: '#f9fafb',
          minHeight: '100vh'
        }}>
          {children}
        </main>
      </div>
    </div>
  )
}
