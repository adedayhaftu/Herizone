import app from './app';
import { prisma } from './lib/prisma';

const PORT = parseInt(process.env.PORT || '4000', 10);

async function bootstrap() {
  // Verify database connection before accepting traffic
  try {
    await prisma.$connect();
    const dbUrl = process.env.DATABASE_URL ?? '';
    // Extract the host portion for display (hide credentials)
    const dbHost = dbUrl.replace(/\/\/[^@]+@/, '//***@').split('?')[0];
    console.log(`🗄  Database connected → ${dbHost}`);
  } catch (err) {
    console.error('❌ Database connection failed:', err);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`🚀 Herizone API running on http://localhost:${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

bootstrap();

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  console.log('\n🛑 Server stopped, database disconnected');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
