/**
 * Full database seed — at least 5 records per entity.
 * Usage:  npx ts-node scripts/seed.ts
 *
 * Creates (in order):
 *   - 1 admin + 3 premium users + 4 freemium users + 5 expert users
 *   - 5 articles (published, various categories)
 *   - 5 community posts (various categories)
 *   - 5 comments across posts
 *   - 5 questions (various topics)
 *   - 5 expert answers
 *   - 5 knowledge-base entries (verified)
 *   - Bookmarks, likes, pregnancy/child info, expert applications
 *
 * Safe to re-run — clears database first for clean testing.
 */

import { ArticleCategory, PostCategory, PrismaClient, QuestionTopic } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

// ─── helpers ──────────────────────────────────────────────────────────────────
const hash = (pw: string) => bcrypt.hash(pw, 10);
const log  = (msg: string) => console.log(`  ${msg}`);

async function main() {
  console.log('\n🌱  Seeding Herizone database…\n');
  
  // ── CLEAR DATABASE ────────────────────────────────────────────────────────
  console.log('🗑️  Clearing existing data...');
  await prisma.chatFeedback.deleteMany({});
  await prisma.chatMessage.deleteMany({});
  await prisma.answer.deleteMany({});
  await prisma.question.deleteMany({});
  await prisma.knowledgeBase.deleteMany({});
  await prisma.report.deleteMany({});
  await prisma.like.deleteMany({});
  await prisma.comment.deleteMany({});
  await prisma.post.deleteMany({});
  await prisma.bookmark.deleteMany({});
  await prisma.article.deleteMany({});
  await prisma.expertApplication.deleteMany({});
  await prisma.pregnancyInfo.deleteMany({});
  await prisma.userChild.deleteMany({});
  await prisma.user.deleteMany({});
  log('✅ Database cleared');

  // ── 1. ADMIN ──────────────────────────────────────────────────────────────
  console.log('\n👤  Users & Experts');
  const adminPw = await hash('Admin@Herizone2026!');
  const admin = await prisma.user.create({
    data: {
      email: 'admin@herizone.com',
      name: 'Herizone Admin',
      passwordHash: adminPw,
      isAdmin: true,
      isPremium: true, // Admin has premium access
    },
  });
  log(`✅ admin (premium)   ${admin.email}`);

  // ── 2. PREMIUM USERS ──────────────────────────────────────────────────────
  const premiumData = [
    {
      email: 'premium1@example.com',
      name: 'Sarah Premium',
      bio: 'Premium member enjoying unlimited AI chat and expert access!',
      profilePicture: 'https://api.dicebear.com/9.x/avataaars/svg?seed=sarah',
    },
    {
      email: 'premium2@example.com',
      name: 'Maya Premium',
      bio: 'Love the premium features - so worth it!',
      profilePicture: 'https://api.dicebear.com/9.x/avataaars/svg?seed=maya',
    },
    {
      email: 'premium3@example.com',
      name: 'Zara Premium',
      bio: 'Premium subscriber, expecting my first baby!',
      profilePicture: 'https://api.dicebear.com/9.x/avataaars/svg?seed=zara',
    },
  ];

  const premiumPw = await hash('Premium123!');
  const premiumUsers = await Promise.all(
    premiumData.map((d) =>
      prisma.user.create({
        data: {
          ...d,
          passwordHash: premiumPw,
          isPremium: true,
          aiQuestionsCount: 0,
          aiQuestionsLimit: 10, // Still has limit but won't be enforced
          subscriptionExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        },
      })
    )
  );
  premiumUsers.forEach((u) => log(`✅ premium user      ${u.email}`));

  // ── 3. FREEMIUM USERS ─────────────────────────────────────────────────────
  const freemiumData = [
    {
      email: 'amara.osei@example.com',
      name: 'Amara Osei',
      bio: 'First-time mum, 28 weeks pregnant. Love sharing tips!',
      profilePicture: 'https://api.dicebear.com/9.x/avataaars/svg?seed=amara',
    },
    {
      email: 'fatima.diallo@example.com',
      name: 'Fatima Diallo',
      bio: 'Mother of two toddlers. Passionate about healthy weaning.',
      profilePicture: 'https://api.dicebear.com/9.x/avataaars/svg?seed=fatima',
    },
    {
      email: 'kezia.mwangi@example.com',
      name: 'Kezia Mwangi',
      bio: 'Postpartum journey — one day at a time.',
      profilePicture: 'https://api.dicebear.com/9.x/avataaars/svg?seed=kezia',
    },
    {
      email: 'ngozi.eze@example.com',
      name: 'Ngozi Eze',
      bio: 'Third trimester warrior! Counting down to my due date.',
      profilePicture: 'https://api.dicebear.com/9.x/avataaars/svg?seed=ngozi',
    },
    {
      email: 'abena.asante@example.com',
      name: 'Abena Asante',
      bio: 'NICU mum & mental health advocate.',
      profilePicture: 'https://api.dicebear.com/9.x/avataaars/svg?seed=abena',
    },
  ];

  const regularPw = await hash('Password123!');
  const regularUsers = await Promise.all(
    regularData.map((d) =>
      prisma.user.upsert({
        where:  { email: d.email },
        update: {},
        create: { ...d, passwordHash: regularPw },
      })
    )
  );
  regularUsers.forEach((u) => log(`✅ user         ${u.email}`));

  // ── 3. EXPERT USERS ───────────────────────────────────────────────────────
  const expertData = [
    {
      email: 'dr.adaeze.obi@example.com',
      name: 'Dr. Adaeze Obi',
      bio: 'Obstetrician-Gynecologist with 12 years of experience. Specialises in high-risk pregnancy.',
      specialty: 'Obstetrics & Gynaecology',
      yearsOfExperience: 12,
      priceMin: 40,
      priceMax: 80,
      profilePicture: 'https://api.dicebear.com/9.x/avataaars/svg?seed=adaeze',
    },
    {
      email: 'dr.kwame.mensah@example.com',
      name: 'Dr. Kwame Mensah',
      bio: 'Paediatrician passionate about infant development and breastfeeding support.',
      specialty: 'Paediatrics',
      yearsOfExperience: 9,
      priceMin: 35,
      priceMax: 70,
      profilePicture: 'https://api.dicebear.com/9.x/avataaars/svg?seed=kwame',
    },
    {
      email: 'nurse.yetunde.balogun@example.com',
      name: 'Yetunde Balogun RN',
      bio: 'Registered nurse & certified lactation consultant. Here to help with feeding challenges.',
      specialty: 'Lactation & Maternal Nursing',
      yearsOfExperience: 7,
      priceMin: 20,
      priceMax: 50,
      profilePicture: 'https://api.dicebear.com/9.x/avataaars/svg?seed=yetunde',
    },
    {
      email: 'dr.seun.akin@example.com',
      name: 'Dr. Seun Akin',
      bio: 'Clinical psychologist specialising in perinatal mental health and postpartum depression.',
      specialty: 'Perinatal Mental Health',
      yearsOfExperience: 10,
      priceMin: 45,
      priceMax: 90,
      profilePicture: 'https://api.dicebear.com/9.x/avataaars/svg?seed=seun',
    },
    {
      email: 'ntr.chinwe.uko@example.com',
      name: 'Chinwe Uko RD',
      bio: 'Registered dietitian specialising in prenatal and infant nutrition.',
      specialty: 'Prenatal & Infant Nutrition',
      yearsOfExperience: 6,
      priceMin: 30,
      priceMax: 60,
      profilePicture: 'https://api.dicebear.com/9.x/avataaars/svg?seed=chinwe',
    },
  ];

  const expertPw = await hash('Expert@Herizone2026!');
  const experts = await Promise.all(
    expertData.map((d) =>
      prisma.user.upsert({
        where:  { email: d.email },
        update: {},
        create: { ...d, passwordHash: expertPw, isExpert: true },
      })
    )
  );
  experts.forEach((e) => log(`✅ expert       ${e.email}`));

  // ── 4. PREGNANCY & CHILD INFO ─────────────────────────────────────────────
  console.log('\n🤰  Pregnancy & child info');
  for (const [i, u] of regularUsers.entries()) {
    if (i < 3) {
      const existing = await prisma.pregnancyInfo.findFirst({ where: { userId: u.id } });
      if (!existing) {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + (i + 1) * 30);
        await prisma.pregnancyInfo.create({
          data: { userId: u.id, dueDate, trimester: (i % 3) + 1 },
        });
        log(`✅ pregnancy    ${u.name} (T${(i % 3) + 1})`);
      }
    } else {
      const existing = await prisma.userChild.findFirst({ where: { userId: u.id } });
      if (!existing) {
        const birthDate = new Date();
        birthDate.setMonth(birthDate.getMonth() - (i * 4));
        await prisma.userChild.create({
          data: { userId: u.id, name: ['Kofi', 'Zara'][i - 3], birthDate },
        });
        log(`✅ child        ${u.name}`);
      }
    }
  }

  // ── 5. ARTICLES ───────────────────────────────────────────────────────────
  console.log('\n📰  Articles');
  const articlesData = [
    {
      title: 'Managing Morning Sickness: Evidence-Based Strategies',
      category: ArticleCategory.pregnancy,
      tags: ['morning sickness', 'nausea', 'first trimester', 'pregnancy'],
      content: `## What Is Morning Sickness?
Morning sickness affects up to 80 % of pregnant women, typically beginning around week 6 and resolving by week 12–14 for most. Despite the name, nausea and vomiting can occur at any time of day.

## Evidence-Based Strategies

### Dietary Adjustments
- **Eat small, frequent meals** — an empty stomach worsens nausea. Aim for every 2–3 hours.
- **Cold foods** tend to have less smell, making them easier to tolerate.
- **Ginger** — ginger tea, ginger biscuits, or 250 mg capsules 4× daily have solid trial evidence.
- **High-protein snacks** before bed may reduce overnight nausea.

### Hydration
Sip small amounts of water consistently rather than large quantities at once. Electrolyte drinks and ice chips also help.

### Vitamin B6
Pyridoxine (10–25 mg 3× daily) is a first-line pharmacological option recommended by ACOG.

### When to See a Doctor
Seek care if you cannot keep any fluids down for 24 hours, notice dark urine, feel dizzy, or have lost more than 5 % of pre-pregnancy weight. This may indicate hyperemesis gravidarum, which requires treatment.

*Always consult your healthcare provider before starting any supplement.*`,
    },
    {
      title: 'Safe Exercise During Pregnancy: A Trimester-by-Trimester Guide',
      category: ArticleCategory.pregnancy,
      tags: ['exercise', 'fitness', 'prenatal', 'safe pregnancy'],
      content: `## Why Exercise Matters in Pregnancy
Regular moderate exercise reduces the risk of gestational diabetes, preeclampsia, and excessive weight gain. It also improves mood and prepares the body for labour.

## First Trimester (Weeks 1–13)
Most pre-pregnancy exercise can continue. Focus on:
- Brisk walking (30 min most days)
- Swimming & water aerobics
- Prenatal yoga (avoid hot yoga)
- Low-impact cardio

**Avoid:** contact sports, activities with fall risk, high-altitude exercise if unaccustomed.

## Second Trimester (Weeks 14–27)
Energy often returns. Ideal time to build a routine:
- Continue walking & swimming
- Pelvic floor exercises (Kegel) — start now if you haven't
- Modified strength training (avoid lying flat on back after 16 weeks)

## Third Trimester (Weeks 28–40)
Shift to gentler activity as bump grows:
- Prenatal yoga & stretching
- Walking & gentle swimming
- Birth-preparation breathing techniques

## Warning Signs to Stop Immediately
Chest pain, dizziness, severe shortness of breath, calf swelling, vaginal bleeding, or decreased foetal movement. Call your provider right away.`,
    },
    {
      title: 'Introducing Solid Foods: A Parent\'s Guide to Baby-Led Weaning',
      category: ArticleCategory.parenting,
      tags: ['weaning', 'solid foods', 'baby nutrition', 'BLW', '6 months'],
      content: `## When to Start Solids
The WHO recommends exclusive breastfeeding for the first 6 months. Signs of readiness for solids include:
- Sitting with minimal support
- Good head control
- Loss of the tongue-thrust reflex
- Showing interest in food

## What Is Baby-Led Weaning (BLW)?
BLW lets babies self-feed soft finger foods from the start, rather than being spoon-fed purées. Evidence suggests it may improve food acceptance and reduce the risk of obesity.

## Safe First Foods (6 months+)
| Food | Preparation |
|------|-------------|
| Avocado | Sliced into spears |
| Banana | Halved lengthways |
| Soft-cooked carrot | Finger-sized sticks |
| Scrambled egg | Soft, no added salt |
| Soft-cooked pasta | Short shapes |

## Foods to Avoid Under 12 Months
- Honey (risk of infant botulism)
- Whole cow's milk as main drink
- Salt and added sugar
- Whole nuts and hard raw vegetables (choking hazard)

## Managing Gagging vs. Choking
Gagging is a normal safety reflex — baby will manage it. Choking is silent, with no coughing. Learn infant first aid before starting solids.`,
    },
    {
      title: 'Recognising and Seeking Help for Postpartum Depression',
      category: ArticleCategory.health,
      tags: ['postpartum', 'mental health', 'PPD', 'postnatal depression'],
      content: `## Understanding Postpartum Depression
Postpartum depression (PPD) affects approximately 1 in 7 mothers and can appear any time in the first year after birth. It is not a sign of weakness or bad motherhood — it is a medical condition.

## Baby Blues vs. PPD
| | Baby Blues | PPD |
|---|---|---|
| Onset | Days 2–5 | Within 12 months |
| Duration | Up to 2 weeks | Weeks to months untreated |
| Severity | Mild, transient | Moderate–severe |

## Common Signs of PPD
- Persistent sadness, emptiness, or hopelessness
- Loss of interest in your baby or activities you enjoyed
- Difficulty bonding with your baby
- Extreme fatigue beyond normal newborn exhaustion
- Feelings of worthlessness or guilt
- Intrusive thoughts (discuss with a healthcare provider)

## Seeking Help
**Talk to your midwife, GP, or obstetrician.** Effective treatments include:
- **Talking therapy** — CBT has strong evidence for PPD
- **Antidepressants** — several are safe during breastfeeding; discuss with your doctor
- **Peer support groups** — shared experience is powerful

## Supporting a Partner with PPD
Listen without judgement, assist with night feeds, help with household tasks, and encourage professional help. Remind them that PPD is treatable.`,
    },
    {
      title: 'Iron-Rich Foods During Pregnancy: Preventing Anaemia',
      category: ArticleCategory.nutrition,
      tags: ['iron', 'anaemia', 'prenatal nutrition', 'diet', 'pregnancy'],
      content: `## Why Iron Is Critical in Pregnancy
Blood volume increases by ~50 % during pregnancy. Iron is essential for producing extra haemoglobin for both mother and baby. Deficiency — the most common nutritional deficiency in pregnancy — raises risk of preterm birth, low birthweight, and maternal fatigue.

## Daily Requirements
- **Non-pregnant adult:** 18 mg/day
- **Pregnant:** 27 mg/day
- **Breastfeeding:** 9 mg/day

## Top Iron-Rich Foods

### Haem Iron (animal sources — most easily absorbed)
- Lean red meat: beef, lamb (~3 mg per 100 g)
- Chicken liver: ~12 mg per 100 g (limit to once/week due to vitamin A)
- Fish: sardines, tuna

### Non-Haem Iron (plant sources)
- Lentils & chickpeas: ~3 mg per 100 g cooked
- Tofu: ~3 mg per 100 g
- Dark leafy greens: spinach, kale (~2 mg per 100 g)
- Fortified cereals: check label

## Boosting Absorption
- Eat non-haem iron with **vitamin C** (citrus, bell peppers, tomatoes)
- Avoid tea/coffee within 1 hour of iron-rich meals — tannins inhibit absorption
- Space out calcium-rich foods from iron-rich meals

## Supplementation
Most prenatal vitamins contain 27 mg iron. If levels are low, your provider may prescribe additional supplementation. Side effects (constipation, nausea) can be managed with stool softeners and taking supplements with food.`,
    },
  ];

  const articleRecords = [];
  for (const a of articlesData) {
    const existing = await prisma.article.findFirst({ where: { title: a.title } });
    if (existing) {
      articleRecords.push(existing);
      log(`⏩ exists       "${a.title.slice(0, 50)}…"`);
    } else {
      const rec = await prisma.article.create({
        data: {
          ...a,
          status: 'published',
          authorId: experts[0].id,
        },
      });
      articleRecords.push(rec);
      log(`✅ article      "${a.title.slice(0, 50)}…"`);
    }
  }

  // ── 6. POSTS ──────────────────────────────────────────────────────────────
  console.log('\n💬  Community Posts');
  const postsData = [
    {
      content: `Just hit 30 weeks and my back pain is unbearable some days! 😩 What positions/exercises helped you ladies? My midwife mentioned a pregnancy pillow but I'm not sure which type to get.`,
      category: PostCategory.pregnancy,
      userId: regularUsers[0].id,
      likeCount: 14,
      commentCount: 3,
    },
    {
      content: `For those who've done baby-led weaning — how did you cope with the mess?! My 7-month-old is enthusiastically throwing avocado everywhere 😂 Tips welcome. Also, is it normal for them to eat so little at first?`,
      category: PostCategory.parenting,
      userId: regularUsers[1].id,
      likeCount: 22,
      commentCount: 5,
    },
    {
      content: `I want to talk about something that's not discussed enough — postpartum rage. Everyone talks about baby blues and PPD, but nobody warned me about the intense, sudden anger I'd feel. Has anyone else experienced this? I'm seeing a therapist now and it's helping.`,
      category: PostCategory.health,
      userId: regularUsers[2].id,
      isAnonymous: true,
      likeCount: 47,
      commentCount: 8,
    },
    {
      content: `Recommendations for iron-rich snacks that don't taste like cardboard? 😅 My haemoglobin is borderline and my midwife wants me to improve it through diet before considering supplements. Currently 24 weeks.`,
      category: PostCategory.health,
      userId: regularUsers[3].id,
      likeCount: 9,
      commentCount: 4,
    },
    {
      content: `Birth story 🌸 After 18 hours of labour I finally got to hold my son Kofi. Had planned for a natural birth but ended up with an emergency C-section. Honestly the recovery has been harder than I expected but Kofi is perfect and healthy and that's all that matters. Sharing for anyone scared about C-sections — you are SO strong. 💛`,
      category: PostCategory.general,
      userId: regularUsers[4].id,
      likeCount: 63,
      commentCount: 12,
    },
  ];

  const postRecords = [];
  for (const p of postsData) {
    const existing = await prisma.post.findFirst({ where: { content: p.content.slice(0, 40) } });
    if (existing) {
      postRecords.push(existing);
      log(`⏩ exists       post by ${p.userId.slice(0, 8)}…`);
    } else {
      const rec = await prisma.post.create({ data: p });
      postRecords.push(rec);
      log(`✅ post         [${p.category}] ${p.content.slice(0, 50)}…`);
    }
  }

  // ── 7. COMMENTS ───────────────────────────────────────────────────────────
  console.log('\n💭  Comments');
  const commentsData = [
    {
      postId: postRecords[0].id,
      userId: regularUsers[1].id,
      content: 'A U-shaped pregnancy pillow changed my life in my third trimester! Totally worth it.',
    },
    {
      postId: postRecords[0].id,
      userId: regularUsers[2].id,
      content: 'Sleeping on your left side with a regular pillow between your knees also helps a lot — and it\'s free! 😊',
    },
    {
      postId: postRecords[1].id,
      userId: regularUsers[0].id,
      content: 'Silicone bibs with a pocket and a wipeable high chair mat saved my sanity! The mess does get better around 9–10 months.',
    },
    {
      postId: postRecords[2].id,
      userId: regularUsers[3].id,
      content: 'Thank you so much for sharing this. I felt exactly the same way after my second was born. You are not alone. 💛',
    },
    {
      postId: postRecords[4].id,
      userId: regularUsers[0].id,
      content: 'Congratulations on baby Kofi! 🎉 C-section recovery is genuinely tough — be kind to yourself. Sending love.',
    },
  ];

  for (const c of commentsData) {
    const existing = await prisma.comment.findFirst({ where: { content: c.content.slice(0, 40) } });
    if (!existing) {
      await prisma.comment.create({ data: c });
      log(`✅ comment      ${c.content.slice(0, 55)}…`);
    } else {
      log(`⏩ exists       comment`);
    }
  }

  // ── 8. LIKES ──────────────────────────────────────────────────────────────
  console.log('\n❤️   Likes');
  const likePairs = [
    [regularUsers[1].id, postRecords[0].id],
    [regularUsers[2].id, postRecords[0].id],
    [regularUsers[0].id, postRecords[1].id],
    [regularUsers[3].id, postRecords[2].id],
    [regularUsers[4].id, postRecords[3].id],
  ] as [string, string][];

  for (const [userId, postId] of likePairs) {
    const existing = await prisma.like.findUnique({ where: { postId_userId: { postId, userId } } });
    if (!existing) {
      await prisma.like.create({ data: { userId, postId } });
      log(`✅ like         user ${userId.slice(0, 8)} → post ${postId.slice(0, 8)}`);
    } else {
      log(`⏩ exists       like`);
    }
  }

  // ── 9. BOOKMARKS ──────────────────────────────────────────────────────────
  console.log('\n🔖  Bookmarks');
  const bookmarkPairs = [
    [regularUsers[0].id, articleRecords[0].id],
    [regularUsers[0].id, articleRecords[1].id],
    [regularUsers[1].id, articleRecords[2].id],
    [regularUsers[2].id, articleRecords[3].id],
    [regularUsers[3].id, articleRecords[4].id],
  ] as [string, string][];

  for (const [userId, articleId] of bookmarkPairs) {
    const existing = await prisma.bookmark.findUnique({ where: { userId_articleId: { userId, articleId } } });
    if (!existing) {
      await prisma.bookmark.create({ data: { userId, articleId } });
      log(`✅ bookmark     user ${userId.slice(0, 8)} → article ${articleId.slice(0, 8)}`);
    } else {
      log(`⏩ exists       bookmark`);
    }
  }

  // ── 10. QUESTIONS ─────────────────────────────────────────────────────────
  console.log('\n❓  Questions');
  const questionsData = [
    {
      userId: regularUsers[0].id,
      question: 'I\'m 32 weeks pregnant and have been experiencing sharp pelvic pain when I walk. Is this normal at this stage? Should I be concerned?',
      topic: QuestionTopic.medical,
    },
    {
      userId: regularUsers[1].id,
      question: 'My 8-month-old baby has been waking up every 2 hours at night for the past 3 weeks. He was previously sleeping 5–6 hour stretches. Could this be sleep regression and what can I do to help?',
      topic: QuestionTopic.parenting,
    },
    {
      userId: regularUsers[2].id,
      question: 'I feel completely overwhelmed and disconnected from my 6-week-old. I love her but I feel nothing when I hold her. I\'m too scared to tell anyone in real life. Is this PPD? What should I do?',
      topic: QuestionTopic.mental_health,
    },
    {
      userId: regularUsers[3].id,
      question: 'I\'m a vegetarian and 20 weeks pregnant. My iron levels have come back low (9.8 g/dL). My doctor has recommended supplements but I\'m worried about constipation. Are there gentler iron supplement forms I can ask about?',
      topic: QuestionTopic.nutrition,
    },
    {
      userId: regularUsers[4].id,
      question: 'My 4-month-old has reflux and was recently prescribed Omeprazole. I\'m breastfeeding — do I need to change my diet to help reduce her symptoms? Any foods I should avoid?',
      topic: QuestionTopic.medical,
    },
  ];

  const questionRecords = [];
  for (const q of questionsData) {
    const existing = await prisma.question.findFirst({ where: { question: q.question.slice(0, 50) } });
    if (existing) {
      questionRecords.push(existing);
      log(`⏩ exists       question`);
    } else {
      const rec = await prisma.question.create({ data: q });
      questionRecords.push(rec);
      log(`✅ question     [${q.topic}] ${q.question.slice(0, 55)}…`);
    }
  }

  // ── 11. EXPERT ANSWERS ────────────────────────────────────────────────────
  console.log('\n🩺  Expert Answers');
  const answersData = [
    {
      questionId: questionRecords[0].id,
      expertId: experts[0].id, // OB-GYN
      answer: `What you're describing sounds like **symphysis pubis dysfunction (SPD)** or **pelvic girdle pain (PGP)**, which is very common from around 28–32 weeks as the hormone relaxin loosens your pelvic joints in preparation for birth.

**What helps:**
- A pelvic support belt (often prescribed by a physiotherapist)
- Keeping your knees together when getting in/out of bed or a car
- Avoiding one-legged activities (stairs one at a time)
- Referral to a women's health physiotherapist — this is the most effective treatment

**When to seek immediate care:** If the pain is accompanied by fever, bleeding, or contractions, go to triage straight away.

Please mention this at your next appointment so your midwife can refer you appropriately. You're doing brilliantly at 32 weeks! 💛`,
    },
    {
      questionId: questionRecords[1].id,
      expertId: experts[1].id, // Paediatrician
      answer: `This sounds very much like the **8–9 month sleep regression**, which is driven by a major developmental leap — your baby is working hard on object permanence, crawling/pulling to stand, and separation awareness. It is completely normal and usually resolves within 2–6 weeks.

**Strategies that help:**
- **Consistent bedtime routine** — same order, same time every night (bath → feed → story → sleep)
- **Drowsy but awake** — put him down while still slightly awake so he learns to self-settle
- **Respond in graduated intervals** — e.g., wait 2 min, then 5 min, before going in (if comfortable with this approach)
- Ensure enough daytime calories — growth spurts increase hunger around this age
- Two naps are usually still appropriate at 8 months; overtiredness worsens night waking

This too shall pass! Hang in there.`,
    },
    {
      questionId: questionRecords[2].id,
      expertId: experts[3].id, // Perinatal psychologist
      answer: `First: **thank you for sharing this.** What you're describing — emotional numbness, feeling disconnected from your baby while still loving her — is a recognised symptom of postpartum depression or postpartum anxiety, and it is **not** a reflection of your worth as a mother. It does not mean you don't love her.

**Please do these things:**
1. **Tell your midwife, health visitor, or GP at your next contact** — or call them today. You can say exactly what you wrote here. They will not judge you and they will not take your baby away.
2. The **Edinburgh Postnatal Depression Scale** (EPDS) is a brief questionnaire your provider will likely use — being honest on it helps them help you.
3. **Effective treatments exist:** talking therapy (CBT/IPT) and/or medication, both of which are safe while breastfeeding.

You have already shown enormous courage by putting this into words. That is the hardest step. 💙`,
    },
    {
      questionId: questionRecords[3].id,
      expertId: experts[4].id, // Dietitian
      answer: `Great question — iron supplement tolerability is genuinely important and worth discussing with your doctor. Here are the options:

**Gentler iron supplement forms:**
- **Ferrous bisglycinate (chelated iron)** — absorbed well at lower doses with significantly less GI upset than ferrous sulfate. Look for ~25–30 mg elemental iron.
- **Ferrous gluconate** — slower release, somewhat gentler than ferrous sulfate.
- **Liquid iron preparations** — dose can be titrated and are often better tolerated.

**Tips to reduce constipation:**
- Take iron with a **vitamin C source** (orange juice) to improve absorption at lower doses
- **Take every other day** — emerging research suggests alternate-day dosing achieves similar absorption with fewer side effects
- Increase fibre and water intake
- Your doctor can prescribe lactulose if needed

**From a diet perspective**, pairing lentils, fortified cereals, tofu, and dark greens with citrus will help. Continue discussing with your GP about which preparation suits you best.`,
    },
    {
      questionId: questionRecords[4].id,
      expertId: experts[1].id, // Paediatrician
      answer: `Infant reflux management through maternal diet works best for **IgE-mediated cow's milk protein allergy (CMPA)**, which can mimic reflux symptoms. If your daughter's reflux has already been confirmed and Omeprazole has been prescribed, a dietitian-supervised **maternal dairy exclusion trial** (2–4 weeks) may be worth discussing with your GP if symptoms aren't improving.

**Foods that *sometimes* worsen reflux through breastmilk:**
- Dairy products (most commonly implicated)
- Caffeine (can relax the lower oesophageal sphincter)
- Citrus, tomatoes, spicy foods — weaker evidence but worth noting

**General reflux feeding tips:**
- Smaller, more frequent feeds
- Keep her upright for 20–30 min after feeds
- Ensure a deep latch to reduce air swallowing
- Paced bottle feeding if any bottles used

If symptoms persist on Omeprazole, ask for a paediatric gastroenterology referral. 💛`,
    },
  ];

  for (const a of answersData) {
    const existing = await prisma.answer.findFirst({ where: { questionId: a.questionId, expertId: a.expertId } });
    if (!existing) {
      await prisma.answer.create({ data: a });
      log(`✅ answer       expert ${a.expertId.slice(0, 8)} → question ${a.questionId.slice(0, 8)}`);
    } else {
      log(`⏩ exists       answer`);
    }
  }

  // ── 12. KNOWLEDGE BASE ────────────────────────────────────────────────────
  console.log('\n🧠  Knowledge Base');
  const kbData = [
    {
      question: 'How do I manage morning sickness?',
      answer: 'Eat small, frequent meals every 2–3 hours. Try ginger (tea, biscuits, or 250 mg capsules 4× daily). Stay hydrated with small sips. Avoid strong smells. Vitamin B6 (10–25 mg 3× daily) is evidence-based. If you cannot keep fluids down for 24 hours, see your doctor immediately as this may be hyperemesis gravidarum.',
      sourceType: 'article',
      confidenceScore: 95,
      isVerified: true,
    },
    {
      question: 'What are the signs of postpartum depression?',
      answer: 'Signs of postpartum depression include: persistent sadness or emptiness lasting more than 2 weeks; loss of interest in your baby or activities; difficulty bonding; extreme fatigue beyond normal newborn tiredness; feelings of worthlessness or guilt; difficulty sleeping even when baby sleeps; and intrusive thoughts. Baby blues (days 2–5, up to 2 weeks) are normal. PPD is more persistent and more severe. Please speak to your midwife, GP, or health visitor — effective treatments exist.',
      sourceType: 'expert_answer',
      confidenceScore: 98,
      isVerified: true,
    },
    {
      question: 'When should I start giving my baby solid foods?',
      answer: 'The WHO recommends exclusive breastfeeding for the first 6 months. Signs your baby is ready for solids: can sit with minimal support, has good head control, has lost the tongue-thrust reflex, and shows interest in food. Start with soft finger foods or purées — iron-rich foods are important first foods. Avoid honey, salt, added sugar, whole cow\'s milk as a main drink, and whole nuts under 12 months.',
      sourceType: 'article',
      confidenceScore: 97,
      isVerified: true,
    },
    {
      question: 'What exercises are safe during pregnancy?',
      answer: 'Safe exercises during pregnancy include brisk walking, swimming and water aerobics, prenatal yoga (not hot yoga), low-impact cardio, and modified strength training (avoid lying flat on your back after 16 weeks). Pelvic floor (Kegel) exercises are beneficial throughout. Avoid contact sports, activities with fall risk, and high-altitude exercise if not accustomed. Stop immediately if you experience chest pain, dizziness, vaginal bleeding, or decreased fetal movement.',
      sourceType: 'article',
      confidenceScore: 93,
      isVerified: true,
    },
    {
      question: 'How can I increase my iron levels during pregnancy?',
      answer: 'Increase iron-rich foods: lean red meat, chicken liver (once/week max), lentils, chickpeas, tofu, dark leafy greens (spinach, kale), and fortified cereals. Boost absorption by pairing non-haem iron sources with vitamin C (citrus, bell peppers). Avoid tea and coffee within 1 hour of iron-rich meals. Most prenatal vitamins contain 27 mg iron — if levels remain low, your provider may prescribe additional supplementation. Ferrous bisglycinate (chelated iron) is gentler on the stomach than ferrous sulfate.',
      sourceType: 'expert_answer',
      confidenceScore: 94,
      isVerified: true,
    },
    {
      question: 'What is the 8 month sleep regression?',
      answer: 'The 8–9 month sleep regression is a common period where previously good sleepers start waking frequently. It is driven by major developmental leaps: object permanence, increased mobility (crawling, pulling to stand), and separation anxiety. It typically lasts 2–6 weeks. Strategies: maintain a consistent bedtime routine, put baby down drowsy but awake, ensure adequate daytime calories, and respond with graduated intervals. It is temporary and normal.',
      sourceType: 'expert_answer',
      confidenceScore: 91,
      isVerified: true,
    },
    {
      question: 'What are the symptoms of pelvic girdle pain in pregnancy?',
      answer: 'Pelvic girdle pain (PGP) / symphysis pubis dysfunction (SPD) causes sharp or aching pain in the pelvic area, often worsening with walking, climbing stairs, turning in bed, or standing on one leg. It typically starts from the second trimester. Treatment includes: pelvic support belt, referral to a women\'s health physiotherapist, keeping knees together when moving, and avoiding one-legged activities. Always inform your midwife so they can refer you appropriately.',
      sourceType: 'expert_answer',
      confidenceScore: 90,
      isVerified: true,
    },
  ];

  for (const kb of kbData) {
    const existing = await prisma.knowledgeBase.findFirst({ where: { question: kb.question } });
    if (!existing) {
      await prisma.knowledgeBase.create({ data: kb });
      log(`✅ knowledge    "${kb.question.slice(0, 55)}…"`);
    } else {
      log(`⏩ exists       "${kb.question.slice(0, 55)}…"`);
    }
  }

  // ── 13. EXPERT APPLICATIONS (for 2 regular users wanting to become experts) ─
  console.log('\n📋  Expert Applications');
  const appData = [
    {
      userId: regularUsers[0].id,
      bio: 'Registered midwife with 5 years experience in a tertiary maternity unit.',
      credentials: 'Registered Midwife (RM) — Nursing & Midwifery Council UK',
      specialty: 'Midwifery',
      yearsOfExperience: 5,
      licenseNumber: 'NMC-2021-RM-44821',
      priceMin: 25,
      priceMax: 55,
      agreeToTerms: true,
      status: 'pending' as const,
    },
    {
      userId: regularUsers[1].id,
      bio: 'Certified breastfeeding counsellor and mother of three. Passionate about supporting new mothers.',
      credentials: 'IBCLC — International Board Certified Lactation Consultant',
      specialty: 'Breastfeeding & Lactation',
      yearsOfExperience: 4,
      priceMin: 20,
      priceMax: 45,
      agreeToTerms: true,
      status: 'pending' as const,
    },
  ];

  for (const app of appData) {
    const existing = await prisma.expertApplication.findFirst({ where: { userId: app.userId } });
    if (!existing) {
      await prisma.expertApplication.create({ data: app });
      log(`✅ application  user ${app.userId.slice(0, 8)} — ${app.specialty}`);
    } else {
      log(`⏩ exists       application`);
    }
  }

  // ─── Done ─────────────────────────────────────────────────────────────────
  console.log('\n✅  Seed complete!\n');
  console.log('  Accounts:');
  console.log('  ┌──────────────────────────────────────────┬──────────────────────────┬──────┐');
  console.log('  │ Email                                    │ Password                 │ Role │');
  console.log('  ├──────────────────────────────────────────┼──────────────────────────┼──────┤');
  console.log('  │ admin@herizone.com                       │ Admin@Herizone2026!      │ admin│');
  console.log('  │ dr.adaeze.obi@example.com                │ Expert@Herizone2026!     │expert│');
  console.log('  │ dr.kwame.mensah@example.com              │ Expert@Herizone2026!     │expert│');
  console.log('  │ nurse.yetunde.balogun@example.com        │ Expert@Herizone2026!     │expert│');
  console.log('  │ dr.seun.akin@example.com                 │ Expert@Herizone2026!     │expert│');
  console.log('  │ ntr.chinwe.uko@example.com               │ Expert@Herizone2026!     │expert│');
  console.log('  │ amara.osei@example.com                   │ Password123!             │ user │');
  console.log('  │ fatima.diallo@example.com                │ Password123!             │ user │');
  console.log('  │ kezia.mwangi@example.com                 │ Password123!             │ user │');
  console.log('  │ ngozi.eze@example.com                    │ Password123!             │ user │');
  console.log('  │ abena.asante@example.com                 │ Password123!             │ user │');
  console.log('  └──────────────────────────────────────────┴──────────────────────────┴──────┘\n');
}

main()
  .catch((e) => {
    console.error('\n❌  Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
