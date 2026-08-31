import {
  User,
  Lead,
  Client,
  Service,
  Package,
  Project,
  Task,
  Invoice,
  PaymentRecord,
  Ticket,
  GbpProfile,
  RecurringTaskRule,
  DeliverableItem,
  TaxConfiguration,
  TimelineActivity,
} from '@/types';
import { initialTaxConfig, globalTaxEngine } from './tax-engine';
import { generateId } from './utils';

export class AppStore {
  public users: User[] = [];
  public leads: Lead[] = [];
  public clients: Client[] = [];
  public services: Service[] = [];
  public packages: Package[] = [];
  public projects: Project[] = [];
  public tasks: Task[] = [];
  public recurringRules: RecurringTaskRule[] = [];
  public deliverables: DeliverableItem[] = [];
  public tickets: Ticket[] = [];
  public gbpProfiles: GbpProfile[] = [];
  public invoices: Invoice[] = [];
  public payments: PaymentRecord[] = [];
  public taxConfig: TaxConfiguration = { ...initialTaxConfig };
  public activities: TimelineActivity[] = [];
  public leadSources: string[] = [
    'Website Free Audit',
    'Website Direct Checkout',
    'WhatsApp Direct',
    'Google Search',
    'Field Sales',
    'Instagram Ads',
    'Referral',
    'CRM Direct Ingestion',
  ];

  constructor() {
    this.seedAll();
  }

  private seedAll() {
    // 1. Employees / Users (10 users across roles)
    this.users = [
      {
        id: 'usr_super_admin',
        tenantId: 'tenant_main',
        name: 'Gunjan Sharma',
        email: 'gunjan@digitalranchi.in',
        phone: '+91 9876543210',
        role: 'SUPER_ADMIN',
        department: 'Executive',
        createdAt: '2026-01-01T10:00:00Z',
      },
      {
        id: 'usr_biz_admin',
        tenantId: 'tenant_main',
        name: 'Pooja Verma',
        email: 'pooja@digitalranchi.in',
        phone: '+91 9876543211',
        role: 'BUSINESS_ADMIN',
        department: 'Operations',
        createdAt: '2026-01-05T10:00:00Z',
      },
      {
        id: 'usr_sales_mgr',
        tenantId: 'tenant_main',
        name: 'Rahul Kumar',
        email: 'rahul.k@digitalranchi.in',
        phone: '+91 9876543212',
        role: 'SALES_MANAGER',
        department: 'Sales',
        createdAt: '2026-01-10T10:00:00Z',
      },
      {
        id: 'usr_sales_exec1',
        tenantId: 'tenant_main',
        name: 'Amit Singh',
        email: 'amit.s@digitalranchi.in',
        phone: '+91 9876543213',
        role: 'SALES_EXECUTIVE',
        department: 'Sales',
        createdAt: '2026-01-15T10:00:00Z',
      },
      {
        id: 'usr_ops_mgr',
        tenantId: 'tenant_main',
        name: 'Siddharth Roy',
        email: 'siddharth@digitalranchi.in',
        phone: '+91 9876543214',
        role: 'OPERATIONS_MANAGER',
        department: 'Delivery',
        createdAt: '2026-01-15T10:00:00Z',
      },
      {
        id: 'usr_acct_mgr1',
        tenantId: 'tenant_main',
        name: 'Neha Pandey',
        email: 'neha.p@digitalranchi.in',
        phone: '+91 9876543215',
        role: 'ACCOUNT_MANAGER',
        department: 'Client Success',
        createdAt: '2026-01-20T10:00:00Z',
      },
      {
        id: 'usr_acct_mgr2',
        tenantId: 'tenant_main',
        name: 'Vikram Mehta',
        email: 'vikram.m@digitalranchi.in',
        phone: '+91 9876543216',
        role: 'ACCOUNT_MANAGER',
        department: 'Client Success',
        createdAt: '2026-01-20T10:00:00Z',
      },
      {
        id: 'usr_del_exec1',
        tenantId: 'tenant_main',
        name: 'Rohan Gupta',
        email: 'rohan.g@digitalranchi.in',
        phone: '+91 9876543217',
        role: 'DELIVERY_EXECUTIVE',
        department: 'Design & GBP',
        createdAt: '2026-02-01T10:00:00Z',
      },
      {
        id: 'usr_del_exec2',
        tenantId: 'tenant_main',
        name: 'Anjali Kumari',
        email: 'anjali.k@digitalranchi.in',
        phone: '+91 9876543218',
        role: 'DELIVERY_EXECUTIVE',
        department: 'Content & SEO',
        createdAt: '2026-02-01T10:00:00Z',
      },
      {
        id: 'usr_finance',
        tenantId: 'tenant_main',
        name: 'Manish Tiwari',
        email: 'manish.t@digitalranchi.in',
        phone: '+91 9876543219',
        role: 'FINANCE',
        department: 'Finance',
        createdAt: '2026-01-10T10:00:00Z',
      },
      {
        id: 'usr_client_demo',
        tenantId: 'tenant_main',
        name: 'Dr. Alok Srivastava',
        email: 'client@ranchidental.com',
        phone: '+91 9431109876',
        role: 'CLIENT',
        clientId: 'cli_1',
        department: 'Client',
        createdAt: '2026-02-10T10:00:00Z',
      },
    ];

    // 2. Services (10 core local growth services)
    this.services = [
      {
        id: 'srv_gbp_setup',
        tenantId: 'tenant_main',
        name: 'Google Business Profile Verification & Setup',
        slug: 'gbp-setup',
        description: 'Complete claim, verification, address geotagging, category mapping, and business hours setup.',
        basePrice: 499,
        billingType: 'ONE_TIME',
        deliverables: ['Verified GBP Listing', 'Category Optimization', 'Keyword Description'],
        defaultSlaHours: 48,
        category: 'GBP',
        isActive: true,
      },
      {
        id: 'srv_review_qr',
        tenantId: 'tenant_main',
        name: 'Smart Review QR Stand & Reputation Kit',
        slug: 'review-qr-stand',
        description: 'Custom printable acrylic stand design with direct-to-Google review QR code and NFC link.',
        basePrice: 499,
        billingType: 'ONE_TIME',
        deliverables: ['Custom QR PDF Design', 'Direct Review Link', 'Counter Sticker Template'],
        defaultSlaHours: 24,
        category: 'REVIEWS',
        isActive: true,
      },
      {
        id: 'srv_mini_website',
        tenantId: 'tenant_main',
        name: 'High-Converting 1-Page Mini Website',
        slug: 'mini-website',
        description: 'Blazing fast mobile-optimized landing page with direct WhatsApp chat, call button, and Google Maps embed.',
        basePrice: 999,
        billingType: 'ONE_TIME',
        deliverables: ['Hosted 1-Page Site', 'WhatsApp Integration', 'SEO Meta Tags'],
        defaultSlaHours: 72,
        category: 'WEBSITE',
        isActive: true,
      },
      {
        id: 'srv_gbp_retainer',
        tenantId: 'tenant_main',
        name: 'Monthly GBP Maintenance & Ranking Booster',
        slug: 'gbp-retainer',
        description: 'Weekly geotagged photo uploads, weekly GBP promotional posts, and Q&A management.',
        basePrice: 1499,
        billingType: 'MONTHLY',
        deliverables: ['4 Weekly GBP Posts', '10 Geotagged Photos', 'Q&A Optimization'],
        defaultSlaHours: 168,
        category: 'GBP',
        isActive: true,
      },
      {
        id: 'srv_review_management',
        tenantId: 'tenant_main',
        name: 'Active Review Monitoring & AI Responses',
        slug: 'review-management',
        description: 'Daily review tracking and prompt professional responses to positive and negative reviews.',
        basePrice: 799,
        billingType: 'MONTHLY',
        deliverables: ['100% Review Responses', 'Negative Review Escalation', 'Monthly Sentiment Report'],
        defaultSlaHours: 24,
        category: 'REVIEWS',
        isActive: true,
      },
      {
        id: 'srv_local_seo',
        tenantId: 'tenant_main',
        name: 'Local Citation & Map Pack SEO',
        slug: 'local-seo',
        description: 'High-authority local business directory citations, NAP consistency check, and competitor keyword tracking.',
        basePrice: 1299,
        billingType: 'MONTHLY',
        deliverables: ['15 Local Citations', 'Keyword Rank Tracker', 'NAP Audit'],
        defaultSlaHours: 120,
        category: 'SEO',
        isActive: true,
      },
      {
        id: 'srv_social_content',
        tenantId: 'tenant_main',
        name: 'Social Media Creatives & Festival Posts',
        slug: 'social-content',
        description: 'Branded festive graphics, special offer banners, and Instagram/Facebook feed creatives.',
        basePrice: 999,
        billingType: 'MONTHLY',
        deliverables: ['8 Branded Creatives', 'Captions & Hashtags', 'Client Approval Workflow'],
        defaultSlaHours: 72,
        category: 'SOCIAL',
        isActive: true,
      },
      {
        id: 'srv_whatsapp_growth',
        tenantId: 'tenant_main',
        name: 'WhatsApp Business Growth Automation',
        slug: 'whatsapp-automation',
        description: 'Automated greeting catalog, quick replies, and broadcast follow-up templates.',
        basePrice: 699,
        billingType: 'ONE_TIME',
        deliverables: ['Catalog Setup', 'Auto-Reply Rules', 'QR Code Badge'],
        defaultSlaHours: 48,
        category: 'SOCIAL',
        isActive: true,
      },
      {
        id: 'srv_digital_audit',
        tenantId: 'tenant_main',
        name: 'Comprehensive 360° Digital Audit Report',
        slug: 'digital-audit',
        description: 'Detailed competitive analysis, local map pack ranking report, and 30-day growth action plan.',
        basePrice: 299,
        billingType: 'ONE_TIME',
        deliverables: ['PDF Audit Report', 'Competitor Comparison', 'Keyword Opportunities'],
        defaultSlaHours: 24,
        category: 'AUDIT',
        isActive: true,
      },
      {
        id: 'srv_website_amc',
        tenantId: 'tenant_main',
        name: 'Website Maintenance & SSL Retainer',
        slug: 'website-amc',
        description: 'Hosting uptime monitoring, security patches, monthly content updates, and backups.',
        basePrice: 499,
        billingType: 'MONTHLY',
        deliverables: ['99.9% Uptime Check', 'Monthly Content Updates', 'Cloud Backups'],
        defaultSlaHours: 48,
        category: 'WEBSITE',
        isActive: true,
      },
    ];

    // 3. Packages (5 configurable packages)
    this.packages = [
      {
        id: 'pkg_starter_499',
        tenantId: 'tenant_main',
        name: 'Starter Verification',
        code: 'STARTER',
        tagline: 'Ideal for new local shops getting on Google Maps for the first time.',
        price: 499,
        billingFrequency: 'ONE_TIME',
        serviceIds: ['srv_gbp_setup', 'srv_review_qr'],
        features: [
          'Google Maps Listing Verification',
          'Primary & Secondary Category Optimization',
          'Keyword-Rich Business Description',
          'Phone & WhatsApp Number Linking',
          'Printable Review QR Code Kit',
          'Instant Google Discovery',
        ],
        isPopular: false,
        isActive: true,
      },
      {
        id: 'pkg_growth_999',
        tenantId: 'tenant_main',
        name: 'Growth Kickstart',
        code: 'GROWTH',
        tagline: 'Our best-selling package for active local businesses wanting more calls and walk-ins.',
        price: 999,
        billingFrequency: 'ONE_TIME',
        serviceIds: ['srv_gbp_setup', 'srv_review_qr', 'srv_mini_website', 'srv_whatsapp_growth'],
        features: [
          'Everything in Starter',
          '20 High-Res Geotagged Photo Uploads',
          'High-Converting 1-Page Mini Website',
          'Custom Review QR Stand Acrylic Design',
          'Direct WhatsApp Chat Integration',
          'Local Business Directory Submission',
          'Priority 48-Hour Setup SLA',
        ],
        isPopular: true,
        isActive: true,
      },
      {
        id: 'pkg_premium_2499',
        tenantId: 'tenant_main',
        name: 'Premium Growth Retainer',
        code: 'PREMIUM',
        tagline: 'Complete hands-off monthly digital growth and local dominance.',
        price: 2499,
        billingFrequency: 'MONTHLY',
        serviceIds: [
          'srv_gbp_retainer',
          'srv_review_management',
          'srv_local_seo',
          'srv_social_content',
          'srv_website_amc',
        ],
        features: [
          'Complete Monthly Google Business Profile Management',
          'Weekly Geotagged Photos & Promotional Posts',
          '100% Review Monitoring & Professional Responses',
          'Local SEO Citations & Keyword Rank Tracking',
          '8 Custom Branded Social Media Creatives',
          'Mini Website Hosting & Maintenance Included',
          'Comprehensive Monthly Performance Report (PDF & Web)',
          'Dedicated Account Manager & Priority WhatsApp Support',
        ],
        isPopular: false,
        isActive: true,
      },
      {
        id: 'pkg_seo_booster_1499',
        tenantId: 'tenant_main',
        name: 'Local SEO Booster',
        code: 'LOCAL_SEO_BOOST',
        tagline: 'Focused citation building and keyword ranking acceleration.',
        price: 1499,
        billingFrequency: 'MONTHLY',
        serviceIds: ['srv_local_seo', 'srv_gbp_retainer'],
        features: [
          'Monthly Citation Building (15+ Portals)',
          'Map Pack 3-Pack Keyword Tracking',
          'Competitor NAP Gap Analysis',
          'Bi-weekly Ranking Status Alerts',
        ],
        isPopular: false,
        isActive: true,
      },
      {
        id: 'pkg_social_elite_1999',
        tenantId: 'tenant_main',
        name: 'Social & Reputation Elite',
        code: 'SOCIAL_ELITE',
        tagline: 'Active social media presence and review acceleration.',
        price: 1999,
        billingFrequency: 'MONTHLY',
        serviceIds: ['srv_social_content', 'srv_review_management', 'srv_whatsapp_growth'],
        features: [
          '12 Branded Social Creatives per Month',
          'Festival & Offer Announcements',
          'Active Google & Facebook Review Management',
          'Client Approval Workflow in Portal',
        ],
        isPopular: false,
        isActive: true,
      },
    ];

    // 4. Clients (25 realistic Indian SMBs)
    const indianBusinesses = [
      { name: 'Ranchi Dental Care & Implant Center', cat: 'Dentist / Clinic', city: 'Ranchi', phone: '+91 9431109876', pkg: 'pkg_premium_2499', rev: 2499, rating: 4.8, count: 184, gbp: 92, health: 'GREEN' as const },
      { name: 'Hotel Maple Wood & Banquet', cat: 'Hotel / Banquet', city: 'Ranchi', phone: '+91 9431109877', pkg: 'pkg_premium_2499', rev: 2499, rating: 4.5, count: 320, gbp: 88, health: 'GREEN' as const },
      { name: 'Apex Academy IIT-JEE Coaching', cat: 'Coaching / Education', city: 'Ranchi', phone: '+91 9431109878', pkg: 'pkg_growth_999', rev: 999, rating: 4.6, count: 96, gbp: 79, health: 'GREEN' as const },
      { name: 'Chinar Sweets & Restaurant', cat: 'Restaurant / Food', city: 'Ranchi', phone: '+91 9431109879', pkg: 'pkg_premium_2499', rev: 2499, rating: 4.3, count: 412, gbp: 84, health: 'YELLOW' as const },
      { name: 'Kaveri Family Salon & Bridal Studio', cat: 'Salon / Beauty', city: 'Ranchi', phone: '+91 9431109880', pkg: 'pkg_premium_2499', rev: 2499, rating: 4.7, count: 142, gbp: 90, health: 'GREEN' as const },
      { name: 'Jharkhand Eye Care Hospital', cat: 'Hospital / Eye Care', city: 'Ranchi', phone: '+91 9431109881', pkg: 'pkg_premium_2499', rev: 2499, rating: 4.9, count: 260, gbp: 95, health: 'GREEN' as const },
      { name: 'City Car Care & Detailing Studio', cat: 'Automobile Service', city: 'Ranchi', phone: '+91 9431109882', pkg: 'pkg_growth_999', rev: 999, rating: 4.4, count: 78, gbp: 76, health: 'YELLOW' as const },
      { name: 'Ranchi Furniture Mart', cat: 'Retail / Furniture', city: 'Ranchi', phone: '+91 9431109883', pkg: 'pkg_starter_499', rev: 499, rating: 4.1, count: 34, gbp: 68, health: 'YELLOW' as const },
      { name: 'Dr. Kumar Orthopedic Clinic', cat: 'Clinic / Orthopedics', city: 'Ranchi', phone: '+91 9431109884', pkg: 'pkg_premium_2499', rev: 2499, rating: 4.7, count: 198, gbp: 91, health: 'GREEN' as const },
      { name: 'Urban Glow Unisex Spa', cat: 'Spa / Wellness', city: 'Ranchi', phone: '+91 9431109885', pkg: 'pkg_growth_999', rev: 999, rating: 3.9, count: 52, gbp: 64, health: 'RED' as const },
      { name: 'Shree Krishna Jewellers', cat: 'Retail / Jewellery', city: 'Ranchi', phone: '+91 9431109886', pkg: 'pkg_premium_2499', rev: 2499, rating: 4.8, count: 310, gbp: 94, health: 'GREEN' as const },
      { name: 'Blue Diamond Cafe & Bakery', cat: 'Cafe / Bakery', city: 'Ranchi', phone: '+91 9431109887', pkg: 'pkg_growth_999', rev: 999, rating: 4.2, count: 115, gbp: 78, health: 'GREEN' as const },
      { name: 'Ranchi Diagnostics & Path Lab', cat: 'Diagnostics Lab', city: 'Ranchi', phone: '+91 9431109888', pkg: 'pkg_premium_2499', rev: 2499, rating: 4.6, count: 180, gbp: 89, health: 'GREEN' as const },
      { name: 'Speedy Wheels Bike Rental', cat: 'Travel / Rental', city: 'Ranchi', phone: '+91 9431109889', pkg: 'pkg_starter_499', rev: 499, rating: 4.0, count: 28, gbp: 62, health: 'YELLOW' as const },
      { name: 'Green Leaf Organic Groceries', cat: 'Retail / Grocery', city: 'Ranchi', phone: '+91 9431109890', pkg: 'pkg_growth_999', rev: 999, rating: 4.5, count: 64, gbp: 75, health: 'GREEN' as const },
      { name: 'Ranchi Physio & Rehab Center', cat: 'Physiotherapy', city: 'Ranchi', phone: '+91 9431109891', pkg: 'pkg_premium_2499', rev: 2499, rating: 4.9, count: 88, gbp: 93, health: 'GREEN' as const },
      { name: 'Classic Builders & Developers', cat: 'Real Estate', city: 'Ranchi', phone: '+91 9431109892', pkg: 'pkg_premium_2499', rev: 2499, rating: 4.4, count: 145, gbp: 86, health: 'GREEN' as const },
      { name: 'The Gym Zone Fitness Hub', cat: 'Fitness / Gym', city: 'Ranchi', phone: '+91 9431109893', pkg: 'pkg_growth_999', rev: 999, rating: 4.6, count: 92, gbp: 81, health: 'GREEN' as const },
      { name: 'Royal Rajputana Dhaba', cat: 'Dhaba / Highway Dining', city: 'Ranchi', phone: '+91 9431109894', pkg: 'pkg_starter_499', rev: 499, rating: 4.2, count: 210, gbp: 72, health: 'YELLOW' as const },
      { name: 'Sparkle Pet Clinic & Grooming', cat: 'Veterinary / Pets', city: 'Ranchi', phone: '+91 9431109895', pkg: 'pkg_growth_999', rev: 999, rating: 4.7, count: 74, gbp: 85, health: 'GREEN' as const },
      { name: 'Sai Ram Motors Two Wheeler Sales', cat: 'Automobile Showroom', city: 'Ranchi', phone: '+91 9431109896', pkg: 'pkg_premium_2499', rev: 2499, rating: 4.3, count: 165, gbp: 82, health: 'YELLOW' as const },
      { name: 'Modern Kids Play School', cat: 'School / Pre-school', city: 'Ranchi', phone: '+91 9431109897', pkg: 'pkg_growth_999', rev: 999, rating: 4.8, count: 58, gbp: 87, health: 'GREEN' as const },
      { name: 'Ranchi Tile & Sanitary Hub', cat: 'Hardware / Sanitary', city: 'Ranchi', phone: '+91 9431109898', pkg: 'pkg_starter_499', rev: 499, rating: 3.8, count: 22, gbp: 58, health: 'RED' as const },
      { name: 'Celebrations Event Planners', cat: 'Event Management', city: 'Ranchi', phone: '+91 9431109899', pkg: 'pkg_growth_999', rev: 999, rating: 4.5, count: 48, gbp: 80, health: 'GREEN' as const },
      { name: 'Aroma Spice Biryani House', cat: 'Restaurant / Cloud Kitchen', city: 'Ranchi', phone: '+91 9431109900', pkg: 'pkg_premium_2499', rev: 2499, rating: 4.4, count: 380, gbp: 86, health: 'GREEN' as const },
    ];

    this.clients = indianBusinesses.map((b, i) => {
      const id = `cli_${i + 1}`;
      const manager = i % 2 === 0 ? this.users[5] : this.users[6];
      const pkg = this.packages.find((p) => p.id === b.pkg) || this.packages[1];

      return {
        id,
        tenantId: 'tenant_main',
        leadId: `lead_${i + 1}`,
        businessName: b.name,
        legalName: `${b.name} LLP`,
        category: b.cat,
        phone: b.phone,
        whatsapp: b.phone,
        email: `contact@${b.name.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 15)}.in`,
        address: `${100 + i}, Main Road, Lalpur / Circular Road`,
        city: b.city,
        state: 'Jharkhand',
        pincode: '834001',
        googleMapsUrl: `https://maps.google.com/?cid=${1000000000 + i}`,
        websiteUrl: `https://${b.name.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 12)}.in`,
        assignedManagerId: manager.id,
        assignedManagerName: manager.name,
        packageId: pkg.id,
        packageName: pkg.name,
        healthScore: b.health,
        healthReason:
          b.health === 'GREEN'
            ? 'High engagement, timely invoice payments, rating above 4.5'
            : b.health === 'YELLOW'
            ? 'Renewal due in 7 days, 2 unanswered negative reviews'
            : 'Recent SLA delay and pending invoice payment for 15+ days',
        monthlyRevenue: b.rev,
        activeSince: '2026-01-10T10:00:00Z',
        renewalDate: '2026-09-10T10:00:00Z',
        reviewCount: b.count,
        averageRating: b.rating,
        gbpScore: b.gbp,
        status: 'ACTIVE',
        createdAt: '2026-01-10T10:00:00Z',
      };
    });

    // 5. Leads (50 realistic leads across pipeline stages)
    const leadCategories = ['Dentist', 'Restaurant', 'Salon', 'Gym', 'Retail', 'Clinic', 'Coaching', 'Real Estate'];
    const leadSources = ['Website Free Audit', 'WhatsApp Direct', 'Google Search', 'Field Sales', 'Instagram Ads', 'Referral'];
    const statuses: Lead['status'][] = ['NEW', 'CONTACTED', 'QUALIFIED', 'AUDIT', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST'];

    this.leads = Array.from({ length: 50 }).map((_, i) => {
      const status = statuses[i % statuses.length];
      const cat = leadCategories[i % leadCategories.length];
      const src = leadSources[i % leadSources.length];
      const assigned = this.users[3]; // Amit Singh
      const auditScore = 45 + ((i * 7) % 50);

      return {
        id: `lead_${i + 1}`,
        tenantId: 'tenant_main',
        businessName: `Ranchi ${cat} Center #${i + 1}`,
        contactName: `Rahul & Sunita Sharma (${i + 1})`,
        phone: `+91 98350${String(10000 + i).substring(1)}`,
        whatsapp: `+91 98350${String(10000 + i).substring(1)}`,
        email: `inquiry${i + 1}@ranchibiz.com`,
        category: cat,
        city: 'Ranchi',
        state: 'Jharkhand',
        googleMapsUrl: `https://maps.google.com/?q=ranchi+${cat.toLowerCase()}+${i + 1}`,
        websiteUrl: i % 3 === 0 ? `https://ranchibiz${i + 1}.in` : undefined,
        leadSource: src,
        interestedPackageId: i % 2 === 0 ? 'pkg_growth_999' : 'pkg_premium_2499',
        estimatedValue: i % 2 === 0 ? 999 : 2499,
        leadScore: auditScore,
        assignedUserId: assigned.id,
        assignedUserName: assigned.name,
        status,
        nextFollowUp: '2026-08-28T11:00:00Z',
        notes: `Inquired via ${src}. Looking to boost footfall and Google map ratings in Ranchi area.`,
        auditScore,
        createdAt: new Date(Date.now() - i * 86400000 * 1.5).toISOString(),
        updatedAt: new Date().toISOString(),
      };
    });

    // 6. Work Projects (20 projects)
    this.projects = this.clients.slice(0, 20).map((c, i) => ({
      id: `prj_${i + 1}`,
      tenantId: 'tenant_main',
      clientId: c.id,
      clientName: c.businessName,
      name: i % 3 === 0 ? '7-Day Onboarding Launch' : 'Monthly Growth Retainer - August',
      projectType: i % 3 === 0 ? 'ONBOARDING' : 'RECURRING_MONTHLY',
      status: 'IN_PROGRESS',
      progressPercent: 35 + ((i * 12) % 65),
      startDate: '2026-08-01T09:00:00Z',
      dueDate: '2026-08-31T18:00:00Z',
      createdAt: '2026-08-01T09:00:00Z',
    }));

    // 7. Tasks (100 realistic tasks)
    const taskTitles = [
      'Claim and verify Google Business Profile address',
      'Optimize primary category and secondary tags',
      'Upload 20 geotagged showroom/clinic photos',
      'Generate Review QR Stand printable PDF',
      'Setup 1-page mobile responsive mini-website',
      'Publish weekly festive offer post on GBP',
      'Respond to 5 new customer Google reviews',
      'Check local ranking for top 5 search keywords',
      'Audit NAP consistency on local directories',
      'Generate monthly PDF & Web growth report',
    ];

    const taskStatuses: Task['status'][] = [
      'BACKLOG',
      'ASSIGNED',
      'IN_PROGRESS',
      'WAITING',
      'CLIENT_APPROVAL',
      'COMPLETED',
    ];

    this.tasks = Array.from({ length: 100 }).map((_, i) => {
      const client = this.clients[i % this.clients.length];
      const project = this.projects[i % this.projects.length];
      const title = taskTitles[i % taskTitles.length];
      const status = taskStatuses[i % taskStatuses.length];
      const assigned = i % 2 === 0 ? this.users[7] : this.users[8]; // Delivery executives

      return {
        id: `tsk_${i + 1}`,
        tenantId: 'tenant_main',
        projectId: project.id,
        clientId: client.id,
        clientName: client.businessName,
        title: `${title} - ${client.businessName.split(' ')[0]}`,
        description: `Execute ${title.toLowerCase()} following Digital Ranchi delivery SOP and upload proof.`,
        status,
        priority: i % 4 === 0 ? 'HIGH' : i % 5 === 0 ? 'URGENT' : 'MEDIUM',
        assignedToId: assigned.id,
        assignedToName: assigned.name,
        slaDeadline: new Date(Date.now() + (i % 5 + 1) * 86400000).toISOString(),
        dueDate: new Date(Date.now() + (i % 7 + 1) * 86400000).toISOString(),
        isRecurring: i % 2 === 0,
        deliverableUrl: status === 'CLIENT_APPROVAL' || status === 'COMPLETED' ? 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600' : undefined,
        deliverableType: 'CREATIVE',
        approvalStatus: status === 'CLIENT_APPROVAL' ? 'PENDING' : status === 'COMPLETED' ? 'APPROVED' : undefined,
        createdAt: new Date(Date.now() - i * 3600000 * 8).toISOString(),
      };
    });

    // 8. Deliverable Approvals (Client Portal)
    this.deliverables = [
      {
        id: 'deliv_1',
        tenantId: 'tenant_main',
        clientId: 'cli_1',
        title: 'Independence Day Special Clinic Offer Creative',
        platform: 'GOOGLE_BUSINESS',
        previewUrl: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=600',
        captionText: '🦷 Celebrate Freedom with a Healthy Smile! Get 20% off on complete dental checkup & cleaning this week at Ranchi Dental Care.',
        scheduledFor: '2026-08-30T10:00:00Z',
        status: 'PENDING',
        createdAt: '2026-08-26T10:00:00Z',
      },
      {
        id: 'deliv_2',
        tenantId: 'tenant_main',
        clientId: 'cli_1',
        title: 'Review Stand NFC Acrylic Design (Proof v2)',
        platform: 'REPORT',
        previewUrl: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600',
        captionText: 'Printable counter stand with customized QR code linked directly to Google 5-Star review submission.',
        scheduledFor: '2026-08-29T12:00:00Z',
        status: 'APPROVED',
        reviewedAt: '2026-08-26T14:30:00Z',
        createdAt: '2026-08-25T11:00:00Z',
      },
      {
        id: 'deliv_3',
        tenantId: 'tenant_main',
        clientId: 'cli_2',
        title: 'Hotel Banquet Wedding Season Promo',
        platform: 'INSTAGRAM',
        previewUrl: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=600',
        captionText: 'Book your dream wedding reception at Hotel Maple Wood! Grand AC banquet hall with luxury catering.',
        scheduledFor: '2026-09-01T15:00:00Z',
        status: 'PENDING',
        createdAt: '2026-08-26T12:00:00Z',
      },
    ];

    // 9. Invoices & Payments (20 Invoices + 20 Payments)
    this.invoices = this.clients.slice(0, 20).map((c, i) => {
      const isPaid = i % 4 !== 0;
      const subtotal = c.monthlyRevenue;
      const taxCalc = globalTaxEngine.calculateInvoiceTotals([{ unitPrice: subtotal, quantity: 1 }], c.state);

      return {
        id: `inv_${i + 1}`,
        tenantId: 'tenant_main',
        clientId: c.id,
        clientName: c.businessName,
        invoiceNumber: `DR/BOS/2026-27/${String(1001 + i)}`,
        invoiceType: 'BILL_OF_SUPPLY',
        taxMode: 'NON_GST',
        subtotal: taxCalc.subtotal,
        cgstAmount: taxCalc.cgstAmount,
        sgstAmount: taxCalc.sgstAmount,
        igstAmount: taxCalc.igstAmount,
        totalTax: taxCalc.totalTax,
        totalAmount: taxCalc.totalAmount,
        paidAmount: isPaid ? taxCalc.totalAmount : 0,
        dueAmount: isPaid ? 0 : taxCalc.totalAmount,
        status: isPaid ? 'PAID' : 'ISSUED',
        dueDate: '2026-08-30T18:00:00Z',
        paidAt: isPaid ? '2026-08-10T11:30:00Z' : undefined,
        items: [
          {
            id: `item_${i + 1}`,
            description: `${c.packageName} - Monthly Service Retainer`,
            sacCode: '998313',
            quantity: 1,
            unitPrice: subtotal,
            taxRatePercent: 0,
            taxAmount: 0,
            totalAmount: subtotal,
          },
        ],
        createdAt: '2026-08-01T10:00:00Z',
      };
    });

    this.payments = this.invoices
      .filter((inv) => inv.status === 'PAID')
      .map((inv, i) => ({
        id: `pay_${i + 1}`,
        tenantId: 'tenant_main',
        clientId: inv.clientId,
        clientName: inv.clientName,
        invoiceId: inv.id,
        gateway: 'RAZORPAY',
        gatewayPaymentId: `pay_${Math.random().toString(36).substring(2, 12).toUpperCase()}`,
        gatewayOrderId: `order_${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        amount: inv.totalAmount,
        currency: 'INR',
        paymentMethod: i % 2 === 0 ? 'UPI' : 'NetBanking',
        status: 'CAPTURED',
        signatureVerified: true,
        paidAt: inv.paidAt || '2026-08-10T11:30:00Z',
        notes: `Paid via Razorpay Checkout for ${inv.invoiceNumber}`,
      }));

    // 10. Support Tickets (10 tickets)
    this.tickets = [
      {
        id: 'tkt_1',
        tenantId: 'tenant_main',
        clientId: 'cli_1',
        clientName: 'Ranchi Dental Care & Implant Center',
        ticketNumber: 'TKT-2026-042',
        category: 'GOOGLE_MAPS',
        subject: 'Need to update Sunday emergency clinic hours on Google Maps',
        description: 'We are now open on Sundays from 10:00 AM to 2:00 PM for emergencies. Please update on GBP.',
        priority: 'HIGH',
        status: 'IN_PROGRESS',
        assignedToId: 'usr_del_exec1',
        assignedToName: 'Rohan Gupta',
        slaDeadline: '2026-08-28T18:00:00Z',
        createdAt: '2026-08-27T08:30:00Z',
        updatedAt: '2026-08-27T08:45:00Z',
      },
      {
        id: 'tkt_2',
        tenantId: 'tenant_main',
        clientId: 'cli_2',
        clientName: 'Hotel Maple Wood & Banquet',
        ticketNumber: 'TKT-2026-043',
        category: 'CREATIVE',
        subject: 'Request new banquet flyer for corporate meeting packages',
        description: 'Please design an A4 PDF creative for conference hall booking with projector and lunch options.',
        priority: 'MEDIUM',
        status: 'OPEN',
        assignedToId: 'usr_del_exec2',
        assignedToName: 'Anjali Kumari',
        slaDeadline: '2026-08-29T18:00:00Z',
        createdAt: '2026-08-27T09:00:00Z',
        updatedAt: '2026-08-27T09:00:00Z',
      },
    ];

    // 11. GBP Profiles (20 profiles)
    this.gbpProfiles = this.clients.slice(0, 20).map((c, i) => ({
      id: `gbp_${i + 1}`,
      clientId: c.id,
      clientName: c.businessName,
      locationName: `${c.businessName}, ${c.address}`,
      primaryCategory: c.category,
      rating: c.averageRating,
      reviewCount: c.reviewCount,
      healthScore: c.gbpScore,
      photosCount: 25 + ((i * 7) % 40),
      isVerified: true,
      missingAttributes: i % 3 === 0 ? ['Wheelchair Accessible Entrance', 'Appointment Required'] : [],
      topKeywords: [
        { keyword: `best ${c.category.toLowerCase().split('/')[0].trim()} in ranchi`, rank: (i % 3) + 1, localSearchVolume: '1.2k/mo' },
        { keyword: `${c.category.toLowerCase().split('/')[0].trim()} near me`, rank: (i % 4) + 1, localSearchVolume: '2.8k/mo' },
        { keyword: `${c.businessName.split(' ')[0]} ranchi`, rank: 1, localSearchVolume: '850/mo' },
      ],
      lastAuditDate: '2026-08-20T10:00:00Z',
    }));

    // 12. Activity Timeline
    this.activities = [
      {
        id: 'act_1',
        clientId: 'cli_1',
        type: 'PAYMENT_RECEIVED',
        title: 'Payment of ₹2,499 Captured via Razorpay',
        description: 'Razorpay Payment ID: pay_RZP98124 captured successfully. Webhook verified.',
        actorName: 'Razorpay Webhook Engine',
        timestamp: '2026-08-10T11:30:00Z',
      },
      {
        id: 'act_2',
        clientId: 'cli_1',
        type: 'APPROVAL_GIVEN',
        title: 'Review Stand QR Design Approved',
        description: 'Client Dr. Alok approved the acrylic QR stand design without modifications.',
        actorName: 'Dr. Alok Srivastava (Client)',
        timestamp: '2026-08-26T14:30:00Z',
      },
      {
        id: 'act_3',
        clientId: 'cli_1',
        type: 'TASK_COMPLETED',
        title: 'Weekly GBP Optimization Completed',
        description: 'Uploaded 5 geotagged clinic photos and updated doctor availability schedule.',
        actorName: 'Rohan Gupta',
        timestamp: '2026-08-25T16:00:00Z',
      },
    ];
  }

  // --- Dynamic Operations ---

  public createLead(leadData: Omit<Lead, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>): Lead {
    const newLead: Lead = {
      id: generateId('lead'),
      tenantId: 'tenant_main',
      ...leadData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.leads.unshift(newLead);
    return newLead;
  }

  public convertLeadToClient(leadId: string, packageId: string = 'pkg_growth_999'): { client: Client; project: Project; tasks: Task[] } {
    const lead = this.leads.find((l) => l.id === leadId);
    if (!lead) throw new Error('Lead not found');

    lead.status = 'WON';
    const pkg = this.packages.find((p) => p.id === packageId) || this.packages[1];
    const clientId = generateId('cli');
    const manager = this.users[5]; // Neha Pandey

    const newClient: Client = {
      id: clientId,
      tenantId: 'tenant_main',
      leadId: lead.id,
      businessName: lead.businessName,
      legalName: `${lead.businessName} Pvt Ltd`,
      category: lead.category,
      phone: lead.phone,
      whatsapp: lead.whatsapp,
      email: lead.email,
      address: `${lead.city}, Jharkhand`,
      city: lead.city,
      state: lead.state || 'Jharkhand',
      pincode: '834001',
      googleMapsUrl: lead.googleMapsUrl,
      websiteUrl: lead.websiteUrl,
      assignedManagerId: manager.id,
      assignedManagerName: manager.name,
      packageId: pkg.id,
      packageName: pkg.name,
      healthScore: 'GREEN',
      healthReason: 'Newly onboarded client with verified onboarding kickoff',
      monthlyRevenue: pkg.price,
      activeSince: new Date().toISOString(),
      renewalDate: new Date(Date.now() + 30 * 86400000).toISOString(),
      reviewCount: 12,
      averageRating: 4.5,
      gbpScore: 78,
      status: 'ONBOARDING',
      createdAt: new Date().toISOString(),
    };
    this.clients.unshift(newClient);

    // Automatic 7-day Onboarding Project
    const projectId = generateId('prj');
    const newProject: Project = {
      id: projectId,
      tenantId: 'tenant_main',
      clientId: newClient.id,
      clientName: newClient.businessName,
      name: '7-Day Onboarding & Growth Kickoff',
      projectType: 'ONBOARDING',
      status: 'IN_PROGRESS',
      progressPercent: 10,
      startDate: new Date().toISOString(),
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString(),
      createdAt: new Date().toISOString(),
    };
    this.projects.unshift(newProject);

    // Generate Standard 7-Day Onboarding Tasks
    const onboardingTaskTitles = [
      'Day 1: Collect Logo, Photos & Exact Address Details',
      'Day 2: Perform Google Maps Geotagging & Category Optimization',
      'Day 3: Design Customized Review QR Code Acrylic Stand',
      'Day 4: Deploy High-Converting 1-Page Mini Website',
      'Day 5: Internal Quality Audit & NAP Verification',
      'Day 6: Submit Deliverables for Client Portal Approval',
      'Day 7: Official Launch & WhatsApp Welcome Broadcast',
    ];

    const createdTasks: Task[] = onboardingTaskTitles.map((title, dayIndex) => {
      const task: Task = {
        id: generateId('tsk'),
        tenantId: 'tenant_main',
        projectId: newProject.id,
        clientId: newClient.id,
        clientName: newClient.businessName,
        title: `${title} - ${newClient.businessName}`,
        description: `Automated onboarding task generated upon package purchase. Execute according to standard operating procedure.`,
        status: dayIndex === 0 ? 'ASSIGNED' : 'BACKLOG',
        priority: dayIndex < 3 ? 'HIGH' : 'MEDIUM',
        assignedToId: this.users[7].id,
        assignedToName: this.users[7].name,
        slaDeadline: new Date(Date.now() + (dayIndex + 1) * 86400000).toISOString(),
        dueDate: new Date(Date.now() + (dayIndex + 1) * 86400000).toISOString(),
        isRecurring: false,
        createdAt: new Date().toISOString(),
      };
      this.tasks.unshift(task);
      return task;
    });

    // Record Timeline Activity
    this.activities.unshift({
      id: generateId('act'),
      clientId: newClient.id,
      type: 'ONBOARDING_STARTED',
      title: 'Automated Onboarding Started',
      description: `Client converted from Lead ${lead.id}. ${createdTasks.length} onboarding tasks scheduled.`,
      actorName: 'Digital Ranchi OS Engine',
      timestamp: new Date().toISOString(),
    });

    return { client: newClient, project: newProject, tasks: createdTasks };
  }

  public recordPayment(
    clientId: string,
    amount: number,
    gatewayPaymentId: string,
    orderId?: string
  ): PaymentRecord {
    const client = this.clients.find((c) => c.id === clientId);
    const clientName = client ? client.businessName : 'Direct Customer';

    const payment: PaymentRecord = {
      id: generateId('pay'),
      tenantId: 'tenant_main',
      clientId,
      clientName,
      orderId,
      gateway: 'RAZORPAY',
      gatewayPaymentId,
      amount,
      currency: 'INR',
      paymentMethod: 'UPI',
      status: 'CAPTURED',
      signatureVerified: true,
      paidAt: new Date().toISOString(),
      notes: 'Server-side verified Razorpay payment capture',
    };
    this.payments.unshift(payment);

    this.activities.unshift({
      id: generateId('act'),
      clientId,
      type: 'PAYMENT_RECEIVED',
      title: `Payment Received: ₹${amount.toLocaleString('en-IN')}`,
      description: `Razorpay Payment ID: ${gatewayPaymentId} verified successfully.`,
      actorName: 'Razorpay Gateway',
      timestamp: new Date().toISOString(),
    });

    return payment;
  }

  // --- Master Data Management Methods (Super Admin CRUD) ---

  // Staff / User CRUD
  public createUser(userData: Omit<User, 'id' | 'tenantId' | 'createdAt'>): User {
    const newUser: User = {
      id: generateId('usr'),
      tenantId: 'tenant_main',
      ...userData,
      createdAt: new Date().toISOString(),
    };
    this.users.unshift(newUser);
    return newUser;
  }

  public updateUser(userId: string, data: Partial<User>): User {
    const index = this.users.findIndex((u) => u.id === userId);
    if (index === -1) throw new Error('User not found');
    this.users[index] = { ...this.users[index], ...data };
    return this.users[index];
  }

  public deleteUser(userId: string): boolean {
    const initialLen = this.users.length;
    this.users = this.users.filter((u) => u.id !== userId);
    return this.users.length < initialLen;
  }

  // Service CRUD
  public createService(serviceData: Omit<Service, 'id' | 'tenantId'>): Service {
    const newService: Service = {
      id: generateId('srv'),
      tenantId: 'tenant_main',
      ...serviceData,
    };
    this.services.unshift(newService);
    return newService;
  }

  public updateService(serviceId: string, data: Partial<Service>): Service {
    const index = this.services.findIndex((s) => s.id === serviceId);
    if (index === -1) throw new Error('Service not found');
    this.services[index] = { ...this.services[index], ...data };
    return this.services[index];
  }

  public deleteService(serviceId: string): boolean {
    const initialLen = this.services.length;
    this.services = this.services.filter((s) => s.id !== serviceId);
    return this.services.length < initialLen;
  }

  // Package CRUD
  public createPackage(pkgData: Omit<Package, 'id' | 'tenantId'>): Package {
    const newPkg: Package = {
      id: generateId('pkg'),
      tenantId: 'tenant_main',
      ...pkgData,
    };
    this.packages.unshift(newPkg);
    return newPkg;
  }

  public updatePackage(pkgId: string, data: Partial<Package>): Package {
    const index = this.packages.findIndex((p) => p.id === pkgId);
    if (index === -1) throw new Error('Package not found');
    this.packages[index] = { ...this.packages[index], ...data };
    return this.packages[index];
  }

  public deletePackage(pkgId: string): boolean {
    const initialLen = this.packages.length;
    this.packages = this.packages.filter((p) => p.id !== pkgId);
    return this.packages.length < initialLen;
  }

  // Lead Sources CRUD
  public addLeadSource(name: string): string {
    if (!this.leadSources.includes(name)) {
      this.leadSources.push(name);
    }
    return name;
  }

  public deleteLeadSource(name: string): boolean {
    const initialLen = this.leadSources.length;
    this.leadSources = this.leadSources.filter((s) => s !== name);
    return this.leadSources.length < initialLen;
  }
}

// Global in-memory singleton for development and demonstration
export const globalStore = new AppStore();
