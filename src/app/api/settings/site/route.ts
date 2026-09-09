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
            brandName: dbSettings.brandName || 'DIGITAL RANCHI',
            brandTagline: dbSettings.brandTagline || 'Local Growth OS',
            brandInitials: dbSettings.brandInitials || 'DR',
            logoUrl: dbSettings.logoUrl || undefined,
            faviconUrl: dbSettings.faviconUrl || undefined,
            phone: dbSettings.phone || '+91 94311 09876',
            alternatePhone: dbSettings.alternatePhone || undefined,
            whatsapp: dbSettings.whatsapp || '+91 94311 09876',
            email: dbSettings.email || 'growth@digitalranchi.in',
            supportEmail: dbSettings.supportEmail || 'support@digitalranchi.in',
            address: dbSettings.address || 'Main Road, Lalpur & Circular Road, Ranchi, Jharkhand — 834001',
            city: dbSettings.city || 'Ranchi',
            state: dbSettings.state || 'Jharkhand',
            pincode: dbSettings.pincode || '834001',
            googleMapsUrl: dbSettings.googleMapsUrl || undefined,
            websiteUrl: dbSettings.websiteUrl || undefined,
            heroBadgeText: dbSettings.heroBadgeText || 'Rank #1 on Google Maps in Ranchi & Jharkhand',
            heroHeadline: dbSettings.heroHeadline || 'Get Your Business Found on',
            heroHeadlineHighlight: dbSettings.heroHeadlineHighlight || 'Google & WhatsApp',
            heroSubheadline: dbSettings.heroSubheadline || '',
            trustStripText: dbSettings.trustStripText || '4.8/5 Rating Across 250+ Ranchi SMBs',
            whatsappPitchText: dbSettings.whatsappPitchText || 'Hi Digital Ranchi, I want to talk to an expert about growing my local business on Google',
            metaTitle: dbSettings.metaTitle || 'Digital Ranchi — Google Business Profile & Local SEO Growth Engine',
            metaDescription: dbSettings.metaDescription || '',
            metaKeywords: dbSettings.metaKeywords || '',
            ogImageUrl: dbSettings.ogImageUrl || undefined,
            copyrightText: dbSettings.copyrightText || 'Digital Ranchi. All rights reserved.',
            footerBio: dbSettings.footerBio || '',
            taxModeNotice: dbSettings.taxModeNotice || 'Tax Mode: Non-GST Bill of Supply (Configurable)',
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
            brandName: body.brandName || 'DIGITAL RANCHI',
            brandTagline: body.brandTagline || 'Local Growth OS',
            brandInitials: body.brandInitials || 'DR',
            logoUrl: body.logoUrl || null,
            faviconUrl: body.faviconUrl || null,
            phone: body.phone || '+91 94311 09876',
            alternatePhone: body.alternatePhone || null,
            whatsapp: body.whatsapp || '+91 94311 09876',
            email: body.email || 'growth@digitalranchi.in',
            supportEmail: body.supportEmail || 'support@digitalranchi.in',
            address: body.address || 'Main Road, Lalpur & Circular Road, Ranchi, Jharkhand — 834001',
            city: body.city || 'Ranchi',
            state: body.state || 'Jharkhand',
            pincode: body.pincode || '834001',
            googleMapsUrl: body.googleMapsUrl || null,
            websiteUrl: body.websiteUrl || null,
            heroBadgeText: body.heroBadgeText || 'Rank #1 on Google Maps in Ranchi & Jharkhand',
            heroHeadline: body.heroHeadline || 'Get Your Business Found on',
            heroHeadlineHighlight: body.heroHeadlineHighlight || 'Google & WhatsApp',
            heroSubheadline: body.heroSubheadline || '',
            trustStripText: body.trustStripText || '4.8/5 Rating Across 250+ Ranchi SMBs',
            whatsappPitchText: body.whatsappPitchText || 'Hi Digital Ranchi, I want to talk to an expert about growing my local business on Google',
            metaTitle: body.metaTitle || 'Digital Ranchi — Google Business Profile & Local SEO Growth Engine',
            metaDescription: body.metaDescription || '',
            metaKeywords: body.metaKeywords || '',
            ogImageUrl: body.ogImageUrl || null,
            copyrightText: body.copyrightText || 'Digital Ranchi. All rights reserved.',
            footerBio: body.footerBio || '',
            taxModeNotice: body.taxModeNotice || 'Tax Mode: Non-GST Bill of Supply (Configurable)',
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
