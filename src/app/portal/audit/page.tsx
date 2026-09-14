'use client';

import React, { useState, useEffect } from 'react';
import { DigitalHealthAuditCard } from '@/components/portal/DigitalHealthAuditCard';
import {
  getSyncedBusinessProfile,
  SyncedBusinessProfile,
  DEMO_BUSINESS_PROFILE,
} from '@/lib/client-portal-sync';

export default function DigitalHealthAuditPage() {
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
          Digital Health Audit & Optimization Factors
        </h2>
        <p className="text-xs text-slate-500">
          Understand every factor contributing to your verified Google Maps ranking for <strong>{profile.businessName}</strong>.
        </p>
      </div>

      <DigitalHealthAuditCard
        businessName={profile.businessName}
        category={profile.category}
        city={profile.city}
      />
    </div>
  );
}
