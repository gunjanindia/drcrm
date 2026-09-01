/* eslint-disable @typescript-eslint/no-require-imports */
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function updateAdmin() {
  console.log('🔄 Updating Super Admin in Neon Cloud Database...');
  
  const defaultPasswordHash = await bcrypt.hash('Password@123', 12);

  const updatedAdmin = await prisma.user.upsert({
    where: { id: 'usr_super_admin' },
    update: {
      name: 'Gunjan Kumar',
      email: 'gunjan.india@gmail.com',
      phone: '+91 7004700318',
      role: 'SUPER_ADMIN',
      department: 'Executive',
      passwordHash: defaultPasswordHash,
    },
    create: {
      id: 'usr_super_admin',
      tenantId: 'tenant_main',
      name: 'Gunjan Kumar',
      email: 'gunjan.india@gmail.com',
      phone: '+91 7004700318',
      role: 'SUPER_ADMIN',
      department: 'Executive',
      passwordHash: defaultPasswordHash,
    },
  });

  console.log('✅ Super Admin updated successfully in Neon:');
  console.log(` - ID:    ${updatedAdmin.id}`);
  console.log(` - Name:  ${updatedAdmin.name}`);
  console.log(` - Email: ${updatedAdmin.email}`);
  console.log(` - Phone: ${updatedAdmin.phone}`);
  console.log(` - Role:  ${updatedAdmin.role}`);
}

updateAdmin()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
