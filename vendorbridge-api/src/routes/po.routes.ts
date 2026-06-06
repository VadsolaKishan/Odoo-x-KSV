import { Router } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth';
import * as pc from '../controllers/po.controller';

const router = Router();

// Purchase Orders
router.get(
  '/purchase-orders',
  authMiddleware,
  pc.getPurchaseOrders
);

router.get(
  '/purchase-orders/:id',
  authMiddleware,
  pc.getPurchaseOrderById
);

// Invoices
router.get(
  '/invoices',
  authMiddleware,
  pc.getInvoices
);

router.get(
  '/invoices/:id',
  authMiddleware,
  pc.getInvoiceById
);

router.patch(
  '/invoices/:id/mark-paid',
  authMiddleware,
  requireRole('manager', 'admin'),
  pc.markInvoicePaid
);

router.post(
  '/invoices/:id/send-email',
  authMiddleware,
  pc.sendInvoiceEmail
);

export default router;
