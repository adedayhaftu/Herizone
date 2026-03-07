import { Router } from 'express';
import {
    createPost,
    createPostValidators,
    deletePost,
    getPost,
    getPosts,
    likePost,
    reportPost,
    reportPostValidators,
    unlikePost,
} from '../controllers/posts.controller';
import { authenticate, optionalAuth } from '../middleware/auth';

const router = Router();

// Public (guests can browse); optionalAuth attaches user when logged in
router.get('/', optionalAuth, getPosts);
router.get('/:id', optionalAuth, getPost);

// Authenticated actions
router.post('/', authenticate, createPostValidators, createPost);
router.delete('/:id', authenticate, deletePost);
router.post('/:id/like', authenticate, likePost);
router.delete('/:id/like', authenticate, unlikePost);
router.post('/:id/report', authenticate, reportPostValidators, reportPost);

export default router;
