/* eslint-disable @typescript-eslint/no-require-imports */
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function testLead() {
  console.log('🧪 Testing Prisma Lead Creation on Neon...');

  const lead = await prisma.lead.create({
    data: {
      tenantId: 'tenant_main',
      businessName: 'Sharma Supermarket',
      contactName: 'Ramesh Sharma',
      phone: '+91 9835012345',
      whatsapp: '+91 9835012345',
      email: 'ramesh@sharmasupermarket.in',
      category: 'Retail & Supermarket',
      city: 'Ranchi',
      state: 'Jharkhand',
      leadSource: 'CRM Direct Ingestion',
      estimatedValue: 999.0,
      leadScore: 85,
      status: 'NEW',
      notes: 'Test lead creation verification',
    },
  });

  console.log('✅ Lead created successfully in Neon:', lead.id, lead.businessName);

  const allLeads = await prisma.lead.findMany();
  console.log(`📋 Total leads in Neon now: ${allLeads.length}`);
  allLeads.forEach(l => console.log(` - [${l.id}] ${l.businessName} (${l.status})`));
}

testLead()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
