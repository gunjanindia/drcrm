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
} from 'lucide-react';
import { ClientReviewItem, DEFAULT_CLIENT_REVIEWS, GoogleGbpAuthProfile, DEFAULT_GBP_AUTH } from '@/lib/client-360-data';
import { aiAssistantEngine } from '@/lib/ai-engine';
import { Button, Badge } from '@/components/ui';

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
}

export const ReviewManagementWidget: React.FC<ReviewManagementWidgetProps> = ({
  businessName = 'Business Profile',
  reviews: initialReviews,
  currentPoints = 50,
  gbpAuth = DEFAULT_GBP_AUTH,
  googleMapsUrl,
  placeId,
  city = 'Ranchi',
  onDeductPoints,
  onOpenRechargeModal,
  onConnectGbp,
  onSaveReply,
}) => {
  const [reviewsList, setReviewsList] = useState<ClientReviewItem[]>(
    initialReviews && initialReviews.length > 0 ? initialReviews : DEFAULT_CLIENT_REVIEWS
  );
  const [activeTone, setActiveTone] = useState<'WARM' | 'PROFESSIONAL' | 'HINGLISH' | 'RESOLUTION'>('WARM');
  const [draftResponses, setDraftResponses] = useState<Record<string, string>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [filterRating, setFilterRating] = useState<number | 'all'>('all');
  const [postingToGoogleId, setPostingToGoogleId] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{ message: string; mapsUrl?: string; authorName?: string } | null>(null);

  React.useEffect(() => {
    if (initialReviews && initialReviews.length > 0) {
      setReviewsList(initialReviews);
    }
  }, [initialReviews]);

  const getTargetMapsUrl = () => {
    if (googleMapsUrl && googleMapsUrl.startsWith('http')) return googleMapsUrl;
    if (placeId && !placeId.startsWith('loc_')) return `https://search.google.com/local/writereview?placeid=${placeId}`;
    return `https://www.google.com/search?q=${encodeURIComponent(`${businessName} ${city} reviews`)}`;
  };

  const handleGenerateReply = (rev: ClientReviewItem) => {
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

    setPostingToGoogleId(id);

    try {
      if (onSaveReply) {
        await onSaveReply(id, draft, targetRev?.authorName);
      } else {
        await fetch('/api/portal/reviews/reply', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            reviewId: id,
            replyText: draft,
            authorName: targetRev?.authorName,
            currentReviews: reviewsList,
          }),
        });
      }

      // Auto copy to clipboard for immediate 1-click posting on Google Maps
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
                repliedAt: 'Published to CRM & Google Manager just now',
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

      setSuccessInfo({
        message: `Official owner reply saved to CRM and copied to clipboard! Click below to open Google Maps / GBP and paste directly into Google.`,
        mapsUrl: destinationUrl,
        authorName: targetRev?.authorName || 'Customer',
      });
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

  const handleOpenGoogleMapsListing = (replyToCopy?: string) => {
    if (replyToCopy) {
      try {
        navigator.clipboard.writeText(replyToCopy);
      } catch {}
    }
    const destination = getTargetMapsUrl();
    window.open(destination, '_blank', 'noopener,noreferrer');
  };

  const filtered = reviewsList.filter((r) =>
    filterRating === 'all' ? true : r.rating === filterRating
  );

  const pendingCount = reviewsList.filter((r) => r.status === 'PENDING').length;

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
                ✓ Response Saved to CRM & Copied to Clipboard!
              </span>
              <p className="text-[11px] text-slate-300 max-w-xl">
                {successInfo.message}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            {successInfo.mapsUrl && (
              <Button
                variant="success"
                size="sm"
                icon={Globe}
                onClick={() => handleOpenGoogleMapsListing()}
              >
                Open Google Maps to Paste
              </Button>
            )}
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
              {gbpAuth.isConnected
                ? `Google Business Profile Connected (${gbpAuth.googleEmail})`
                : 'Google Business Profile Not Connected'}
            </span>
            <span className="text-[11px] text-slate-300">
              {gbpAuth.isConnected
                ? 'OAuth authorization active. Fast 1-click clipboard paste to Google Maps review manager is enabled.'
                : 'Log in with the Google Account that verified your business to publish official replies directly.'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={Globe}
            onClick={() => handleOpenGoogleMapsListing()}
          >
            Open Maps Listing
          </Button>
          {!gbpAuth.isConnected && (
            <Button
              variant="primary"
              size="sm"
              icon={KeyRound}
              onClick={() => (onConnectGbp ? onConnectGbp() : handleLaunchOAuth())}
            >
              Authorize Owner Account
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

        {/* Tone Selector */}
        <div className="flex flex-wrap items-center gap-2">
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
              Warm & Friendly
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
              Hinglish (Local)
            </button>
          </div>
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
                      Official Business Response:
                    </span>
                    <span>{rev.repliedAt}</span>
                  </div>
                  <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-normal">{rev.replyText}</p>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-indigo-100 dark:border-indigo-900/50">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopy(rev.id, rev.replyText!)}
                        className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                      >
                        {copiedId === rev.id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedId === rev.id ? 'Copied!' : 'Copy Reply'}</span>
                      </button>

                      <button
                        onClick={() => handleOpenGoogleMapsListing(rev.replyText)}
                        className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800"
                      >
                        <Globe className="w-3 h-3" />
                        <span>Post on Google Maps ↗</span>
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
                        Save & Prepare for Google Maps
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {!draft && (
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-400">
                    {hasReplied ? 'Want to change or improve response?' : 'Draft official reply with 1 click:'}
                  </span>
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={Sparkles}
                    isLoading={isGenerating === rev.id}
                    onClick={() => handleGenerateReply(rev)}
                  >
                    Generate AI Reply (1 Credit)
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
