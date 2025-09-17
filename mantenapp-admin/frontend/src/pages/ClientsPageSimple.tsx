import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { 
  Plus, 
  Search, 
  Globe,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Key,
  Copy,
  X
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { apiService } from '@/services/api'

interface Client {
  id: string
  siteName: string
  siteUrl: string
  description?: string
  contactName?: string
  contactEmail?: string
  status: 'active' | 'inactive' | 'suspended'
  apiKey: string
  lastSync?: string
  alertCount: number
  createdAt: string
}

const ClientsPageSimple: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showApiKeyModal, setShowApiKeyModal] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const queryClient = useQueryClient()

  // Form state para crear cliente
  const [formData, setFormData] = useState({
    siteName: '',
    siteUrl: '',
    description: '',
    contactName: '',
    contactEmail: ''
  })

  // Query para obtener clientes
  const { data: clientsData, isLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: () => apiService.getClients()
  })

  // Mutation para crear cliente
  const createClientMutation = useMutation({
    mutationFn: (data: any) => apiService.createClient(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      setShowCreateModal(false)
      setFormData({ siteName: '', siteUrl: '', description: '', contactName: '', contactEmail: '' })
      toast.success('Cliente creado exitosamente')
      
      // Mostrar API key del nuevo cliente
      setSelectedClient(response.data.client)
      setShowApiKeyModal(true)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Error al crear cliente')
    }
  })

  // Mutation para eliminar cliente
  const deleteClientMutation = useMutation({
    mutationFn: (id: string) => apiService.deleteClient(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      toast.success('Cliente eliminado exitosamente')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Error al eliminar cliente')
    }
  })

  const clients = clientsData?.data?.clients || []
  const filteredClients = clients.filter((client: Client) =>
    client.siteName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.siteUrl.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.siteName || !formData.siteUrl) {
      toast.error('Nombre del sitio y URL son requeridos')
      return
    }
    createClientMutation.mutate(formData)
  }

  const handleDeleteClient = (client: Client) => {
    if (window.confirm(`¿Estás seguro de eliminar el cliente "${client.siteName}"?`)) {
      deleteClientMutation.mutate(client.id)
    }
  }

  const copyApiKey = (apiKey: string) => {
    navigator.clipboard.writeText(apiKey)
    toast.success('API Key copiada al portapapeles')
  }

  const cardStyle = {
    background: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    border: '1px solid #e5e7eb',
    marginBottom: '16px'
  }

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    fontSize: '14px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    outline: 'none',
    transition: 'all 0.2s',
    marginBottom: '16px'
  }

  const buttonStyle = (variant: 'primary' | 'secondary' | 'danger' = 'primary') => ({
    padding: '12px 24px',
    fontSize: '14px',
    fontWeight: '600',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    border: 'none',
    ...(variant === 'primary' && {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white'
    }),
    ...(variant === 'secondary' && {
      background: '#f3f4f6',
      color: '#374151',
      border: '1px solid #d1d5db'
    }),
    ...(variant === 'danger' && {
      background: '#ef4444',
      color: 'white'
    })
  })

  const modalStyle = {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  }

  const modalContentStyle = {
    background: 'white',
    borderRadius: '12px',
    padding: '32px',
    maxWidth: '500px',
    width: '90%',
    maxHeight: '90vh',
    overflow: 'auto'
  }

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <div>Cargando clientes...</div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#111827', margin: '0 0 8px 0' }}>
            Clientes
          </h1>
          <p style={{ color: '#6b7280', margin: 0 }}>
            Gestiona los sitios web conectados a MantenApp
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          style={buttonStyle('primary')}
        >
          <Plus style={{ width: '16px', height: '16px', marginRight: '8px', display: 'inline' }} />
          Nuevo Cliente
        </button>
      </div>

      {/* Barra de búsqueda */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ position: 'relative', maxWidth: '400px' }}>
          <Search style={{ 
            position: 'absolute', 
            left: '16px', 
            top: '50%', 
            transform: 'translateY(-50%)', 
            width: '20px', 
            height: '20px', 
            color: '#6b7280' 
          }} />
          <input
            type="text"
            placeholder="Buscar clientes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              ...inputStyle,
              paddingLeft: '48px',
              marginBottom: 0
            }}
          />
        </div>
      </div>

      {/* Lista de clientes */}
      {filteredClients.length === 0 ? (
        <div style={cardStyle}>
          <div style={{ textAlign: 'center', padding: '48px 24px' }}>
            <Globe style={{ width: '48px', height: '48px', color: '#d1d5db', margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: '0 0 8px 0' }}>
              {searchTerm ? 'No se encontraron clientes' : 'No hay clientes conectados'}
            </h3>
            <p style={{ color: '#6b7280', margin: '0 0 24px 0' }}>
              {searchTerm 
                ? 'Intenta con otros términos de búsqueda'
                : 'Crea tu primer cliente para comenzar a monitorear sitios web'
              }
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowCreateModal(true)}
                style={buttonStyle('primary')}
              >
                Crear Primer Cliente
              </button>
            )}
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {filteredClients.map((client: Client) => (
            <motion.div
              key={client.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={cardStyle}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0 }}>
                      {client.siteName}
                    </h3>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '500',
                      ...(client.status === 'active' && { backgroundColor: '#dcfce7', color: '#166534' }),
                      ...(client.status === 'inactive' && { backgroundColor: '#fee2e2', color: '#991b1b' }),
                      ...(client.status === 'suspended' && { backgroundColor: '#fef3c7', color: '#92400e' })
                    }}>
                      {client.status === 'active' ? 'Activo' : 
                       client.status === 'inactive' ? 'Inactivo' : 'Suspendido'}
                    </span>
                  </div>
                  
                  <p style={{ color: '#6b7280', margin: '0 0 8px 0', fontSize: '14px' }}>
                    {client.siteUrl}
                  </p>
                  
                  {client.description && (
                    <p style={{ color: '#6b7280', margin: '0 0 16px 0', fontSize: '14px' }}>
                      {client.description}
                    </p>
                  )}
                  
                  <div style={{ display: 'flex', gap: '24px', fontSize: '14px' }}>
                    {client.alertCount > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#d97706' }}>
                        <AlertTriangle style={{ width: '16px', height: '16px' }} />
                        <span>{client.alertCount} alertas</span>
                      </div>
                    )}
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#6b7280' }}>
                      {client.lastSync ? (
                        <>
                          <CheckCircle style={{ width: '16px', height: '16px' }} />
                          <span>Sincronizado {new Date(client.lastSync).toLocaleDateString()}</span>
                        </>
                      ) : (
                        <>
                          <XCircle style={{ width: '16px', height: '16px' }} />
                          <span>Sin sincronizar</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => {
                      setSelectedClient(client)
                      setShowApiKeyModal(true)
                    }}
                    style={{
                      ...buttonStyle('secondary'),
                      padding: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    title="Ver API Key"
                  >
                    <Key style={{ width: '16px', height: '16px' }} />
                  </button>
                  
                  <button
                    onClick={() => handleDeleteClient(client)}
                    style={{
                      ...buttonStyle('danger'),
                      padding: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    title="Eliminar cliente"
                  >
                    <Trash2 style={{ width: '16px', height: '16px' }} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal para crear cliente */}
      {showCreateModal && (
        <div style={modalStyle}>
          <div style={modalContentStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
                Nuevo Cliente
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
              >
                <X style={{ width: '24px', height: '24px', color: '#6b7280' }} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  Nombre del Sitio *
                </label>
                <input
                  type="text"
                  value={formData.siteName}
                  onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
                  placeholder="Ej: Mi Sitio Web"
                  style={inputStyle}
                  required
                />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  URL del Sitio *
                </label>
                <input
                  type="url"
                  value={formData.siteUrl}
                  onChange={(e) => setFormData({ ...formData, siteUrl: e.target.value })}
                  placeholder="https://misitio.com"
                  style={inputStyle}
                  required
                />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  Descripción
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descripción opcional del sitio"
                  style={inputStyle}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  Nombre de Contacto
                </label>
                <input
                  type="text"
                  value={formData.contactName}
                  onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                  placeholder="Nombre del responsable"
                  style={inputStyle}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  Email de Contacto
                </label>
                <input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  placeholder="contacto@sitio.com"
                  style={inputStyle}
                />
              </div>
              
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={buttonStyle('secondary')}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={createClientMutation.isPending}
                  style={{
                    ...buttonStyle('primary'),
                    opacity: createClientMutation.isPending ? 0.7 : 1
                  }}
                >
                  {createClientMutation.isPending ? 'Creando...' : 'Crear Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para mostrar API Key */}
      {showApiKeyModal && selectedClient && (
        <div style={modalStyle}>
          <div style={modalContentStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
                API Key - {selectedClient.siteName}
              </h2>
              <button
                onClick={() => setShowApiKeyModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
              >
                <X style={{ width: '24px', height: '24px', color: '#6b7280' }} />
              </button>
            </div>
            
            <div style={{ 
              background: '#f9fafb', 
              border: '2px solid #e5e7eb', 
              borderRadius: '8px', 
              padding: '16px',
              marginBottom: '16px'
            }}>
              <p style={{ fontSize: '14px', fontWeight: '600', color: '#374151', margin: '0 0 8px 0' }}>
                Copia esta API Key para configurar el plugin en WordPress:
              </p>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                background: 'white',
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid #d1d5db'
              }}>
                <code style={{ 
                  flex: 1, 
                  fontSize: '14px', 
                  fontFamily: 'monospace',
                  wordBreak: 'break-all',
                  color: '#374151'
                }}>
                  {selectedClient.apiKey}
                </code>
                <button
                  onClick={() => copyApiKey(selectedClient.apiKey)}
                  style={{
                    ...buttonStyle('secondary'),
                    padding: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title="Copiar API Key"
                >
                  <Copy style={{ width: '16px', height: '16px' }} />
                </button>
              </div>
            </div>
            
            <div style={{ 
              background: '#eff6ff', 
              border: '2px solid #bfdbfe', 
              borderRadius: '8px', 
              padding: '16px',
              marginBottom: '24px'
            }}>
              <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#1e40af', margin: '0 0 8px 0' }}>
                Instrucciones:
              </h4>
              <ol style={{ fontSize: '14px', color: '#1d4ed8', margin: 0, paddingLeft: '20px' }}>
                <li>Instala el plugin MantenApp en tu sitio WordPress</li>
                <li>Ve a la configuración del plugin</li>
                <li>Pega esta API Key en el campo correspondiente</li>
                <li>Guarda la configuración</li>
                <li>¡Tu sitio estará conectado a MantenApp!</li>
              </ol>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowApiKeyModal(false)}
                style={buttonStyle('primary')}
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export { ClientsPageSimple }
