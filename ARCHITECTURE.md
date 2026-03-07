# 🏗️ Herizone Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Next.js)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────────┐   │
│  │  Home Page   │  │ Community    │  │  Chatbot Widget     │   │
│  │              │  │ Feed         │  │  🌸 Bloom AI        │   │
│  └──────────────┘  └──────────────┘  └─────────────────────┘   │
│                          │                      │                │
│                          ├──────────────────────┤                │
│                          │   Zustand Store      │                │
│                          └──────────┬───────────┘                │
│                                     │                            │
└─────────────────────────────────────┼────────────────────────────┘
                                      │ HTTP/REST
                                      │
┌─────────────────────────────────────┼────────────────────────────┐
│                      BACKEND (Express + TypeScript)               │
│                                     │                            │
│  ┌──────────────────────────────────┴─────────────────────────┐ │
│  │                      API Routes                              │ │
│  │  /api/chat  /api/posts  /api/articles  /api/knowledge      │ │
│  └──────────────────────────┬───────────────────────────────────┘ │
│                             │                                     │
│  ┌──────────────────────────┴───────────────────────────────┐   │
│  │                      Controllers                          │   │
│  │  chat.controller  knowledge.controller  posts.controller │   │
│  └──────────────────────────┬───────────────────────────────┘   │
│                             │                                     │
│  ┌──────────────────────────┴───────────────────────────────┐   │
│  │                        Services                           │   │
│  │  ┌─────────────────┐     ┌──────────────────────────┐    │   │
│  │  │  ai.service.ts  │────▶│  Google Gemini API       │    │   │
│  │  │                 │     │  - Embeddings (768-dim)  │    │   │
│  │  │ • generateEmb() │     │  - Chat responses        │    │   │
│  │  │ • searchKB()    │     │  - Knowledge extraction  │    │   │
│  │  │ • chatWithAI()  │     └──────────────────────────┘    │   │
│  │  └────────┬────────┘                                      │   │
│  │           │                                                │   │
│  │  ┌────────┴────────────────────────────────────────────┐  │   │
│  │  │  knowledge.service.ts                               │  │   │
│  │  │  • learnFromPost()                                  │  │   │
│  │  │  • learnFromAnswer()                                │  │   │
│  │  │  • learnFromArticle()                               │  │   │
│  │  └─────────────────────────────────────────────────────┘  │   │
│  └────────────────────────────┬───────────────────────────────┘   │
│                               │                                   │
│  ┌────────────────────────────┴───────────────────────────────┐  │
│  │                      Prisma ORM                             │  │
│  └────────────────────────────┬───────────────────────────────┘  │
│                               │                                   │
└───────────────────────────────┼───────────────────────────────────┘
                                │ PostgreSQL Protocol
                                │
┌───────────────────────────────┼───────────────────────────────────┐
│                 DATABASE (PostgreSQL + pgvector)                  │
│                               │                                   │
│  ┌────────────────────────────┴───────────────────────────────┐  │
│  │  📊 Tables                                                  │  │
│  │  ┌────────────────────┐  ┌────────────────────┐            │  │
│  │  │  knowledge_base    │  │  chat_messages     │            │  │
│  │  │  ================  │  │  ================  │            │  │
│  │  │  id               │  │  id               │            │  │
│  │  │  question         │  │  user_id          │            │  │
│  │  │  answer           │  │  message          │            │  │
│  │  │  embedding ⚡     │  │  is_ai            │            │  │
│  │  │    (vector(768))  │  │  source_ids[]     │            │  │
│  │  │  confidence_score │  │  created_at       │            │  │
│  │  │  is_verified      │  └────────────────────┘            │  │
│  │  └────────────────────┘                                    │  │
│  │                                                             │  │
│  │  ┌────────────────────┐  ┌────────────────────┐            │  │
│  │  │  chat_feedback     │  │  users, posts,     │            │  │
│  │  │  ================  │  │  articles, etc...  │            │  │
│  │  │  message_id       │  └────────────────────┘            │  │
│  │  │  user_id          │                                     │  │
│  │  │  is_helpful       │                                     │  │
│  │  └────────────────────┘                                    │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                   │
│  🔍 Vector Index: IVFFlat on knowledge_base.embedding            │
│     Distance: Cosine Similarity (<=>)                            │
│     Lists: 100                                                   │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

## 🔄 Chat Flow

```
┌──────────────┐
│  User Types  │
│  Question    │
└──────┬───────┘
       │
       ▼
┌─────────────────────────────────┐
│  Frontend: chatbot-widget.tsx   │
│  • Validate input               │
│  • Show loading state           │
└─────────────┬───────────────────┘
              │ POST /api/chat
              │ { message: "..." }
              ▼
┌─────────────────────────────────┐
│  Backend: chat.controller.ts    │
│  • Save user message to DB      │
│  • Call chatWithAI()            │
└─────────────┬───────────────────┘
              │
              ▼
┌─────────────────────────────────┐
│  AI Service: ai.service.ts      │
│  Step 1: Generate Embedding     │
│  ┌──────────────────────────┐   │
│  │ User question            │   │
│  │       ↓                  │   │
│  │ Gemini text-embedding    │   │
│  │       ↓                  │   │
│  │ [0.123, -0.456, ...]    │   │
│  │   (768 dimensions)       │   │
│  └──────────────────────────┘   │
└─────────────┬───────────────────┘
              │
              ▼
┌─────────────────────────────────┐
│  Step 2: Semantic Search        │
│  ┌──────────────────────────┐   │
│  │ SELECT *                 │   │
│  │ FROM knowledge_base      │   │
│  │ ORDER BY embedding <=>   │   │
│  │   [user_embedding]       │   │
│  │ LIMIT 5                  │   │
│  └──────────────────────────┘   │
│  Returns: Top 5 similar Q&As    │
└─────────────┬───────────────────┘
              │
              ▼
┌─────────────────────────────────┐
│  Step 3: Build Context          │
│  ┌──────────────────────────┐   │
│  │ Q: How manage nausea?    │   │
│  │ A: Try ginger tea...     │   │
│  │ Confidence: 9/10 ✓       │   │
│  │                          │   │
│  │ Q: When worry crying?    │   │
│  │ A: If fever over 100.4.. │   │
│  │ Confidence: 10/10 ✓      │   │
│  │ ...                      │   │
│  └──────────────────────────┘   │
└─────────────┬───────────────────┘
              │
              ▼
┌─────────────────────────────────┐
│  Step 4: Generate Response      │
│  ┌──────────────────────────┐   │
│  │ System: You are Bloom... │   │
│  │ Context: [Knowledge]     │   │
│  │ User: [Question]         │   │
│  │       ↓                  │   │
│  │ Gemini 2.0 Flash        │   │
│  │       ↓                  │   │
│  │ AI Answer                │   │
│  └──────────────────────────┘   │
│                                 │
│  Calculate Confidence:          │
│  • Base: 60%                    │
│  • + (avg_score × 3)            │
│  • + 15% if verified            │
│  • = 60-99%                     │
└─────────────┬───────────────────┘
              │
              ▼
┌─────────────────────────────────┐
│  Step 5: Save & Return          │
│  • Save AI message to DB        │
│  • Link source_ids              │
│  • Increment reference counts   │
│  • Return response to frontend  │
└─────────────┬───────────────────┘
              │ { message: {...} }
              ▼
┌─────────────────────────────────┐
│  Frontend: Display Response     │
│  • Show AI message              │
│  • Display confidence bar       │
│  • Show source count            │
│  • Enable feedback buttons      │
└─────────────┬───────────────────┘
              │
              ▼
┌─────────────────────────────────┐
│  User Feedback (Optional)       │
│  • Thumbs up/down               │
│  • Adjust knowledge scores      │
│  • Improve future answers       │
└─────────────────────────────────┘
```

## 📚 Knowledge Learning Flow

```
┌─────────────────────┐
│  Content Source     │
│  • Post (20+ likes) │
│  • Expert Answer    │
│  • Published Article│
└──────────┬──────────┘
           │
           ▼
┌────────────────────────────────┐
│  Admin Triggers Learning       │
│  POST /api/knowledge/learn-..  │
└────────────┬───────────────────┘
             │
             ▼
┌────────────────────────────────┐
│  Extract Q&A with Gemini       │
│  Input: Content                │
│  Output: {question, answer}    │
└────────────┬───────────────────┘
             │
             ▼
┌────────────────────────────────┐
│  Generate Embedding            │
│  Combined: question + answer   │
│  → 768-dim vector              │
└────────────┬───────────────────┘
             │
             ▼
┌────────────────────────────────┐
│  Store in Database             │
│  INSERT knowledge_base         │
│  • question                    │
│  • answer                      │
│  • embedding (vector)          │
│  • confidence_score            │
│  • is_verified                 │
└────────────┬───────────────────┘
             │
             ▼
┌────────────────────────────────┐
│  Available for Search          │
│  Vector indexed, ready to use  │
└────────────────────────────────┘
```

## 🎨 UI Component Structure

```
ChatbotWidget
├── Floating Button (when closed)
│   └── Pulsing gradient circle with heart
│
└── Chat Window (when open)
    ├── Header (gradient pink/rose/purple)
    │   ├── Avatar with pulse animation
    │   ├── "Bloom AI" title + status
    │   └── Controls (minimize, close)
    │
    ├── Disclaimer Banner
    │   └── Medical advice notice
    │
    ├── Messages Container (scrollable)
    │   ├── Welcome Message
    │   │
    │   ├── User Messages (right aligned)
    │   │   └── Purple gradient bubble
    │   │
    │   └── AI Messages (left aligned)
    │       ├── Avatar
    │       ├── Message bubble (white/pink gradient)
    │       └── Metadata
    │           ├── Confidence bar (3 dots)
    │           ├── Source count
    │           └── Feedback buttons
    │
    ├── Quick Prompts (if first message)
    │   └── 2×3 grid of suggested questions
    │
    └── Input Area
        ├── Textarea (expandable)
        └── Send button (gradient)
```

## 🔐 Security Flow

```
┌─────────────────┐
│  User Request   │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│  JWT in Authorization   │
│  Header                 │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Middleware: auth.ts    │
│  • Verify JWT           │
│  • Extract user ID      │
│  • Attach to req.user   │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Controller             │
│  • Access req.user.id   │
│  • Execute logic        │
└─────────────────────────┘
```

## 📊 Data Flow Summary

1. **User Input** → Frontend Widget
2. **HTTP Request** → Backend API
3. **Embedding Generation** → Gemini API
4. **Vector Search** → PostgreSQL + pgvector
5. **Context Building** → AI Service
6. **AI Response** → Gemini API
7. **Save & Return** → Database + Frontend
8. **User Feedback** → Update Scores

**Key Technologies:**
- 🎨 Frontend: Next.js + Zustand + Tailwind
- ⚙️ Backend: Express + TypeScript + Prisma
- 🧠 AI: Google Gemini (embeddings + chat)
- 💾 Database: PostgreSQL + pgvector
- 🔍 Search: Cosine similarity on 768-dim vectors
