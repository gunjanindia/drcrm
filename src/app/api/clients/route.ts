import { NextResponse } from 'next/server';
import { globalStore } from '@/lib/store';

export async function GET() {
  return NextResponse.json({ success: true, data: globalStore.clients });
}
