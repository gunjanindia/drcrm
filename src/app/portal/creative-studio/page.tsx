'use client';

import React, { useState, useEffect } from 'react';
import { FestivalCreativeStudio } from '@/components/portal/FestivalCreativeStudio';
import { AIPointsWalletModal } from '@/components/portal/AIPointsWalletModal';
import { Zap } from 'lucide-react';
import {
  getSyncedBusinessProfile,
  SyncedBusinessProfile,
  DEMO_BUSINESS_PROFILE,
} from '@/lib/client-portal-sync';

export default function CreativeStudioPage() {
  const [profile, setProfile] = useState<SyncedBusinessProfile>(DEMO_BUSINESS_PROFILE);
  const [aiPoints, setAiPoints] = useState(65);
  const [isWalletOpen, setIsWalletOpen] = useState(false);

  useEffect(() => {
    setProfile(getSyncedBusinessProfile());
    const handleUpdate = (e: any) => {
      if (e.detail) setProfile(e.detail);
    };
    window.addEventListener('drcrm_gbp_profile_updated', handleUpdate);
    return () => window.removeEventListener('drcrm_gbp_profile_updated', handleUpdate);
  }, []);

  const handleDeductPoints = (amount: number) => {
    if (aiPoints < amount) {
      setIsWalletOpen(true);
      return false;
    }
    setAiPoints((prev) => prev - amount);
    return true;
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Festival & Offer AI Creative Studio
          </h2>
          <p className="text-xs text-slate-500">
            Generate promotional posters and WhatsApp broadcasts for <strong>{profile.businessName}</strong>.
          </p>
        </div>

        <button
          onClick={() => setIsWalletOpen(true)}
          className="px-3.5 py-1.5 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 hover:bg-amber-500/25 transition-colors"
        >
          <Zap className="w-3.5 h-3.5 fill-current" />
          <span>{aiPoints} AI Credits</span>
          <span className="text-[10px] text-indigo-600 underline ml-1">+ Recharge</span>
        </button>
      </div>

      <FestivalCreativeStudio
        businessName={profile.businessName}
        category={profile.category}
        phone={profile.phone}
        address={profile.address}
        city={profile.city}
        currentPoints={aiPoints}
        onDeductPoints={handleDeductPoints}
        onOpenRechargeModal={() => setIsWalletOpen(true)}
      />

      <AIPointsWalletModal
        isOpen={isWalletOpen}
        onClose={() => setIsWalletOpen(false)}
        currentPoints={aiPoints}
        onPointsAdded={(pts) => setAiPoints((p) => p + pts)}
      />
    </div>
  );
}
