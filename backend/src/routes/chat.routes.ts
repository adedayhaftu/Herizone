import { Router } from 'express';
import {
    feedbackValidators,
    getChatHistory,
    sendMessage,
    sendMessageValidators,
    submitFeedback,
} from '../controllers/chat.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/', sendMessageValidators, sendMessage);
router.get('/history', getChatHistory);
router.post('/:id/feedback', feedbackValidators, submitFeedback);

export default router;
