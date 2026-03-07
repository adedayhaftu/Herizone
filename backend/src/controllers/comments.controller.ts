import { Response } from 'express';
import { body } from 'express-validator';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { learnFromPost } from '../services/knowledge.service';

// POST /api/posts/:id/comments
export const addComment = async (req: AuthRequest, res: Response): Promise<void> => {
  const { content } = req.body;
  const postId = req.params.id;

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) {
    res.status(404).json({ error: 'Post not found' });
    return;
  }

  const [comment] = await prisma.$transaction([
    prisma.comment.create({
      data: { postId, userId: req.user!.id, content },
      include: { user: { select: { id: true, name: true, profilePicture: true } } },
    }),
    prisma.post.update({ where: { id: postId }, data: { commentCount: { increment: 1 } } }),
  ]);

  // If the post is already high-engagement (20+ likes), re-extract knowledge
  // using the latest comment as the answer
  if (post.likeCount >= 20) {
    learnFromPost(postId).catch((err) =>
      console.error('Knowledge learning failed for post after comment:', postId, err)
    );
  }

  res.status(201).json({ comment });
};

// DELETE /api/comments/:id
export const deleteComment = async (req: AuthRequest, res: Response): Promise<void> => {
  const comment = await prisma.comment.findUnique({ where: { id: req.params.id } });

  if (!comment) {
    res.status(404).json({ error: 'Comment not found' });
    return;
  }

  if (comment.userId !== req.user!.id && !req.user!.isAdmin) {
    res.status(403).json({ error: 'Not authorized' });
    return;
  }

  await prisma.$transaction([
    prisma.comment.delete({ where: { id: req.params.id } }),
    prisma.post.update({ where: { id: comment.postId }, data: { commentCount: { decrement: 1 } } }),
  ]);

  res.json({ message: 'Comment deleted' });
};

// POST /api/comments/:id/report
export const reportComment = async (req: AuthRequest, res: Response): Promise<void> => {
  const { reason } = req.body;

  const comment = await prisma.comment.findUnique({ where: { id: req.params.id } });
  if (!comment) {
    res.status(404).json({ error: 'Comment not found' });
    return;
  }

  await prisma.$transaction([
    prisma.report.create({
      data: { userId: req.user!.id, commentId: req.params.id, reason },
    }),
    prisma.comment.update({ where: { id: req.params.id }, data: { isReported: true } }),
  ]);

  res.status(201).json({ message: 'Reported' });
};

// Validators
export const addCommentValidators = [
  body('content').notEmpty().isString().isLength({ max: 1000 }),
  validate,
];

export const reportCommentValidators = [
  body('reason').optional().isString().isLength({ max: 500 }),
  validate,
];
