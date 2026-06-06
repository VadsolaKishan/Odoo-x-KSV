import { Router } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';
import * as qc from '../controllers/quotation.controller';

const router = Router();

router.get(
  '/',
  authMiddleware,
  requireRole('procurement_officer', 'admin', 'manager', 'vendor'),
  qc.getQuotations
);

router.get(
  '/compare/:rfq_id',
  authMiddleware,
  requireRole('procurement_officer', 'admin', 'manager'),
  qc.compareQuotations
);

router.get(
  '/:id',
  authMiddleware,
  qc.getQuotationById
);

router.post(
  '/',
  authMiddleware,
  requireRole('vendor'),
  validate(qc.createQuotationSchema),
  qc.createQuotation
);

router.patch(
  '/:id/submit',
  authMiddleware,
  requireRole('vendor'),
  qc.submitQuotation
);

router.patch(
  '/:id/select',
  authMiddleware,
  requireRole('procurement_officer', 'admin'),
  qc.selectQuotation
);

export default router;
