import { NextResponse } from 'next/server';
import { getCurrentUserSession } from '@/lib/auth';
import { globalStore } from '@/lib/store';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const session = await getCurrentUserSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const requestedClientId = searchParams.get('clientId');

    // IDOR protection: Clients can only access their own standee
    const targetClientId =
      session.role === 'CLIENT'
        ? session.clientId
        : requestedClientId || session.clientId || globalStore.clients[0]?.id;

    if (!targetClientId) {
      return NextResponse.json({ error: 'Client ID required' }, { status: 400 });
    }

    const client = globalStore.clients.find((c) => c.id === targetClientId);
    let order = globalStore.getStandeeOrder(targetClientId);

    // If no order exists yet for this client, create a default in-production / order placed record
    if (!order && client) {
      const cleanSlug = client.businessName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

      order = globalStore.createStandeeOrder({
        tenantId: 'tenant_main',
        clientId: targetClientId,
        clientName: client.businessName,
        status: 'IN_PRODUCTION',
        shippingAddress: client.address || `${client.city}, Jharkhand`,
        city: client.city || 'Ranchi',
        state: client.state || 'Jharkhand',
        pincode: client.pincode || '834001',
        phone: client.phone || '+91 9431100000',
        nfcUid: `NFC-DR-${Math.floor(1000000 + Math.random() * 9000000)}`,
        qrSlug: cleanSlug,
        orderDate: new Date().toISOString(),
        isNfcActive: true,
        isQrActive: true,
        directGoogleReviewUrl: client.googleMapsUrl || `https://maps.google.com/?q=${encodeURIComponent(client.businessName)}`,
        notes: 'Smart AI NFC + QR Acrylic Standee provisioned with Free India Delivery.',
      });
    }

    const telemetry = globalStore.getStandeeTelemetry(targetClientId);

    return NextResponse.json({
      success: true,
      data: {
        order,
        telemetry,
        client: {
          businessName: client?.businessName,
          city: client?.city,
          category: client?.category,
          googleMapsUrl: client?.googleMapsUrl,
        },
      },
    });
  } catch (err: any) {
    console.error('GET /api/portal/standee error:', err);
    return NextResponse.json({ error: 'Failed to fetch standee configuration' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getCurrentUserSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { orderId, clientId, isNfcActive, isQrActive, directGoogleReviewUrl, qrSlug } = body;

    const targetClientId = session.role === 'CLIENT' ? session.clientId : (clientId || session.clientId);
    if (!targetClientId) {
      return NextResponse.json({ error: 'Client ID required' }, { status: 400 });
    }

    let order = orderId
      ? globalStore.standeeOrders.find((o) => o.id === orderId)
      : globalStore.getStandeeOrder(targetClientId);

    if (!order) {
      return NextResponse.json({ error: 'Standee order not found' }, { status: 404 });
    }

    // IDOR Check
    if (session.role === 'CLIENT' && order.clientId !== session.clientId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updated = globalStore.updateStandeeOrder(order.id, {
      ...(isNfcActive !== undefined && { isNfcActive: !!isNfcActive }),
      ...(isQrActive !== undefined && { isQrActive: !!isQrActive }),
      ...(directGoogleReviewUrl !== undefined && { directGoogleReviewUrl }),
      ...(qrSlug !== undefined && session.role !== 'CLIENT' && { qrSlug }),
    });

    return NextResponse.json({
      success: true,
      message: 'Standee device settings updated successfully.',
      data: updated,
    });
  } catch (err: any) {
    console.error('PATCH /api/portal/standee error:', err);
    return NextResponse.json({ error: 'Failed to update standee settings' }, { status: 500 });
  }
}
