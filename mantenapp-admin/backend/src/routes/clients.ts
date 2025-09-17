import * as express from 'express';
import { Response } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import crypto from 'crypto';

const router = express.Router();
const prisma = new PrismaClient();

// Aplicar autenticación a todas las rutas
router.use(authenticateToken);

// Esquemas de validación
const createClientSchema = z.object({
  siteName: z.string().min(1, 'Nombre del sitio requerido'),
  siteUrl: z.string().url('URL inválida'),
  description: z.string().optional(),
  contactName: z.string().optional(),
  contactEmail: z.string().email('Email inválido').optional()
});

const updateClientSchema = z.object({
  siteName: z.string().min(1, 'Nombre del sitio requerido').optional(),
  siteUrl: z.string().url('URL inválida').optional(),
  description: z.string().optional(),
  contactName: z.string().optional(),
  contactEmail: z.string().email('Email inválido').optional(),
  status: z.enum(['active', 'inactive', 'suspended']).optional()
});

/**
 * GET /api/v1/clients
 * Obtener lista de clientes
 */
router.get('/', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const status = req.query.status as string;
  const search = req.query.search as string;

  const skip = (page - 1) * limit;

  // Construir filtros
  const where: any = { userId };
  
  if (status) {
    where.status = status;
  }
  
  if (search) {
    where.OR = [
      { siteName: { contains: search, mode: 'insensitive' } },
      { siteUrl: { contains: search, mode: 'insensitive' } },
      { contactName: { contains: search, mode: 'insensitive' } }
    ];
  }

  // Obtener clientes con conteo de alertas
  const [clients, totalCount] = await Promise.all([
    prisma.client.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            alerts: {
              where: { status: 'active' }
            }
          }
        }
      }
    }),
    prisma.client.count({ where })
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  res.json({
    success: true,
    data: {
      clients: clients.map(client => ({
        ...client,
        alertCount: client._count.alerts
      })),
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    }
  });
}));

/**
 * GET /api/v1/clients/:id
 * Obtener cliente específico con detalles
 */
router.get('/:id', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const userId = req.user!.id;

  const client = await prisma.client.findFirst({
    where: { id, userId },
    include: {
      alerts: {
        where: { status: 'active' },
        orderBy: { createdAt: 'desc' },
        take: 10
      },
      siteData: {
        orderBy: { collectedAt: 'desc' },
        take: 1,
        select: {
          dataType: true,
          dataContent: true,
          collectedAt: true
        }
      },
      _count: {
        select: {
          alerts: { where: { status: 'active' } },
          siteData: true
        }
      }
    }
  });

  if (!client) {
    throw createError('Cliente no encontrado', 404);
  }

  res.json({
    success: true,
    data: { client }
  });
}));

/**
 * POST /api/v1/clients
 * Crear nuevo cliente
 */
router.post('/', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  const validatedData = createClientSchema.parse(req.body);

  // Verificar si ya existe un cliente con la misma URL
  const existingClient = await prisma.client.findFirst({
    where: {
      siteUrl: validatedData.siteUrl,
      userId
    }
  });

  if (existingClient) {
    throw createError('Ya existe un cliente con esta URL', 409);
  }

  // Generar API key única
  const apiKey = generateApiKey();

  // Crear cliente
  const client = await prisma.client.create({
    data: {
      ...validatedData,
      apiKey,
      userId
    },
    include: {
      _count: {
        select: {
          alerts: { where: { status: 'active' } }
        }
      }
    }
  });

  // Registrar en audit log
  await prisma.auditLog.create({
    data: {
      userId,
      action: 'create',
      resource: 'client',
      resourceId: client.id,
      details: JSON.stringify({ siteName: client.siteName, siteUrl: client.siteUrl }),
      ipAddress: req.ip || null,
      userAgent: req.get('User-Agent') || null
    }
  });

  res.status(201).json({
    success: true,
    message: 'Cliente creado exitosamente',
    data: {
      client: {
        ...client,
        alertCount: client._count.alerts
      }
    }
  });
}));

/**
 * PUT /api/v1/clients/:id
 * Actualizar cliente
 */
router.put('/:id', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const userId = req.user!.id;
  const validatedData = updateClientSchema.parse(req.body);

  // Verificar que el cliente existe y pertenece al usuario
  const existingClient = await prisma.client.findFirst({
    where: { id, userId }
  });

  if (!existingClient) {
    throw createError('Cliente no encontrado', 404);
  }

  // Si se está actualizando la URL, verificar que no exista otra igual
  if (validatedData.siteUrl && validatedData.siteUrl !== existingClient.siteUrl) {
    const duplicateClient = await prisma.client.findFirst({
      where: {
        siteUrl: validatedData.siteUrl,
        userId,
        id: { not: id }
      }
    });

    if (duplicateClient) {
      throw createError('Ya existe un cliente con esta URL', 409);
    }
  }

  // Actualizar cliente
  const updatedClient = await prisma.client.update({
    where: { id },
    data: validatedData,
    include: {
      _count: {
        select: {
          alerts: { where: { status: 'active' } }
        }
      }
    }
  });

  // Registrar en audit log
  await prisma.auditLog.create({
    data: {
      userId,
      action: 'update',
      resource: 'client',
      resourceId: id,
      details: JSON.stringify(validatedData),
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    }
  });

  res.json({
    success: true,
    message: 'Cliente actualizado exitosamente',
    data: {
      client: {
        ...updatedClient,
        alertCount: updatedClient._count.alerts
      }
    }
  });
}));

/**
 * DELETE /api/v1/clients/:id
 * Eliminar cliente
 */
router.delete('/:id', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const userId = req.user!.id;

  // Verificar que el cliente existe y pertenece al usuario
  const existingClient = await prisma.client.findFirst({
    where: { id, userId }
  });

  if (!existingClient) {
    throw createError('Cliente no encontrado', 404);
  }

  // Eliminar cliente (cascade eliminará datos relacionados)
  await prisma.client.delete({
    where: { id }
  });

  // Registrar en audit log
  await prisma.auditLog.create({
    data: {
      userId,
      action: 'delete',
      resource: 'client',
      resourceId: id,
      details: JSON.stringify({ siteName: existingClient.siteName, siteUrl: existingClient.siteUrl }),
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    }
  });

  res.json({
    success: true,
    message: 'Cliente eliminado exitosamente'
  });
}));

/**
 * POST /api/v1/clients/:id/regenerate-api-key
 * Regenerar API key del cliente
 */
router.post('/:id/regenerate-api-key', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const userId = req.user!.id;

  // Verificar que el cliente existe y pertenece al usuario
  const existingClient = await prisma.client.findFirst({
    where: { id, userId }
  });

  if (!existingClient) {
    throw createError('Cliente no encontrado', 404);
  }

  // Generar nueva API key
  const newApiKey = generateApiKey();

  // Actualizar cliente
  const updatedClient = await prisma.client.update({
    where: { id },
    data: { apiKey: newApiKey }
  });

  // Registrar en audit log
  await prisma.auditLog.create({
    data: {
      userId,
      action: 'update',
      resource: 'client',
      resourceId: id,
      details: JSON.stringify({ action: 'regenerate_api_key' }),
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    }
  });

  res.json({
    success: true,
    message: 'API Key regenerada exitosamente',
    data: {
      apiKey: updatedClient.apiKey
    }
  });
}));

/**
 * GET /api/v1/clients/:id/site-data
 * Obtener datos del sitio cliente
 */
router.get('/:id/site-data', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const userId = req.user!.id;
  const dataType = req.query.type as string;

  // Verificar que el cliente existe y pertenece al usuario
  const client = await prisma.client.findFirst({
    where: { id, userId }
  });

  if (!client) {
    throw createError('Cliente no encontrado', 404);
  }

  // Construir filtros
  const where: any = { clientId: id };
  if (dataType) {
    where.dataType = dataType;
  }

  // Obtener datos del sitio
  const siteData = await prisma.siteData.findMany({
    where,
    orderBy: { collectedAt: 'desc' },
    take: 50
  });

  res.json({
    success: true,
    data: { siteData }
  });
}));

/**
 * POST /api/v1/clients/sync
 * Endpoint para recibir datos de sincronización del plugin cliente
 */
router.post('/sync', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const clientData = req.body;
  
  // Buscar cliente por API key (el token JWT debería contener la info del cliente)
  const apiKey = req.headers.authorization?.replace('Bearer ', '');
  
  if (!apiKey) {
    throw createError('API Key requerida', 401);
  }
  
  // Buscar cliente por API key
  const client = await prisma.client.findFirst({
    where: { apiKey }
  });
  
  if (!client) {
    throw createError('Cliente no encontrado o API Key inválida', 404);
  }
  
  try {
    // Guardar datos del sitio
    await prisma.siteData.create({
      data: {
        clientId: client.id,
        dataType: 'full_sync',
        dataContent: JSON.stringify(clientData),
        collectedAt: new Date()
      }
    });
    
    // Actualizar última sincronización del cliente
    await prisma.client.update({
      where: { id: client.id },
      data: { 
        lastSync: new Date(),
        status: 'active'
      }
    });
    
    // Procesar datos y generar alertas si es necesario
    await processClientData(client.id, clientData);
    
    res.json({
      success: true,
      message: 'Datos sincronizados correctamente',
      data: {
        clientId: client.id,
        lastSync: new Date()
      }
    });
    
  } catch (error) {
    console.error('Error al procesar datos del cliente:', error);
    throw createError('Error interno al procesar los datos', 500);
  }
}));

/**
 * Procesar datos del cliente y generar alertas
 */
async function processClientData(clientId: string, data: any) {
  try {
    const alerts = [];
    
    // Verificar actualizaciones de WordPress
    if (data.core && data.updates) {
      const coreUpdates = data.updates.core || [];
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
        });
      }
    }
    
    // Verificar actualizaciones de plugins
    if (data.plugins && data.updates) {
      const pluginUpdates = data.updates.plugins || [];
      if (pluginUpdates.length > 0) {
        alerts.push({
          clientId,
          alertType: 'plugin_update',
          severity: 'medium',
          title: `${pluginUpdates.length} actualizaciones de plugins disponibles`,
          message: `Los siguientes plugins tienen actualizaciones: ${pluginUpdates.map((p: any) => p.name).join(', ')}.`,
          status: 'active',
          metadata: JSON.stringify({ plugins: pluginUpdates })
        });
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
        });
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
        });
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
      });
      
      if (!existingAlert) {
        await prisma.alert.create({ data: alertData });
      }
    }
    
  } catch (error) {
    console.error('Error al procesar alertas:', error);
  }
}

/**
 * Generar API key única
 */
function generateApiKey(): string {
  return crypto.randomBytes(32).toString('hex');
}

export default router;
