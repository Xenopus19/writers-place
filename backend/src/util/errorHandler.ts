import { Request, Response, NextFunction } from 'express';
import { UniqueConstraintError } from 'sequelize';
import { ZodError } from 'zod';
import { AppError } from './appError.js';

export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.status).json({
      status: err.status,
      code: err.code,
      message: err.message,
      errors: err.errors,
    });
  }

  if (err instanceof ZodError) {
    const fieldErrors = err.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));

    return res.status(400).json({
      status: 400,
      code: 'VALIDATION_ERROR',
      message: 'Validation error',
      errors: fieldErrors,
    });
  }

  if (err instanceof UniqueConstraintError) {
    const fieldErrors = err.errors.map((e) => ({
      field: e.path || 'unknown',
      message: e.message,
    }));

    return res.status(409).json({
      status: 409,
      code: 'RESOURCE_EXISTS',
      message: 'Resource already exists',
      errors: fieldErrors,
    });
  }

  console.error('Unhandled Error:', err);
  return res.status(500).json({
    status: 500,
    code: 'INTERNAL_SERVER_ERROR',
    message: 'Internal server error',
  });
}