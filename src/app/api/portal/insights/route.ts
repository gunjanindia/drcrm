import { NextResponse } from 'next/server';
import { getCurrentUserSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  GbpDailyOrMonthlyInsight,
  SEEDED_AUTHENTIC_GBP_INSIGHT,
  parseGbpInsightsCsv,
  sortInsightsChronologically,
  MONTH_NAMES,
  MONTH_SHORT_NAMES,
} from '@/lib/gbp-insights-engine';

// In-memory fallback cache
const memoryInsightsStore: Record<string, GbpDailyOrMonthlyInsight[]> = {
  default: [SEEDED_AUTHENTIC_GBP_INSIGHT],
};

function formatDbInsightToGbp(dbRecord: any): GbpDailyOrMonthlyInsight {
  return {
    id: dbRecord.id,
    period: dbRecord.period,
    year: dbRecord.year,
    month: dbRecord.month,
    monthName: dbRecord.monthName,
    shopCode: dbRecord.shopCode || '',
    businessName: dbRecord.businessName,
    address: dbRecord.address || '',
    labels: dbRecord.labels || '',
    searchMobile: dbRecord.searchMobile,
    searchDesktop: dbRecord.searchDesktop,
    mapsMobile: dbRecord.mapsMobile,
    mapsDesktop: dbRecord.mapsDesktop,
    calls: dbRecord.calls,
    messages: dbRecord.messages,
    bookings: dbRecord.bookings,
    directions: dbRecord.directions,
    websiteClicks: dbRecord.websiteClicks,
    foodOrders: dbRecord.foodOrders || 0,
    foodMenuClicks: dbRecord.foodMenuClicks || 0,
    hotelBookings: dbRecord.hotelBookings || 0,
    totalSearchViews: dbRecord.totalSearchViews,
    totalMapsViews: dbRecord.totalMapsViews,
    totalViews: dbRecord.totalViews,
    totalActions: dbRecord.totalActions,
    importedAt: dbRecord.importedAt ? new Date(dbRecord.importedAt).toLocaleString() : new Date().toLocaleString(),
    source: (dbRecord.source as any) || 'CSV_UPLOAD',
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const requestedClientId = searchParams.get('clientId');
    const requestedBusinessName = searchParams.get('businessName');
    const session = await getCurrentUserSession();

    const clientKey = requestedClientId || session?.clientId || session?.email || 'default';
    const businessNameQuery = requestedBusinessName || 'Life in Lights Academy';

    // Try reading from PostgreSQL Database via Prisma
    try {
      const dbRecords = await prisma.gbpMonthlyInsight.findMany({
        where: {
          OR: [
            ...(requestedClientId ? [{ clientId: requestedClientId }] : []),
            ...(session?.clientId ? [{ clientId: session.clientId }] : []),
            ...(session?.email ? [{ clientEmail: session.email }] : []),
            { businessName: { contains: businessNameQuery, mode: 'insensitive' } },
          ],
        },
        orderBy: [{ year: 'asc' }, { month: 'asc' }],
      });

      if (dbRecords && dbRecords.length > 0) {
        const insights = sortInsightsChronologically(dbRecords.map(formatDbInsightToGbp));
        memoryInsightsStore[clientKey] = insights;
        return NextResponse.json({
          success: true,
          data: insights,
          count: insights.length,
          latest: insights[insights.length - 1] || null,
          source: 'DATABASE_POSTGRESQL',
        });
      }

      // If DB has 0 records, seed the authentic baseline into DB
      const seeded = await prisma.gbpMonthlyInsight.create({
        data: {
          tenantId: 'tenant_main',
          clientId: requestedClientId || session?.clientId || null,
          clientEmail: session?.email || 'gunjan.india@gmail.com',
          businessName: SEEDED_AUTHENTIC_GBP_INSIGHT.businessName,
          period: SEEDED_AUTHENTIC_GBP_INSIGHT.period,
          year: SEEDED_AUTHENTIC_GBP_INSIGHT.year || 2026,
          month: SEEDED_AUTHENTIC_GBP_INSIGHT.month || 9,
          monthName: SEEDED_AUTHENTIC_GBP_INSIGHT.monthName || 'September',
          shopCode: SEEDED_AUTHENTIC_GBP_INSIGHT.shopCode || '',
          address: SEEDED_AUTHENTIC_GBP_INSIGHT.address || '',
          labels: SEEDED_AUTHENTIC_GBP_INSIGHT.labels || '',
          searchMobile: SEEDED_AUTHENTIC_GBP_INSIGHT.searchMobile,
          searchDesktop: SEEDED_AUTHENTIC_GBP_INSIGHT.searchDesktop,
          mapsMobile: SEEDED_AUTHENTIC_GBP_INSIGHT.mapsMobile,
          mapsDesktop: SEEDED_AUTHENTIC_GBP_INSIGHT.mapsDesktop,
          calls: SEEDED_AUTHENTIC_GBP_INSIGHT.calls,
          messages: SEEDED_AUTHENTIC_GBP_INSIGHT.messages,
          bookings: SEEDED_AUTHENTIC_GBP_INSIGHT.bookings,
          directions: SEEDED_AUTHENTIC_GBP_INSIGHT.directions,
          websiteClicks: SEEDED_AUTHENTIC_GBP_INSIGHT.websiteClicks,
          foodOrders: 0,
          foodMenuClicks: 0,
          hotelBookings: 0,
          totalSearchViews: SEEDED_AUTHENTIC_GBP_INSIGHT.totalSearchViews,
          totalMapsViews: SEEDED_AUTHENTIC_GBP_INSIGHT.totalMapsViews,
          totalViews: SEEDED_AUTHENTIC_GBP_INSIGHT.totalViews,
          totalActions: SEEDED_AUTHENTIC_GBP_INSIGHT.totalActions,
          source: 'CSV_UPLOAD',
        },
      });

      const formatted = [formatDbInsightToGbp(seeded)];
      memoryInsightsStore[clientKey] = formatted;

      return NextResponse.json({
        success: true,
        data: formatted,
        count: formatted.length,
        latest: formatted[0],
        source: 'DATABASE_POSTGRESQL_INITIALIZED',
      });
    } catch (dbErr) {
      console.warn('PostgreSQL query error, using memory fallback:', dbErr);
    }

    const insights = sortInsightsChronologically(
      memoryInsightsStore[clientKey] || memoryInsightsStore['default'] || [SEEDED_AUTHENTIC_GBP_INSIGHT]
    );

    return NextResponse.json({
      success: true,
      data: insights,
      count: insights.length,
      latest: insights[insights.length - 1] || null,
      source: 'MEMORY_FALLBACK',
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
    const { clientId, csvContent, insightRecord, month, year, periodLabel, businessName } = body;

    const clientKey = clientId || session?.clientId || session?.email || 'default';
    let parsedItems: GbpDailyOrMonthlyInsight[] = [];

    const monthNum = month || (insightRecord?.month ? parseInt(insightRecord.month, 10) : undefined);
    const yearNum = year || (insightRecord?.year ? parseInt(insightRecord.year, 10) : undefined);

    if (csvContent && typeof csvContent === 'string') {
      parsedItems = parseGbpInsightsCsv(csvContent, {
        month: monthNum,
        year: yearNum,
        periodLabel,
      });
    } else if (insightRecord && typeof insightRecord === 'object') {
      const formattedMonth = monthNum || new Date().getMonth() + 1;
      const formattedYear = yearNum || new Date().getFullYear();
      parsedItems = [
        {
          ...insightRecord,
          month: formattedMonth,
          year: formattedYear,
          monthName: MONTH_NAMES[formattedMonth - 1] || 'September',
          period: periodLabel || `${MONTH_SHORT_NAMES[formattedMonth - 1] || 'Sep'} ${formattedYear}`,
        },
      ];
    }

    if (parsedItems.length === 0) {
      return NextResponse.json(
        { error: 'No valid Google Business Profile insight records parsed from input.' },
        { status: 400 }
      );
    }

    // Persist each parsed item to the PostgreSQL Database
    try {
      for (const item of parsedItems) {
        const targetYear = item.year || new Date().getFullYear();
        const targetMonth = item.month || new Date().getMonth() + 1;
        const targetPeriod = item.period || `${MONTH_SHORT_NAMES[targetMonth - 1]} ${targetYear}`;
        const targetBusinessName = item.businessName || businessName || 'Life in Lights Academy';

        // Check if an entry already exists for this business/client & year & month
        const existingRecord = await prisma.gbpMonthlyInsight.findFirst({
          where: {
            year: targetYear,
            month: targetMonth,
            OR: [
              ...(clientId ? [{ clientId }] : []),
              ...(session?.clientId ? [{ clientId: session.clientId }] : []),
              { businessName: { contains: targetBusinessName.slice(0, 8), mode: 'insensitive' } },
            ],
          },
        });

        const dataPayload = {
          tenantId: 'tenant_main',
          clientId: clientId || session?.clientId || existingRecord?.clientId || null,
          clientEmail: session?.email || 'gunjan.india@gmail.com',
          businessName: targetBusinessName,
          period: targetPeriod,
          year: targetYear,
          month: targetMonth,
          monthName: item.monthName || MONTH_NAMES[targetMonth - 1] || 'September',
          shopCode: item.shopCode || '',
          address: item.address || '',
          labels: item.labels || '',
          searchMobile: item.searchMobile || 0,
          searchDesktop: item.searchDesktop || 0,
          mapsMobile: item.mapsMobile || 0,
          mapsDesktop: item.mapsDesktop || 0,
          calls: item.calls || 0,
          messages: item.messages || 0,
          bookings: item.bookings || 0,
          directions: item.directions || 0,
          websiteClicks: item.websiteClicks || 0,
          foodOrders: item.foodOrders || 0,
          foodMenuClicks: item.foodMenuClicks || 0,
          hotelBookings: item.hotelBookings || 0,
          totalSearchViews: item.totalSearchViews || (item.searchMobile + item.searchDesktop),
          totalMapsViews: item.totalMapsViews || (item.mapsMobile + item.mapsDesktop),
          totalViews: item.totalViews || (item.totalSearchViews + item.totalMapsViews),
          totalActions: item.totalActions || (item.calls + item.messages + item.bookings + item.directions + item.websiteClicks),
          source: item.source || 'CSV_UPLOAD',
          importedAt: new Date(),
        };

        if (existingRecord) {
          // Re-upload / Update existing record in database
          await prisma.gbpMonthlyInsight.update({
            where: { id: existingRecord.id },
            data: dataPayload,
          });
        } else {
          // Insert new record in database
          await prisma.gbpMonthlyInsight.create({
            data: dataPayload,
          });
        }
      }

      // Fetch full updated list from PostgreSQL Database
      const updatedDbRecords = await prisma.gbpMonthlyInsight.findMany({
        where: {
          OR: [
            ...(clientId ? [{ clientId }] : []),
            ...(session?.clientId ? [{ clientId: session.clientId }] : []),
            ...(session?.email ? [{ clientEmail: session.email }] : []),
            { businessName: { contains: parsedItems[0].businessName.slice(0, 8), mode: 'insensitive' } },
          ],
        },
        orderBy: [{ year: 'asc' }, { month: 'asc' }],
      });

      const fullList = sortInsightsChronologically(updatedDbRecords.map(formatDbInsightToGbp));
      memoryInsightsStore[clientKey] = fullList;

      return NextResponse.json({
        success: true,
        message: `Successfully saved ${parsedItems.length} monthly insight record(s) to PostgreSQL database for ${parsedItems[0].period}.`,
        data: fullList,
        latest: fullList[fullList.length - 1],
        savedToDatabase: true,
      });
    } catch (dbError) {
      console.warn('Database save error, maintaining memory store:', dbError);
    }

    // Memory Store fallback
    const existing = memoryInsightsStore[clientKey] || [SEEDED_AUTHENTIC_GBP_INSIGHT];
    const map = new Map<string, GbpDailyOrMonthlyInsight>();
    for (const item of existing) {
      map.set(`${item.year || 2026}_${item.month || 9}`, item);
    }
    for (const item of parsedItems) {
      map.set(`${item.year || 2026}_${item.month || 9}`, item);
    }

    const merged = sortInsightsChronologically(Array.from(map.values()));
    memoryInsightsStore[clientKey] = merged;

    return NextResponse.json({
      success: true,
      message: `Saved authentic insight for ${parsedItems[0].period}. Total tracked months: ${merged.length}.`,
      data: merged,
      latest: parsedItems[0],
      savedToDatabase: false,
    });
  } catch (error: any) {
    console.error('POST /api/portal/insights error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to process and store GBP insights.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getCurrentUserSession();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const monthStr = searchParams.get('month');
    const yearStr = searchParams.get('year');
    const clientId = searchParams.get('clientId') || session?.clientId;

    const month = monthStr ? parseInt(monthStr, 10) : undefined;
    const year = yearStr ? parseInt(yearStr, 10) : undefined;

    const clientKey = clientId || session?.email || 'default';

    // Delete from Database
    try {
      if (id) {
        await prisma.gbpMonthlyInsight.deleteMany({
          where: { id },
        });
      } else if (month && year) {
        await prisma.gbpMonthlyInsight.deleteMany({
          where: {
            month,
            year,
            ...(clientId ? { clientId } : {}),
          },
        });
      }

      // Fetch remaining records from DB
      const remainingDbRecords = await prisma.gbpMonthlyInsight.findMany({
        where: {
          OR: [
            ...(clientId ? [{ clientId }] : []),
            ...(session?.clientId ? [{ clientId: session.clientId }] : []),
            ...(session?.email ? [{ clientEmail: session.email }] : []),
          ],
        },
        orderBy: [{ year: 'asc' }, { month: 'asc' }],
      });

      const updatedList = sortInsightsChronologically(remainingDbRecords.map(formatDbInsightToGbp));
      memoryInsightsStore[clientKey] = updatedList;

      return NextResponse.json({
        success: true,
        message: 'Insight record deleted successfully from database.',
        data: updatedList,
      });
    } catch (dbErr) {
      console.warn('DB delete error, updating memory store:', dbErr);
    }

    // Memory Store filter fallback
    const currentMemory = memoryInsightsStore[clientKey] || [];
    const updatedMemory = currentMemory.filter((item) => {
      if (id && item.id === id) return false;
      if (month && year && item.month === month && item.year === year) return false;
      return true;
    });

    memoryInsightsStore[clientKey] = updatedMemory;

    return NextResponse.json({
      success: true,
      message: 'Insight record removed.',
      data: updatedMemory,
    });
  } catch (error: any) {
    console.error('DELETE /api/portal/insights error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to delete GBP insight record.' },
      { status: 500 }
    );
  }
}
