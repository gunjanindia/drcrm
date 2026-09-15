'use client';

import React, { useState } from 'react';
import {
  Star,
  Sparkles,
  MessageCircle,
  Copy,
  Check,
  Send,
  ThumbsUp,
  AlertCircle,
  MessageSquare,
  Zap,
  Filter,
  ShieldCheck,
  Globe,
  KeyRound,
  RefreshCw,
  Building2,
  Lock,
} from 'lucide-react';
import { ClientReviewItem, DEFAULT_CLIENT_REVIEWS, GoogleGbpAuthProfile, DEFAULT_GBP_AUTH } from '@/lib/client-360-data';
import { aiAssistantEngine } from '@/lib/ai-engine';
import { Button, Badge, Modal } from '@/components/ui';
import {
  GbpAccountLocationSelectorModal,
  GbpDiscoveredLocation,
} from './GbpAccountLocationSelectorModal';
import { saveSyncedBusinessProfile } from '@/lib/client-portal-sync';

export interface ReviewManagementWidgetProps {
  businessName?: string;
  reviews?: ClientReviewItem[];
  currentPoints?: number;
  gbpAuth?: GoogleGbpAuthProfile;
  googleMapsUrl?: string;
  placeId?: string;
  city?: string;
  onDeductPoints?: (pts: number) => boolean;
  onOpenRechargeModal?: () => void;
  onConnectGbp?: () => void;
  onSaveReply?: (reviewId: string, replyText: string, authorName?: string) => Promise<boolean>;
  onProfileSynced?: (updatedData: any) => void;
}

export const ReviewManagementWidget: React.FC<ReviewManagementWidgetProps> = ({
  businessName = 'Life in Lights Academy',
  reviews: initialReviews,
  currentPoints = 50,
  gbpAuth = DEFAULT_GBP_AUTH,
  googleMapsUrl,
  placeId,
  city = '',
  onDeductPoints,
  onOpenRechargeModal,
  onConnectGbp,
  onSaveReply,
  onProfileSynced,
}) => {
  const [reviewsList, setReviewsList] = useState<ClientReviewItem[]>(
    initialReviews || DEFAULT_CLIENT_REVIEWS
  );
  const [activeTone, setActiveTone] = useState<'WARM' | 'PROFESSIONAL' | 'HINGLISH' | 'RESOLUTION'>('WARM');
  const [draftResponses, setDraftResponses] = useState<Record<string, string>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'PENDING' | 'REPLIED' | 'ALL'>('PENDING');
  const [filterRating, setFilterRating] = useState<number | 'all'>('all');
  const [postingToGoogleId, setPostingToGoogleId] = useState<string | null>(null);
  const [isRefreshingReviews, setIsRefreshingReviews] = useState(false);
  const [successInfo, setSuccessInfo] = useState<{ message: string; mapsUrl?: string; authorName?: string } | null>(null);

  // GBP Auth Required Prompt & Multi-Location Selection State
  const [currentAuth, setCurrentAuth] = useState<GoogleGbpAuthProfile>(gbpAuth || DEFAULT_GBP_AUTH);
  const [isAuthPromptModalOpen, setIsAuthPromptModalOpen] = useState(false);
  const [pendingReplyRev, setPendingReplyRev] = useState<ClientReviewItem | null>(null);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [discoveredLocations, setDiscoveredLocations] = useState<GbpDiscoveredLocation[]>([]);
  const [authGoogleEmail, setAuthGoogleEmail] = useState(gbpAuth?.googleEmail || '');
  const [authAccessToken, setAuthAccessToken] = useState('');

  React.useEffect(() => {
    if (gbpAuth) {
      setCurrentAuth(gbpAuth);
      if (gbpAuth.googleEmail) setAuthGoogleEmail(gbpAuth.googleEmail);
    }
  }, [gbpAuth]);

  React.useEffect(() => {
    if (initialReviews !== undefined) {
      setReviewsList(initialReviews);
    }
  }, [initialReviews]);

  // Listen for Google OAuth postMessage and fetch all linked GBP locations
  React.useEffect(() => {
    const handleAuthMessage = async (event: MessageEvent) => {
      if (event.data?.type === 'GOOGLE_GBP_AUTH_SUCCESS') {
        const payload = event.data.data;
        const email = payload.googleEmail || authGoogleEmail || 'verified.owner@gmail.com';
        const token = payload.accessToken || '';
        setAuthGoogleEmail(email);
        setAuthAccessToken(token);

        setCurrentAuth({
          isConnected: true,
          googleEmail: email,
          accountName: payload.accountName || `${businessName} (Verified Owner)`,
          locationId: payload.locationId || 'locations/verified',
          locationName: `${businessName} Google Maps Listing`,
          connectedAt: new Date().toLocaleDateString(),
          scopesGranted: [
            'https://www.googleapis.com/auth/business.manage',
            'openid',
            'email',
            'profile',
          ],
          reviewsSyncActive: true,
          canPostReplies: true,
        });

        // Fetch all GBP accounts and locations linked to this Google account
        try {
          const res = await fetch(
            `/api/auth/google/gbp/locations?businessName=${encodeURIComponent(businessName)}&city=${encodeURIComponent(city || 'Dhanbad')}&email=${encodeURIComponent(email)}&accessToken=${encodeURIComponent(token)}`
          );
          const data = await res.json();
          if (data.locations && data.locations.length > 0) {
            setDiscoveredLocations(data.locations);
            setIsLocationModalOpen(true);
          }
        } catch (err) {
          console.error('Failed to discover GBP locations:', err);
        }
      }
    };

    window.addEventListener('message', handleAuthMessage);
    return () => window.removeEventListener('message', handleAuthMessage);
  }, [businessName, city, authGoogleEmail]);

  const getTargetMapsUrl = () => {
    if (googleMapsUrl && googleMapsUrl.startsWith('http')) return googleMapsUrl;
    if (placeId && !placeId.startsWith('loc_')) return `https://search.google.com/local/writereview?placeid=${placeId}`;
    const targetName = businessName && businessName !== 'Your Business Profile' && businessName !== 'Business Profile'
      ? businessName
      : 'Business Profile';
    const citySuffix = city ? ` ${city}` : '';
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${targetName}${citySuffix}`)}`;
  };

  const handleGenerateReply = (rev: ClientReviewItem) => {
    if (!currentAuth?.isConnected) {
      setPendingReplyRev(rev);
      setIsAuthPromptModalOpen(true);
      return;
    }

    if (onDeductPoints) {
      const ok = onDeductPoints(1);
      if (!ok) {
        if (onOpenRechargeModal) onOpenRechargeModal();
        return;
      }
    }

    setIsGenerating(rev.id);
    setTimeout(() => {
      const generated = aiAssistantEngine.generateReviewResponse(
        rev.content,
        rev.authorName,
        rev.rating,
        businessName,
        activeTone
      );
      setDraftResponses((prev) => ({ ...prev, [rev.id]: generated }));
      setIsGenerating(null);
    }, 600);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handlePostToGoogleMaps = async (id: string) => {
    const targetRev = reviewsList.find((r) => r.id === id);
    const draft = draftResponses[id] || targetRev?.replyText || '';

    if (!draft) {
      alert('Please enter or generate a reply before publishing.');
      return;
    }

    if (!currentAuth?.isConnected) {
      setPendingReplyRev(targetRev || null);
      setIsAuthPromptModalOpen(true);
      return;
    }

    setPostingToGoogleId(id);

    try {
      let replyResult: any = null;
      if (onSaveReply) {
        await onSaveReply(id, draft, targetRev?.authorName);
      } else {
        const res = await fetch('/api/portal/reviews/reply', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            reviewId: id,
            replyText: draft,
            authorName: targetRev?.authorName,
            currentReviews: reviewsList,
            googleEmail: authGoogleEmail || currentAuth?.googleEmail,
            accessToken: authAccessToken,
            locationId: currentAuth?.locationId,
          }),
        });
        replyResult = await res.json();
      }

      // Auto copy to clipboard for convenience
      try {
        await navigator.clipboard.writeText(draft);
      } catch {}

      setReviewsList((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                status: 'REPLIED',
                replyText: draft,
                repliedAt: 'Published just now',
                isLiveOnGoogle: true,
                source: 'Verified GBP Sync',
              }
            : r
        )
      );

      // Clear draft response after successful publish
      setDraftResponses((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });

      const destinationUrl = getTargetMapsUrl();

      if (replyResult?.googleApiDispatched) {
        setSuccessInfo({
          message: `Official owner response was dispatched live to Google Maps via Google My Business API for ${targetRev?.authorName || 'customer'}!`,
          mapsUrl: destinationUrl,
          authorName: targetRev?.authorName || 'Customer',
        });
      } else {
        setSuccessInfo({
          message: `Official response saved to CRM and copied to clipboard. ${replyResult?.googleApiError ? `(Google GBP API: ${replyResult.googleApiError})` : ''} Use the direct link below to verify on your Google Business Profile listing.`,
          mapsUrl: destinationUrl,
          authorName: targetRev?.authorName || 'Customer',
        });
      }
    } catch (err: any) {
      console.error('Failed to post reply to Google Maps:', err);
      alert('Failed to publish reply. Please check your connection and try again.');
    } finally {
      setPostingToGoogleId(null);
    }
  };

  const handleLaunchOAuth = async () => {
    try {
      const redirectUri = `${window.location.origin}/api/auth/google/gbp/callback`;
      const businessNameParam = encodeURIComponent(businessName);
      const emailParam = encodeURIComponent(gbpAuth?.googleEmail || '');
      const res = await fetch(
        `/api/auth/google/gbp?redirect_uri=${encodeURIComponent(redirectUri)}&businessName=${businessNameParam}&email=${emailParam}`
      );
      const data = await res.json();

      const popup = window.open(
        data.authUrl || `/api/auth/google/gbp/callback?mode=consent&businessName=${businessNameParam}&email=${emailParam}`,
        'GoogleGBPAuth',
        'width=550,height=650,left=300,top=100'
      );

      if (!popup || popup.closed || typeof popup.closed === 'undefined') {
        window.location.href = data.authUrl || `/api/auth/google/gbp/callback?mode=consent&businessName=${businessNameParam}`;
      }
    } catch {
      window.location.href = `/api/auth/google/gbp/callback?mode=consent&businessName=${encodeURIComponent(businessName)}`;
    }
  };

  const handleLocationSelected = async (selected: GbpDiscoveredLocation) => {
    try {
      setCurrentAuth({
        isConnected: true,
        googleEmail: authGoogleEmail || gbpAuth?.googleEmail || 'verified.owner@gmail.com',
        accountName: selected.accountName || `${selected.locationName} (Verified Owner)`,
        locationId: selected.id,
        locationName: selected.locationName,
        connectedAt: new Date().toLocaleDateString(),
        scopesGranted: [
          'https://www.googleapis.com/auth/business.manage',
          'openid',
          'email',
          'profile',
        ],
        reviewsSyncActive: true,
        canPostReplies: true,
      });

      const res = await fetch('/api/portal/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: selected.locationName,
          category: selected.primaryCategory,
          city: city,
          address: selected.formattedAddress,
          googleMapsUrl: selected.googleMapsUrl,
          placeId: selected.placeId || selected.id.replace('locations/', ''),
          rating: selected.rating,
          averageRating: selected.rating,
          reviewCount: selected.reviewCount,
          photosCount: selected.photosCount,
          googleOwnerEmail: authGoogleEmail || gbpAuth?.googleEmail,
          googleAccountName: selected.accountName || `${selected.locationName} (Verified Owner)`,
          reviews: selected.reviews && selected.reviews.length > 0 ? selected.reviews : undefined,
        }),
      });

      const data = await res.json();
      if (data.data?.reviews && data.data.reviews.length > 0) {
        setReviewsList(data.data.reviews);
      } else if (selected.reviews && selected.reviews.length > 0) {
        setReviewsList(selected.reviews);
      }

      setSuccessInfo({
        message: `✓ Connected & Synced Google Business Profile: "${selected.locationName}" (${selected.rating}★ across ${selected.reviewCount} reviews)!`,
        mapsUrl: selected.googleMapsUrl,
      });

      if (onProfileSynced) {
        onProfileSynced(data.data);
      }
    } catch (err) {
      console.error('Failed to sync chosen GBP location:', err);
    }
  };

  const handleRefreshLiveReviews = async () => {
    setIsRefreshingReviews(true);
    try {
      const email = gbpAuth?.googleEmail || authGoogleEmail || '';
      const res = await fetch(
        `/api/auth/google/gbp/locations?businessName=${encodeURIComponent(businessName)}&city=${encodeURIComponent(city || 'Dhanbad')}&email=${encodeURIComponent(email)}&accessToken=${encodeURIComponent(authAccessToken)}`
      );
      const data = await res.json();
      if (data.matchedLocation?.reviews && data.matchedLocation.reviews.length > 0) {
        setReviewsList(data.matchedLocation.reviews);
        // Persist to Neon PostgreSQL & globalStore
        await fetch('/api/portal/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            businessName: data.matchedLocation.locationName,
            rating: data.matchedLocation.rating,
            reviewCount: data.matchedLocation.reviewCount,
            googleMapsUrl: data.matchedLocation.googleMapsUrl,
            reviews: data.matchedLocation.reviews,
            googleOwnerEmail: email,
          }),
        });
        setSuccessInfo({
          message: `✓ Refreshed ${data.matchedLocation.reviews.length} latest live customer reviews from Google Maps listing!`,
          mapsUrl: data.matchedLocation.googleMapsUrl,
        });
      } else {
        alert('Customer reviews are already up to date with Google Maps.');
      }
    } catch (e) {
      console.error('Failed to refresh reviews:', e);
    } finally {
      setIsRefreshingReviews(false);
    }
  };

  const handleOpenGoogleMapsListing = (replyToCopy?: string) => {
    if (replyToCopy) {
      try {
        navigator.clipboard.writeText(replyToCopy);
      } catch {}
    }
    const destination = getTargetMapsUrl();
    window.open(destination, '_blank', 'noopener,noreferrer');
  };

  const pendingCount = reviewsList.filter((r) => r.status === 'PENDING').length;
  const repliedCount = reviewsList.filter((r) => r.status === 'REPLIED').length;

  const filtered = reviewsList
    .filter((r) => {
      if (statusFilter === 'PENDING') return r.status === 'PENDING';
      if (statusFilter === 'REPLIED') return r.status === 'REPLIED';
      return true;
    })
    .filter((r) => (filterRating === 'all' ? true : r.rating === filterRating));

  return (
    <div className="space-y-6">
      {/* Success & Direct Google Action Notification */}
      {successInfo && (
        <div className="p-4 rounded-3xl bg-gradient-to-r from-emerald-900 via-slate-900 to-teal-950 border border-emerald-500/40 text-white text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xl animate-in fade-in">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
              <Check className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <span className="font-bold block text-sm text-emerald-300">
                ✓ Official Response Saved & Ready for Google Maps
              </span>
              <p className="text-[11px] text-slate-300 max-w-xl">
                {successInfo.message}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0 self-end sm:self-center">
            {successInfo.mapsUrl && (
              <Button
                variant="success"
                size="sm"
                icon={Globe}
                onClick={() => handleOpenGoogleMapsListing()}
              >
                Open Google Maps Listing
              </Button>
            )}
            <a
              href="https://business.google.com/reviews"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                variant="outline"
                size="sm"
                icon={Building2}
                className="bg-white/10 text-white hover:bg-white/20 border-white/20 text-xs"
              >
                Google Business Reviews ↗
              </Button>
            </a>
            <button
              onClick={() => setSuccessInfo(null)}
              className="text-white/70 hover:text-white text-xs px-2 py-1.5 rounded-lg hover:bg-white/10"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* GBP Auth Live Status Alert Bar */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border border-blue-500/30 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-white">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center shrink-0">
            <Globe className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold block">
              {currentAuth?.isConnected
                ? `Google Business Profile Connected (${currentAuth.googleEmail})`
                : 'Google Business Profile Not Connected'}
            </span>
            <span className="text-[11px] text-slate-300">
              {currentAuth?.isConnected
                ? 'OAuth authorization active. Official owner responses publish directly to Google Maps customer reviews.'
                : 'Log in with the Google Account that verified your business to publish official replies directly.'}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {discoveredLocations.length > 0 && (
            <Button
              variant="secondary"
              size="sm"
              icon={Building2}
              onClick={() => setIsLocationModalOpen(true)}
            >
              Select Location ({discoveredLocations.length})
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            icon={Globe}
            onClick={() => handleOpenGoogleMapsListing()}
          >
            Open Maps Listing
          </Button>
          {!currentAuth?.isConnected ? (
            <Button
              variant="primary"
              size="sm"
              icon={KeyRound}
              onClick={() => (onConnectGbp ? onConnectGbp() : handleLaunchOAuth())}
            >
              Authorize Owner Account
            </Button>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              icon={KeyRound}
              onClick={() => (onConnectGbp ? onConnectGbp() : handleLaunchOAuth())}
            >
              Re-Authorize
            </Button>
          )}
        </div>
      </div>

      {/* Header & Stats Banner */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-indigo-600" />
              Customer Reviews & AI Smart Responder
            </h3>
            {pendingCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-600 border border-amber-500/30">
                {pendingCount} Awaiting Reply
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500">
            Generate customized, professional owner replies in seconds. Replies are tracked in your CRM and can be published straight to Google Maps.
          </p>
        </div>

        {/* Tone Selector & Refresh Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            isLoading={isRefreshingReviews}
            disabled={isRefreshingReviews}
            onClick={handleRefreshLiveReviews}
            className="text-xs"
          >
            {isRefreshingReviews ? 'Fetching from Google Maps...' : 'Sync Live Google Reviews'}
          </Button>

          <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400">Response Tone:</span>
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setActiveTone('WARM')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  activeTone === 'WARM'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-xs'
                    : 'text-slate-500'
                }`}
              >
                Warm
              </button>
              <button
                onClick={() => setActiveTone('PROFESSIONAL')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  activeTone === 'PROFESSIONAL'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-xs'
                    : 'text-slate-500'
                }`}
              >
                Professional
              </button>
              <button
                onClick={() => setActiveTone('HINGLISH')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  activeTone === 'HINGLISH'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-xs'
                    : 'text-slate-500'
                }`}
              >
                Hinglish
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Tab Navigation (Needs Reply vs Replied vs All) */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setStatusFilter('PENDING')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              statusFilter === 'PENDING'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>⚡ Needs Reply</span>
            {pendingCount > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                statusFilter === 'PENDING' ? 'bg-slate-950 text-amber-300' : 'bg-amber-500/20 text-amber-600'
              }`}>
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setStatusFilter('REPLIED')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              statusFilter === 'REPLIED'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>✓ Replied</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
              statusFilter === 'REPLIED' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
            }`}>
              {repliedCount}
            </span>
          </button>

          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              statusFilter === 'ALL'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>All Reviews ({reviewsList.length})</span>
          </button>
        </div>

        <div className="text-[11px] text-slate-500 font-medium px-2">
          {statusFilter === 'PENDING' && pendingCount > 0 && (
            <span className="text-amber-600 dark:text-amber-400 font-semibold">
              ⚡ Replying to these {pendingCount} reviews directly boosts your Google ranking
            </span>
          )}
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filtered.map((rev) => {
          const draft = draftResponses[rev.id];
          const hasReplied = rev.status === 'REPLIED';

          return (
            <div
              key={rev.id}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-sm">
                    {rev.authorName.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900 dark:text-white">
                        {rev.authorName}
                      </span>
                      <span className="text-[10px] text-slate-400">via {rev.source}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < rev.rating
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-300 dark:text-slate-700'
                          }`}
                        />
                      ))}
                      <span className="text-[10px] text-slate-400 ml-1 font-medium">{rev.date}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {hasReplied && (
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 flex items-center gap-1">
                      <Globe className="w-2.5 h-2.5" />
                      Saved in CRM
                    </span>
                  )}
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase ${
                      hasReplied
                        ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                        : 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                    }`}
                  >
                    {hasReplied ? 'Replied' : 'Pending Response'}
                  </span>
                </div>
              </div>

              {/* Review Text */}
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic bg-slate-50 dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800">
                "{rev.content}"
              </p>

              {/* Existing Reply if any */}
              {hasReplied && !draft && rev.replyText && (
                <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 text-xs space-y-3">
                  <div className="flex justify-between items-center text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Official Business Response (Published to Google Maps):
                    </span>
                    <span>{rev.repliedAt}</span>
                  </div>
                  <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-normal">{rev.replyText}</p>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-indigo-100 dark:border-indigo-900/50">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenGoogleMapsListing()}
                        className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800"
                      >
                        <Globe className="w-3 h-3" />
                        <span>View Live on Google Maps ↗</span>
                      </button>

                      <button
                        onClick={() => handleCopy(rev.id, rev.replyText!)}
                        className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                      >
                        {copiedId === rev.id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedId === rev.id ? 'Copied!' : 'Copy Reply'}</span>
                      </button>
                    </div>

                    <button
                      onClick={() => setDraftResponses((prev) => ({ ...prev, [rev.id]: rev.replyText! }))}
                      className="text-[11px] text-slate-500 hover:text-indigo-600 underline"
                    >
                      Edit Response
                    </button>
                  </div>
                </div>
              )}

              {/* AI Draft Box */}
              {draft && (
                <div className="p-4 rounded-2xl bg-sky-50/60 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 dark:text-sky-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      AI Suggested Response ({activeTone.toLowerCase()}):
                    </span>
                    <span className="text-[10px] text-slate-400">1 AI Credit used</span>
                  </div>

                  <textarea
                    value={draft}
                    onChange={(e) =>
                      setDraftResponses((prev) => ({ ...prev, [rev.id]: e.target.value }))
                    }
                    rows={3}
                    className="w-full text-xs p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-indigo-500"
                  />

                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={copiedId === rev.id ? Check : Copy}
                      onClick={() => handleCopy(rev.id, draft)}
                    >
                      {copiedId === rev.id ? 'Copied!' : 'Copy to Clipboard'}
                    </Button>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        icon={Send}
                        isLoading={postingToGoogleId === rev.id}
                        onClick={() => handlePostToGoogleMaps(rev.id)}
                      >
                        Publish Official Reply to Google Maps
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {!draft && (
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-1.5">
                    {!currentAuth?.isConnected ? (
                      <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                        <Lock className="w-3.5 h-3.5 shrink-0" />
                        Connect Google Business Profile to unlock direct replies
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400">
                        {hasReplied ? 'Want to change or improve response?' : 'Draft official reply with 1 click:'}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {!currentAuth?.isConnected ? (
                      <Button
                        variant="amber"
                        size="sm"
                        icon={KeyRound}
                        onClick={() => {
                          setPendingReplyRev(rev);
                          setIsAuthPromptModalOpen(true);
                        }}
                      >
                        Connect GBP to Reply
                      </Button>
                    ) : (
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={Sparkles}
                        isLoading={isGenerating === rev.id}
                        onClick={() => handleGenerateReply(rev)}
                      >
                        Generate AI Reply (1 Credit)
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 text-center space-y-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto ${
              statusFilter === 'PENDING' && reviewsList.length > 0
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
            }`}>
              {statusFilter === 'PENDING' && reviewsList.length > 0 ? (
                <Check className="w-6 h-6" />
              ) : (
                <MessageSquare className="w-6 h-6" />
              )}
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              {statusFilter === 'PENDING' && reviewsList.length > 0
                ? '🎉 All Caught Up! 100% of Reviews Answered'
                : 'No Google Reviews Found'}
            </h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {statusFilter === 'PENDING' && reviewsList.length > 0
                ? `Every customer review for ${businessName} has been answered. Replying to reviews within 24 hours keeps your local ranking in Google Maps strong!`
                : `No customer reviews are currently found matching this filter for ${businessName}. Sync live reviews or connect your Google Business Profile.`}
            </p>
            <div className="pt-2 flex justify-center gap-3">
              {statusFilter === 'PENDING' && reviewsList.length > 0 ? (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setStatusFilter('REPLIED')}
                >
                  View Replied Reviews ({repliedCount})
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  icon={RefreshCw}
                  isLoading={isRefreshingReviews}
                  onClick={handleRefreshLiveReviews}
                >
                  Sync Live Reviews
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Google Business Profile Multi-Location Selector Modal */}
      <GbpAccountLocationSelectorModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        googleEmail={authGoogleEmail || gbpAuth?.googleEmail || ''}
        clientBusinessName={businessName}
        discoveredLocations={discoveredLocations}
        accessToken={authAccessToken}
        onSelectLocation={handleLocationSelected}
      />

      {/* Connect Google Business Profile Before Replying Modal */}
      <Modal
        isOpen={isAuthPromptModalOpen}
        onClose={() => setIsAuthPromptModalOpen(false)}
        title="Connect Google Business Profile Before Replying"
        maxWidth="md"
      >
        <div className="space-y-5">
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-indigo-500/10 to-sky-500/15 border border-amber-500/30 text-xs space-y-2">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 font-bold text-sm">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              Verified Owner Authorization Required
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
              Google Maps requires the official owner account to be authenticated so replies are verified and published directly with the <strong>Official Business Response</strong> badge.
            </p>
          </div>

          <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                1
              </div>
              <div>
                <strong className="block text-slate-900 dark:text-white">Authenticate with Google</strong>
                <span className="text-[11px] text-slate-500">Sign in with the Google account linked to <strong>{businessName}</strong>.</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                2
              </div>
              <div>
                <strong className="block text-slate-900 dark:text-white">Auto-Discover & Match Location</strong>
                <span className="text-[11px] text-slate-500">Finds and links the Google Maps listing for this client profile.</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                3
              </div>
              <div>
                <strong className="block text-slate-900 dark:text-white">Publish Verified Map Replies</strong>
                <span className="text-[11px] text-slate-500">Generate AI responses and publish live to Google Maps in 1-click.</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAuthPromptModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={KeyRound}
              onClick={() => {
                setIsAuthPromptModalOpen(false);
                if (onConnectGbp) {
                  onConnectGbp();
                } else {
                  handleLaunchOAuth();
                }
              }}
            >
              Authorize Owner Account
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
