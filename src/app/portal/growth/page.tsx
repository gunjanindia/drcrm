'use client';

import React, { useState, useEffect } from 'react';
import { MonthlyGrowthChart } from '@/components/portal/MonthlyGrowthChart';
import {
  getSyncedBusinessProfile,
  SyncedBusinessProfile,
  DEMO_BUSINESS_PROFILE,
} from '@/lib/client-portal-sync';

export default function GrowthAnalyticsPage() {
  const [profile, setProfile] = useState<SyncedBusinessProfile>(DEMO_BUSINESS_PROFILE);

  useEffect(() => {
    setProfile(getSyncedBusinessProfile());
    const handleUpdate = (e: any) => {
      if (e.detail) setProfile(e.detail);
    };
    window.addEventListener('drcrm_gbp_profile_updated', handleUpdate);
    return () => window.removeEventListener('drcrm_gbp_profile_updated', handleUpdate);
  }, []);

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
      />
    </div>
  );
}
