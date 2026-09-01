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
import { prisma } from './prisma';

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
        name: 'Gunjan Kumar',
        email: 'gunjan.india@gmail.com',
        phone: '+91 7004700318',
        role: 'SUPER_ADMIN',
        department: 'Executive',
        createdAt: '2026-01-01T10:00:00Z',
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
          services: this.services,
          packages: this.packages,
          users: this.users,
          leadSources: this.leadSources,
        };
        fs.writeFileSync(storeFile, JSON.stringify(data, null, 2), 'utf-8');
      } catch (e) {
        console.error('Failed to save CRM store to disk:', e);
      }
    }
  }

  public async loadFromFile() {
    if (typeof window === 'undefined') {
      if (process.env.DATABASE_URL) {
        await this.syncFromDb();
        return;
      }
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
          if (data.services && Array.isArray(data.services)) this.services = data.services;
          if (data.packages && Array.isArray(data.packages)) this.packages = data.packages;
          if (data.users && Array.isArray(data.users)) this.users = data.users;
        }
      } catch (e) {
        console.error('Failed to load CRM store from disk:', e);
      }
    }
  }

  public async syncFromDb() {
    if (typeof window === 'undefined' && process.env.DATABASE_URL) {
      try {
        const { prisma } = require('@/lib/prisma');
        if (prisma) {
          const [dbUsers, dbClients, dbLeads, dbTasks, dbProjects, dbServices, dbPackages, dbTax] = await Promise.all([
            prisma.user.findMany().catch(() => []),
            prisma.client.findMany().catch(() => []),
            prisma.lead.findMany({ orderBy: { createdAt: 'desc' } }).catch(() => []),
            prisma.task.findMany({ orderBy: { createdAt: 'desc' } }).catch(() => []),
            prisma.project.findMany().catch(() => []),
            prisma.service.findMany().catch(() => []),
            prisma.package.findMany().catch(() => []),
            prisma.taxConfiguration.findFirst().catch(() => null),
          ]);

          if (dbUsers && Array.isArray(dbUsers) && dbUsers.length > 0) {
            this.users = dbUsers.map((u: any) => ({
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

          if (dbTasks && Array.isArray(dbTasks)) {
            this.tasks = dbTasks.map((t: any) => ({
              id: t.id,
              tenantId: t.tenantId,
              clientId: t.clientId,
              clientName: t.clientName || 'Client',
              projectId: t.projectId || undefined,
              title: t.title,
              description: t.description || t.title,
              category: t.category || 'GBP_SETUP',
              priority: t.priority,
              status: t.status,
              assignedToId: t.assignedToId,
              assignedToName: t.assignedToId === 'usr_del_exec1' ? 'Rohan Gupta' : 'Anjali Kumari',
              slaHours: 48,
              slaDeadline: t.slaDeadline ? new Date(t.slaDeadline).toISOString() : new Date().toISOString(),
              dueDate: t.dueDate ? new Date(t.dueDate).toISOString() : new Date().toISOString(),
              isRecurring: t.isRecurring || false,
              createdAt: t.createdAt ? new Date(t.createdAt).toISOString() : new Date().toISOString(),
            }));
          }
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
    if (typeof window === 'undefined' && process.env.DATABASE_URL) {
      try {
        const { prisma } = require('@/lib/prisma');
        if (prisma) {
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
        }
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
    if (typeof window === 'undefined' && process.env.DATABASE_URL) {
      try {
        const { prisma } = require('@/lib/prisma');
        if (prisma) {
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
        }
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

    if (typeof window === 'undefined' && process.env.DATABASE_URL) {
      try {
        const { prisma } = require('@/lib/prisma');
        if (prisma) {
          await prisma.lead.delete({
            where: { id: leadId },
          }).catch(() => null);
        }
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
    if (typeof window === 'undefined' && process.env.DATABASE_URL) {
      try {
        const { prisma } = require('@/lib/prisma');
        if (prisma) {
          await prisma.lead.update({
            where: { id: lead.id },
            data: { status: 'WON' },
          }).catch(() => null);

          await prisma.client.upsert({
            where: { id: newClient.id },
            update: {},
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
              assignedManagerId: newClient.assignedManagerId,
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
          }).catch((err: any) => console.error('Prisma client.upsert error:', err));
        }
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
  public createTask(taskData: Omit<Task, 'id' | 'tenantId' | 'createdAt'>): Task {
    const newTask: Task = {
      id: generateId('tsk'),
      tenantId: 'tenant_main',
      ...taskData,
      createdAt: new Date().toISOString(),
    };
    this.tasks.unshift(newTask);
    this.saveToFile();
    return newTask;
  }

  public updateTask(taskId: string, data: Partial<Task>): Task {
    const index = this.tasks.findIndex((t) => t.id === taskId);
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
    const index = this.users.findIndex((u) => u.id === userId);
    if (index === -1) throw new Error('User not found');
    this.users[index] = { ...this.users[index], ...data };
    this.saveToFile();
    return this.users[index];
  }

  public deleteUser(userId: string): boolean {
    const initialLen = this.users.length;
    this.users = this.users.filter((u) => u.id !== userId);
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

