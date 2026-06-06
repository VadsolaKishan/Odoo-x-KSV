import { Router } from 'express';
import { validate } from '../middleware/validate';
import { authMiddleware } from '../middleware/auth';
import {
  register,
  login,
  getMe,
  registerSchema,
  loginSchema,
  registerVendor,
  registerVendorSchema,
} from '../controllers/auth.controller';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/register-vendor', validate(registerVendorSchema), registerVendor);
router.post('/login', validate(loginSchema), login);
router.get('/me', authMiddleware, getMe);

export default router;
