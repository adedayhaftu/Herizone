import { Router } from 'express';
import {
  approveApplication,
  applyAsExpert,
  applyValidators,
  getApplications,
  getMyApplication,
  rejectApplication,
} from '../controllers/expertApplications.controller';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, applyValidators, applyAsExpert);
router.get('/me', authenticate, getMyApplication);
router.get('/', authenticate, requireAdmin, getApplications);
router.patch('/:id/approve', authenticate, requireAdmin, approveApplication);
router.patch('/:id/reject', authenticate, requireAdmin, rejectApplication);

export default router;
