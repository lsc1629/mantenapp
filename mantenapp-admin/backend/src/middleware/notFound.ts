import { Request, Response, NextFunction } from 'express';

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new Error(`Ruta no encontrada - ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    error: {
      message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
      statusCode: 404,
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
      availableRoutes: [
        'GET /health',
        'POST /api/v1/auth/login',
        'POST /api/v1/auth/register',
        'GET /api/v1/dashboard/stats',
        'GET /api/v1/clients',
        'POST /api/v1/clients',
        'GET /api/v1/alerts',
        'POST /api/v1/webhooks/client-data'
      ]
    }
  });
};
