import { NextResponse } from 'next/server';
import { getCurrentUserSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { globalStore } from '@/lib/store';
import {
  GbpDailyOrMonthlyInsight,
  SEEDED_AUTHENTIC_GBP_INSIGHT,
  parseGbpInsightsCsv,
} from '@/lib/gbp-insights-engine';
import { getSyncedBusinessProfile, saveSyncedBusinessProfile } from '@/lib/client-portal-sync';

// In-memory fallback insight repository keyed by clientId or businessName
const memoryInsightsStore: Record<string, GbpDailyOrMonthlyInsight[]> = {
  default: [SEEDED_AUTHENTIC_GBP_INSIGHT],
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const requestedClientId = searchParams.get('clientId');
    const session = await getCurrentUserSession();

    const clientKey = requestedClientId || session?.clientId || session?.email || 'default';
    const insights = memoryInsightsStore[clientKey] || memoryInsightsStore['default'] || [];

    return NextResponse.json({
      success: true,
      data: insights,
      count: insights.length,
      latest: insights[0] || null,
    });
  } catch (error: any) {
    console.error('GET /api/portal/insights error:', error);
    return NextResponse.json({ error: 'Failed to fetch GBP insights' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getCurrentUserSession();
    const body = await request.json();
    const { clientId, csvContent, insightRecord, periodLabel } = body;

    const clientKey = clientId || session?.clientId || session?.email || 'default';
    let newInsights: GbpDailyOrMonthlyInsight[] = [];

    if (csvContent && typeof csvContent === 'string') {
      newInsights = parseGbpInsightsCsv(csvContent, periodLabel);
    } else if (insightRecord && typeof insightRecord === 'object') {
      newInsights = [insightRecord];
    }

    if (newInsights.length === 0) {
      return NextResponse.json(
        { error: 'No valid Google Business Profile insight records parsed from input.' },
        { status: 400 }
      );
    }

    // Merge with existing
    const existing = memoryInsightsStore[clientKey] || [];
    const merged = [...newInsights, ...existing];
    memoryInsightsStore[clientKey] = merged;

    return NextResponse.json({
      success: true,
      message: `Successfully stored ${newInsights.length} authentic Google Business Profile insight record(s).`,
      data: merged,
      latest: newInsights[0],
    });
  } catch (error: any) {
    console.error('POST /api/portal/insights error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to process and store GBP insights.' },
      { status: 500 }
    );
  }
}
