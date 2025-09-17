import express from 'express';
import { PrismaClient } from '@prisma/client';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Aplicar autenticación a todas las rutas del dashboard
router.use(authenticateToken);

/**
 * GET /api/v1/dashboard/stats
 * Obtener estadísticas generales del dashboard
 */
router.get('/stats', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;

  // Obtener estadísticas en paralelo
  const [
    totalClients,
    activeClients,
    inactiveClients,
    totalAlerts,
    activeAlerts,
    criticalAlerts,
    recentSyncs,
    clientsWithAlerts
  ] = await Promise.all([
    // Total de clientes
    prisma.client.count({
      where: { userId }
    }),
    
    // Clientes activos
    prisma.client.count({
      where: { 
        userId,
        status: 'active'
      }
    }),
    
    // Clientes inactivos
    prisma.client.count({
      where: { 
        userId,
        status: 'inactive'
      }
    }),
    
    // Total de alertas
    prisma.alert.count({
      where: {
        client: { userId }
      }
    }),
    
    // Alertas activas
    prisma.alert.count({
      where: {
        client: { userId },
        status: 'active'
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
    
    // Sincronizaciones recientes (últimas 24 horas)
    prisma.client.count({
      where: {
        userId,
        lastSync: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      }
    }),
    
    // Clientes con alertas activas
    prisma.client.count({
      where: {
        userId,
        alerts: {
          some: {
            status: 'active'
          }
        }
      }
    })
  ]);

  // Calcular porcentajes
  const activePercentage = totalClients > 0 ? Math.round((activeClients / totalClients) * 100) : 0;
  const syncPercentage = totalClients > 0 ? Math.round((recentSyncs / totalClients) * 100) : 0;
  const alertsPercentage = totalClients > 0 ? Math.round((clientsWithAlerts / totalClients) * 100) : 0;

  res.json({
    success: true,
    data: {
      clients: {
        total: totalClients,
        active: activeClients,
        inactive: inactiveClients,
        activePercentage,
        withAlerts: clientsWithAlerts
      },
      alerts: {
        total: totalAlerts,
        active: activeAlerts,
        critical: criticalAlerts,
        alertsPercentage
      },
      sync: {
        recent: recentSyncs,
        syncPercentage
      }
    }
  });
}));

/**
 * GET /api/v1/dashboard/recent-activity
 * Obtener actividad reciente
 */
router.get('/recent-activity', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  const limit = parseInt(req.query.limit as string) || 10;

  // Obtener clientes con sincronización reciente
  const recentClients = await prisma.client.findMany({
    where: { 
      userId,
      lastSync: {
        not: null
      }
    },
    orderBy: { lastSync: 'desc' },
    take: limit,
    select: {
      id: true,
      siteName: true,
      siteUrl: true,
      lastSync: true,
      status: true,
      _count: {
        select: {
          alerts: {
            where: { status: 'active' }
          }
        }
      }
    }
  });

  // Obtener alertas recientes
  const recentAlerts = await prisma.alert.findMany({
    where: {
      client: { userId },
      status: 'active'
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: {
      client: {
        select: {
          id: true,
          siteName: true,
          siteUrl: true
        }
      }
    }
  });

  res.json({
    success: true,
    data: {
      recentClients: recentClients.map(client => ({
        ...client,
        alertCount: client._count.alerts
      })),
      recentAlerts
    }
  });
}));

/**
 * GET /api/v1/dashboard/charts/sync-activity
 * Datos para gráfico de actividad de sincronización (últimos 30 días)
 */
router.get('/charts/sync-activity', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  const days = parseInt(req.query.days as string) || 30;

  // Obtener datos de sincronización por día
  const syncData = await prisma.$queryRaw`
    SELECT 
      DATE(last_sync) as date,
      COUNT(*) as syncs
    FROM clients 
    WHERE user_id = ${userId}
      AND last_sync >= NOW() - INTERVAL '${days} days'
      AND last_sync IS NOT NULL
    GROUP BY DATE(last_sync)
    ORDER BY date ASC
  ` as Array<{ date: Date; syncs: bigint }>;

  // Formatear datos para el gráfico
  const chartData = syncData.map(item => ({
    date: item.date.toISOString().split('T')[0],
    syncs: Number(item.syncs)
  }));

  res.json({
    success: true,
    data: { chartData }
  });
}));

/**
 * GET /api/v1/dashboard/charts/alerts-distribution
 * Distribución de alertas por tipo y severidad
 */
router.get('/charts/alerts-distribution', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;

  // Alertas por tipo
  const alertsByType = await prisma.alert.groupBy({
    by: ['alertType'],
    where: {
      client: { userId },
      status: 'active'
    },
    _count: {
      id: true
    }
  });

  // Alertas por severidad
  const alertsBySeverity = await prisma.alert.groupBy({
    by: ['severity'],
    where: {
      client: { userId },
      status: 'active'
    },
    _count: {
      id: true
    }
  });

  res.json({
    success: true,
    data: {
      byType: alertsByType.map(item => ({
        type: item.alertType,
        count: item._count.id
      })),
      bySeverity: alertsBySeverity.map(item => ({
        severity: item.severity,
        count: item._count.id
      }))
    }
  });
}));

/**
 * GET /api/v1/dashboard/system-health
 * Estado general del sistema
 */
router.get('/system-health', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;

  // Clientes que no han sincronizado en más de 24 horas
  const staleClients = await prisma.client.count({
    where: {
      userId,
      status: 'active',
      OR: [
        { lastSync: null },
        {
          lastSync: {
            lt: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        }
      ]
    }
  });

  // Clientes con alertas críticas
  const criticalClients = await prisma.client.count({
    where: {
      userId,
      alerts: {
        some: {
          status: 'active',
          severity: 'critical'
        }
      }
    }
  });

  // Total de clientes activos
  const totalActiveClients = await prisma.client.count({
    where: {
      userId,
      status: 'active'
    }
  });

  // Calcular health score (0-100)
  let healthScore = 100;
  
  if (totalActiveClients > 0) {
    const stalePercentage = (staleClients / totalActiveClients) * 100;
    const criticalPercentage = (criticalClients / totalActiveClients) * 100;
    
    healthScore = Math.max(0, 100 - (stalePercentage * 0.5) - (criticalPercentage * 1.5));
  }

  // Determinar estado general
  let status = 'excellent';
  if (healthScore < 60) status = 'poor';
  else if (healthScore < 80) status = 'fair';
  else if (healthScore < 95) status = 'good';

  res.json({
    success: true,
    data: {
      healthScore: Math.round(healthScore),
      status,
      issues: {
        staleClients,
        criticalClients
      },
      recommendations: generateRecommendations(staleClients, criticalClients, totalActiveClients)
    }
  });
}));

/**
 * Generar recomendaciones basadas en el estado del sistema
 */
function generateRecommendations(staleClients: number, criticalClients: number, totalClients: number) {
  const recommendations = [];

  if (staleClients > 0) {
    recommendations.push({
      type: 'warning',
      message: `${staleClients} cliente(s) no han sincronizado en las últimas 24 horas`,
      action: 'Revisar conectividad y configuración de estos clientes'
    });
  }

  if (criticalClients > 0) {
    recommendations.push({
      type: 'critical',
      message: `${criticalClients} cliente(s) tienen alertas críticas`,
      action: 'Revisar y resolver alertas críticas inmediatamente'
    });
  }

  if (totalClients === 0) {
    recommendations.push({
      type: 'info',
      message: 'No tienes clientes configurados',
      action: 'Agrega tu primer cliente para comenzar el monitoreo'
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      type: 'success',
      message: 'Todos los sistemas funcionan correctamente',
      action: 'Continúa monitoreando regularmente'
    });
  }

  return recommendations;
}

export default router;
