import { NextResponse } from 'next/server';
import { getCurrentUserSession } from '@/lib/auth';
import { globalStore } from '@/lib/store';

export async function GET() {
  try {
    const session = await getCurrentUserSession();
    if (!session || session.role === 'CLIENT') {
      return NextResponse.json({ error: 'Unauthorized: Admin privileges required' }, { status: 403 });
    }

    const configs = globalStore.getGlobalAiPromptConfigs();
    return NextResponse.json({
      success: true,
      data: configs,
    });
  } catch (err: any) {
    console.error('GET /api/admin/ai-config error:', err);
    return NextResponse.json({ error: 'Failed to fetch AI prompt configurations' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getCurrentUserSession();
    if (!session || session.role === 'CLIENT') {
      return NextResponse.json({ error: 'Unauthorized: Admin privileges required' }, { status: 403 });
    }

    const body = await request.json();
    const { id, systemPrompt, seoKeywords, fallbackReviews, isActive, displayName } = body;

    if (!id) {
      return NextResponse.json({ error: 'Config ID is required' }, { status: 400 });
    }

    const updated = globalStore.updateGlobalAiPromptConfig(id, {
      ...(systemPrompt !== undefined && { systemPrompt }),
      ...(seoKeywords !== undefined && { seoKeywords: Array.isArray(seoKeywords) ? seoKeywords : [] }),
      ...(fallbackReviews !== undefined && { fallbackReviews: Array.isArray(fallbackReviews) ? fallbackReviews : [] }),
      ...(isActive !== undefined && { isActive: !!isActive }),
      ...(displayName !== undefined && { displayName }),
    });

    return NextResponse.json({
      success: true,
      message: 'Global AI category template saved successfully.',
      data: updated,
    });
  } catch (err: any) {
    console.error('PATCH /api/admin/ai-config error:', err);
    return NextResponse.json({ error: 'Failed to update AI configuration' }, { status: 500 });
  }
}
