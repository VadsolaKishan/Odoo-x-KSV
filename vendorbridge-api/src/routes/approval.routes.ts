import { Router } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';
import * as ac from '../controllers/approval.controller';

const router = Router();

router.get(
  '/',
  authMiddleware,
  ac.getApprovals
);

router.get(
  '/:quotation_id',
  authMiddleware,
  ac.getApprovalChain
);

router.patch(
  '/:id/approve',
  authMiddleware,
  requireRole('manager', 'admin'),
  validate(ac.approvalDecisionSchema),
  ac.approveLevel
);

router.patch(
  '/:id/reject',
  authMiddleware,
  requireRole('manager', 'admin'),
  validate(ac.approvalDecisionSchema),
  ac.rejectLevel
);

export default router;
