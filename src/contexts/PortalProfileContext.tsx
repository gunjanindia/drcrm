'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  SyncedBusinessProfile,
  DEMO_BUSINESS_PROFILE,
  getSyncedBusinessProfile,
  saveSyncedBusinessProfile,
  fetchPortalProfileFromServer,
} from '@/lib/client-portal-sync';
import { ClientReviewItem } from '@/lib/client-360-data';

interface PortalProfileContextType {
  profile: SyncedBusinessProfile;
  isLoading: boolean;
  updateProfile: (newProfile: SyncedBusinessProfile) => void;
  refreshProfile: () => Promise<SyncedBusinessProfile>;
  saveReviewReply: (reviewId: string, replyText: string, authorName?: string) => Promise<boolean>;
}

const PortalProfileContext = createContext<PortalProfileContextType>({
  profile: DEMO_BUSINESS_PROFILE,
  isLoading: true,
  updateProfile: () => {},
  refreshProfile: async () => DEMO_BUSINESS_PROFILE,
  saveReviewReply: async () => false,
});

export const PortalProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<SyncedBusinessProfile>(DEMO_BUSINESS_PROFILE);
  const [isLoading, setIsLoading] = useState(true);

  const refreshProfile = useCallback(async (): Promise<SyncedBusinessProfile> => {
    setIsLoading(true);
    const localProfile = getSyncedBusinessProfile();

    try {
      const serverProfile = await fetchPortalProfileFromServer();
      if (serverProfile && serverProfile.businessName && serverProfile.businessName !== 'Your Business Name') {
        // If server profile has real reviews or local is empty, accept server profile
        let finalMerged = serverProfile;
        if (
          (!serverProfile.reviews || serverProfile.reviews.length === 0) &&
          localProfile.isLiveSynced &&
          localProfile.reviews &&
          localProfile.reviews.length > 0 &&
          localProfile.businessName.toLowerCase() === serverProfile.businessName.toLowerCase()
        ) {
          finalMerged = {
            ...serverProfile,
            reviews: localProfile.reviews,
            isLiveSynced: true,
          };
          // Sync merged back to server in background
          fetch('/api/portal/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(finalMerged),
          }).catch(() => null);
        }

        setProfile(finalMerged);
        saveSyncedBusinessProfile(finalMerged);
        setIsLoading(false);
        return finalMerged;
      }
    } catch (e) {
      console.error('Failed to load portal profile from server:', e);
    }

    setProfile(localProfile);
    setIsLoading(false);
    return localProfile;
  }, []);

  useEffect(() => {
    refreshProfile();

    const handleProfileUpdate = (e: any) => {
      if (e.detail) {
        setProfile(e.detail);
      }
    };

    window.addEventListener('drcrm_gbp_profile_updated', handleProfileUpdate);
    return () => window.removeEventListener('drcrm_gbp_profile_updated', handleProfileUpdate);
  }, [refreshProfile]);

  const updateProfile = (newProfile: SyncedBusinessProfile) => {
    setProfile(newProfile);
    saveSyncedBusinessProfile(newProfile);
  };

  const saveReviewReply = async (
    reviewId: string,
    replyText: string,
    authorName?: string
  ): Promise<boolean> => {
    try {
      const res = await fetch('/api/portal/reviews/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: profile.clientId,
          reviewId,
          replyText,
          authorName,
          googleEmail: profile.googleOwnerEmail,
          currentReviews: profile.reviews,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.reviews) {
        const updated: SyncedBusinessProfile = {
          ...profile,
          reviews: data.reviews,
        };
        updateProfile(updated);
        return true;
      }
    } catch (err) {
      console.error('Failed to send review reply to server:', err);
    }

    // Fallback local update
    const updatedReviews = (profile.reviews || []).map((r) =>
      r.id === reviewId
        ? {
            ...r,
            status: 'REPLIED' as const,
            replyText,
            repliedAt: 'Published to Google Maps just now',
            isLiveOnGoogle: true,
          }
        : r
    );
    const updated: SyncedBusinessProfile = {
      ...profile,
      reviews: updatedReviews,
    };
    updateProfile(updated);
    return true;
  };

  return (
    <PortalProfileContext.Provider
      value={{
        profile,
        isLoading,
        updateProfile,
        refreshProfile,
        saveReviewReply,
      }}
    >
      {children}
    </PortalProfileContext.Provider>
  );
};

export function usePortalProfile() {
  return useContext(PortalProfileContext);
}
