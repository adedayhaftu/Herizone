import { Response } from 'express';
import { body } from 'express-validator';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';

// GET /api/users/me
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    include: {
      children: true,
      pregnancyInfo: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
  });

  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  res.json({ user });
};

// PATCH /api/users/me
export const updateMe = async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, bio, profilePicture } = req.body;

  const user = await prisma.user.update({
    where: { id: req.user!.id },
    data: {
      ...(name !== undefined && { name }),
      ...(bio !== undefined && { bio }),
      ...(profilePicture !== undefined && { profilePicture }),
    },
    select: {
      id: true,
      email: true,
      name: true,
      bio: true,
      profilePicture: true,
      isAdmin: true,
      isExpert: true,
    },
  });

  res.json({ user });
};

// POST /api/users/children
export const addChild = async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, birthDate } = req.body;

  const child = await prisma.userChild.create({
    data: {
      userId: req.user!.id,
      name: name ?? null,
      birthDate: birthDate ? new Date(birthDate) : null,
    },
  });

  res.status(201).json({ child });
};

// POST /api/users/pregnancy
export const addPregnancy = async (req: AuthRequest, res: Response): Promise<void> => {
  const { dueDate, trimester } = req.body;

  const pregnancy = await prisma.pregnancyInfo.create({
    data: {
      userId: req.user!.id,
      dueDate: dueDate ? new Date(dueDate) : null,
      trimester: trimester ?? null,
    },
  });

  res.status(201).json({ pregnancy });
};

// Validators
export const updateMeValidators = [
  body('name').optional().isString().trim().isLength({ max: 255 }),
  body('bio').optional().isString().trim().isLength({ max: 1000 }),
  body('profilePicture').optional().isURL(),
  validate,
];

export const addChildValidators = [
  body('name').optional().isString().trim(),
  body('birthDate').optional().isISO8601().toDate(),
  validate,
];

export const addPregnancyValidators = [
  body('dueDate').optional().isISO8601().toDate(),
  body('trimester').optional().isInt({ min: 1, max: 3 }),
  validate,
];
