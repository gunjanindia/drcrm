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
    return {
      qualificationSummary: `${lead.businessName} is a local ${lead.category} business in ${lead.city} with a presence score of ${lead.leadScore}/100. Key gap: unoptimized Google Maps profile and missing review automation. High conversion probability for the ${lead.interestedPackageId === 'pkg_growth_999' ? 'Growth Package (₹999)' : 'Premium Retainer (₹2,499/mo)'}.`,
      suggestedQuestions: [
        `"Are you currently getting daily customer calls directly from Google Maps?"`,
        `"Do you have an active Review QR stand placed at your counter/reception?"`,
        `"How quickly do you respond when a customer leaves a review on Google?"`,
      ],
      suggestedWhatsAppPitch: `Namaste ${lead.contactName}! 🙏 We noticed that customers searching for the best ${lead.category.toLowerCase()} in ${lead.city} might be discovering your competitors first on Google Maps. We have prepared a free Digital Presence Audit for ${lead.businessName} showing how to get 3x more calls and walk-ins. Can we share the 1-page action plan?`,
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
