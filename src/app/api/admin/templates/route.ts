import { NextResponse } from 'next/server';
import { getCurrentUserSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { CATEGORY_THEMES } from '@/lib/one-page-site-engine';

// In-memory fallback cache for custom templates
export const globalCustomTemplates: Map<string, any> = new Map();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryKey = searchParams.get('categoryKey');

    let dbTemplates: any[] = [];
    if (process.env.DATABASE_URL && prisma) {
      try {
        dbTemplates = await prisma.categoryTemplate.findMany({
          orderBy: { updatedAt: 'desc' },
        });
      } catch (dbErr) {
        console.warn('DB error fetching category templates, using in-memory store:', dbErr);
      }
    }

    // Merge built-in CATEGORY_THEMES
    const builtInList = Object.entries(CATEGORY_THEMES).map(([key, theme]) => ({
      id: `builtin_${key.toLowerCase()}`,
      categoryKey: key,
      name: theme.name,
      taglineDefault: theme.taglineDefault,
      headlineTemplate: theme.headlineTemplate('{name}', '{city}'),
      subheadlineTemplate: theme.subheadlineTemplate(theme.name, '{city}'),
      primaryCtaText: theme.primaryCtaText,
      primaryCtaType: theme.primaryCtaType,
      secondaryCtaText: theme.secondaryCtaText,
      secondaryCtaType: theme.secondaryCtaType,
      accentColor: theme.accentColor,
      accentBg: theme.accentBg,
      gradient: theme.gradient,
      badgeText: theme.badgeText,
      servicesTitle: theme.servicesTitle,
      servicesSubtitle: theme.servicesSubtitle,
      galleryTitle: theme.galleryTitle,
      trustTitle: theme.trustTitle,
      defaultServices: theme.defaultServices,
      defaultFaqs: theme.defaultFaqs,
      defaultGalleryImages: theme.defaultGalleryImages,
      isCustom: false,
      isAiGenerated: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    // In-memory custom templates
    const memoryTemplates = Array.from(globalCustomTemplates.values());

    // Map by categoryKey for fast overriding (DB/Memory custom templates override built-in)
    const combinedMap = new Map<string, any>();
    builtInList.forEach((t) => combinedMap.set(t.categoryKey.toUpperCase(), t));
    memoryTemplates.forEach((t) => combinedMap.set(t.categoryKey.toUpperCase(), { ...t, isCustom: true }));
    dbTemplates.forEach((t) => combinedMap.set(t.categoryKey.toUpperCase(), { ...t, isCustom: true }));

    const allTemplates = Array.from(combinedMap.values());

    if (categoryKey) {
      const matched = combinedMap.get(categoryKey.toUpperCase());
      return NextResponse.json({ success: true, data: matched || null });
    }

    return NextResponse.json({
      success: true,
      total: allTemplates.length,
      customCount: allTemplates.filter((t) => t.isCustom).length,
      data: allTemplates,
    });
  } catch (error: any) {
    console.error('GET /api/admin/templates error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch category templates' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getCurrentUserSession();
    if (session && session.role !== 'SUPER_ADMIN' && session.role !== 'BUSINESS_ADMIN' && session.role !== 'OPERATIONS_MANAGER') {
      return NextResponse.json({ error: 'Unauthorized: Admin privileges required' }, { status: 403 });
    }

    const body = await request.json();
    const {
      name,
      categoryKey,
      taglineDefault,
      headlineTemplate,
      subheadlineTemplate,
      primaryCtaText = 'Get Free Quote',
      primaryCtaType = 'whatsapp',
      secondaryCtaText = 'Call Directly',
      secondaryCtaType = 'call',
      accentColor = '#4f46e5',
      accentBg = 'bg-indigo-600',
      gradient = 'from-slate-900 via-indigo-950 to-slate-900',
      badgeText = 'Verified Local Business',
      servicesTitle = 'Our Professional Services',
      servicesSubtitle = 'Tailored solutions delivered with precision.',
      galleryTitle = 'Our Work & Showcase',
      trustTitle = 'Why Choose Us',
      defaultServices = [],
      defaultFaqs = [],
      defaultGalleryImages = [],
      customCss = '',
      isAiGenerated = false,
      gbpSourceContext = '',
    } = body;

    if (!name || !categoryKey) {
      return NextResponse.json({ error: 'Category Name and Category Key are required' }, { status: 400 });
    }

    const cleanKey = categoryKey.toUpperCase().replace(/[^A-Z0-9_]/g, '_').trim();

    const templateData = {
      categoryKey: cleanKey,
      name,
      taglineDefault: taglineDefault || `${name} • Verified Quality • Direct Support`,
      headlineTemplate: headlineTemplate || `Expert ${name} Services in {city}`,
      subheadlineTemplate: subheadlineTemplate || `Professional ${name} solutions with verified satisfaction and prompt support.`,
      primaryCtaText,
      primaryCtaType,
      secondaryCtaText,
      secondaryCtaType,
      accentColor,
      accentBg,
      gradient,
      badgeText,
      servicesTitle,
      servicesSubtitle,
      galleryTitle,
      trustTitle,
      defaultServices,
      defaultFaqs,
      defaultGalleryImages,
      customCss,
      isCustom: true,
      isAiGenerated: Boolean(isAiGenerated),
      gbpSourceContext,
    };

    let savedRecord: any = null;

    if (process.env.DATABASE_URL && prisma) {
      try {
        savedRecord = await prisma.categoryTemplate.upsert({
          where: { categoryKey: cleanKey },
          create: templateData,
          update: templateData,
        });
      } catch (dbErr) {
        console.warn('Prisma upsert categoryTemplate failed, saving to memory:', dbErr);
      }
    }

    if (!savedRecord) {
      savedRecord = {
        id: `tpl_${cleanKey.toLowerCase()}_${Date.now()}`,
        ...templateData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    globalCustomTemplates.set(cleanKey, savedRecord);

    return NextResponse.json({
      success: true,
      message: `Category template "${name}" (${cleanKey}) saved successfully.`,
      data: savedRecord,
    });
  } catch (error: any) {
    console.error('POST /api/admin/templates error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save category template' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getCurrentUserSession();
    if (session && session.role !== 'SUPER_ADMIN' && session.role !== 'BUSINESS_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin privileges required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const categoryKey = searchParams.get('categoryKey') || '';
    const id = searchParams.get('id') || '';

    if (!categoryKey && !id) {
      return NextResponse.json({ error: 'categoryKey or id is required' }, { status: 400 });
    }

    const cleanKey = categoryKey.toUpperCase();

    if (process.env.DATABASE_URL && prisma) {
      try {
        if (cleanKey) {
          await prisma.categoryTemplate.deleteMany({
            where: { categoryKey: cleanKey },
          });
        } else if (id) {
          await prisma.categoryTemplate.delete({
            where: { id },
          });
        }
      } catch (dbErr) {
        console.warn('DB error deleting category template:', dbErr);
      }
    }

    if (cleanKey) {
      globalCustomTemplates.delete(cleanKey);
    }

    return NextResponse.json({
      success: true,
      message: `Template deleted successfully.`,
    });
  } catch (error: any) {
    console.error('DELETE /api/admin/templates error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete category template' },
      { status: 500 }
    );
  }
}
