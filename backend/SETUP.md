# Herizone Backend - Setup Guide

## Prerequisites

1. **PostgreSQL** with **pgvector** extension
2. **Node.js** (v18 or higher)
3. **npm** or **yarn**

## Installing pgvector

### Ubuntu/Debian
```bash
sudo apt install postgresql-server-dev-all
cd /tmp
git clone --branch v0.5.1 https://github.com/pgvector/pgvector.git
cd pgvector
make
sudo make install
```

### macOS (Homebrew)
```bash
brew install pgvector
```

### Docker
Use the official pgvector Docker image:
```bash
docker run -d --name postgres-pgvector \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  pgvector/pgvector:pg16
```

## Setup Instructions

1. **Clone and install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Configure environment variables:**
   Create a `.env` file in the backend directory:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/herizone"
   JWT_SECRET="your-super-secret-jwt-key-change-this"
   GEMINI_API_KEY="your-google-gemini-api-key"
   FRONTEND_URL="http://localhost:3000"
   PORT=4000
   ```

3. **Enable pgvector in your database:**
   ```bash
   psql -U your_user -d herizone -c "CREATE EXTENSION IF NOT EXISTS vector;"
   ```

4. **Run setup script:**
   ```bash
   chmod +x scripts/setup.sh
   ./scripts/setup.sh
   ```

   Or manually:
   ```bash
   npx prisma generate
   npx prisma migrate deploy
   ```

5. **Create an admin user (optional):**
   ```bash
   npx ts-node scripts/create-admin.ts
   ```

6. **Start the development server:**
   ```bash
   npm run dev
   ```

## Features

### AI-Powered Chatbot with Semantic Search
- **pgvector integration** for semantic similarity search
- **Google Gemini** for generating embeddings and responses
- **Knowledge base learning** from community posts, expert answers, and articles

### API Endpoints

#### Chat
- `POST /api/chat` - Send a message to the AI
- `GET /api/chat/history` - Get chat history
- `POST /api/chat/:id/feedback` - Submit feedback (helpful/not helpful)

#### Knowledge Management (Admin only)
- `POST /api/knowledge/learn-from-post/:id` - Learn from high-engagement post
- `POST /api/knowledge/learn-from-answer/:id` - Learn from expert answer
- `PATCH /api/knowledge/:id/verify` - Verify knowledge entry
- `GET /api/knowledge/stats` - Get knowledge base statistics

## How It Works

1. **Semantic Search**: When users ask questions, the system:
   - Generates an embedding vector (768 dimensions) for the question using Gemini
   - Performs cosine similarity search in pgvector to find relevant knowledge
   - Returns top 5 most similar entries from the knowledge base

2. **Learning**: Admins can add knowledge from:
   - Community posts with 20+ likes and comments
   - Expert answers to user questions
   - Published articles

3. **Feedback Loop**: User feedback adjusts confidence scores in the knowledge base

## Troubleshooting

### pgvector not found
If you get "extension 'vector' does not exist":
1. Make sure pgvector is installed (see installation instructions above)
2. Run: `CREATE EXTENSION vector;` in your PostgreSQL database
3. Verify with: `SELECT * FROM pg_extension WHERE extname = 'vector';`

### Migration errors
If migrations fail:
```bash
npx prisma migrate reset
npx prisma migrate deploy
```

### Embedding errors
If embedding generation fails:
- Check your `GEMINI_API_KEY` is valid
- The system will fall back to keyword search automatically

## Testing the Chatbot

1. Start the backend: `npm run dev`
2. Start the frontend: `cd ../frontend && npm run dev`
3. Open http://localhost:3000
4. Click the pink chatbot button in the bottom-right corner
5. Ask questions about pregnancy, parenting, or health!

## Performance Tips

For production:
- Increase the `lists` parameter in the vector index for larger datasets
- Consider using HNSW index instead of IVFFlat for better performance
- Add caching for frequently asked questions
