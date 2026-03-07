import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from '../lib/prisma';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Extract Q&A pairs from a post/answer using GPT
const extractKnowledge = async (
  question: string,
  answer: string
): Promise<{ question: string; answer: string } | null> => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `You are a knowledge extraction assistant. Extract a clear question-answer pair from the content below.
Return ONLY valid JSON with exactly two keys: "question" and "answer". Keep answers concise but complete.

Source question: ${question}
Source answer/content: ${answer}`;

    const result = await model.generateContent(prompt);
    const raw = result.response.text().trim();

    // Strip markdown code fences if Gemini wraps the JSON
    const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
    return JSON.parse(cleaned) as { question: string; answer: string };
  } catch {
    return null;
  }
};

// Learn from a community post (high-engagement: 20+ likes)
export const learnFromPost = async (postId: string): Promise<boolean> => {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: { comments: { take: 5, orderBy: { createdAt: 'asc' } } },
  });

  if (!post || post.likeCount < 20) return false;

  // Use first comment as an "answer" if available
  const topComment = post.comments[0];
  if (!topComment) return false;

  const extracted = await extractKnowledge(post.content, topComment.content);
  if (!extracted) return false;

  const existing = await prisma.knowledgeBase.findFirst({
    where: {
      sourceType: 'community_post',
      sourceId: postId,
    },
  });

  if (existing) {
    await prisma.knowledgeBase.update({
      where: { id: existing.id },
      data: {
        question: extracted.question,
        answer: extracted.answer,
        confidenceScore: { increment: 1 },
      },
    });
  } else {
    await prisma.knowledgeBase.create({
      data: {
        question: extracted.question,
        answer: extracted.answer,
        sourceType: 'community_post',
        sourceId: postId,
        confidenceScore: 3,
        isVerified: false,
      },
    });
  }

  return true;
};

// Learn from an expert answer
export const learnFromAnswer = async (answerId: string): Promise<boolean> => {
  const answer = await prisma.answer.findUnique({
    where: { id: answerId },
    include: { question: true, expert: { select: { name: true } } },
  });

  if (!answer) return false;

  const extracted = await extractKnowledge(answer.question.question, answer.answer);
  if (!extracted) return false;

  const existing = await prisma.knowledgeBase.findFirst({
    where: { sourceType: 'expert_answer', sourceId: answerId },
  });

  if (existing) {
    await prisma.knowledgeBase.update({
      where: { id: existing.id },
      data: {
        question: extracted.question,
        answer: extracted.answer,
        confidenceScore: { increment: 2 },
      },
    });
  } else {
    await prisma.knowledgeBase.create({
      data: {
        question: extracted.question,
        answer: extracted.answer,
        sourceType: 'expert_answer',
        sourceId: answerId,
        confidenceScore: 10, // High confidence for expert answers
        isVerified: true,
      },
    });
  }

  return true;
};

// Learn from an article
export const learnFromArticle = async (articleId: string): Promise<boolean> => {
  const article = await prisma.article.findUnique({ where: { id: articleId } });
  if (!article) return false;

  const extracted = await extractKnowledge(article.title, article.content.substring(0, 1000));
  if (!extracted) return false;

  const existing = await prisma.knowledgeBase.findFirst({
    where: { sourceType: 'article', sourceId: articleId },
  });

  if (existing) {
    await prisma.knowledgeBase.update({
      where: { id: existing.id },
      data: { question: extracted.question, answer: extracted.answer },
    });
  } else {
    await prisma.knowledgeBase.create({
      data: {
        question: extracted.question,
        answer: extracted.answer,
        sourceType: 'article',
        sourceId: articleId,
        confidenceScore: 7,
        isVerified: true,
      },
    });
  }

  return true;
};
