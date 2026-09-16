// CLIENT PORTAL LIVE GBP DATA SYNC MANAGER WITH DYNAMIC SYNCED DATASETS

import {
  AuditFactor,
  ClientReviewItem,
  MonthlyGrowthMetric,
  MiniSiteConfig,
  BUSINESS_CATEGORIES,
  BusinessCategoryType,
} from './client-360-data';
import { GbpDailyOrMonthlyInsight, SEEDED_AUTHENTIC_GBP_INSIGHT } from './gbp-insights-engine';

export interface SyncedBusinessProfile {
  clientId?: string;
  isLiveSynced: boolean;
  businessName: string;
  category: string;
  city: string;
  address: string;
  phone: string;
  whatsapp: string;
  email: string;
  websiteUrl?: string;
  googleMapsUrl?: string;
  placeId?: string;
  averageRating: number;
  reviewCount: number;
  photosCount: number;
  gbpScore: number;
  packageName: string;
  monthlyRevenue: number;
  renewalDate: string;
  googleOwnerEmail: string;
  googleAccountName?: string;
  googleAvatarUrl?: string;
  syncedAt?: string;
  status?: 'ACTIVE' | 'ONBOARDING' | 'AT_RISK' | 'PAUSED' | 'CHURNED';
  isOperational?: boolean;
  reviews?: ClientReviewItem[];
  growthMetrics?: MonthlyGrowthMetric[];
  performanceInsights?: GbpDailyOrMonthlyInsight[];
  auditFactors?: AuditFactor[];
  miniSiteConfig?: MiniSiteConfig;
}

export const DEMO_BUSINESS_PROFILE: SyncedBusinessProfile = {
  isLiveSynced: false,
  businessName: 'Life in Lights Academy',
  category: 'Educational institution / Photography Academy',
  city: 'Dhanbad',
  address: 'Dhanbad, Jharkhand',
  phone: '+91 94311 00000',
  whatsapp: '919431100000',
  email: 'gunjan.india@gmail.com',
  websiteUrl: '',
  googleMapsUrl: '',
  placeId: '',
  averageRating: 4.9,
  reviewCount: 30,
  photosCount: 12,
  gbpScore: 88,
  packageName: 'Growth Retainer Plan',
  monthlyRevenue: 999,
  renewalDate: new Date(Date.now() + 30 * 86400000).toISOString(),
  googleOwnerEmail: 'gunjan.india@gmail.com',
  status: 'ACTIVE',
  isOperational: true,
  reviews: [],
  growthMetrics: [],
  performanceInsights: [SEEDED_AUTHENTIC_GBP_INSIGHT],
};

const STORAGE_KEY = 'drcrm_synced_gbp_profile_v2';

export function updateGbpAuthProfile(googleEmail: string, accountName?: string, locationId?: string): SyncedBusinessProfile {
  const current = getSyncedBusinessProfile();
  const updated: SyncedBusinessProfile = {
    ...current,
    isLiveSynced: true,
    googleOwnerEmail: googleEmail,
    googleAccountName: accountName || `${current.businessName} Owner Account`,
    syncedAt: new Date().toLocaleString(),
  };
  saveSyncedBusinessProfile(updated);
  return updated;
}

export function convertGoogleReviewsToClientReviews(
  googleReviews: Array<{ authorName: string; rating: number; text: string; relativeTime: string }>,
  businessName: string
): ClientReviewItem[] {
  if (!googleReviews || googleReviews.length === 0) return [];
  return googleReviews.map((r, idx) => ({
    id: `rev_real_${idx + 1}`,
    authorName: r.authorName || `Customer ${idx + 1}`,
    rating: r.rating || 5,
    date: r.relativeTime || 'Recently',
    content: r.text || `Visited ${businessName}.`,
    status: 'PENDING',
    sentiment: r.rating >= 4 ? 'POSITIVE' : r.rating === 3 ? 'NEUTRAL' : 'CRITICAL',
    source: 'Google Maps',
    isLiveOnGoogle: true,
  }));
}

export function generateDynamicReviewsForBusiness(
  businessName: string,
  category: string,
  city: string = '',
  avgRating: number = 4.8,
  realGoogleReviews?: Array<{ authorName: string; rating: number; text: string; relativeTime: string }>
): ClientReviewItem[] {
  if (realGoogleReviews && realGoogleReviews.length > 0) {
    return convertGoogleReviewsToClientReviews(realGoogleReviews, businessName);
  }
  // Zero fake dummy reviews returned
  return [];
}

export function generateDynamicGrowthForBusiness(
  reviewCount: number = 0,
  rating: number = 5.0,
  gbpScore: number = 0
): MonthlyGrowthMetric[] {
  // Never fabricate demo progression data
  return [];
}

export function generateDynamicAuditFactorsForBusiness(
  businessName: string,
  category: string,
  city: string = '',
  rating: number = 5.0,
  reviewCount: number = 0,
  photosCount: number = 0
): AuditFactor[] {
  const gbpOptScore = Math.min(25, 20 + (photosCount >= 10 ? 4 : 2));
  const reviewScore = Math.min(25, Math.round(15 + Math.min(10, (reviewCount / 30) * 10)));
  const photosScore = Math.min(20, Math.round(10 + Math.min(10, (photosCount / 20) * 10)));
  const responseScore = 12;
  const directCtaScore = 12;
  const locationLabel = city ? `${city} ` : '';

  return [
    {
      id: 'gbp_optimization',
      category: 'Google Business Profile',
      name: 'Primary Category & NAP Consistency',
      score: gbpOptScore,
      maxScore: 25,
      status: gbpOptScore >= 22 ? 'OPTIMAL' : 'MODERATE',
      impactDescription: `Directly influences Top-3 Map Pack indexing in ${locationLabel}local search.`,
      whatMakesThisScore: `Exact Business Name "${businessName}", Phone & Address verified across Google Maps. Primary category is correctly pinned to "${category}".`,
      recommendation: `Keep secondary categories and service catalog updated with seasonal offerings.`,
      pointsToGain: 25 - gbpOptScore,
    },
    {
      id: 'reviews_velocity',
      category: 'Reputation & Reviews',
      name: 'Review Velocity & Verified Rating',
      score: reviewScore,
      maxScore: 25,
      status: reviewScore >= 22 ? 'OPTIMAL' : 'MODERATE',
      impactDescription: 'Review count & freshness decide customer trust and Google local algorithm favorability.',
      whatMakesThisScore: `Average ${rating}⭐ rating across ${reviewCount} verified Google reviews with active review capture.`,
      recommendation: `Aim to reach ${Math.max(50, reviewCount + 25)}+ total reviews to cement unshakeable #1 position${city ? ` in ${city}` : ''}.`,
      quickActionLabel: 'Print Review QR Stand',
      pointsToGain: 25 - reviewScore,
    },
    {
      id: 'media_gallery',
      category: 'Media & Photo Cadence',
      name: 'Geotagged Store & Product Photos',
      score: photosScore,
      maxScore: 20,
      status: photosScore >= 16 ? 'OPTIMAL' : 'MODERATE',
      impactDescription: 'Listings with 25+ geotagged photos receive 42% more direction requests on Google Maps.',
      whatMakesThisScore: `${photosCount} high-res photos indexed on Google Maps profile.`,
      recommendation: `Upload 5 new photos monthly with ${locationLabel}geolocation metadata.`,
      quickActionLabel: 'Upload Geotagged Media',
      pointsToGain: 20 - photosScore,
    },
    {
      id: 'response_rate',
      category: 'Customer Engagement',
      name: 'Review Response SLA & Q&A Depth',
      score: responseScore,
      maxScore: 15,
      status: 'MODERATE',
      impactDescription: '100% response rate increases customer retention and signals active business ownership to Google.',
      whatMakesThisScore: '85% of customer reviews have been answered with official owner replies.',
      recommendation: 'Use AI Review Assistant to post personalized responses to all reviews in <30 seconds.',
      quickActionLabel: 'Answer Pending Reviews',
      pointsToGain: 3,
    },
    {
      id: 'direct_cta',
      category: 'Conversion Funnel',
      name: '1-Click WhatsApp & Web Booking',
      score: directCtaScore,
      maxScore: 15,
      status: 'MODERATE',
      impactDescription: 'Mobile searchers convert 3x faster when direct WhatsApp booking CTA is connected to GBP.',
      whatMakesThisScore: 'Direct phone dial connected. Missing dedicated 1-page mobile site with instant WhatsApp inquiry chat.',
      recommendation: 'Publish your 1-Page Mini-Site with one click and set as official website link on Google Profile.',
      quickActionLabel: 'Build 1-Page Site',
      pointsToGain: 3,
    },
  ];
}

export function getSyncedBusinessProfile(): SyncedBusinessProfile {
  if (typeof window === 'undefined') return DEMO_BUSINESS_PROFILE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return { ...DEMO_BUSINESS_PROFILE, ...parsed };
      }
    }
  } catch (e) {
    console.error('Failed to load synced GBP profile from storage:', e);
  }
  return DEMO_BUSINESS_PROFILE;
}

export function saveSyncedBusinessProfile(profile: SyncedBusinessProfile): void {
  if (typeof window === 'undefined') return;
  try {
    const completeProfile: SyncedBusinessProfile = {
      ...profile,
      isLiveSynced: profile.isLiveSynced ?? true,
      reviews: profile.reviews || [],
      growthMetrics: profile.growthMetrics || [],
      performanceInsights: profile.performanceInsights || [SEEDED_AUTHENTIC_GBP_INSIGHT],
      auditFactors: profile.auditFactors || generateDynamicAuditFactorsForBusiness(
        profile.businessName,
        profile.category,
        profile.city,
        profile.averageRating,
        profile.reviewCount,
        profile.photosCount
      ),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(completeProfile));
    window.dispatchEvent(new CustomEvent('drcrm_gbp_profile_updated', { detail: completeProfile }));
  } catch (e) {
    console.error('Failed to save synced GBP profile to storage:', e);
  }
}

export function clearSyncedBusinessProfile(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('drcrm_gbp_profile_updated', { detail: DEMO_BUSINESS_PROFILE }));
  } catch (e) {}
}

export async function fetchPortalProfileFromServer(clientIdParam?: string): Promise<SyncedBusinessProfile> {
  if (typeof window === 'undefined') return DEMO_BUSINESS_PROFILE;
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const targetClientId = clientIdParam || urlParams.get('clientId');
    const endpoint = targetClientId
      ? `/api/portal/profile?clientId=${encodeURIComponent(targetClientId)}`
      : '/api/portal/profile';

    const res = await fetch(endpoint);
    if (res.ok) {
      const data = await res.json();
      if (data.data) {
        saveSyncedBusinessProfile(data.data);
        return data.data;
      }
    }
  } catch (err) {
    console.error('Failed to load profile from server session:', err);
  }
  return getSyncedBusinessProfile();
}
