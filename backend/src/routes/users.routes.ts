import { Router } from 'express';
import {
    addChild,
    addChildValidators,
    addPregnancy,
    addPregnancyValidators,
    getMe,
    getProfile,
    updateMe,
    updateMeValidators,
} from '../controllers/users.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Public profile route (optional authentication for checking follow status etc. if added later)
router.get('/:id', getProfile);

router.use(authenticate);

router.get('/me', getMe);
router.patch('/me', updateMeValidators, updateMe);
router.post('/children', addChildValidators, addChild);
router.post('/pregnancy', addPregnancyValidators, addPregnancy);

export default router;
