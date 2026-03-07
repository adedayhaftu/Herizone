# 🚀 Quick Reference - Herizone Chatbot

## Essential Commands

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env          # Then edit with your keys
npx prisma migrate deploy     # Run migrations
npm run seed:knowledge        # Add sample data
npm run dev                   # Start server (port 4000)
```

### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev                   # Start (port 3000)
```

### Database Commands
```bash
# Enable pgvector
psql -d herizone -c "CREATE EXTENSION vector;"

# Open Prisma Studio
cd backend && npx prisma studio

# Reset database (careful!)
cd backend && npx prisma migrate reset
```

### Admin Tools
```bash
cd backend
npm run create:admin          # Create admin user
npm run seed:knowledge        # Seed knowledge base
```

## Environment Variables

### Backend `.env`
```env
DATABASE_URL="postgresql://user:pass@localhost:5432/herizone"
JWT_SECRET="your-secret-key-min-32-chars"
GEMINI_API_KEY="your-gemini-api-key"
FRONTEND_URL="http://localhost:3000"
PORT=4000
```

### Frontend `.env.local`
```env
NEXT_PUBLIC_API_URL="http://localhost:4000"
```

## API Quick Reference

### Chat Endpoints
```
POST   /api/chat                    # Send message
GET    /api/chat/history            # Get history
POST   /api/chat/:id/feedback       # Rate response
```

### Knowledge (Admin Only)
```
POST   /api/knowledge/learn-from-post/:id
POST   /api/knowledge/learn-from-answer/:id
PATCH  /api/knowledge/:id/verify
GET    /api/knowledge/stats
```

### Community
```
GET    /api/posts                   # List posts
POST   /api/posts                   # Create post
POST   /api/posts/:id/like          # Like post
POST   /api/posts/:id/comments      # Add comment
```

## Testing the Chatbot

1. Start both servers
2. Open http://localhost:3000
3. Click pink button (bottom-right)
4. Try these questions:
   - "How do I manage morning sickness?"
   - "When should I worry about my baby crying?"
   - "Tips for breastfeeding"

## Common Issues

| Problem | Solution |
|---------|----------|
| Port 4000 in use | Kill process: `lsof -ti:4000 \| xargs kill -9` |
| Port 3000 in use | Kill process: `lsof -ti:3000 \| xargs kill -9` |
| pgvector error | `psql -d herizone -c "CREATE EXTENSION vector;"` |
| Prisma errors | `cd backend && npx prisma generate` |
| No AI response | Check GEMINI_API_KEY in .env |
| CORS errors | Check FRONTEND_URL in backend .env |

## File Locations

### Backend
- **Main server**: `backend/src/server.ts`
- **Chat logic**: `backend/src/controllers/chat.controller.ts`
- **AI service**: `backend/src/services/ai.service.ts`
- **Knowledge**: `backend/src/services/knowledge.service.ts`
- **Schema**: `backend/prisma/schema.prisma`

### Frontend
- **Chatbot UI**: `frontend/components/chatbot-widget.tsx`
- **Store**: `frontend/lib/store.ts`
- **API client**: `frontend/lib/api.ts`
- **Main page**: `frontend/app/page.tsx`

## Key Features

✅ Semantic search with pgvector  
✅ 768-dim embeddings  
✅ Confidence scoring  
✅ Source attribution  
✅ Feedback system  
✅ Beautiful gradient UI (480×700px)  
✅ Dark mode support  
✅ Quick prompts  
✅ Admin panel  

## Customization

### Change Colors
Edit `frontend/components/chatbot-widget.tsx`:
- Find: `from-pink-500 via-rose-500 to-purple-600`
- Replace with your gradient

### Change Size
```tsx
// Line ~72
minimized ? 'h-16 w-96' : 'h-[700px] w-[480px]'
```

### Change Name
1. Backend: `backend/src/services/ai.service.ts` (systemPrompt)
2. Frontend: `frontend/lib/store.ts` (welcomeMessage)
3. Frontend: `frontend/components/chatbot-widget.tsx` (header)

### Add Quick Prompts
```tsx
// frontend/components/chatbot-widget.tsx
const QUICK_PROMPTS = [
  'Your question here',
  // ... add more
];
```

## Database Schema (Key Tables)

```sql
-- Knowledge base with vectors
knowledge_base (
  id uuid,
  question text,
  answer text,
  embedding vector(768),  -- ⭐ pgvector
  confidence_score int,
  is_verified boolean
)

-- Chat messages
chat_messages (
  id uuid,
  user_id uuid,
  message text,
  is_ai boolean,
  source_ids text[]       -- Knowledge entries used
)

-- Feedback
chat_feedback (
  message_id uuid,
  user_id uuid,
  is_helpful boolean
)
```

## Monitoring

### Check Logs
```bash
# Backend
cd backend && npm run dev

# Frontend  
cd frontend && npm run dev
```

### Database Stats
```sql
-- Count knowledge entries
SELECT COUNT(*) FROM knowledge_base;

-- Check embeddings
SELECT COUNT(*) FROM knowledge_base WHERE embedding IS NOT NULL;

-- View feedback
SELECT 
  is_helpful,
  COUNT(*) 
FROM chat_feedback 
GROUP BY is_helpful;
```

### API Health
```bash
curl http://localhost:4000/health
```

## Production Deployment

1. Set production DATABASE_URL
2. Set strong JWT_SECRET
3. Enable HTTPS
4. Set FRONTEND_URL to production domain
5. Run migrations: `npx prisma migrate deploy`
6. Build frontend: `npm run build`
7. Start with PM2 or similar

## Support

- **Documentation**: See README.md and SETUP.md
- **Improvements**: See IMPROVEMENTS.md
- **Issues**: Check backend/frontend console logs

## Quick Health Check

✅ Backend running on :4000  
✅ Frontend running on :3000  
✅ PostgreSQL with pgvector enabled  
✅ GEMINI_API_KEY set  
✅ Knowledge base seeded  
✅ Can open chatbot  
✅ AI responds to questions  

**Happy coding! 🌸**
