import { NextResponse } from 'next/server';
import { getCurrentUserSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { globalStore } from '@/lib/store';
import {
  GbpDailyOrMonthlyInsight,
  SEEDED_AUTHENTIC_GBP_INSIGHT,
  parseGbpInsightsCsv,
  sortInsightsChronologically,
  MONTH_NAMES,
  MONTH_SHORT_NAMES,
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
    const insights = sortInsightsChronologically(
      memoryInsightsStore[clientKey] || memoryInsightsStore['default'] || []
    );

    return NextResponse.json({
      success: true,
      data: insights,
      count: insights.length,
      latest: insights[insights.length - 1] || null,
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
    const { clientId, csvContent, insightRecord, month, year, periodLabel } = body;

    const clientKey = clientId || session?.clientId || session?.email || 'default';
    let newInsights: GbpDailyOrMonthlyInsight[] = [];

    const monthNum = month || (insightRecord?.month ? parseInt(insightRecord.month, 10) : undefined);
    const yearNum = year || (insightRecord?.year ? parseInt(insightRecord.year, 10) : undefined);

    if (csvContent && typeof csvContent === 'string') {
      newInsights = parseGbpInsightsCsv(csvContent, {
        month: monthNum,
        year: yearNum,
        periodLabel,
      });
    } else if (insightRecord && typeof insightRecord === 'object') {
      const formattedMonth = monthNum || new Date().getMonth() + 1;
      const formattedYear = yearNum || new Date().getFullYear();
      newInsights = [
        {
          ...insightRecord,
          month: formattedMonth,
          year: formattedYear,
          monthName: MONTH_NAMES[formattedMonth - 1] || 'September',
          period: periodLabel || `${MONTH_SHORT_NAMES[formattedMonth - 1] || 'Sep'} ${formattedYear}`,
        },
      ];
    }

    if (newInsights.length === 0) {
      return NextResponse.json(
        { error: 'No valid Google Business Profile insight records parsed from input.' },
        { status: 400 }
      );
    }

    // Merge by (year, month) key to prevent duplicate entries for the same reporting month
    const existing = memoryInsightsStore[clientKey] || [SEEDED_AUTHENTIC_GBP_INSIGHT];
    const map = new Map<string, GbpDailyOrMonthlyInsight>();

    // Put existing in map
    for (const item of existing) {
      const key = `${item.year || 2026}_${item.month || 9}`;
      map.set(key, item);
    }

    // Upsert new insights
    for (const item of newInsights) {
      const key = `${item.year || 2026}_${item.month || 9}`;
      map.set(key, item);
    }

    const merged = sortInsightsChronologically(Array.from(map.values()));
    memoryInsightsStore[clientKey] = merged;

    return NextResponse.json({
      success: true,
      message: `Successfully saved authentic insight for ${newInsights[0].period}. Total tracked months: ${merged.length}.`,
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
