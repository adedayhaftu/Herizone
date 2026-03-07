import { Response } from 'express';
import { body } from 'express-validator';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';

// GET /api/articles
export const getArticles = async (req: AuthRequest, res: Response): Promise<void> => {
  const { category, search, tags, page = '1', limit = '20' } = req.query as Record<string, string>;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const where: any = {};
  if (category) where.category = category;
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { tags: { has: search } },
    ];
  }
  if (tags) {
    const tagArray = tags.split(',').map((t) => t.trim());
    where.tags = { hasSome: tagArray };
  }

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit),
      select: {
        id: true,
        title: true,
        category: true,
        tags: true,
        createdAt: true,
        author: { select: { id: true, name: true } },
      },
    }),
    prisma.article.count({ where }),
  ]);

  res.json({ articles, total, page: parseInt(page), limit: parseInt(limit) });
};

// GET /api/articles/:id
export const getArticle = async (req: AuthRequest, res: Response): Promise<void> => {
  const article = await prisma.article.findUnique({
    where: { id: req.params.id },
    include: { author: { select: { id: true, name: true, profilePicture: true } } },
  });

  if (!article) {
    res.status(404).json({ error: 'Article not found' });
    return;
  }

  res.json({ article });
};

// POST /api/articles  (admin only)
export const createArticle = async (req: AuthRequest, res: Response): Promise<void> => {
  const { title, content, category, tags = [] } = req.body;

  const article = await prisma.article.create({
    data: { title, content, category, tags, authorId: req.user!.id },
    include: { author: { select: { id: true, name: true } } },
  });

  res.status(201).json({ article });
};

// PATCH /api/articles/:id  (admin only)
export const updateArticle = async (req: AuthRequest, res: Response): Promise<void> => {
  const { title, content, category, tags } = req.body;

  const exists = await prisma.article.findUnique({ where: { id: req.params.id } });
  if (!exists) {
    res.status(404).json({ error: 'Article not found' });
    return;
  }

  const article = await prisma.article.update({
    where: { id: req.params.id },
    data: {
      ...(title !== undefined && { title }),
      ...(content !== undefined && { content }),
      ...(category !== undefined && { category }),
      ...(tags !== undefined && { tags }),
    },
  });

  res.json({ article });
};

// DELETE /api/articles/:id  (admin only)
export const deleteArticle = async (req: AuthRequest, res: Response): Promise<void> => {
  const exists = await prisma.article.findUnique({ where: { id: req.params.id } });
  if (!exists) {
    res.status(404).json({ error: 'Article not found' });
    return;
  }

  await prisma.article.delete({ where: { id: req.params.id } });
  res.json({ message: 'Article deleted' });
};

// POST /api/articles/:id/bookmark
export const bookmarkArticle = async (req: AuthRequest, res: Response): Promise<void> => {
  const articleId = req.params.id;

  const exists = await prisma.article.findUnique({ where: { id: articleId } });
  if (!exists) {
    res.status(404).json({ error: 'Article not found' });
    return;
  }

  const existing = await prisma.bookmark.findUnique({
    where: { userId_articleId: { userId: req.user!.id, articleId } },
  });

  if (existing) {
    res.status(409).json({ error: 'Already bookmarked' });
    return;
  }

  const bookmark = await prisma.bookmark.create({
    data: { userId: req.user!.id, articleId },
  });

  res.status(201).json({ bookmark });
};

// DELETE /api/articles/:id/bookmark
export const removeBookmark = async (req: AuthRequest, res: Response): Promise<void> => {
  const articleId = req.params.id;

  const existing = await prisma.bookmark.findUnique({
    where: { userId_articleId: { userId: req.user!.id, articleId } },
  });

  if (!existing) {
    res.status(404).json({ error: 'Bookmark not found' });
    return;
  }

  await prisma.bookmark.delete({
    where: { userId_articleId: { userId: req.user!.id, articleId } },
  });

  res.json({ message: 'Bookmark removed' });
};

// GET /api/bookmarks
export const getBookmarks = async (req: AuthRequest, res: Response): Promise<void> => {
  const bookmarks = await prisma.bookmark.findMany({
    where: { userId: req.user!.id },
    orderBy: { createdAt: 'desc' },
    include: {
      article: {
        select: { id: true, title: true, category: true, tags: true, createdAt: true },
      },
    },
  });

  res.json({ bookmarks });
};

// Validators
export const createArticleValidators = [
  body('title').notEmpty().isString().isLength({ max: 500 }),
  body('content').notEmpty().isString(),
  body('category').isIn(['pregnancy', 'parenting', 'health', 'nutrition']),
  body('tags').optional().isArray(),
  validate,
];

export const updateArticleValidators = [
  body('title').optional().isString().isLength({ max: 500 }),
  body('content').optional().isString(),
  body('category').optional().isIn(['pregnancy', 'parenting', 'health', 'nutrition']),
  body('tags').optional().isArray(),
  validate,
];
