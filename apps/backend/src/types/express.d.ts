// src/types/express.d.ts

import { UserRole } from '@prisma/client';

/**
 * Authenticated user interface
 */
export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  companyId: string | null;      // ← string | null
  isActive: boolean;
  permissions?: string[] | null; // ← ajouté
}

/**
 * JWT Payload interface
 */
export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  companyId: string;
  iat?: number;
  exp?: number;
}

/**
 * Extend Express Request interface globally
 */
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

// Required for module augmentation
export {};