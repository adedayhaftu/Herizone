import { Router } from 'express';
import {
    bookmarkArticle,
    createArticle,
    createArticleValidators,
    deleteArticle,
    getArticle,
    getArticles,
    removeBookmark,
    updateArticle,
    updateArticleValidators
} from '../controllers/articles.controller';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getArticles);
router.get('/:id', authenticate, getArticle);
router.post('/', authenticate, requireAdmin, createArticleValidators, createArticle);
router.patch('/:id', authenticate, requireAdmin, updateArticleValidators, updateArticle);
router.delete('/:id', authenticate, requireAdmin, deleteArticle);
router.post('/:id/bookmark', authenticate, bookmarkArticle);
router.delete('/:id/bookmark', authenticate, removeBookmark);

export default router;
