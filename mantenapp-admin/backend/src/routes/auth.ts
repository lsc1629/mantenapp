import * as express from 'express';
import * as bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { generateToken } from '../utils/jwt';

const router = express.Router();
const prisma = new PrismaClient();

// Esquemas de validación
const registerSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'La contraseña debe contener al menos una mayúscula, una minúscula y un número')
});

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Contraseña requerida')
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Contraseña actual requerida'),
  newPassword: z.string().min(8, 'La nueva contraseña debe tener al menos 8 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'La contraseña debe contener al menos una mayúscula, una minúscula y un número')
});

/**
 * POST /api/v1/auth/register
 * Registrar nuevo usuario administrador
 */
router.post('/register', asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = registerSchema.parse(req.body);

  // Verificar si el usuario ya existe
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    throw createError('El usuario ya existe', 409);
  }

  // Hash de la contraseña
  const saltRounds = parseInt(process.env['BCRYPT_ROUNDS'] || '12');
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // Crear usuario
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: 'admin' // Por defecto todos son admin
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true
    }
  });

  // Generar JWT
  const token = generateToken(user);

  res.status(201).json({
    success: true,
    message: 'Usuario registrado exitosamente',
    data: {
      user,
      token
    }
  });
}));

/**
 * POST /api/v1/auth/login
 * Iniciar sesión
 */
router.post('/login', asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = loginSchema.parse(req.body);

  // Buscar usuario
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user || !user.isActive) {
    throw createError('Credenciales inválidas', 401);
  }

  // Verificar contraseña
  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    throw createError('Credenciales inválidas', 401);
  }

  // Generar JWT
  const token = generateToken(user);

  // Registrar login en audit log
  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: 'login',
      resource: 'user',
      resourceId: user.id,
      details: JSON.stringify({ email }),
      ipAddress: req.ip || null,
      userAgent: req.get('User-Agent') || null
    }
  });

  res.json({
    success: true,
    message: 'Inicio de sesión exitoso',
    data: {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt
      },
      token
    }
  });
}));

/**
 * GET /api/v1/auth/me
 * Obtener información del usuario autenticado
 */
router.get('/me', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true
    }
  });

  if (!user) {
    throw createError('Usuario no encontrado', 404);
  }

  res.json({
    success: true,
    data: { user }
  });
}));

/**
 * POST /api/v1/auth/change-password
 * Cambiar contraseña del usuario autenticado
 */
router.post('/change-password', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);

  // Buscar usuario
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id }
  });

  if (!user) {
    throw createError('Usuario no encontrado', 404);
  }

  // Verificar contraseña actual
  const isValidPassword = await bcrypt.compare(currentPassword, user.password);
  if (!isValidPassword) {
    throw createError('Contraseña actual incorrecta', 400);
  }

  // Hash de la nueva contraseña
  const saltRounds = parseInt(process.env['BCRYPT_ROUNDS'] || '12');
  const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

  // Actualizar contraseña
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword }
  });

  // Registrar cambio en audit log
  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: 'update',
      resource: 'user',
      resourceId: user.id,
      details: JSON.stringify({ action: 'password_change' }),
      ipAddress: req.ip || null,
      userAgent: req.get('User-Agent') || null
    }
  });

  res.json({
    success: true,
    message: 'Contraseña actualizada exitosamente'
  });
}));

/**
 * POST /api/v1/auth/logout
 * Cerrar sesión (principalmente para logging)
 */
router.post('/logout', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  // Registrar logout en audit log
  await prisma.auditLog.create({
    data: {
      userId: req.user!.id,
      action: 'logout',
      resource: 'user',
      resourceId: req.user!.id,
      details: null,
      ipAddress: req.ip || null,
      userAgent: req.get('User-Agent') || null
    }
  });

  res.json({
    success: true,
    message: 'Sesión cerrada exitosamente'
  });
}));

/**
 * GET /api/v1/auth/refresh
 * Refrescar token JWT
 */
router.get('/refresh', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true
    }
  });

  if (!user || !user.isActive) {
    throw createError('Usuario no encontrado o inactivo', 404);
  }

  // Generar nuevo token
  const token = generateToken(user);

  res.json({
    success: true,
    message: 'Token refrescado exitosamente',
    data: { token }
  });
}));


export default router;
