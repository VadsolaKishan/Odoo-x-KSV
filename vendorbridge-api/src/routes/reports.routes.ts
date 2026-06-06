import { Router } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth';
import * as rc from '../controllers/reports.controller';

const router = Router();

router.get(
  '/summary',
  authMiddleware,
  requireRole('manager', 'admin', 'procurement_officer'),
  rc.getSummary
);

router.get(
  '/monthly-spend',
  authMiddleware,
  rc.getMonthlySpend
);

router.get(
  '/vendor-performance',
  authMiddleware,
  rc.getVendorPerformance
);

export default router;
