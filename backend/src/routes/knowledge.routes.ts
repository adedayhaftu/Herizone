import { Router } from 'express';
import {
    getKnowledgeStats,
    learnAnswer,
    learnPost,
    verifyKnowledge,
} from '../controllers/knowledge.controller';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

router.get('/stats', authenticate, getKnowledgeStats);
router.post('/learn-from-post/:id', authenticate, requireAdmin, learnPost);
router.post('/learn-from-answer/:id', authenticate, requireAdmin, learnAnswer);
router.patch('/:id/verify', authenticate, requireAdmin, verifyKnowledge);

export default router;
