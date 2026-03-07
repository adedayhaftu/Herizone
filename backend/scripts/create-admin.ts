/**
 * Creates (or upgrades) an admin account in the database.
 * Usage:  npx ts-node scripts/create-admin.ts
 *
 * Set ADMIN_EMAIL / ADMIN_PASSWORD / ADMIN_NAME env vars to customise,
 * or edit the defaults below.
 */

import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const prisma = new PrismaClient();

const EMAIL    = process.env.ADMIN_EMAIL    ?? 'admin@herizone.com';
const PASSWORD = process.env.ADMIN_PASSWORD ?? 'Admin@Herizone2026!';
const NAME     = process.env.ADMIN_NAME     ?? 'Herizone Admin';

async function main() {
  console.log(`\n🔧  Creating / updating admin account: ${EMAIL}\n`);

  const passwordHash = await bcrypt.hash(PASSWORD, 12);

  const user = await prisma.user.upsert({
    where: { email: EMAIL },
    update: {
      passwordHash,
      name: NAME,
      isAdmin: true,
    },
    create: {
      email: EMAIL,
      name: NAME,
      passwordHash,
      isAdmin: true,
    },
  });

  console.log('✅  Admin account ready:');
  console.log(`    ID      : ${user.id}`);
  console.log(`    Email   : ${user.email}`);
  console.log(`    Name    : ${user.name}`);
  console.log(`    isAdmin : ${user.isAdmin}`);
  console.log('\n⚠️   Change the password after first login!\n');
}

main()
  .catch((e) => {
    console.error('❌  Error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
