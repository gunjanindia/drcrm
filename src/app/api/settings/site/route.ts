import { NextResponse } from 'next/server';
import { globalStore } from '@/lib/store';
import { getCurrentUserSession } from '@/lib/auth';
import { SiteSettings } from '@/types';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    await globalStore.loadFromFile();
    return NextResponse.json({
      success: true,
      settings: globalStore.siteSettings,
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

    // If database configured, update tenant name / domain representation if brand changed
    if (process.env.DATABASE_URL && body.brandName) {
      try {
        await prisma.tenant.upsert({
          where: { domain: 'digitalranchi.in' },
          update: {
            name: body.brandName,
          },
          create: {
            id: 'tenant_main',
            name: body.brandName,
            domain: 'digitalranchi.in',
            isActive: true,
          },
        });
      } catch (dbErr) {
        console.error('Failed to sync tenant name in DB:', dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      settings: updatedSettings,
      message: 'Site settings and brand customization saved successfully!',
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
