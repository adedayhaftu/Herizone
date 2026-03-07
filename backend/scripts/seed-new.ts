/**
 * Full database seed — at least 5 records per entity.
 * Usage:  npx ts-node scripts/seed-new.ts
 */

import { ArticleCategory, PostCategory, PrismaClient, QuestionTopic } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

const hash = (pw: string) => bcrypt.hash(pw, 10);
const log = (msg: string) => console.log(`  ${msg}`);

async function main() {
  console.log('\n🌱  Seeding Herizone database…\n');
  
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

  console.log('\n👤  Users & Experts');
  const adminPw = await hash('Admin@Herizone2026!');
  const admin = await prisma.user.create({
    data: {
      email: 'admin@herizone.com',
      name: 'Herizone Admin',
      passwordHash: adminPw,
      isAdmin: true,
      isPremium: true,
    },
  });
  log(`✅ admin            ${admin.email}`);

  const premiumPw = await hash('Premium123!');
  const premiumUsers = [];
  const premiumData = [
    { email: 'premium1@example.com', name: 'Sarah Premium', bio: 'Premium member!' },
    { email: 'premium2@example.com', name: 'Maya Premium', bio: 'Love premium features!' },
    { email: 'premium3@example.com', name: 'Zara Premium', bio: 'Premium subscriber!' },
  ];
  
  for (const d of premiumData) {
    const u = await prisma.user.create({
      data: {
        ...d,
        passwordHash: premiumPw,
        isPremium: true,
        aiQuestionsCount: 0,
        aiQuestionsLimit: 10,
      },
    });
    premiumUsers.push(u);
    log(`✅ premium user     ${u.email}`);
  }

  const freemiumPw = await hash('Password123!');
  const freemiumUsers = [];
  const freemiumData = [
    { email: 'amara.osei@example.com', name: 'Amara Osei', bio: 'First-time mum, 28 weeks pregnant.' },
    { email: 'fatima.diallo@example.com', name: 'Fatima Diallo', bio: 'Mother of two toddlers.' },
    { email: 'kezia.mwangi@example.com', name: 'Kezia Mwangi', bio: 'Postpartum journey.' },
    { email: 'ngozi.eze@example.com', name: 'Ngozi Eze', bio: 'Third trimester warrior!' },
  ];
  
  for (const d of freemiumData) {
    const u = await prisma.user.create({
      data: {
        ...d,
        passwordHash: freemiumPw,
        isPremium: false,
        aiQuestionsCount: 0,
        aiQuestionsLimit: 10,
      },
    });
    freemiumUsers.push(u);
    log(`✅ freemium user    ${u.email}`);
  }

  const regularUsers = [...premiumUsers, ...freemiumUsers];

  const expertPw = await hash('Expert@Herizone2026!');
  const experts = [];
  const expertData = [
    { email: 'dr.adaeze.obi@example.com', name: 'Dr. Adaeze Obi', specialty: 'Obstetrics & Gynaecology', yearsOfExperience: 12, priceMin: 40, priceMax: 80, bio: 'OB-GYN specialist' },
    { email: 'dr.kwame.mensah@example.com', name: 'Dr. Kwame Mensah', specialty: 'Paediatrics', yearsOfExperience: 9, priceMin: 35, priceMax: 70, bio: 'Pediatrician' },
    { email: 'nurse.yetunde@example.com', name: 'Yetunde Balogun RN', specialty: 'Lactation', yearsOfExperience: 7, priceMin: 20, priceMax: 50, bio: 'Lactation consultant' },
    { email: 'dr.seun.akin@example.com', name: 'Dr. Seun Akin', specialty: 'Mental Health', yearsOfExperience: 10, priceMin: 45, priceMax: 90, bio: 'Mental health specialist' },
    { email: 'ntr.chinwe@example.com', name: 'Chinwe Uko RD', specialty: 'Nutrition', yearsOfExperience: 6, priceMin: 30, priceMax: 60, bio: 'Nutrition expert' },
  ];
  
  for (const d of expertData) {
    const e = await prisma.user.create({
      data: {
        ...d,
        passwordHash: expertPw,
        isExpert: true,
        isPremium: true,
      },
    });
    experts.push(e);
    log(`✅ expert           ${e.email}`);
  }

  console.log('\n📰  Articles');
  const articles = [];
  const articlesData = [
    { title: 'Managing Morning Sickness', content: 'Tips for dealing with morning sickness during pregnancy.' },
    { title: 'Safe Exercise During Pregnancy', content: 'Guide to staying active while pregnant.' },
    { title: 'Baby Sleep Training Methods', content: 'Different approaches to help baby sleep.' },
    { title: 'Breastfeeding Basics', content: 'Getting started with breastfeeding.' },
    { title: 'Postpartum Mental Health', content: 'Understanding and managing postpartum emotions.' },
  ];
  
  for (const d of articlesData) {
    const a = await prisma.article.create({
      data: {
        ...d,
        category: ArticleCategory.pregnancy,
        tags: ['pregnancy', 'health'],
        authorId: admin.id,
        status: 'published',
      },
    });
    articles.push(a);
    log(`✅ article          ${a.title}`);
  }

  console.log('\n💬  Community posts');
  const posts = [];
  for (let i = 0; i < 5; i++) {
    const p = await prisma.post.create({
      data: {
        category: PostCategory.general,
        content: `Community post ${i + 1}: Sharing my pregnancy journey!`,
        authorId: regularUsers[i % regularUsers.length].id,
      },
    });
    posts.push(p);
    log(`✅ post             Post ${i + 1}`);
  }

  console.log('\n💬  Comments');
  for (let i = 0; i < 5; i++) {
    await prisma.comment.create({
      data: {
        content: `Helpful comment ${i + 1}`,
        authorId: regularUsers[(i + 1) % regularUsers.length].id,
        postId: posts[i].id,
      },
    });
    log(`✅ comment          Comment ${i + 1}`);
  }

  console.log('\n❓  Expert questions');
  for (let i = 0; i < 5; i++) {
    const q = await prisma.question.create({
      data: {
        topic: QuestionTopic.health,
        title: `Health question ${i + 1}`,
        content: `Detailed question about health topic ${i + 1}`,
        authorId: regularUsers[i % regularUsers.length].id,
      },
    });
    await prisma.answer.create({
      data: {
        content: `Expert answer to question ${i + 1} with detailed medical advice.`,
        questionId: q.id,
        expertId: experts[i % experts.length].id,
      },
    });
    log(`✅ question+answer  Q${i + 1}`);
  }

  console.log('\n📚  Knowledge base');
  for (let i = 0; i < 5; i++) {
    await prisma.knowledgeBase.create({
      data: {
        question: `What about topic ${i + 1}?`,
        answer: `Detailed answer about topic ${i + 1}.`,
        category: ArticleCategory.pregnancy,
        tags: ['kb', 'common-question'],
        isVerified: true,
      },
    });
    log(`✅ KB entry         KB${i + 1}`);
  }

  console.log('\n✨  Seeding complete!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📧  Test Accounts:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n💎  Premium Users (Unlimited AI + Expert Questions):');
  console.log('    premium1@example.com / Premium123!');
  console.log('    premium2@example.com / Premium123!');
  console.log('    premium3@example.com / Premium123!');
  console.log('\n👤  Freemium Users (10 AI/day, No Expert Questions):');
  console.log('    amara.osei@example.com / Password123!');
  console.log('    fatima.diallo@example.com / Password123!');
  console.log('    kezia.mwangi@example.com / Password123!');
  console.log('    ngozi.eze@example.com / Password123!');
  console.log('\n⭐  Experts:');
  console.log('    dr.adaeze.obi@example.com / Expert@Herizone2026!');
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
