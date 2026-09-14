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
  CalendarCheck,
  CheckCircle2,
  Zap,
  AlertTriangle,
  ShieldAlert,
} from 'lucide-react';
import { Button } from '@/components/ui';
import { globalStore } from '@/lib/store';
import { formatINR, formatDate } from '@/lib/utils';
import { DigitalHealthAuditCard } from '@/components/portal/DigitalHealthAuditCard';
import { MonthlyGrowthChart } from '@/components/portal/MonthlyGrowthChart';
import { ReviewManagementWidget } from '@/components/portal/ReviewManagementWidget';
import { FestivalCreativeStudio } from '@/components/portal/FestivalCreativeStudio';
import { GoogleGbpAuthCard } from '@/components/portal/GoogleGbpAuthCard';
import { AIPointsWalletModal } from '@/components/portal/AIPointsWalletModal';
import {
  getSyncedBusinessProfile,
  SyncedBusinessProfile,
  DEMO_BUSINESS_PROFILE,
  fetchPortalProfileFromServer,
} from '@/lib/client-portal-sync';

export default function ClientPortalDashboard() {
  const [client, setClient] = useState<SyncedBusinessProfile>(DEMO_BUSINESS_PROFILE);
  const [aiPoints, setAiPoints] = useState(65);
  const [isWalletOpen, setIsWalletOpen] = useState(false);

  React.useEffect(() => {
    setClient(getSyncedBusinessProfile());
    fetchPortalProfileFromServer().then((loaded) => {
      if (loaded) setClient(loaded);
    });

    const handleUpdate = (e: any) => {
      if (e.detail) setClient(e.detail);
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

  const handlePointsAdded = (added: number) => {
    setAiPoints((prev) => prev + added);
  };

  const isPaused = client.status === 'PAUSED' || client.status === 'CHURNED';

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
                Access to your live Google Business Profile sync, AI review responder, and creative generation has been deactivated by Digital Ranchi. Please reach out to your Account Manager to reactivate.
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
              Reactivate via WhatsApp (+91 70047 00318)
            </a>
            <a
              href="tel:+917004700318"
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-2 transition-all border border-white/20"
            >
              <PhoneCall className="w-4 h-4" />
              Call Support (+91 70047 00318)
            </a>
          </div>
        </div>
      )}

      {/* Top Banner & Wallet Status */}
      <div className={`p-6 rounded-3xl text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border ${
        isPaused
          ? 'bg-gradient-to-r from-slate-900 to-slate-950 border-slate-800 opacity-80'
          : 'bg-gradient-to-r from-sky-900 via-slate-900 to-indigo-950 border-sky-800/40'
      }`}>
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
              isPaused
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
            }`}>
              <ShieldCheck className="w-3 h-3" />
              {isPaused ? 'Portal Deactivated' : 'Verified Google Business Profile'}
            </span>
            <span className="text-xs text-sky-200">
              Package: <strong>{client.packageName}</strong>
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Namaste, {client.businessName}!
          </h2>
          <p className="text-xs text-slate-300">
            Next monthly retainer renewal on <strong>{formatDate(client.renewalDate)}</strong> ({formatINR(client.monthlyRevenue)}/month).
          </p>
        </div>

        {/* AI Points Wallet Pill */}
        <div className="flex items-center gap-3">
          <div
            onClick={() => setIsWalletOpen(true)}
            className="p-3.5 rounded-2xl bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/20 cursor-pointer transition-all flex items-center gap-3 group"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shadow-md">
              <Zap className="w-5 h-5 fill-slate-950" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-amber-200 block">AI Points</span>
              <div className="text-base font-black text-white flex items-center gap-1">
                {aiPoints} Credits
                <span className="text-[10px] text-emerald-300 font-semibold group-hover:underline">+ Recharge</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link
          href="/portal/audit"
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 hover:shadow-md transition-all flex items-center gap-3 group"
        >
          <div className="w-9 h-9 rounded-xl bg-indigo-500/15 text-indigo-600 flex items-center justify-center shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-bold text-slate-900 dark:text-white block group-hover:text-indigo-600 truncate">
              Health Audit
            </span>
            <span className="text-[10px] text-slate-400 block">84/100 • View Factors</span>
          </div>
        </Link>

        <Link
          href="/portal/reviews"
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 hover:shadow-md transition-all flex items-center gap-3 group"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center shrink-0">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-bold text-slate-900 dark:text-white block group-hover:text-indigo-600 truncate">
              AI Review Replies
            </span>
            <span className="text-[10px] text-slate-400 block">2 Awaiting Response</span>
          </div>
        </Link>

        <Link
          href="/portal/creative-studio"
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 hover:shadow-md transition-all flex items-center gap-3 group"
        >
          <div className="w-9 h-9 rounded-xl bg-rose-500/15 text-rose-500 flex items-center justify-center shrink-0">
            <Gift className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-bold text-slate-900 dark:text-white block group-hover:text-indigo-600 truncate">
              Festival Studio
            </span>
            <span className="text-[10px] text-slate-400 block">Posters & Offers</span>
          </div>
        </Link>

        <Link
          href="/portal/qr-stand"
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 hover:shadow-md transition-all flex items-center gap-3 group"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0">
            <QrCode className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-bold text-slate-900 dark:text-white block group-hover:text-indigo-600 truncate">
              Review QR Stand
            </span>
            <span className="text-[10px] text-slate-400 block">Print Acrylic Stand</span>
          </div>
        </Link>
      </div>

      {/* Google Business Profile OAuth Connection Card */}
      <GoogleGbpAuthCard
        businessName={client.businessName}
        initialAuth={{
          isConnected: client.isLiveSynced && !!client.googleOwnerEmail,
          googleEmail: client.googleOwnerEmail || 'business.owner@gmail.com',
          accountName: client.googleAccountName || `${client.businessName} Owner`,
          locationId: client.placeId ? `locations/${client.placeId}` : 'locations/184920485729103948',
          locationName: `${client.businessName} Google Maps Listing`,
          connectedAt: client.syncedAt || 'Active Session',
          scopesGranted: [
            'https://www.googleapis.com/auth/business.manage',
            'openid',
            'email',
            'profile',
          ],
          reviewsSyncActive: true,
          canPostReplies: true,
        }}
      />

      {/* Section 1: Monthly Growth & Rise Charts */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            Monthly Growth & Performance Tracker
          </h3>
          <Link href="/portal/growth" className="text-xs font-bold text-sky-600 hover:underline">
            Full Growth Analysis →
          </Link>
        </div>
        <MonthlyGrowthChart
          businessName={client.businessName}
          metrics={client.growthMetrics}
        />
      </div>

      {/* Section 2: Digital Health Audit & Score Explanation */}
      <div className="space-y-2 pt-4">
        <div className="flex justify-between items-center">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-600" />
            Digital Health Audit & Factor Breakdown
          </h3>
          <Link href="/portal/audit" className="text-xs font-bold text-indigo-600 hover:underline">
            Score Details & Recommendations →
          </Link>
        </div>
        <DigitalHealthAuditCard
          businessName={client.businessName}
          category={client.category}
          city={client.city}
          factors={client.auditFactors}
        />
      </div>

      {/* Section 3: AI Review Management Feed */}
      <div className="space-y-2 pt-4">
        <div className="flex justify-between items-center">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-amber-500" />
            Recent Customer Reviews & AI Reply Assistant
          </h3>
          <Link href="/portal/reviews" className="text-xs font-bold text-amber-600 hover:underline">
            All Reviews Workspace →
          </Link>
        </div>
        <ReviewManagementWidget
          businessName={client.businessName}
          reviews={client.reviews}
          currentPoints={aiPoints}
          onDeductPoints={handleDeductPoints}
          onOpenRechargeModal={() => setIsWalletOpen(true)}
        />
      </div>

      {/* Section 4: Festival & Offer Creative Studio Preview */}
      <div className="space-y-2 pt-4">
        <div className="flex justify-between items-center">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Gift className="w-5 h-5 text-rose-500" />
            Upcoming Festival Graphics & Promotion Generator
          </h3>
          <Link href="/portal/creative-studio" className="text-xs font-bold text-rose-600 hover:underline">
            Open Full Studio →
          </Link>
        </div>
        <FestivalCreativeStudio
          businessName={client.businessName}
          category={client.category}
          city={client.city}
          phone={client.phone}
          whatsapp={client.whatsapp}
          currentPoints={aiPoints}
          onDeductPoints={handleDeductPoints}
          onOpenRechargeModal={() => setIsWalletOpen(true)}
        />
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
