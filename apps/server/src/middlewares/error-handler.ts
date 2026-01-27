import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types/api.types';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): void => {
  console.error('Error:', err);

  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    error: message
  });
};
