import * as express from 'express';
import { Response } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Aplicar autenticación a todas las rutas
router.use(authenticateToken);

// Esquemas de validación
const updateAlertSchema = z.object({
  status: z.enum(['active', 'resolved', 'dismissed']).optional()
});

/**
 * GET /api/v1/alerts
 * Obtener lista de alertas
 */
router.get('/', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const status = req.query.status as string;
  const severity = req.query.severity as string;
  const alertType = req.query.type as string;
  const clientId = req.query.clientId as string;

  const skip = (page - 1) * limit;

  // Construir filtros
  const where: any = {
    client: { userId }
  };
  
  if (status) {
    where.status = status;
  }
  
  if (severity) {
    where.severity = severity;
  }
  
  if (alertType) {
    where.alertType = alertType;
  }
  
  if (clientId) {
    where.clientId = clientId;
  }

  // Obtener alertas con información del cliente
  const [alerts, totalCount] = await Promise.all([
    prisma.alert.findMany({
      where,
      skip,
      take: limit,
      orderBy: [
        { severity: 'desc' }, // Críticas primero
        { createdAt: 'desc' }
      ],
      include: {
        client: {
          select: {
            id: true,
            siteName: true,
            siteUrl: true,
            status: true
          }
        }
      }
    }),
    prisma.alert.count({ where })
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  res.json({
    success: true,
    data: {
      alerts,
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
 * GET /api/v1/alerts/stats
 * Obtener estadísticas de alertas
 */
router.get('/stats', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;

  // Obtener estadísticas en paralelo
  const [
    totalAlerts,
    activeAlerts,
    resolvedAlerts,
    dismissedAlerts,
    criticalAlerts,
    highAlerts,
    mediumAlerts,
    lowAlerts,
    alertsByType,
    recentAlerts
  ] = await Promise.all([
    // Total de alertas
    prisma.alert.count({
      where: { client: { userId } }
    }),
    
    // Alertas activas
    prisma.alert.count({
      where: { 
        client: { userId },
        status: 'active'
      }
    }),
    
    // Alertas resueltas
    prisma.alert.count({
      where: { 
        client: { userId },
        status: 'resolved'
      }
    }),
    
    // Alertas descartadas
    prisma.alert.count({
      where: { 
        client: { userId },
        status: 'dismissed'
      }
    }),
    
    // Alertas críticas
    prisma.alert.count({
      where: { 
        client: { userId },
        status: 'active',
        severity: 'critical'
      }
    }),
    
    // Alertas altas
    prisma.alert.count({
      where: { 
        client: { userId },
        status: 'active',
        severity: 'high'
      }
    }),
    
    // Alertas medias
    prisma.alert.count({
      where: { 
        client: { userId },
        status: 'active',
        severity: 'medium'
      }
    }),
    
    // Alertas bajas
    prisma.alert.count({
      where: { 
        client: { userId },
        status: 'active',
        severity: 'low'
      }
    }),
    
    // Alertas por tipo
    prisma.alert.groupBy({
      by: ['alertType'],
      where: {
        client: { userId },
        status: 'active'
      },
      _count: {
        id: true
      }
    }),
    
    // Alertas recientes (últimas 24 horas)
    prisma.alert.count({
      where: {
        client: { userId },
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      }
    })
  ]);

  res.json({
    success: true,
    data: {
      total: totalAlerts,
      byStatus: {
        active: activeAlerts,
        resolved: resolvedAlerts,
        dismissed: dismissedAlerts
      },
      bySeverity: {
        critical: criticalAlerts,
        high: highAlerts,
        medium: mediumAlerts,
        low: lowAlerts
      },
      byType: alertsByType.map(item => ({
        type: item.alertType,
        count: item._count.id
      })),
      recent: recentAlerts
    }
  });
}));

/**
 * GET /api/v1/alerts/:id
 * Obtener alerta específica
 */
router.get('/:id', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.id;

  const alert = await prisma.alert.findFirst({
    where: { 
      id,
      client: { userId }
    },
    include: {
      client: {
        select: {
          id: true,
          siteName: true,
          siteUrl: true,
          status: true
        }
      }
    }
  });

  if (!alert) {
    throw createError('Alerta no encontrada', 404);
  }

  res.json({
    success: true,
    data: { alert }
  });
}));

/**
 * PATCH /api/v1/alerts/:id
 * Actualizar estado de alerta
 */
router.patch('/:id', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.id;
  const { status } = updateAlertSchema.parse(req.body);

  // Verificar que la alerta existe y pertenece al usuario
  const existingAlert = await prisma.alert.findFirst({
    where: { 
      id,
      client: { userId }
    }
  });

  if (!existingAlert) {
    throw createError('Alerta no encontrada', 404);
  }

  // Preparar datos de actualización
  const updateData: any = {};
  
  if (status) {
    updateData.status = status;
    
    // Si se está resolviendo, agregar timestamp y usuario
    if (status === 'resolved') {
      updateData.resolvedAt = new Date();
      updateData.resolvedBy = userId;
    }
  }

  // Actualizar alerta
  const updatedAlert = await prisma.alert.update({
    where: { id },
    data: updateData,
    include: {
      client: {
        select: {
          id: true,
          siteName: true,
          siteUrl: true,
          status: true
        }
      }
    }
  });

  // Registrar en audit log
  await prisma.auditLog.create({
    data: {
      userId,
      action: 'update',
      resource: 'alert',
      resourceId: id,
      details: JSON.stringify({ status, alertType: existingAlert.alertType }),
      ipAddress: req.ip || null,
      userAgent: req.get('User-Agent') || null
    }
  });

  res.json({
    success: true,
    message: 'Alerta actualizada exitosamente',
    data: { alert: updatedAlert }
  });
}));

/**
 * POST /api/v1/alerts/bulk-update
 * Actualizar múltiples alertas
 */
router.post('/bulk-update', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { alertIds, status } = z.object({
    alertIds: z.array(z.string()),
    status: z.enum(['active', 'resolved', 'dismissed'])
  }).parse(req.body);

  if (alertIds.length === 0) {
    throw createError('Debe proporcionar al menos una alerta', 400);
  }

  // Verificar que todas las alertas pertenecen al usuario
  const existingAlerts = await prisma.alert.findMany({
    where: {
      id: { in: alertIds },
      client: { userId }
    }
  });

  if (existingAlerts.length !== alertIds.length) {
    throw createError('Una o más alertas no fueron encontradas', 404);
  }

  // Preparar datos de actualización
  const updateData: any = { status };
  
  if (status === 'resolved') {
    updateData.resolvedAt = new Date();
    updateData.resolvedBy = userId;
  }

  // Actualizar alertas
  const result = await prisma.alert.updateMany({
    where: {
      id: { in: alertIds }
    },
    data: updateData
  });

  // Registrar en audit log
  await prisma.auditLog.create({
    data: {
      userId,
      action: 'update',
      resource: 'alert',
      details: JSON.stringify({ 
        action: 'bulk_update',
        status,
        alertCount: result.count,
        alertIds
      }),
      ipAddress: req.ip || null,
      userAgent: req.get('User-Agent') || null
    }
  });

  res.json({
    success: true,
    message: `${result.count} alerta(s) actualizada(s) exitosamente`,
    data: { updatedCount: result.count }
  });
}));

/**
 * DELETE /api/v1/alerts/:id
 * Eliminar alerta
 */
router.delete('/:id', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.id;

  // Verificar que la alerta existe y pertenece al usuario
  const existingAlert = await prisma.alert.findFirst({
    where: { 
      id,
      client: { userId }
    }
  });

  if (!existingAlert) {
    throw createError('Alerta no encontrada', 404);
  }

  // Eliminar alerta
  await prisma.alert.delete({
    where: { id }
  });

  // Registrar en audit log
  await prisma.auditLog.create({
    data: {
      userId,
      action: 'delete',
      resource: 'alert',
      resourceId: id,
      details: JSON.stringify({ 
        alertType: existingAlert.alertType,
        severity: existingAlert.severity,
        title: existingAlert.title
      }),
      ipAddress: req.ip || null,
      userAgent: req.get('User-Agent') || null
    }
  });

  res.json({
    success: true,
    message: 'Alerta eliminada exitosamente'
  });
}));

export default router;
