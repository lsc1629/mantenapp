import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardBody } from '@/components/ui/Card'
import { toast } from 'react-hot-toast'

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Contraseña requerida')
})

type LoginFormData = z.infer<typeof loginSchema>

const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)
  const [debugLogs, setDebugLogs] = useState<string[]>([])
  const navigate = useNavigate()
  const { login, register, isAuthenticated, user } = useAuthStore()

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    const logMessage = `[${timestamp}] ${message}`
    setDebugLogs(prev => [...prev, logMessage])
    console.log(logMessage)
  }

  // Log inicial para verificar que el sistema funciona
  React.useEffect(() => {
    addLog('🟢 Sistema de logs iniciado correctamente')
  }, [])

  const {
    register: registerField,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      addLog('📝 Iniciando login con formulario...')
      addLog(`📧 Email: ${data.email}`)
      
      if (isRegistering) {
        const name = (data as any).name
        addLog('👤 Modo registro activado')
        await register({ ...data, name })
        addLog('✅ Registro completado')
        setTimeout(() => navigate('/dashboard'), 100)
      } else {
        addLog('🔐 Enviando credenciales al servidor...')
        await login(data)
        
        addLog('✅ Login completado, verificando estado...')
        const currentState = useAuthStore.getState()
        addLog(`📊 Estado: isAuth=${currentState.isAuthenticated}, user=${currentState.user?.name || 'null'}`)
        
        if (currentState.isAuthenticated) {
          addLog('🎉 Estado actualizado correctamente, redirigiendo...')
          setTimeout(() => {
            window.location.href = '/dashboard'
          }, 200)
        } else {
          addLog('❌ ERROR: Estado no se actualizó después del login')
        }
      }
    } catch (error: any) {
      addLog(`❌ ERROR en login: ${error.message || error}`)
      if (error.response?.data) {
        addLog(`📡 Respuesta servidor: ${JSON.stringify(error.response.data)}`)
      }
      
      if (error.response?.data?.error?.details) {
        const details = error.response.data.error.details
        details.forEach((detail: any) => {
          setError(detail.field as keyof LoginFormData, {
            message: detail.message
          })
        })
      }
    }
  }

  const handleQuickLogin = async () => {
    try {
      addLog('🔄 Función handleQuickLogin iniciada...')
      addLog('🚀 Iniciando login rápido con admin@mantenapp.com...')
      
      await login({
        email: 'admin@mantenapp.com',
        password: 'admin123'
      })
      
      addLog('✅ Login completado, verificando estado...')
      const currentState = useAuthStore.getState()
      addLog(`📊 Estado: isAuth=${currentState.isAuthenticated}, user=${currentState.user?.name || 'null'}`)
      
      if (currentState.isAuthenticated) {
        addLog('🎉 Estado actualizado correctamente, redirigiendo...')
        setTimeout(() => {
          addLog('🔄 Ejecutando redirección...')
          window.location.href = '/dashboard'
        }, 200)
      } else {
        addLog('❌ ERROR: Estado no se actualizó después del login')
      }
    } catch (error: any) {
      addLog(`❌ ERROR GENERAL: ${error.message || error.toString()}`)
      addLog(`❌ Stack: ${error.stack || 'No stack available'}`)
      if (error.response?.data) {
        addLog(`📡 Respuesta servidor: ${JSON.stringify(error.response.data)}`)
      }
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        {/* Logo y título */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mx-auto w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mb-4 shadow-lg"
          >
            <span className="text-white font-bold text-2xl">M</span>
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">MantenApp</h1>
          <p className="text-gray-600">
            {isRegistering ? 'Crea tu cuenta para comenzar' : 'Inicia sesión en tu dashboard'}
          </p>
          {!isRegistering && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800 font-medium">Credenciales de prueba:</p>
              <p className="text-sm text-blue-700">Email: admin@mantenapp.com</p>
              <p className="text-sm text-blue-700">Contraseña: admin123</p>
            </div>
          )}
        </div>

        {/* Formulario */}
        <Card>
          <CardBody>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {isRegistering && (
                <Input
                  label="Nombre completo"
                  placeholder="Tu nombre"
                  required
                  {...registerField('name' as any)}
                  error={(errors as any).name?.message}
                />
              )}

              <Input
                label="Email"
                type="email"
                placeholder="tu@email.com"
                leftIcon={Mail}
                required
                {...registerField('email')}
                error={errors.email?.message}
              />

              <Input
                label="Contraseña"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                leftIcon={Lock}
                rightIcon={showPassword ? EyeOff : Eye}
                onRightIconClick={togglePasswordVisibility}
                required
                {...registerField('password')}
                error={errors.password?.message}
              />

              <Button
                type="submit"
                loading={isSubmitting}
                fullWidth
                size="lg"
                className="mt-6"
              >
                {isRegistering ? 'Crear Cuenta' : 'Iniciar Sesión'}
              </Button>

              {!isRegistering && (
                <>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      addLog('🖱️ Botón Login Rápido clickeado!')
                      handleQuickLogin()
                    }}
                    loading={isSubmitting}
                    fullWidth
                    size="lg"
                    className="mt-3"
                  >
                    🚀 Login Rápido (Demo)
                  </Button>
                  
                  {/* Botón HTML simple para test */}
                  <button
                    type="button"
                    onClick={() => {
                      addLog('🔧 Botón HTML simple clickeado!')
                      handleQuickLogin()
                    }}
                    style={{
                      width: '100%',
                      padding: '12px',
                      marginTop: '8px',
                      backgroundColor: '#f59e0b',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '16px',
                      cursor: 'pointer'
                    }}
                  >
                    🔧 TEST - Login Simple
                  </button>
                </>
              )}
            </form>

            {/* Toggle entre login y registro */}
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setIsRegistering(!isRegistering)}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                {isRegistering 
                  ? '¿Ya tienes cuenta? Inicia sesión' 
                  : '¿No tienes cuenta? Regístrate'
                }
              </button>
            </div>
          </CardBody>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            © 2024 MantenApp. Todos los derechos reservados.
          </p>
        </div>

        {/* Test de JavaScript */}
        <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-lg">
          <p className="text-sm text-red-800 font-medium">🧪 Test de JavaScript:</p>
          <button 
            onClick={() => alert('JavaScript funciona!')}
            className="mt-2 px-3 py-1 bg-red-500 text-white rounded text-sm"
          >
            Test Alert
          </button>
          <button 
            onClick={() => {
              console.log('Console log funciona!')
              addLog('🧪 Test directo funciona!')
            }}
            className="mt-2 ml-2 px-3 py-1 bg-blue-500 text-white rounded text-sm"
          >
            Test Log
          </button>
        </div>

        {/* Panel de Debug Logs */}
        {debugLogs.length > 0 && (
          <div className="mt-6 p-4 bg-gray-900 rounded-lg text-xs text-green-400 font-mono max-h-40 overflow-y-auto">
            <div className="flex justify-between items-center mb-2">
              <span className="text-white font-semibold">🔍 Debug Logs:</span>
              <button 
                onClick={() => setDebugLogs([])}
                className="text-red-400 hover:text-red-300 text-xs"
              >
                Limpiar
              </button>
            </div>
            {debugLogs.map((log, index) => (
              <div key={index} className="mb-1">
                {log}
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}

export { LoginPage }
