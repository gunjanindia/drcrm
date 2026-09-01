import { NextResponse } from 'next/server';
import { globalStore } from '@/lib/store';

export async function GET() {
  return NextResponse.json({ success: true, data: globalStore.leads });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const lead = globalStore.createLead(body);
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
    const updated = globalStore.updateLead(id, updates);
    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to update lead' }, { status: 500 });
  }
}
