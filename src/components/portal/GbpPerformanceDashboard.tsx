'use client';

import React, { useState } from 'react';
import {
  TrendingUp,
  MapPin,
  Phone,
  Globe,
  Navigation,
  Smartphone,
  Monitor,
  Search,
  CheckCircle2,
  Upload,
  RefreshCw,
  Clock,
  ShieldCheck,
  Calendar,
  Layers,
  ArrowUpRight,
  Sparkles,
  BarChart3,
  PieChart,
  Filter,
} from 'lucide-react';
import { Button } from '@/components/ui';
import { GbpDailyOrMonthlyInsight, SEEDED_AUTHENTIC_GBP_INSIGHT } from '@/lib/gbp-insights-engine';
import { GbpInsightsUploadModal } from './GbpInsightsUploadModal';

export interface GbpPerformanceDashboardProps {
  insights?: GbpDailyOrMonthlyInsight[];
  businessName?: string;
  city?: string;
  syncedAt?: string;
  isLiveSynced?: boolean;
  clientId?: string;
  onInsightsUpdated?: (insights: GbpDailyOrMonthlyInsight[]) => void;
}

export const GbpPerformanceDashboard: React.FC<GbpPerformanceDashboardProps> = ({
  insights = [],
  businessName = 'Life in Lights Academy',
  city = 'Dhanbad',
  syncedAt,
  isLiveSynced = true,
  clientId,
  onInsightsUpdated,
}) => {
  const [activeInsights, setActiveInsights] = useState<GbpDailyOrMonthlyInsight[]>(
    insights && insights.length > 0 ? insights : [SEEDED_AUTHENTIC_GBP_INSIGHT]
  );
  const [selectedPeriodIndex, setSelectedPeriodIndex] = useState<number>(0);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [viewTab, setViewTab] = useState<'overview' | 'breakdown' | 'actions' | 'history'>('overview');

  const currentInsight = activeInsights[selectedPeriodIndex] || activeInsights[0] || null;

  const handleInsightsSaved = (newInsights: GbpDailyOrMonthlyInsight[]) => {
    setActiveInsights(newInsights);
    setSelectedPeriodIndex(0);
    if (onInsightsUpdated) {
      onInsightsUpdated(newInsights);
    }
  };

  // If zero insight records exist, show clean empty state without any fabricated numbers
  if (!currentInsight) {
    return (
      <div className="p-8 sm:p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-5 text-white shadow-xl">
        <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mx-auto shadow-inner">
          <TrendingUp className="w-7 h-7" />
        </div>
        <div className="space-y-1.5 max-w-md mx-auto">
          <h4 className="text-lg font-bold text-white">
            No Google Business Profile Insights Synced Yet
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Upload the authentic CSV insight export from your Google Business Profile manager or connect the Google Maps API for <strong>{businessName}</strong>.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Button
            variant="primary"
            size="sm"
            icon={Upload}
            onClick={() => setIsUploadModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md font-bold"
          >
            Upload Google Insights CSV
          </Button>
        </div>

        <GbpInsightsUploadModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          onInsightsSaved={handleInsightsSaved}
          businessName={businessName}
          clientId={clientId}
        />
      </div>
    );
  }

  // Calculate percentages and rates
  const searchMobile = currentInsight.searchMobile || 0;
  const searchDesktop = currentInsight.searchDesktop || 0;
  const mapsMobile = currentInsight.mapsMobile || 0;
  const mapsDesktop = currentInsight.mapsDesktop || 0;

  const totalSearch = searchMobile + searchDesktop;
  const totalMaps = mapsMobile + mapsDesktop;
  const totalViews = Math.max(1, totalSearch + totalMaps);

  const totalMobile = searchMobile + mapsMobile;
  const totalDesktop = searchDesktop + mapsDesktop;
  const mobilePercent = Math.round((totalMobile / totalViews) * 100);
  const desktopPercent = 100 - mobilePercent;

  const searchPercent = Math.round((totalSearch / totalViews) * 100);
  const mapsPercent = 100 - searchPercent;

  const directions = currentInsight.directions || 0;
  const calls = currentInsight.calls || 0;
  const websiteClicks = currentInsight.websiteClicks || 0;
  const messages = currentInsight.messages || 0;
  const bookings = currentInsight.bookings || 0;

  const totalActions = directions + calls + websiteClicks + messages + bookings;
  const actionRate = totalViews > 0 ? ((totalActions / totalViews) * 100).toFixed(1) : '0.0';

  return (
    <div className="space-y-6">
      {/* Top Header & Action Ribbon */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 text-white shadow-md space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0 shadow-xs">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-extrabold text-base text-white">
                  {currentInsight.businessName || businessName}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Authentic Google Business Profile Data
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 flex items-center gap-2 flex-wrap">
                <span>📍 {currentInsight.address || `${city}, Jharkhand`}</span>
                <span>•</span>
                <span>🕒 Period: <strong>{currentInsight.period}</strong></span>
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              icon={Upload}
              onClick={() => setIsUploadModalOpen(true)}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs font-bold"
            >
              Upload New CSV
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={RefreshCw}
              onClick={() => setIsUploadModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm text-xs font-bold"
            >
              Fetch from Google API
            </Button>
          </div>
        </div>

        {/* Multi-Period Selector if multiple imports exist */}
        {activeInsights.length > 1 && (
          <div className="pt-2 border-t border-indigo-500/20 flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="text-[11px] text-slate-400 font-semibold shrink-0">Historical Reports:</span>
            {activeInsights.map((ins, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedPeriodIndex(idx)}
                className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap transition-all ${
                  selectedPeriodIndex === idx
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {ins.period} ({ins.totalViews} views)
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 4 Core Metric KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Total Views / Impressions */}
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Total Profile Impressions
            </span>
            <div className="w-7 h-7 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
              <Search className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {totalViews}
          </div>
          <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
            <span>{totalSearch} Search</span>
            <span>{totalMaps} Maps</span>
          </div>
        </div>

        {/* Customer Actions / Engagements */}
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Customer Actions
            </span>
            <div className="w-7 h-7 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <Navigation className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {totalActions}
          </div>
          <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 pt-1 border-t border-slate-100 dark:border-slate-800">
            <ArrowUpRight className="w-3 h-3" />
            <span>{actionRate}% Action Conversion Rate</span>
          </div>
        </div>

        {/* Direction Requests */}
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Direction Requests
            </span>
            <div className="w-7 h-7 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {directions}
          </div>
          <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800">
            Storefront & studio visit navigations
          </div>
        </div>

        {/* Mobile vs Desktop Split */}
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Mobile Discovery Ratio
            </span>
            <div className="w-7 h-7 rounded-xl bg-sky-500/10 text-sky-600 flex items-center justify-center">
              <Smartphone className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {mobilePercent}%
          </div>
          <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
            <span>{totalMobile} Mobile</span>
            <span>{totalDesktop} Desktop</span>
          </div>
        </div>
      </div>

      {/* 2-Column Visual Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Platform & Device Breakdown */}
        <div className="lg:col-span-7 space-y-6">
          {/* Platform Impressions Chart (Google Search vs Google Maps) */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Search className="w-4 h-4 text-indigo-500" />
                  <span>Platform Impressions Breakdown</span>
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  How customers discovered your business profile across Google services.
                </p>
              </div>
              <span className="text-xs font-black text-slate-900 dark:text-white">
                {totalViews} Total Views
              </span>
            </div>

            {/* Visual Bar Comparison */}
            <div className="space-y-4">
              {/* Google Search Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
                    <Search className="w-3.5 h-3.5" />
                    Google Search
                  </span>
                  <span className="text-slate-900 dark:text-white">
                    {totalSearch} views ({searchPercent}%)
                  </span>
                </div>
                <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                  <div
                    className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${searchPercent}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>📱 Mobile: <strong>{searchMobile}</strong></span>
                  <span>💻 Desktop: <strong>{searchDesktop}</strong></span>
                </div>
              </div>

              {/* Google Maps Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
                    <MapPin className="w-3.5 h-3.5" />
                    Google Maps
                  </span>
                  <span className="text-slate-900 dark:text-white">
                    {totalMaps} views ({mapsPercent}%)
                  </span>
                </div>
                <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                  <div
                    className="bg-rose-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${mapsPercent}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>📱 Mobile: <strong>{mapsMobile}</strong></span>
                  <span>💻 Desktop: <strong>{mapsDesktop}</strong></span>
                </div>
              </div>
            </div>

            {/* Device Split Summary */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-around text-center text-xs">
              <div>
                <span className="text-[10px] text-slate-400 font-semibold block">Mobile Total</span>
                <span className="text-lg font-black text-slate-900 dark:text-white">
                  {totalMobile}
                </span>
                <span className="text-[10px] text-indigo-600 font-bold block">{mobilePercent}%</span>
              </div>
              <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />
              <div>
                <span className="text-[10px] text-slate-400 font-semibold block">Desktop Total</span>
                <span className="text-lg font-black text-slate-900 dark:text-white">
                  {totalDesktop}
                </span>
                <span className="text-[10px] text-sky-600 font-bold block">{desktopPercent}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Customer Actions Distribution */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div>
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Navigation className="w-4 h-4 text-emerald-500" />
                <span>Customer Actions Breakdown</span>
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Direct customer interactions driven by your Google profile.
              </p>
            </div>

            {/* Action Cards List */}
            <div className="space-y-3 text-xs">
              {/* Direction Requests */}
              <div className="p-3.5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-xs">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">Direction Requests</span>
                    <span className="text-[10px] text-slate-500">Navigation routes to your location</span>
                  </div>
                </div>
                <span className="text-lg font-black text-rose-600 dark:text-rose-400">
                  {directions}
                </span>
              </div>

              {/* Website Clicks */}
              <div className="p-3.5 rounded-2xl bg-sky-50/50 dark:bg-sky-950/20 border border-sky-100 dark:border-sky-900/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-sky-500 text-white flex items-center justify-center shadow-xs">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">Website Clicks</span>
                    <span className="text-[10px] text-slate-500">1-page mini-site visits</span>
                  </div>
                </div>
                <span className="text-lg font-black text-sky-600 dark:text-sky-400">
                  {websiteClicks}
                </span>
              </div>

              {/* Phone Calls */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">Phone Calls</span>
                    <span className="text-[10px] text-slate-500">Direct phone dial interactions</span>
                  </div>
                </div>
                <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                  {calls}
                </span>
              </div>

              {/* Messages & Bookings */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-600 text-white flex items-center justify-center shadow-xs">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">Messages & Bookings</span>
                    <span className="text-[10px] text-slate-500">Direct chat & appointment inquiries</span>
                  </div>
                </div>
                <span className="text-lg font-black text-slate-700 dark:text-slate-300">
                  {messages + bookings}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      <GbpInsightsUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onInsightsSaved={handleInsightsSaved}
        businessName={businessName}
        clientId={clientId}
      />
    </div>
  );
};
