import { Router } from 'express';
import {
    addComment,
    addCommentValidators,
    deleteComment,
    reportComment,
    reportCommentValidators,
} from '../controllers/comments.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Comments on posts: /api/posts/:id/comments (mounted from posts router context)
// Standalone comment actions: /api/comments/:id
router.delete('/:id', authenticate, deleteComment);
router.post('/:id/report', authenticate, reportCommentValidators, reportComment);

export { addComment, addCommentValidators };
export default router;
