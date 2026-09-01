/* eslint-disable @typescript-eslint/no-require-imports */
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🚀 Starting Neon Cloud Database Seeding...');
  console.log(`📡 Connecting to: ${process.env.DATABASE_URL?.split('@')[1] || 'PostgreSQL'}`);

  // 1. Create Tenant
  const tenant = await prisma.tenant.upsert({
    where: { domain: 'digitalranchi.in' },
    update: {},
    create: {
      id: 'tenant_main',
      name: 'Digital Ranchi',
      domain: 'digitalranchi.in',
      isActive: true,
    },
  });
  console.log(`✅ Tenant verified: ${tenant.name} (${tenant.id})`);

  // Default hashed password for demo users
  const defaultPasswordHash = await bcrypt.hash('Password@123', 12);

  // 2. Create Staff & Client Users
  const usersData = [
    {
      id: 'usr_super_admin',
      tenantId: tenant.id,
      name: 'Gunjan Kumar',
      email: 'gunjan.india@gmail.com',
      phone: '+91 7004700318',
      role: 'SUPER_ADMIN',
      department: 'Executive',
      passwordHash: defaultPasswordHash,
    },
    {
      id: 'usr_biz_admin',
      tenantId: tenant.id,
      name: 'Pooja Verma',
      email: 'pooja@digitalranchi.in',
      phone: '+91 9876543211',
      role: 'BUSINESS_ADMIN',
      department: 'Operations',
      passwordHash: defaultPasswordHash,
    },
    {
      id: 'usr_sales_mgr',
      tenantId: tenant.id,
      name: 'Rahul Kumar',
      email: 'rahul.k@digitalranchi.in',
      phone: '+91 9876543212',
      role: 'SALES_MANAGER',
      department: 'Sales',
      passwordHash: defaultPasswordHash,
    },
    {
      id: 'usr_sales_exec1',
      tenantId: tenant.id,
      name: 'Amit Singh',
      email: 'amit.s@digitalranchi.in',
      phone: '+91 9876543213',
      role: 'SALES_EXECUTIVE',
      department: 'Sales',
      passwordHash: defaultPasswordHash,
    },
    {
      id: 'usr_ops_mgr',
      tenantId: tenant.id,
      name: 'Siddharth Roy',
      email: 'siddharth@digitalranchi.in',
      phone: '+91 9876543214',
      role: 'OPERATIONS_MANAGER',
      department: 'Delivery',
      passwordHash: defaultPasswordHash,
    },
    {
      id: 'usr_acct_mgr1',
      tenantId: tenant.id,
      name: 'Neha Pandey',
      email: 'neha.p@digitalranchi.in',
      phone: '+91 9876543215',
      role: 'ACCOUNT_MANAGER',
      department: 'Client Success',
      passwordHash: defaultPasswordHash,
    },
    {
      id: 'usr_acct_mgr2',
      tenantId: tenant.id,
      name: 'Vikram Mehta',
      email: 'vikram.m@digitalranchi.in',
      phone: '+91 9876543216',
      role: 'ACCOUNT_MANAGER',
      department: 'Client Success',
      passwordHash: defaultPasswordHash,
    },
    {
      id: 'usr_del_exec1',
      tenantId: tenant.id,
      name: 'Rohan Gupta',
      email: 'rohan.g@digitalranchi.in',
      phone: '+91 9876543217',
      role: 'DELIVERY_EXECUTIVE',
      department: 'Design & GBP',
      passwordHash: defaultPasswordHash,
    },
    {
      id: 'usr_del_exec2',
      tenantId: tenant.id,
      name: 'Anjali Kumari',
      email: 'anjali.k@digitalranchi.in',
      phone: '+91 9876543218',
      role: 'DELIVERY_EXECUTIVE',
      department: 'Content & SEO',
      passwordHash: defaultPasswordHash,
    },
    {
      id: 'usr_finance',
      tenantId: tenant.id,
      name: 'Manish Tiwari',
      email: 'manish.t@digitalranchi.in',
      phone: '+91 9876543219',
      role: 'FINANCE',
      department: 'Finance',
      passwordHash: defaultPasswordHash,
    },
  ];

  for (const u of usersData) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {
        name: u.name,
        phone: u.phone,
        role: u.role,
        department: u.department,
        passwordHash: u.passwordHash,
      },
      create: u,
    });
  }
  console.log(`✅ Seeded ${usersData.length} Users (Staff)`);

  // 3. Create Services
  const servicesData = [
    {
      id: 'srv_gbp_setup',
      tenantId: tenant.id,
      name: 'Google Business Profile Setup & Verification',
      slug: 'gbp-setup',
      description: 'Complete GBP creation, phone/postcard verification, primary and secondary category optimization.',
      category: 'GBP',
      basePrice: 499.0,
      billingType: 'ONE_TIME',
      defaultSlaHours: 48,
      deliverables: ['Claimed & Verified Google Maps Listing', 'Primary Category & Subcategory Setup', 'Geocoded Business Pin'],
      isActive: true,
    },
    {
      id: 'srv_review_qr',
      tenantId: tenant.id,
      name: '5-Star Review Growth Engine & Acrylic QR Stand',
      slug: 'review-qr-stand',
      description: 'Physical acrylic QR stand for reception desk + direct 5-star Google review shortlink routing.',
      category: 'REVIEWS',
      basePrice: 499.0,
      billingType: 'ONE_TIME',
      defaultSlaHours: 72,
      deliverables: ['Physical Acrylic QR Standee Design', 'Custom Shortlink & WhatsApp review trigger template', 'Review collection staff training guide'],
      isActive: true,
    },
    {
      id: 'srv_local_seo',
      tenantId: tenant.id,
      name: 'Local Citation & Maps 3-Pack SEO Optimization',
      slug: 'local-3pack-seo',
      description: 'Monthly local citation building, geotagged photo updates, and keyword optimization to rank in top 3 on Google Maps.',
      category: 'SEO',
      basePrice: 999.0,
      billingType: 'MONTHLY',
      defaultSlaHours: 120,
      deliverables: ['Top 3 Local Ranking in 5km radius', '10 Local Citations/Month', 'Geotagged Photo Uploads (4/mo)', 'Monthly Rank Track Report'],
      isActive: true,
    },
    {
      id: 'srv_landing_page',
      tenantId: tenant.id,
      name: 'High-Converting 1-Page Business Website',
      slug: '1page-website',
      description: 'Ultra-fast Next.js mobile landing page with WhatsApp click-to-chat, booking button, and local schema markup.',
      category: 'WEBSITE',
      basePrice: 1999.0,
      billingType: 'ONE_TIME',
      defaultSlaHours: 96,
      deliverables: ['Mobile-Optimized Landing Page', 'Direct WhatsApp Click-to-Chat', 'Local Business Schema JSON-LD', 'Google Analytics Integration'],
      isActive: true,
    },
    {
      id: 'srv_social_12',
      tenantId: tenant.id,
      name: '12 Monthly Social Media Creatives & Local Offers',
      slug: 'social-creatives-12',
      description: 'Custom festival offers, doctor/business branding posters, and awareness graphics designed and scheduled.',
      category: 'SOCIAL',
      basePrice: 999.0,
      billingType: 'MONTHLY',
      defaultSlaHours: 168,
      deliverables: ['12 High-Res Branded Graphics (Feed + Stories)', 'Festival & Promotional Offer Banners', 'Client Approval Portal Review'],
      isActive: true,
    },
  ];

  for (const s of servicesData) {
    await prisma.service.upsert({
      where: { id: s.id },
      update: s,
      create: s,
    });
  }
  console.log(`✅ Seeded ${servicesData.length} Core Services`);

  // 4. Create Packages
  const packagesData = [
    {
      id: 'pkg_starter_499',
      tenantId: tenant.id,
      name: 'Starter Boost',
      code: 'STARTER_BOOST',
      tagline: 'Get Found on Google Maps in 48 Hours',
      price: 499.0,
      billingFrequency: 'ONE_TIME',
      isPopular: false,
      serviceIds: ['srv_gbp_setup', 'srv_review_qr'],
      features: [
        'Google Business Profile Setup & Verification',
        'Physical Acrylic 5-Star Review QR Stand (Shipped to Store)',
        'Direct WhatsApp Click-to-Chat Integration',
        'Local Search Category & Hours Optimization',
        '1-Month Basic Presence Support',
      ],
      isActive: true,
    },
    {
      id: 'pkg_growth_999',
      tenantId: tenant.id,
      name: 'Growth Accelerate',
      code: 'GROWTH_ACCELERATE',
      tagline: 'Rank in Top 3 Local Results & Dominate Inquiries',
      price: 999.0,
      billingFrequency: 'MONTHLY',
      isPopular: true,
      serviceIds: ['srv_gbp_setup', 'srv_review_qr', 'srv_local_seo', 'srv_social_12'],
      features: [
        'Everything in Starter Boost',
        'Guaranteed Top 3 Google Maps Ranking within 5km Radius',
        '12 Custom Social Media Creatives & Festival Banners/Month',
        'Automated 5-Star Review Booster Engine',
        'Monthly ROI & Call Insights Report',
        'Dedicated Ranchi Account Manager & WhatsApp Support',
      ],
      isActive: true,
    },
    {
      id: 'pkg_scale_1999',
      tenantId: tenant.id,
      name: 'Scale Dominance',
      code: 'SCALE_DOMINANCE',
      tagline: 'Complete Digital Transformation & Market Leadership',
      price: 1999.0,
      billingFrequency: 'MONTHLY',
      isPopular: false,
      serviceIds: ['srv_gbp_setup', 'srv_review_qr', 'srv_local_seo', 'srv_social_12', 'srv_landing_page'],
      features: [
        'Everything in Growth Accelerate',
        'High-Converting 1-Page Mini Website with Instant Booking',
        'Targeted Google & Meta Local Ad Campaign Management',
        'Multi-Keyword Top-Rank Defense Strategy',
        'Review Shield & Negative Review Resolution Engine',
        'Priority 24/7 SLA & Weekly Strategy Calls',
      ],
      isActive: true,
    },
  ];

  for (const p of packagesData) {
    await prisma.package.upsert({
      where: { id: p.id },
      update: p,
      create: p,
    });
  }
  console.log(`✅ Seeded ${packagesData.length} Growth Packages`);

  // 5. Create Initial Active Client (Ranchi Dental Care)
  const client = await prisma.client.upsert({
    where: { id: 'cli_ranchi_dental' },
    update: {},
    create: {
      id: 'cli_ranchi_dental',
      tenantId: tenant.id,
      businessName: 'Ranchi Dental Care & Implant Center',
      category: 'Dental Clinic & Healthcare',
      phone: '+91 9431109876',
      whatsapp: '+91 9431109876',
      email: 'client@ranchidental.com',
      address: 'Circular Road, Lalpur, Ranchi',
      city: 'Ranchi',
      state: 'Jharkhand',
      pincode: '834001',
      assignedManagerId: 'usr_acct_mgr1',
      packageId: 'pkg_growth_999',
      packageName: 'Growth Accelerate',
      healthScore: 'GREEN',
      monthlyRevenue: 999.0,
      activeSince: new Date('2026-02-01T10:00:00Z'),
      renewalDate: new Date('2026-09-05T00:00:00Z'),
      reviewCount: 142,
      averageRating: 4.9,
      gbpScore: 94,
      status: 'ACTIVE',
      createdAt: new Date('2026-02-01T10:00:00Z'),
    },
  });
  console.log(`✅ Seeded Initial Client: ${client.businessName}`);

  // Create Client User Account
  await prisma.user.upsert({
    where: { email: 'client@ranchidental.com' },
    update: {
      clientId: client.id,
    },
    create: {
      id: 'usr_client_demo',
      tenantId: tenant.id,
      name: 'Dr. Alok Srivastava',
      email: 'client@ranchidental.com',
      phone: '+91 9431109876',
      role: 'CLIENT',
      department: 'Client',
      clientId: client.id,
      passwordHash: defaultPasswordHash,
    },
  });

  // 6. Create Initial Project & Tasks
  const project = await prisma.project.upsert({
    where: { id: 'prj_onboarding_dental' },
    update: {},
    create: {
      id: 'prj_onboarding_dental',
      tenantId: tenant.id,
      clientId: client.id,
      name: '7-Day Growth Kickoff & Optimization',
      projectType: 'ONBOARDING',
      status: 'IN_PROGRESS',
      progressPercent: 70,
      startDate: new Date('2026-02-01T10:00:00Z'),
      dueDate: new Date('2026-02-08T10:00:00Z'),
    },
  });

  const tasksData = [
    {
      id: 'tsk_001',
      tenantId: tenant.id,
      clientId: client.id,
      projectId: project.id,
      title: 'Audit Google Maps Coordinates & Business Categories',
      description: 'Verify latitude/longitude pin, correct subcategory, and ensure NAP matches official business docs.',
      priority: 'HIGH',
      status: 'COMPLETED',
      assignedToId: 'usr_del_exec1',
      slaDeadline: new Date('2026-02-02T18:00:00Z'),
      dueDate: new Date('2026-02-02T18:00:00Z'),
      completedAt: new Date('2026-02-02T16:30:00Z'),
    },
    {
      id: 'tsk_002',
      tenantId: tenant.id,
      clientId: client.id,
      projectId: project.id,
      title: 'Design Acrylic 5-Star Review QR Stand & Send for Print',
      description: 'Generate high-res vector acrylic stand with client logo, 5-star Google review shortlink QR code.',
      priority: 'URGENT',
      status: 'COMPLETED',
      assignedToId: 'usr_del_exec1',
      slaDeadline: new Date('2026-02-03T18:00:00Z'),
      dueDate: new Date('2026-02-03T18:00:00Z'),
      completedAt: new Date('2026-02-03T14:15:00Z'),
    },
    {
      id: 'tsk_003',
      tenantId: tenant.id,
      clientId: client.id,
      projectId: project.id,
      title: 'Publish 3 Geotagged Clinic Photos & Doctor Profile',
      description: 'Geotag high-res reception and surgery room photos and upload directly to GBP Photos tab.',
      priority: 'MEDIUM',
      status: 'IN_PROGRESS',
      assignedToId: 'usr_del_exec2',
      slaDeadline: new Date('2026-09-04T18:00:00Z'),
      dueDate: new Date('2026-09-04T18:00:00Z'),
    },
    {
      id: 'tsk_004',
      tenantId: tenant.id,
      clientId: client.id,
      projectId: project.id,
      title: 'Design 12 Monthly Dental Care Creatives for Approval',
      description: 'Prepare monthly creative pack including oral hygiene tips, cosmetic dentistry promo, and festival banners.',
      priority: 'HIGH',
      status: 'CLIENT_APPROVAL',
      assignedToId: 'usr_del_exec2',
      slaDeadline: new Date('2026-09-05T18:00:00Z'),
      dueDate: new Date('2026-09-05T18:00:00Z'),
    },
  ];

  for (const t of tasksData) {
    await prisma.task.upsert({
      where: { id: t.id },
      update: t,
      create: t,
    });
  }
  console.log(`✅ Seeded ${tasksData.length} Operational Delivery Tasks`);

  // 7. Create Tax Configuration
  await prisma.taxConfiguration.upsert({
    where: { id: 'tax_cfg_main' },
    update: {},
    create: {
      id: 'tax_cfg_main',
      tenantId: tenant.id,
      isGstRegistered: false,
      gstin: null,
      defaultTaxMode: 'NON_GST',
      cgstRatePercent: 0.0,
      sgstRatePercent: 0.0,
      igstRatePercent: 0.0,
      defaultSacCode: '998313',
      invoicePrefix: 'DR/BOS/',
      termsAndConditions: '1. All payments due within 7 days. 2. Non-GST Bill of Supply issued in accordance with Rule 49 of CGST Rules.',
    },
  });
  console.log('✅ Seeded Tax Configuration (Non-GST / GST Ready)');

  console.log('\n🎉 ALL NEON DATABASE TABLES AND ROWS ARE POPULATED SUCCESSFULLY!\n');
}

main()
  .catch((e) => {
    console.error('❌ Database seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
