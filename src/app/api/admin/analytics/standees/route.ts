import { NextResponse } from 'next/server';
import { getCurrentUserSession } from '@/lib/auth';
import { globalStore } from '@/lib/store';

export async function GET() {
  try {
    const session = await getCurrentUserSession();
    if (!session || session.role === 'CLIENT') {
      return NextResponse.json({ error: 'Unauthorized: Admin privileges required' }, { status: 403 });
    }

    const telemetries = globalStore.standeeTelemetries;
    const orders = globalStore.standeeOrders;
    const clients = globalStore.clients;
    const feedbacks = globalStore.privateFeedbacks;

    const totalScans = telemetries.reduce((acc, t) => acc + t.totalScans, 0);
    const totalNfc = telemetries.reduce((acc, t) => acc + t.nfcTaps, 0);
    const totalQr = telemetries.reduce((acc, t) => acc + t.qrScans, 0);
    const totalReviewsGen = telemetries.reduce((acc, t) => acc + t.aiReviewsGenerated, 0);
    const totalGoogleRedirects = telemetries.reduce((acc, t) => acc + t.googleRedirects, 0);
    const totalIntercepted = telemetries.reduce((acc, t) => acc + t.privateComplaintsIntercepted, 0);

    // Merchant Audit List
    const merchantAudits = clients.map((c) => {
      const order = orders.find((o) => o.clientId === c.id);
      const telem = telemetries.find((t) => t.clientId === c.id) || {
        totalScans: 0,
        nfcTaps: 0,
        qrScans: 0,
        aiReviewsGenerated: 0,
        googleRedirects: 0,
        privateComplaintsIntercepted: 0,
        lastScannedAt: null,
      };
      const merchantFeedbacks = feedbacks.filter((f) => f.clientId === c.id);

      const hasValidGoogleUrl = Boolean(c.googleMapsUrl || order?.directGoogleReviewUrl);
      const conversionRate = telem.totalScans > 0 ? Math.round((telem.googleRedirects / telem.totalScans) * 100) : 0;
      const isStandeeDelivered = order?.status === 'DELIVERED';
      const isStandeeActive = order?.isNfcActive && order?.isQrActive;

      let healthFlag: 'HEALTHY' | 'WARNING' | 'CRITICAL' = 'HEALTHY';
      let flagReason = 'Operational & converting smoothly';

      if (!hasValidGoogleUrl) {
        healthFlag = 'CRITICAL';
        flagReason = 'Missing Google Maps Review Link';
      } else if (!isStandeeDelivered && order?.status === 'ORDER_PLACED') {
        healthFlag = 'WARNING';
        flagReason = 'Standee pending fulfillment';
      } else if (telem.totalScans > 20 && conversionRate < 40) {
        healthFlag = 'WARNING';
        flagReason = `Low conversion rate (${conversionRate}%)`;
      } else if (order && !isStandeeActive) {
        healthFlag = 'WARNING';
        flagReason = 'NFC or QR disabled';
      }

      return {
        clientId: c.id,
        businessName: c.businessName,
        city: c.city,
        category: c.category,
        standeeStatus: order?.status || 'NOT_ORDERED',
        trackingId: order?.trackingId,
        qrSlug: order?.qrSlug || c.businessName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        isNfcActive: order?.isNfcActive ?? true,
        isQrActive: order?.isQrActive ?? true,
        hasGoogleUrl: hasValidGoogleUrl,
        totalScans: telem.totalScans,
        nfcTaps: telem.nfcTaps,
        qrScans: telem.qrScans,
        reviewsGenerated: telem.aiReviewsGenerated,
        googleRedirects: telem.googleRedirects,
        complaintsIntercepted: telem.privateComplaintsIntercepted || merchantFeedbacks.length,
        conversionRate,
        healthFlag,
        flagReason,
        lastScannedAt: telem.lastScannedAt,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalStandeesProvisioned: orders.length,
          totalScans,
          totalNfc,
          totalQr,
          totalReviewsGen,
          totalGoogleRedirects,
          totalIntercepted,
          nfcRatio: totalScans > 0 ? Math.round((totalNfc / totalScans) * 100) : 60,
          googleRedirectRate: totalScans > 0 ? Math.round((totalGoogleRedirects / totalScans) * 100) : 65,
          interceptionRate: totalScans > 0 ? Math.round((totalIntercepted / (totalGoogleRedirects + totalIntercepted || 1)) * 100) : 5,
        },
        merchantAudits,
      },
    });
  } catch (err: any) {
    console.error('GET /api/admin/analytics/standees error:', err);
    return NextResponse.json({ error: 'Failed to fetch standee telemetry analytics' }, { status: 500 });
  }
}
