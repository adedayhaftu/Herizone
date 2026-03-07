import { Router } from 'express';
import {
    adminDeleteComment,
    adminDeletePost,
    banUser,
    getAdminStats,
    getReports,
    resolveReport,
    verifyExpert,
} from '../controllers/admin.controller';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

router.use(authenticate, requireAdmin);

router.get('/stats', getAdminStats);
router.get('/reports', getReports);
router.patch('/reports/:id', resolveReport);
router.delete('/posts/:id', adminDeletePost);
router.delete('/comments/:id', adminDeleteComment);
router.patch('/users/:id/ban', banUser);
router.patch('/users/:id/verify-expert', verifyExpert);

export default router;
