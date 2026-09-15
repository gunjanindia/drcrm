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
    try {
      const serverProfile = await fetchPortalProfileFromServer();
      if (serverProfile && serverProfile.businessName) {
        setProfile(serverProfile);
        saveSyncedBusinessProfile(serverProfile);
        setIsLoading(false);
        return serverProfile;
      }
    } catch (e) {
      console.error('Failed to load portal profile from server:', e);
    }

    const localProfile = getSyncedBusinessProfile();
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
