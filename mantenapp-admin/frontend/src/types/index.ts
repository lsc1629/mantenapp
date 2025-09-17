// Tipos de autenticación
export interface User {
  id: string
  name: string
  email: string
  role: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface AuthResponse {
  success: boolean
  message: string
  data: {
    user: User
    token: string
  }
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  name: string
  email: string
  password: string
}

// Tipos de clientes
export interface Client {
  id: string
  siteName: string
  siteUrl: string
  apiKey: string
  status: 'active' | 'inactive' | 'suspended'
  description?: string
  contactName?: string
  contactEmail?: string
  lastSync?: string
  createdAt: string
  updatedAt: string
  alertCount?: number
}

export interface CreateClientData {
  siteName: string
  siteUrl: string
  description?: string
  contactName?: string
  contactEmail?: string
}

export interface UpdateClientData extends Partial<CreateClientData> {
  status?: 'active' | 'inactive' | 'suspended'
}

// Tipos de alertas
export interface Alert {
  id: string
  clientId: string
  alertType: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  message: string
  status: 'active' | 'resolved' | 'dismissed'
  metadata?: Record<string, any>
  createdAt: string
  updatedAt: string
  resolvedAt?: string
  resolvedBy?: string
  client: {
    id: string
    siteName: string
    siteUrl: string
    status: string
  }
}

export interface AlertStats {
  total: number
  byStatus: {
    active: number
    resolved: number
    dismissed: number
  }
  bySeverity: {
    critical: number
    high: number
    medium: number
    low: number
  }
  byType: Array<{
    type: string
    count: number
  }>
  recent: number
}

// Tipos de datos del sitio
export interface SiteData {
  id: string
  clientId: string
  dataType: string
  dataContent: Record<string, any>
  collectedAt: string
}

// Tipos de dashboard
export interface DashboardStats {
  clients: {
    total: number
    active: number
    inactive: number
    activePercentage: number
    withAlerts: number
  }
  alerts: {
    total: number
    active: number
    critical: number
    alertsPercentage: number
  }
  sync: {
    recent: number
    syncPercentage: number
  }
}

export interface RecentActivity {
  recentClients: Array<Client & { alertCount: number }>
  recentAlerts: Alert[]
}

export interface ChartData {
  chartData: Array<{
    date: string
    syncs: number
  }>
}

export interface AlertsDistribution {
  byType: Array<{
    type: string
    count: number
  }>
  bySeverity: Array<{
    severity: string
    count: number
  }>
}

export interface SystemHealth {
  healthScore: number
  status: 'excellent' | 'good' | 'fair' | 'poor'
  issues: {
    staleClients: number
    criticalClients: number
  }
  recommendations: Array<{
    type: 'success' | 'info' | 'warning' | 'critical'
    message: string
    action: string
  }>
}

// Tipos de paginación
export interface PaginationMeta {
  currentPage: number
  totalPages: number
  totalCount: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export interface PaginatedResponse<T> {
  success: boolean
  data: {
    [key: string]: T[]
    pagination: PaginationMeta
  }
}

// Tipos de respuesta de API
export interface ApiResponse<T = any> {
  success: boolean
  message?: string
  data?: T
  error?: {
    message: string
    statusCode: number
    details?: any
  }
}

// Tipos de configuración
export interface Settings {
  [key: string]: any
}

// Tipos de notificación
export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  duration?: number
}

// Tipos de filtros
export interface ClientFilters {
  status?: string
  search?: string
  page?: number
  limit?: number
}

export interface AlertFilters {
  status?: string
  severity?: string
  type?: string
  clientId?: string
  page?: number
  limit?: number
}

// Tipos de formularios
export interface FormErrors {
  [key: string]: string | undefined
}

// Tipos de webhook
export interface WebhookData {
  apiKey: string
  siteInfo: {
    name: string
    url: string
    wpVersion: string
    phpVersion: string
    mysqlVersion?: string
    theme: {
      name: string
      version: string
      isActive: boolean
    }
    multisite?: boolean
  }
  plugins?: Array<{
    name: string
    version: string
    isActive: boolean
    hasUpdate?: boolean
  }>
  themes?: Array<{
    name: string
    version: string
    isActive: boolean
    hasUpdate?: boolean
  }>
  users?: {
    total: number
    administrators: number
    editors?: number
    authors?: number
    contributors?: number
    subscribers?: number
  }
  content?: {
    posts: number
    pages: number
    comments: number
    media: number
  }
  security?: {
    hasSSL: boolean
    wpVersion: string
    hasSecurityPlugins?: boolean
    adminUserExists?: boolean
  }
  performance?: {
    memoryLimit: string
    maxExecutionTime: string
    uploadMaxFilesize: string
    postMaxSize?: string
  }
  updates?: {
    core: number
    plugins: number
    themes: number
  }
}
