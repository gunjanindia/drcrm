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

export async function POST(request: Request) {
  try {
    const session = await getCurrentUserSession();
    if (!session || session.role === 'CLIENT') {
      return NextResponse.json({ error: 'Unauthorized: Admin privileges required' }, { status: 403 });
    }

    const body = await request.json();
    const { displayName, category, systemPrompt, seoKeywords, fallbackReviews, isActive = true } = body;

    if (!displayName || !displayName.trim()) {
      return NextResponse.json({ error: 'Industry category name is required' }, { status: 400 });
    }

    const newConfig = globalStore.createGlobalAiPromptConfig({
      displayName: displayName.trim(),
      category: category?.trim() || displayName.trim(),
      systemPrompt: systemPrompt?.trim() || `Generate authentic, credible 5-star customer reviews praising professional ${displayName}, skilled staff, transparent pricing, and excellent service.`,
      seoKeywords: Array.isArray(seoKeywords) && seoKeywords.length > 0 ? seoKeywords : [`best ${displayName.toLowerCase()}`, 'quick service', 'honest pricing', 'top rated'],
      fallbackReviews: Array.isArray(fallbackReviews) && fallbackReviews.length > 0 ? fallbackReviews : [
        `Outstanding experience with this ${displayName}! Highly skilled team, fair transparent pricing, and prompt fulfillment. Highly recommended!`,
        `Very impressed by their attention to detail and customer-first approach. Delivered exactly what was promised with 5-star quality.`,
        `Top-notch service and courteous staff. Easily the best choice for ${displayName} in the area!`,
      ],
      isActive: isActive !== false,
    });

    return NextResponse.json({
      success: true,
      message: `Industry category "${newConfig.displayName}" created successfully.`,
      data: newConfig,
    });
  } catch (err: any) {
    console.error('POST /api/admin/ai-config error:', err);
    return NextResponse.json({ error: 'Failed to create industry category' }, { status: 500 });
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

export async function DELETE(request: Request) {
  try {
    const session = await getCurrentUserSession();
    if (!session || session.role === 'CLIENT') {
      return NextResponse.json({ error: 'Unauthorized: Admin privileges required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Config ID is required' }, { status: 400 });
    }

    const deleted = globalStore.deleteGlobalAiPromptConfig(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Category config not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Industry category deleted successfully.',
    });
  } catch (err: any) {
    console.error('DELETE /api/admin/ai-config error:', err);
    return NextResponse.json({ error: 'Failed to delete industry category' }, { status: 500 });
  }
}
