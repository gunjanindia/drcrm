'use client';

import React, { useState, useEffect } from 'react';
import { PrintableReviewQRGenerator } from '@/components/portal/PrintableReviewQRGenerator';
import {
  getSyncedBusinessProfile,
  SyncedBusinessProfile,
  DEMO_BUSINESS_PROFILE,
} from '@/lib/client-portal-sync';

export default function ReviewQRStandPage() {
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
          Printable Google Review QR Stand
        </h2>
        <p className="text-xs text-slate-500">
          Printable review stands configured with the verified Google Maps review link for <strong>{profile.businessName}</strong>.
        </p>
      </div>

      <PrintableReviewQRGenerator
        businessName={profile.businessName}
        category={profile.category}
        city={profile.city}
        googleReviewUrl={profile.googleMapsUrl || `https://maps.google.com/?q=${encodeURIComponent(profile.businessName)}`}
      />
    </div>
  );
}
