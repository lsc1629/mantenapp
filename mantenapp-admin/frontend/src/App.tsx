import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { AuthProvider } from '@/components/AuthProvider'
import { Layout } from '@/components/Layout'
import { LoginPageSimple } from '@/pages/LoginPageSimple'
import { DashboardPage } from '@/pages/DashboardPage'
import { ClientsPageSimple } from '@/pages/ClientsPageSimple'
import { AlertsPage } from '@/pages/AlertsPage'
import { SettingsPage } from '@/pages/SettingsPage'

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}

function AppRoutes() {
  const { isAuthenticated, user } = useAuthStore()

  console.log('🔍 AppRoutes - isAuthenticated:', isAuthenticated, 'user:', user)

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPageSimple />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/clients" element={<ClientsPageSimple />} />
        <Route path="/alerts" element={<AlertsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/login" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  )
}

export default App
