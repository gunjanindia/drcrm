'use client';

import React from 'react';
import { OnePageSiteBuilder } from '@/components/portal/OnePageSiteBuilder';
import { DEFAULT_MINI_SITE } from '@/lib/client-360-data';
import { usePortalProfile } from '@/contexts/PortalProfileContext';

export default function SiteBuilderPage() {
  const { profile } = usePortalProfile();

  const configToUse = profile.miniSiteConfig || {
    ...DEFAULT_MINI_SITE,
    headline: profile.businessName,
    subheadline: `Verified ${profile.category} in ${profile.city}`,
    address: profile.address,
    phone: profile.phone,
    whatsapp: profile.whatsapp,
    customSlug: profile.businessName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
          1-Page Mini-Site Builder (GBP Linked)
        </h2>
        <p className="text-xs text-slate-500">
          Publish a lightning-fast mobile landing page with 1-click WhatsApp & Call appointment booking for <strong>{profile.businessName}</strong>.
        </p>
      </div>

      <OnePageSiteBuilder initialConfig={configToUse} />
    </div>
  );
}
