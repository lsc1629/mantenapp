import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useEffect } from 'react'
import { apiService } from '@/services/api'
import { User, LoginCredentials, RegisterData } from '@/types'
import { toast } from 'react-hot-toast'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  
  // Actions
  login: (credentials: LoginCredentials) => Promise<void>
  register: (userData: RegisterData) => Promise<void>
  logout: () => void
  refreshToken: () => Promise<void>
  updateUser: (userData: Partial<User>) => void
  checkAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,

      login: async (credentials: LoginCredentials) => {
        try {
          console.log('🔄 Iniciando login...', credentials)
          set({ isLoading: true })
          
          const response = await apiService.login(credentials)
          console.log('📡 Respuesta del login:', response)
          
          if (response.success) {
            const { user, token } = response.data
            
            // Guardar token en localStorage
            localStorage.setItem('mantenapp_token', token)
            
            console.log('✅ Actualizando estado de autenticación...', { user, token })
            set({
              user,
              token,
              isAuthenticated: true,
              isLoading: false
            })
            
            console.log('🎉 Login exitoso, estado actualizado')
            toast.success(`¡Bienvenido, ${user.name}!`)
          }
        } catch (error: any) {
          console.error('❌ Error en login:', error)
          set({ isLoading: false })
          const errorMessage = error.response?.data?.error?.message || 'Error al iniciar sesión'
          toast.error(errorMessage)
          throw error
        }
      },

      register: async (userData: RegisterData) => {
        try {
          set({ isLoading: true })
          
          const response = await apiService.register(userData)
          
          if (response.success) {
            const { user, token } = response.data
            
            // Guardar token en localStorage
            localStorage.setItem('mantenapp_token', token)
            
            set({
              user,
              token,
              isAuthenticated: true,
              isLoading: false
            })
            
            toast.success(`¡Cuenta creada exitosamente! Bienvenido, ${user.name}!`)
          }
        } catch (error: any) {
          set({ isLoading: false })
          const errorMessage = error.response?.data?.error?.message || 'Error al crear la cuenta'
          toast.error(errorMessage)
          throw error
        }
      },

      logout: () => {
        // Llamar al endpoint de logout (opcional, para logging)
        apiService.logout().catch(() => {
          // Ignorar errores del logout
        })
        
        // Limpiar estado local
        localStorage.removeItem('mantenapp_token')
        localStorage.removeItem('mantenapp_user')
        
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false
        })
        
        toast.success('Sesión cerrada exitosamente')
      },

      refreshToken: async () => {
        try {
          const response = await apiService.refreshToken()
          
          if (response.success) {
            const { token } = response.data
            
            localStorage.setItem('mantenapp_token', token)
            
            set({ token })
          }
        } catch (error) {
          // Si falla el refresh, cerrar sesión
          get().logout()
        }
      },

      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user
        if (currentUser) {
          set({
            user: { ...currentUser, ...userData }
          })
        }
      },

      checkAuth: async () => {
        try {
          const token = localStorage.getItem('mantenapp_token')
          
          if (!token) {
            set({ isLoading: false, isAuthenticated: false })
            return
          }
          
          // Verificar token con el servidor
          const response = await apiService.getMe()
          
          if (response.success) {
            set({
              user: response.data.user,
              token,
              isAuthenticated: true,
              isLoading: false
            })
          } else {
            // Token inválido
            localStorage.removeItem('mantenapp_token')
            set({
              user: null,
              token: null,
              isAuthenticated: false,
              isLoading: false
            })
          }
        } catch (error) {
          // Error al verificar token
          localStorage.removeItem('mantenapp_token')
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false
          })
        }
      }
    }),
    {
      name: 'mantenapp-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      }),
      onRehydrateStorage: () => (state) => {
        console.log('🔄 Zustand rehydrated:', state)
        if (state) {
          state.isLoading = false
        }
      }
    }
  )
)

// Hook para inicializar la autenticación al cargar la app
export const useInitAuth = () => {
  const checkAuth = useAuthStore(state => state.checkAuth)
  
  useEffect(() => {
    checkAuth()
  }, [checkAuth])
}
