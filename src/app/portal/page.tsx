'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Star,
  Sparkles,
  TrendingUp,
  Activity,
  MessageSquare,
  Gift,
  QrCode,
  Globe,
  Coins,
  ArrowRight,
  PhoneCall,
  MapPin,
  CheckCircle2,
  Zap,
  AlertTriangle,
  ShieldAlert,
  Clock,
  RefreshCw,
  Building2,
  ExternalLink,
  MessageCircle,
} from 'lucide-react';
import { Button } from '@/components/ui';
import { formatINR, formatDate } from '@/lib/utils';
import { ReviewManagementWidget } from '@/components/portal/ReviewManagementWidget';
import { AIPointsWalletModal } from '@/components/portal/AIPointsWalletModal';
import { usePortalProfile } from '@/contexts/PortalProfileContext';

export default function ClientPortalDashboard() {
  const { profile: client, saveReviewReply, refreshProfile, updateProfile } = usePortalProfile();
  const [aiPoints, setAiPoints] = useState(65);
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleDeductPoints = (amount: number) => {
    if (aiPoints < amount) {
      setIsWalletOpen(true);
      return false;
    }
    setAiPoints((prev) => prev - amount);
    return true;
  };

  const handlePointsAdded = (added: number) => {
    setAiPoints((prev) => prev + added);
  };

  const handleQuickSync = async () => {
    setIsSyncing(true);
    try {
      await refreshProfile();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSyncing(false);
    }
  };

  const isPaused = client.status === 'PAUSED' || client.status === 'CHURNED';
  const reviews = client.reviews || [];
  const pendingReviews = reviews.filter((r) => r.status === 'PENDING');
  const answeredCount = reviews.filter((r) => r.status === 'REPLIED').length;
  const responseRate = reviews.length > 0 ? Math.round((answeredCount / reviews.length) * 100) : 100;
  const cityDisplay = client.city || 'Your Local Area';

  return (
    <div className="space-y-6 max-w-6xl pb-12">
      {/* Deactivated Notice Banner if Portal is Paused */}
      {isPaused && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-rose-900 via-slate-900 to-amber-950 text-white shadow-xl border border-rose-700/50 space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-3 rounded-2xl bg-rose-500/20 text-rose-300 border border-rose-500/30 shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-black text-rose-200">
                Client 360 Portal Suspended / Deactivated
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                Access to your live Google Business Profile sync and AI tools has been deactivated. Please reach out to your Account Manager to reactivate.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <a
              href={`https://wa.me/917004700318?text=${encodeURIComponent(
                `Hi Digital Ranchi, I would like to reactivate the Client 360 Portal for ${client.businessName}.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md"
            >
              <MessageSquare className="w-4 h-4" />
              Reactivate via WhatsApp
            </a>
          </div>
        </div>
      )}

      {/* Hero Header Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified Google Business
            </span>
            {client.city && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-white/10 text-slate-200 border border-white/15">
                <MapPin className="w-3 h-3 text-sky-400" />
                {client.city}
              </span>
            )}
            {client.syncedAt && (
              <span className="text-[10px] text-slate-400">
                Synced: {client.syncedAt}
              </span>
            )}
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {client.businessName}
          </h2>
          <p className="text-xs text-slate-300 max-w-xl">
            {client.category} {client.city ? `in ${client.city}` : ''} • Growth Retainer Active • Renewal: {formatDate(client.renewalDate)}
          </p>
        </div>

        {/* Quick Sync & AI Credits Pill */}
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            isLoading={isSyncing}
            onClick={handleQuickSync}
            className="bg-white/10 text-white hover:bg-white/20 border-white/20 text-xs py-2 px-3.5"
          >
            {isSyncing ? 'Syncing GBP...' : 'Sync Google Data'}
          </Button>

          <div
            onClick={() => setIsWalletOpen(true)}
            className="p-3 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 cursor-pointer transition-all flex items-center gap-2.5 group"
          >
            <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
            <div className="text-left">
              <span className="text-[10px] font-bold text-amber-200 block uppercase leading-none">AI Credits</span>
              <span className="text-xs font-black text-white">{aiPoints} Available <span className="text-[10px] text-amber-300 underline font-normal">+ Recharge</span></span>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Core Performance KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Google Rating</span>
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-1.5">
            {client.averageRating || 5.0} <span className="text-amber-500 text-base">★</span>
          </div>
          <span className="text-[10px] text-slate-400 block font-medium">
            Across {client.reviewCount || reviews.length || 0} verified customer reviews
          </span>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Unanswered Reviews</span>
            <MessageSquare className={`w-4 h-4 ${pendingReviews.length > 0 ? 'text-rose-500' : 'text-emerald-500'}`} />
          </div>
          <div className={`text-2xl font-black ${pendingReviews.length > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
            {pendingReviews.length}
          </div>
          <span className="text-[10px] text-slate-400 block font-medium">
            {pendingReviews.length > 0 ? 'Urgent: Needs reply to boost ranking' : 'All reviews answered! (100% SLA)'}
          </span>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Map Pack Rank</span>
            <TrendingUp className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
            #{client.gbpScore >= 85 ? '1' : '2'}
          </div>
          <span className="text-[10px] text-slate-400 block font-medium">
            Top local search in {cityDisplay}
          </span>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">GBP Health Score</span>
            <Activity className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {client.gbpScore || 88}/100
          </div>
          <span className="text-[10px] text-slate-400 block font-medium">
            OPTIMAL • Verified NAP & Category
          </span>
        </div>
      </div>

      {/* Urgent Action Center: Reviews Needing Immediate Reply */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-600 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Google Reviews & AI Smart Responder
              </h3>
              <p className="text-[11px] text-slate-500">
                {pendingReviews.length > 0
                  ? `${pendingReviews.length} customer reviews require your official owner response to boost ranking in ${cityDisplay}.`
                  : `All reviews have official owner replies. Monitoring for new reviews in real-time.`}
              </p>
            </div>
          </div>

          <Link href="/portal/reviews">
            <Button variant="outline" size="sm" icon={ArrowRight} className="text-xs">
              View All Reviews ({reviews.length})
            </Button>
          </Link>
        </div>

        {/* Embedded Reviews Workspace */}
        <ReviewManagementWidget
          businessName={client.businessName}
          reviews={client.reviews}
          currentPoints={aiPoints}
          googleMapsUrl={client.googleMapsUrl}
          placeId={client.placeId}
          city={client.city}
          onDeductPoints={handleDeductPoints}
          onOpenRechargeModal={() => setIsWalletOpen(true)}
          onSaveReply={saveReviewReply}
          onProfileSynced={(updatedData) => {
            if (updatedData) {
              updateProfile({
                ...client,
                ...updatedData,
              });
            }
          }}
        />
      </div>

      {/* 4 Feature Action Cards for Non-Technical Owners */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <Link
          href="/portal/growth"
          className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 hover:shadow-lg transition-all space-y-3 group"
        >
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 flex items-center justify-between">
              <span>Local Search Growth</span>
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Track how your Google Maps direction requests, direct phone calls, and ranking are increasing.
            </p>
          </div>
        </Link>

        <Link
          href="/portal/creative-studio"
          className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-rose-500 hover:shadow-lg transition-all space-y-3 group"
        >
          <div className="w-10 h-10 rounded-2xl bg-rose-500/15 text-rose-500 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Gift className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-rose-600 flex items-center justify-between">
              <span>Festival Posters Studio</span>
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Generate branded festival greeting posters and promo offer graphics in 1 click for WhatsApp and Instagram.
            </p>
          </div>
        </Link>

        <Link
          href="/portal/qr-stand"
          className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 hover:shadow-lg transition-all space-y-3 group"
        >
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-emerald-600 flex items-center justify-between">
              <span>Review QR Stand & Mini-Site</span>
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Print a ready-to-use acrylic QR code stand to collect 5-star customer reviews on your counter.
            </p>
          </div>
        </Link>
      </div>

      {/* Razorpay AI Points Wallet Modal */}
      <AIPointsWalletModal
        isOpen={isWalletOpen}
        onClose={() => setIsWalletOpen(false)}
        currentPoints={aiPoints}
        onPointsAdded={handlePointsAdded}
      />
    </div>
  );
}
