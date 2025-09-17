import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { toast } from 'react-hot-toast'

// Configuración base de la API
const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001/api/v1'

class ApiService {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // Request interceptor - agregar token de autenticación
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('mantenapp_token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor - manejar errores globalmente
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        return response
      },
      (error) => {
        // Manejar errores de autenticación
        if (error.response?.status === 401) {
          localStorage.removeItem('mantenapp_token')
          localStorage.removeItem('mantenapp_user')
          window.location.href = '/login'
          return Promise.reject(error)
        }

        // Manejar otros errores
        const errorMessage = error.response?.data?.error?.message || 
                           error.response?.data?.message || 
                           error.message || 
                           'Error desconocido'

        // No mostrar toast para errores de validación (400) ya que se manejan en los formularios
        if (error.response?.status !== 400) {
          toast.error(errorMessage)
        }

        return Promise.reject(error)
      }
    )
  }

  // Métodos HTTP genéricos
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get(url, config)
    return response.data
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post(url, data, config)
    return response.data
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put(url, data, config)
    return response.data
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch(url, data, config)
    return response.data
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete(url, config)
    return response.data
  }

  // Métodos de autenticación
  async login(credentials: { email: string; password: string }) {
    return this.post('/auth/login', credentials)
  }

  async register(userData: { name: string; email: string; password: string }) {
    return this.post('/auth/register', userData)
  }

  async getMe() {
    return this.get('/auth/me')
  }

  async changePassword(data: { currentPassword: string; newPassword: string }) {
    return this.post('/auth/change-password', data)
  }

  async logout() {
    return this.post('/auth/logout')
  }

  async refreshToken() {
    return this.get('/auth/refresh')
  }

  // Métodos de dashboard
  async getDashboardStats() {
    return this.get('/dashboard/stats')
  }

  async getRecentActivity(limit?: number) {
    return this.get('/dashboard/recent-activity', { params: { limit } })
  }

  async getSyncActivity(days?: number) {
    return this.get('/dashboard/charts/sync-activity', { params: { days } })
  }

  async getAlertsDistribution() {
    return this.get('/dashboard/charts/alerts-distribution')
  }

  async getSystemHealth() {
    return this.get('/dashboard/system-health')
  }

  // Métodos de clientes
  async getClients(params?: {
    page?: number
    limit?: number
    status?: string
    search?: string
  }) {
    return this.get('/clients', { params })
  }

  async getClient(id: string) {
    return this.get(`/clients/${id}`)
  }

  async createClient(data: {
    siteName: string
    siteUrl: string
    description?: string
    contactName?: string
    contactEmail?: string
  }) {
    return this.post('/clients', data)
  }

  async updateClient(id: string, data: {
    siteName?: string
    siteUrl?: string
    description?: string
    contactName?: string
    contactEmail?: string
    status?: 'active' | 'inactive' | 'suspended'
  }) {
    return this.put(`/clients/${id}`, data)
  }

  async deleteClient(id: string) {
    return this.delete(`/clients/${id}`)
  }

  async regenerateApiKey(id: string) {
    return this.post(`/clients/${id}/regenerate-api-key`)
  }

  async getClientSiteData(id: string, type?: string) {
    return this.get(`/clients/${id}/site-data`, { params: { type } })
  }

  // Métodos de alertas
  async getAlerts(params?: { page?: number; limit?: number; status?: string; severity?: string }) {
    return this.get('/alerts', { params })
  }

  async getAlert(id: string) {
    return this.get(`/alerts/${id}`)
  }

  async updateAlert(id: string, data: { status?: 'active' | 'resolved' | 'dismissed' }) {
    return this.patch(`/alerts/${id}`, data)
  }

  async deleteAlert(id: string) {
    return this.delete(`/alerts/${id}`)
  }

  async getAlertStats() {
    return this.get('/alerts/stats')
  }

  async bulkUpdateAlerts(data: {
    alertIds: string[]
    status: 'active' | 'resolved' | 'dismissed'
  }) {
    return this.post('/alerts/bulk-update', data)
  }

  // Método para subir archivos
  async uploadFile(file: File, endpoint: string, onProgress?: (progress: number) => void) {
    const formData = new FormData()
    formData.append('file', file)

    return this.post(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(progress)
        }
      },
    })
  }

  // Método para descargar archivos
  async downloadFile(url: string, filename?: string) {
    const response = await this.client.get(url, {
      responseType: 'blob',
    })

    const blob = new Blob([response.data])
    const downloadUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = filename || 'download'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(downloadUrl)
  }
}

// Instancia singleton de la API
export const apiService = new ApiService()

// Exportar también la clase para casos especiales
export { ApiService }
