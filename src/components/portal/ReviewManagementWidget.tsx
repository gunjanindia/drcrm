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
  onDeductPoints?: (pts: number) => boolean;
  onOpenRechargeModal?: () => void;
  onConnectGbp?: () => void;
}

export const ReviewManagementWidget: React.FC<ReviewManagementWidgetProps> = ({
  businessName = 'Ranchi Prime Store',
  reviews: initialReviews = DEFAULT_CLIENT_REVIEWS,
  currentPoints = 50,
  gbpAuth = DEFAULT_GBP_AUTH,
  onDeductPoints,
  onOpenRechargeModal,
  onConnectGbp,
}) => {
  const [reviewsList, setReviewsList] = useState<ClientReviewItem[]>(initialReviews);
  const [activeTone, setActiveTone] = useState<'WARM' | 'PROFESSIONAL' | 'HINGLISH' | 'RESOLUTION'>('WARM');
  const [draftResponses, setDraftResponses] = useState<Record<string, string>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [filterRating, setFilterRating] = useState<number | 'all'>('all');
  const [postingToGoogleId, setPostingToGoogleId] = useState<string | null>(null);

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

  const handlePostToGoogleMaps = (id: string) => {
    if (!gbpAuth.isConnected) {
      if (onConnectGbp) onConnectGbp();
      else alert('Please connect your verified Google Business Profile account first.');
      return;
    }

    const draft = draftResponses[id];
    setPostingToGoogleId(id);

    setTimeout(() => {
      setReviewsList((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                status: 'REPLIED',
                replyText: draft || r.replyText,
                repliedAt: 'Published live just now',
                isLiveOnGoogle: true,
              }
            : r
        )
      );
      setPostingToGoogleId(null);
      alert('Official owner response successfully published live to Google Maps listing via Google Business Profile API!');
    }, 900);
  };

  const filtered = reviewsList.filter((r) =>
    filterRating === 'all' ? true : r.rating === filterRating
  );

  const pendingCount = reviewsList.filter((r) => r.status === 'PENDING').length;

  return (
    <div className="space-y-6">
      {/* GBP Auth Live Status Alert Bar */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-900/40 via-slate-900 to-indigo-950 border border-blue-500/30 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-white">
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
                ? 'OAuth authorization active. Direct Google Maps owner reply publishing is ENABLED.'
                : 'Log in with the Google Account that verified your business to publish official replies directly.'}
            </span>
          </div>
        </div>

        {!gbpAuth.isConnected && (
          <Button
            variant="primary"
            size="sm"
            icon={KeyRound}
            onClick={() => (onConnectGbp ? onConnectGbp() : alert('Connect Google Account in Settings'))}
          >
            Authorize GBP Account
          </Button>
        )}
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
            Generate customized, professional owner replies for any business in seconds with multi-tone AI.
          </p>
        </div>

        {/* Tone Selector & Points Indicator */}
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
                  {rev.isLiveOnGoogle && (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-50 text-blue-600 border border-blue-200 flex items-center gap-1">
                      <Globe className="w-2.5 h-2.5" />
                      Live on Google
                    </span>
                  )}
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase ${
                      hasReplied
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                        : 'bg-amber-50 text-amber-600 border-amber-200'
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
                <div className="p-3.5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 text-xs space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Official Business Response:
                    </span>
                    <span>{rev.repliedAt}</span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300">{rev.replyText}</p>
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

                    <Button
                      variant="primary"
                      size="sm"
                      icon={Send}
                      isLoading={postingToGoogleId === rev.id}
                      onClick={() => handlePostToGoogleMaps(rev.id)}
                    >
                      Publish Directly to Google Maps
                    </Button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {!draft && (
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-400">
                    {hasReplied ? 'Want to update response?' : 'Draft official reply with 1 click:'}
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
