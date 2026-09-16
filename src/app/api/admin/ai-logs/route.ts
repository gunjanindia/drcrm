import { NextResponse } from 'next/server';
import { getCurrentUserSession } from '@/lib/auth';
import { getAiUsageLogs, grantAiCredits } from '@/lib/ai-credits';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const session = await getCurrentUserSession();
    if (
      !session ||
      (session.role !== 'SUPER_ADMIN' &&
        session.role !== 'BUSINESS_ADMIN' &&
        session.role !== 'OPERATIONS_MANAGER')
    ) {
      return NextResponse.json({ error: 'Unauthorized: Admin privileges required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100', 10);
    const actionFilter = searchParams.get('action') || '';

    const logs = await getAiUsageLogs(limit);

    const filteredLogs = actionFilter
      ? logs.filter((l) => l.action.toLowerCase() === actionFilter.toLowerCase())
      : logs;

    // Aggregate statistics
    let totalPromptTokens = 0;
    let totalCompletionTokens = 0;
    let totalTokens = 0;
    let totalCostUsd = 0;
    let totalCostInr = 0;
    let totalCreditsDeducted = 0;
    let totalAiCalls = 0;
    let totalGoogleApiCalls = 0;
    let totalGoogleCostUsd = 0;
    let totalGoogleCostInr = 0;
    let totalAiCostUsd = 0;
    let totalAiCostInr = 0;

    for (const log of filteredLogs) {
      const isGoogleApi =
        (log.action && log.action.startsWith('GOOGLE_')) ||
        (log.metadata && log.metadata.apiProvider && String(log.metadata.apiProvider).includes('Google'));

      if (isGoogleApi) {
        totalGoogleApiCalls += log.promptTokens || log.totalTokens || 1;
        totalGoogleCostUsd += log.estimatedCostUsd || 0;
        totalGoogleCostInr += log.estimatedCostInr || 0;
      } else {
        totalAiCalls += 1;
        totalPromptTokens += log.promptTokens || 0;
        totalCompletionTokens += log.completionTokens || 0;
        totalTokens += log.totalTokens || 0;
        totalAiCostUsd += log.estimatedCostUsd || 0;
        totalAiCostInr += log.estimatedCostInr || 0;
      }

      totalCostUsd += log.estimatedCostUsd || 0;
      totalCostInr += log.estimatedCostInr || 0;
      if (log.creditsDeducted > 0) {
        totalCreditsDeducted += log.creditsDeducted;
      }
    }

    // Also get all clients for the credit refill dropdown & client table
    let clientsList: any[] = [];
    if (process.env.DATABASE_URL && prisma) {
      try {
        clientsList = await prisma.client.findMany({
          select: {
            id: true,
            businessName: true,
            email: true,
            aiCreditBalance: true,
            subscriptionStatus: true,
            trialEndsAt: true,
            category: true,
            city: true,
          },
          orderBy: { createdAt: 'desc' },
        });
      } catch (e) {
        console.warn('Error fetching client list for admin logs:', e);
      }
    }

    return NextResponse.json({
      success: true,
      data: filteredLogs,
      summary: {
        totalRequests: filteredLogs.length,
        totalAiCalls,
        totalGoogleApiCalls,
        totalPromptTokens,
        totalCompletionTokens,
        totalTokens,
        totalCostUsd: Number(totalCostUsd.toFixed(6)),
        totalCostInr: Number(totalCostInr.toFixed(4)),
        totalGoogleCostUsd: Number(totalGoogleCostUsd.toFixed(6)),
        totalGoogleCostInr: Number(totalGoogleCostInr.toFixed(4)),
        totalAiCostUsd: Number(totalAiCostUsd.toFixed(6)),
        totalAiCostInr: Number(totalAiCostInr.toFixed(4)),
        totalCreditsDeducted,
      },
      clients: clientsList,
    });
  } catch (error: any) {
    console.error('Error in /api/admin/ai-logs GET:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch AI logs' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getCurrentUserSession();
    if (
      !session ||
      (session.role !== 'SUPER_ADMIN' &&
        session.role !== 'BUSINESS_ADMIN' &&
        session.role !== 'OPERATIONS_MANAGER')
    ) {
      return NextResponse.json({ error: 'Unauthorized: Admin privileges required' }, { status: 403 });
    }

    const body = await request.json();
    const { clientId, creditsToAdd, note } = body;

    if (!clientId || !creditsToAdd || Number(creditsToAdd) <= 0) {
      return NextResponse.json({ error: 'Valid Client ID and positive credit amount required' }, { status: 400 });
    }

    const result = await grantAiCredits({
      clientId,
      creditsToAdd: Number(creditsToAdd),
      adminName: session.name || 'Admin',
      note: note || 'Admin Credit Recharge',
    });

    return NextResponse.json({
      success: true,
      message: `Successfully granted ${creditsToAdd} AI Credits!`,
      newBalance: result.newBalance,
    });
  } catch (error: any) {
    console.error('Error in /api/admin/ai-logs POST:', error);
    return NextResponse.json({ error: error.message || 'Failed to grant AI credits' }, { status: 500 });
  }
}
