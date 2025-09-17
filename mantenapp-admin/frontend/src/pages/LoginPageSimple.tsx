import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'

const LoginPageSimple: React.FC = () => {
  const [email, setEmail] = useState('donluissalascortes@gmail.com')
  const [password, setPassword] = useState('lsc16291978@0319')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('http://localhost:3001/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (data.success) {
        // Guardar token
        localStorage.setItem('mantenapp_token', data.data.token)
        localStorage.setItem('mantenapp_user', JSON.stringify(data.data.user))
        
        toast.success(`¡Bienvenido, ${data.data.user.name}!`)
        
        // Redirigir inmediatamente
        window.location.href = '/dashboard'
      } else {
        toast.error(data.error?.message || 'Error en el login')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const handleQuickLogin = () => {
    setEmail('donluissalascortes@gmail.com')
    setPassword('lsc16291978@0319')
    setTimeout(() => {
      const form = document.getElementById('loginForm') as HTMLFormElement
      form?.requestSubmit()
    }, 100)
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem'
    }}>
      <div style={{
        background: 'white',
        padding: '2rem',
        borderRadius: '1rem',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '4rem',
            height: '4rem',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
            color: 'white',
            fontSize: '1.5rem',
            fontWeight: 'bold'
          }}>
            M
          </div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', margin: '0 0 0.5rem' }}>
            MantenApp
          </h1>
          <p style={{ color: '#6b7280', margin: 0 }}>
            Inicia sesión en tu dashboard
          </p>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
          border: '2px solid #bfdbfe',
          borderRadius: '0.75rem',
          padding: '1rem',
          marginBottom: '1.5rem'
        }}>
          <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1e40af', margin: '0 0 0.5rem' }}>
            Credenciales de prueba:
          </p>
          <p style={{ fontSize: '0.875rem', color: '#1d4ed8', margin: '0' }}>
            Email: donluissalascortes@gmail.com
          </p>
          <p style={{ fontSize: '0.875rem', color: '#1d4ed8', margin: '0' }}>
            Contraseña: lsc16291978@0319
          </p>
        </div>

        <form id="loginForm" onSubmit={handleLogin}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                fontSize: '1rem',
                border: '2px solid #e5e7eb',
                borderRadius: '0.75rem',
                outline: 'none',
                transition: 'all 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                fontSize: '1rem',
                border: '2px solid #e5e7eb',
                borderRadius: '0.75rem',
                outline: 'none',
                transition: 'all 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              fontWeight: '600',
              color: 'white',
              background: loading ? '#9ca3af' : 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              border: 'none',
              borderRadius: '0.75rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              marginBottom: '0.75rem'
            }}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>

          <button
            type="button"
            onClick={handleQuickLogin}
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              fontWeight: '600',
              color: 'white',
              background: loading ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              borderRadius: '0.75rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s'
            }}
          >
            🚀 Login Rápido (Demo)
          </button>
        </form>

        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>
            © 2024 MantenApp. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  )
}

export { LoginPageSimple }
