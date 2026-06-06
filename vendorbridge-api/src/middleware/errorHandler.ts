import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err.message || err);
  const status = err.status || 500;
  const message = err.message || 'Internal server error';

  // Handle PostgreSQL unique constraint violations (e.g., email or GST number conflict)
  if (err.code === '23505') {
    return res.status(409).json({
      success: false,
      message: 'Duplicate entry',
      detail: err.detail,
    });
  }

  return res.status(status).json({
    success: false,
    message,
  });
};
