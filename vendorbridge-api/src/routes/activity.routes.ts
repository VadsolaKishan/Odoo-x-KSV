import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import * as ac from '../controllers/activity.controller';

const router = Router();

router.get(
  '/',
  authMiddleware,
  ac.getActivityLogs
);

export default router;
