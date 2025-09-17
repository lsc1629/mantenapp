import { Request, Response, NextFunction } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface AuthenticatedClientRequest extends Request {
  client?: {
    id: string
    siteName: string
    siteUrl: string
    apiKey: string
    userId: string
  }
}

/**
 * Middleware para autenticar clientes usando API Key
 */
export const authenticateClient = async (
  req: AuthenticatedClientRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Token de autorización requerido'
        }
      })
    }
    
    const apiKey = authHeader.substring(7) // Remove 'Bearer ' prefix
    
    if (!apiKey) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'API Key requerida'
        }
      })
    }
    
    // Buscar cliente por API key
    const client = await prisma.client.findFirst({
      where: { 
        apiKey,
        status: 'active'
      },
      select: {
        id: true,
        siteName: true,
        siteUrl: true,
        apiKey: true,
        userId: true
      }
    })
    
    if (!client) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'API Key inválida o cliente inactivo'
        }
      })
    }
    
    // Agregar información del cliente al request
    req.client = client
    
    next()
  } catch (error) {
    console.error('Error en autenticación de cliente:', error)
    return res.status(500).json({
      success: false,
      error: {
        message: 'Error interno del servidor'
      }
    })
  }
}
