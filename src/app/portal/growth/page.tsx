'use client';

import React from 'react';
import { MonthlyGrowthChart } from '@/components/portal/MonthlyGrowthChart';
import { usePortalProfile } from '@/contexts/PortalProfileContext';

export default function GrowthAnalyticsPage() {
  const { profile } = usePortalProfile();

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
          Monthly Growth & Performance Tracker
        </h2>
        <p className="text-xs text-slate-500">
          Track month-over-month rise in your Google Maps Local Pack ranking, phone calls, profile visits, and customer actions for <strong>{profile.businessName}</strong>.
        </p>
      </div>

      <MonthlyGrowthChart
        businessName={profile.businessName}
        metrics={profile.growthMetrics}
        syncedAt={profile.syncedAt}
        isLiveSynced={profile.isLiveSynced}
        city={profile.city}
      />
    </div>
  );
}
