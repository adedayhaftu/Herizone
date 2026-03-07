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
import { authenticate, optionalAuth, requireAdmin } from '../middleware/auth';

const router = Router();

// Public reads (guests can browse; token attached if present for personalisation)
router.get('/', optionalAuth, getArticles);
router.get('/:id', optionalAuth, getArticle);

// Admin writes
router.post('/', authenticate, requireAdmin, createArticleValidators, createArticle);
router.patch('/:id', authenticate, requireAdmin, updateArticleValidators, updateArticle);
router.delete('/:id', authenticate, requireAdmin, deleteArticle);

// Authenticated bookmarks
router.post('/:id/bookmark', authenticate, bookmarkArticle);
router.delete('/:id/bookmark', authenticate, removeBookmark);

export default router;
