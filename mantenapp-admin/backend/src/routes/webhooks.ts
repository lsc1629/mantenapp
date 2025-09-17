import express from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { authenticateApiKey } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Esquema de validación para datos del cliente WordPress
const clientDataSchema = z.object({
  apiKey: z.string().min(32, 'API Key debe tener al menos 32 caracteres'),
  siteInfo: z.object({
    name: z.string(),
    url: z.string().url(),
    wpVersion: z.string(),
    phpVersion: z.string(),
    mysqlVersion: z.string().optional(),
    theme: z.object({
      name: z.string(),
      version: z.string(),
      isActive: z.boolean()
    }),
    multisite: z.boolean().optional()
  }),
  plugins: z.array(z.object({
    name: z.string(),
    version: z.string(),
    isActive: z.boolean(),
    hasUpdate: z.boolean().optional()
  })).optional(),
  themes: z.array(z.object({
    name: z.string(),
    version: z.string(),
    isActive: z.boolean(),
    hasUpdate: z.boolean().optional()
  })).optional(),
  users: z.object({
    total: z.number(),
    administrators: z.number(),
    editors: z.number().optional(),
    authors: z.number().optional(),
    contributors: z.number().optional(),
    subscribers: z.number().optional()
  }).optional(),
  content: z.object({
    posts: z.number(),
    pages: z.number(),
    comments: z.number(),
    media: z.number()
  }).optional(),
  security: z.object({
    hasSSL: z.boolean(),
    wpVersion: z.string(),
    hasSecurityPlugins: z.boolean().optional(),
    adminUserExists: z.boolean().optional()
  }).optional(),
  performance: z.object({
    memoryLimit: z.string(),
    maxExecutionTime: z.string(),
    uploadMaxFilesize: z.string(),
    postMaxSize: z.string().optional()
  }).optional(),
  updates: z.object({
    core: z.number(),
    plugins: z.number(),
    themes: z.number()
  }).optional()
});

/**
 * POST /api/v1/webhooks/client-data
 * Recibe datos del plugin cliente de WordPress
 */
router.post('/client-data', asyncHandler(async (req, res) => {
  // Validar datos de entrada
  const validatedData = clientDataSchema.parse(req.body);
  
  // Buscar cliente por API key
  const client = await prisma.client.findUnique({
    where: { apiKey: validatedData.apiKey }
  });

  if (!client) {
    throw createError('API Key inválida o cliente no encontrado', 401);
  }

  if (client.status !== 'active') {
    throw createError('Cliente inactivo', 403);
  }

  // Actualizar última sincronización del cliente
  await prisma.client.update({
    where: { id: client.id },
    data: { 
      lastSync: new Date(),
      siteName: validatedData.siteInfo.name, // Actualizar nombre si cambió
      siteUrl: validatedData.siteInfo.url    // Actualizar URL si cambió
    }
  });

  // Guardar datos del sitio
  const dataEntries = [
    {
      clientId: client.id,
      dataType: 'core',
      dataContent: {
        wpVersion: validatedData.siteInfo.wpVersion,
        phpVersion: validatedData.siteInfo.phpVersion,
        mysqlVersion: validatedData.siteInfo.mysqlVersion,
        theme: validatedData.siteInfo.theme,
        multisite: validatedData.siteInfo.multisite
      }
    }
  ];

  // Agregar datos opcionales si existen
  if (validatedData.plugins) {
    dataEntries.push({
      clientId: client.id,
      dataType: 'plugins',
      dataContent: validatedData.plugins
    });
  }

  if (validatedData.themes) {
    dataEntries.push({
      clientId: client.id,
      dataType: 'themes',
      dataContent: validatedData.themes
    });
  }

  if (validatedData.users) {
    dataEntries.push({
      clientId: client.id,
      dataType: 'users',
      dataContent: validatedData.users
    });
  }

  if (validatedData.content) {
    dataEntries.push({
      clientId: client.id,
      dataType: 'content',
      dataContent: validatedData.content
    });
  }

  if (validatedData.security) {
    dataEntries.push({
      clientId: client.id,
      dataType: 'security',
      dataContent: validatedData.security
    });
  }

  if (validatedData.performance) {
    dataEntries.push({
      clientId: client.id,
      dataType: 'performance',
      dataContent: validatedData.performance
    });
  }

  if (validatedData.updates) {
    dataEntries.push({
      clientId: client.id,
      dataType: 'updates',
      dataContent: validatedData.updates
    });
  }

  // Insertar todos los datos en una transacción
  await prisma.$transaction(async (tx) => {
    // Eliminar datos antiguos del mismo tipo (mantener solo los más recientes)
    for (const entry of dataEntries) {
      await tx.siteData.deleteMany({
        where: {
          clientId: entry.clientId,
          dataType: entry.dataType,
          collectedAt: {
            lt: new Date(Date.now() - 24 * 60 * 60 * 1000) // Más de 24 horas
          }
        }
      });
    }

    // Insertar nuevos datos
    await tx.siteData.createMany({
      data: dataEntries
    });
  });

  // Generar alertas automáticas
  await generateAlerts(client.id, validatedData);

  res.status(200).json({
    success: true,
    message: 'Datos recibidos y procesados correctamente',
    timestamp: new Date().toISOString(),
    clientId: client.id,
    dataTypes: dataEntries.map(entry => entry.dataType)
  });
}));

/**
 * Función para generar alertas automáticas basadas en los datos recibidos
 */
async function generateAlerts(clientId: string, data: z.infer<typeof clientDataSchema>) {
  const alerts = [];

  // Alerta por actualizaciones de WordPress
  if (data.updates && data.updates.core > 0) {
    alerts.push({
      clientId,
      alertType: 'core_update',
      severity: 'high',
      title: 'Actualización de WordPress disponible',
      message: `Hay ${data.updates.core} actualización(es) de WordPress pendiente(s)`,
      metadata: { updateCount: data.updates.core }
    });
  }

  // Alerta por actualizaciones de plugins
  if (data.updates && data.updates.plugins > 0) {
    alerts.push({
      clientId,
      alertType: 'plugin_update',
      severity: 'medium',
      title: 'Actualizaciones de plugins disponibles',
      message: `Hay ${data.updates.plugins} actualización(es) de plugin(s) pendiente(s)`,
      metadata: { updateCount: data.updates.plugins }
    });
  }

  // Alerta por falta de SSL
  if (data.security && !data.security.hasSSL) {
    alerts.push({
      clientId,
      alertType: 'security',
      severity: 'high',
      title: 'SSL no configurado',
      message: 'El sitio no tiene SSL configurado correctamente',
      metadata: { securityIssue: 'no_ssl' }
    });
  }

  // Alerta por versión antigua de WordPress
  if (data.siteInfo.wpVersion) {
    const currentVersion = parseFloat(data.siteInfo.wpVersion);
    const latestVersion = 6.4; // Actualizar según la versión más reciente
    
    if (currentVersion < latestVersion - 0.2) { // Más de 2 versiones menores atrás
      alerts.push({
        clientId,
        alertType: 'security',
        severity: 'medium',
        title: 'Versión de WordPress desactualizada',
        message: `WordPress ${data.siteInfo.wpVersion} está desactualizado. Versión recomendada: ${latestVersion}`,
        metadata: { 
          currentVersion: data.siteInfo.wpVersion,
          recommendedVersion: latestVersion.toString()
        }
      });
    }
  }

  // Alerta por límite de memoria bajo
  if (data.performance && data.performance.memoryLimit) {
    const memoryLimit = parseInt(data.performance.memoryLimit);
    if (memoryLimit < 256) { // Menos de 256MB
      alerts.push({
        clientId,
        alertType: 'performance',
        severity: 'medium',
        title: 'Límite de memoria PHP bajo',
        message: `El límite de memoria PHP es ${data.performance.memoryLimit}. Se recomienda al menos 256M`,
        metadata: { 
          currentLimit: data.performance.memoryLimit,
          recommendedLimit: '256M'
        }
      });
    }
  }

  // Insertar alertas (solo si no existen alertas similares activas)
  for (const alert of alerts) {
    const existingAlert = await prisma.alert.findFirst({
      where: {
        clientId: alert.clientId,
        alertType: alert.alertType,
        status: 'active'
      }
    });

    if (!existingAlert) {
      await prisma.alert.create({ data: alert });
    }
  }
}

export default router;
