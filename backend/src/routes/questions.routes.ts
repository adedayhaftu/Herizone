import { Router } from 'express';
import {
    answerQuestion,
    answerQuestionValidators,
    createQuestion,
    createQuestionValidators,
    getQuestion,
    getQuestions,
} from '../controllers/questions.controller';
import { authenticate, requireExpert } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getQuestions);
router.post('/', authenticate, createQuestionValidators, createQuestion);
router.get('/:id', authenticate, getQuestion);
router.post('/:id/answers', authenticate, requireExpert, answerQuestionValidators, answerQuestion);

export default router;
