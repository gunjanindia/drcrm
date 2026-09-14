'use client';

import React from 'react';
import { OnePageSiteBuilder } from '@/components/portal/OnePageSiteBuilder';
import { DEFAULT_MINI_SITE } from '@/lib/client-360-data';

export default function SiteBuilderPage() {
  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
          1-Page Mini-Site Builder (GBP Linked)
        </h2>
        <p className="text-xs text-slate-500">
          Publish a lightning-fast mobile landing page with 1-click WhatsApp & Call appointment booking.
        </p>
      </div>

      <OnePageSiteBuilder initialConfig={DEFAULT_MINI_SITE} />
    </div>
  );
}
