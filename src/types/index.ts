// DIGITAL RANCHI — CORE DOMAIN TYPES & DATA TRANSFER OBJECTS

export type UserRole =
  | 'SUPER_ADMIN'
  | 'BUSINESS_ADMIN'
  | 'SALES_MANAGER'
  | 'SALES_EXECUTIVE'
  | 'OPERATIONS_MANAGER'
  | 'ACCOUNT_MANAGER'
  | 'DELIVERY_EXECUTIVE'
  | 'FINANCE'
  | 'CLIENT';

export type LeadStatus =
  | 'NEW'
  | 'CONTACTED'
  | 'QUALIFIED'
  | 'AUDIT'
  | 'PROPOSAL'
  | 'NEGOTIATION'
  | 'WON'
  | 'LOST';

export type TaskStatus =
  | 'BACKLOG'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'WAITING'
  | 'CLIENT_APPROVAL'
  | 'COMPLETED'
  | 'CANCELLED';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type BillingFrequency = 'ONE_TIME' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';

export type TaxMode = 'NON_GST' | 'GST';

export type InvoiceStatus = 'DRAFT' | 'ISSUED' | 'PAID' | 'PARTIALLY_PAID' | 'OVERDUE' | 'CANCELLED';

export type PaymentStatus = 'CREATED' | 'AUTHORIZED' | 'CAPTURED' | 'FAILED' | 'REFUNDED';

export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'CHANGES_REQUESTED';

export type TicketStatus = 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'WAITING' | 'RESOLVED' | 'CLOSED';

export type TicketCategory =
  | 'WEBSITE'
  | 'GOOGLE_MAPS'
  | 'LOCAL_SEO'
  | 'REVIEWS'
  | 'SOCIAL_MEDIA'
  | 'CREATIVE'
  | 'BILLING'
  | 'TECHNICAL';

export type ClientHealthScore = 'GREEN' | 'YELLOW' | 'RED';

// User & Auth
export interface User {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatarUrl?: string;
  department?: string;
  clientId?: string; // If role === 'CLIENT'
  createdAt: string;
}

// Leads
export interface Lead {
  id: string;
  tenantId: string;
  businessName: string;
  contactName: string;
  phone: string;
  whatsapp: string;
  email: string;
  category: string;
  city: string;
  state: string;
  googleMapsUrl?: string;
  websiteUrl?: string;
  leadSource: string;
  interestedPackageId?: string;
  estimatedValue: number;
  leadScore: number; // 0 - 100
  assignedUserId?: string;
  assignedUserName?: string;
  status: LeadStatus;
  nextFollowUp?: string;
  notes?: string;
  auditScore?: number;
  createdAt: string;
  updatedAt: string;
}

// Clients (360)
export interface Client {
  id: string;
  tenantId: string;
  leadId?: string;
  businessName: string;
  legalName?: string;
  category: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  googleMapsUrl?: string;
  websiteUrl?: string;
  assignedManagerId: string;
  assignedManagerName: string;
  packageId: string;
  packageName: string;
  healthScore: ClientHealthScore;
  healthReason: string;
  monthlyRevenue: number;
  activeSince: string;
  renewalDate: string;
  reviewCount: number;
  averageRating: number;
  gbpScore: number;
  status: 'ACTIVE' | 'ONBOARDING' | 'AT_RISK' | 'PAUSED' | 'CHURNED';
  createdAt: string;
}

// Services & Packages
export interface Service {
  id: string;
  tenantId: string;
  name: string;
  slug: string;
  description: string;
  basePrice: number;
  billingType: BillingFrequency;
  deliverables: string[];
  defaultSlaHours: number;
  category: 'GBP' | 'SEO' | 'WEBSITE' | 'REVIEWS' | 'SOCIAL' | 'AUDIT';
  isActive: boolean;
}

export interface Package {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  tagline: string;
  price: number;
  billingFrequency: BillingFrequency;
  serviceIds: string[];
  services?: Service[];
  features: string[];
  isPopular?: boolean;
  isActive: boolean;
}

// Work Management
export interface Project {
  id: string;
  tenantId: string;
  clientId: string;
  clientName: string;
  name: string;
  projectType: 'ONBOARDING' | 'RECURRING_MONTHLY' | 'WEBSITE_DEV' | 'AUDIT_CAMPAIGN';
  status: 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD';
  progressPercent: number;
  startDate: string;
  dueDate: string;
  createdAt: string;
}

export interface Task {
  id: string;
  tenantId: string;
  projectId?: string;
  clientId: string;
  clientName: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedToId: string;
  assignedToName: string;
  slaDeadline: string;
  dueDate: string;
  isRecurring: boolean;
  recurrenceRuleId?: string;
  deliverableUrl?: string;
  deliverableType?: 'CREATIVE' | 'REPORT' | 'URL' | 'DOCUMENT';
  approvalStatus?: ApprovalStatus;
  approvalComment?: string;
  approvalUpdatedAt?: string;
  completedAt?: string;
  createdAt: string;
}

export interface RecurringTaskRule {
  id: string;
  tenantId: string;
  clientId: string;
  clientName: string;
  titleTemplate: string;
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY';
  category: string;
  assignedToId: string;
  assignedToName: string;
  nextRunDate: string;
  isActive: boolean;
}

// Service Specific Deliverables & Approvals
export interface DeliverableItem {
  id: string;
  tenantId: string;
  clientId: string;
  taskId?: string;
  title: string;
  platform: 'GOOGLE_BUSINESS' | 'INSTAGRAM' | 'FACEBOOK' | 'WEBSITE' | 'REPORT';
  previewUrl: string;
  captionText?: string;
  scheduledFor: string;
  status: ApprovalStatus;
  clientFeedback?: string;
  reviewedAt?: string;
  createdAt: string;
}

// Ticketing
export interface Ticket {
  id: string;
  tenantId: string;
  clientId: string;
  clientName: string;
  ticketNumber: string;
  category: TicketCategory;
  subject: string;
  description: string;
  priority: TaskPriority;
  status: TicketStatus;
  assignedToId?: string;
  assignedToName?: string;
  slaDeadline: string;
  createdAt: string;
  updatedAt: string;
}

// Tax & Billing
export interface TaxConfiguration {
  id: string;
  tenantId: string;
  isGstRegistered: boolean;
  gstin: string | null;
  registrationDate: string | null;
  defaultTaxMode: TaxMode;
  cgstRatePercent: number;
  sgstRatePercent: number;
  igstRatePercent: number;
  defaultSacCode: string;
  invoicePrefix: string;
  termsAndConditions: string;
}

export interface InvoiceItem {
  id: string;
  serviceId?: string;
  description: string;
  sacCode: string;
  quantity: number;
  unitPrice: number;
  taxRatePercent: number;
  taxAmount: number;
  totalAmount: number;
}

export interface Invoice {
  id: string;
  tenantId: string;
  clientId: string;
  clientName: string;
  invoiceNumber: string;
  invoiceType: 'BILL_OF_SUPPLY' | 'TAX_INVOICE';
  taxMode: TaxMode;
  subtotal: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalTax: number;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  status: InvoiceStatus;
  dueDate: string;
  paidAt?: string;
  items: InvoiceItem[];
  createdAt: string;
}

export interface PaymentRecord {
  id: string;
  tenantId: string;
  clientId: string;
  clientName: string;
  invoiceId?: string;
  orderId?: string;
  gateway: 'RAZORPAY' | 'CASH' | 'BANK_TRANSFER' | 'UPI_DIRECT';
  gatewayPaymentId: string;
  gatewayOrderId?: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: PaymentStatus;
  signatureVerified: boolean;
  paidAt: string;
  notes?: string;
}

// Google Business Profile Management
export interface GbpProfile {
  id: string;
  clientId: string;
  clientName: string;
  locationName: string;
  primaryCategory: string;
  rating: number;
  reviewCount: number;
  healthScore: number;
  photosCount: number;
  isVerified: boolean;
  missingAttributes: string[];
  topKeywords: { keyword: string; rank: number; localSearchVolume: string }[];
  lastAuditDate: string;
}

// Digital Presence Audit Output
export interface DigitalPresenceAuditResult {
  businessName: string;
  overallScore: number;
  isVerifiedOnGoogle: boolean;
  breakdown: {
    googleBusinessProfile: number;
    reviewsAndReputation: number;
    photosAndMedia: number;
    websitePresence: number;
    localSeoScore: number;
    socialEngagement: number;
  };
  strengths: string[];
  criticalWeaknesses: string[];
  recommendedImprovements: string[];
  suggestedPackage: {
    id: string;
    name: string;
    price: number;
    frequency: string;
  };
  disclaimer: string;
}

// Activity Timeline
export interface TimelineActivity {
  id: string;
  clientId: string;
  type: 'LEAD_CREATED' | 'CALL_LOGGED' | 'WHATSAPP_SENT' | 'PAYMENT_RECEIVED' | 'ONBOARDING_STARTED' | 'TASK_COMPLETED' | 'APPROVAL_REQUESTED' | 'APPROVAL_GIVEN' | 'REPORT_GENERATED' | 'TICKET_CREATED';
  title: string;
  description: string;
  actorName: string;
  timestamp: string;
}
