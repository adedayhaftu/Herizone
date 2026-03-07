import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';

// GET /api/admin/reports
export const getReports = async (req: AuthRequest, res: Response): Promise<void> => {
  const { status, page = '1', limit = '20' } = req.query as Record<string, string>;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const where: any = {};
  if (status) where.status = status;

  const [reports, total] = await Promise.all([
    prisma.report.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit),
      include: {
        user: { select: { id: true, name: true, email: true } },
        post: { select: { id: true, content: true } },
        comment: { select: { id: true, content: true } },
      },
    }),
    prisma.report.count({ where }),
  ]);

  res.json({ reports, total, page: parseInt(page), limit: parseInt(limit) });
};

// PATCH /api/admin/reports/:id
export const resolveReport = async (req: AuthRequest, res: Response): Promise<void> => {
  const { status } = req.body;

  if (!['resolved', 'dismissed'].includes(status)) {
    res.status(400).json({ error: 'Status must be "resolved" or "dismissed"' });
    return;
  }

  const report = await prisma.report.findUnique({ where: { id: req.params.id } });
  if (!report) {
    res.status(404).json({ error: 'Report not found' });
    return;
  }

  const updated = await prisma.report.update({
    where: { id: req.params.id },
    data: { status },
  });

  res.json({ report: updated });
};

// DELETE /api/admin/posts/:id
export const adminDeletePost = async (req: AuthRequest, res: Response): Promise<void> => {
  const post = await prisma.post.findUnique({ where: { id: req.params.id } });
  if (!post) {
    res.status(404).json({ error: 'Post not found' });
    return;
  }
  await prisma.post.delete({ where: { id: req.params.id } });
  res.json({ message: 'Post deleted by admin' });
};

// DELETE /api/admin/comments/:id
export const adminDeleteComment = async (req: AuthRequest, res: Response): Promise<void> => {
  const comment = await prisma.comment.findUnique({ where: { id: req.params.id } });
  if (!comment) {
    res.status(404).json({ error: 'Comment not found' });
    return;
  }
  await prisma.$transaction([
    prisma.comment.delete({ where: { id: req.params.id } }),
    prisma.post.update({
      where: { id: comment.postId },
      data: { commentCount: { decrement: 1 } },
    }),
  ]);
  res.json({ message: 'Comment deleted by admin' });
};

// PATCH /api/admin/users/:id/ban
export const banUser = async (req: AuthRequest, res: Response): Promise<void> => {
  const { banned } = req.body;

  const user = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  if (user.isAdmin) {
    res.status(403).json({ error: 'Cannot ban an admin' });
    return;
  }

  await prisma.user.update({
    where: { id: req.params.id },
    data: { isBanned: banned !== false },
  });

  res.json({ message: `User ${banned !== false ? 'banned' : 'unbanned'}` });
};

// PATCH /api/admin/users/:id/verify-expert
export const verifyExpert = async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  await prisma.user.update({ where: { id: req.params.id }, data: { isExpert: true } });
  res.json({ message: 'User verified as expert' });
};

// GET /api/admin/stats
export const getAdminStats = async (_req: AuthRequest, res: Response): Promise<void> => {
  const [
    totalUsers,
    totalPosts,
    totalComments,
    totalQuestions,
    totalAnswers,
    totalArticles,
    pendingReports,
    totalExperts,
    bannedUsers,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.post.count(),
    prisma.comment.count(),
    prisma.question.count(),
    prisma.answer.count(),
    prisma.article.count(),
    prisma.report.count({ where: { status: 'pending' } }),
    prisma.user.count({ where: { isExpert: true } }),
    prisma.user.count({ where: { isBanned: true } }),
  ]);

  res.json({
    stats: {
      totalUsers,
      totalPosts,
      totalComments,
      totalQuestions,
      totalAnswers,
      totalArticles,
      pendingReports,
      totalExperts,
      bannedUsers,
    },
  });
};
