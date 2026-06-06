import { Router } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';
import * as rc from '../controllers/rfq.controller';

const router = Router();

router.get('/', authMiddleware, rc.getRFQs);
router.get('/:id', authMiddleware, rc.getRFQById);
router.post(
  '/',
  authMiddleware,
  requireRole('admin', 'procurement_officer'),
  validate(rc.createRFQSchema),
  rc.createRFQ
);
router.put(
  '/:id',
  authMiddleware,
  validate(rc.updateRFQSchema),
  rc.updateRFQ
);
router.patch(
  '/:id/status',
  authMiddleware,
  validate(rc.updateStatusSchema),
  rc.patchRFQStatus
);
router.delete('/:id', authMiddleware, rc.deleteRFQ);

export default router;
