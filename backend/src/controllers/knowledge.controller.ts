import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';
import {
    learnFromAnswer,
    learnFromPost
} from '../services/knowledge.service';

// POST /api/knowledge/learn-from-post/:id
export const learnPost = async (req: AuthRequest, res: Response): Promise<void> => {
  const success = await learnFromPost(req.params.id);
  if (!success) {
    res.status(400).json({ error: 'Post not eligible for learning (requires 20+ likes and a comment)' });
    return;
  }
  res.json({ message: 'Learned from post' });
};

// POST /api/knowledge/learn-from-answer/:id
export const learnAnswer = async (req: AuthRequest, res: Response): Promise<void> => {
  const success = await learnFromAnswer(req.params.id);
  if (!success) {
    res.status(400).json({ error: 'Answer not found or extraction failed' });
    return;
  }
  res.json({ message: 'Learned from expert answer' });
};

// GET /api/knowledge/stats
export const getKnowledgeStats = async (_req: AuthRequest, res: Response): Promise<void> => {
  const [total, fromCommunity, fromExperts, fromArticles, avgScoreResult, totalFeedback, helpfulFeedback] =
    await Promise.all([
      prisma.knowledgeBase.count(),
      prisma.knowledgeBase.count({ where: { sourceType: 'community_post' } }),
      prisma.knowledgeBase.count({ where: { sourceType: 'expert_answer' } }),
      prisma.knowledgeBase.count({ where: { sourceType: 'article' } }),
      prisma.knowledgeBase.aggregate({ _avg: { confidenceScore: true } }),
      prisma.chatFeedback.count(),
      prisma.chatFeedback.count({ where: { isHelpful: true } }),
    ]);

  const userSatisfaction =
    totalFeedback > 0 ? Math.round((helpfulFeedback / totalFeedback) * 100) : 0;

  const totalQuestions = await prisma.chatMessage.count({ where: { isAi: false } });

  res.json({
    stats: {
      total,
      fromCommunity,
      fromExperts,
      fromArticles,
      avgConfidenceScore: Math.round((avgScoreResult._avg.confidenceScore ?? 0) * 10),
      userSatisfaction,
      questionsAnswered: totalQuestions,
    },
  });
};

// PATCH /api/knowledge/:id/verify  (admin)
export const verifyKnowledge = async (req: AuthRequest, res: Response): Promise<void> => {
  const entry = await prisma.knowledgeBase.findUnique({ where: { id: req.params.id } });
  if (!entry) {
    res.status(404).json({ error: 'Knowledge entry not found' });
    return;
  }

  const updated = await prisma.knowledgeBase.update({
    where: { id: req.params.id },
    data: { isVerified: true, confidenceScore: Math.max(entry.confidenceScore, 8) },
  });

  res.json({ entry: updated });
};
