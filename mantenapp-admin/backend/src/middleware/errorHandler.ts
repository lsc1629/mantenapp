import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  err: AppError | ZodError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  let message = 'Error interno del servidor';
  let details: any = null;

  // Error de validación con Zod
  if (err instanceof ZodError) {
    statusCode = 400;
    message = 'Error de validación';
    details = err.errors.map(error => ({
      field: error.path.join('.'),
      message: error.message,
      code: error.code
    }));
  }
  // Error personalizado de la aplicación
  else if (err.statusCode) {
    statusCode = err.statusCode;
    message = err.message;
  }
  // Error de Prisma
  else if (err.message.includes('Unique constraint')) {
    statusCode = 409;
    message = 'El recurso ya existe';
  }
  else if (err.message.includes('Record to update not found')) {
    statusCode = 404;
    message = 'Recurso no encontrado';
  }
  // Error de JWT
  else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Token inválido';
  }
  else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expirado';
  }

  // Log del error en desarrollo
  if (process.env.NODE_ENV === 'development') {
    console.error('❌ Error:', {
      message: err.message,
      stack: err.stack,
      statusCode,
      url: req.url,
      method: req.method,
      body: req.body,
      params: req.params,
      query: req.query
    });
  }

  // Respuesta del error
  const errorResponse: any = {
    success: false,
    error: {
      message,
      statusCode,
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method
    }
  };

  // Agregar detalles solo si existen
  if (details) {
    errorResponse.error.details = details;
  }

  // Agregar stack trace solo en desarrollo
  if (process.env.NODE_ENV === 'development') {
    errorResponse.error.stack = err.stack;
  }

  res.status(statusCode).json(errorResponse);
};

// Función para crear errores personalizados
export const createError = (message: string, statusCode: number = 500): AppError => {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  error.isOperational = true;
  return error;
};

// Wrapper para funciones async
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
