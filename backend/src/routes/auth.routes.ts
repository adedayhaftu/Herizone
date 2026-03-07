import { Router } from 'express';
import {
    getSession,
    login,
    loginValidation,
    register,
    registerValidation,
    signOut,
} from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/session', authenticate, getSession);
router.post('/signout', authenticate, signOut);

export default router;
