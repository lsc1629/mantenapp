import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'

// Cargar variables de entorno
dotenv.config()

const prisma = new PrismaClient()

interface JWTPayload {
  userId: string
  email: string
  role: string
}

async function generateToken() {
  try {
    // Buscar el usuario admin
    const user = await prisma.user.findUnique({
      where: { email: 'admin@mantenapp.com' }
    })

    if (!user) {
      console.error('❌ Usuario admin no encontrado')
      return
    }

    // Generar token JWT
    const jwtSecret = process.env['JWT_SECRET'] || 'dev-secret-key-change-in-production'
    
    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      role: user.role
    }
    
    const token = jwt.sign(payload, jwtSecret, { expiresIn: '7d' })

    console.log('🔑 Token generado para:', user.email)
    console.log('📋 Token:', token)
    console.log('\n💡 Para usar en el frontend, ejecuta en la consola del navegador:')
    console.log(`localStorage.setItem('mantenapp_token', '${token}')`)
    console.log('localStorage.setItem(\'mantenapp_user\', \'{"id":"' + user.id + '","email":"' + user.email + '","name":"' + user.name + '","role":"' + user.role + '"}\')') 
    console.log('\nLuego recarga la página.')

  } catch (error) {
    console.error('❌ Error generando token:', error)
  } finally {
    await prisma.$disconnect()
  }
}

generateToken()
