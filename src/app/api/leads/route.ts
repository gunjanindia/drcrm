import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { globalStore } from '@/lib/store';

export async function GET() {
  try {
    if (process.env.DATABASE_URL) {
      const leads = await prisma.lead.findMany({
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json({
        success: true,
        data: leads,
        source: 'NEON_POSTGRESQL',
        count: leads.length,
      });
    }
  } catch (e: any) {
    console.error('Direct Prisma GET /api/leads error:', e);
  }

  await globalStore.syncFromDb();
  return NextResponse.json({ success: true, data: globalStore.leads, source: 'FALLBACK_STORE' });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (process.env.DATABASE_URL) {
      const cleanPhone = (body.phone || '').trim();
      const newLead = await prisma.lead.create({
        data: {
          tenantId: 'tenant_main',
          businessName: body.businessName.trim(),
          contactName: (body.contactName || body.businessName).trim(),
          phone: cleanPhone,
          whatsapp: (body.whatsapp || cleanPhone).trim(),
          email: body.email || `${cleanPhone.replace(/[^0-9]/g, '')}@lead.digitalranchi.in`,
          category: body.category || 'Local Business',
          city: body.city || 'Ranchi',
          state: body.state || 'Jharkhand',
          googleMapsUrl: body.googleMapsUrl || null,
          websiteUrl: body.websiteUrl || null,
          leadSource: body.leadSource || 'CRM Direct Ingestion',
          interestedPackageId: body.interestedPackageId || null,
          estimatedValue: Number(body.estimatedValue) || 999.0,
          leadScore: Number(body.leadScore) || 0,
          status: body.status || 'NEW',
          auditScore: body.auditScore || null,
          notes: body.notes || 'Logged in CRM.',
        },
      });
      return NextResponse.json({ success: true, data: newLead });
    }

    const lead = await globalStore.createLead(body);
    return NextResponse.json({ success: true, data: lead });
  } catch (err: any) {
    console.error('POST /api/leads error:', err);
    return NextResponse.json({ error: err?.message || 'Failed to create lead' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;
    if (!id) {
      return NextResponse.json({ error: 'Lead ID is required' }, { status: 400 });
    }

    if (process.env.DATABASE_URL) {
      const updateData: any = {};
      if (updates.businessName !== undefined) updateData.businessName = updates.businessName.trim();
      if (updates.contactName !== undefined) updateData.contactName = updates.contactName.trim();
      if (updates.phone !== undefined) updateData.phone = updates.phone.trim();
      if (updates.whatsapp !== undefined) updateData.whatsapp = updates.whatsapp.trim();
      if (updates.email !== undefined) updateData.email = updates.email.trim();
      if (updates.category !== undefined) updateData.category = updates.category.trim();
      if (updates.city !== undefined) updateData.city = updates.city.trim();
      if (updates.state !== undefined) updateData.state = updates.state.trim();
      if (updates.status !== undefined) updateData.status = updates.status;
      if (updates.estimatedValue !== undefined) updateData.estimatedValue = Number(updates.estimatedValue);
      if (updates.leadScore !== undefined) updateData.leadScore = Number(updates.leadScore);
      if (updates.auditScore !== undefined) updateData.auditScore = Number(updates.auditScore);
      if (updates.notes !== undefined) updateData.notes = updates.notes;

      const updatedLead = await prisma.lead.update({
        where: { id },
        data: updateData,
      });
      return NextResponse.json({ success: true, data: updatedLead });
    }

    const updated = await globalStore.updateLead(id, updates);
    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    console.error('PATCH /api/leads error:', err);
    return NextResponse.json({ error: err?.message || 'Failed to update lead' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Lead ID is required' }, { status: 400 });
    }

    if (process.env.DATABASE_URL) {
      await prisma.lead.delete({
        where: { id },
      });
      return NextResponse.json({ success: true, message: 'Lead deleted permanently from Neon database' });
    }

    await globalStore.deleteLead(id);
    return NextResponse.json({ success: true, message: 'Lead deleted successfully' });
  } catch (err: any) {
    console.error('DELETE /api/leads error:', err);
    return NextResponse.json({ error: err?.message || 'Failed to delete lead' }, { status: 500 });
  }
}
