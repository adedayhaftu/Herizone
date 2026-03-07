#!/bin/bash

# Setup script for Herizone backend with pgvector support

echo "🚀 Setting up Herizone Backend with pgvector..."

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install PostgreSQL first."
    exit 1
fi

echo "✅ PostgreSQL found"

# Install dependencies
echo "📦 Installing npm dependencies..."
npm install

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Check if pgvector extension is available
echo "🔍 Checking pgvector extension..."

# Extract database connection details from .env
if [ ! -f .env ]; then
    echo "❌ .env file not found. Please create one with DATABASE_URL"
    exit 1
fi

source .env

echo "📊 Attempting to enable pgvector extension in database..."

# Try to enable pgvector
psql "$DATABASE_URL" -c "CREATE EXTENSION IF NOT EXISTS vector;" 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ pgvector extension enabled successfully"
else
    echo "⚠️  Could not enable pgvector automatically."
    echo "Please run this SQL command manually in your database:"
    echo "  CREATE EXTENSION IF NOT EXISTS vector;"
    echo ""
    echo "If you don't have pgvector installed, install it from:"
    echo "  https://github.com/pgvector/pgvector#installation"
fi

# Run migrations
echo "🔄 Running database migrations..."
npx prisma migrate deploy

if [ $? -eq 0 ]; then
    echo "✅ Migrations completed successfully"
else
    echo "⚠️  Migrations failed. You may need to run them manually:"
    echo "  npx prisma migrate deploy"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "To start the development server:"
echo "  npm run dev"
echo ""
echo "To create an admin user:"
echo "  npx ts-node scripts/create-admin.ts"
