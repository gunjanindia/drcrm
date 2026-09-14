'use client';

import React from 'react';
import { DigitalHealthAuditCard } from '@/components/portal/DigitalHealthAuditCard';
import { usePortalProfile } from '@/contexts/PortalProfileContext';

export default function DigitalHealthAuditPage() {
  const { profile } = usePortalProfile();

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
        factors={profile.auditFactors}
      />
    </div>
  );
}
