import { Router } from 'express';
import authRoutes from './auth.routes';
import vendorRoutes from './vendor.routes';
import rfqRoutes from './rfq.routes';
import quotationRoutes from './quotation.routes';
import approvalRoutes from './approval.routes';
import poRoutes from './po.routes';
import activityRoutes from './activity.routes';
import reportsRoutes from './reports.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/vendors', vendorRoutes);
router.use('/rfqs', rfqRoutes);
router.use('/quotations', quotationRoutes);
router.use('/approvals', approvalRoutes);
router.use('/', poRoutes); // registers /purchase-orders and /invoices
router.use('/activity-logs', activityRoutes);
router.use('/reports', reportsRoutes);

export default router;
