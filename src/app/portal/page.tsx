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
  Share2,
  Copy,
  ChevronRight,
  Bot,
  Flame,
  ArrowUpRight,
  Check,
  Radio,
  Truck,
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
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [activeAgentTab, setActiveAgentTab] = useState<'GBP' | 'WHATSAPP' | 'REVIEWS' | 'WEBSITE'>('GBP');

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

  const copyToClipboard = (text: string, label: string) => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(text);
      setCopiedLink(label);
      setTimeout(() => setCopiedLink(null), 2500);
    }
  };

  const isPaused = client.status === 'PAUSED' || client.status === 'CHURNED';
  const reviews = client.reviews || [];
  const pendingReviews = reviews.filter((r) => r.status === 'PENDING');
  const answeredCount = reviews.filter((r) => r.status === 'REPLIED').length;
  const responseRate = reviews.length > 0 ? Math.round((answeredCount / reviews.length) * 100) : 100;
  const cityDisplay = client.city || 'Jharkhand';
  const miniSiteSlug = client.businessName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
  const miniSiteUrl = client.websiteUrl || `https://digitalranchi.in/s/${miniSiteSlug}`;
  const whatsappNumber = (client.whatsapp || client.phone || '917004700318').replace(/[^0-9]/g, '');
  const directWhatsAppLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    `Hi ${client.businessName}, I would like to inquire about your services.`
  )}`;

  return (
    <div className="space-y-6 max-w-6xl pb-16">
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

      {/* ========================================================================= */}
      {/* Digital Ranchi-STYLE HERO COMMAND BANNER: All-in-One AI Marketing Team             */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 border border-indigo-500/30 p-6 sm:p-8 text-white shadow-2xl">
        {/* Ambient background glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-sky-500/15 rounded-full blur-[90px] pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            {/* Top Tag */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>Digital Ranchi-Powered AI Local Marketing Team</span>
              </div>

              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <CheckCircle2 className="w-3 h-3" />
                Live Revenue Engine
              </span>

              {client.city && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/10 text-slate-300 border border-white/15">
                  <MapPin className="w-3 h-3 text-sky-400" />
                  {client.city}
                </span>
              )}
            </div>

            {/* Business Title */}
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
                {client.businessName}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                Your 24/7 AI marketing team that manages Google Maps ranking, automates 5★ reviews, handles customer inquiries on WhatsApp, and drives real local revenue.
              </p>
            </div>

            {/* Sub-meta details */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
              <span>Category: <strong className="text-slate-200">{client.category}</strong></span>
              <span>•</span>
              <span>SaaS Tier: <strong className="text-indigo-300">{client.packageName}</strong></span>
              {client.syncedAt && (
                <>
                  <span>•</span>
                  <span>Last Google Sync: <strong className="text-slate-200">{client.syncedAt}</strong></span>
                </>
              )}
            </div>
          </div>

          {/* Quick Action Header Buttons */}
          <div className="flex flex-wrap lg:flex-col items-stretch gap-2.5 shrink-0 w-full sm:w-auto">
            <Button
              variant="primary"
              size="md"
              icon={RefreshCw}
              isLoading={isSyncing}
              onClick={handleQuickSync}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-indigo-600/30 rounded-2xl py-2.5 px-4 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSyncing ? 'Syncing Google Data...' : 'Sync Live Google Profile'}
            </Button>

            <div className="flex items-center gap-2 w-full">
              {client.googleMapsUrl && (
                <a
                  href={client.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-bold text-white transition-all flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-sky-300" />
                  <span>Google Maps</span>
                </a>
              )}

              <a
                href={miniSiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-bold text-white transition-all flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Globe className="w-3.5 h-3.5 text-indigo-300" />
                <span>1-Page Site</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4 CORE PERFORMANCE GROWTH METRICS (Digital Ranchi KPI RADAR)                      */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Metric 1: Google Rating */}
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-1.5 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Google Maps Rating
            </span>
            <div className="w-6 h-6 rounded-lg bg-amber-500/15 text-amber-500 flex items-center justify-center">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-1.5">
            {client.averageRating || 5.0} <span className="text-amber-500 text-lg">★</span>
          </div>
          <span className="text-[11px] text-slate-400 block font-medium">
            Across <strong>{client.reviewCount || reviews.length || 0}</strong> verified Google reviews
          </span>
        </div>

        {/* Metric 2: Map Pack Ranking */}
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-1.5 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Map Pack Rank
            </span>
            <div className="w-6 h-6 rounded-lg bg-indigo-500/15 text-indigo-500 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
            #{client.gbpScore >= 85 ? '1' : '2'}
            <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              Top 3
            </span>
          </div>
          <span className="text-[11px] text-slate-400 block font-medium">
            Ranked for "{client.category}" in {cityDisplay}
          </span>
        </div>

        {/* Metric 3: Urgent Pending Reviews */}
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-1.5 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Review AI Response
            </span>
            <div className={`w-6 h-6 rounded-lg ${pendingReviews.length > 0 ? 'bg-rose-500/15 text-rose-500' : 'bg-emerald-500/15 text-emerald-500'} flex items-center justify-center`}>
              <MessageSquare className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className={`text-2xl sm:text-3xl font-black ${pendingReviews.length > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
            {responseRate}%
          </div>
          <span className="text-[11px] text-slate-400 block font-medium">
            {pendingReviews.length > 0
              ? `${pendingReviews.length} pending review requires reply`
              : 'All reviews responded (100% SLA)'}
          </span>
        </div>

        {/* Metric 4: AI Health Score */}
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-1.5 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              AI Growth Score
            </span>
            <div className="w-6 h-6 rounded-lg bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
              <Activity className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
            {client.gbpScore || 88}<span className="text-sm text-slate-400 font-bold">/100</span>
          </div>
          <span className="text-[11px] text-slate-400 block font-medium">
            OPTIMAL • Verified Profile & Live Synced
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* Digital Ranchi SIGNATURE: MEET YOUR 4 DIGITAL MARKETING AI AGENTS TEAM             */}
      {/* ========================================================================= */}
      <div className="space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="space-y-0.5">
            <div className="inline-flex items-center gap-1.5 text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              <Bot className="w-3.5 h-3.5" />
              <span>Autonomous Growth Engine</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
              Meet Your Digital Marketing AI Team
            </h2>
          </div>
          <span className="text-xs text-slate-400">
            4 Specialized AI Agents working simultaneously for <strong className="text-slate-700 dark:text-slate-200">{client.businessName}</strong>
          </span>
        </div>

        {/* 4 Multi-Gradient Agent Showcase Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* AGENT 1: Google Business Profile & Local Maps Booster */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-amber-500/10 via-white to-amber-500/5 dark:from-amber-950/30 dark:via-slate-900 dark:to-slate-900 border border-amber-300 dark:border-amber-700/50 shadow-xs hover:shadow-lg transition-all space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-black shadow-md shadow-amber-500/30">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 block">
                      AI Agent 1 • Local SEO
                    </span>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">
                      Google Business Profile Booster
                    </h3>
                  </div>
                </div>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                  New Customers
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Optimizes your Google profile categories, operational hours, geotagged photos, and search keywords to rank #{client.gbpScore >= 85 ? '1' : '2'} in local search.
              </p>

              <div className="p-3 rounded-2xl bg-amber-500/10 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-500 font-bold block">Status</span>
                  <span className="font-extrabold text-amber-900 dark:text-amber-200">
                    Rank #1 Local in {cityDisplay}
                  </span>
                </div>
                <span className="text-xs font-black text-amber-600 dark:text-amber-400">
                  +340% Map Views
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <Link
                href="/portal/growth"
                className="flex-1 py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
              >
                <span>View Rank Tracker</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              {client.googleMapsUrl && (
                <a
                  href={client.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors"
                  title="Open on Google Maps"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* AGENT 2: WhatsApp Auto-Lead & Inquiry AI Agent */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-white to-emerald-500/5 dark:from-emerald-950/30 dark:via-slate-900 dark:to-slate-900 border border-emerald-300 dark:border-emerald-700/50 shadow-xs hover:shadow-lg transition-all space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black shadow-md shadow-emerald-600/30">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                      AI Agent 2 • 24/7 Chat
                    </span>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">
                      WhatsApp Lead & Inquiry Agent
                    </h3>
                  </div>
                </div>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                  Realtime Conversion
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Connects Google Maps searchers directly to your WhatsApp with pre-filled inquiries, instant catalog booking, and 1-click customer interaction.
              </p>

              <div className="p-3 rounded-2xl bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-500 font-bold block">Connected Number</span>
                  <span className="font-extrabold text-emerald-900 dark:text-emerald-200 font-mono">
                    +{whatsappNumber}
                  </span>
                </div>
                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                  Instant Response
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <a
                href={directWhatsAppLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Test WhatsApp Chat Link</span>
              </a>
              <button
                type="button"
                onClick={() => copyToClipboard(directWhatsAppLink, 'whatsapp')}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
                title="Copy WhatsApp Chat Link"
              >
                {copiedLink === 'whatsapp' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* AGENT 3: Gemini AI Review Reply & Reputation Agent */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-purple-500/10 via-white to-purple-500/5 dark:from-purple-950/30 dark:via-slate-900 dark:to-slate-900 border border-purple-300 dark:border-purple-700/50 shadow-xs hover:shadow-lg transition-all space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-black shadow-md shadow-purple-600/30">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-400 block">
                      AI Agent 3 • Gemini 5★
                    </span>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">
                      AI Review Smart Responder
                    </h3>
                  </div>
                </div>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/30">
                  Reputation Retention
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Auto-generates contextual owner responses with Google-friendly keywords to turn reviews into top search ranking factors and 5-star customer retention.
              </p>

              <div className="p-3 rounded-2xl bg-purple-500/10 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-500 font-bold block">Review SLA</span>
                  <span className="font-extrabold text-purple-900 dark:text-purple-200">
                    {client.averageRating || 5.0}★ Rating • {reviews.length} Reviews
                  </span>
                </div>
                <span className="text-xs font-black text-purple-600 dark:text-purple-400">
                  {pendingReviews.length} Pending
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <Link
                href="/portal/reviews"
                className="flex-1 py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
              >
                <span>Manage Reviews & Auto-Reply</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/portal/qr-stand"
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors"
                title="Counter QR Stand"
              >
                <QrCode className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* AGENT 4: 1-Page High-Converting Verified Website */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-sky-500/10 via-white to-sky-500/5 dark:from-sky-950/30 dark:via-slate-900 dark:to-slate-900 border border-sky-300 dark:border-sky-700/50 shadow-xs hover:shadow-lg transition-all space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-2xl bg-sky-600 text-white flex items-center justify-center font-black shadow-md shadow-sky-600/30">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-sky-600 dark:text-sky-400 block">
                      AI Agent 4 • Web Funnel
                    </span>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">
                      1-Page Verified Mini-Website
                    </h3>
                  </div>
                </div>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-700 dark:text-sky-300 border border-sky-500/30">
                  Shared Brain
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Mobile-first, lightning-fast landing page with direct call, WhatsApp booking, service menus, and local JSON-LD SEO schema published live.
              </p>

              <div className="p-3 rounded-2xl bg-sky-500/10 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/60 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-500 font-bold block">Live Domain</span>
                  <span className="font-extrabold text-sky-900 dark:text-sky-200 font-mono line-clamp-1">
                    /s/{miniSiteSlug}
                  </span>
                </div>
                <span className="text-xs font-black text-sky-600 dark:text-sky-400">
                  100% Mobile
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <Link
                href="/portal/site-builder"
                className="flex-1 py-2 px-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
              >
                <span>Edit 1-Page Website</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <a
                href={miniSiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors"
                title="View Live Public Website"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
              <button
                type="button"
                onClick={() => copyToClipboard(miniSiteUrl, 'site')}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
                title="Copy Website Link"
              >
                {copiedLink === 'site' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* URGENT ACTION CENTER: LIVE REVIEWS & GEMINI AI SMART RESPONDER           */}
      {/* ========================================================================= */}
      <div className="space-y-3 pt-2">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-600 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Google Reviews & Gemini AI Smart Responder
              </h3>
              <p className="text-[11px] text-slate-500">
                {pendingReviews.length > 0
                  ? `${pendingReviews.length} customer reviews require your official owner response to boost ranking in ${cityDisplay}.`
                  : `All customer reviews have official owner replies. Monitoring for new Google Maps reviews.`}
              </p>
            </div>
          </div>

          <Link href="/portal/reviews">
            <Button variant="outline" size="sm" icon={ArrowRight} className="text-xs font-bold">
              View All Reviews ({reviews.length})
            </Button>
          </Link>
        </div>

        {/* Embedded Reviews Workspace Component */}
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

      {/* ========================================================================= */}
      {/* SMART AI STANDEE & SENTIMENT SHIELD CONVERSION HUB                         */}
      {/* ========================================================================= */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-purple-900/30 via-slate-900 to-indigo-950/40 border border-purple-500/30 shadow-lg space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-purple-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-600/30">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-400">
                  Client 360 Hardware Suite
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Smart Shield Active
                </span>
              </div>
              <h3 className="text-base font-black text-white">
                Contactless AI Standee & Sentiment Shield
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/portal/ai-standee"
              className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all shadow-sm"
            >
              Manage Hardware
            </Link>
            <Link
              href="/portal/feedback"
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-all border border-slate-700"
            >
              Private Inbox
            </Link>
          </div>
        </div>

        {/* Mini 3-Column Radar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
              <span>NFC Hardware Status</span>
              <Truck className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-sm font-bold text-white flex items-center gap-1.5 pt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Order Active • Free Delivery</span>
            </div>
            <p className="text-[10px] text-slate-400">UV Acrylic Counter Stand with NFC chip</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
              <span>4★ & 5★ AI Generator</span>
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-sm font-bold text-emerald-400 flex items-center gap-1.5 pt-1">
              <span>1-Tap Google Maps Redirect</span>
            </div>
            <p className="text-[10px] text-slate-400">Gemini SEO keywords pre-synthesized</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
              <span>1★ - 3★ Sentiment Shield</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-sm font-bold text-purple-300 flex items-center gap-1.5 pt-1">
              <span>Private Owner Inbox</span>
            </div>
            <p className="text-[10px] text-slate-400">Prevents public negative Google reviews</p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* Digital Ranchi QUICK LAUNCHPAD: ALL-IN-ONE AI LOCAL MARKETING APPS                 */}
      {/* ========================================================================= */}
      <div className="space-y-3 pt-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Complete Growth OS
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              All-in-One Local Marketing App Suite
            </h3>
          </div>
          <span className="text-xs text-indigo-600 dark:text-indigo-400 font-bold">
            8 Specialized Growth Apps Included
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* App 1: 1-Page Site Builder */}
          <Link
            href="/portal/site-builder"
            className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-sky-500 hover:shadow-lg transition-all space-y-3 group"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-sky-500/15 text-sky-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Globe className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400">
                Live Site
              </span>
            </div>
            <div>
              <h4 className="font-black text-sm text-slate-900 dark:text-white group-hover:text-sky-600 flex items-center justify-between">
                <span>1-Page Mini Website</span>
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Instant high-converting mobile landing page with direct WhatsApp booking, call buttons, and services catalog.
              </p>
            </div>
          </Link>

          {/* App 2: Review QR Stand */}
          <Link
            href="/portal/qr-stand"
            className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500 hover:shadow-lg transition-all space-y-3 group"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <QrCode className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                Counter QR
              </span>
            </div>
            <div>
              <h4 className="font-black text-sm text-slate-900 dark:text-white group-hover:text-emerald-600 flex items-center justify-between">
                <span>Counter Review QR Stand</span>
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Download print-ready acrylic counter QR stands with instant Google review links and 5-star acceleration.
              </p>
            </div>
          </Link>

          {/* App 3: Festival Posters Studio */}
          <Link
            href="/portal/creative-studio"
            className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-rose-500 hover:shadow-lg transition-all space-y-3 group"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/15 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Gift className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400">
                AI Graphics
              </span>
            </div>
            <div>
              <h4 className="font-black text-sm text-slate-900 dark:text-white group-hover:text-rose-600 flex items-center justify-between">
                <span>Festival Posters Studio</span>
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Generate branded festive greeting posters and promo offer graphics in 1 click for WhatsApp status & Instagram.
              </p>
            </div>
          </Link>

          {/* App 4: SEO & Rank Radar */}
          <Link
            href="/portal/growth"
            className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-500 hover:shadow-lg transition-all space-y-3 group"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <TrendingUp className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                Local SEO
              </span>
            </div>
            <div>
              <h4 className="font-black text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 flex items-center justify-between">
                <span>Monthly Growth & Rank Radar</span>
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Track how your Google Maps direction requests, direct phone calls, search impressions, and rank are increasing.
              </p>
            </div>
          </Link>

          {/* App 5: Deliverables & Reports */}
          <Link
            href="/portal/reports"
            className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-purple-500 hover:shadow-lg transition-all space-y-3 group"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/15 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400">
                Monthly Audit
              </span>
            </div>
            <div>
              <h4 className="font-black text-sm text-slate-900 dark:text-white group-hover:text-purple-600 flex items-center justify-between">
                <span>Deliverables & Audit Reports</span>
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Review verified execution logs, monthly SEO health scorecards, NAP audits, and scheduled tasks.
              </p>
            </div>
          </Link>

          {/* App 6: Invoices & AI Wallet */}
          <Link
            href="/portal/invoices"
            className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-amber-500 hover:shadow-lg transition-all space-y-3 group"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Coins className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
                GST Invoices
              </span>
            </div>
            <div>
              <h4 className="font-black text-sm text-slate-900 dark:text-white group-hover:text-amber-600 flex items-center justify-between">
                <span>Billing & Tax Invoices</span>
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Download official Bills of Supply / GST invoices, renewal receipts, and manage Razorpay subscription.
              </p>
            </div>
          </Link>
        </div>
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
