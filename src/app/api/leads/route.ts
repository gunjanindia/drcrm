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
  } catch (err) {
    return NextResponse.json({ error: 'Failed to create lead' }, { status: 500 });
  }
}
