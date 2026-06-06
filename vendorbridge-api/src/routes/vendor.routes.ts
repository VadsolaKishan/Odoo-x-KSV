import { Router } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';
import * as vc from '../controllers/vendor.controller';

const router = Router();

router.get('/', authMiddleware, vc.getVendors);
router.get('/:id', authMiddleware, vc.getVendorById);
router.post(
  '/',
  authMiddleware,
  requireRole('admin', 'procurement_officer'),
  validate(vc.createVendorSchema),
  vc.createVendor
);
router.put(
  '/:id',
  authMiddleware,
  requireRole('admin', 'procurement_officer'),
  validate(vc.updateVendorSchema),
  vc.updateVendor
);
router.delete('/:id', authMiddleware, requireRole('admin'), vc.deleteVendor);
router.patch('/:id/rate', authMiddleware, requireRole('admin', 'manager'), vc.rateVendor);

export default router;
