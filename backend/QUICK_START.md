# 🚀 Quick Start - Premium Subscription

## Run Setup (One Command)
```bash
cd backend
./setup-premium.sh
```

This will:
1. ✅ Generate Prisma client
2. ✅ Apply database migration  
3. ✅ Seed database with test data
4. ✅ Create 12 users + 5 records per collection

## Test Accounts

| Type | Email | Password | Features |
|------|-------|----------|----------|
| **Premium** | premium1@example.com | Premium123! | ∞ AI questions + Expert questions |
| **Freemium** | amara.osei@example.com | Password123! | 10 AI questions/day, no expert questions |

## Test Premium Restrictions

### 1. Test Freemium Limits (SHOULD show premium prompts)
```
Login: amara.osei@example.com / Password123!
→ Open AI chatbot
→ Send 10 messages (should see "X questions remaining")
→ Try 11th message → Premium upgrade prompt
→ Go to Experts → Click "Ask Question" → Premium prompt
→ Booking still works (all users can book)
```

### 2. Test Premium Access (NO restrictions)
```
Login: premium1@example.com / Premium123!
→ Open AI chatbot → No limits shown
→ Send many messages → No restrictions
→ Go to Experts → "Ask Question" works
→ All features available
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Column does not exist" | `npx prisma migrate dev --name add_premium_subscription` |
| "Property isPremium..." | `npx prisma generate` |
| Premium not working | Restart backend: `npm run dev` |
| Check database | `npx prisma studio` |

## What's Different Now?

### Database
- Added 5 fields to users table: `isPremium`, `aiQuestionsCount`, `aiQuestionsLimit`, `aiQuestionsResetAt`, `subscriptionExpiresAt`

### Backend
- `chat.controller.ts` - Checks AI question limits, resets daily
- `questions.controller.ts` - Blocks non-premium from asking experts
- `auth.controller.ts` - Returns subscription data with user info

### Frontend
- `chatbot-widget.tsx` - Shows usage counter, upgrade prompt
- `experts-page.tsx` - Premium check on "Ask Question"
- `premium-upgrade-dialog.tsx` - Upgrade modal with pricing

## Full Documentation
See `SETUP_PREMIUM.md` for complete guide.
