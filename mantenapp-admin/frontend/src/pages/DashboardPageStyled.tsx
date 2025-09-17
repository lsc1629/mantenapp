import React from 'react'
import { Users, AlertTriangle, Activity, TrendingUp, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

const DashboardPageStyled: React.FC = () => {
  // Datos mock para mostrar el dashboard
  const mockStats = {
    clients: { total: 3, activePercentage: 100 },
    alerts: { active: 4, critical: 2 },
    sync: { recent: 25 },
    health: { healthScore: 85, status: 'good' }
  }

  const mockActivity = {
    recentClients: [
      { id: 1, siteName: 'Sitio Web Ejemplo 1', lastSync: new Date(), alertCount: 2, status: 'active' },
      { id: 2, siteName: 'Blog Personal', lastSync: new Date(), alertCount: 2, status: 'active' },
      { id: 3, siteName: 'Tienda Online', lastSync: new Date(), alertCount: 0, status: 'active' }
    ],
    recentAlerts: [
      { 
        id: 1, 
        title: 'Vulnerabilidad de seguridad detectada', 
        severity: 'critical', 
        client: { siteName: 'Blog Personal' }, 
        createdAt: new Date() 
      },
      { 
        id: 2, 
        title: 'Actualizaciones de plugins disponibles', 
        severity: 'medium', 
        client: { siteName: 'Sitio Web Ejemplo 1' }, 
        createdAt: new Date() 
      },
      { 
        id: 3, 
        title: 'Actualización de WordPress disponible', 
        severity: 'high', 
        client: { siteName: 'Sitio Web Ejemplo 1' }, 
        createdAt: new Date() 
      },
      { 
        id: 4, 
        title: 'Rendimiento del sitio degradado', 
        severity: 'medium', 
        client: { siteName: 'Blog Personal' }, 
        createdAt: new Date() 
      }
    ]
  }

  const cardStyle = {
    background: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    border: '1px solid #e5e7eb'
  }

  const badgeStyle = (variant: string) => ({
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 8px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '500',
    ...(variant === 'success' && { backgroundColor: '#dcfce7', color: '#166534' }),
    ...(variant === 'warning' && { backgroundColor: '#fef3c7', color: '#92400e' }),
    ...(variant === 'danger' && { backgroundColor: '#fee2e2', color: '#991b1b' }),
    ...(variant === 'primary' && { backgroundColor: '#dbeafe', color: '#1e40af' })
  })

  return (
    <div style={{ padding: '24px', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '32px' 
      }}>
        <div>
          <h1 style={{ 
            fontSize: '32px', 
            fontWeight: 'bold', 
            color: '#111827', 
            margin: '0 0 8px 0' 
          }}>
            Dashboard
          </h1>
          <p style={{ 
            color: '#6b7280', 
            margin: 0, 
            fontSize: '16px' 
          }}>
            Resumen general de tu plataforma MantenApp
          </p>
        </div>
        <button style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          padding: '12px 24px',
          fontSize: '14px',
          fontWeight: '600',
          cursor: 'pointer',
          boxShadow: '0 4px 14px 0 rgba(102, 126, 234, 0.3)'
        }}>
          Actualizar Datos
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '24px', 
        marginBottom: '32px' 
      }}>
        {/* Total Clientes */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', margin: '0 0 8px 0' }}>
                Total Clientes
              </p>
              <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#111827', margin: '0 0 8px 0' }}>
                {mockStats.clients.total}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', color: '#059669' }}>
                <TrendingUp style={{ width: '16px', height: '16px', marginRight: '4px' }} />
                <span style={{ fontSize: '14px' }}>{mockStats.clients.activePercentage}% activos</span>
              </div>
            </div>
            <div style={{ 
              padding: '12px', 
              backgroundColor: '#eff6ff', 
              borderRadius: '12px' 
            }}>
              <Users style={{ width: '24px', height: '24px', color: '#2563eb' }} />
            </div>
          </div>
        </div>

        {/* Alertas Activas */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', margin: '0 0 8px 0' }}>
                Alertas Activas
              </p>
              <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#111827', margin: '0 0 8px 0' }}>
                {mockStats.alerts.active}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', color: '#d97706' }}>
                <AlertTriangle style={{ width: '16px', height: '16px', marginRight: '4px' }} />
                <span style={{ fontSize: '14px' }}>{mockStats.alerts.critical} críticas</span>
              </div>
            </div>
            <div style={{ 
              padding: '12px', 
              backgroundColor: '#fef3c7', 
              borderRadius: '12px' 
            }}>
              <AlertTriangle style={{ width: '24px', height: '24px', color: '#d97706' }} />
            </div>
          </div>
        </div>

        {/* Sincronizaciones */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', margin: '0 0 8px 0' }}>
                Sincronizaciones
              </p>
              <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#111827', margin: '0 0 8px 0' }}>
                {mockStats.sync.recent}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', color: '#059669' }}>
                <Activity style={{ width: '16px', height: '16px', marginRight: '4px' }} />
                <span style={{ fontSize: '14px' }}>Últimas 24h</span>
              </div>
            </div>
            <div style={{ 
              padding: '12px', 
              backgroundColor: '#dcfce7', 
              borderRadius: '12px' 
            }}>
              <Activity style={{ width: '24px', height: '24px', color: '#059669' }} />
            </div>
          </div>
        </div>

        {/* Estado Sistema */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', margin: '0 0 8px 0' }}>
                Estado Sistema
              </p>
              <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#111827', margin: '0 0 8px 0' }}>
                {mockStats.health.healthScore}%
              </p>
              <span style={badgeStyle('success')}>
                Excelente
              </span>
            </div>
            <div style={{ 
              padding: '12px', 
              backgroundColor: '#dcfce7', 
              borderRadius: '12px' 
            }}>
              <CheckCircle style={{ width: '24px', height: '24px', color: '#059669' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Actividad y Alertas */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
        gap: '24px' 
      }}>
        {/* Actividad Reciente */}
        <div style={cardStyle}>
          <h3 style={{ 
            fontSize: '20px', 
            fontWeight: '600', 
            color: '#111827', 
            margin: '0 0 24px 0' 
          }}>
            Actividad Reciente
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {mockActivity.recentClients.map((client) => (
              <div key={client.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px',
                backgroundColor: '#f9fafb',
                borderRadius: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: '600'
                  }}>
                    {client.siteName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p style={{ fontWeight: '500', color: '#111827', margin: '0 0 4px 0' }}>
                      {client.siteName}
                    </p>
                    <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                      Sincronizado {client.lastSync.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {client.alertCount > 0 && (
                    <span style={badgeStyle('warning')}>
                      {client.alertCount} alertas
                    </span>
                  )}
                  <div style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: client.status === 'active' ? '#10b981' : '#6b7280'
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alertas Recientes */}
        <div style={cardStyle}>
          <h3 style={{ 
            fontSize: '20px', 
            fontWeight: '600', 
            color: '#111827', 
            margin: '0 0 24px 0' 
          }}>
            Alertas Recientes
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {mockActivity.recentAlerts.map((alert) => (
              <div key={alert.id} style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                padding: '16px',
                backgroundColor: '#f9fafb',
                borderRadius: '8px'
              }}>
                <div style={{
                  padding: '8px',
                  borderRadius: '8px',
                  backgroundColor: alert.severity === 'critical' ? '#fee2e2' :
                                  alert.severity === 'high' ? '#fef3c7' :
                                  alert.severity === 'medium' ? '#dbeafe' : '#f3f4f6'
                }}>
                  {alert.severity === 'critical' ? (
                    <XCircle style={{ width: '16px', height: '16px', color: '#dc2626' }} />
                  ) : alert.severity === 'high' ? (
                    <AlertTriangle style={{ width: '16px', height: '16px', color: '#d97706' }} />
                  ) : (
                    <AlertCircle style={{ width: '16px', height: '16px', color: '#2563eb' }} />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: '500', color: '#111827', margin: '0 0 4px 0' }}>
                    {alert.title}
                  </p>
                  <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 4px 0' }}>
                    {alert.client.siteName}
                  </p>
                  <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>
                    {alert.createdAt.toLocaleString()}
                  </p>
                </div>
                <span style={badgeStyle(
                  alert.severity === 'critical' ? 'danger' :
                  alert.severity === 'high' ? 'warning' :
                  alert.severity === 'medium' ? 'primary' : 'primary'
                )}>
                  {alert.severity === 'critical' ? 'Crítica' :
                   alert.severity === 'high' ? 'Alta' :
                   alert.severity === 'medium' ? 'Media' : 'Baja'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export { DashboardPageStyled }
