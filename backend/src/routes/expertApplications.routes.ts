import { Router } from 'express';
import {
  applyAsExpert,
  applyValidators,
  approveApplication,
  getApplications,
  getExperts,
  getMyApplication,
  rejectApplication,
} from '../controllers/expertApplications.controller';
import { authenticate, optionalAuth, requireAdmin } from '../middleware/auth';

const router = Router();

router.get('/experts', optionalAuth, getExperts);       // public — list approved experts
router.post('/', authenticate, applyValidators, applyAsExpert);
router.get('/me', authenticate, getMyApplication);
router.get('/', authenticate, requireAdmin, getApplications);
router.patch('/:id/approve', authenticate, requireAdmin, approveApplication);
router.patch('/:id/reject', authenticate, requireAdmin, rejectApplication);

export default router;
