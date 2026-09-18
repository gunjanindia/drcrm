import { NextResponse } from 'next/server';
import { getCurrentUserSession } from '@/lib/auth';
import { globalStore } from '@/lib/store';

export async function GET(request: Request) {
  try {
    const session = await getCurrentUserSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const requestedClientId = searchParams.get('clientId');

    const targetClientId =
      session.role === 'CLIENT'
        ? session.clientId
        : requestedClientId || session.clientId || globalStore.clients[0]?.id;

    if (!targetClientId) {
      return NextResponse.json({ error: 'Client ID required' }, { status: 400 });
    }

    const settings = globalStore.getAiReviewSettings(targetClientId);
    const client = globalStore.clients.find((c) => c.id === targetClientId);

    return NextResponse.json({
      success: true,
      data: {
        settings,
        client: {
          businessName: client?.businessName,
          category: client?.category,
          city: client?.city,
          googleMapsUrl: client?.googleMapsUrl,
        },
      },
    });
  } catch (err: any) {
    console.error('GET /api/portal/ai-settings error:', err);
    return NextResponse.json({ error: 'Failed to fetch AI review settings' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getCurrentUserSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { clientId, businessType, keyServices, targetKeywords, tone, isShieldActive, customInstructions, reviewRedirectUrl } = body;

    const targetClientId = session.role === 'CLIENT' ? session.clientId : (clientId || session.clientId);
    if (!targetClientId) {
      return NextResponse.json({ error: 'Client ID required' }, { status: 400 });
    }

    const updated = globalStore.saveAiReviewSettings(targetClientId, {
      ...(businessType !== undefined && { businessType }),
      ...(keyServices !== undefined && { keyServices: Array.isArray(keyServices) ? keyServices : [] }),
      ...(targetKeywords !== undefined && { targetKeywords: Array.isArray(targetKeywords) ? targetKeywords : [] }),
      ...(tone !== undefined && { tone }),
      ...(isShieldActive !== undefined && { isShieldActive: !!isShieldActive }),
      ...(customInstructions !== undefined && { customInstructions }),
      ...(reviewRedirectUrl !== undefined && { reviewRedirectUrl }),
    });

    return NextResponse.json({
      success: true,
      message: 'AI Review Engine context & SEO settings saved.',
      data: updated,
    });
  } catch (err: any) {
    console.error('PATCH /api/portal/ai-settings error:', err);
    return NextResponse.json({ error: 'Failed to save AI review settings' }, { status: 500 });
  }
}
