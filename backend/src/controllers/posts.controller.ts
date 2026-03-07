import { Response } from 'express';
import { body } from 'express-validator';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { learnFromPost } from '../services/knowledge.service';

// GET /api/posts
export const getPosts = async (req: AuthRequest, res: Response): Promise<void> => {
  const { category, search, page = '1', limit = '20' } = req.query as Record<string, string>;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const where: any = {};
  if (category) where.category = category;
  if (search) where.content = { contains: search, mode: 'insensitive' };

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit),
      include: {
        user: {
          select: { id: true, name: true, profilePicture: true },
        },
        _count: { select: { comments: true, likes: true } },
      },
    }),
    prisma.post.count({ where }),
  ]);

  // Mask user info for anonymous posts
  const sanitized = posts.map((p: typeof posts[number]) => ({
    ...p,
    user: p.isAnonymous ? null : p.user,
  }));

  res.json({ posts: sanitized, total, page: parseInt(page), limit: parseInt(limit) });
};

// POST /api/posts
export const createPost = async (req: AuthRequest, res: Response): Promise<void> => {
  const { content, category, isAnonymous = false } = req.body;

  const post = await prisma.post.create({
    data: {
      userId: req.user!.id,
      content,
      category,
      isAnonymous,
    },
    include: {
      user: { select: { id: true, name: true, profilePicture: true } },
    },
  });

  res.status(201).json({ post: { ...post, user: isAnonymous ? null : post.user } });
};

// GET /api/posts/:id
export const getPost = async (req: AuthRequest, res: Response): Promise<void> => {
  const post = await prisma.post.findUnique({
    where: { id: req.params.id },
    include: {
      user: { select: { id: true, name: true, profilePicture: true } },
      comments: {
        orderBy: { createdAt: 'asc' },
        include: {
          user: { select: { id: true, name: true, profilePicture: true } },
        },
      },
      _count: { select: { likes: true } },
    },
  });

  if (!post) {
    res.status(404).json({ error: 'Post not found' });
    return;
  }

  res.json({ post: { ...post, user: post.isAnonymous ? null : post.user } });
};

// DELETE /api/posts/:id
export const deletePost = async (req: AuthRequest, res: Response): Promise<void> => {
  const post = await prisma.post.findUnique({ where: { id: req.params.id } });

  if (!post) {
    res.status(404).json({ error: 'Post not found' });
    return;
  }

  if (post.userId !== req.user!.id && !req.user!.isAdmin) {
    res.status(403).json({ error: 'Not authorized' });
    return;
  }

  await prisma.post.delete({ where: { id: req.params.id } });
  res.json({ message: 'Post deleted' });
};

// POST /api/posts/:id/like
export const likePost = async (req: AuthRequest, res: Response): Promise<void> => {
  const postId = req.params.id;

  const existing = await prisma.like.findUnique({
    where: { postId_userId: { postId, userId: req.user!.id } },
  });

  if (existing) {
    res.status(409).json({ error: 'Already liked' });
    return;
  }

  await prisma.$transaction([
    prisma.like.create({ data: { postId, userId: req.user!.id } }),
    prisma.post.update({ where: { id: postId }, data: { likeCount: { increment: 1 } } }),
  ]);

  // Check the new like count; if it just crossed 20 trigger knowledge ingestion
  const updated = await prisma.post.findUnique({ where: { id: postId }, select: { likeCount: true } });
  if (updated && updated.likeCount >= 20) {
    learnFromPost(postId).catch((err) =>
      console.error('Knowledge learning failed for post:', postId, err)
    );
  }

  res.status(201).json({ message: 'Liked' });
};

// DELETE /api/posts/:id/like
export const unlikePost = async (req: AuthRequest, res: Response): Promise<void> => {
  const postId = req.params.id;

  const existing = await prisma.like.findUnique({
    where: { postId_userId: { postId, userId: req.user!.id } },
  });

  if (!existing) {
    res.status(404).json({ error: 'Like not found' });
    return;
  }

  await prisma.$transaction([
    prisma.like.delete({ where: { postId_userId: { postId, userId: req.user!.id } } }),
    prisma.post.update({ where: { id: postId }, data: { likeCount: { decrement: 1 } } }),
  ]);

  res.json({ message: 'Unliked' });
};

// POST /api/posts/:id/report
export const reportPost = async (req: AuthRequest, res: Response): Promise<void> => {
  const { reason } = req.body;

  const post = await prisma.post.findUnique({ where: { id: req.params.id } });
  if (!post) {
    res.status(404).json({ error: 'Post not found' });
    return;
  }

  await prisma.$transaction([
    prisma.report.create({
      data: { userId: req.user!.id, postId: req.params.id, reason },
    }),
    prisma.post.update({ where: { id: req.params.id }, data: { isReported: true } }),
  ]);

  res.status(201).json({ message: 'Reported' });
};

// Validators
export const createPostValidators = [
  body('content').notEmpty().isString().isLength({ max: 2000 }),
  body('category').isIn(['pregnancy', 'parenting', 'health', 'general']),
  body('isAnonymous').optional().isBoolean(),
  validate,
];

export const reportPostValidators = [
  body('reason').optional().isString().isLength({ max: 500 }),
  validate,
];
