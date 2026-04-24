// src/middleware/auth.middleware.ts

import jwt from 'jsonwebtoken';
import { prisma } from '../index';
import { Request, Response, NextFunction } from 'express';
import { Permission } from '@factura-mg/shared';

interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  companyId: string;
}

interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  companyId: string;
  isActive: boolean;
  permissions?: string[] | null;
}

// ✅ Export de AuthRequest
export interface AuthRequest extends Request {
  user?: AuthUser;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, message: 'Non autorisé - Token manquant' });
      return;
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({ success: false, message: 'Non autorisé - Token manquant' });
      return;
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key'
    ) as JwtPayload;

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        companyId: true,
        isActive: true,
        permissions: true, // ✅ récupère les permissions custom
      },
    });

    if (!user) {
      res.status(401).json({ success: false, message: 'Utilisateur non trouvé' });
      return;
    }

    if (!user.isActive) {
      res.status(401).json({ success: false, message: 'Compte désactivé' });
      return;
    }

    req.user = {
      ...user,
      permissions: user.permissions as string[] | null,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ success: false, message: 'Token expiré' });
    } else if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ success: false, message: 'Token invalide' });
    } else {
      next(error);
    }
  }
};

// Rôles qui ont accès à tout (bypass des permissions)
const SUPER_ROLES = ['SUPER_ADMIN', 'ADMIN'];

// ✅ authorize accepte des Permission ou des rôles string
export const authorize = (...permissions: (Permission | string)[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    const user = req.user;

    if (!user) {
      res.status(401).json({ success: false, message: 'Non autorisé' });
      return;
    }

    // Les super admins / admins passent toujours
    if (SUPER_ROLES.includes(user.role)) {
      next();
      return;
    }

    // Vérifier si c'est un rôle direct (ex: 'MANAGER')
    const rolePermissions = permissions.filter((p) =>
      ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EMPLOYEE', 'CLIENT'].includes(p)
    );
    if (rolePermissions.length > 0 && rolePermissions.includes(user.role)) {
      next();
      return;
    }

    // Vérifier les permissions custom stockées en JSON sur l'utilisateur
    const userPermissions: string[] = Array.isArray(user.permissions)
      ? (user.permissions as string[])
      : [];

    const hasPermission = permissions.some((p) => userPermissions.includes(p));

    if (!hasPermission) {
      res.status(403).json({
        success: false,
        message: 'Permissions insuffisantes',
        required: permissions,
      });
      return;
    }

    next();
  };
};
