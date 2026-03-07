import { PrismaClient } from '@prisma/client';
import { generateEmbedding } from '../src/services/ai.service';

const prisma = new PrismaClient();

const SAMPLE_KNOWLEDGE = [
  {
    question: 'How do I manage morning sickness during pregnancy?',
    answer: 'Morning sickness is common in the first trimester. Try eating small, frequent meals, avoiding strong odors, staying hydrated, and eating crackers before getting out of bed. Ginger tea and vitamin B6 supplements may help. If severe, consult your healthcare provider.',
    sourceType: 'article',
    confidenceScore: 9,
    isVerified: true,
  },
  {
    question: 'When should I worry about my baby crying?',
    answer: 'Babies cry for many reasons - hunger, discomfort, tiredness, or need for comfort. Worry if crying is accompanied by fever over 100.4°F, difficulty breathing, unusual lethargy, rash, or if the cry sounds different than usual. Trust your instincts and contact your pediatrician if concerned.',
    sourceType: 'expert_answer',
    confidenceScore: 10,
    isVerified: true,
  },
  {
    question: 'What are signs of postpartum depression?',
    answer: 'Signs include persistent sadness, loss of interest in activities, changes in appetite or sleep, difficulty bonding with baby, feelings of worthlessness, anxiety, or thoughts of harming yourself or baby. PPD is treatable - seek help from your healthcare provider immediately if experiencing these symptoms.',
    sourceType: 'expert_answer',
    confidenceScore: 10,
    isVerified: true,
  },
  {
    question: 'How can I improve breastfeeding latch?',
    answer: 'Ensure baby\'s mouth is wide open, aim nipple toward roof of baby\'s mouth, bring baby to breast (not breast to baby), and ensure baby takes in both nipple and areola. Different positions work for different moms - try cradle, cross-cradle, football, or side-lying. A lactation consultant can provide personalized help.',
    sourceType: 'expert_answer',
    confidenceScore: 9,
    isVerified: true,
  },
  {
    question: 'What exercises are safe during pregnancy?',
    answer: 'Generally safe exercises include walking, swimming, prenatal yoga, stationary cycling, and modified strength training. Avoid contact sports, activities with fall risk, hot yoga, and exercises lying flat on your back after first trimester. Always consult your healthcare provider before starting any exercise program.',
    sourceType: 'article',
    confidenceScore: 8,
    isVerified: true,
  },
  {
    question: 'How much sleep does a newborn need?',
    answer: 'Newborns sleep 14-17 hours per day, but in short 2-4 hour periods. They wake frequently to feed. By 3-6 months, babies may sleep 4-6 hour stretches at night. Every baby is different - focus on safe sleep practices and responding to your baby\'s cues.',
    sourceType: 'expert_answer',
    confidenceScore: 9,
    isVerified: true,
  },
  {
    question: 'What foods should I avoid while pregnant?',
    answer: 'Avoid raw or undercooked meat, fish high in mercury (shark, swordfish), raw eggs, unpasteurized dairy, deli meats unless heated, raw sprouts, and unwashed produce. Limit caffeine to 200mg daily. Alcohol should be completely avoided during pregnancy.',
    sourceType: 'article',
    confidenceScore: 10,
    isVerified: true,
  },
  {
    question: 'How do I know if my baby is getting enough breast milk?',
    answer: 'Signs include 6+ wet diapers daily after first week, steady weight gain, baby seems satisfied after feeding, and you can hear swallowing during feeding. Baby should regain birth weight by 2 weeks. Regular pediatrician check-ups will monitor growth.',
    sourceType: 'expert_answer',
    confidenceScore: 9,
    isVerified: true,
  },
  {
    question: 'When should I take a pregnancy test?',
    answer: 'For most accurate results, wait until the first day of your missed period. Some sensitive tests can detect pregnancy a few days before. Testing with first morning urine gives most concentrated results. If negative but period doesn\'t come, retest in a few days.',
    sourceType: 'article',
    confidenceScore: 8,
    isVerified: true,
  },
  {
    question: 'How can I cope with pregnancy fatigue?',
    answer: 'Pregnancy fatigue is normal, especially in first and third trimesters. Rest when possible, maintain regular sleep schedule, eat balanced meals with protein, stay hydrated, do gentle exercise, and ask for help with tasks. Naps can be beneficial. Talk to your provider if fatigue is severe.',
    sourceType: 'community_post',
    confidenceScore: 7,
    isVerified: false,
  },
];

async function seedKnowledge() {
  console.log('🌱 Seeding knowledge base with sample data...\n');

  let successCount = 0;
  let errorCount = 0;

  for (const knowledge of SAMPLE_KNOWLEDGE) {
    try {
      console.log(`Adding: "${knowledge.question.substring(0, 50)}..."`);
      
      // Generate embedding
      const combinedText = `${knowledge.question} ${knowledge.answer}`;
      const embedding = await generateEmbedding(combinedText);
      const embeddingStr = `[${embedding.join(',')}]`;

      // Insert with raw SQL to handle vector type
      await prisma.$executeRawUnsafe(`
        INSERT INTO knowledge_base (
          id,
          question,
          answer,
          source_type,
          confidence_score,
          is_verified,
          embedding
        ) VALUES (
          gen_random_uuid(),
          $1,
          $2,
          $3,
          $4,
          $5,
          $6::vector
        )
      `, 
        knowledge.question,
        knowledge.answer,
        knowledge.sourceType,
        knowledge.confidenceScore,
        knowledge.isVerified,
        embeddingStr
      );

      successCount++;
      console.log('  ✅ Added successfully\n');
    } catch (error) {
      errorCount++;
      console.error(`  ❌ Error: ${error}\n`);
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Successfully added: ${successCount}`);
  console.log(`   ❌ Failed: ${errorCount}`);
  console.log(`   📚 Total knowledge entries: ${await prisma.knowledgeBase.count()}\n`);
}

async function main() {
  console.log('🚀 Knowledge Base Seeder\n');
  console.log('This script will add sample Q&A pairs to the knowledge base.');
  console.log('Each entry will have an embedding vector for semantic search.\n');
  
  try {
    // Check if pgvector extension is enabled
    const result = await prisma.$queryRaw`
      SELECT * FROM pg_extension WHERE extname = 'vector'
    `;
    
    if (!result || (result as any[]).length === 0) {
      console.error('❌ pgvector extension not found!');
      console.error('Please run: CREATE EXTENSION vector; in your database\n');
      process.exit(1);
    }

    console.log('✅ pgvector extension detected\n');

    // Check existing knowledge count
    const existingCount = await prisma.knowledgeBase.count();
    console.log(`Current knowledge base entries: ${existingCount}\n`);

    if (existingCount > 0) {
      console.log('⚠️  Warning: Knowledge base already contains entries.');
      console.log('This script will add new entries (no duplicates will be removed).\n');
    }

    await seedKnowledge();

    console.log('✨ Seeding complete!\n');
    console.log('You can now test the chatbot with questions like:');
    console.log('  - "How do I manage morning sickness?"');
    console.log('  - "When should I worry about my baby crying?"');
    console.log('  - "Tips for breastfeeding difficulties"\n');

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
