# Premium Subscription Setup Guide

## Current Status
✅ All code changes are complete for the premium subscription feature!

## What You Need to Do

### 1. Generate Prisma Client (Required)
The TypeScript errors you're seeing are because Prisma Client hasn't been regenerated with the new schema fields.

```bash
cd backend
npx prisma generate
```

### 2. Run Database Migration (Required)
Apply the schema changes to your database:

```bash
cd backend
npx prisma migrate dev --name add_premium_subscription
```

If the database is not reachable, you can run this later when it's available.

### 3. Restart Backend Server
After running `prisma generate`, restart your backend server:

```bash
cd backend
npm run dev
```

### 4. Test the Features

#### Test AI Chat Limits (Freemium):
1. Create a new account (or use an existing non-premium account)
2. Open the Bloom chatbot widget
3. Ask questions - you should see "X questions remaining today" indicator
4. After 10 questions, you should see:
   - Error message: "You have reached your daily limit"
   - Premium upgrade dialog appears automatically
   - Crown icon on "Upgrade" button

#### Test Ask Expert Feature (Premium-Only):
1. As a non-premium user, go to the Experts page
2. Click "Ask a Question" button
3. You should see:
   - Premium upgrade dialog appears
   - Dialog explains "Ask Real Experts" is premium-only
   - Shows $9.99/month pricing

#### Test Premium User (Full Access):
To test premium features, manually update a user in the database:

```sql
UPDATE users 
SET is_premium = true 
WHERE email = 'your-email@example.com';
```

Then verify:
- ✅ No question limits shown in chatbot
- ✅ Unlimited AI chat access
- ✅ Can ask expert questions without restrictions

## New Database Fields

Added to `users` table:
- `is_premium` (boolean, default: false)
- `ai_questions_count` (integer, default: 0)
- `ai_questions_limit` (integer, default: 10)
- `ai_questions_reset_at` (timestamp, nullable)
- `subscription_expires_at` (timestamp, nullable)

## Feature Summary

| Feature | Freemium | Premium |
|---------|----------|---------|
| AI Chat (Bloom) | 10/day | ♾️ Unlimited |
| Ask Expert Questions | ❌ Blocked | ✅ Enabled |
| View Expert Profiles | ✅ Allowed | ✅ Allowed |
| Book Expert Consultations | ✅ Allowed | ✅ Allowed |
| Community Posts | ✅ Full Access | ✅ Full Access |
| Read Articles | ✅ Full Access | ✅ Full Access |

## Next Steps

1. **Payment Integration**: The premium upgrade dialog has a placeholder for payment. You'll need to integrate:
   - Stripe or PayPal for payments
   - Webhook to update `is_premium` field after successful payment
   - Subscription management (renewal, cancellation)

2. **Admin Panel**: Add UI to manually grant/revoke premium status for testing or support purposes

3. **Expiration Handling**: Create a cron job or scheduled task to check `subscription_expires_at` and downgrade expired subscriptions

## Why You're Not Seeing Premium Prompts

If you're not seeing the premium restrictions, it's likely because:

1. ❌ **Prisma Client Not Regenerated**: The backend can't read the new fields
   - Fix: Run `npx prisma generate`

2. ❌ **Database Migration Not Applied**: The fields don't exist in the database yet
   - Fix: Run `npx prisma migrate dev`

3. ❌ **Backend Not Restarted**: Server still using old code
   - Fix: Restart your `npm run dev`

4. ❌ **User is Already Premium**: Check database to see if user has `is_premium = true`
   - Fix: Set to `false` for testing

After completing steps 1-3 above, the premium restrictions will work correctly!
