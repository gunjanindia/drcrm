import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { globalStore } from '@/lib/store';
import {
  buildGeneratedWebsiteData,
  generateStandaloneHtmlBundle,
  detectCategoryKeyFromGbp,
  CATEGORY_THEMES,
  LocalCategoryKey,
  normalizeWhatsAppNumber,
} from '@/lib/one-page-site-engine';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    if (!slug) {
      return NextResponse.json({ error: 'Site slug is required' }, { status: 400 });
    }

    const cleanSlug = slug
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    let clientRecord: any = null;
    let savedSiteConfig: any = null;
    let storedHtml: string | null = null;

    // 1. Search TimelineActivity for exact published MINI_SITE_CONFIG in PostgreSQL
    if (process.env.DATABASE_URL && prisma) {
      try {
        const activities = await prisma.timelineActivity.findMany({
          where: { type: 'MINI_SITE_CONFIG' },
          orderBy: { timestamp: 'desc' },
        });

        for (const act of activities) {
          if (act.description) {
            try {
              const parsed = JSON.parse(act.description);
              if (parsed && (parsed.slug === cleanSlug || parsed.slug?.toLowerCase() === cleanSlug)) {
                savedSiteConfig = parsed.miniSiteConfig || {};
                storedHtml = parsed.customHtml || parsed.renderedHtml || null;
                clientRecord = await prisma.client.findUnique({
                  where: { id: act.clientId },
                });
                break;
              }
            } catch (e) {}
          }
        }
      } catch (dbErr) {
        console.warn('Error querying timeline activities for site slug:', dbErr);
      }
    }

    // 2. Check globalStore timeline activities if not found in DB
    if (!clientRecord && !savedSiteConfig) {
      for (const act of globalStore.activities) {
        if (act.type === 'MINI_SITE_CONFIG' && act.description) {
          try {
            const parsed = JSON.parse(act.description);
            if (parsed && (parsed.slug === cleanSlug || parsed.slug?.toLowerCase() === cleanSlug)) {
              savedSiteConfig = parsed.miniSiteConfig || {};
              storedHtml = parsed.customHtml || parsed.renderedHtml || null;
              clientRecord = globalStore.clients.find((c) => c.id === act.clientId);
              break;
            }
          } catch (e) {}
        }
      }
    }

    // 3. Match Client by businessName slug, websiteUrl, or ID in Prisma PostgreSQL
    if (!clientRecord && process.env.DATABASE_URL && prisma) {
      try {
        const allClients = await prisma.client.findMany();
        clientRecord = allClients.find((c) => {
          const clientSlug = (c.businessName || '')
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');

          return (
            clientSlug === cleanSlug ||
            (c.websiteUrl && c.websiteUrl.toLowerCase().includes(`/s/${cleanSlug}`)) ||
            c.id.toLowerCase() === cleanSlug
          );
        });
      } catch (e) {}
    }

    // 4. Match Client in globalStore
    if (!clientRecord) {
      clientRecord = globalStore.clients.find((c) => {
        const clientSlug = (c.businessName || '')
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '');

        return (
          clientSlug === cleanSlug ||
          (c.websiteUrl && c.websiteUrl.toLowerCase().includes(`/s/${cleanSlug}`)) ||
          c.id.toLowerCase() === cleanSlug
        );
      });
    }

    // If client is still not found, return 404
    if (!clientRecord && !savedSiteConfig) {
      return NextResponse.json(
        {
          success: false,
          error: `No published website found for "${cleanSlug}".`,
        },
        { status: 404 }
      );
    }

    // 5. If custom HTML override exists and is non-empty, return it
    if (storedHtml && storedHtml.trim()) {
      return NextResponse.json({
        success: true,
        businessName: clientRecord?.businessName || savedSiteConfig?.headline || 'Verified Business',
        html: storedHtml,
        config: savedSiteConfig,
        source: 'STORED_CUSTOM_HTML',
      });
    }

    // 6. Otherwise generate fresh HTML bundle from client record & miniSiteConfig
    const bizName = clientRecord?.businessName || savedSiteConfig?.headline || 'Verified Business';
    const detectedKey = detectCategoryKeyFromGbp(clientRecord?.category || savedSiteConfig?.category || 'Local Business');
    const categoryKey = savedSiteConfig?.category || detectedKey;
    const theme = CATEGORY_THEMES[categoryKey as LocalCategoryKey] || CATEGORY_THEMES.GENERAL;

    const data = buildGeneratedWebsiteData({
      businessName: bizName,
      category: savedSiteConfig?.ownerTitle || theme.name,
      city: clientRecord?.city || '',
      address: savedSiteConfig?.address || clientRecord?.address || '',
      phone: savedSiteConfig?.phone || clientRecord?.phone || '+91 94311 00000',
      whatsapp: normalizeWhatsAppNumber(savedSiteConfig?.whatsapp || clientRecord?.whatsapp || clientRecord?.phone),
      email: clientRecord?.email || '',
      googleMapsUrl: clientRecord?.googleMapsUrl || '',
      rating: savedSiteConfig?.ratingOverride || clientRecord?.averageRating || 4.9,
      reviewCount: savedSiteConfig?.reviewCountOverride || clientRecord?.reviewCount || 25,
      workingHours: savedSiteConfig?.workingHours,
      headline: savedSiteConfig?.headline || bizName,
      subheadline: savedSiteConfig?.subheadline || `Verified ${clientRecord?.category || 'Local Business'} in ${clientRecord?.city || 'Jharkhand'}`,
      customAboutTitle: savedSiteConfig?.aboutTitle,
      customAbout: savedSiteConfig?.aboutText,
      customAboutBadge: savedSiteConfig?.aboutBadge,
      customAboutBadgeTitle: savedSiteConfig?.aboutBadgeTitle,
      customAboutBadgeDesc: savedSiteConfig?.aboutBadgeDesc,
      customAboutPillars: savedSiteConfig?.aboutPillars,
      logoUrl: savedSiteConfig?.logoUrl,
      bannerUrl: savedSiteConfig?.bannerUrl,
      customServices: savedSiteConfig?.services?.map((s: any) => ({
        title: s.title,
        desc: s.desc,
        price: s.price,
        badge: s.badge,
      })),
      customFaqs: savedSiteConfig?.faqs,
      customGalleryImages: savedSiteConfig?.galleryImages,
      realReviews:
        savedSiteConfig?.customReviews && savedSiteConfig.customReviews.length > 0
          ? savedSiteConfig.customReviews
          : (clientRecord?.reviews || []).map((r: any) => ({
              authorName: r.authorName,
              rating: r.rating,
              text: r.content,
              relativeTime: r.date,
            })),
    });

    const bundle = generateStandaloneHtmlBundle(data);

    return NextResponse.json({
      success: true,
      businessName: bizName,
      html: bundle.html,
      config: savedSiteConfig,
      source: 'SERVER_GENERATED_BUNDLE',
    });
  } catch (error: any) {
    console.error('GET /api/public/site/[slug] error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to load website' },
      { status: 500 }
    );
  }
}
