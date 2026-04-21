
// ============================================================================
// src/middleware/error.middleware.ts
// ============================================================================

import { Prisma } from '@prisma/client';
import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Erreur serveur interne';
  let errors = err.errors;

  // Handle Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002':
        statusCode = 400;
        const field = (err.meta?.target as string[])?.join(', ') || 'champ';
        message = `Un enregistrement avec ce ${field} existe déjà`;
        break;
      case 'P2003':
        statusCode = 400;
        message = 'Référence invalide à un enregistrement lié';
        break;
      case 'P2025':
        statusCode = 404;
        message = 'Enregistrement non trouvé';
        break;
      default:
        statusCode = 500;
        message = 'Erreur de base de données';
    }
  }

  // Handle Prisma validation errors
  if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    message = 'Erreur de validation des données';
  }

  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('❌ Error:', {
      statusCode,
      message,
      errors,
      stack: err.stack
    });
  }

  // Send error response
  res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

export const notFound = (req: Request, res: Response, next: NextFunction): void => {
  res.status(404).json({
    success: false,
    message: `Route non trouvée - ${req.originalUrl}`
  });
};