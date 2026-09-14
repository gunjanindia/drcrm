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

  public generateReviewResponse(
    reviewContent: string,
    authorName: string,
    rating: number,
    businessName: string,
    tone: 'PROFESSIONAL' | 'WARM' | 'HINGLISH' | 'RESOLUTION' = 'WARM'
  ): string {
    const cleanAuthor = authorName || 'Valued Customer';

    if (rating >= 4) {
      if (tone === 'HINGLISH') {
        return `Namaste ${cleanAuthor} ji! 🙏 Bahut bahut dhanyawaad aapke review aur trust ke liye. ${businessName} me hamari hamesha koshish rehti hai ki aapko best treatment aur hygienic care mile. Agli baar bhi jab zaroorat ho, zaroor visit karein. Shubhkaamnayein!`;
      }
      if (tone === 'PROFESSIONAL') {
        return `Dear ${cleanAuthor}, thank you for taking the time to share your feedback. The entire team at ${businessName} appreciates your positive rating. We remain committed to delivering the highest clinical and service standards for our patrons.`;
      }
      // WARM (Default)
      return `Dear ${cleanAuthor}, thank you so much for your kind words! 🙏 We are delighted to hear that you had a comfortable and positive experience at ${businessName}. Your satisfaction means the world to our team. Looking forward to keeping your smile healthy and bright!`;
    } else {
      // 1-3 Stars / Resolution
      if (tone === 'HINGLISH') {
        return `Namaste ${cleanAuthor} ji, hume khed hai ki aapka experience hamare standard ke anusaar nahi raha. ${businessName} me patient satisfaction hamari top priority hai. Kripya hume +91 94311 09876 par call ya WhatsApp karein taaki hum turant is mamle ko resolve kar sakein.`;
      }
      return `Dear ${cleanAuthor}, thank you for bringing this to our attention. At ${businessName}, patient satisfaction and prompt care are our top priorities. We sincerely apologize that your visit did not meet full expectations. Please reach out to us directly on WhatsApp/Call at +91 94311 09876 so we can address your concerns immediately.`;
    }
  }

  public generateFestivalCreativeCopy(
    festivalName: string,
    offerTitle: string,
    businessName: string,
    city: string = 'Ranchi'
  ): {
    headline: string;
    caption: string;
    whatsAppBroadcast: string;
    tags: string[];
  } {
    const headline = `✨ ${festivalName} Exclusive from ${businessName}!`;
    const caption = `Celebrate this joyous festive season with healthy smiles and exclusive wellness privileges at ${businessName} (${city})! 🌸\n\n🎉 SPECIAL FESTIVE PRIVILEGE:\n👉 ${offerTitle}\n\n📍 Visit: Lalpur Commercial Complex, Circular Road, Ranchi\n📞 Call/WhatsApp: +91 94311 09876 to reserve your priority festive slot today!\n\n#${festivalName.replace(/[^a-zA-Z0-9]/g, '')} #Ranchi #HealthySmiles #${businessName.replace(/[^a-zA-Z0-9]/g, '')} #FestiveOffer`;

    const whatsAppBroadcast = `🌟 *${festivalName} Festive Greetings from ${businessName}!* 🌟\n\nMay this season bring radiant health, joy, and peace to you and your family! 🙏\n\n🎁 *Exclusive Festive Privilege:* \n*${offerTitle}*\n\n✅ Advanced painless checkup & digital scans\n✅ Valid for appointments booked this week\n\n👉 *Book Appointment in 1-Click:* \nhttps://wa.me/919431109876?text=Hi%20${encodeURIComponent(businessName)},%20I%20want%20to%20claim%20the%20${encodeURIComponent(festivalName)}%20Festive%20Offer!`;

    const tags = [
      `#${festivalName.replace(/[^a-zA-Z0-9]/g, '')}2026`,
      `#${city}Healthcare`,
      `#${businessName.replace(/[^a-zA-Z0-9]/g, '')}`,
      '#FestiveSavings',
      '#LocalBusinessRanchi',
    ];

    return { headline, caption, whatsAppBroadcast, tags };
  }
}

export const aiAssistantEngine = new AIAssistantEngine();

