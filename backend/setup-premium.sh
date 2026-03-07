#!/bin/bash

echo "🚀 Setting up premium subscription system..."
echo ""

echo "Step 1/4: Generating Prisma client..."
npx prisma generate

if [ $? -ne 0 ]; then
  echo "❌ Prisma generation failed"
  exit 1
fi

echo ""
echo "Step 2/4: Running database migrations..."
npx prisma migrate dev --name add_premium_subscription

if [ $? -ne 0 ]; then
  echo "❌ Migration failed"
  exit 1
fi

echo ""
echo "Step 3/4: Seeding database with test data..."
npx ts-node scripts/seed-new.ts

if [ $? -ne 0 ]; then
  echo "❌ Seeding failed"
  exit 1
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next step: Restart your backend server with 'npm run dev'"
echo ""
echo "🧪 Test accounts created:"
echo ""
echo "Premium (unlimited):"
echo "  • premium1@example.com / Premium123!"
echo ""
echo "Freemium (10 AI questions/day, no expert questions):"
echo "  • amara.osei@example.com / Password123!"
echo ""
echo "Read SETUP_PREMIUM.md for full testing instructions!"
