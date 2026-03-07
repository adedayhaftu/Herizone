import { Response } from 'express';
import { body } from 'express-validator';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';

// POST /api/expert-applications  — authenticated user applies to become expert
export const applyAsExpert = async (req: AuthRequest, res: Response): Promise<void> => {
  const { bio, credentials, specialty } = req.body;

  // Check for existing pending/approved application
  const existing = await prisma.expertApplication.findFirst({
    where: {
      userId: req.user!.id,
      status: { in: ['pending', 'approved'] },
    },
  });
  if (existing) {
    res.status(409).json({ error: 'You already have a pending or approved application.' });
    return;
  }

  const application = await prisma.expertApplication.create({
    data: { userId: req.user!.id, bio, credentials, specialty },
  });

  res.status(201).json({ application });
};

// GET /api/expert-applications/me  — get own application status
export const getMyApplication = async (req: AuthRequest, res: Response): Promise<void> => {
  const application = await prisma.expertApplication.findFirst({
    where: { userId: req.user!.id },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ application });
};

// GET /api/expert-applications  — admin: list all applications
export const getApplications = async (req: AuthRequest, res: Response): Promise<void> => {
  const { status } = req.query as { status?: string };
  const applications = await prisma.expertApplication.findMany({
    where: status ? { status: status as any } : undefined,
    orderBy: { createdAt: 'asc' },
    include: {
      user: { select: { id: true, name: true, email: true, profilePicture: true } },
    },
  });
  res.json({ applications });
};

// PATCH /api/expert-applications/:id/approve  — admin approves, sets user.isExpert = true
export const approveApplication = async (req: AuthRequest, res: Response): Promise<void> => {
  const app = await prisma.expertApplication.findUnique({ where: { id: req.params.id } });
  if (!app) { res.status(404).json({ error: 'Application not found' }); return; }

  await prisma.$transaction([
    prisma.expertApplication.update({
      where: { id: req.params.id },
      data: { status: 'approved' },
    }),
    prisma.user.update({
      where: { id: app.userId },
      data: { isExpert: true },
    }),
  ]);

  res.json({ message: 'Application approved' });
};

// PATCH /api/expert-applications/:id/reject  — admin rejects
export const rejectApplication = async (req: AuthRequest, res: Response): Promise<void> => {
  const app = await prisma.expertApplication.findUnique({ where: { id: req.params.id } });
  if (!app) { res.status(404).json({ error: 'Application not found' }); return; }

  await prisma.expertApplication.update({
    where: { id: req.params.id },
    data: { status: 'rejected', reviewNote: req.body.reviewNote },
  });

  res.json({ message: 'Application rejected' });
};

// Validators
export const applyValidators = [
  body('bio').notEmpty().isString().isLength({ max: 2000 }),
  body('credentials').notEmpty().isString().isLength({ max: 2000 }),
  body('specialty').notEmpty().isString().isLength({ max: 200 }),
  validate,
];
