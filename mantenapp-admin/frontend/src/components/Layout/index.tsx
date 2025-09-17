import React, { useState } from 'react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { useInitAuth } from '@/stores/authStore'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  // Inicializar autenticación
  useInitAuth()

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Header */}
        <Header onMenuToggle={toggleSidebar} />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="container-fluid py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export { Layout }
