import { NextResponse } from 'next/server';
import { getCurrentUserSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { globalStore } from '@/lib/store';

export async function POST(request: Request) {
  try {
    const session = await getCurrentUserSession();
    const body = await request.json();
    const {
      clientId,
      slug,
      miniSiteConfig,
      customHtml,
      html,
    } = body;

    const targetClientId = clientId || session?.clientId;
    let clientRecord: any = null;

    if (process.env.DATABASE_URL && prisma) {
      try {
        if (targetClientId) {
          clientRecord = await prisma.client.findUnique({
            where: { id: targetClientId },
          });
        }
        if (!clientRecord && session?.email) {
          clientRecord = await prisma.client.findFirst({
            where: { email: { equals: session.email, mode: 'insensitive' } },
          });
        }
      } catch (e) {
        console.error('Error finding client for site publish in DB:', e);
      }
    }

    if (!clientRecord && targetClientId) {
      clientRecord = globalStore.clients.find((c) => c.id === targetClientId);
    }
    if (!clientRecord && session?.email) {
      clientRecord = globalStore.clients.find(
        (c) => c.email?.toLowerCase() === session.email?.toLowerCase()
      );
    }

    const cleanSlug = (slug || clientRecord?.businessName || 'my-business')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    const publishedUrl = `https://digitalranchi.in/s/${cleanSlug}`;

    // 1. Update Client in Prisma if available
    if (process.env.DATABASE_URL && prisma && clientRecord) {
      try {
        await prisma.client.update({
          where: { id: clientRecord.id },
          data: {
            websiteUrl: publishedUrl,
          },
        }).catch(() => null);

        // Store site configuration and rendered HTML in TimelineActivity
        const sitePayload = JSON.stringify({
          slug: cleanSlug,
          publishedUrl,
          miniSiteConfig: miniSiteConfig || {},
          customHtml: customHtml || '',
          renderedHtml: html || '',
          publishedAt: new Date().toISOString(),
        });

        // Upsert or create timeline activity
        const existingActivity = await prisma.timelineActivity.findFirst({
          where: {
            clientId: clientRecord.id,
            type: 'MINI_SITE_CONFIG',
          },
        });

        if (existingActivity) {
          await prisma.timelineActivity.update({
            where: { id: existingActivity.id },
            data: {
              description: sitePayload,
              timestamp: new Date(),
            },
          });
        } else {
          await prisma.timelineActivity.create({
            data: {
              clientId: clientRecord.id,
              type: 'MINI_SITE_CONFIG',
              title: `1-Page Website Published: /s/${cleanSlug}`,
              description: sitePayload,
              actorName: session?.name || session?.email || clientRecord.businessName,
              timestamp: new Date(),
            },
          });
        }
      } catch (dbErr) {
        console.error('Error persisting published site to Prisma:', dbErr);
      }
    }

    // 2. Update globalStore in memory
    if (clientRecord) {
      const idx = globalStore.clients.findIndex((c) => c.id === clientRecord.id);
      if (idx !== -1) {
        globalStore.clients[idx] = {
          ...globalStore.clients[idx],
          websiteUrl: publishedUrl,
          miniSiteConfig: miniSiteConfig || {},
        };
      }
    }

    globalStore.activities.unshift({
      id: `act_site_${Date.now()}`,
      clientId: clientRecord?.id || targetClientId || 'client_unknown',
      type: 'MINI_SITE_CONFIG',
      title: `1-Page Website Published: /s/${cleanSlug}`,
      description: JSON.stringify({
        slug: cleanSlug,
        publishedUrl,
        miniSiteConfig: miniSiteConfig || {},
        customHtml: customHtml || '',
        renderedHtml: html || '',
        publishedAt: new Date().toISOString(),
      }),
      timestamp: new Date().toISOString(),
      actorName: session?.name || 'Client',
    });

    globalStore.saveToFile();

    return NextResponse.json({
      success: true,
      slug: cleanSlug,
      url: publishedUrl,
      message: 'Website published and live across all devices!',
    });
  } catch (error: any) {
    console.error('POST /api/portal/site-builder/publish error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to publish website' },
      { status: 500 }
    );
  }
}
