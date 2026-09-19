import { NextResponse } from 'next/server';
import { getCurrentUserSession } from '@/lib/auth';
import { globalStore } from '@/lib/store';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const session = await getCurrentUserSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const requestedClientId = searchParams.get('clientId');

    const prisma = await getPrisma();
    let targetClient: any = null;

    // 1. If explicit clientId requested
    if (requestedClientId) {
      targetClient = globalStore.clients.find((c) => c.id === requestedClientId);
      if (!targetClient && prisma) {
        targetClient = await prisma.client.findFirst({
          where: {
            OR: [
              { id: requestedClientId },
              { businessName: { contains: requestedClientId.replace(/^cli_/, '').replace(/-/g, ' '), mode: 'insensitive' } },
            ],
          },
        }).catch(() => null);
      }
    }

    // 2. If user session has clientId
    if (!targetClient && session.clientId) {
      targetClient = globalStore.clients.find((c) => c.id === session.clientId);
      if (!targetClient && prisma) {
        targetClient = await prisma.client.findUnique({ where: { id: session.clientId } }).catch(() => null);
      }
    }

    // 3. Match by user session email
    if (!targetClient && session.email) {
      const cleanEmail = session.email.toLowerCase();
      targetClient = globalStore.clients.find((c) => c.email.toLowerCase() === cleanEmail);
      if (!targetClient && prisma) {
        targetClient = await prisma.client.findFirst({
          where: { email: { equals: cleanEmail, mode: 'insensitive' } },
        }).catch(() => null);
      }
    }

    // 4. Fallback for staff/admin to first active client
    if (!targetClient && session.role !== 'CLIENT') {
      targetClient = globalStore.clients.find((c) => c.status === 'ACTIVE' || c.isGbpLinked) || globalStore.clients[0];
      if (!targetClient && prisma) {
        targetClient = await prisma.client.findFirst({ where: { status: 'ACTIVE' } }).catch(() => null) || await prisma.client.findFirst().catch(() => null);
      }
    }

    const targetClientId = targetClient?.id || requestedClientId || session.clientId || globalStore.clients[0]?.id || 'default';
    const settings = await globalStore.getAiReviewSettingsAsync(targetClientId, targetClient?.businessName);

    return NextResponse.json({
      success: true,
      data: {
        settings,
        client: {
          id: targetClient?.id || targetClientId,
          businessName: targetClient?.businessName,
          category: targetClient?.category,
          city: targetClient?.city,
          googleMapsUrl: targetClient?.googleMapsUrl,
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

    const prisma = await getPrisma();
    let targetClient: any = null;

    if (clientId) {
      targetClient = globalStore.clients.find((c) => c.id === clientId);
      if (!targetClient && prisma) {
        targetClient = await prisma.client.findFirst({
          where: {
            OR: [
              { id: clientId },
              { businessName: { contains: clientId.replace(/^cli_/, '').replace(/-/g, ' '), mode: 'insensitive' } },
            ],
          },
        }).catch(() => null);
      }
    }

    if (!targetClient && session.clientId) {
      targetClient = globalStore.clients.find((c) => c.id === session.clientId);
      if (!targetClient && prisma) {
        targetClient = await prisma.client.findUnique({ where: { id: session.clientId } }).catch(() => null);
      }
    }

    if (!targetClient && session.email && session.role === 'CLIENT') {
      const cleanEmail = session.email.toLowerCase();
      targetClient = globalStore.clients.find((c) => c.email.toLowerCase() === cleanEmail);
      if (!targetClient && prisma) {
        targetClient = await prisma.client.findFirst({
          where: { email: { equals: cleanEmail, mode: 'insensitive' } },
        }).catch(() => null);
      }
    }

    if (!targetClient && session.role !== 'CLIENT') {
      targetClient = globalStore.clients.find((c) => c.status === 'ACTIVE' || c.isGbpLinked) || globalStore.clients[0];
      if (!targetClient && prisma) {
        targetClient = await prisma.client.findFirst({ where: { status: 'ACTIVE' } }).catch(() => null) || await prisma.client.findFirst().catch(() => null);
      }
    }

    const targetClientId = targetClient?.id || clientId || session.clientId || globalStore.clients[0]?.id;
    if (!targetClientId) {
      return NextResponse.json({ error: 'Client ID required' }, { status: 400 });
    }

    const updated = await globalStore.saveAiReviewSettingsAsync(targetClientId, {
      ...(businessType !== undefined && { businessType }),
      ...(keyServices !== undefined && { keyServices: Array.isArray(keyServices) ? keyServices : [] }),
      ...(targetKeywords !== undefined && { targetKeywords: Array.isArray(targetKeywords) ? targetKeywords : [] }),
      ...(tone !== undefined && { tone }),
      ...(isShieldActive !== undefined && { isShieldActive: !!isShieldActive }),
      ...(customInstructions !== undefined && { customInstructions }),
      ...(reviewRedirectUrl !== undefined && { reviewRedirectUrl }),
    }, targetClient?.businessName);

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
