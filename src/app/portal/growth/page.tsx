'use client';

import React from 'react';
import { MonthlyGrowthChart } from '@/components/portal/MonthlyGrowthChart';
import { globalStore } from '@/lib/store';

export default function GrowthAnalyticsPage() {
  const client = globalStore.clients[0] || {
    businessName: 'Ranchi Dental Care & Implant Center',
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
          Monthly Growth & Performance Tracker
        </h2>
        <p className="text-xs text-slate-500">
          Track month-over-month rise in your Google Maps Local Pack ranking, phone calls, profile visits, and confirmed appointments.
        </p>
      </div>

      <MonthlyGrowthChart businessName={client.businessName} />
    </div>
  );
}
