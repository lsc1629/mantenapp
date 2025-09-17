import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { 
  Plus, 
  Search, 
  Globe,
  Calendar,
  AlertTriangle,
  Users,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Key,
  Copy
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { apiService } from '@/services/api'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Modal, ModalFooter } from '@/components/ui/Modal'
import { Client, CreateClientData } from '@/types'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const createClientSchema = z.object({
  siteName: z.string().min(1, 'Nombre del sitio requerido'),
  siteUrl: z.string().url('URL inválida'),
  description: z.string().optional(),
  contactName: z.string().optional(),
  contactEmail: z.string().email('Email inválido').optional().or(z.literal(''))
})

type CreateClientFormData = z.infer<typeof createClientSchema>

const ClientsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [showApiKeyModal, setShowApiKeyModal] = useState(false)

  const queryClient = useQueryClient()

  // Query para obtener clientes
  const { data: clientsData, isLoading } = useQuery({
    queryKey: ['clients', { search: searchTerm, status: statusFilter }],
    queryFn: () => apiService.getClients({
      search: searchTerm || undefined,
      status: statusFilter || undefined,
      limit: 50
    })
  })

  // Mutation para crear cliente
  const createClientMutation = useMutation({
    mutationFn: (data: CreateClientData) => apiService.createClient(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      setShowCreateModal(false)
      toast.success('Cliente creado exitosamente')
    }
  })

  // Mutation para eliminar cliente
  const deleteClientMutation = useMutation({
    mutationFn: (id: string) => apiService.deleteClient(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      toast.success('Cliente eliminado exitosamente')
    }
  })

  // Mutation para regenerar API key
  const regenerateApiKeyMutation = useMutation({
    mutationFn: (id: string) => apiService.regenerateApiKey(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      setSelectedClient(prev => prev ? { ...prev, apiKey: data.data.apiKey } : null)
      toast.success('API Key regenerada exitosamente')
    }
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<CreateClientFormData>({
    resolver: zodResolver(createClientSchema)
  })

  const clients = clientsData?.data?.clients || []

  const onCreateClient = (data: CreateClientFormData) => {
    createClientMutation.mutate(data)
  }

  const handleDeleteClient = (client: Client) => {
    if (window.confirm(`¿Estás seguro de eliminar el cliente "${client.siteName}"?`)) {
      deleteClientMutation.mutate(client.id)
    }
  }

  const handleShowApiKey = (client: Client) => {
    setSelectedClient(client)
    setShowApiKeyModal(true)
  }

  const handleCopyApiKey = (apiKey: string) => {
    navigator.clipboard.writeText(apiKey)
    toast.success('API Key copiada al portapapeles')
  }

  const handleRegenerateApiKey = () => {
    if (selectedClient && window.confirm('¿Estás seguro de regenerar la API Key? La anterior dejará de funcionar.')) {
      regenerateApiKeyMutation.mutate(selectedClient.id)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Activo</Badge>
      case 'inactive':
        return <Badge variant="gray">Inactivo</Badge>
      case 'suspended':
        return <Badge variant="danger">Suspendido</Badge>
      default:
        return <Badge variant="gray">{status}</Badge>
    }
  }

  const getLastSyncStatus = (lastSync: string | null) => {
    if (!lastSync) {
      return <Badge variant="gray">Nunca</Badge>
    }

    const syncDate = new Date(lastSync)
    const now = new Date()
    const diffHours = (now.getTime() - syncDate.getTime()) / (1000 * 60 * 60)

    if (diffHours < 1) {
      return <Badge variant="success">Hace menos de 1h</Badge>
    } else if (diffHours < 24) {
      return <Badge variant="primary">Hace {Math.floor(diffHours)}h</Badge>
    } else {
      return <Badge variant="warning">Hace {Math.floor(diffHours / 24)}d</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-600">Gestiona todos los sitios WordPress conectados</p>
        </div>
        <Button 
          variant="primary" 
          icon={Plus}
          onClick={() => {
            reset()
            setShowCreateModal(true)
          }}
        >
          Agregar Cliente
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardBody>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar por nombre o URL..."
                leftIcon={Search}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-48">
              <select
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">Todos los estados</option>
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
                <option value="suspended">Suspendidos</option>
              </select>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Lista de clientes */}
      {clients.length === 0 ? (
        <Card>
          <CardBody className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay clientes</h3>
            <p className="text-gray-600 mb-6">Comienza agregando tu primer sitio WordPress para monitorear</p>
            <Button 
              variant="primary" 
              icon={Plus}
              onClick={() => setShowCreateModal(true)}
            >
              Agregar Primer Cliente
            </Button>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {clients.map((client: Client, index: number) => (
            <motion.div
              key={client.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card hover className="h-full">
                <CardBody>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">
                          {client.siteName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{client.siteName}</h3>
                        <a 
                          href={client.siteUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-primary-600 hover:text-primary-700 flex items-center"
                        >
                          {new URL(client.siteUrl).hostname}
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(client.status)}
                      {client.alertCount && client.alertCount > 0 && (
                        <Badge variant="warning">
                          {client.alertCount} alertas
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Última sincronización:</span>
                      {getLastSyncStatus(client.lastSync)}
                    </div>

                    {client.contactName && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Contacto:</span>
                        <span className="text-gray-900">{client.contactName}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Registrado:</span>
                      <span className="text-gray-900">
                        {new Date(client.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Key}
                      onClick={() => handleShowApiKey(client)}
                    >
                      API Key
                    </Button>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={Edit}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={Trash2}
                        onClick={() => handleDeleteClient(client)}
                        className="text-danger-600 hover:text-danger-700"
                      >
                        Eliminar
                      </Button>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal para crear cliente */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Agregar Nuevo Cliente"
        size="lg"
      >
        <form onSubmit={handleSubmit(onCreateClient)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Nombre del Sitio"
              placeholder="Mi Sitio WordPress"
              required
              {...register('siteName')}
              error={errors.siteName?.message}
            />
            <Input
              label="URL del Sitio"
              placeholder="https://ejemplo.com"
              required
              {...register('siteUrl')}
              error={errors.siteUrl?.message}
            />
          </div>

          <Input
            label="Descripción"
            placeholder="Descripción opcional del sitio"
            {...register('description')}
            error={errors.description?.message}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Nombre de Contacto"
              placeholder="Juan Pérez"
              {...register('contactName')}
              error={errors.contactName?.message}
            />
            <Input
              label="Email de Contacto"
              type="email"
              placeholder="contacto@ejemplo.com"
              {...register('contactEmail')}
              error={errors.contactEmail?.message}
            />
          </div>

          <ModalFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowCreateModal(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={createClientMutation.isPending}
            >
              Crear Cliente
            </Button>
          </ModalFooter>
        </form>
      </Modal>

      {/* Modal para mostrar API Key */}
      <Modal
        isOpen={showApiKeyModal}
        onClose={() => setShowApiKeyModal(false)}
        title="API Key del Cliente"
        size="lg"
      >
        {selectedClient && (
          <div className="space-y-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">{selectedClient.siteName}</h3>
              <p className="text-sm text-gray-600">{selectedClient.siteUrl}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Key
              </label>
              <div className="flex items-center space-x-2">
                <Input
                  value={selectedClient.apiKey}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  icon={Copy}
                  onClick={() => handleCopyApiKey(selectedClient.apiKey)}
                >
                  Copiar
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Proporciona esta clave al administrador del sitio WordPress
              </p>
            </div>

            <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-warning-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-warning-800">Importante</h4>
                  <p className="text-sm text-warning-700 mt-1">
                    Esta API Key es única y secreta. No la compartas públicamente.
                    Si sospechas que ha sido comprometida, regenera una nueva.
                  </p>
                </div>
              </div>
            </div>

            <ModalFooter>
              <Button
                variant="secondary"
                onClick={() => setShowApiKeyModal(false)}
              >
                Cerrar
              </Button>
              <Button
                variant="warning"
                onClick={handleRegenerateApiKey}
                loading={regenerateApiKeyMutation.isPending}
              >
                Regenerar API Key
              </Button>
            </ModalFooter>
          </div>
        )}
      </Modal>
    </div>
  )
}

export { ClientsPage }
