import { Response } from 'express';
import { body } from 'express-validator';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { learnFromAnswer } from '../services/knowledge.service';

// GET /api/questions
export const getQuestions = async (req: AuthRequest, res: Response): Promise<void> => {
  const { topic, search, page = '1', limit = '20' } = req.query as Record<string, string>;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const where: any = {};
  if (topic) where.topic = topic;
  if (search) where.question = { contains: search, mode: 'insensitive' };

  const [questions, total] = await Promise.all([
    prisma.question.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit),
      include: {
        user: { select: { id: true, name: true, profilePicture: true } },
        _count: { select: { answers: true } },
      },
    }),
    prisma.question.count({ where }),
  ]);

  res.json({ questions, total, page: parseInt(page), limit: parseInt(limit) });
};

// POST /api/questions
export const createQuestion = async (req: AuthRequest, res: Response): Promise<void> => {
  const { question, topic } = req.body;
  const user = req.user!;

  // Check if user is premium - only premium users can ask expert questions
  if (!user.isPremium) {
    res.status(403).json({
      error: 'Premium subscription required',
      message: 'Asking expert questions is a premium feature. Upgrade to Premium to get personalized answers from verified experts!',
      premiumRequired: true,
    });
    return;
  }

  const q = await prisma.question.create({
    data: { userId: user.id, question, topic },
    include: { user: { select: { id: true, name: true, profilePicture: true } } },
  });

  res.status(201).json({ question: q });
};

// GET /api/questions/:id
export const getQuestion = async (req: AuthRequest, res: Response): Promise<void> => {
  const q = await prisma.question.findUnique({
    where: { id: req.params.id },
    include: {
      user: { select: { id: true, name: true, profilePicture: true } },
      answers: {
        orderBy: { createdAt: 'asc' },
        include: {
          expert: { select: { id: true, name: true, profilePicture: true, isExpert: true } },
        },
      },
    },
  });

  if (!q) {
    res.status(404).json({ error: 'Question not found' });
    return;
  }

  res.json({ question: q });
};

// POST /api/questions/:id/answers  (expert only)
export const answerQuestion = async (req: AuthRequest, res: Response): Promise<void> => {
  const { answer } = req.body;
  const questionId = req.params.id;

  const q = await prisma.question.findUnique({ where: { id: questionId } });
  if (!q) {
    res.status(404).json({ error: 'Question not found' });
    return;
  }

  const ans = await prisma.answer.create({
    data: { questionId, expertId: req.user!.id, answer },
    include: {
      expert: { select: { id: true, name: true, profilePicture: true } },
    },
  });

  // Automatically trigger learning from this expert answer in the background
  learnFromAnswer(ans.id).catch((err) =>
    console.error('Knowledge learning failed for answer:', ans.id, err)
  );

  res.status(201).json({ answer: ans });
};

// Validators
export const createQuestionValidators = [
  body('question').notEmpty().isString().isLength({ max: 1000 }),
  body('topic').isIn(['medical', 'mental_health', 'nutrition', 'parenting']),
  validate,
];

export const answerQuestionValidators = [
  body('answer').notEmpty().isString().isLength({ max: 3000 }),
  validate,
];
