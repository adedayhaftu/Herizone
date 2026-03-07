import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../lib/prisma';
import { generateToken } from '../middleware/auth';

const userShape = (user: {
  id: string;
  email: string;
  name: string | null;
  profilePicture: string | null;
  bio: string | null;
  isAdmin: boolean;
  isExpert: boolean;
  isPremium: boolean;
  aiQuestionsCount: number;
  aiQuestionsLimit: number;
}) => ({
  id: user.id,
  email: user.email,
  name: user.name,
  profilePicture: user.profilePicture,
  bio: user.bio,
  isAdmin: user.isAdmin,
  isExpert: user.isExpert,
  isPremium: user.isPremium,
  aiQuestionsCount: user.aiQuestionsCount,
  aiQuestionsLimit: user.aiQuestionsLimit,
});

// ── Validation chains ─────────────────────────────────────────────────────────
export const registerValidation = [
  body('name').optional().isString().trim().isLength({ max: 100 }),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

export const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

// POST /api/auth/register
export const register = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const { name, email, password } = req.body as {
    name?: string;
    email: string;
    password: string;
  };

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ error: 'An account with this email already exists' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        name: name?.trim() ?? null,
        passwordHash,
      },
      select: {
        id: true,
        email: true,
        name: true,
        profilePicture: true,
        bio: true,
        isAdmin: true,
        isExpert: true,
        isPremium: true,
        aiQuestionsCount: true,
        aiQuestionsLimit: true,
      },
    });

    const token = generateToken(user.id);
    res.status(201).json({ token, user: userShape(user) });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
};

// POST /api/auth/login
export const login = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const { email, password } = req.body as { email: string; password: string };

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        profilePicture: true,
        bio: true,
        isAdmin: true,
        isExpert: true,
        isBanned: true,
        passwordHash: true,
        isPremium: true,
        aiQuestionsCount: true,
        aiQuestionsLimit: true,
      },
    });

    if (!user || !user.passwordHash) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    if (user.isBanned) {
      res.status(403).json({ error: 'Your account has been suspended' });
      return;
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const token = generateToken(user.id);
    const { isBanned: _b, passwordHash: _p, ...safeUser } = user;
    res.json({ token, user: userShape(safeUser) });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
};

// GET /api/auth/session
export const getSession = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as any;
  const userId = authReq.user?.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      profilePicture: true,
      bio: true,
      isAdmin: true,
      isExpert: true,
      isPremium: true,
      aiQuestionsCount: true,
      aiQuestionsLimit: true,
      createdAt: true,
    },
  });

  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  res.json({ user });
};

// POST /api/auth/signout
export const signOut = (_req: Request, res: Response): void => {
  // JWT is stateless — client drops the token.
  res.json({ message: 'Signed out successfully' });
};
