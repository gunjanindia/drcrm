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
  SiteSettings,
  AuditRecord,
  StandeeOrder,
  AiReviewSettings,
  PrivateFeedback,
  StandeeTelemetry,
  GlobalAiPromptConfig,
} from '@/types';
import { initialTaxConfig, globalTaxEngine } from './tax-engine';
import { generateId } from './utils';

async function getPrisma() {
  if (typeof window === 'undefined') {
    try {
      const { prisma } = await import('./prisma');
      return prisma;
    } catch {
      return null;
    }
  }
  return null;
}

export const defaultSiteSettings: SiteSettings = {
  brandName: 'DIGITAL RANCHI',
  brandTagline: 'Local Growth OS',
  brandInitials: 'DR',
  phone: '+91 70047 00318',
  alternatePhone: undefined,
  whatsapp: '+91 70047 00318',
  email: 'digitalranchigrowth@gmail.com',
  supportEmail: 'hellodigitalranchi@gmail.com',
  address: 'Oak Forest, Argora, Ranchi, Jharkhand — 834002',
  city: 'Ranchi',
  state: 'Jharkhand',
  pincode: '834002',
  googleMapsUrl: 'https://maps.google.com/?cid=123456789',

  heroBadgeText: 'Rank #1 on Google Maps in Ranchi,Dhanbad, Deoghar, Jamshedpur, Bokaro, Hazaribagh & entire Jharkhand',
  heroHeadline: 'Get Your Business Found on',
  heroHeadlineHighlight: 'Google & WhatsApp',
  heroSubheadline: 'Get more calls, direct showroom visits, map directions, genuine 5-star reviews, and WhatsApp inquiries from customers searching for businesses like yours.',
  trustStripText: '4.8/5 Rating Across 250+ Ranchi SMBs',
  whatsappPitchText: 'Hi Digital Ranchi, I want to talk to an expert about growing my local business on Google',

  metaTitle: 'Digital Ranchi — Google Business Profile & Local SEO Growth Engine',
  metaDescription: "Jharkhand's #1 local business growth platform. We help clinics,gyms, beauty parlours,salons, hotels, and SMBs get verified and ranked on Google Maps, generate authentic 5-star reviews, and turn searches into paying customers.",
  metaKeywords: 'Google Maps SEO Ranchi, Google Business Profile Jharkhand, local marketing Ranchi, review QR stands, digital ranchi',

  copyrightText: 'Digital Ranchi. All rights reserved.',
  footerBio: 'Purpose-built local business growth platform. We help Jharkhand SMBs get discovered on Google Maps, generate authentic 5-star reviews, and turn searches into paying customers.',
  taxModeNotice: 'Bill of Supply',
  updatedAt: new Date().toISOString(),
};

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
  public siteSettings: SiteSettings = { ...defaultSiteSettings };
  public auditRecords: AuditRecord[] = [];
  public standeeOrders: StandeeOrder[] = [];
  public aiReviewSettings: AiReviewSettings[] = [];
  public privateFeedbacks: PrivateFeedback[] = [];
  public standeeTelemetries: StandeeTelemetry[] = [];
  public globalAiPromptConfigs: GlobalAiPromptConfig[] = [];
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
    // 1. Employees / Users across core agency roles
    this.users = [
      {
        id: 'usr_super_admin',
        tenantId: 'tenant_main',
        name: 'Gunjan Kumar',
        email: 'gunjan.india@gmail.com',
        phone: '+91 7004700318',
        role: 'SUPER_ADMIN',
        department: 'Executive',
        createdAt: '2026-01-01T10:00:00Z',
      },
      {
        id: 'usr_neha_pandey',
        tenantId: 'tenant_main',
        name: 'Neha Pandey',
        email: 'neha.p@digitalranchi.in',
        phone: '+91 9835012345',
        role: 'ACCOUNT_MANAGER',
        department: 'Client Success',
        createdAt: '2026-01-05T10:00:00Z',
      },
      {
        id: 'usr_rahul_verma',
        tenantId: 'tenant_main',
        name: 'Rahul Verma',
        email: 'rahul.v@digitalranchi.in',
        phone: '+91 9835023456',
        role: 'SALES_MANAGER',
        department: 'Sales & Growth',
        createdAt: '2026-01-05T10:00:00Z',
      },
      {
        id: 'usr_priya_sharma',
        tenantId: 'tenant_main',
        name: 'Priya Sharma',
        email: 'priya.s@digitalranchi.in',
        phone: '+91 9835034567',
        role: 'OPERATIONS_MANAGER',
        department: 'Operations',
        createdAt: '2026-01-10T10:00:00Z',
      },
      {
        id: 'usr_amit_kumar',
        tenantId: 'tenant_main',
        name: 'Amit Kumar',
        email: 'amit.k@digitalranchi.in',
        phone: '+91 9835045678',
        role: 'DELIVERY_EXECUTIVE',
        department: 'GBP & Local SEO',
        createdAt: '2026-01-10T10:00:00Z',
      },
      {
        id: 'usr_vikas_singh',
        tenantId: 'tenant_main',
        name: 'Vikas Singh',
        email: 'vikas.s@digitalranchi.in',
        phone: '+91 9835056789',
        role: 'DELIVERY_EXECUTIVE',
        department: 'Creative & Social',
        createdAt: '2026-01-12T10:00:00Z',
      },
      {
        id: 'usr_pooja_roy',
        tenantId: 'tenant_main',
        name: 'Pooja Roy',
        email: 'pooja.r@digitalranchi.in',
        phone: '+91 9835067890',
        role: 'FINANCE',
        department: 'Finance & Billing',
        createdAt: '2026-01-15T10:00:00Z',
      }
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

    // 4. Clients (Empty by default for production use)
    this.clients = [];

    // 5. Leads (Empty by default for production use)
    this.leads = [];

    // 6. Work Projects (Empty by default for production use)
    this.projects = [];

    // 7. Tasks (Empty by default for production use)
    this.tasks = [];

    // 8. Deliverable Approvals (Empty by default for production use)
    this.deliverables = [];

    // 9. Invoices & Payments (Empty by default for production use)
    this.invoices = [];
    this.payments = [];

    // 10. Support Tickets (Empty by default for production use)
    this.tickets = [];

    // 11. GBP Profiles (Empty by default for production use)
    this.gbpProfiles = [];

    // 12. Activity Timeline (Empty by default for production use)
    this.activities = [];

    // 13. Client 360 Physical Acrylic Standees & Hardware Orders
    this.standeeOrders = [
      {
        id: 'ord_stnd_101',
        tenantId: 'tenant_main',
        clientId: 'cli_city_dental',
        clientName: 'City Dental Care & Implant Centre',
        status: 'DELIVERED',
        trackingId: 'BD74892019IN',
        courier: 'BlueDart',
        courierUrl: 'https://www.bluedart.com/tracking?track=BD74892019IN',
        shippingAddress: 'Circular Road, Near Lalpur Chowk, Ranchi, Jharkhand — 834001',
        city: 'Ranchi',
        state: 'Jharkhand',
        pincode: '834001',
        phone: '+91 94311 22334',
        nfcUid: 'NFC-DR-8829104',
        qrSlug: 'city-dental-care',
        orderDate: '2026-02-10T10:00:00Z',
        dispatchedAt: '2026-02-12T14:30:00Z',
        deliveredAt: '2026-02-15T16:00:00Z',
        isNfcActive: true,
        isQrActive: true,
        directGoogleReviewUrl: 'https://maps.google.com/?cid=123456789',
        notes: 'Delivered premium frosted acrylic QR & NFC standee with metallic base.',
        createdAt: '2026-02-10T10:00:00Z',
        updatedAt: '2026-02-15T16:00:00Z',
      },
      {
        id: 'ord_stnd_102',
        tenantId: 'tenant_main',
        clientId: 'cli_life_lights',
        clientName: 'Life in Lights Academy',
        status: 'DISPATCHED',
        trackingId: 'DEL992817462',
        courier: 'Delhivery',
        courierUrl: 'https://www.delhivery.com/track/package/DEL992817462',
        shippingAddress: 'City Center Mall Road, Bank More, Dhanbad, Jharkhand — 826001',
        city: 'Dhanbad',
        state: 'Jharkhand',
        pincode: '826001',
        phone: '+91 94311 00000',
        nfcUid: 'NFC-DR-9948211',
        qrSlug: 'life-in-lights-academy',
        orderDate: '2026-03-10T11:00:00Z',
        dispatchedAt: '2026-03-12T15:00:00Z',
        isNfcActive: true,
        isQrActive: true,
        directGoogleReviewUrl: 'https://maps.google.com/?q=Life+in+Lights+Academy+Dhanbad',
        notes: 'In-transit via Delhivery Express Air.',
        createdAt: '2026-03-10T11:00:00Z',
        updatedAt: '2026-03-12T15:00:00Z',
      },
      {
        id: 'ord_stnd_103',
        tenantId: 'tenant_main',
        clientId: 'cli_shree_ram_sweets',
        clientName: 'Shree Ram Sweets & Chaat Bhandar',
        status: 'IN_PRODUCTION',
        shippingAddress: 'Main Road, Near Tower Chowk, Deoghar, Jharkhand — 814112',
        city: 'Deoghar',
        state: 'Jharkhand',
        pincode: '814112',
        phone: '+91 94313 77889',
        nfcUid: 'NFC-DR-7738290',
        qrSlug: 'shree-ram-sweets',
        orderDate: '2026-03-16T09:00:00Z',
        isNfcActive: true,
        isQrActive: true,
        directGoogleReviewUrl: 'https://maps.google.com/?q=Shree+Ram+Sweets+Deoghar',
        notes: 'UV Laser Printing on Acrylic Standee in progress.',
        createdAt: '2026-03-16T09:00:00Z',
        updatedAt: '2026-03-16T09:00:00Z',
      },
    ];

    // 14. Client AI Review Engine Settings & Context
    this.aiReviewSettings = [
      {
        clientId: 'cli_city_dental',
        businessType: 'Dental Clinic & Implant Center',
        keyServices: ['Painless Root Canal', 'Dental Implants', 'Teeth Whitening', 'Invisible Braces', 'Smile Makeover'],
        targetKeywords: ['best dentist in Ranchi', 'painless dental clinic', 'affordable root canal', 'hygienic dental care'],
        tone: 'PROFESSIONAL',
        isShieldActive: true,
        customInstructions: 'Emphasize gentle treatment, spotless hygienic clinic, and doctor patient listening.',
        reviewRedirectUrl: 'https://maps.google.com/?cid=123456789',
        updatedAt: new Date().toISOString(),
      },
      {
        clientId: 'cli_life_lights',
        businessType: 'Photography & Filmmaking Academy',
        keyServices: ['Wedding Cinematography Course', 'Portrait Photography', 'Commercial Video Editing', 'Camera Masterclass'],
        targetKeywords: ['top photography institute Dhanbad', 'practical camera training', 'cinematography diploma', 'creative studio'],
        tone: 'FRIENDLY',
        isShieldActive: true,
        customInstructions: 'Highlight hands-on camera experience, mentor support, and state-of-the-art studio lighting.',
        reviewRedirectUrl: 'https://maps.google.com/?q=Life+in+Lights+Academy+Dhanbad',
        updatedAt: new Date().toISOString(),
      },
    ];

    // 15. Private Customer Feedback Caught by Smart Sentiment Shield (1-3 Stars)
    this.privateFeedbacks = [
      {
        id: 'fb_101',
        clientId: 'cli_city_dental',
        businessName: 'City Dental Care & Implant Centre',
        customerName: 'Vivek Ranjan',
        customerPhone: '+91 98351 99882',
        customerEmail: 'vivek.ranjan@gmail.com',
        rating: 2,
        message: 'Doctor was good, but had to wait 35 minutes past my booked appointment time. Reception desk should inform in advance about delays.',
        status: 'NEW',
        source: 'NFC_STANDEE',
        createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      },
      {
        id: 'fb_102',
        clientId: 'cli_city_dental',
        businessName: 'City Dental Care & Implant Centre',
        customerName: 'Anjali Sahay',
        customerPhone: '+91 94311 44556',
        rating: 3,
        message: 'Treatment was satisfactory, but parking in the building basement was full and very difficult to manage.',
        status: 'CONTACTED',
        resolutionNotes: 'Called patient, apologized for parking rush, and reserved front valet spot for next visit.',
        source: 'QR_CODE',
        createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      },
    ];

    // 16. Standee Scans & Conversion Funnel Telemetry
    this.standeeTelemetries = [
      {
        clientId: 'cli_city_dental',
        totalScans: 284,
        nfcTaps: 168,
        qrScans: 116,
        aiReviewsGenerated: 192,
        googleRedirects: 184,
        privateComplaintsIntercepted: 8,
        lastScannedAt: new Date().toISOString(),
        scansByDate: [
          { date: 'Mon', taps: 24, scans: 14, reviews: 26 },
          { date: 'Tue', taps: 30, scans: 18, reviews: 32 },
          { date: 'Wed', taps: 22, scans: 16, reviews: 25 },
          { date: 'Thu', taps: 28, scans: 20, reviews: 31 },
          { date: 'Fri', taps: 35, scans: 22, reviews: 38 },
          { date: 'Sat', taps: 42, scans: 28, reviews: 45 },
          { date: 'Sun', taps: 18, scans: 12, reviews: 20 },
        ],
      },
      {
        clientId: 'cli_life_lights',
        totalScans: 142,
        nfcTaps: 86,
        qrScans: 56,
        aiReviewsGenerated: 98,
        googleRedirects: 94,
        privateComplaintsIntercepted: 4,
        lastScannedAt: new Date().toISOString(),
        scansByDate: [
          { date: 'Mon', taps: 10, scans: 8, reviews: 12 },
          { date: 'Tue', taps: 14, scans: 9, reviews: 15 },
          { date: 'Wed', taps: 12, scans: 7, reviews: 14 },
          { date: 'Thu', taps: 16, scans: 11, reviews: 18 },
          { date: 'Fri', taps: 18, scans: 12, reviews: 20 },
          { date: 'Sat', taps: 22, scans: 15, reviews: 24 },
          { date: 'Sun', taps: 8, scans: 5, reviews: 9 },
        ],
      },
    ];

    // 17. Master Category AI Prompts & Keyword Templates
    this.globalAiPromptConfigs = [
      {
        id: 'cfg_health',
        category: 'HEALTHCARE',
        displayName: 'Healthcare, Clinics & Hospitals',
        systemPrompt: 'Generate a genuine, reassuring 5-star patient review highlighting compassionate care, painless treatment, clean environment, and transparent guidance.',
        seoKeywords: ['best doctor', 'painless treatment', 'clean clinic', 'caring staff', 'accurate diagnosis', 'prompt consultation'],
        fallbackReviews: [
          'Excellent experience with the doctor and courteous staff. The clinic is spotlessly clean and treatment was completely painless. Highly recommended!',
          'Very professional consultation and caring demeanor. Explained the diagnosis clearly with transparent fees. Truly grateful for the treatment.',
          'State-of-the-art facility with minimal waiting time. The doctor gave ample time and answered all my concerns. Five stars without hesitation!',
        ],
        isActive: true,
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'cfg_food',
        category: 'FOOD_BEVERAGE',
        displayName: 'Restaurants, Cafes & Bakeries',
        systemPrompt: 'Generate an appetizing, enthusiastic 5-star customer review praising fresh flavors, prompt service, vibrant ambiance, and value for money.',
        seoKeywords: ['delicious food', 'authentic taste', 'must visit cafe', 'quick service', 'cozy ambiance', 'fresh ingredients'],
        fallbackReviews: [
          'Amazing food and delightful ambiance! The flavors were authentic and portion sizes are generous. Will definitely visit again with family.',
          'Best dining experience in the area! Super quick service, polite staff, and mouthwatering dishes. Highly recommended!',
          'Cozy vibes and top-notch taste. Every dish was freshly prepared and served piping hot. 10/10 recommendation!',
        ],
        isActive: true,
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'cfg_salon',
        category: 'BEAUTY_SALON',
        displayName: 'Salons, Spas & Beauty Parlours',
        systemPrompt: 'Generate a glowing 5-star beauty makeover review praising skilled stylists, hygienic tools, relaxing ambiance, and transformative results.',
        seoKeywords: ['best hair salon', 'bridal makeup', 'professional stylist', 'relaxing spa', 'hygienic parlour', 'flawless skin'],
        fallbackReviews: [
          'Loved my haircut and facial session! The stylist understood exactly what I wanted and the salon maintained impeccable hygiene.',
          'Outstanding service and courteous staff. Used premium products and took great care of my hair. Best salon in town!',
          'Very relaxing ambiance and skilled artists. Left the salon feeling refreshed and completely satisfied with my makeover.',
        ],
        isActive: true,
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'cfg_retail',
        category: 'RETAIL_SERVICES',
        displayName: 'Retail Stores, Garages & Services',
        systemPrompt: 'Generate a positive 5-star customer review highlighting wide product variety, fair pricing, honest advice, and swift fulfillment.',
        seoKeywords: ['best quality products', 'honest pricing', 'quick delivery', 'trustworthy shop', 'polite staff', 'great collection'],
        fallbackReviews: [
          'Great collection and very fair pricing. The staff is extremely polite and helped me pick the right item without pushing. 5 stars!',
          'Prompt response, reliable workmanship, and honest advice. Delivered exactly what was promised on time.',
          'Superb customer service and genuine products. Very satisfied with my purchase and will definitely be a repeat customer!',
        ],
        isActive: true,
        updatedAt: new Date().toISOString(),
      },
    ];
  }

  // --- Dynamic Operations ---

  public saveToFile() {
    if (typeof window === 'undefined') {
      try {
        const fs = require('fs');
        const path = require('path');
        const dataDir = process.env.VERCEL ? '/tmp' : path.join(process.cwd(), 'data');
        if (!fs.existsSync(dataDir)) {
          fs.mkdirSync(dataDir, { recursive: true });
        }
        const storeFile = path.join(dataDir, 'crm_store.json');
        const data = {
          leads: this.leads,
          clients: this.clients,
          projects: this.projects,
          tasks: this.tasks,
          invoices: this.invoices,
          payments: this.payments,
          deliverables: this.deliverables,
          tickets: this.tickets,
          gbpProfiles: this.gbpProfiles,
          activities: this.activities,
          taxConfig: this.taxConfig,
          siteSettings: this.siteSettings,
          auditRecords: this.auditRecords,
          services: this.services,
          packages: this.packages,
          users: this.users,
          leadSources: this.leadSources,
          standeeOrders: this.standeeOrders,
          aiReviewSettings: this.aiReviewSettings,
          privateFeedbacks: this.privateFeedbacks,
          standeeTelemetries: this.standeeTelemetries,
          globalAiPromptConfigs: this.globalAiPromptConfigs,
        };
        fs.writeFileSync(storeFile, JSON.stringify(data, null, 2), 'utf-8');
      } catch (e) {
        console.error('Failed to save CRM store to disk:', e);
      }
    }
  }

  public async loadFromFile() {
    if (typeof window === 'undefined') {
      try {
        const fs = require('fs');
        const path = require('path');
        const localStoreFile = path.join(process.cwd(), 'data', 'crm_store.json');
        const tmpStoreFile = path.join('/tmp', 'crm_store.json');
        const storeFile = fs.existsSync(tmpStoreFile)
          ? tmpStoreFile
          : fs.existsSync(localStoreFile)
            ? localStoreFile
            : null;

        if (storeFile && fs.existsSync(storeFile)) {
          const raw = fs.readFileSync(storeFile, 'utf-8');
          const data = JSON.parse(raw);
          if (data.leads && Array.isArray(data.leads)) this.leads = data.leads;
          if (data.clients && Array.isArray(data.clients)) this.clients = data.clients;
          if (data.projects && Array.isArray(data.projects)) this.projects = data.projects;
          if (data.tasks && Array.isArray(data.tasks)) this.tasks = data.tasks;
          if (data.invoices && Array.isArray(data.invoices)) this.invoices = data.invoices;
          if (data.payments && Array.isArray(data.payments)) this.payments = data.payments;
          if (data.deliverables && Array.isArray(data.deliverables)) this.deliverables = data.deliverables;
          if (data.tickets && Array.isArray(data.tickets)) this.tickets = data.tickets;
          if (data.gbpProfiles && Array.isArray(data.gbpProfiles)) this.gbpProfiles = data.gbpProfiles;
          if (data.activities && Array.isArray(data.activities)) this.activities = data.activities;
          if (data.taxConfig) this.taxConfig = data.taxConfig;
          if (data.siteSettings) this.siteSettings = { ...defaultSiteSettings, ...data.siteSettings };
          if (data.auditRecords && Array.isArray(data.auditRecords)) this.auditRecords = data.auditRecords;
          if (data.services && Array.isArray(data.services)) this.services = data.services;
          if (data.packages && Array.isArray(data.packages)) this.packages = data.packages;
          if (data.users && Array.isArray(data.users)) this.users = data.users;
          if (data.standeeOrders && Array.isArray(data.standeeOrders)) this.standeeOrders = data.standeeOrders;
          if (data.aiReviewSettings && Array.isArray(data.aiReviewSettings)) this.aiReviewSettings = data.aiReviewSettings;
          if (data.privateFeedbacks && Array.isArray(data.privateFeedbacks)) this.privateFeedbacks = data.privateFeedbacks;
          if (data.standeeTelemetries && Array.isArray(data.standeeTelemetries)) this.standeeTelemetries = data.standeeTelemetries;
          if (data.globalAiPromptConfigs && Array.isArray(data.globalAiPromptConfigs)) this.globalAiPromptConfigs = data.globalAiPromptConfigs;
        }
      } catch (e) {
        console.error('Failed to load CRM store from disk:', e);
      }

      if (process.env.DATABASE_URL) {
        await this.syncFromDb();
      }
    }
  }

  public updateSiteSettings(newSettings: Partial<SiteSettings>): SiteSettings {
    this.siteSettings = {
      ...this.siteSettings,
      ...newSettings,
      updatedAt: new Date().toISOString(),
    };
    this.saveToFile();
    return this.siteSettings;
  }

  public createAuditRecord(recordData: Omit<AuditRecord, 'id' | 'scannedAt'>): AuditRecord {
    const newRecord: AuditRecord = {
      id: generateId('aud'),
      ...recordData,
      scannedAt: new Date().toISOString(),
    };
    this.auditRecords.unshift(newRecord);
    // Keep maximum 500 audit records in store to prevent memory overflow
    if (this.auditRecords.length > 500) {
      this.auditRecords = this.auditRecords.slice(0, 500);
    }
    this.saveToFile();
    return newRecord;
  }

  public updateAuditRecord(recordId: string, data: Partial<AuditRecord>): AuditRecord | null {
    const index = this.auditRecords.findIndex((r) => r.id === recordId);
    if (index === -1) return null;
    this.auditRecords[index] = { ...this.auditRecords[index], ...data };
    this.saveToFile();
    return this.auditRecords[index];
  }

  public deleteAuditRecord(recordId: string): boolean {
    const initialLen = this.auditRecords.length;
    this.auditRecords = this.auditRecords.filter((r) => r.id !== recordId);
    this.saveToFile();
    return this.auditRecords.length < initialLen;
  }


  public async syncFromDb() {
    const prisma = await getPrisma();
    if (prisma) {
      try {
        const [dbUsers, dbClients, dbLeads, dbTasks, dbProjects, dbServices, dbPackages, dbTax, dbSiteSettings, dbAuditRecords] = await Promise.all([
            prisma.user.findMany().catch(() => []),
            prisma.client.findMany().catch(() => []),
            prisma.lead.findMany({ orderBy: { createdAt: 'desc' } }).catch(() => []),
            prisma.task.findMany({ include: { client: true, assignedTo: true }, orderBy: { createdAt: 'desc' } }).catch(() => []),
            prisma.project.findMany().catch(() => []),
            prisma.service.findMany().catch(() => []),
            prisma.package.findMany().catch(() => []),
            prisma.taxConfiguration.findFirst().catch(() => null),
            prisma.siteSetting.findFirst({ where: { tenantId: 'tenant_main' } }).catch(() => null),
            prisma.auditRecord.findMany({ orderBy: { scannedAt: 'desc' }, take: 200 }).catch(() => []),
          ]);

          if (dbSiteSettings) {
            this.siteSettings = {
              ...this.siteSettings,
              brandName: dbSiteSettings.brandName || this.siteSettings.brandName,
              brandTagline: dbSiteSettings.brandTagline || this.siteSettings.brandTagline,
              brandInitials: dbSiteSettings.brandInitials || this.siteSettings.brandInitials,
              logoUrl: dbSiteSettings.logoUrl || undefined,
              faviconUrl: dbSiteSettings.faviconUrl || undefined,
              phone: dbSiteSettings.phone || this.siteSettings.phone,
              alternatePhone: dbSiteSettings.alternatePhone || undefined,
              whatsapp: dbSiteSettings.whatsapp || this.siteSettings.whatsapp,
              email: dbSiteSettings.email || this.siteSettings.email,
              supportEmail: dbSiteSettings.supportEmail || this.siteSettings.supportEmail,
              address: dbSiteSettings.address || this.siteSettings.address,
              city: dbSiteSettings.city || this.siteSettings.city,
              state: dbSiteSettings.state || this.siteSettings.state,
              pincode: dbSiteSettings.pincode || this.siteSettings.pincode,
              googleMapsUrl: dbSiteSettings.googleMapsUrl || undefined,
              websiteUrl: dbSiteSettings.websiteUrl || undefined,
              heroBadgeText: dbSiteSettings.heroBadgeText || this.siteSettings.heroBadgeText,
              heroHeadline: dbSiteSettings.heroHeadline || this.siteSettings.heroHeadline,
              heroHeadlineHighlight: dbSiteSettings.heroHeadlineHighlight || this.siteSettings.heroHeadlineHighlight,
              heroSubheadline: dbSiteSettings.heroSubheadline || this.siteSettings.heroSubheadline,
              trustStripText: dbSiteSettings.trustStripText || this.siteSettings.trustStripText,
              whatsappPitchText: dbSiteSettings.whatsappPitchText || this.siteSettings.whatsappPitchText,
              metaTitle: dbSiteSettings.metaTitle || this.siteSettings.metaTitle,
              metaDescription: dbSiteSettings.metaDescription || this.siteSettings.metaDescription,
              metaKeywords: dbSiteSettings.metaKeywords || this.siteSettings.metaKeywords,
              ogImageUrl: dbSiteSettings.ogImageUrl || undefined,
              copyrightText: dbSiteSettings.copyrightText || this.siteSettings.copyrightText,
              footerBio: dbSiteSettings.footerBio || this.siteSettings.footerBio,
              taxModeNotice: dbSiteSettings.taxModeNotice || this.siteSettings.taxModeNotice,
              updatedAt: dbSiteSettings.updatedAt ? dbSiteSettings.updatedAt.toISOString() : new Date().toISOString(),
            };
          }

          if (dbAuditRecords && Array.isArray(dbAuditRecords) && dbAuditRecords.length > 0) {
            this.auditRecords = dbAuditRecords.map((r: any) => ({
              id: r.id,
              tenantId: r.tenantId,
              businessName: r.businessName,
              contactName: r.contactName || undefined,
              phone: r.phone || undefined,
              email: r.email || undefined,
              city: r.city,
              category: r.category,
              googleMapsUrl: r.googleMapsUrl || undefined,
              websiteUrl: r.websiteUrl || undefined,
              placeId: r.placeId || undefined,
              overallScore: r.overallScore,
              averageRating: r.averageRating || undefined,
              reviewCount: r.reviewCount || undefined,
              validationStatus: r.validationStatus as any,
              suggestedPackageId: r.suggestedPackageId || undefined,
              suggestedPackageName: r.suggestedPackageName || undefined,
              suggestedPackagePrice: r.suggestedPackagePrice || undefined,
              breakdown: r.breakdown || {
                googleBusinessProfile: 60,
                reviewsAndReputation: 60,
                photosAndMedia: 60,
                websitePresence: 60,
                localSeoScore: 60,
                socialEngagement: 60,
              },
              strengths: r.strengths || [],
              criticalWeaknesses: r.criticalWeaknesses || [],
              recommendedImprovements: r.recommendedImprovements || [],
              matchedPlace: r.matchedPlace || undefined,
              candidates: r.candidates || undefined,
              auditedByUserId: r.auditedByUserId || undefined,
              auditedByUserName: r.auditedByUserName || undefined,
              isStaffAudit: r.isStaffAudit || false,
              leadId: r.leadId || undefined,
              isConvertedToLead: r.isConvertedToLead || false,
              scannedAt: r.scannedAt ? new Date(r.scannedAt).toISOString() : new Date().toISOString(),
            }));
          }

          if (dbUsers && Array.isArray(dbUsers) && dbUsers.length > 0) {
            const mappedDbUsers = dbUsers.map((u: any) => ({
              id: u.id,
              tenantId: u.tenantId,
              name: u.name,
              email: u.email,
              phone: u.phone,
              role: u.role,
              department: u.department || undefined,
              avatarUrl: u.avatarUrl || undefined,
              clientId: u.clientId || undefined,
              passwordHash: u.passwordHash,
              createdAt: u.createdAt ? new Date(u.createdAt).toISOString() : new Date().toISOString(),
            }));
            const dbEmails = new Set(mappedDbUsers.map((u: any) => u.email.toLowerCase()));
            const fallbackSeeded = this.users.filter((u) => !dbEmails.has(u.email.toLowerCase()));
            this.users = [...mappedDbUsers, ...fallbackSeeded];
          }

          if (dbClients && Array.isArray(dbClients)) {
            this.clients = dbClients.map((c: any) => ({
              id: c.id,
              tenantId: c.tenantId,
              businessName: c.businessName,
              legalName: c.legalName || `${c.businessName} Pvt Ltd`,
              category: c.category,
              contactName: c.contactName || c.businessName,
              phone: c.phone,
              whatsapp: c.whatsapp,
              email: c.email,
              address: c.address,
              city: c.city,
              state: c.state,
              pincode: c.pincode,
              packageId: c.packageId,
              packageName: c.packageName,
              assignedManagerId: c.assignedManagerId,
              assignedManagerName: 'Neha Pandey',
              healthScore: c.healthScore || 'GREEN',
              healthReason: c.healthReason || 'Active account verified in CRM',
              monthlyRevenue: c.monthlyRevenue || 999,
              activeSince: c.activeSince ? new Date(c.activeSince).toISOString() : new Date().toISOString(),
              renewalDate: c.renewalDate ? new Date(c.renewalDate).toISOString() : new Date(Date.now() + 30 * 86400000).toISOString(),
              reviewCount: c.reviewCount || 0,
              averageRating: c.averageRating || 5.0,
              gbpScore: c.gbpScore || 80,
              status: c.status || 'ACTIVE',
              aiCreditBalance: typeof c.aiCreditBalance === 'number' ? c.aiCreditBalance : 20,
              trialEndsAt: c.trialEndsAt ? new Date(c.trialEndsAt).toISOString() : undefined,
              subscriptionStatus: c.subscriptionStatus || 'TRIAL',
              isGbpLinked: c.isGbpLinked ?? false,
              gbpVerifiedEmail: c.gbpVerifiedEmail || undefined,
              gbpLocationId: c.gbpLocationId || undefined,
              createdAt: c.createdAt ? new Date(c.createdAt).toISOString() : new Date().toISOString(),
            }));
          }

          if (dbLeads && Array.isArray(dbLeads)) {
            this.leads = dbLeads.map((l: any) => ({
              id: l.id,
              tenantId: l.tenantId,
              businessName: l.businessName,
              contactName: l.contactName,
              phone: l.phone,
              whatsapp: l.whatsapp,
              email: l.email,
              category: l.category,
              city: l.city,
              state: l.state,
              googleMapsUrl: l.googleMapsUrl || undefined,
              websiteUrl: l.websiteUrl || undefined,
              leadSource: l.leadSource,
              interestedPackageId: l.interestedPackageId || undefined,
              estimatedValue: l.estimatedValue || 999,
              leadScore: l.leadScore || 70,
              status: l.status,
              auditScore: l.auditScore || undefined,
              createdAt: l.createdAt ? new Date(l.createdAt).toISOString() : new Date().toISOString(),
              updatedAt: l.updatedAt ? new Date(l.updatedAt).toISOString() : new Date().toISOString(),
            }));
          }

          if (dbTasks && Array.isArray(dbTasks) && dbTasks.length > 0) {
            const mappedDbTasks = dbTasks.map((t: any) => ({
              id: t.id,
              tenantId: t.tenantId,
              clientId: t.clientId,
              clientName: t.client?.businessName || this.clients.find((c) => c.id === t.clientId)?.businessName || 'Client Account',
              projectId: t.projectId || undefined,
              title: t.title,
              description: t.description || t.title,
              category: t.category || 'GBP_SETUP',
              priority: t.priority,
              status: t.status,
              assignedToId: t.assignedToId,
              assignedToName: t.assignedTo?.name || this.users.find((u) => u.id === t.assignedToId)?.name || (t.assignedToId === 'usr_del_exec1' ? 'Rohan Gupta' : 'Amit Kumar'),
              slaHours: 48,
              slaDeadline: t.slaDeadline ? new Date(t.slaDeadline).toISOString() : new Date().toISOString(),
              dueDate: t.dueDate ? new Date(t.dueDate).toISOString() : new Date().toISOString(),
              deliverableUrl: t.deliverableUrl || undefined,
              deliverableType: t.deliverableType || undefined,
              approvalStatus: t.approvalStatus || undefined,
              approvalComment: t.approvalComment || undefined,
              completedAt: t.completedAt ? new Date(t.completedAt).toISOString() : undefined,
              isRecurring: t.isRecurring || false,
              createdAt: t.createdAt ? new Date(t.createdAt).toISOString() : new Date().toISOString(),
            }));
            const dbTaskIds = new Set(mappedDbTasks.map((t: any) => t.id));
            const localOnly = this.tasks.filter((t) => !dbTaskIds.has(t.id));
            this.tasks = [...mappedDbTasks, ...localOnly];
          }
      } catch (e) {
        console.error('Database sync error:', e);
      }
    }
  }

  public async createLead(leadData: Omit<Lead, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>): Promise<Lead> {
    const newLead: Lead = {
      id: generateId('lead'),
      tenantId: 'tenant_main',
      ...leadData,
      leadScore: leadData.leadScore !== undefined ? leadData.leadScore : (leadData.auditScore || 0),
      auditScore: leadData.auditScore !== undefined ? leadData.auditScore : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.leads.unshift(newLead);
    this.saveToFile();

    // Await persist to Neon PostgreSQL
    const prisma = await getPrisma();
    if (prisma) {
      try {
        await prisma.lead.create({
            data: {
              id: newLead.id,
              tenantId: newLead.tenantId,
              businessName: newLead.businessName,
              contactName: newLead.contactName,
              phone: newLead.phone,
              whatsapp: newLead.whatsapp,
              email: newLead.email,
              category: newLead.category,
              city: newLead.city,
              state: newLead.state,
              googleMapsUrl: newLead.googleMapsUrl || null,
              websiteUrl: newLead.websiteUrl || null,
              leadSource: newLead.leadSource || 'Website Direct',
              interestedPackageId: newLead.interestedPackageId || null,
              estimatedValue: newLead.estimatedValue || 999.0,
              leadScore: newLead.leadScore,
              status: newLead.status || 'NEW',
              auditScore: newLead.auditScore || null,
            },
          });
      } catch (e) {
        console.error('Failed to persist createLead to Neon:', e);
      }
    }

    return newLead;
  }

  public async updateLead(leadId: string, data: Partial<Lead>): Promise<Lead> {
    const index = this.leads.findIndex((l) => l.id === leadId);
    if (index === -1) throw new Error('Lead not found');
    this.leads[index] = {
      ...this.leads[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    this.saveToFile();

    // Await update to Neon PostgreSQL
    const prisma = await getPrisma();
    if (prisma) {
      try {
        const updatePayload: any = {};
          if (data.businessName !== undefined) updatePayload.businessName = data.businessName;
          if (data.contactName !== undefined) updatePayload.contactName = data.contactName;
          if (data.phone !== undefined) updatePayload.phone = data.phone;
          if (data.whatsapp !== undefined) updatePayload.whatsapp = data.whatsapp;
          if (data.email !== undefined) updatePayload.email = data.email;
          if (data.category !== undefined) updatePayload.category = data.category;
          if (data.city !== undefined) updatePayload.city = data.city;
          if (data.state !== undefined) updatePayload.state = data.state;
          if (data.googleMapsUrl !== undefined) updatePayload.googleMapsUrl = data.googleMapsUrl;
          if (data.websiteUrl !== undefined) updatePayload.websiteUrl = data.websiteUrl;
          if (data.status !== undefined) updatePayload.status = data.status;
          if (data.estimatedValue !== undefined) updatePayload.estimatedValue = data.estimatedValue;
          if (data.leadScore !== undefined) updatePayload.leadScore = data.leadScore;
          if (data.auditScore !== undefined) updatePayload.auditScore = data.auditScore;
          if (data.notes !== undefined) updatePayload.notes = data.notes;

          await prisma.lead.update({
            where: { id: leadId },
            data: updatePayload,
          });
      } catch (e) {
        console.error('Failed to update lead in Neon:', e);
      }
    }

    return this.leads[index];
  }

  public async deleteLead(leadId: string): Promise<boolean> {
    const index = this.leads.findIndex((l) => l.id === leadId);
    if (index !== -1) {
      this.leads.splice(index, 1);
    }
    this.saveToFile();

    const prisma = await getPrisma();
    if (prisma) {
      try {
        await prisma.lead.delete({
            where: { id: leadId },
          }).catch(() => null);
      } catch (e) {
        console.error('Failed to delete lead from Neon:', e);
      }
    }
    return true;
  }

  public async convertLeadToClient(leadId: string, packageId: string = 'pkg_growth_999'): Promise<{
    client: Client;
    project: Project;
    tasks: Task[];
    invoice: Invoice;
    lead: Lead;
  }> {
    const lead = this.leads.find((l) => l.id === leadId);
    if (!lead) throw new Error('Lead not found');

    lead.status = 'WON';
    lead.updatedAt = new Date().toISOString();
    const pkg = this.packages.find((p) => p.id === packageId) || this.packages[1] || {
      id: 'pkg_growth_999',
      name: 'Growth Accelerate',
      price: 999,
      billingFrequency: 'MONTHLY',
    };
    const clientId = generateId('cli');
    const manager = this.users[5] || this.users[0]; // Neha Pandey or Admin

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

    // Auto-provision Client User account for Client Portal Login
    const existingClientUser = this.users.find(
      (u) => u.email.toLowerCase() === newClient.email.toLowerCase()
    );
    if (!existingClientUser) {
      const clientUser: User = {
        id: generateId('usr'),
        tenantId: 'tenant_main',
        name: lead.contactName || lead.businessName,
        email: newClient.email,
        phone: newClient.phone,
        role: 'CLIENT',
        clientId: newClient.id,
        department: 'Client',
        createdAt: new Date().toISOString(),
      };
      this.users.unshift(clientUser);
    } else {
      existingClientUser.clientId = newClient.id;
    }

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

    const assignee = this.users[7] || this.users[0];
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
        assignedToId: assignee.id,
        assignedToName: assignee.name,
        slaDeadline: new Date(Date.now() + (dayIndex + 1) * 86400000).toISOString(),
        dueDate: new Date(Date.now() + (dayIndex + 1) * 86400000).toISOString(),
        isRecurring: false,
        createdAt: new Date().toISOString(),
      };
      this.tasks.unshift(task);
      return task;
    });

    // Generate Initial Invoice for Client Retainer / Package Purchase
    const taxResult = globalTaxEngine.calculateInvoiceTotals(
      [{ unitPrice: pkg.price, quantity: 1 }],
      newClient.state || 'Jharkhand'
    );
    const invoiceNumber = `${this.taxConfig.invoicePrefix || 'DR/BOS/'}${Date.now().toString().slice(-6)}`;
    const newInvoice: Invoice = {
      id: generateId('inv'),
      tenantId: 'tenant_main',
      clientId: newClient.id,
      clientName: newClient.businessName,
      invoiceNumber,
      invoiceType: taxResult.invoiceType,
      taxMode: taxResult.taxMode,
      subtotal: taxResult.subtotal,
      cgstAmount: taxResult.cgstAmount,
      sgstAmount: taxResult.sgstAmount,
      igstAmount: taxResult.igstAmount,
      totalTax: taxResult.totalTax,
      totalAmount: taxResult.totalAmount,
      paidAmount: 0,
      dueAmount: taxResult.totalAmount,
      status: 'ISSUED',
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString(),
      items: [
        {
          id: generateId('item'),
          description: `${pkg.name} - Initial Onboarding & Monthly Retainer`,
          sacCode: this.taxConfig.defaultSacCode || '998313',
          quantity: 1,
          unitPrice: pkg.price,
          taxRatePercent: taxResult.taxMode === 'GST' ? 18 : 0,
          taxAmount: taxResult.totalTax,
          totalAmount: taxResult.totalAmount,
        },
      ],
      createdAt: new Date().toISOString(),
    };
    this.invoices.unshift(newInvoice);

    // Record Timeline Activity
    this.activities.unshift({
      id: generateId('act'),
      clientId: newClient.id,
      type: 'ONBOARDING_STARTED',
      title: 'Automated Onboarding Started',
      description: `Client converted from Lead ${lead.id}. ${createdTasks.length} onboarding tasks scheduled. Invoice ${invoiceNumber} issued for ${pkg.name}.`,
      actorName: 'Digital Ranchi OS Engine',
      timestamp: new Date().toISOString(),
    });

    this.saveToFile();

    // Persist to Neon PostgreSQL
    const prisma = await getPrisma();
    if (prisma) {
      try {
        // 1. Ensure Tenant exists
          await prisma.tenant.upsert({
            where: { domain: 'digitalranchi.in' },
            update: {},
            create: {
              id: 'tenant_main',
              name: 'Digital Ranchi',
              domain: 'digitalranchi.in',
              isActive: true,
            },
          }).catch(() => null);

          // 2. Ensure Manager and Assignee exist in User table
          if (manager) {
            await prisma.user.upsert({
              where: { id: manager.id },
              update: { role: (manager.role as any) || 'ACCOUNT_MANAGER' },
              create: {
                id: manager.id,
                tenantId: 'tenant_main',
                name: manager.name,
                email: manager.email,
                phone: manager.phone,
                passwordHash: manager.passwordHash || '$2b$12$e8w3/0M16Hn1Yq0Z2gqgSu3UFSYuS9/G.XTPorPAwFKQebgbEq.',
                role: (manager.role as any) || 'ACCOUNT_MANAGER',
                department: manager.department || 'Client Success',
              },
            }).catch(() => null);
          }

          if (assignee) {
            await prisma.user.upsert({
              where: { id: assignee.id },
              update: { role: (assignee.role as any) || 'DELIVERY_EXECUTIVE' },
              create: {
                id: assignee.id,
                tenantId: 'tenant_main',
                name: assignee.name,
                email: assignee.email,
                phone: assignee.phone,
                passwordHash: assignee.passwordHash || '$2b$12$e8w3/0M16Hn1Yq0Z2gqgSu3UFSYuS9/G.XTPorPAwFKQebgbEq.',
                role: (assignee.role as any) || 'DELIVERY_EXECUTIVE',
                department: assignee.department || 'GBP & Local SEO',
              },
            }).catch(() => null);
          }

          // 3. Mark Lead as WON in DB
          await prisma.lead.update({
            where: { id: lead.id },
            data: { status: 'WON' },
          }).catch(() => null);

          // 4. Create/Upsert Client in DB
          await prisma.client.upsert({
            where: { id: newClient.id },
            update: {
              status: newClient.status,
              healthScore: newClient.healthScore,
            },
            create: {
              id: newClient.id,
              tenantId: newClient.tenantId,
              leadId: lead.id,
              businessName: newClient.businessName,
              category: newClient.category,
              phone: newClient.phone,
              whatsapp: newClient.whatsapp,
              email: newClient.email,
              address: newClient.address,
              city: newClient.city,
              state: newClient.state,
              pincode: newClient.pincode,
              assignedManagerId: manager.id,
              packageId: newClient.packageId,
              packageName: newClient.packageName,
              healthScore: newClient.healthScore,
              monthlyRevenue: newClient.monthlyRevenue,
              activeSince: new Date(newClient.activeSince),
              renewalDate: new Date(newClient.renewalDate),
              reviewCount: newClient.reviewCount,
              averageRating: newClient.averageRating,
              gbpScore: newClient.gbpScore,
              status: newClient.status,
            },
          });

          // 5. Create Project in DB
          await prisma.project.upsert({
            where: { id: newProject.id },
            update: {},
            create: {
              id: newProject.id,
              tenantId: 'tenant_main',
              clientId: newClient.id,
              name: newProject.name,
              projectType: newProject.projectType || 'ONBOARDING',
              status: newProject.status || 'IN_PROGRESS',
              progressPercent: newProject.progressPercent || 10,
              startDate: new Date(newProject.startDate),
              dueDate: new Date(newProject.dueDate),
            },
          }).catch((err: any) => console.error('Prisma project.upsert error:', err));

          // 6. Create all 7 Tasks in DB
          for (const task of createdTasks) {
            await prisma.task.upsert({
              where: { id: task.id },
              update: {
                status: task.status as any,
                priority: task.priority as any,
              },
              create: {
                id: task.id,
                tenantId: 'tenant_main',
                projectId: newProject.id,
                clientId: newClient.id,
                title: task.title,
                description: task.description || task.title,
                status: (task.status as any) || 'BACKLOG',
                priority: (task.priority as any) || 'MEDIUM',
                assignedToId: assignee.id,
                slaDeadline: new Date(task.slaDeadline),
                dueDate: new Date(task.dueDate),
                isRecurring: false,
              },
            }).catch((err: any) => console.error('Prisma task.upsert error for task:', task.title, err));
          }

          // 7. Create Invoice in DB
          await prisma.invoice.upsert({
            where: { id: newInvoice.id },
            update: {},
            create: {
              id: newInvoice.id,
              tenantId: 'tenant_main',
              clientId: newClient.id,
              invoiceNumber: newInvoice.invoiceNumber,
              invoiceType: newInvoice.invoiceType || 'BILL_OF_SUPPLY',
              taxMode: (newInvoice.taxMode as any) || 'NON_GST',
              subtotal: newInvoice.subtotal,
              cgstAmount: newInvoice.cgstAmount || 0,
              sgstAmount: newInvoice.sgstAmount || 0,
              igstAmount: newInvoice.igstAmount || 0,
              totalTax: newInvoice.totalTax || 0,
              totalAmount: newInvoice.totalAmount,
              paidAmount: 0,
              dueAmount: newInvoice.dueAmount,
              status: 'ISSUED',
              dueDate: new Date(newInvoice.dueDate),
              items: {
                create: (newInvoice.items || []).map((item) => ({
                  description: item.description,
                  sacCode: item.sacCode || '998313',
                  quantity: item.quantity || 1,
                  unitPrice: item.unitPrice,
                  taxRatePercent: item.taxRatePercent || 0,
                  taxAmount: item.taxAmount || 0,
                  totalAmount: item.totalAmount,
                })),
              },
            },
          }).catch((err: any) => console.error('Prisma invoice.upsert error:', err));
      } catch (e) {
        console.error('Failed to persist convertLeadToClient in Neon:', e);
      }
    }

    return { client: newClient, project: newProject, tasks: createdTasks, invoice: newInvoice, lead };
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

    this.saveToFile();
    return payment;
  }

  // --- Tasks CRUD ---
  public async createTask(taskData: Omit<Task, 'id' | 'tenantId' | 'createdAt'>): Promise<Task> {
    const newTask: Task = {
      id: generateId('tsk'),
      tenantId: 'tenant_main',
      ...taskData,
      createdAt: new Date().toISOString(),
    };
    this.tasks.unshift(newTask);
    this.saveToFile();

    const prisma = await getPrisma();
    if (prisma) {
      try {
        // Check if clientId exists in database, fallback to first available client
          let targetClientId = newTask.clientId;
          const clientExists = targetClientId
            ? await prisma.client.findUnique({ where: { id: targetClientId } }).catch(() => null)
            : null;
          if (!clientExists) {
            const firstClient = await prisma.client.findFirst().catch(() => null);
            if (firstClient) targetClientId = firstClient.id;
          }

          // Check if assignedToId exists in database, fallback to super admin or first user
          let targetAssigneeId = newTask.assignedToId || 'usr_super_admin';
          const userExists = targetAssigneeId
            ? await prisma.user.findUnique({ where: { id: targetAssigneeId } }).catch(() => null)
            : null;
          if (!userExists) {
            const firstUser = await prisma.user.findFirst({ where: { role: { not: 'CLIENT' } } }).catch(() => null);
            if (firstUser) targetAssigneeId = firstUser.id;
          }

          await prisma.task.create({
            data: {
              id: newTask.id,
              tenantId: newTask.tenantId,
              projectId: newTask.projectId || null,
              clientId: targetClientId,
              title: newTask.title,
              description: newTask.description || newTask.title,
              status: (newTask.status as any) || 'BACKLOG',
              priority: (newTask.priority as any) || 'MEDIUM',
              assignedToId: targetAssigneeId,
              slaDeadline: new Date(newTask.slaDeadline || Date.now() + 86400000),
              dueDate: new Date(newTask.dueDate || Date.now() + 86400000),
              isRecurring: newTask.isRecurring || false,
            },
          }).catch((err: any) => console.error('Prisma task.create error:', err));
      } catch (e) {
        console.error('Failed to persist createTask to Neon:', e);
      }
    }

    return newTask;
  }

  public async updateTask(taskId: string, data: Partial<Task>): Promise<Task> {
    const prisma = await getPrisma();
    if (prisma) {
      try {
        const updatePayload: any = {};
          if (data.title !== undefined) updatePayload.title = data.title;
          if (data.description !== undefined) updatePayload.description = data.description;
          if (data.status !== undefined) {
            updatePayload.status = data.status;
            if (data.status === 'COMPLETED') {
              updatePayload.completedAt = new Date();
            } else if (data.completedAt !== undefined) {
              updatePayload.completedAt = data.completedAt ? new Date(data.completedAt) : null;
            }
          }
          if (data.priority !== undefined) updatePayload.priority = data.priority;
          if (data.assignedToId !== undefined) {
            const userExists = await prisma.user.findUnique({ where: { id: data.assignedToId } }).catch(() => null);
            if (userExists) {
              updatePayload.assignedToId = data.assignedToId;
            }
          }
          if (data.dueDate !== undefined) updatePayload.dueDate = new Date(data.dueDate);
          if (data.slaDeadline !== undefined) updatePayload.slaDeadline = new Date(data.slaDeadline);
          if (data.deliverableUrl !== undefined) updatePayload.deliverableUrl = data.deliverableUrl;
          if (data.deliverableType !== undefined) updatePayload.deliverableType = data.deliverableType;
          if (data.approvalStatus !== undefined) updatePayload.approvalStatus = data.approvalStatus;
          if (data.approvalComment !== undefined) updatePayload.approvalComment = data.approvalComment;

          const updatedDb = await prisma.task.update({
            where: { id: taskId },
            data: updatePayload,
            include: { client: true, assignedTo: true },
          }).catch((err: any) => {
            console.error('Prisma task.update error:', err);
            return null;
          });

          if (updatedDb) {
            const index = this.tasks.findIndex((t) => t.id === taskId);
            if (index !== -1) {
              this.tasks[index] = {
                ...this.tasks[index],
                ...data,
                status: updatedDb.status,
                completedAt: updatedDb.completedAt?.toISOString(),
              };
            }
            this.saveToFile();
            return {
              id: updatedDb.id,
              tenantId: updatedDb.tenantId,
              clientId: updatedDb.clientId,
              clientName: updatedDb.client?.businessName || 'Client Account',
              projectId: updatedDb.projectId || undefined,
              title: updatedDb.title,
              description: updatedDb.description,
              status: updatedDb.status,
              priority: updatedDb.priority,
              assignedToId: updatedDb.assignedToId,
              assignedToName: updatedDb.assignedTo?.name || 'Assigned User',
              slaDeadline: updatedDb.slaDeadline.toISOString(),
              dueDate: updatedDb.dueDate.toISOString(),
              completedAt: updatedDb.completedAt?.toISOString(),
              isRecurring: updatedDb.isRecurring || false,
              createdAt: updatedDb.createdAt.toISOString(),
            };
          }
      } catch (e) {
        console.error('Failed to update task in Neon:', e);
      }
    }

    let index = this.tasks.findIndex((t) => t.id === taskId);
    if (index === -1) {
      await this.syncFromDb();
      index = this.tasks.findIndex((t) => t.id === taskId);
    }
    if (index === -1) throw new Error('Task not found');
    this.tasks[index] = { ...this.tasks[index], ...data };
    this.saveToFile();
    return this.tasks[index];
  }

  // --- Invoices CRUD ---
  public createInvoice(invoiceData: Omit<Invoice, 'id' | 'tenantId' | 'createdAt'>): Invoice {
    const newInvoice: Invoice = {
      id: generateId('inv'),
      tenantId: 'tenant_main',
      ...invoiceData,
      createdAt: new Date().toISOString(),
    };
    this.invoices.unshift(newInvoice);
    this.saveToFile();
    return newInvoice;
  }

  public updateInvoice(invoiceId: string, data: Partial<Invoice>): Invoice {
    const index = this.invoices.findIndex((inv) => inv.id === invoiceId);
    if (index === -1) throw new Error('Invoice not found');
    this.invoices[index] = { ...this.invoices[index], ...data };
    this.saveToFile();
    return this.invoices[index];
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
    this.saveToFile();
    return newUser;
  }

  public updateUser(userId: string, data: Partial<User>): User {
    const cleanId = userId.toLowerCase();
    const index = this.users.findIndex(
      (u) => u.id === userId || (u.email && u.email.toLowerCase() === cleanId)
    );
    if (index === -1) throw new Error('User not found');
    this.users[index] = { ...this.users[index], ...data };
    this.saveToFile();
    return this.users[index];
  }

  public deleteUser(userId: string): boolean {
    const initialLen = this.users.length;
    const cleanId = userId.toLowerCase();
    this.users = this.users.filter(
      (u) => u.id !== userId && (!u.email || u.email.toLowerCase() !== cleanId)
    );
    this.saveToFile();
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
    this.saveToFile();
    return newService;
  }

  public updateService(serviceId: string, data: Partial<Service>): Service {
    const index = this.services.findIndex((s) => s.id === serviceId);
    if (index === -1) throw new Error('Service not found');
    this.services[index] = { ...this.services[index], ...data };
    this.saveToFile();
    return this.services[index];
  }

  public deleteService(serviceId: string): boolean {
    const initialLen = this.services.length;
    this.services = this.services.filter((s) => s.id !== serviceId);
    this.saveToFile();
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
    this.saveToFile();
    return newPkg;
  }

  public updatePackage(pkgId: string, data: Partial<Package>): Package {
    const index = this.packages.findIndex((p) => p.id === pkgId);
    if (index === -1) throw new Error('Package not found');
    this.packages[index] = { ...this.packages[index], ...data };
    this.saveToFile();
    return this.packages[index];
  }

  public deletePackage(pkgId: string): boolean {
    const initialLen = this.packages.length;
    this.packages = this.packages.filter((p) => p.id !== pkgId);
    this.saveToFile();
    return this.packages.length < initialLen;
  }

  // Lead Sources CRUD
  public addLeadSource(name: string): string {
    if (!this.leadSources.includes(name)) {
      this.leadSources.push(name);
      this.saveToFile();
    }
    return name;
  }

  public deleteLeadSource(name: string): boolean {
    const initialLen = this.leadSources.length;
    this.leadSources = this.leadSources.filter((s) => s !== name);
    this.saveToFile();
    return this.leadSources.length < initialLen;
  }

  // --- Standee & Hardware Order Management ---
  public getStandeeOrder(clientId: string): StandeeOrder | null {
    return this.standeeOrders.find((o) => o.clientId === clientId) || null;
  }

  public getStandeeOrderBySlug(slug: string): StandeeOrder | null {
    const clean = slug.toLowerCase().trim();
    return this.standeeOrders.find((o) => o.qrSlug?.toLowerCase() === clean) || null;
  }

  public createStandeeOrder(data: Omit<StandeeOrder, 'id' | 'createdAt' | 'updatedAt'>): StandeeOrder {
    const newOrder: StandeeOrder = {
      id: generateId('ord_stnd'),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.standeeOrders.unshift(newOrder);
    this.saveToFile();
    return newOrder;
  }

  public updateStandeeOrder(orderId: string, data: Partial<StandeeOrder>): StandeeOrder {
    const index = this.standeeOrders.findIndex((o) => o.id === orderId);
    if (index === -1) throw new Error('Standee order not found');
    this.standeeOrders[index] = {
      ...this.standeeOrders[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    this.saveToFile();
    return this.standeeOrders[index];
  }

  // --- AI Review Engine Settings ---
  public getAiReviewSettings(clientId: string): AiReviewSettings {
    const existing = this.aiReviewSettings.find((s) => s.clientId === clientId);
    if (existing) return existing;

    const client = this.clients.find((c) => c.id === clientId);
    const category = (client?.category || '').toLowerCase();
    const city = client?.city || 'Ranchi';

    let businessType = client?.category || 'Salon & Beauty Parlour';
    let keyServices = ['Hair Styling & Cut', 'Bridal Makeup', 'Facial Glow Treatment', 'Hair Spa', 'Hygienic Manicure & Pedicure'];
    let targetKeywords = [`best salon in ${city}`, 'bridal makeup artist', 'hair spa treatment', 'hygienic parlour', 'glowing skin treatment'];
    let customInstructions = 'Highlight courteous staff, skilled hair stylists, spotless salon hygiene, relaxing ambiance, and premium beauty products.';

    if (category.includes('dent') || category.includes('doctor') || category.includes('clinic') || category.includes('health') || category.includes('hospital')) {
      businessType = client?.category || 'Dental Clinic & Implant Center';
      keyServices = ['Painless Treatment', 'Doctor Consultation', 'Clean Clinic', 'Accurate Diagnosis', 'Gentle Care'];
      targetKeywords = [`best clinic in ${city}`, 'painless treatment', 'experienced doctor', 'clean clinic', 'caring staff'];
      customInstructions = 'Highlight compassionate doctor consultation, gentle painless treatment, spotless clinic hygiene, and transparent guidance.';
    } else if (category.includes('food') || category.includes('restaur') || category.includes('cafe') || category.includes('sweet') || category.includes('baker')) {
      businessType = client?.category || 'Restaurant & Cafe';
      keyServices = ['Delicious Fresh Food', 'Quick Table Service', 'Cozy Ambiance', 'Family Dining', 'Authentic Taste'];
      targetKeywords = [`best restaurant in ${city}`, 'delicious food', 'authentic taste', 'must visit cafe', 'quick service'];
      customInstructions = 'Highlight authentic flavors, fresh ingredients, generous portions, quick polite service, and cozy ambiance.';
    } else if (category.includes('salon') || category.includes('beauty') || category.includes('spa') || category.includes('parlour') || category.includes('makeup') || category.includes('hair')) {
      businessType = client?.category || 'Salon & Beauty Parlour';
      keyServices = ['Hair Styling & Cut', 'Bridal Makeup', 'Facial Glow Treatment', 'Hair Spa', 'Hygienic Manicure & Pedicure'];
      targetKeywords = [`best salon in ${city}`, 'bridal makeup artist', 'hair spa treatment', 'hygienic parlour', 'glowing skin treatment'];
      customInstructions = 'Highlight courteous staff, skilled hair stylists, spotless salon hygiene, relaxing ambiance, and premium beauty products.';
    } else if (client?.category) {
      businessType = client.category;
      keyServices = ['Quality Service', 'Honest Pricing', 'Prompt Response', 'Expert Consultation', 'Reliable Support'];
      targetKeywords = [`best ${client.category} in ${city}`, 'quick service', 'honest pricing', 'trustworthy business'];
      customInstructions = 'Highlight courteous staff, punctual fulfillment, and fair transparent pricing.';
    }

    const defaultSettings: AiReviewSettings = {
      clientId,
      businessType,
      keyServices,
      targetKeywords,
      tone: 'PROFESSIONAL',
      isShieldActive: true,
      customInstructions,
      reviewRedirectUrl: client?.googleMapsUrl || '',
      updatedAt: new Date().toISOString(),
    };
    this.aiReviewSettings.push(defaultSettings);
    this.saveToFile();
    return defaultSettings;
  }

  public saveAiReviewSettings(clientId: string, data: Partial<AiReviewSettings>): AiReviewSettings {
    const index = this.aiReviewSettings.findIndex((s) => s.clientId === clientId);
    if (index !== -1) {
      this.aiReviewSettings[index] = {
        ...this.aiReviewSettings[index],
        ...data,
        clientId,
        updatedAt: new Date().toISOString(),
      };
      this.saveToFile();
      return this.aiReviewSettings[index];
    } else {
      const newSettings: AiReviewSettings = {
        clientId,
        businessType: data.businessType || 'Local Business',
        keyServices: data.keyServices || [],
        targetKeywords: data.targetKeywords || [],
        tone: data.tone || 'PROFESSIONAL',
        isShieldActive: data.isShieldActive ?? true,
        customInstructions: data.customInstructions,
        reviewRedirectUrl: data.reviewRedirectUrl,
        updatedAt: new Date().toISOString(),
      };
      this.aiReviewSettings.push(newSettings);
      this.saveToFile();
      return newSettings;
    }
  }

  // --- Private Customer Feedback ---
  public getPrivateFeedbacks(clientId?: string): PrivateFeedback[] {
    if (clientId) {
      return this.privateFeedbacks.filter((f) => f.clientId === clientId);
    }
    return this.privateFeedbacks;
  }

  public addPrivateFeedback(data: Omit<PrivateFeedback, 'id' | 'createdAt'>): PrivateFeedback {
    const newFeedback: PrivateFeedback = {
      id: generateId('fb'),
      ...data,
      createdAt: new Date().toISOString(),
    };
    this.privateFeedbacks.unshift(newFeedback);

    // Update telemetry intercepted complaints
    const telemIndex = this.standeeTelemetries.findIndex((t) => t.clientId === data.clientId);
    if (telemIndex !== -1) {
      this.standeeTelemetries[telemIndex].privateComplaintsIntercepted += 1;
    }

    this.saveToFile();
    return newFeedback;
  }

  public updatePrivateFeedbackStatus(feedbackId: string, status: 'NEW' | 'CONTACTED' | 'RESOLVED', notes?: string): PrivateFeedback {
    const index = this.privateFeedbacks.findIndex((f) => f.id === feedbackId);
    if (index === -1) throw new Error('Feedback not found');
    this.privateFeedbacks[index] = {
      ...this.privateFeedbacks[index],
      status,
      ...(status === 'RESOLVED' && { resolvedAt: new Date().toISOString() }),
      ...(notes !== undefined && { resolutionNotes: notes }),
    };
    this.saveToFile();
    return this.privateFeedbacks[index];
  }

  // --- Standee Telemetry & Scans ---
  public getStandeeTelemetry(clientId: string): StandeeTelemetry {
    const existing = this.standeeTelemetries.find((t) => t.clientId === clientId);
    if (existing) return existing;

    const defaultTelem: StandeeTelemetry = {
      clientId,
      totalScans: 0,
      nfcTaps: 0,
      qrScans: 0,
      aiReviewsGenerated: 0,
      googleRedirects: 0,
      privateComplaintsIntercepted: 0,
      lastScannedAt: undefined,
      scansByDate: [
        { date: 'Mon', taps: 0, scans: 0, reviews: 0 },
        { date: 'Tue', taps: 0, scans: 0, reviews: 0 },
        { date: 'Wed', taps: 0, scans: 0, reviews: 0 },
        { date: 'Thu', taps: 0, scans: 0, reviews: 0 },
        { date: 'Fri', taps: 0, scans: 0, reviews: 0 },
        { date: 'Sat', taps: 0, scans: 0, reviews: 0 },
        { date: 'Sun', taps: 0, scans: 0, reviews: 0 },
      ],
    };
    this.standeeTelemetries.push(defaultTelem);
    this.saveToFile();
    return defaultTelem;
  }

  public recordStandeeScan(clientId: string, type: 'NFC' | 'QR' | 'REVIEW_GEN' | 'GOOGLE_REDIRECT'): StandeeTelemetry {
    let telem = this.standeeTelemetries.find((t) => t.clientId === clientId);
    if (!telem) {
      telem = this.getStandeeTelemetry(clientId);
    }
    telem.lastScannedAt = new Date().toISOString();
    if (type === 'NFC') {
      telem.nfcTaps += 1;
      telem.totalScans += 1;
    } else if (type === 'QR') {
      telem.qrScans += 1;
      telem.totalScans += 1;
    } else if (type === 'REVIEW_GEN') {
      telem.aiReviewsGenerated += 1;
    } else if (type === 'GOOGLE_REDIRECT') {
      telem.googleRedirects += 1;
    }
    this.saveToFile();
    return telem;
  }

  // --- Master Category AI Prompt Configs ---
  public getGlobalAiPromptConfigs(): GlobalAiPromptConfig[] {
    return this.globalAiPromptConfigs;
  }

  public createGlobalAiPromptConfig(data: Omit<GlobalAiPromptConfig, 'id' | 'updatedAt'>): GlobalAiPromptConfig {
    const cleanKey = (data.category || data.displayName || 'category')
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');

    const newConfig: GlobalAiPromptConfig = {
      id: generateId('cfg'),
      ...data,
      category: cleanKey,
      updatedAt: new Date().toISOString(),
    };
    this.globalAiPromptConfigs.push(newConfig);
    this.saveToFile();
    return newConfig;
  }

  public updateGlobalAiPromptConfig(id: string, data: Partial<GlobalAiPromptConfig>): GlobalAiPromptConfig {
    const index = this.globalAiPromptConfigs.findIndex((c) => c.id === id);
    if (index === -1) throw new Error('Global AI config not found');
    this.globalAiPromptConfigs[index] = {
      ...this.globalAiPromptConfigs[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    this.saveToFile();
    return this.globalAiPromptConfigs[index];
  }

  public deleteGlobalAiPromptConfig(id: string): boolean {
    const initialLen = this.globalAiPromptConfigs.length;
    this.globalAiPromptConfigs = this.globalAiPromptConfigs.filter((c) => c.id !== id);
    this.saveToFile();
    return this.globalAiPromptConfigs.length < initialLen;
  }
}

const globalForStore = globalThis as unknown as {
  crmStore: AppStore | undefined;
};

export const globalStore = (() => {
  if (!globalForStore.crmStore) {
    const store = new AppStore();
    store.loadFromFile();
    globalForStore.crmStore = store;
  }
  return globalForStore.crmStore;
})();

