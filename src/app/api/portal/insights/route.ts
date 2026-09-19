import { NextResponse } from 'next/server';
import { getCurrentUserSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  GbpDailyOrMonthlyInsight,
  parseGbpInsightsCsv,
  sortInsightsChronologically,
  MONTH_NAMES,
  MONTH_SHORT_NAMES,
} from '@/lib/gbp-insights-engine';

// In-memory cache per client
const memoryInsightsStore: Record<string, GbpDailyOrMonthlyInsight[]> = {};

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
    const businessNameQuery = requestedBusinessName || '';

    // Try reading from PostgreSQL Database via Prisma
    try {
      const whereConditions: any[] = [];
      if (requestedClientId) whereConditions.push({ clientId: requestedClientId });
      if (session?.clientId) whereConditions.push({ clientId: session.clientId });
      if (session?.email) whereConditions.push({ clientEmail: session.email });
      if (businessNameQuery) whereConditions.push({ businessName: { contains: businessNameQuery, mode: 'insensitive' } });

      const dbRecords = whereConditions.length > 0
        ? await prisma.gbpMonthlyInsight.findMany({
            where: { OR: whereConditions },
            orderBy: [{ year: 'asc' }, { month: 'asc' }],
          })
        : [];

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

      // If DB has 0 records, return clean empty data
      const stored = memoryInsightsStore[clientKey] || [];
      return NextResponse.json({
        success: true,
        data: stored,
        count: stored.length,
        latest: stored[stored.length - 1] || null,
        source: 'DATABASE_EMPTY',
      });
    } catch (dbErr) {
      console.warn('PostgreSQL query error, using memory fallback:', dbErr);
    }

    const insights = sortInsightsChronologically(
      memoryInsightsStore[clientKey] || []
    );

    return NextResponse.json({
      success: true,
      data: insights,
      count: insights.length,
      latest: insights[insights.length - 1] || null,
      source: 'MEMORY_STORE',
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
        const targetBusinessName = item.businessName || businessName || 'Google Business Profile';

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
    const existing = memoryInsightsStore[clientKey] || [];
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
