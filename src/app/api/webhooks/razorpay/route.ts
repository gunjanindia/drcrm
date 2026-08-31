import { NextResponse } from 'next/server';
import { globalStore } from '@/lib/store';
import { paymentProvider } from '@/lib/payment-engine';

// Set of processed event IDs to guarantee webhook idempotency
const processedEvents = new Set<string>();

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-razorpay-signature') || 'mock_sig';

    const isValid = paymentProvider.verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
    }

    let payload: any = {};
    try {
      payload = JSON.parse(rawBody);
    } catch {
      payload = { event: 'payment.captured', id: `evt_${Date.now()}` };
    }

    const eventId = payload.id || `evt_${Date.now()}`;
    const eventType = payload.event || 'payment.captured';

    // Check Idempotency
    if (processedEvents.has(eventId)) {
      return NextResponse.json({ status: 'ALREADY_PROCESSED' }, { status: 200 });
    }
    processedEvents.add(eventId);

    if (eventType === 'payment.captured' || eventType === 'order.paid') {
      const paymentEntity = payload.payload?.payment?.entity || {};
      const amount = (paymentEntity.amount || 99900) / 100;
      const paymentId = paymentEntity.id || `pay_${Date.now()}`;
      const receipt = paymentEntity.notes?.receipt || 'lead_1';

      // Find matching lead or pending conversion
      const lead = globalStore.leads.find((l) => l.id === receipt) || globalStore.leads[0];
      const conversion = globalStore.convertLeadToClient(lead.id, lead.interestedPackageId || 'pkg_growth_999');

      globalStore.recordPayment(conversion.client.id, amount, paymentId);

      return NextResponse.json({
        success: true,
        message: 'Payment captured and client onboarded',
        clientId: conversion.client.id,
        projectId: conversion.project.id,
      });
    }

    return NextResponse.json({ status: 'IGNORED_EVENT' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Webhook processing error' }, { status: 500 });
  }
}
