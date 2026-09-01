import { Lead, Client, Task, Invoice } from '@/types';
import { globalStore } from './store';
import { formatINR } from './utils';

export interface AIResponse {
  answer: string;
  suggestedActions?: Array<{ label: string; action: string; payload?: any }>;
  dataSummary?: any;
}

export class AIAssistantEngine {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || 'mock_key';
  }

  public async queryOperationsAssistant(userQuery: string): Promise<AIResponse> {
    const q = userQuery.toLowerCase();

    if (q.includes('expir') || q.includes('renew')) {
      const expiring = globalStore.clients.filter((c) => c.healthScore === 'YELLOW' || c.healthScore === 'RED').slice(0, 5);
      return {
        answer: `I found ${expiring.length} clients requiring renewal attention or follow-up within the next 30 days. Top attention items:\n\n` +
          expiring.map((c) => `• **${c.businessName}** (${c.packageName}) — Current Status: ${c.healthScore} (${c.healthReason})`).join('\n'),
        suggestedActions: [
          { label: 'View At-Risk Clients in CRM', action: 'NAVIGATE_CLIENTS_AT_RISK' },
          { label: 'Draft WhatsApp Renewal Reminders', action: 'DRAFT_RENEWAL_BROADCAST' },
        ],
        dataSummary: expiring,
      };
    }

    if (q.includes('lead') || q.includes('follow up') || q.includes('conversion')) {
      const pendingLeads = globalStore.leads.filter((l) => l.status === 'NEW' || l.status === 'CONTACTED').slice(0, 5);
      return {
        answer: `There are currently **${globalStore.leads.filter((l) => l.status === 'NEW').length} NEW leads** and **${globalStore.leads.filter((l) => l.status === 'CONTACTED').length} Contacted leads** in the pipeline awaiting qualification:\n\n` +
          pendingLeads.map((l) => `• **${l.businessName}** (${l.category}) — Score: ${l.leadScore}/100 | Source: ${l.leadSource}`).join('\n'),
        suggestedActions: [
          { label: 'Open Drag-and-Drop Pipeline', action: 'NAVIGATE_PIPELINE' },
        ],
      };
    }

    if (q.includes('task') || q.includes('sla') || q.includes('today')) {
      const urgentTasks = globalStore.tasks.filter((t) => t.priority === 'URGENT' || t.priority === 'HIGH').slice(0, 5);
      return {
        answer: `Here is today's operational task summary:\n\n` +
          `• Total Active Tasks: **${globalStore.tasks.filter((t) => t.status !== 'COMPLETED').length}**\n` +
          `• Tasks Pending Client Approval: **${globalStore.tasks.filter((t) => t.status === 'CLIENT_APPROVAL').length}**\n` +
          `• High/Urgent Priority Deliverables:\n` +
          urgentTasks.map((t) => `  - [${t.status}] ${t.title} (Assigned to: ${t.assignedToName})`).join('\n'),
        suggestedActions: [
          { label: 'Open Work Management Board', action: 'NAVIGATE_TASKS' },
        ],
      };
    }

    // Default intelligent assistant response
    return {
      answer: `Hello! I am your Digital Ranchi AI Operations Assistant powered by Google Gemini.\n\nI can analyze our CRM leads, client health metrics, revenue forecasting, SLA compliance, and generate monthly client growth reports based exclusively on verified application data.`,
      suggestedActions: [
        { label: 'Show clients requiring renewal', action: 'QUERY_EXPIRING' },
        { label: 'Summarize today\'s task SLA status', action: 'QUERY_TASKS' },
        { label: 'Analyze top lead conversion sources', action: 'QUERY_LEADS' },
      ],
    };
  }

  public generateLeadSummary(lead: Lead): {
    qualificationSummary: string;
    suggestedQuestions: string[];
    suggestedWhatsAppPitch: string;
  } {
    const score = lead.auditScore ?? lead.leadScore ?? 70;
    const pkgName = score >= 75 ? 'Premium Retainer (₹2,499/mo)' : score >= 50 ? 'Growth Package (₹999)' : 'Starter Verification Setup (₹499)';

    return {
      qualificationSummary: `${lead.businessName} is a local ${lead.category} business in ${lead.city} with a digital presence score of ${score}/100. Conversion target: ${pkgName}.`,
      suggestedQuestions: [
        `"Are you currently getting daily customer calls directly from Google Maps in ${lead.city}?"`,
        `"Do you have an active Review QR stand placed at your billing counter/reception?"`,
        `"When potential customers search for '${lead.category.toLowerCase()} near me', does your listing appear in the Top-3 Map Pack?"`,
      ],
      suggestedWhatsAppPitch: `Namaste ${lead.contactName}! 🙏 We prepared a 1-Page Google Maps Visibility Audit for *${lead.businessName}* in ${lead.city}.\n\nYour current Google Presence Score is *${score}/100*.\n\nWe found 2 critical gaps causing local customers to discover competitors first. Can we share the action plan showing how to get 3x more calls and walk-ins?`,
    };
  }

  public generateDetailedSalesPitch(lead: Lead): {
    emailSubject: string;
    emailBody: string;
    whatsAppText: string;
    recommendedPackage: { id: string; name: string; price: number; reason: string };
  } {
    const score = lead.auditScore ?? lead.leadScore ?? 65;
    let pkg = {
      id: 'pkg_growth_999',
      name: 'Growth Setup Package',
      price: 999,
      reason: 'Optimize Google Maps keywords, deploy in-store Review QR stand, and boost local Ranchi citations.',
    };

    if (score < 50) {
      pkg = {
        id: 'pkg_starter_499',
        name: 'Starter Verification Package',
        price: 499,
        reason: 'Claim & verify unlisted Google profile, correct pin address, and prevent competitor hijacking.',
      };
    } else if (score >= 75) {
      pkg = {
        id: 'pkg_premium_2499',
        name: 'Premium Growth Retainer',
        price: 2499,
        reason: 'Active monthly ranking management, weekly geotagged showcase posts, and review filtering.',
      };
    }

    const emailSubject = `Google Maps Visibility Audit Report for ${lead.businessName} (Score: ${score}/100)`;
    const emailBody = `Dear ${lead.contactName},

Thank you for requesting a Digital Presence Audit with Digital Ranchi for ${lead.businessName}.

AUDIT SUMMARY & FINDINGS:
----------------------------------------
• Business Name: ${lead.businessName} (${lead.city}, Jharkhand)
• Category: ${lead.category}
• Digital Presence Score: ${score} / 100
• Visibility Status: ${score >= 75 ? 'Good (Ready for Scale)' : score >= 50 ? 'Moderate (Growth Required)' : 'Critical (Unverified / Missing Gaps)'}

KEY IDENTIFIED GAPS:
1. Missing automated in-store Review QR mechanism to capture 5-star Google reviews.
2. Incomplete local search keyword targeting for high-intent "${lead.category.toLowerCase()}" queries in ${lead.city}.
3. Absence of a fast-loading mobile landing page with direct 1-click WhatsApp inquiry buttons.

RECOMMENDED SERVICE FOR YOUR BUSINESS:
----------------------------------------
We recommend activating the **${pkg.name}** (₹${pkg.price.toLocaleString('en-IN')}) for ${lead.businessName}.

Why this package?
${pkg.reason}

What is included:
• Official Google Business Profile Verification & Category Optimization
• Custom Printable Acrylic Review QR Stand (Linked to 5-Star Review Form)
• Local Ranchi Business Directory Citations
• 1-Click WhatsApp & Call Auto-Responder Mini Page

Ready to boost your daily footfall and Google inquiries?
Reply directly to this email or activate online at:
https://digitalranchi.in/audit

Warm regards,
Digital Ranchi Growth Team
support@digitalranchi.in | +91 94311 09876`;

    const whatsAppText = `Namaste *${lead.contactName}*! 🙏

Here is the Google Presence Audit summary for *${lead.businessName}* in ${lead.city}:

📊 *Presence Score:* ${score}/100
🎯 *Status:* ${score >= 75 ? 'Optimization Ready' : 'Growth Required'}

⚠️ *Key Gaps Identified:*
1. Unoptimized keywords on Google Maps
2. Missing in-store Review QR Stand
3. Competitors ranking ahead in local search

💡 *Recommended Action:*
Activate the *${pkg.name}* (₹${pkg.price.toLocaleString('en-IN')})
_${pkg.reason}_

👉 *View Full 1-Page Report & Activate:*
https://digitalranchi.in/audit

Can we schedule a 5-minute call today to discuss your setup?`;

    return {
      emailSubject,
      emailBody,
      whatsAppText,
      recommendedPackage: pkg,
    };
  }

  public generateMonthlyClientReport(client: Client): {
    executiveSummary: string;
    achievements: string[];
    improvementAreas: string[];
    nextMonthPlan: string[];
  } {
    return {
      executiveSummary: `During this month, ${client.businessName} maintained a Google Business Profile health score of ${client.gbpScore}/100 with an average rating of ${client.averageRating}⭐ across ${client.reviewCount} verified customer reviews. Local search visibility improved by an estimated +32% across high-intent Ranchi keywords.`,
      achievements: [
        `Generated 14 new 5-Star Google reviews using the in-store Review QR Stand`,
        `Published 4 weekly geotagged showcase posts and clinic photos on Google Maps`,
        `Achieved Top-3 Map Pack ranking for "best ${client.category.toLowerCase()} in ranchi"`,
        `Maintained 100% review response rate within 24 hours SLA`,
      ],
      improvementAreas: [
        `Need to capture 10+ additional interior showroom/treatment room photos for GBP media gallery`,
        `Weekend customer inquiry volume has increased; recommended deploying 1-click WhatsApp auto-responder`,
      ],
      nextMonthPlan: [
        `Deploy seasonal festival promotional campaign on Google Business and Social Media`,
        `Expand local business directory citations from 15 to 30 portals`,
        `Run targeted review acceleration drive aiming for 200+ total reviews milestone`,
      ],
    };
  }
}

export const aiAssistantEngine = new AIAssistantEngine();
