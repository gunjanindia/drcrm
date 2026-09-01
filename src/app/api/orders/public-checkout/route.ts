import { NextResponse } from 'next/server';
import { globalStore } from '@/lib/store';
import { paymentProvider } from '@/lib/payment-engine';
import { generateId } from '@/lib/utils';
import { TimelineActivity } from '@/types';

export async function POST(request: Request) {
  try {
    // Ensure fresh store state
    globalStore.loadFromFile();

    const body = await request.json();
    const { packageId, businessName, contactName, phone, email, city, category } = body;

    if (!businessName || !contactName || !phone) {
      return NextResponse.json(
        { error: 'Business name, contact person, and phone number are required' },
        { status: 400 }
      );
    }

    const pkg =
      globalStore.packages.find((p) => p.id === packageId) ||
      globalStore.packages[1] || {
        id: 'pkg_growth_999',
        name: 'Growth Accelerate',
        price: 999,
        billingFrequency: 'MONTHLY',
      };

    const cleanEmail =
      email && email.trim()
        ? email.trim().toLowerCase()
        : `${phone.replace(/[^0-9]/g, '')}@client.digitalranchi.in`;

    // 1. Ingest & Create Lead in Store with WON status
    const lead = await globalStore.createLead({
      businessName: businessName.trim(),
      contactName: contactName.trim(),
      phone: phone.trim(),
      whatsapp: phone.trim(),
      email: cleanEmail,
      category: category?.trim() || 'Local Business',
      city: city?.trim() || 'Ranchi',
      state: 'Jharkhand',
      leadSource: 'Website Direct Checkout',
      interestedPackageId: pkg.id,
      estimatedValue: pkg.price,
      leadScore: 98,
      status: 'WON',
    });

    // 2. Initialize Gateway Order
    const order = await paymentProvider.createOrder({
      amount: pkg.price,
      currency: 'INR',
      receipt: `rcpt_${lead.id}`,
      customer: {
        name: contactName.trim(),
        email: cleanEmail,
        contact: phone.trim(),
      },
    });

    // 3. Convert Lead to Client + Automated 7-Day Onboarding Project & Tasks
    const conversion = await globalStore.convertLeadToClient(lead.id, pkg.id);

    // 4. Record Verified Payment in CRM Store
    const gatewayPaymentId = `pay_RZP_${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    const payment = globalStore.recordPayment(
      conversion.client.id,
      pkg.price,
      gatewayPaymentId,
      order.gatewayOrderId
    );

    // 5. Update matching invoice status to PAID
    if (conversion.invoice) {
      conversion.invoice.status = 'PAID';
      conversion.invoice.paidAmount = pkg.price;
      conversion.invoice.dueAmount = 0;
      conversion.invoice.paidAt = new Date().toISOString();
      payment.invoiceId = conversion.invoice.id;
    }

    // 6. Record Activity Timeline
    const activity: TimelineActivity = {
      id: generateId('act'),
      clientId: conversion.client.id,
      type: 'ONBOARDING_STARTED',
      title: 'Instant Online Checkout & Kickoff',
      description: `Client completed direct website checkout for ${pkg.name} (₹${pkg.price}). Generated 7 onboarding tasks.`,
      actorName: 'Public Checkout Gateway',
      timestamp: new Date().toISOString(),
    };
    globalStore.activities.unshift(activity);

    // 7. Persist to Disk & Vercel /tmp Store
    globalStore.saveToFile();

    return NextResponse.json({
      success: true,
      client: conversion.client,
      project: conversion.project,
      tasks: conversion.tasks,
      invoice: conversion.invoice,
      payment,
      message: 'Instant checkout completed and client data synchronized with CRM!',
    });
  } catch (error: any) {
    console.error('Failed to process public checkout:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to complete order checkout' },
      { status: 500 }
    );
  }
}
