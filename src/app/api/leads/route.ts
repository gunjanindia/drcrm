import { NextResponse } from 'next/server';
import { globalStore } from '@/lib/store';

export async function GET() {
  await globalStore.syncFromDb();
  return NextResponse.json({ success: true, data: globalStore.leads });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const lead = await globalStore.createLead(body);
    return NextResponse.json({ success: true, data: lead });
  } catch (err: any) {
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
    const updated = await globalStore.updateLead(id, updates);
    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
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
    await globalStore.deleteLead(id);
    return NextResponse.json({ success: true, message: 'Lead deleted successfully' });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to delete lead' }, { status: 500 });
  }
}
