import { NextResponse } from 'next/server';
import { getCurrentUserSession } from '@/lib/auth';
import { globalStore } from '@/lib/store';

export async function GET() {
  try {
    const session = await getCurrentUserSession();
    if (!session || session.role === 'CLIENT') {
      return NextResponse.json({ error: 'Unauthorized: Admin privileges required' }, { status: 403 });
    }

    const orders = globalStore.standeeOrders;
    const stats = {
      total: orders.length,
      newOrders: orders.filter((o) => o.status === 'ORDER_PLACED').length,
      inProduction: orders.filter((o) => o.status === 'IN_PRODUCTION').length,
      dispatched: orders.filter((o) => o.status === 'DISPATCHED').length,
      delivered: orders.filter((o) => o.status === 'DELIVERED').length,
    };

    return NextResponse.json({
      success: true,
      data: {
        orders,
        stats,
        clients: globalStore.clients.map((c) => ({ id: c.id, businessName: c.businessName, city: c.city, phone: c.phone })),
      },
    });
  } catch (err: any) {
    console.error('GET /api/admin/orders error:', err);
    return NextResponse.json({ error: 'Failed to fetch standee orders' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getCurrentUserSession();
    if (!session || session.role === 'CLIENT') {
      return NextResponse.json({ error: 'Unauthorized: Admin privileges required' }, { status: 403 });
    }

    const body = await request.json();
    const { clientId, shippingAddress, city, state, pincode, phone, nfcUid, qrSlug, courier, trackingId, notes } = body;

    if (!clientId) {
      return NextResponse.json({ error: 'Client selection is required' }, { status: 400 });
    }

    const client = globalStore.clients.find((c) => c.id === clientId);
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const cleanSlug = (qrSlug || client.businessName)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    const newOrder = globalStore.createStandeeOrder({
      tenantId: 'tenant_main',
      clientId: client.id,
      clientName: client.businessName,
      status: trackingId ? 'DISPATCHED' : 'IN_PRODUCTION',
      trackingId,
      courier,
      courierUrl: trackingId ? `https://track.courier.in/${trackingId}` : undefined,
      shippingAddress: shippingAddress || client.address || `${client.city}, Jharkhand`,
      city: city || client.city || 'Ranchi',
      state: state || client.state || 'Jharkhand',
      pincode: pincode || client.pincode || '834001',
      phone: phone || client.phone || '+91 9431100000',
      nfcUid: nfcUid || `NFC-DR-${Math.floor(1000000 + Math.random() * 9000000)}`,
      qrSlug: cleanSlug,
      orderDate: new Date().toISOString(),
      dispatchedAt: trackingId ? new Date().toISOString() : undefined,
      isNfcActive: true,
      isQrActive: true,
      directGoogleReviewUrl: client.googleMapsUrl || `https://maps.google.com/?q=${encodeURIComponent(client.businessName)}`,
      notes: notes || 'Provisioned by Admin Fulfillment Desk.',
    });

    return NextResponse.json({
      success: true,
      message: `Standee order for ${client.businessName} provisioned successfully.`,
      data: newOrder,
    });
  } catch (err: any) {
    console.error('POST /api/admin/orders error:', err);
    return NextResponse.json({ error: 'Failed to create standee order' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getCurrentUserSession();
    if (!session || session.role === 'CLIENT') {
      return NextResponse.json({ error: 'Unauthorized: Admin privileges required' }, { status: 403 });
    }

    const body = await request.json();
    const { orderId, status, trackingId, courier, courierUrl, shippingAddress, nfcUid, qrSlug, isNfcActive, isQrActive, notes } = body;

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const updated = globalStore.updateStandeeOrder(orderId, {
      ...(status !== undefined && {
        status,
        ...(status === 'DISPATCHED' && { dispatchedAt: new Date().toISOString() }),
        ...(status === 'DELIVERED' && { deliveredAt: new Date().toISOString() }),
      }),
      ...(trackingId !== undefined && { trackingId }),
      ...(courier !== undefined && { courier }),
      ...(courierUrl !== undefined && { courierUrl }),
      ...(shippingAddress !== undefined && { shippingAddress }),
      ...(nfcUid !== undefined && { nfcUid }),
      ...(qrSlug !== undefined && { qrSlug }),
      ...(isNfcActive !== undefined && { isNfcActive: !!isNfcActive }),
      ...(isQrActive !== undefined && { isQrActive: !!isQrActive }),
      ...(notes !== undefined && { notes }),
    });

    return NextResponse.json({
      success: true,
      message: `Order ${orderId} updated to ${status || 'updated'}.`,
      data: updated,
    });
  } catch (err: any) {
    console.error('PATCH /api/admin/orders error:', err);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
