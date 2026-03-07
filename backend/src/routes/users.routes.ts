import { Router } from 'express';
import {
    addChild,
    addChildValidators,
    addPregnancy,
    addPregnancyValidators,
    getMe,
    updateMe,
    updateMeValidators,
} from '../controllers/users.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/me', getMe);
router.patch('/me', updateMeValidators, updateMe);
router.post('/children', addChildValidators, addChild);
router.post('/pregnancy', addPregnancyValidators, addPregnancy);

export default router;
