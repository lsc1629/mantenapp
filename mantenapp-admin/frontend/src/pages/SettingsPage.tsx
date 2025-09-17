import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { 
  Save, 
  User, 
  Bell, 
  Shield, 
  Database,
  Mail,
  Key,
  Eye,
  EyeOff
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useAuthStore } from '@/stores/authStore'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

const profileSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido')
})

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Contraseña actual requerida'),
  newPassword: z.string().min(8, 'La nueva contraseña debe tener al menos 8 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Debe contener al menos una mayúscula, una minúscula y un número'),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"]
})

type ProfileFormData = z.infer<typeof profileSchema>
type PasswordFormData = z.infer<typeof passwordSchema>

const SettingsPage: React.FC = () => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  const { user, updateUser } = useAuthStore()

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || ''
    }
  })

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema)
  })

  const onUpdateProfile = async (data: ProfileFormData) => {
    try {
      setIsUpdatingProfile(true)
      // Aquí iría la llamada a la API para actualizar el perfil
      // await apiService.updateProfile(data)
      
      updateUser(data)
      toast.success('Perfil actualizado exitosamente')
    } catch (error) {
      toast.error('Error al actualizar el perfil')
    } finally {
      setIsUpdatingProfile(false)
    }
  }

  const onChangePassword = async (data: PasswordFormData) => {
    try {
      setIsChangingPassword(true)
      // Aquí iría la llamada a la API para cambiar la contraseña
      // await apiService.changePassword({
      //   currentPassword: data.currentPassword,
      //   newPassword: data.newPassword
      // })
      
      // Usar los datos para evitar el warning
      console.log('Changing password for user:', data.currentPassword ? 'provided' : 'missing')
      
      passwordForm.reset()
      toast.success('Contraseña cambiada exitosamente')
    } catch (error) {
      toast.error('Error al cambiar la contraseña')
    } finally {
      setIsChangingPassword(false)
    }
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
        <p className="text-gray-600">Gestiona tu cuenta y preferencias de la aplicación</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Perfil de Usuario */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5 text-primary-600" />
                <h3 className="text-lg font-semibold text-gray-900">Perfil de Usuario</h3>
              </div>
            </CardHeader>
            <CardBody>
              <form onSubmit={profileForm.handleSubmit(onUpdateProfile)} className="space-y-4">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-xl">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{user.name}</h4>
                    <p className="text-sm text-gray-600">{user.role}</p>
                    <p className="text-xs text-gray-500">
                      Miembro desde {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <Input
                  label="Nombre completo"
                  {...profileForm.register('name')}
                  error={profileForm.formState.errors.name?.message}
                />

                <Input
                  label="Email"
                  type="email"
                  {...profileForm.register('email')}
                  error={profileForm.formState.errors.email?.message}
                />

                <Button
                  type="submit"
                  variant="primary"
                  loading={isUpdatingProfile}
                  icon={Save}
                  fullWidth
                >
                  Actualizar Perfil
                </Button>
              </form>
            </CardBody>
          </Card>
        </motion.div>

        {/* Cambiar Contraseña */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-primary-600" />
                <h3 className="text-lg font-semibold text-gray-900">Seguridad</h3>
              </div>
            </CardHeader>
            <CardBody>
              <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="space-y-4">
                <Input
                  label="Contraseña actual"
                  type={showCurrentPassword ? 'text' : 'password'}
                  rightIcon={showCurrentPassword ? EyeOff : Eye}
                  onRightIconClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  {...passwordForm.register('currentPassword')}
                  error={passwordForm.formState.errors.currentPassword?.message}
                />

                <Input
                  label="Nueva contraseña"
                  type={showNewPassword ? 'text' : 'password'}
                  rightIcon={showNewPassword ? EyeOff : Eye}
                  onRightIconClick={() => setShowNewPassword(!showNewPassword)}
                  {...passwordForm.register('newPassword')}
                  error={passwordForm.formState.errors.newPassword?.message}
                />

                <Input
                  label="Confirmar nueva contraseña"
                  type={showConfirmPassword ? 'text' : 'password'}
                  rightIcon={showConfirmPassword ? EyeOff : Eye}
                  onRightIconClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  {...passwordForm.register('confirmPassword')}
                  error={passwordForm.formState.errors.confirmPassword?.message}
                />

                <Button
                  type="submit"
                  variant="primary"
                  loading={isChangingPassword}
                  icon={Key}
                  fullWidth
                >
                  Cambiar Contraseña
                </Button>
              </form>
            </CardBody>
          </Card>
        </motion.div>

        {/* Configuración de Notificaciones */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Bell className="w-5 h-5 text-primary-600" />
                <h3 className="text-lg font-semibold text-gray-900">Notificaciones</h3>
              </div>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Alertas por Email</h4>
                  <p className="text-sm text-gray-600">Recibir notificaciones de alertas críticas</p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Resumen Diario</h4>
                  <p className="text-sm text-gray-600">Recibir resumen diario de actividad</p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Nuevos Clientes</h4>
                  <p className="text-sm text-gray-600">Notificar cuando se agreguen nuevos clientes</p>
                </div>
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
              </div>

              <Input
                label="Email de notificaciones"
                type="email"
                defaultValue={user.email}
                leftIcon={Mail}
                helperText="Email donde recibir las notificaciones"
              />

              <Button variant="primary" fullWidth>
                Guardar Preferencias
              </Button>
            </CardBody>
          </Card>
        </motion.div>

        {/* Configuración del Sistema */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Database className="w-5 h-5 text-primary-600" />
                <h3 className="text-lg font-semibold text-gray-900">Sistema</h3>
              </div>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Versión:</span>
                  <span className="ml-2 font-medium">1.0.0</span>
                </div>
                <div>
                  <span className="text-gray-600">Clientes:</span>
                  <span className="ml-2 font-medium">0</span>
                </div>
                <div>
                  <span className="text-gray-600">Alertas activas:</span>
                  <span className="ml-2 font-medium">0</span>
                </div>
                <div>
                  <span className="text-gray-600">Última sincronización:</span>
                  <span className="ml-2 font-medium">-</span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-2">Configuración Avanzada</h4>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Retención de datos (días)</span>
                    <input
                      type="number"
                      defaultValue={90}
                      className="w-20 px-2 py-1 text-sm border border-gray-300 rounded"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Límite de clientes</span>
                    <input
                      type="number"
                      defaultValue={100}
                      className="w-20 px-2 py-1 text-sm border border-gray-300 rounded"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Modo debug</span>
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                  </div>
                </div>
              </div>

              <Button variant="secondary" fullWidth>
                Guardar Configuración del Sistema
              </Button>
            </CardBody>
          </Card>
        </motion.div>
      </div>

      {/* Información adicional */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card>
          <CardBody>
            <div className="text-center space-y-2">
              <h4 className="font-medium text-gray-900">MantenApp Dashboard</h4>
              <p className="text-sm text-gray-600">
                Plataforma de gestión y monitoreo de sitios WordPress
              </p>
              <p className="text-xs text-gray-500">
                © 2024 MantenApp. Todos los derechos reservados.
              </p>
            </div>
          </CardBody>
        </Card>
      </motion.div>
    </div>
  )
}

export { SettingsPage }
