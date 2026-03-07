# 🌸 Herizone - AI-Powered Maternal Health Platform

A comprehensive maternal health platform featuring an AI chatbot powered by semantic search, community support, expert consultations, and educational resources.

## ✨ Key Features

### 🤖 AI Chatbot (Bloom)
- **Semantic Search**: Uses pgvector and embeddings for intelligent question matching
- **Knowledge Base**: Learns from verified expert answers, community posts, and articles
- **Confidence Scoring**: Shows reliability of answers with source counts
- **User Feedback**: Thumbs up/down to improve answer quality
- **Beautiful UI**: Large, responsive, theme-aware design with gradient accents

### 👥 Community Features
- Anonymous posting option
- Categories: Pregnancy, Parenting, Health, General
- Like and comment system
- Content moderation

### 📚 Educational Content
- Expert-written articles
- Article approval workflow
- Bookmarking system
- Categories: Pregnancy, Parenting, Health, Nutrition

### 👩‍⚕️ Expert Consultations
- Expert application system with admin approval
- Question & answer platform
- Expert profiles with specialties and pricing
- Topics: Medical, Mental Health, Nutrition, Parenting

## 🚀 Quick Start

### Prerequisites
- **Node.js** v18+
- **PostgreSQL** with **pgvector** extension
- **Google Gemini API Key** (for AI features)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd Herizone
   ```

2. **Setup Backend:**
   ```bash
   cd backend
   npm install
   
   # Create .env file
   cp .env.example .env
   # Edit .env with your credentials
   
   # Install pgvector (see backend/SETUP.md for details)
   # Then run setup
   chmod +x scripts/setup.sh
   ./scripts/setup.sh
   ```

3. **Setup Frontend:**
   ```bash
   cd ../frontend
   npm install
   # or use pnpm
   pnpm install
   ```

4. **Start Development Servers:**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev
   
   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

5. **Open your browser:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:4000

## 🎨 Chatbot UI Features

The chatbot widget includes:
- **Large, prominent design** (480px × 700px)
- **Gradient theme** (pink/rose/purple) matching maternal health branding
- **Confidence indicators** with visual bars
- **Source count display** showing knowledge base references
- **Feedback system** with thumbs up/down
- **Quick prompts** for common questions
- **Smooth animations** and transitions
- **Dark mode support**
- **Minimizable interface**

## 🔧 Technology Stack

### Backend
- **Node.js** + **Express**
- **TypeScript**
- **Prisma ORM**
- **PostgreSQL** with **pgvector**
- **Google Gemini AI** (embeddings + chat)
- **JWT Authentication**
- **bcryptjs** for password hashing

### Frontend
- **Next.js 14** (App Router)
- **TypeScript**
- **Zustand** for state management
- **Tailwind CSS**
- **shadcn/ui** components
- **Lucide React** icons

## 📊 Database Schema

Key models:
- **Users** - Authentication and profiles
- **Posts** - Community discussions
- **Articles** - Educational content
- **Questions/Answers** - Expert consultations
- **ChatMessage** - AI chat history
- **KnowledgeBase** - AI knowledge with vector embeddings
- **ChatFeedback** - User feedback for AI responses

## 🧠 How the AI Works

1. **User asks a question** → Frontend sends to backend API
2. **Generate embedding** → Question converted to 768-dim vector using Gemini
3. **Semantic search** → pgvector finds similar knowledge entries using cosine similarity
4. **Context building** → Top 5 relevant Q&A pairs added to prompt
5. **AI response** → Gemini generates answer using context + conversation history
6. **Feedback loop** → User feedback adjusts confidence scores

### Knowledge Learning

Admins can train the AI from:
- **Community posts** (20+ likes + comments)
- **Expert answers** (verified knowledge)
- **Published articles** (educational content)

Each entry gets an embedding vector for semantic search.

## 🔐 Environment Variables

### Backend (.env)
```env
DATABASE_URL="postgresql://user:password@localhost:5432/herizone"
JWT_SECRET="your-super-secret-jwt-key"
GEMINI_API_KEY="your-google-gemini-api-key"
FRONTEND_URL="http://localhost:3000"
PORT=4000
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL="http://localhost:4000"
```

## 📝 API Endpoints

### Chat
- `POST /api/chat` - Send message
- `GET /api/chat/history` - Get history
- `POST /api/chat/:id/feedback` - Submit feedback

### Knowledge (Admin)
- `POST /api/knowledge/learn-from-post/:id`
- `POST /api/knowledge/learn-from-answer/:id`
- `PATCH /api/knowledge/:id/verify`
- `GET /api/knowledge/stats`

### Community
- `GET /api/posts` - List posts
- `POST /api/posts` - Create post
- `POST /api/posts/:id/like` - Like post
- `POST /api/posts/:id/comments` - Add comment

### Articles
- `GET /api/articles` - List articles
- `POST /api/articles` - Create article (experts)
- `GET /api/articles/pending` - Pending approval (admin)
- `PATCH /api/articles/:id/publish` - Publish (admin)

### Expert Q&A
- `GET /api/questions` - List questions
- `POST /api/questions` - Ask question
- `POST /api/questions/:id/answers` - Answer (experts)

### Expert Applications
- `POST /api/expert-applications` - Apply as expert
- `GET /api/expert-applications/me` - My application
- `PATCH /api/expert-applications/:id/approve` - Approve (admin)

## 🎯 Testing the Chatbot

1. Start both servers (backend + frontend)
2. Click the **pink chatbot button** (bottom-right)
3. Try these questions:
   - "How do I manage morning sickness?"
   - "When should I worry about my baby's crying?"
   - "Tips for breastfeeding difficulties"
   - "Signs of postpartum depression"

4. Check the response shows:
   - ✅ Confidence percentage
   - ✅ Source count (if knowledge base has data)
   - ✅ Thumbs up/down feedback buttons

## 🛠️ Development

### Adding Knowledge to AI

1. **Create admin user:**
   ```bash
   cd backend
   npx ts-node scripts/create-admin.ts
   ```

2. **Log in as admin** on the frontend

3. **Learn from content:**
   - Find high-quality posts/answers
   - Use admin panel to add to knowledge base
   - AI automatically generates embeddings

### Customizing the Chatbot

Edit `frontend/components/chatbot-widget.tsx`:
- Colors: Change gradient classes (pink/rose/purple)
- Size: Adjust `h-[700px] w-[480px]`
- Quick prompts: Modify `QUICK_PROMPTS` array
- Welcome message: Edit in `frontend/lib/store.ts`

## 🐛 Troubleshooting

### Chatbot not responding
- Check backend is running on port 4000
- Verify GEMINI_API_KEY in backend .env
- Check browser console for errors

### pgvector errors
- Make sure pgvector extension is installed
- Run: `psql -d herizone -c "CREATE EXTENSION vector;"`
- See `backend/SETUP.md` for installation guide

### Embedding errors
- System falls back to keyword search automatically
- Check Gemini API key and quota
- Verify internet connection

## 📈 Future Enhancements

- [ ] Voice input for chatbot
- [ ] Multi-language support
- [ ] Image analysis for baby/pregnancy photos
- [ ] Appointment scheduling with experts
- [ ] Push notifications
- [ ] Mobile app (React Native)
- [ ] Video consultations
- [ ] Personalized content recommendations

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - See LICENSE file for details

## 🙏 Acknowledgments

- **pgvector** - PostgreSQL extension for vector similarity search
- **Google Gemini** - AI models for embeddings and chat
- **shadcn/ui** - Beautiful UI components
- **Next.js** - React framework

---

Built with ❤️ for mothers and families everywhere 🌸
