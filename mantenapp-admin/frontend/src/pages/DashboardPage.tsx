import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { 
  Users, 
  AlertTriangle, 
  Activity, 
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'
import { apiService } from '@/services/api'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Button } from '@/components/ui/Button'

const DashboardPage: React.FC = () => {
  // Queries para obtener datos del dashboard
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => apiService.getDashboardStats()
  })

  const { data: recentActivity, isLoading: activityLoading } = useQuery({
    queryKey: ['dashboard', 'recent-activity'],
    queryFn: () => apiService.getRecentActivity(5)
  })

  const { data: systemHealth, isLoading: healthLoading } = useQuery({
    queryKey: ['dashboard', 'system-health'],
    queryFn: () => apiService.getSystemHealth()
  })

  if (statsLoading || activityLoading || healthLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const dashboardStats = stats?.data || {
    clients: { total: 0, activePercentage: 0 },
    alerts: { active: 0, critical: 0 },
    sync: { recent: 0 },
  }
  const activity = recentActivity?.data || {
    recentClients: [],
    recentAlerts: []
  }
  const health = systemHealth?.data || {
    healthScore: 0,
    status: 'unknown',
    recommendations: []
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Resumen general de tu plataforma MantenApp</p>
        </div>
        <Button variant="primary">
          Actualizar Datos
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-primary-500/10 rounded-full -mr-10 -mt-10" />
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Clientes</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {dashboardStats.clients?.total || 0}
                  </p>
                  <p className="text-sm text-success-600 flex items-center mt-1">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    {dashboardStats.clients?.activePercentage || 0}% activos
                  </p>
                </div>
                <div className="p-3 bg-primary-100 rounded-full">
                  <Users className="w-6 h-6 text-primary-600" />
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-warning-500/10 rounded-full -mr-10 -mt-10" />
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Alertas Activas</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {dashboardStats.alerts?.active || 0}
                  </p>
                  <p className="text-sm text-warning-600 flex items-center mt-1">
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    {dashboardStats.alerts?.critical || 0} críticas
                  </p>
                </div>
                <div className="p-3 bg-warning-100 rounded-full">
                  <AlertTriangle className="w-6 h-6 text-warning-600" />
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-success-500/10 rounded-full -mr-10 -mt-10" />
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Sincronizaciones</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {dashboardStats.sync?.recent || 0}
                  </p>
                  <p className="text-sm text-success-600 flex items-center mt-1">
                    <Activity className="w-4 h-4 mr-1" />
                    Últimas 24h
                  </p>
                </div>
                <div className="p-3 bg-success-100 rounded-full">
                  <Activity className="w-6 h-6 text-success-600" />
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-secondary-500/10 rounded-full -mr-10 -mt-10" />
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Estado Sistema</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {health.healthScore || '--'}
                  </p>
                  <Badge 
                    variant={
                      health.status === 'excellent' ? 'success' :
                      health.status === 'good' ? 'primary' :
                      health.status === 'fair' ? 'warning' : 'gray'
                    }
                    size="sm"
                    className="mt-1"
                  >
                    {health.status === 'excellent' ? 'Excelente' :
                     health.status === 'good' ? 'Bueno' :
                     health.status === 'fair' ? 'Regular' : 
                     health.status === 'unknown' ? 'Sin datos' : 'Crítico'}
                  </Badge>
                </div>
                <div className="p-3 bg-secondary-100 rounded-full">
                  <CheckCircle className="w-6 h-6 text-secondary-600" />
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Actividad Reciente */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Actividad Reciente</h3>
            </CardHeader>
            <CardBody className="space-y-4">
              {activity.recentClients?.length > 0 ? (
                activity.recentClients.map((client: any) => (
                  <div key={client.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {client.siteName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{client.siteName}</p>
                        <p className="text-sm text-gray-500">
                          {client.lastSync ? `Sincronizado ${new Date(client.lastSync).toLocaleString()}` : 'Sin sincronizar'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {client.alertCount > 0 && (
                        <Badge variant="warning" size="sm">
                          {client.alertCount} alertas
                        </Badge>
                      )}
                      <div className={`w-3 h-3 rounded-full ${
                        client.status === 'active' ? 'bg-success-500' : 'bg-gray-400'
                      }`} />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="font-medium">No hay clientes conectados</p>
                  <p className="text-sm mt-1">Los clientes aparecerán aquí cuando instalen el plugin</p>
                </div>
              )}
            </CardBody>
          </Card>
        </motion.div>

        {/* Alertas Recientes */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Alertas Recientes</h3>
            </CardHeader>
            <CardBody className="space-y-4">
              {activity.recentAlerts?.length > 0 ? (
                activity.recentAlerts.map((alert: any) => (
                  <div key={alert.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`p-2 rounded-full ${
                      alert.severity === 'critical' ? 'bg-danger-100' :
                      alert.severity === 'high' ? 'bg-warning-100' :
                      alert.severity === 'medium' ? 'bg-primary-100' : 'bg-gray-100'
                    }`}>
                      {alert.severity === 'critical' ? (
                        <XCircle className="w-4 h-4 text-danger-600" />
                      ) : alert.severity === 'high' ? (
                        <AlertTriangle className="w-4 h-4 text-warning-600" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-primary-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{alert.title}</p>
                      <p className="text-sm text-gray-600">{alert.client.siteName}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(alert.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <Badge 
                      variant={
                        alert.severity === 'critical' ? 'danger' :
                        alert.severity === 'high' ? 'warning' :
                        alert.severity === 'medium' ? 'primary' : 'gray'
                      }
                      size="sm"
                    >
                      {alert.severity === 'critical' ? 'Crítica' :
                       alert.severity === 'high' ? 'Alta' :
                       alert.severity === 'medium' ? 'Media' : 'Baja'}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="font-medium">No hay alertas</p>
                  <p className="text-sm mt-1">Las alertas de tus sitios aparecerán aquí</p>
                </div>
              )}
            </CardBody>
          </Card>
        </motion.div>
      </div>

      {/* Recomendaciones del Sistema */}
      {health.recommendations?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Recomendaciones del Sistema</h3>
            </CardHeader>
            <CardBody className="space-y-3">
              {health.recommendations.map((rec: any, index: number) => (
                <div key={index} className={`p-4 rounded-lg border-l-4 ${
                  rec.type === 'critical' ? 'bg-danger-50 border-danger-500' :
                  rec.type === 'warning' ? 'bg-warning-50 border-warning-500' :
                  rec.type === 'info' ? 'bg-primary-50 border-primary-500' :
                  'bg-success-50 border-success-500'
                }`}>
                  <div className="flex items-start space-x-3">
                    <div className={`p-1 rounded-full ${
                      rec.type === 'critical' ? 'bg-danger-100' :
                      rec.type === 'warning' ? 'bg-warning-100' :
                      rec.type === 'info' ? 'bg-primary-100' :
                      'bg-success-100'
                    }`}>
                      {rec.type === 'critical' ? (
                        <XCircle className="w-4 h-4 text-danger-600" />
                      ) : rec.type === 'warning' ? (
                        <AlertTriangle className="w-4 h-4 text-warning-600" />
                      ) : rec.type === 'info' ? (
                        <AlertCircle className="w-4 h-4 text-primary-600" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-success-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{rec.message}</p>
                      <p className="text-sm text-gray-600 mt-1">{rec.action}</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>
        </motion.div>
      )}
    </div>
  )
}

export { DashboardPage }
