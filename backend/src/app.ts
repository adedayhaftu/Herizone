import cors from 'cors';
import 'dotenv/config';
import express from 'express';

import adminRoutes from './routes/admin.routes';
import articleRoutes from './routes/articles.routes';
import authRoutes from './routes/auth.routes';
import bookmarkRoutes from './routes/bookmarks.routes';
import chatRoutes from './routes/chat.routes';
import commentRoutes from './routes/comments.routes';
import knowledgeRoutes from './routes/knowledge.routes';
import postRoutes from './routes/posts.routes';
import questionRoutes from './routes/questions.routes';
import userRoutes from './routes/users.routes';

import { authenticate } from './middleware/auth';
import { errorHandler, notFound } from './middleware/errorHandler';
import { addComment, addCommentValidators } from './routes/comments.routes';

const app = express();

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);

// Nested: POST /api/posts/:id/comments
app.post('/api/posts/:id/comments', authenticate, addCommentValidators, addComment);

app.use('/api/comments', commentRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/knowledge', knowledgeRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/admin', adminRoutes);

// ─── Error Handling ───────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

export default app;
