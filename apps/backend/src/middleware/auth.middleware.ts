// src/middleware/auth.middleware.ts

import jwt from 'jsonwebtoken';
import { prisma } from '../index';
import { Request, Response, NextFunction } from 'express';
import { Permission } from '@factura-mg/shared';
import { AuthUser } from '../types/express';

interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  companyId: string;
}

// interface AuthUser {
//   id: string;
//   email: string;
//   firstName: string;
//   lastName: string;
//   role: string;
//   companyId: string | null;
//   isActive: boolean;
//   permissions?: string[] | null;
// }

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
        isActive: true,
        defaultCompanyId: true,
        permissions: true,
        companyMemberships: {
          select: {
            companyId: true,
            role: true,
            permissions: true,
            isActive: true,
          },
          where: {
            isActive: true,
          },
        },
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

    const activeCompanyId = decoded.companyId ?? user.defaultCompanyId ?? null;
    const membership = user.companyMemberships.find(
      (m) => m.companyId === activeCompanyId
    );

    const globalPerms = Array.isArray(user.permissions) ? (user.permissions as string[]) : [];
    const memberPerms = Array.isArray(membership?.permissions) ? (membership.permissions as string[]) : [];
    const allPermissions = [...new Set([...globalPerms, ...memberPerms])];

    req.user = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role as string,
      companyId: activeCompanyId,
      isActive: user.isActive,
      permissions: allPermissions,
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

const SUPER_ROLES = ['SUPER_ADMIN', 'ADMIN'];

export const authorize = (...permissions: (Permission | string)[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    const user = req.user;

    if (!user) {
      res.status(401).json({ success: false, message: 'Non autorisé' });
      return;
    }

    // Super admins passent toujours
    if (SUPER_ROLES.includes(user.role)) {
      next();
      return;
    }

    // Vérifier rôle direct
    const rolePermissions = permissions.filter((p) =>
      ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EMPLOYEE', 'CLIENT'].includes(p)
    );
    if (rolePermissions.length > 0 && rolePermissions.includes(user.role)) {
      next();
      return;
    }

    // Vérifier permissions custom
    const userPermissions: string[] = Array.isArray(user.permissions)
      ? (user.permissions as string[])
      : [];
      console.log(permissions);
      

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