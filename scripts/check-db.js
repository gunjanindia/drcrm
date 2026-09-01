/* eslint-disable @typescript-eslint/no-require-imports */
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function checkDatabase() {
  console.log('🔍 Checking Live Neon PostgreSQL Database...');
  
  const [tenants, users, clients, leads, tasks, services, packages] = await Promise.all([
    prisma.tenant.findMany(),
    prisma.user.findMany(),
    prisma.client.findMany(),
    prisma.lead.findMany(),
    prisma.task.findMany(),
    prisma.service.findMany(),
    prisma.package.findMany(),
  ]);

  console.log('\n📊 LIVE NEON DATABASE ROW COUNTS:');
  console.log(`- Tenants:  ${tenants.length}`);
  console.log(`- Users:    ${users.length} (${users.map(u => u.name).join(', ')})`);
  console.log(`- Clients:  ${clients.length} (${clients.map(c => c.businessName).join(', ')})`);
  console.log(`- Leads:    ${leads.length}`);
  console.log(`- Tasks:    ${tasks.length}`);
  console.log(`- Services: ${services.length}`);
  console.log(`- Packages: ${packages.length}`);
  console.log('\n');
}

checkDatabase()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
