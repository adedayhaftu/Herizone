import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from '../lib/prisma';

type KnowledgeEntry = {
  id: string;
  question: string;
  answer: string;
  confidenceScore: number;
  isVerified: boolean;
  timesReferenced: number;
  sourceType: string | null;
  sourceId: string | null;
};

// Client uses API key; use fully-qualified model ids to avoid v1beta lookup issues
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Supported model ids (fully qualified)
const EMBEDDING_MODEL_ID = 'text-embedding-004';
const CHAT_MODEL_ID = 'gemini-2.5-flash';

// Generate embedding for text using Gemini embedding model
export const generateEmbedding = async (text: string): Promise<number[]> => {
  try {
    const model = genAI.getGenerativeModel({ model: EMBEDDING_MODEL_ID });
    const result = await model.embedContent(text);
    return result.embedding.values;
  } catch (error) {
    console.error('Error generating embedding:', error);
    // Return zero vector as fallback
    return new Array(768).fill(0);
  }
};

// Search knowledge base using pgvector similarity search
export const searchKnowledgeBase = async (userMessage: string): Promise<KnowledgeEntry[]> => {
  try {
    // Generate embedding for user message
    const embedding = await generateEmbedding(userMessage);
    const embeddingStr = `[${embedding.join(',')}]`;

    // Use raw SQL for vector similarity search with pgvector
    const results = await prisma.$queryRawUnsafe<KnowledgeEntry[]>(`
      SELECT 
        id::text,
        question,
        answer,
        confidence_score as "confidenceScore",
        is_verified as "isVerified",
        times_referenced as "timesReferenced",
        source_type as "sourceType",
        source_id as "sourceId",
        1 - (embedding <=> $1::vector) as similarity
      FROM knowledge_base
      WHERE embedding IS NOT NULL
      ORDER BY embedding <=> $1::vector
      LIMIT 5
    `, embeddingStr);

    return results;
  } catch (error) {
    // If the embedding column/index is missing or pgvector not installed, fall back quietly
    console.error('Vector search error, falling back to keyword search:', error);
    // Fallback to keyword search if vector search fails
    return fallbackKeywordSearch(userMessage);
  }
};

// Fallback keyword-based search
const fallbackKeywordSearch = async (userMessage: string): Promise<KnowledgeEntry[]> => {
  const words = userMessage.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
  if (words.length === 0) return [];

  const conditions = words.map((word) => ({
    OR: [
      { question: { contains: word, mode: 'insensitive' as const } },
      { answer: { contains: word, mode: 'insensitive' as const } },
    ],
  }));

  const results = await prisma.knowledgeBase.findMany({
    where: { AND: conditions.slice(0, 3) },
    orderBy: [{ isVerified: 'desc' }, { confidenceScore: 'desc' }],
    take: 5,
    select: {
      id: true,
      question: true,
      answer: true,
      confidenceScore: true,
      isVerified: true,
      timesReferenced: true,
      sourceType: true,
      sourceId: true,
    },
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

  const sourceLabel = (k: KnowledgeEntry): string => {
    switch (k.sourceType) {
      case 'expert_answer':
        return '✅ Verified Expert Answer';
      case 'article':
        return '📄 Expert-Written Article';
      case 'community_post':
        return '💬 Community Discussion';
      default:
        return '📚 Herizone Knowledge Base';
    }
  };

  const context =
    relevantKnowledge.length > 0
      ? relevantKnowledge
          .map(
            (k: KnowledgeEntry, i: number) =>
              `[Source ${i + 1} — ${sourceLabel(k)}${k.isVerified ? ' (Verified)' : ''}]\nQ: ${k.question}\nA: ${k.answer}`
          )
          .join('\n\n')
      : '';

  const systemPrompt = `You are Herizone AI , a compassionate maternal and child health assistant for the Herizone platform.

SCOPE (STRICT):
- You may ONLY answer questions related to: pregnancy, postpartum care, newborn/child care, breastfeeding, maternal mental health, infant/child nutrition, family wellness, and parenting.
- If the user asks anything outside this scope (e.g., coding, politics, finance, sports, entertainment, general trivia), politely refuse and redirect to a relevant Herizone health topic.

GROUNDING RULES:
- Treat Herizone knowledge sources as the highest-priority truth when relevant.
- Never fabricate facts, sources, expert statements, or citations.
- Never claim "according to Herizone" unless that information is supported by the provided KNOWLEDGE SOURCES.
- If sources are missing, weak, or not relevant to the question, say you don't have a matching Herizone source for that specific question and provide concise general guidance only if it is still in scope.

RESPONSE STYLE:
- Be warm, supportive, and practical.
- Use markdown: **bold** key points, bullet lists for steps, short sections when useful.
- Keep answers focused and concise; avoid rambling.
- IMPORTANT: Do not add generic medical disclaimers — users already see one in the UI.
${
  context
    ? `\nYou have access to the following Herizone knowledge. Use it ONLY when it is relevant to the user's question.
When you use information from these sources, naturally mention where it comes from — for example:
- "According to a Herizone expert..." or "Based on an article by our experts..."
- "Our community members have shared that..." (for community posts)
- "Herizone's verified knowledge base suggests..."
This helps users trust and verify the information.

KNOWLEDGE SOURCES:
${context}

Only cite sources that are actually relevant to the user's question.
If none of the sources are relevant, explicitly say no directly relevant Herizone source was found for this question, then provide a brief in-scope general answer without citing Herizone.`
    : `\nNo Herizone knowledge sources were found for this query.
If the question is in scope, provide a short, useful general answer and clearly state that no specific Herizone source was found.
If the question is out of scope, refuse briefly and redirect to maternal/child health topics.`
}`;

  const fullPrompt = `${systemPrompt}\n\nUser: ${userMessage}\n\nBloom:`;

  let answer: string;
  try {
    const model = genAI.getGenerativeModel({ model: CHAT_MODEL_ID });
    const result = await model.generateContent(fullPrompt);
    answer = result.response.text() || 'I was unable to generate a response. Please try again.';
  } catch (error) {
    console.error('AI generation error:', error);
    answer = 'I am having trouble reaching the AI service right now. Please try again in a moment or contact support.';
  }

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
