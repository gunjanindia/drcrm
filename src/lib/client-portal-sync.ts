// CLIENT PORTAL LIVE GBP DATA SYNC MANAGER

export interface SyncedBusinessProfile {
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
  syncedAt?: string;
  isOperational?: boolean;
}

export const DEMO_BUSINESS_PROFILE: SyncedBusinessProfile = {
  isLiveSynced: false,
  businessName: 'Your Business Name (Demo Mode)',
  category: 'Local Business',
  city: 'Ranchi',
  address: 'Shop 14, Main Road, Lalpur, Ranchi, Jharkhand - 834001',
  phone: '+91 94311 09876',
  whatsapp: '919431109876',
  email: 'contact@yourbusiness.in',
  websiteUrl: 'https://digitalranchi.in/s/your-business',
  googleMapsUrl: 'https://maps.google.com/?q=Ranchi',
  placeId: 'loc_demo_placeholder',
  averageRating: 4.8,
  reviewCount: 24,
  photosCount: 15,
  gbpScore: 82,
  packageName: 'Growth Retainer Plan',
  monthlyRevenue: 2499,
  renewalDate: new Date(Date.now() + 20 * 86400000).toISOString(),
  googleOwnerEmail: '',
};

const STORAGE_KEY = 'drcrm_synced_gbp_profile_v1';

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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    window.dispatchEvent(new CustomEvent('drcrm_gbp_profile_updated', { detail: profile }));
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
