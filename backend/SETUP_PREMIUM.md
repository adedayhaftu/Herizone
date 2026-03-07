# Premium Subscription Setup Guide

## ✅ What's Been Done

1. ✅ Database schema updated with premium subscription fields
2. ✅ Backend controllers enforce subscription limits
3. ✅ Frontend shows premium prompts and upgrade dialogs
4. ✅ New seed file created with test data (5+ records per collection)

## 🚀 Setup Steps

### Step 1: Generate Prisma Client
```bash
cd backend
npx prisma generate
```
This updates the Prisma client with the new subscription fields.

### Step 2: Run Database Migration
```bash
npx prisma migrate dev --name add_premium_subscription
```
This creates and applies the migration to your database.

### Step 3: Seed Database
```bash
npx ts-node scripts/seed-new.ts
```
This clears and repopulates your database with test data.

### Step 4: Restart Backend Server
```bash
npm run dev
```

## 📧 Test Accounts

### Admin
- **Email:** admin@herizone.com
- **Password:** Admin@Herizone2026!
- **Access:** Full admin + premium access

### Premium Users (Unlimited AI + Expert Questions)
- **Email:** premium1@example.com
- **Password:** Premium123!
- **Email:** premium2@example.com
- **Password:** Premium123!
- **Email:** premium3@example.com
- **Password:** Premium123!

### Freemium Users (10 AI questions/day, NO expert questions)
- **Email:** amara.osei@example.com
- **Password:** Password123!
- **Email:** fatima.diallo@example.com
- **Password:** Password123!
- **Email:** kezia.mwangi@example.com
- **Password:** Password123!
- **Email:** ngozi.eze@example.com
- **Password:** Password123!

### Experts
- **Email:** dr.adaeze.obi@example.com
- **Password:** Expert@Herizone2026!
- **Email:** dr.kwame.mensah@example.com
- **Password:** Expert@Herizone2026!
- **Email:** nurse.yetunde@example.com
- **Password:** Expert@Herizone2026!
- **Email:** dr.seun.akin@example.com
- **Password:** Expert@Herizone2026!
- **Email:** ntr.chinwe@example.com
- **Password:** Expert@Herizone2026!

## 🧪 Testing Premium Features

### Test Freemium Limits:
1. Log in as `amara.osei@example.com`
2. Open AI chatbot
3. Send 10 messages → should see "X questions remaining"
4. Try 11th message → should get premium upgrade prompt
5. Go to Experts page → "Ask a Question" button should prompt for premium
6. Booking experts should still work (available to all users)

### Test Premium Access:
1. Log in as `premium1@example.com`
2. Open AI chatbot → no limits shown
3. Send multiple messages → no restrictions
4. Go to Experts page → "Ask a Question" works without premium prompt
5. All features available

## 📊 What Was Seeded

- ✅ 1 admin
- ✅ 3 premium users
- ✅ 4 freemium users
- ✅ 5 expert users
- ✅ 5 articles (published)
- ✅ 5 community posts
- ✅ 5 comments
- ✅ 5 expert questions with answers
- ✅ 5 knowledge base entries

## 🔧 Quick Setup Script

Alternatively, run all steps at once:

```bash
cd backend
chmod +x setup-premium.sh
./setup-premium.sh
```

## ⚠️ Database Schema Changes

The following fields were added to the `users` table:

```prisma
isPremium             Boolean   @default(false)
aiQuestionsCount      Int       @default(0)
aiQuestionsLimit      Int       @default(10)
aiQuestionsResetAt    DateTime?
subscriptionExpiresAt DateTime?
```

## 🐛 Troubleshooting

### "Column does not exist" errors
Run: `npx prisma migrate dev --name add_premium_subscription`

### "Property isPremium does not exist on type User"
Run: `npx prisma generate`

### Premium features still not working
1. Ensure Prisma client was regenerated
2. Ensure migration was applied
3. Restart backend server
4. Check database with: `npx prisma studio`

## 📝 Business Logic Summary

### Freemium Users (isPremium = false)
- ✅ Browse articles and community posts
- ✅ View experts directory
- ✅ Book expert consultations (all users can book)
- ✅ 10 AI chatbot questions per day (resets daily)
- ❌ Cannot ask experts questions directly (premium only)

### Premium Users (isPremium = true)
- ✅ All freemium features
- ✅ Unlimited AI chatbot questions
- ✅ Ask expert questions directly
- ✅ Priority support (placeholder)
- ✅ Exclusive content (placeholder)

### Pricing
- **Freemium:** Free (10 AI questions/day)
- **Premium:** $9.99/month (placeholder - payment integration needed)
