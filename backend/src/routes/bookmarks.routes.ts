import { Router } from 'express';
import { getBookmarks } from '../controllers/articles.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getBookmarks);

export default router;
