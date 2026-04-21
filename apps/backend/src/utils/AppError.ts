// backend/src/utils/AppError.ts

/**
 * Custom Application Error class
 */
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;
  errors?: Record<string, string>;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}