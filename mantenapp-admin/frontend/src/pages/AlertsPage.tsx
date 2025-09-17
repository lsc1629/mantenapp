import React, { useState, useEffect } from 'react'
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock,
  Search,
  ExternalLink,
  AlertCircle,
  Shield,
  Zap,
  RefreshCw,
  Palette
} from 'lucide-react'
// import { toast } from 'react-hot-toast'
import { apiService } from '@/services/api'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Modal, ModalFooter } from '@/components/ui/Modal'
import { Alert } from '@/types'

const AlertsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('active')
  const [severityFilter, setSeverityFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [selectedAlerts, setSelectedAlerts] = useState<string[]>([])
  const [showBulkModal, setShowBulkModal] = useState(false)
  
  // Estados para datos
  const [alertsData, setAlertsData] = useState<any>(null)
  const [statsData, setStatsData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Función para mostrar notificaciones simples
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    console.log(`${type.toUpperCase()}: ${message}`)
    // Aquí podrías implementar una notificación visual simple
  }

  // Cargar datos de alertas
  const loadAlerts = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await apiService.getAlerts({
        status: statusFilter || undefined,
        severity: severityFilter || undefined,
        limit: 50
      })
      setAlertsData(data)
    } catch (error) {
      console.error('Error loading alerts:', error)
      setError('Error al cargar las alertas. Verifica que el servidor esté ejecutándose.')
      // Datos mock para desarrollo cuando no hay backend
      setAlertsData({
        success: true,
        data: {
          alerts: [],
          pagination: { currentPage: 1, totalPages: 1, totalCount: 0 }
        }
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Cargar estadísticas
  const loadStats = async () => {
    try {
      const data = await apiService.getAlertStats()
      setStatsData(data)
    } catch (error) {
      console.error('Error loading stats:', error)
      // Datos mock para desarrollo cuando no hay backend
      setStatsData({
        success: true,
        data: {
          total: 0,
          byStatus: { active: 0, resolved: 0, dismissed: 0 },
          bySeverity: { critical: 0, high: 0, medium: 0, low: 0 },
          byType: [],
          recent: 0
        }
      })
    }
  }

  // Actualizar alerta
  const updateAlert = async (id: string, status: 'resolved' | 'dismissed') => {
    try {
      setIsUpdating(true)
      await apiService.updateAlert(id, { status })
      showToast('Alerta actualizada exitosamente')
      loadAlerts()
      loadStats()
    } catch (error) {
      showToast('Error al actualizar alerta', 'error')
    } finally {
      setIsUpdating(false)
    }
  }

  // Actualización masiva
  const bulkUpdate = async (alertIds: string[], status: 'resolved' | 'dismissed') => {
    try {
      setIsUpdating(true)
      await apiService.bulkUpdateAlerts({ alertIds, status })
      setSelectedAlerts([])
      setShowBulkModal(false)
      showToast('Alertas actualizadas exitosamente')
      loadAlerts()
      loadStats()
    } catch (error) {
      showToast('Error al actualizar alertas', 'error')
    } finally {
      setIsUpdating(false)
    }
  }

  // Cargar datos al montar el componente y cuando cambien los filtros
  useEffect(() => {
    console.log('🔄 Cargando alertas...')
    loadAlerts()
    loadStats()
  }, [statusFilter, severityFilter, typeFilter])

  // Debug: mostrar estado actual
  useEffect(() => {
    console.log('📊 Estado actual:', { isLoading, error, alertsData, statsData })
  }, [isLoading, error, alertsData, statsData])

  const alerts = alertsData?.data?.alerts || []
  const stats = statsData?.data || {}

  // Filtrar alertas por término de búsqueda
  const filteredAlerts = alerts.filter((alert: Alert) => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    return (
      alert.title.toLowerCase().includes(searchLower) ||
      alert.message.toLowerCase().includes(searchLower) ||
      alert.client.siteName.toLowerCase().includes(searchLower) ||
      alert.alertType.toLowerCase().includes(searchLower)
    )
  })

  const handleSelectAlert = (alertId: string) => {
    setSelectedAlerts(prev => 
      prev.includes(alertId) 
        ? prev.filter(id => id !== alertId)
        : [...prev, alertId]
    )
  }

  const handleSelectAll = () => {
    if (selectedAlerts.length === filteredAlerts.length) {
      setSelectedAlerts([])
    } else {
      setSelectedAlerts(filteredAlerts.map((alert: Alert) => alert.id))
    }
  }

  const handleUpdateAlert = (alertId: string, status: 'resolved' | 'dismissed') => {
    updateAlert(alertId, status)
  }

  const handleBulkUpdate = (status: 'resolved' | 'dismissed') => {
    if (selectedAlerts.length === 0) return
    bulkUpdate(selectedAlerts, status)
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="w-5 h-5 text-danger-600" />
      case 'high':
        return <AlertTriangle className="w-5 h-5 text-warning-600" />
      case 'medium':
        return <AlertCircle className="w-5 h-5 text-primary-600" />
      case 'low':
        return <Clock className="w-5 h-5 text-gray-600" />
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'core_update':
        return <RefreshCw className="w-4 h-4" />
      case 'plugin_update':
        return <Zap className="w-4 h-4" />
      case 'theme_update':
        return <Palette className="w-4 h-4" />
      case 'security':
        return <Shield className="w-4 h-4" />
      case 'performance':
        return <Clock className="w-4 h-4" />
      default:
        return <AlertCircle className="w-4 h-4" />
    }
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge variant="danger">Crítica</Badge>
      case 'high':
        return <Badge variant="warning">Alta</Badge>
      case 'medium':
        return <Badge variant="primary">Media</Badge>
      case 'low':
        return <Badge variant="gray">Baja</Badge>
      default:
        return <Badge variant="gray">{severity}</Badge>
    }
  }

  const getTypeBadge = (type: string) => {
    const typeLabels: Record<string, string> = {
      core_update: 'WordPress',
      plugin_update: 'Plugin',
      theme_update: 'Tema',
      security: 'Seguridad',
      performance: 'Rendimiento'
    }
    return <Badge variant="secondary">{typeLabels[type] || type}</Badge>
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // Mostrar error si existe
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Alertas</h1>
            <p className="text-gray-600">Monitorea y gestiona todas las alertas de tus sitios</p>
          </div>
        </div>
        
        <Card>
          <CardBody className="text-center py-12">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error de Conexión</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button 
              variant="primary" 
              onClick={() => {
                setError(null)
                loadAlerts()
                loadStats()
              }}
            >
              Reintentar
            </Button>
          </CardBody>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div 
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Alertas</h1>
          <p className="text-gray-600">Monitorea y gestiona todas las alertas de tus sitios</p>
        </div>
        {selectedAlerts.length > 0 && (
          <Button 
            variant="primary"
            onClick={() => setShowBulkModal(true)}
          >
            Gestionar {selectedAlerts.length} alertas
          </Button>
        )}
      </motion.div>

      {/* Estadísticas */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total || 0}</p>
              </div>
              <div className="p-3 bg-gray-100 rounded-full">
                <AlertTriangle className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Activas</p>
                <p className="text-2xl font-bold text-warning-600">{stats.byStatus?.active || 0}</p>
              </div>
              <div className="p-3 bg-warning-100 rounded-full">
                <AlertTriangle className="w-6 h-6 text-warning-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Críticas</p>
                <p className="text-2xl font-bold text-danger-600">{stats.bySeverity?.critical || 0}</p>
              </div>
              <div className="p-3 bg-danger-100 rounded-full">
                <XCircle className="w-6 h-6 text-danger-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Resueltas</p>
                <p className="text-2xl font-bold text-success-600">{stats.byStatus?.resolved || 0}</p>
              </div>
              <div className="p-3 bg-success-100 rounded-full">
                <CheckCircle className="w-6 h-6 text-success-600" />
              </div>
            </div>
          </CardBody>
        </Card>
      </motion.div>

      {/* Filtros */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
        <CardBody>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar alertas..."
                leftIcon={Search}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:w-auto">
              <select
                className="rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="active">Activas</option>
                <option value="resolved">Resueltas</option>
                <option value="dismissed">Descartadas</option>
              </select>
              
              <select
                className="rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
              >
                <option value="">Todas las severidades</option>
                <option value="critical">Críticas</option>
                <option value="high">Altas</option>
                <option value="medium">Medias</option>
                <option value="low">Bajas</option>
              </select>
              
              <select
                className="rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="">Todos los tipos</option>
                <option value="core_update">WordPress</option>
                <option value="plugin_update">Plugins</option>
                <option value="theme_update">Temas</option>
                <option value="security">Seguridad</option>
                <option value="performance">Rendimiento</option>
              </select>
            </div>
          </div>
        </CardBody>
        </Card>
      </motion.div>

      {/* Lista de alertas */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        {filteredAlerts.length === 0 ? (
          <Card>
          <CardBody className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {statusFilter === 'active' ? '¡Excelente! No hay alertas activas' : 'No hay alertas en esta categoría'}
            </h3>
            <p className="text-gray-600">
              {statusFilter === 'active' 
                ? 'Todos tus sitios están funcionando correctamente' 
                : 'Prueba con otros filtros para ver más alertas'
              }
            </p>
          </CardBody>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Alertas ({filteredAlerts.length})
              </h3>
              {statusFilter === 'active' && (
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedAlerts.length === filteredAlerts.length}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-600">Seleccionar todas</span>
                </div>
              )}
            </div>
          </CardHeader>
          <CardBody className="space-y-4">
            {filteredAlerts.map((alert: Alert, index: number) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`p-4 rounded-lg border-l-4 ${
                  alert.severity === 'critical' ? 'bg-danger-50 border-danger-500' :
                  alert.severity === 'high' ? 'bg-warning-50 border-warning-500' :
                  alert.severity === 'medium' ? 'bg-primary-50 border-primary-500' :
                  'bg-gray-50 border-gray-500'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    {statusFilter === 'active' && (
                      <input
                        type="checkbox"
                        checked={selectedAlerts.includes(alert.id)}
                        onChange={() => handleSelectAlert(alert.id)}
                        className="mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                    )}
                    
                    <div className="flex-shrink-0 mt-1">
                      {getSeverityIcon(alert.severity)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-medium text-gray-900">{alert.title}</h4>
                        {getSeverityBadge(alert.severity)}
                        {getTypeBadge(alert.alertType)}
                      </div>
                      
                      <p className="text-gray-700 mb-3">{alert.message}</p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <span>Cliente:</span>
                          <a 
                            href={alert.client.siteUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary-600 hover:text-primary-700 flex items-center"
                          >
                            {alert.client.siteName}
                            <ExternalLink className="w-3 h-3 ml-1" />
                          </a>
                        </div>
                        <div className="flex items-center space-x-1">
                          {getTypeIcon(alert.alertType)}
                          <span>{new Date(alert.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {statusFilter === 'active' && (
                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => handleUpdateAlert(alert.id, 'resolved')}
                        loading={isUpdating}
                      >
                        Resolver
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleUpdateAlert(alert.id, 'dismissed')}
                        loading={isUpdating}
                      >
                        Descartar
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </CardBody>
        </Card>
        )}
      </motion.div>

      {/* Modal para acciones masivas */}
      <Modal
        isOpen={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        title="Gestionar Alertas Seleccionadas"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Has seleccionado <strong>{selectedAlerts.length}</strong> alertas. 
            ¿Qué acción deseas realizar?
          </p>
          
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="success"
              onClick={() => handleBulkUpdate('resolved')}
              loading={isUpdating}
              fullWidth
            >
              Marcar como Resueltas
            </Button>
            <Button
              variant="secondary"
              onClick={() => handleBulkUpdate('dismissed')}
              loading={isUpdating}
              fullWidth
            >
              Descartar Todas
            </Button>
          </div>
        </div>
        
        <ModalFooter>
          <Button
            variant="ghost"
            onClick={() => setShowBulkModal(false)}
          >
            Cancelar
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  )
}

export { AlertsPage }
