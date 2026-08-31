import { NextResponse } from 'next/server';
import { globalStore } from '@/lib/store';
import { paymentProvider } from '@/lib/payment-engine';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { packageId, businessName, contactName, phone, email, city, category } = body;

    const pkg = globalStore.packages.find((p) => p.id === packageId) || globalStore.packages[1];

    // 1. Ingest Lead
    const lead = globalStore.createLead({
      businessName: businessName || 'New Business Lead',
      contactName: contactName || 'Business Owner',
      phone: phone || '+91 9876543210',
      whatsapp: phone || '+91 9876543210',
      email: email || `${phone}@client.digitalranchi.in`,
      category: category || 'Local Business',
      city: city || 'Ranchi',
      state: 'Jharkhand',
      leadSource: 'Website Checkout API',
      interestedPackageId: pkg.id,
      estimatedValue: pkg.price,
      leadScore: 90,
      status: 'PROPOSAL',
    });

    // 2. Create Gateway Order
    const order = await paymentProvider.createOrder({
      amount: pkg.price,
      currency: 'INR',
      receipt: `rcpt_${lead.id}`,
      customer: {
        name: contactName,
        email: email || `${phone}@client.digitalranchi.in`,
        contact: phone,
      },
    });

    return NextResponse.json({
      success: true,
      leadId: lead.id,
      order,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to initialize order checkout' }, { status: 500 });
  }
}
