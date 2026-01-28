import { Request, Response, NextFunction } from 'express';
import { AppError } from './error-handler';

const MAX_SCORE = 1000000;
const MAX_ATTEMPTS = 1000;
const MAX_DOLLS = 100;

export const validateScoreSubmission = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { score, attempts, dollsCaught } = req.body;

  if (typeof score !== 'number' || score < 0 || score > MAX_SCORE) {
    return next(new AppError(400, `Score must be a number between 0 and ${MAX_SCORE}`));
  }

  if (typeof attempts !== 'number' || attempts < 1 || attempts > MAX_ATTEMPTS) {
    return next(new AppError(400, `Attempts must be a number between 1 and ${MAX_ATTEMPTS}`));
  }

  if (typeof dollsCaught !== 'number' || dollsCaught < 0 || dollsCaught > MAX_DOLLS) {
    return next(new AppError(400, `DollsCaught must be a number between 0 and ${MAX_DOLLS}`));
  }

  next();
};

export const validatePagination = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { page, limit } = req.query;

  if (page !== undefined) {
    const pageNum = Number(page);
    if (isNaN(pageNum) || pageNum < 1) {
      return next(new AppError(400, 'Page must be a positive number'));
    }
  }

  if (limit !== undefined) {
    const limitNum = Number(limit);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      return next(new AppError(400, 'Limit must be a number between 1 and 100'));
    }
  }

  next();
};
