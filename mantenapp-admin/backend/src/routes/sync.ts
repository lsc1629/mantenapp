import * as express from 'express'
import { Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { asyncHandler, createError } from '../middleware/errorHandler'
import { authenticateClient, AuthenticatedClientRequest } from '../middleware/clientAuth'

const router = express.Router()
const prisma = new PrismaClient()

/**
 * POST /api/v1/sync
 * Endpoint para recibir datos de sincronización del plugin cliente
 */
router.post('/', authenticateClient, asyncHandler(async (req: AuthenticatedClientRequest, res: Response) => {
  const clientData = req.body
  const client = req.client!
  
  try {
    // Guardar datos del sitio
    await prisma.siteData.create({
      data: {
        clientId: client.id,
        dataType: 'full_sync',
        dataContent: JSON.stringify(clientData),
        collectedAt: new Date()
      }
    })
    
    // Actualizar última sincronización del cliente
    await prisma.client.update({
      where: { id: client.id },
      data: { 
        lastSync: new Date(),
        status: 'active'
      }
    })
    
    // Procesar datos y generar alertas si es necesario
    await processClientData(client.id, clientData)
    
    res.json({
      success: true,
      message: 'Datos sincronizados correctamente',
      data: {
        clientId: client.id,
        siteName: client.siteName,
        lastSync: new Date().toISOString()
      }
    })
    
  } catch (error) {
    console.error('Error al procesar datos del cliente:', error)
    throw createError('Error interno al procesar los datos', 500)
  }
}))

/**
 * GET /api/v1/sync/test
 * Test de conexión para plugins cliente
 */
router.get('/test', authenticateClient, asyncHandler(async (req: AuthenticatedClientRequest, res: Response) => {
  const client = req.client!
  
  res.json({
    success: true,
    message: 'Conexión exitosa con MantenApp',
    data: {
      clientId: client.id,
      siteName: client.siteName,
      siteUrl: client.siteUrl,
      connected: true,
      timestamp: new Date().toISOString()
    }
  })
}))

/**
 * Procesar datos del cliente y generar alertas
 */
async function processClientData(clientId: string, data: any) {
  try {
    const alerts = []
    
    // Verificar actualizaciones de WordPress
    if (data.core && data.updates) {
      const coreUpdates = data.updates.core || []
      if (coreUpdates.length > 0) {
        alerts.push({
          clientId,
          alertType: 'core_update',
          severity: 'high',
          title: 'Actualización de WordPress disponible',
          message: `WordPress ${coreUpdates[0].version} está disponible. Tu sitio ejecuta la versión ${data.core.wp_version}.`,
          status: 'active',
          metadata: JSON.stringify({
            currentVersion: data.core.wp_version,
            availableVersion: coreUpdates[0].version,
            securityUpdate: coreUpdates[0].security || false
          })
        })
      }
    }
    
    // Verificar actualizaciones de plugins
    if (data.plugins && data.updates) {
      const pluginUpdates = data.updates.plugins || []
      if (pluginUpdates.length > 0) {
        alerts.push({
          clientId,
          alertType: 'plugin_update',
          severity: 'medium',
          title: `${pluginUpdates.length} actualizaciones de plugins disponibles`,
          message: `Los siguientes plugins tienen actualizaciones: ${pluginUpdates.map((p: any) => p.name).join(', ')}.`,
          status: 'active',
          metadata: JSON.stringify({ plugins: pluginUpdates })
        })
      }
    }
    
    // Verificar problemas de seguridad
    if (data.security) {
      if (data.security.vulnerable_plugins && data.security.vulnerable_plugins.length > 0) {
        alerts.push({
          clientId,
          alertType: 'security',
          severity: 'critical',
          title: 'Plugins vulnerables detectados',
          message: `Se han detectado ${data.security.vulnerable_plugins.length} plugins con vulnerabilidades conocidas.`,
          status: 'active',
          metadata: JSON.stringify({ vulnerable_plugins: data.security.vulnerable_plugins })
        })
      }
    }
    
    // Verificar problemas de rendimiento
    if (data.performance) {
      if (data.performance.load_time && data.performance.load_time > 3) {
        alerts.push({
          clientId,
          alertType: 'performance',
          severity: 'medium',
          title: 'Rendimiento del sitio degradado',
          message: `El tiempo de carga promedio es de ${data.performance.load_time} segundos.`,
          status: 'active',
          metadata: JSON.stringify({ load_time: data.performance.load_time })
        })
      }
    }
    
    // Crear alertas en la base de datos
    for (const alertData of alerts) {
      // Verificar si ya existe una alerta similar activa
      const existingAlert = await prisma.alert.findFirst({
        where: {
          clientId: alertData.clientId,
          alertType: alertData.alertType,
          status: 'active'
        }
      })
      
      if (!existingAlert) {
        await prisma.alert.create({ data: alertData })
      }
    }
    
  } catch (error) {
    console.error('Error al procesar alertas:', error)
  }
}

export default router
