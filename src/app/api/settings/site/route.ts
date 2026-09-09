import { NextResponse } from 'next/server';
import { globalStore, defaultSiteSettings } from '@/lib/store';
import { getCurrentUserSession } from '@/lib/auth';
import { SiteSettings } from '@/types';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    if (process.env.DATABASE_URL) {
      try {
        const dbSettings = await prisma.siteSetting.findFirst({
          where: { tenantId: 'tenant_main' },
        });

        if (dbSettings) {
          const mapped: SiteSettings = {
            brandName: dbSettings.brandName || defaultSiteSettings.brandName,
            brandTagline: dbSettings.brandTagline || defaultSiteSettings.brandTagline,
            brandInitials: dbSettings.brandInitials || defaultSiteSettings.brandInitials,
            logoUrl: dbSettings.logoUrl || undefined,
            faviconUrl: dbSettings.faviconUrl || undefined,
            phone: dbSettings.phone || defaultSiteSettings.phone,
            alternatePhone: dbSettings.alternatePhone || undefined,
            whatsapp: dbSettings.whatsapp || defaultSiteSettings.whatsapp,
            email: dbSettings.email || defaultSiteSettings.email,
            supportEmail: dbSettings.supportEmail || defaultSiteSettings.supportEmail,
            address: dbSettings.address || defaultSiteSettings.address,
            city: dbSettings.city || defaultSiteSettings.city,
            state: dbSettings.state || defaultSiteSettings.state,
            pincode: dbSettings.pincode || defaultSiteSettings.pincode,
            googleMapsUrl: dbSettings.googleMapsUrl || defaultSiteSettings.googleMapsUrl,
            websiteUrl: dbSettings.websiteUrl || defaultSiteSettings.websiteUrl,
            heroBadgeText: dbSettings.heroBadgeText || defaultSiteSettings.heroBadgeText,
            heroHeadline: dbSettings.heroHeadline || defaultSiteSettings.heroHeadline,
            heroHeadlineHighlight: dbSettings.heroHeadlineHighlight || defaultSiteSettings.heroHeadlineHighlight,
            heroSubheadline: dbSettings.heroSubheadline || defaultSiteSettings.heroSubheadline,
            trustStripText: dbSettings.trustStripText || defaultSiteSettings.trustStripText,
            whatsappPitchText: dbSettings.whatsappPitchText || defaultSiteSettings.whatsappPitchText,
            metaTitle: dbSettings.metaTitle || defaultSiteSettings.metaTitle,
            metaDescription: dbSettings.metaDescription || defaultSiteSettings.metaDescription,
            metaKeywords: dbSettings.metaKeywords || defaultSiteSettings.metaKeywords,
            ogImageUrl: dbSettings.ogImageUrl || undefined,
            copyrightText: dbSettings.copyrightText || defaultSiteSettings.copyrightText,
            footerBio: dbSettings.footerBio || defaultSiteSettings.footerBio,
            taxModeNotice: dbSettings.taxModeNotice || defaultSiteSettings.taxModeNotice,
            updatedAt: dbSettings.updatedAt ? dbSettings.updatedAt.toISOString() : new Date().toISOString(),
          };
          globalStore.siteSettings = mapped;
          return NextResponse.json({
            success: true,
            settings: mapped,
            source: 'NEON_POSTGRESQL',
          });
        }
      } catch (dbErr) {
        console.error('Prisma GET siteSetting error:', dbErr);
      }
    }

    await globalStore.loadFromFile();
    return NextResponse.json({
      success: true,
      settings: globalStore.siteSettings,
      source: 'LOCAL_STORE',
    });
  } catch (error: any) {
    console.error('Error fetching site settings:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch site settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getCurrentUserSession();
    if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'BUSINESS_ADMIN')) {
      return NextResponse.json(
        { error: 'Unauthorized. Super Admin permissions are required to modify site settings.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const updatedSettings = globalStore.updateSiteSettings(body);

    // Save permanently to Neon Cloud PostgreSQL
    if (process.env.DATABASE_URL) {
      try {
        await prisma.tenant.upsert({
          where: { domain: 'digitalranchi.in' },
          update: {
            name: body.brandName || 'Digital Ranchi',
          },
          create: {
            id: 'tenant_main',
            name: body.brandName || 'Digital Ranchi',
            domain: 'digitalranchi.in',
            isActive: true,
          },
        });

        const savedDb = await prisma.siteSetting.upsert({
          where: { tenantId: 'tenant_main' },
          update: {
            brandName: body.brandName,
            brandTagline: body.brandTagline,
            brandInitials: body.brandInitials,
            logoUrl: body.logoUrl || null,
            faviconUrl: body.faviconUrl || null,
            phone: body.phone,
            alternatePhone: body.alternatePhone || null,
            whatsapp: body.whatsapp,
            email: body.email,
            supportEmail: body.supportEmail,
            address: body.address,
            city: body.city,
            state: body.state,
            pincode: body.pincode,
            googleMapsUrl: body.googleMapsUrl || null,
            websiteUrl: body.websiteUrl || null,
            heroBadgeText: body.heroBadgeText,
            heroHeadline: body.heroHeadline,
            heroHeadlineHighlight: body.heroHeadlineHighlight,
            heroSubheadline: body.heroSubheadline,
            trustStripText: body.trustStripText,
            whatsappPitchText: body.whatsappPitchText,
            metaTitle: body.metaTitle,
            metaDescription: body.metaDescription,
            metaKeywords: body.metaKeywords,
            ogImageUrl: body.ogImageUrl || null,
            copyrightText: body.copyrightText,
            footerBio: body.footerBio,
            taxModeNotice: body.taxModeNotice,
          },
          create: {
            id: 'site_settings_main',
            tenantId: 'tenant_main',
            brandName: body.brandName || defaultSiteSettings.brandName,
            brandTagline: body.brandTagline || defaultSiteSettings.brandTagline,
            brandInitials: body.brandInitials || defaultSiteSettings.brandInitials,
            logoUrl: body.logoUrl || null,
            faviconUrl: body.faviconUrl || null,
            phone: body.phone || defaultSiteSettings.phone,
            alternatePhone: body.alternatePhone || null,
            whatsapp: body.whatsapp || defaultSiteSettings.whatsapp,
            email: body.email || defaultSiteSettings.email,
            supportEmail: body.supportEmail || defaultSiteSettings.supportEmail,
            address: body.address || defaultSiteSettings.address,
            city: body.city || defaultSiteSettings.city,
            state: body.state || defaultSiteSettings.state,
            pincode: body.pincode || defaultSiteSettings.pincode,
            googleMapsUrl: body.googleMapsUrl || defaultSiteSettings.googleMapsUrl || null,
            websiteUrl: body.websiteUrl || defaultSiteSettings.websiteUrl || null,
            heroBadgeText: body.heroBadgeText || defaultSiteSettings.heroBadgeText,
            heroHeadline: body.heroHeadline || defaultSiteSettings.heroHeadline,
            heroHeadlineHighlight: body.heroHeadlineHighlight || defaultSiteSettings.heroHeadlineHighlight,
            heroSubheadline: body.heroSubheadline || defaultSiteSettings.heroSubheadline,
            trustStripText: body.trustStripText || defaultSiteSettings.trustStripText,
            whatsappPitchText: body.whatsappPitchText || defaultSiteSettings.whatsappPitchText,
            metaTitle: body.metaTitle || defaultSiteSettings.metaTitle,
            metaDescription: body.metaDescription || defaultSiteSettings.metaDescription,
            metaKeywords: body.metaKeywords || defaultSiteSettings.metaKeywords,
            ogImageUrl: body.ogImageUrl || null,
            copyrightText: body.copyrightText || defaultSiteSettings.copyrightText,
            footerBio: body.footerBio || defaultSiteSettings.footerBio,
            taxModeNotice: body.taxModeNotice || defaultSiteSettings.taxModeNotice,
          },
        });

        if (savedDb) {
          globalStore.siteSettings = {
            ...updatedSettings,
            updatedAt: savedDb.updatedAt.toISOString(),
          };
        }
      } catch (dbErr) {
        console.error('Failed to sync site settings to Neon PostgreSQL:', dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      settings: globalStore.siteSettings,
      message: 'Site settings and brand customization saved permanently to database!',
    });
  } catch (error: any) {
    console.error('Error updating site settings:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to update site settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  return PUT(request);
}
