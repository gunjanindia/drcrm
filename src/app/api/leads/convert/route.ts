import { NextResponse } from 'next/server';
import { globalStore } from '@/lib/store';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { leadId, packageId } = body;

    if (!leadId) {
      return NextResponse.json({ error: 'Lead ID is required' }, { status: 400 });
    }

    const result = globalStore.convertLeadToClient(leadId, packageId || 'pkg_growth_999');

    return NextResponse.json({
      success: true,
      data: result,
      message: `Successfully converted lead to client and generated onboarding project, tasks, and initial invoice.`,
    });
  } catch (err: any) {
    console.error('Lead conversion failed:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to convert lead to client' },
      { status: 500 }
    );
  }
}
