'use client';

import React, { useState, useEffect } from 'react';
import { ReviewManagementWidget } from '@/components/portal/ReviewManagementWidget';
import { GoogleGbpAuthCard } from '@/components/portal/GoogleGbpAuthCard';
import { AIPointsWalletModal } from '@/components/portal/AIPointsWalletModal';
import { Zap } from 'lucide-react';
import { GoogleGbpAuthProfile, DEFAULT_GBP_AUTH } from '@/lib/client-360-data';
import {
  getSyncedBusinessProfile,
  SyncedBusinessProfile,
  DEMO_BUSINESS_PROFILE,
} from '@/lib/client-portal-sync';

export default function ReviewsManagementPage() {
  const [profile, setProfile] = useState<SyncedBusinessProfile>(DEMO_BUSINESS_PROFILE);
  const [aiPoints, setAiPoints] = useState(65);
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [gbpAuth, setGbpAuth] = useState<GoogleGbpAuthProfile>(DEFAULT_GBP_AUTH);

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
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Google Reviews & AI Smart Responder
          </h2>
          <p className="text-xs text-slate-500">
            Monitoring customer feedback for <strong>{profile.businessName}</strong> ({profile.averageRating}★ across {profile.reviewCount} reviews).
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

      {/* Google GBP OAuth Connection Card */}
      <GoogleGbpAuthCard
        businessName={profile.businessName}
        initialAuth={{
          isConnected: profile.isLiveSynced && !!profile.googleOwnerEmail,
          googleEmail: profile.googleOwnerEmail || 'business.owner@gmail.com',
          accountName: profile.googleAccountName || `${profile.businessName} Owner`,
          locationId: profile.placeId ? `locations/${profile.placeId}` : 'locations/184920485729103948',
          locationName: `${profile.businessName} Google Maps Listing`,
          connectedAt: profile.syncedAt || 'Active Session',
          scopesGranted: [
            'https://www.googleapis.com/auth/business.manage',
            'openid',
            'email',
            'profile',
          ],
          reviewsSyncActive: true,
          canPostReplies: true,
        }}
        onAuthChange={setGbpAuth}
      />

      {/* Review Management Workspace */}
      <ReviewManagementWidget
        businessName={profile.businessName}
        reviews={profile.reviews}
        currentPoints={aiPoints}
        gbpAuth={gbpAuth}
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
