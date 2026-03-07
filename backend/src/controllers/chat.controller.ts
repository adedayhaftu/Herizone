import { Response } from 'express';
import { body } from 'express-validator';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { chatWithAI } from '../services/ai.service';

// POST /api/chat
export const sendMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  const { message } = req.body;
  const user = req.user!;

  // Check if user has exceeded AI questions limit (freemium users only)
  if (!user.isPremium) {
    // Reset count if it's a new period (e.g., daily reset)
    const now = new Date();
    const resetDate = user.aiQuestionsResetAt ? new Date(user.aiQuestionsResetAt) : null;
    
    if (!resetDate || now > resetDate) {
      // Reset the counter (daily limit)
      await prisma.user.update({
        where: { id: user.id },
        data: {
          aiQuestionsCount: 0,
          aiQuestionsResetAt: new Date(now.getTime() + 24 * 60 * 60 * 1000), // +24 hours
        },
      });
      user.aiQuestionsCount = 0;
    }

    // Check if limit exceeded
    if (user.aiQuestionsCount >= user.aiQuestionsLimit) {
      res.status(403).json({
        error: 'AI question limit reached',
        message: `You have reached your daily limit of ${user.aiQuestionsLimit} AI questions. Upgrade to Premium for unlimited access!`,
        limitReached: true,
        limit: user.aiQuestionsLimit,
        resetAt: user.aiQuestionsResetAt,
      });
      return;
    }
  }

  // Save user message
  await prisma.chatMessage.create({
    data: { userId: user.id, message, isAi: false },
  });

  try {
    const { answer, confidence, sourceCount, sourceIds } = await chatWithAI(message, user.id);

    // Save AI response
    const aiMessage = await prisma.chatMessage.create({
      data: {
        userId: user.id,
        message: answer,
        isAi: true,
        sourceIds,
      },
    });

    // Increment AI questions count for freemium users
    if (!user.isPremium) {
      await prisma.user.update({
        where: { id: user.id },
        data: { aiQuestionsCount: { increment: 1 } },
      });
    }

    res.status(201).json({
      message: {
        id: aiMessage.id,
        content: answer,
        confidence,
        sourceCount,
        isAi: true,
        createdAt: aiMessage.createdAt,
      },
      questionsRemaining: user.isPremium ? null : user.aiQuestionsLimit - user.aiQuestionsCount - 1,
    });
  } catch (err) {
    console.error('AI chat error:', err);
    res.status(500).json({ error: 'Failed to get AI response' });
  }
};

// GET /api/chat/history
export const getChatHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  const { page = '1', limit = '50' } = req.query as Record<string, string>;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const messages = await prisma.chatMessage.findMany({
    where: { userId: req.user!.id },
    orderBy: { createdAt: 'asc' },
    skip,
    take: parseInt(limit),
    include: {
      feedback: { where: { userId: req.user!.id }, select: { isHelpful: true } },
    },
  });

  res.json({ messages });
};

// POST /api/chat/:id/feedback
export const submitFeedback = async (req: AuthRequest, res: Response): Promise<void> => {
  const { isHelpful } = req.body;
  const messageId = req.params.id;

  const message = await prisma.chatMessage.findUnique({ where: { id: messageId } });
  if (!message || !message.isAi) {
    res.status(404).json({ error: 'AI message not found' });
    return;
  }
  if (message.userId !== req.user!.id) {
    res.status(403).json({ error: 'Not authorized' });
    return;
  }

  // Upsert feedback — user can change their rating
  const feedback = await prisma.chatFeedback.upsert({
    where: {
      // use the unique constraint — we'll need a unique index in schema
      // using create/update pattern instead
      id: (
        await prisma.chatFeedback.findFirst({
          where: { messageId, userId: req.user!.id },
          select: { id: true },
        })
      )?.id ?? '00000000-0000-0000-0000-000000000000',
    },
    update: { isHelpful },
    create: { messageId, userId: req.user!.id, isHelpful },
  });

  // Update confidence scores of knowledge entries referenced in this message
  if (message.sourceIds.length > 0) {
    const delta = isHelpful ? 1 : -1;
    await prisma.knowledgeBase.updateMany({
      where: { id: { in: message.sourceIds } },
      data: { confidenceScore: { increment: delta } },
    });
  }

  res.status(201).json({ feedback: { isHelpful } });
};

// Validators
export const sendMessageValidators = [
  body('message').notEmpty().isString().isLength({ max: 2000 }),
  validate,
];

export const feedbackValidators = [
  body('isHelpful').isBoolean(),
  validate,
];
