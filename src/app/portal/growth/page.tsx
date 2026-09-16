'use client';

import React from 'react';
import { GbpPerformanceDashboard } from '@/components/portal/GbpPerformanceDashboard';
import { usePortalProfile } from '@/contexts/PortalProfileContext';

export default function GrowthAnalyticsPage() {
  const { profile, updateProfile } = usePortalProfile();

  const handleInsightsUpdated = (newInsights: any[]) => {
    updateProfile({
      ...profile,
      performanceInsights: newInsights,
    });
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
          Google Business Profile Performance & Insights
        </h2>
        <p className="text-xs text-slate-500">
          Authentic performance metrics, search impressions, maps visibility, directions, calls, and website clicks for <strong>{profile.businessName}</strong>.
        </p>
      </div>

      <GbpPerformanceDashboard
        businessName={profile.businessName}
        insights={profile.performanceInsights}
        syncedAt={profile.syncedAt}
        isLiveSynced={profile.isLiveSynced}
        city={profile.city}
        clientId={profile.clientId}
        onInsightsUpdated={handleInsightsUpdated}
      />
    </div>
  );
}

