import { prisma } from './prisma';
import { globalStore } from './store';

// Gemini 1.5 Flash GCP Official Rates (USD per 1M tokens)
const GEMINI_INPUT_COST_PER_MILLION_USD = 0.075;
const GEMINI_OUTPUT_COST_PER_MILLION_USD = 0.30;
const USD_TO_INR_RATE = 86.5;

// In-memory fallback tracking for demo/offline resilience
const inMemoryCreditWallet: Map<string, number> = new Map();
const inMemoryTrialEnd: Map<string, number> = new Map();
const inMemoryAiLogs: Array<any> = [];

export interface DeductCreditParams {
  userId?: string;
  clientId?: string;
  userName?: string;
  businessName?: string;
  action: 'REVIEW_REPLY' | 'SITE_BUILDER_AI_FILL' | 'AI_TEMPLATE_SYNTHESIS' | 'AI_AGENT_QUERY' | 'LEAD_INTELLIGENCE' | 'GOOGLE_PLACES_SYNC' | 'GOOGLE_MAPS_LOOKUP' | 'GOOGLE_REVIEWS_API';
  featureName: string;
  creditsToDeduct?: number;
  promptText?: string;
  completionText?: string;
  promptTokens?: number;
  completionTokens?: number;
  metadata?: Record<string, any>;
}

export interface LogGoogleApiUsageParams {
  userId?: string;
  clientId?: string;
  userName?: string;
  businessName?: string;
  action?: 'GOOGLE_PLACES_SYNC' | 'GOOGLE_MAPS_LOOKUP' | 'GOOGLE_REVIEWS_API' | 'GOOGLE_MAPS_GEOCODE';
  featureName: string;
  apiType?: 'PLACES_TEXT_SEARCH' | 'PLACES_DETAILS' | 'PLACES_REVIEWS' | 'MAPS_GEOCODE';
  callsCount?: number;
  metadata?: Record<string, any>;
}

// Google Places & Maps API Official GCP Billing Pricing (USD)
const GOOGLE_API_COSTS_USD: Record<string, number> = {
  PLACES_TEXT_SEARCH: 0.032, // $32 per 1,000 requests
  PLACES_DETAILS: 0.017,     // $17 per 1,000 requests
  PLACES_REVIEWS: 0.025,     // $25 per 1,000 requests
  MAPS_GEOCODE: 0.005,       // $5 per 1,000 requests
  DEFAULT: 0.017,
};

/**
 * Log Google Places & Maps Platform API usage, request count, and infrastructure cost per client
 */
export async function logGoogleApiUsage(params: LogGoogleApiUsageParams): Promise<{ logId: string; totalCostUsd: number; totalCostInr: number }> {
  const callsCount = params.callsCount || 1;
  const costPerCallUsd = GOOGLE_API_COSTS_USD[params.apiType || 'DEFAULT'] || 0.017;
  const totalCostUsd = Number((costPerCallUsd * callsCount).toFixed(6));
  const totalCostInr = Number((totalCostUsd * USD_TO_INR_RATE).toFixed(4));

  const uName = params.userName || 'Portal Client';
  const bName = params.businessName || 'Google Maps Verified Client';
  const actionName = params.action || 'GOOGLE_PLACES_SYNC';
  const logId = `glog_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

  if (process.env.DATABASE_URL && prisma) {
    try {
      await prisma.aiCreditUsageLog.create({
        data: {
          tenantId: 'tenant_main',
          userId: params.userId || null,
          clientId: params.clientId || null,
          userName: uName,
          businessName: bName,
          action: actionName,
          featureName: params.featureName,
          creditsDeducted: 0,
          promptTokens: callsCount,
          completionTokens: 0,
          totalTokens: callsCount,
          estimatedCostUsd: totalCostUsd,
          estimatedCostInr: totalCostInr,
          status: 'SUCCESS',
          metadata: {
            apiProvider: 'Google Maps / Places Platform API',
            apiType: params.apiType || 'PLACES_DETAILS',
            callsCount,
            costPerCallUsd,
            ...(params.metadata || {}),
          },
        },
      });
    } catch (e) {
      console.warn('Error saving Google API expense log to Prisma:', e);
    }
  }

  inMemoryAiLogs.unshift({
    id: logId,
    clientId: params.clientId || null,
    userId: params.userId || null,
    userName: uName,
    businessName: bName,
    action: actionName,
    featureName: params.featureName,
    creditsDeducted: 0,
    promptTokens: callsCount,
    completionTokens: 0,
    totalTokens: callsCount,
    estimatedCostUsd: totalCostUsd,
    estimatedCostInr: totalCostInr,
    status: 'SUCCESS',
    createdAt: new Date().toISOString(),
    metadata: {
      apiProvider: 'Google Maps / Places Platform API',
      apiType: params.apiType || 'PLACES_DETAILS',
      callsCount,
      costPerCallUsd,
      ...(params.metadata || {}),
    },
  });

  return { logId, totalCostUsd, totalCostInr };
}

export interface CreditCheckResult {
  allowed: boolean;
  remainingCredits: number;
  trialDaysLeft: number;
  isTrialActive: boolean;
  subscriptionStatus: string;
  error?: string;
  message?: string;
  logId?: string;
}

/**
 * Estimate token count from text using standard ~4 characters per token heuristic
 */
export function estimateTokens(text: string): number {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
}

/**
 * Calculate GCP Cost in USD and INR for Gemini 1.5 Flash
 */
export function calculateGcpCost(promptTokens: number, completionTokens: number): { costUsd: number; costInr: number } {
  const inputCost = (promptTokens / 1_000_000) * GEMINI_INPUT_COST_PER_MILLION_USD;
  const outputCost = (completionTokens / 1_000_000) * GEMINI_OUTPUT_COST_PER_MILLION_USD;
  const totalUsd = Number((inputCost + outputCost).toFixed(8));
  const totalInr = Number((totalUsd * USD_TO_INR_RATE).toFixed(6));
  return { costUsd: totalUsd, costInr: totalInr };
}

/**
 * Get current AI Credit balance and subscription/trial status
 */
export async function getClientCreditBalance(identifier: {
  userId?: string;
  clientId?: string;
  email?: string;
}): Promise<{
  credits: number;
  trialEndsAt: Date;
  trialDaysLeft: number;
  isTrialActive: boolean;
  subscriptionStatus: string;
  isGbpLinked: boolean;
}> {
  const defaultTrialDurationDays = 14;
  const now = new Date();

  if (process.env.DATABASE_URL && prisma) {
    try {
      let client = null;
      let user = null;

      if (identifier.clientId) {
        client = await prisma.client.findUnique({ where: { id: identifier.clientId } });
      }
      if (!client && identifier.userId) {
        user = await prisma.user.findUnique({ where: { id: identifier.userId } });
        if (user?.clientId) {
          client = await prisma.client.findUnique({ where: { id: user.clientId } });
        }
      }
      if (!client && identifier.email) {
        client = await prisma.client.findFirst({
          where: { email: { equals: identifier.email.toLowerCase(), mode: 'insensitive' } },
        });
        if (!user) {
          user = await prisma.user.findFirst({
            where: { email: { equals: identifier.email.toLowerCase(), mode: 'insensitive' } },
          });
        }
      }

      if (client) {
        const trialEnd = client.trialEndsAt || new Date(client.createdAt.getTime() + defaultTrialDurationDays * 86400000);
        const msLeft = trialEnd.getTime() - now.getTime();
        const daysLeft = Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)));
        const isTrialActive = daysLeft > 0 || client.subscriptionStatus === 'ACTIVE';

        return {
          credits: client.aiCreditBalance ?? 20,
          trialEndsAt: trialEnd,
          trialDaysLeft: daysLeft,
          isTrialActive,
          subscriptionStatus: client.subscriptionStatus || (daysLeft > 0 ? 'TRIAL' : 'EXPIRED'),
          isGbpLinked: client.isGbpLinked ?? false,
        };
      }

      if (user) {
        const trialEnd = user.trialEndsAt || new Date(user.createdAt.getTime() + defaultTrialDurationDays * 86400000);
        const msLeft = trialEnd.getTime() - now.getTime();
        const daysLeft = Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)));
        const isTrialActive = daysLeft > 0 || user.subscriptionStatus === 'ACTIVE';

        return {
          credits: user.aiCreditBalance ?? 20,
          trialEndsAt: trialEnd,
          trialDaysLeft: daysLeft,
          isTrialActive,
          subscriptionStatus: user.subscriptionStatus || (daysLeft > 0 ? 'TRIAL' : 'EXPIRED'),
          isGbpLinked: false,
        };
      }
    } catch (err) {
      console.warn('Error fetching credit balance from Prisma, falling back to store:', err);
    }
  }

  // Fallback to in-memory store
  const key = identifier.clientId || identifier.userId || identifier.email || 'default_client';
  const credits = inMemoryCreditWallet.has(key) ? inMemoryCreditWallet.get(key)! : 20;
  
  if (!inMemoryTrialEnd.has(key)) {
    inMemoryTrialEnd.set(key, Date.now() + defaultTrialDurationDays * 86400000);
  }
  const trialEndMs = inMemoryTrialEnd.get(key)!;
  const daysLeft = Math.max(0, Math.ceil((trialEndMs - Date.now()) / (1000 * 60 * 60 * 24)));

  return {
    credits,
    trialEndsAt: new Date(trialEndMs),
    trialDaysLeft: daysLeft,
    isTrialActive: daysLeft > 0,
    subscriptionStatus: daysLeft > 0 ? 'TRIAL' : 'EXPIRED',
    isGbpLinked: true,
  };
}

/**
 * Validate balance, deduct AI credit, compute token usage and GCP cost, and record audit log
 */
export async function checkAndDeductAiCredits(params: DeductCreditParams): Promise<CreditCheckResult> {
  const creditsToDeduct = params.creditsToDeduct ?? 1;
  const balanceInfo = await getClientCreditBalance({
    userId: params.userId,
    clientId: params.clientId,
  });

  const promptTokens = params.promptTokens || (params.promptText ? estimateTokens(params.promptText) : 150);
  const completionTokens = params.completionTokens || (params.completionText ? estimateTokens(params.completionText) : 350);
  const totalTokens = promptTokens + completionTokens;
  const { costUsd, costInr } = calculateGcpCost(promptTokens, completionTokens);

  const uName = params.userName || 'Client User';
  const bName = params.businessName || 'Client Business';

  // 1. Check if credits are exhausted
  if (balanceInfo.credits < creditsToDeduct) {
    // Record blocked attempt log
    try {
      if (process.env.DATABASE_URL && prisma) {
        await prisma.aiCreditUsageLog.create({
          data: {
            tenantId: 'tenant_main',
            userId: params.userId || null,
            clientId: params.clientId || null,
            userName: uName,
            businessName: bName,
            action: params.action,
            featureName: params.featureName,
            creditsDeducted: 0,
            promptTokens,
            completionTokens: 0,
            totalTokens: promptTokens,
            estimatedCostUsd: 0,
            estimatedCostInr: 0,
            status: 'BLOCKED_NO_CREDITS',
            metadata: params.metadata ? JSON.parse(JSON.stringify(params.metadata)) : undefined,
          },
        });
      }
    } catch (e) {
      console.warn('Could not log blocked credit attempt in Prisma:', e);
    }

    return {
      allowed: false,
      remainingCredits: balanceInfo.credits,
      trialDaysLeft: balanceInfo.trialDaysLeft,
      isTrialActive: balanceInfo.isTrialActive,
      subscriptionStatus: balanceInfo.subscriptionStatus,
      error: 'AI_CREDITS_EXHAUSTED',
      message: `You have consumed all ${balanceInfo.credits} available AI credits. Please recharge your AI Wallet or upgrade your subscription to continue using AI tools.`,
    };
  }

  // 2. Deduct credits
  const newBalance = Math.max(0, balanceInfo.credits - creditsToDeduct);
  let createdLogId = `log_${Date.now()}`;

  if (process.env.DATABASE_URL && prisma) {
    try {
      // Update Client
      if (params.clientId) {
        await prisma.client.update({
          where: { id: params.clientId },
          data: { aiCreditBalance: newBalance },
        });
      }
      // Update User if present
      if (params.userId) {
        await prisma.user.update({
          where: { id: params.userId },
          data: { aiCreditBalance: newBalance },
        });
      }

      // Record immutable audit log
      const log = await prisma.aiCreditUsageLog.create({
        data: {
          tenantId: 'tenant_main',
          userId: params.userId || null,
          clientId: params.clientId || null,
          userName: uName,
          businessName: bName,
          action: params.action,
          featureName: params.featureName,
          creditsDeducted: creditsToDeduct,
          promptTokens,
          completionTokens,
          totalTokens,
          estimatedCostUsd: costUsd,
          estimatedCostInr: costInr,
          status: 'SUCCESS',
          metadata: params.metadata ? JSON.parse(JSON.stringify(params.metadata)) : undefined,
        },
      });
      createdLogId = log.id;
    } catch (dbErr) {
      console.warn('Prisma AI credit deduction update error, falling back to memory:', dbErr);
      const key = params.clientId || params.userId || 'default_client';
      inMemoryCreditWallet.set(key, newBalance);
    }
  } else {
    const key = params.clientId || params.userId || 'default_client';
    inMemoryCreditWallet.set(key, newBalance);
  }

  // Also record in memory log array for fast in-session admin view
  inMemoryAiLogs.unshift({
    id: createdLogId,
    clientId: params.clientId || null,
    userId: params.userId || null,
    userName: uName,
    businessName: bName,
    action: params.action,
    featureName: params.featureName,
    creditsDeducted: creditsToDeduct,
    promptTokens,
    completionTokens,
    totalTokens,
    estimatedCostUsd: costUsd,
    estimatedCostInr: costInr,
    status: 'SUCCESS',
    createdAt: new Date().toISOString(),
  });

  return {
    allowed: true,
    remainingCredits: newBalance,
    trialDaysLeft: balanceInfo.trialDaysLeft,
    isTrialActive: balanceInfo.isTrialActive,
    subscriptionStatus: balanceInfo.subscriptionStatus,
    logId: createdLogId,
  };
}

/**
 * Admin utility to recharge or grant AI Credits to a client
 */
export async function grantAiCredits(params: {
  clientId?: string;
  userId?: string;
  creditsToAdd: number;
  adminName: string;
  note?: string;
}): Promise<{ success: boolean; newBalance: number }> {
  const current = await getClientCreditBalance({
    clientId: params.clientId,
    userId: params.userId,
  });
  const newBalance = current.credits + params.creditsToAdd;

  if (process.env.DATABASE_URL && prisma) {
    try {
      if (params.clientId) {
        await prisma.client.update({
          where: { id: params.clientId },
          data: { aiCreditBalance: newBalance },
        });
      }
      if (params.userId) {
        await prisma.user.update({
          where: { id: params.userId },
          data: { aiCreditBalance: newBalance },
        });
      }

      await prisma.aiCreditUsageLog.create({
        data: {
          tenantId: 'tenant_main',
          userId: params.userId || null,
          clientId: params.clientId || null,
          userName: params.adminName,
          businessName: 'Admin Wallet Top-Up',
          action: 'AI_AGENT_QUERY',
          featureName: `Recharge +${params.creditsToAdd} Credits (${params.note || 'Admin Grant'})`,
          creditsDeducted: -params.creditsToAdd,
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0,
          estimatedCostUsd: 0,
          estimatedCostInr: 0,
          status: 'SUCCESS',
        },
      });
    } catch (e) {
      console.warn('Error updating Prisma on credit grant:', e);
    }
  }

  const key = params.clientId || params.userId || 'default_client';
  inMemoryCreditWallet.set(key, newBalance);

  return { success: true, newBalance };
}

/**
 * Retrieve recent AI usage logs for Admin Monitoring
 */
export async function getAiUsageLogs(limit: number = 100): Promise<Array<any>> {
  if (process.env.DATABASE_URL && prisma) {
    try {
      const logs = await prisma.aiCreditUsageLog.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
      });
      if (logs && logs.length > 0) {
        return logs.map((l) => ({
          id: l.id,
          clientId: l.clientId,
          userId: l.userId,
          userName: l.userName,
          businessName: l.businessName,
          action: l.action,
          featureName: l.featureName,
          creditsDeducted: l.creditsDeducted,
          promptTokens: l.promptTokens,
          completionTokens: l.completionTokens,
          totalTokens: l.totalTokens,
          estimatedCostUsd: l.estimatedCostUsd,
          estimatedCostInr: l.estimatedCostInr,
          status: l.status,
          createdAt: l.createdAt.toISOString(),
          metadata: l.metadata,
        }));
      }
    } catch (err) {
      console.warn('Error querying Prisma AI logs, using in-memory list:', err);
    }
  }
  return inMemoryAiLogs.slice(0, limit);
}
