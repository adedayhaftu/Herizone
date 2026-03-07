import { NextFunction, Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import jwt from 'jsonwebtoken';
import { ParsedQs } from 'qs';
import { prisma } from '../lib/prisma';

export interface AuthRequest<
  P = ParamsDictionary,
  ResBody = any,
  ReqBody = any,
  ReqQuery = ParsedQs
> extends Request<P, ResBody, ReqBody, ReqQuery> {
  user?: {
    id: string;
    email: string;
    isAdmin: boolean;
    isExpert: boolean;
  };
}

// Retry a DB call once if the connection was dropped (Neon auto-suspend)
async function withRetry<T>(fn: () => Promise<T>, retries = 2): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err: any) {
      const isConnErr =
        err?.code === 'P2024' ||
        err?.code === 'P1001' ||
        err?.message?.includes("Can't reach database");
      if (isConnErr && i < retries - 1) {
        await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
        continue;
      }
      throw err;
    }
  }
  throw new Error('Unreachable');
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET!;
    const decoded = jwt.verify(token, secret) as { userId: string };

    const user = await withRetry(() =>
      prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, email: true, isAdmin: true, isExpert: true, isBanned: true },
      })
    );

    if (!user) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    if (user.isBanned) {
      res.status(403).json({ error: 'Account is banned' });
      return;
    }

    req.user = { id: user.id, email: user.email, isAdmin: user.isAdmin, isExpert: user.isExpert };
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user?.isAdmin) {
    res.status(403).json({ error: 'Admin access required' });
    return;
  }
  next();
};

export const requireExpert = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user?.isExpert && !req.user?.isAdmin) {
    res.status(403).json({ error: 'Expert access required' });
    return;
  }
  next();
};

// Attaches user if a valid token is present, but does NOT block unauthenticated requests.
export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const secret = process.env.JWT_SECRET!;
      const decoded = jwt.verify(token, secret) as { userId: string };
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, email: true, isAdmin: true, isExpert: true, isBanned: true },
      });
      if (user && !user.isBanned) {
        req.user = { id: user.id, email: user.email, isAdmin: user.isAdmin, isExpert: user.isExpert };
      }
    }
  } catch {
    // Invalid/expired token — treat as guest, don't block
  }
  next();
};

export const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  } as jwt.SignOptions);
};
