import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from '../lib/prisma';

type KnowledgeEntry = {
  id: string;
  question: string;
  answer: string;
  confidenceScore: number;
  isVerified: boolean;
  timesReferenced: number;
};

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Search knowledge base using simple keyword matching
// In production you'd use pgvector or similar embeddings
export const searchKnowledgeBase = async (userMessage: string) => {
  const words = userMessage.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
  if (words.length === 0) return [];

  const conditions = words.map((word) => ({
    OR: [
      { question: { contains: word, mode: 'insensitive' as const } },
      { answer: { contains: word, mode: 'insensitive' as const } },
    ],
  }));

  const results = await prisma.knowledgeBase.findMany({
    where: { AND: conditions.slice(0, 3) }, // limit to top 3 conditions to avoid too-strict matching
    orderBy: [{ isVerified: 'desc' }, { confidenceScore: 'desc' }],
    take: 5,
  });

  return results as KnowledgeEntry[];
};

export const calculateConfidence = (knowledge: { confidenceScore: number; isVerified: boolean }[]) => {
  if (knowledge.length === 0) return 60; // base confidence
  const avgScore = knowledge.reduce((sum, k) => sum + k.confidenceScore, 0) / knowledge.length;
  const verifiedBonus = knowledge.some((k) => k.isVerified) ? 15 : 0;
  return Math.min(99, Math.round(40 + avgScore * 3 + verifiedBonus));
};

export const chatWithAI = async (
  userMessage: string,
  userId: string
): Promise<{
  answer: string;
  confidence: number;
  sourceCount: number;
  sourceIds: string[];
}> => {
  const relevantKnowledge = await searchKnowledgeBase(userMessage);

  const context =
    relevantKnowledge.length > 0
      ? relevantKnowledge
          .map(
            (k: KnowledgeEntry) =>
              `Q: ${k.question}\nA: ${k.answer}\nConfidence: ${k.confidenceScore}/10${k.isVerified ? ' ✓ Verified' : ''}`
          )
          .join('\n\n')
      : '';

  const systemPrompt = `You are Heri, a compassionate AI assistant for mothers and pregnant women on the Herizone platform. 
You provide helpful, empathetic support on topics like pregnancy, parenting, newborn care, breastfeeding, mental health, and nutrition.
Always include a disclaimer that your responses are not a substitute for professional medical advice.
Be warm, supportive, and concise.
${context ? `\nUse this verified knowledge from our platform experts when relevant:\n${context}` : ''}`;

  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const fullPrompt = `${systemPrompt}\n\nUser: ${userMessage}\n\nHeri:`;

  const result = await model.generateContent(fullPrompt);
  const answer = result.response.text() || 'I was unable to generate a response. Please try again.';
  const confidence = calculateConfidence(relevantKnowledge);
  const sourceIds = relevantKnowledge.map((k: KnowledgeEntry) => k.id);

  // Increment timesReferenced for used knowledge entries
  if (sourceIds.length > 0) {
    await prisma.knowledgeBase.updateMany({
      where: { id: { in: sourceIds } },
      data: { timesReferenced: { increment: 1 } },
    });
  }

  return { answer, confidence, sourceCount: relevantKnowledge.length, sourceIds };
};
