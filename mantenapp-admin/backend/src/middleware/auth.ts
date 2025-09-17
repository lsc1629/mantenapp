import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { createError } from './errorHandler';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return next(createError('Token de acceso requerido', 401));
  }

  try {
    const jwtSecret = process.env['JWT_SECRET'] || 'dev-secret-key-change-in-production';
    if (!jwtSecret) {
      throw new Error('JWT_SECRET no configurado');
    }

    const decoded = jwt.verify(token, jwtSecret) as any;
    req.user = {
      id: decoded.userId || decoded.id,
      email: decoded.email,
      role: decoded.role
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return next(createError('Token expirado', 401));
    } else if (error instanceof jwt.JsonWebTokenError) {
      return next(createError('Token inválido', 401));
    } else {
      return next(createError('Error de autenticación', 401));
    }
  }
};

// Middleware para verificar API key de clientes WordPress
export const authenticateApiKey = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const apiKey = req.headers['x-api-key'] as string;

  if (!apiKey) {
    return next(createError('API Key requerida', 401));
  }

  try {
    // Aquí verificarías la API key contra la base de datos
    // Por ahora, solo verificamos que exista
    if (apiKey.length < 32) {
      return next(createError('API Key inválida', 401));
    }

    // Agregar información del cliente a la request si es necesario
    // req.client = clientData;

    next();
  } catch (error) {
    return next(createError('Error al verificar API Key', 401));
  }
};

// Middleware para verificar roles
export const requireRole = (roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(createError('Usuario no autenticado', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(createError('Permisos insuficientes', 403));
    }

    next();
  };
};

// Middleware para verificar que el usuario sea admin
export const requireAdmin = requireRole(['admin', 'super_admin']);

// Middleware para verificar que el usuario sea al menos moderador
export const requireModerator = requireRole(['admin', 'super_admin', 'moderator']);
