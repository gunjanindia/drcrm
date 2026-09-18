import { NextResponse } from 'next/server';
import { globalStore } from '@/lib/store';
import { globalTaxEngine } from '@/lib/tax-engine';
import { getCurrentUserSession } from '@/lib/auth';

export async function GET() {
  const session = await getCurrentUserSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // If Client, only return invoices and payments belonging to their clientId
  if (session.role === 'CLIENT') {
    const clientInvoices = globalStore.invoices.filter((i) => i.clientId === session.clientId);
    const clientPayments = globalStore.payments.filter((p) => p.clientId === session.clientId);
    const totalBilled = clientInvoices.reduce((acc, inv) => acc + inv.totalAmount, 0);
    const totalCollected = clientPayments.reduce((acc, p) => acc + p.amount, 0);
    const outstandingAmount = totalBilled - totalCollected;

    return NextResponse.json({
      success: true,
      data: {
        invoices: clientInvoices,
        payments: clientPayments,
        totalBilled,
        totalCollected,
        outstandingAmount,
      },
    });
  }

  // Agency Staff: Full financial overview
  const totalBilled = globalStore.invoices.reduce((acc, inv) => acc + inv.totalAmount, 0);
  const totalCollected = globalStore.payments.reduce((acc, p) => acc + p.amount, 0);
  const outstandingAmount = totalBilled - totalCollected;

  return NextResponse.json({
    success: true,
    data: {
      invoices: globalStore.invoices,
      payments: globalStore.payments,
      taxConfig: globalStore.taxConfig,
      totalBilled,
      totalCollected,
      outstandingAmount,
    },
  });
}

export async function POST(request: Request) {
  try {
    const session = await getCurrentUserSession();
    if (!session || session.role === 'CLIENT') {
      return NextResponse.json({ error: 'Unauthorized: Admin privileges required' }, { status: 403 });
    }

    const body = await request.json();

    if (body.action === 'toggle_gst') {
      const nextGst = !globalStore.taxConfig.isGstRegistered;
      const updated = globalTaxEngine.updateConfig({
        isGstRegistered: nextGst,
        defaultTaxMode: nextGst ? 'GST' : 'NON_GST',
        gstin: nextGst ? '20ABCDE1234F1Z5' : null,
      });
      globalStore.taxConfig = updated;
      globalStore.saveToFile();
      return NextResponse.json({ success: true, taxConfig: updated });
    }

    if (body.action === 'create_invoice') {
      const invoice = globalStore.createInvoice(body.data);
      return NextResponse.json({ success: true, data: invoice });
    }

    if (body.action === 'record_payment') {
      const { clientId, amount, gatewayPaymentId, orderId } = body;
      const payment = globalStore.recordPayment(clientId, amount, gatewayPaymentId, orderId);
      return NextResponse.json({ success: true, data: payment });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Billing operation failed' }, { status: 500 });
  }
}
