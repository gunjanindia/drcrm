'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  buildGeneratedWebsiteData,
  generateStandaloneHtmlBundle,
  detectCategoryKeyFromGbp,
  CATEGORY_THEMES,
  LocalCategoryKey,
  normalizeWhatsAppNumber,
} from '@/lib/one-page-site-engine';
import { getSyncedBusinessProfile } from '@/lib/client-portal-sync';

export default function PublicOnePageWebsite() {
  const params = useParams();
  const slug = params?.slug as string;
  const [renderedHtml, setRenderedHtml] = useState<string | null>(null);

  useEffect(() => {
    const profile = getSyncedBusinessProfile();

    // 1. If custom HTML override exists, use it directly
    if (profile.miniSiteConfig?.customHtml && profile.miniSiteConfig.customHtml.trim()) {
      setRenderedHtml(profile.miniSiteConfig.customHtml);
      return;
    }

    // 2. Otherwise generate from full profile & miniSiteConfig
    const detectedKey = detectCategoryKeyFromGbp(profile.category);
    const categoryKey = profile.miniSiteConfig?.category || detectedKey;
    const theme = CATEGORY_THEMES[categoryKey as LocalCategoryKey] || CATEGORY_THEMES.GENERAL;

    const data = buildGeneratedWebsiteData({
      businessName: profile.businessName || 'Your Business Name',
      category: profile.miniSiteConfig?.ownerTitle || theme.name,
      city: profile.city || '',
      address: profile.miniSiteConfig?.address || profile.address || '',
      phone: profile.miniSiteConfig?.phone || profile.phone || '+91 94311 00000',
      whatsapp: normalizeWhatsAppNumber(profile.miniSiteConfig?.whatsapp || profile.whatsapp || profile.phone),
      email: profile.email || '',
      googleMapsUrl: profile.googleMapsUrl || '',
      rating: profile.miniSiteConfig?.ratingOverride || profile.averageRating || 4.9,
      reviewCount: profile.miniSiteConfig?.reviewCountOverride || profile.reviewCount || 30,
      workingHours: profile.miniSiteConfig?.workingHours,
      headline: profile.miniSiteConfig?.headline,
      subheadline: profile.miniSiteConfig?.subheadline,
      customAboutTitle: profile.miniSiteConfig?.aboutTitle,
      customAbout: profile.miniSiteConfig?.aboutText,
      customAboutBadge: profile.miniSiteConfig?.aboutBadge,
      customAboutBadgeTitle: profile.miniSiteConfig?.aboutBadgeTitle,
      customAboutBadgeDesc: profile.miniSiteConfig?.aboutBadgeDesc,
      customAboutPillars: profile.miniSiteConfig?.aboutPillars,
      logoUrl: profile.miniSiteConfig?.logoUrl,
      bannerUrl: profile.miniSiteConfig?.bannerUrl,
      customServices: profile.miniSiteConfig?.services?.map((s) => ({
        title: s.title,
        desc: s.desc,
        price: s.price,
        badge: (s as any).badge,
      })),
      customFaqs: profile.miniSiteConfig?.faqs,
      customGalleryImages: profile.miniSiteConfig?.galleryImages,
      realReviews:
        profile.miniSiteConfig?.customReviews && profile.miniSiteConfig.customReviews.length > 0
          ? profile.miniSiteConfig.customReviews
          : profile.reviews?.map((r) => ({
              authorName: r.authorName,
              rating: r.rating,
              text: r.content,
              relativeTime: r.date,
            })),
    });

    const bundle = generateStandaloneHtmlBundle(data);
    setRenderedHtml(bundle.html);
  }, [slug]);

  if (!renderedHtml) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white text-sm">
        Loading verified website...
      </div>
    );
  }

  return (
    <div className="w-full h-screen fixed inset-0 overflow-hidden bg-white z-50">
      <iframe
        srcDoc={renderedHtml}
        className="w-full h-full border-0"
        title="Verified Business Website"
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-modals"
      />
    </div>
  );
}
