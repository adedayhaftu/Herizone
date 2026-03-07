import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from '../lib/prisma';
import { generateEmbedding } from './ai.service';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const EXTRACTION_MODEL_ID = 'gemini-2.5-flash';

// Extract Q&A pairs from a post/answer using GPT
const extractKnowledge = async (
  question: string,
  answer: string
): Promise<{ question: string; answer: string } | null> => {
  try {
  const model = genAI.getGenerativeModel({ model: EXTRACTION_MODEL_ID });

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

  // Generate embedding for the combined Q&A
  const combinedText = `${extracted.question} ${extracted.answer}`;
  const embedding = await generateEmbedding(combinedText);
  const embeddingStr = `[${embedding.join(',')}]`;

  const existing = await prisma.knowledgeBase.findFirst({
    where: {
      sourceType: 'community_post',
      sourceId: postId,
    },
  });

  if (existing) {
    await prisma.$executeRawUnsafe(`
      UPDATE knowledge_base
      SET question = $1, answer = $2, confidence_score = confidence_score + 1, embedding = $3::vector
      WHERE id = $4
    `, extracted.question, extracted.answer, embeddingStr, existing.id);
  } else {
    await prisma.$executeRawUnsafe(`
      INSERT INTO knowledge_base (id, question, answer, source_type, source_id, confidence_score, is_verified, embedding)
      VALUES (gen_random_uuid(), $1, $2, 'community_post', $3, 3, false, $4::vector)
    `, extracted.question, extracted.answer, postId, embeddingStr);
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

  // Generate embedding
  const combinedText = `${extracted.question} ${extracted.answer}`;
  const embedding = await generateEmbedding(combinedText);
  const embeddingStr = `[${embedding.join(',')}]`;

  const existing = await prisma.knowledgeBase.findFirst({
    where: { sourceType: 'expert_answer', sourceId: answerId },
  });

  if (existing) {
    await prisma.$executeRawUnsafe(`
      UPDATE knowledge_base
      SET question = $1, answer = $2, confidence_score = confidence_score + 2, embedding = $3::vector
      WHERE id = $4
    `, extracted.question, extracted.answer, embeddingStr, existing.id);
  } else {
    await prisma.$executeRawUnsafe(`
      INSERT INTO knowledge_base (id, question, answer, source_type, source_id, confidence_score, is_verified, embedding)
      VALUES (gen_random_uuid(), $1, $2, 'expert_answer', $3, 10, true, $4::vector)
    `, extracted.question, extracted.answer, answerId, embeddingStr);
  }

  return true;
};

// Learn from an article
export const learnFromArticle = async (articleId: string): Promise<boolean> => {
  const article = await prisma.article.findUnique({ where: { id: articleId } });
  if (!article) return false;

  const extracted = await extractKnowledge(article.title, article.content.substring(0, 1000));
  if (!extracted) return false;

  // Generate embedding
  const combinedText = `${extracted.question} ${extracted.answer}`;
  const embedding = await generateEmbedding(combinedText);
  const embeddingStr = `[${embedding.join(',')}]`;

  const existing = await prisma.knowledgeBase.findFirst({
    where: { sourceType: 'article', sourceId: articleId },
  });

  if (existing) {
    await prisma.$executeRawUnsafe(`
      UPDATE knowledge_base
      SET question = $1, answer = $2, embedding = $3::vector
      WHERE id = $4
    `, extracted.question, extracted.answer, embeddingStr, existing.id);
  } else {
    await prisma.$executeRawUnsafe(`
      INSERT INTO knowledge_base (id, question, answer, source_type, source_id, confidence_score, is_verified, embedding)
      VALUES (gen_random_uuid(), $1, $2, 'article', $3, 7, true, $4::vector)
    `, extracted.question, extracted.answer, articleId, embeddingStr);
  }

  return true;
};
