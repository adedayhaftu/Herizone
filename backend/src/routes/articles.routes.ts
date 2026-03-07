import { Router } from 'express';
import {
  bookmarkArticle,
  createArticle,
  createArticleValidators,
  deleteArticle,
  getArticle,
  getArticles,
  getPendingArticles,
  publishArticle,
  rejectArticle,
  removeBookmark,
  updateArticle,
  updateArticleValidators,
} from '../controllers/articles.controller';
import { authenticate, optionalAuth, requireAdmin, requireExpert } from '../middleware/auth';

const router = Router();

// Public reads — guests get published only; authenticated experts add ?mine=true
router.get('/', optionalAuth, getArticles);
router.get('/pending', authenticate, requireAdmin, getPendingArticles);
router.get('/:id', optionalAuth, getArticle);

// Experts submit articles (land as pending_review); admins can publish directly
router.post('/', authenticate, requireExpert, createArticleValidators, createArticle);

// Experts edit their own; admins edit any
router.patch('/:id', authenticate, updateArticleValidators, updateArticle);

// Admin-only: publish / reject
router.patch('/:id/publish', authenticate, requireAdmin, publishArticle);
router.patch('/:id/reject', authenticate, requireAdmin, rejectArticle);

// Experts delete own non-published; admins delete any
router.delete('/:id', authenticate, deleteArticle);

// Authenticated bookmarks
router.post('/:id/bookmark', authenticate, bookmarkArticle);
router.delete('/:id/bookmark', authenticate, removeBookmark);

export default router;
