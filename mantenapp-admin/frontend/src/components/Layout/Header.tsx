import React from 'react'
import { Menu, Bell, Search } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'

interface HeaderProps {
  onMenuToggle: () => void
}

const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 lg:px-6">
      <div className="flex items-center justify-between">
        {/* Left section */}
        <div className="flex items-center space-x-4">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuToggle}
            className="lg:hidden p-2"
          >
            <Menu className="w-5 h-5" />
          </Button>

          {/* Search */}
          <div className="hidden md:block w-96">
            <Input
              placeholder="Buscar clientes, alertas..."
              leftIcon={Search}
              className="bg-gray-50 border-gray-200"
            />
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              className="p-2 relative"
            >
              <Bell className="w-5 h-5" />
              <Badge 
                variant="danger" 
                size="sm" 
                className="absolute -top-1 -right-1 px-1.5 py-0.5 text-xs min-w-[1.25rem] h-5"
              >
                3
              </Badge>
            </Button>
          </div>

          {/* Mobile search button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden p-2"
          >
            <Search className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}

export { Header }
