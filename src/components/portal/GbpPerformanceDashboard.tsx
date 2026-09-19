'use client';

import React, { useState, useMemo, useEffect } from 'react';
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
  ArrowDownRight,
  Sparkles,
  BarChart3,
  PieChart,
  Filter,
  MessageSquare,
  Activity,
  ChevronRight,
  Eye,
  Trash2,
  Edit3,
  Database,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui';
import {
  GbpDailyOrMonthlyInsight,
  sortInsightsChronologically,
  MONTH_NAMES,
  MONTH_SHORT_NAMES,
} from '@/lib/gbp-insights-engine';
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

type GrowthMetricKey = 'directions' | 'websiteClicks' | 'calls' | 'messages' | 'bookings' | 'allActions' | 'views';

export const GbpPerformanceDashboard: React.FC<GbpPerformanceDashboardProps> = ({
  insights = [],
  businessName = '',
  city = '',
  syncedAt,
  isLiveSynced = true,
  clientId,
  onInsightsUpdated,
}) => {
  const [activeInsights, setActiveInsights] = useState<GbpDailyOrMonthlyInsight[]>(() => {
    const raw = insights && insights.length > 0 ? insights : [];
    return sortInsightsChronologically(raw);
  });

  const [selectedPeriodIndex, setSelectedPeriodIndex] = useState<number>(() => {
    return Math.max(0, activeInsights.length - 1);
  });

  const [activeGrowthMetric, setActiveGrowthMetric] = useState<GrowthMetricKey>('directions');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [modalInitialMonth, setModalInitialMonth] = useState<number | undefined>(undefined);
  const [modalInitialYear, setModalInitialYear] = useState<number | undefined>(undefined);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionNotification, setActionNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [isLoadingInsights, setIsLoadingInsights] = useState(true);

  // Sync insights prop when it changes
  useEffect(() => {
    if (Array.isArray(insights)) {
      if (insights.length > 0) {
        const sorted = sortInsightsChronologically(insights);
        setActiveInsights(sorted);
        setSelectedPeriodIndex(sorted.length - 1);
        setIsLoadingInsights(false);
      }
    }
  }, [insights]);

  const loadDatabaseInsights = async () => {
    setIsLoadingInsights(true);
    try {
      const queryParams = new URLSearchParams();
      if (clientId) queryParams.set('clientId', clientId);
      if (businessName) queryParams.set('businessName', businessName);

      const res = await fetch(`/api/portal/insights?${queryParams.toString()}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const sorted = sortInsightsChronologically(json.data);
          setActiveInsights(sorted);
          setSelectedPeriodIndex(sorted.length > 0 ? sorted.length - 1 : 0);
        }
      }
    } catch (err) {
      console.warn('Initial insights fetch error:', err);
    } finally {
      setIsLoadingInsights(false);
    }
  };

  // Fetch verified insights from PostgreSQL database on mount
  useEffect(() => {
    loadDatabaseInsights();
  }, [clientId, businessName]);

  // Keep activeInsights chronologically sorted
  const sortedInsights = useMemo(() => {
    return sortInsightsChronologically(activeInsights);
  }, [activeInsights]);

  const currentInsight = sortedInsights[selectedPeriodIndex] || sortedInsights[sortedInsights.length - 1] || null;

  const showNotification = (type: 'success' | 'error', message: string) => {
    setActionNotification({ type, message });
    setTimeout(() => {
      setActionNotification(null);
    }, 4500);
  };

  const handleInsightsSaved = (newInsights: GbpDailyOrMonthlyInsight[]) => {
    const sorted = sortInsightsChronologically(newInsights);
    setActiveInsights(sorted);
    setSelectedPeriodIndex(sorted.length - 1);
    showNotification('success', 'Monthly insights successfully saved and updated in database!');
    if (onInsightsUpdated) {
      onInsightsUpdated(sorted);
    }
  };

  // Open modal pre-configured for a specific month (for re-upload / overwriting)
  const handleOpenReuploadModal = (month?: number, year?: number) => {
    setModalInitialMonth(month);
    setModalInitialYear(year);
    setIsUploadModalOpen(true);
  };

  // Delete a specific monthly insight
  const handleDeleteInsight = async (ins: GbpDailyOrMonthlyInsight, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    const confirmMsg = `Are you sure you want to delete the Google Business Profile insight record for ${ins.period}?`;
    if (!window.confirm(confirmMsg)) return;

    setDeletingId(ins.id || `${ins.year}_${ins.month}`);

    try {
      const queryParams = new URLSearchParams();
      if (ins.id) queryParams.set('id', ins.id);
      if (ins.month) queryParams.set('month', ins.month.toString());
      if (ins.year) queryParams.set('year', ins.year.toString());
      if (clientId) queryParams.set('clientId', clientId);

      const res = await fetch(`/api/portal/insights?${queryParams.toString()}`, {
        method: 'DELETE',
      });

      const json = await res.json();
      if (res.ok && json.success) {
        const remaining = Array.isArray(json.data) ? sortInsightsChronologically(json.data) : [];
        if (remaining.length === 0) {
          setActiveInsights([]);
          setSelectedPeriodIndex(0);
        } else {
          setActiveInsights(remaining);
          setSelectedPeriodIndex(Math.max(0, remaining.length - 1));
        }

        showNotification('success', `Deleted insights for ${ins.period} from database.`);
        if (onInsightsUpdated) {
          onInsightsUpdated(remaining);
        }
      } else {
        showNotification('error', json.error || 'Failed to delete insight record.');
      }
    } catch (err: any) {
      showNotification('error', err?.message || 'Network error deleting insight record.');
    } finally {
      setDeletingId(null);
    }
  };

  // Loading state while querying database
  if (isLoadingInsights && activeInsights.length === 0) {
    return (
      <div className="p-8 sm:p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4 text-white shadow-xl animate-pulse">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mx-auto">
          <RefreshCw className="w-6 h-6 animate-spin text-indigo-400" />
        </div>
        <div className="space-y-1.5 max-w-md mx-auto">
          <h4 className="text-base font-bold text-white">Loading Google Performance Insights...</h4>
          <p className="text-xs text-slate-400">
            Fetching verified search, maps, and growth metrics for <strong>{businessName || 'your business'}</strong>...
          </p>
        </div>
      </div>
    );
  }

  // If zero insight records exist, show clean empty state with reload/upload options
  if (!currentInsight) {
    return (
      <div className="p-8 sm:p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-5 text-white shadow-xl">
        <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mx-auto shadow-inner">
          <TrendingUp className="w-7 h-7" />
        </div>
        <div className="space-y-1.5 max-w-md mx-auto">
          <h4 className="text-lg font-bold text-white">
            No Google Business Profile Insights Available
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            {businessName ? (
              <>No monthly search impressions, maps visibility, or customer action records are indexed yet for <strong>{businessName}</strong>.</>
            ) : (
              <>No verified performance metrics are indexed yet. Connect your Google profile or import an authentic monthly CSV report.</>
            )}
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            onClick={() => loadDatabaseInsights()}
            className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            Reload Insights
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={Upload}
            onClick={() => handleOpenReuploadModal()}
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
          initialMonth={modalInitialMonth}
          initialYear={modalInitialYear}
        />
      </div>
    );
  }

  // Calculate current focal month metrics
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

  // Helper for MoM growth calculation
  const calculateMoMGrowth = (metricExtractor: (ins: GbpDailyOrMonthlyInsight) => number) => {
    if (sortedInsights.length < 2) return null;
    const currentVal = metricExtractor(sortedInsights[sortedInsights.length - 1]);
    const prevVal = metricExtractor(sortedInsights[sortedInsights.length - 2]);
    if (prevVal === 0) {
      return currentVal > 0 ? '+100%' : '0.0%';
    }
    const pct = (((currentVal - prevVal) / prevVal) * 100).toFixed(1);
    return Number(pct) >= 0 ? `+${pct}%` : `${pct}%`;
  };

  const directionsMoM = calculateMoMGrowth((i) => i.directions || 0);
  const websiteClicksMoM = calculateMoMGrowth((i) => i.websiteClicks || 0);
  const callsMoM = calculateMoMGrowth((i) => i.calls || 0);
  const messagesMoM = calculateMoMGrowth((i) => i.messages || 0);
  const bookingsMoM = calculateMoMGrowth((i) => i.bookings || 0);

  // Extract chart data points for active metric
  const chartDataPoints = sortedInsights.map((ins, index) => {
    let value = 0;
    if (activeGrowthMetric === 'directions') value = ins.directions || 0;
    else if (activeGrowthMetric === 'websiteClicks') value = ins.websiteClicks || 0;
    else if (activeGrowthMetric === 'calls') value = ins.calls || 0;
    else if (activeGrowthMetric === 'messages') value = ins.messages || 0;
    else if (activeGrowthMetric === 'bookings') value = ins.bookings || 0;
    else if (activeGrowthMetric === 'allActions') {
      value = (ins.directions || 0) + (ins.calls || 0) + (ins.websiteClicks || 0) + (ins.messages || 0) + (ins.bookings || 0);
    } else if (activeGrowthMetric === 'views') {
      value = (ins.totalSearchViews || (ins.searchMobile + ins.searchDesktop) || 0) +
              (ins.totalMapsViews || (ins.mapsMobile + ins.mapsDesktop) || 0);
    }

    const prevInsight = index > 0 ? sortedInsights[index - 1] : null;
    let prevValue = 0;
    if (prevInsight) {
      if (activeGrowthMetric === 'directions') prevValue = prevInsight.directions || 0;
      else if (activeGrowthMetric === 'websiteClicks') prevValue = prevInsight.websiteClicks || 0;
      else if (activeGrowthMetric === 'calls') prevValue = prevInsight.calls || 0;
      else if (activeGrowthMetric === 'messages') prevValue = prevInsight.messages || 0;
      else if (activeGrowthMetric === 'bookings') prevValue = prevInsight.bookings || 0;
      else if (activeGrowthMetric === 'allActions') {
        prevValue = (prevInsight.directions || 0) + (prevInsight.calls || 0) + (prevInsight.websiteClicks || 0) + (prevInsight.messages || 0) + (prevInsight.bookings || 0);
      } else if (activeGrowthMetric === 'views') {
        prevValue = (prevInsight.totalSearchViews || 0) + (prevInsight.totalMapsViews || 0);
      }
    }

    let momChange = '';
    if (index > 0) {
      if (prevValue === 0) momChange = value > 0 ? '+100%' : '0%';
      else {
        const change = (((value - prevValue) / prevValue) * 100).toFixed(1);
        momChange = Number(change) >= 0 ? `+${change}%` : `${change}%`;
      }
    }

    return {
      period: ins.period,
      year: ins.year,
      month: ins.month,
      value,
      momChange,
      insight: ins,
    };
  });

  const maxChartValue = Math.max(10, ...chartDataPoints.map((p) => p.value));

  // Metric configuration for badges and styling
  const metricConfigs: Record<
    GrowthMetricKey,
    { label: string; icon: any; colorClass: string; strokeColor: string; fillColor: string; unit: string }
  > = {
    directions: {
      label: 'Direction Requests',
      icon: MapPin,
      colorClass: 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/30',
      strokeColor: '#f43f5e',
      fillColor: 'rgba(244, 63, 94, 0.15)',
      unit: 'direction requests',
    },
    websiteClicks: {
      label: 'Website Clicks',
      icon: Globe,
      colorClass: 'text-sky-600 dark:text-sky-400 bg-sky-500/10 border-sky-500/30',
      strokeColor: '#0ea5e9',
      fillColor: 'rgba(14, 165, 233, 0.15)',
      unit: 'website clicks',
    },
    calls: {
      label: 'Phone Calls',
      icon: Phone,
      colorClass: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      strokeColor: '#10b981',
      fillColor: 'rgba(16, 185, 129, 0.15)',
      unit: 'phone dials',
    },
    messages: {
      label: 'Messages',
      icon: MessageSquare,
      colorClass: 'text-violet-600 dark:text-violet-400 bg-violet-500/10 border-violet-500/30',
      strokeColor: '#8b5cf6',
      fillColor: 'rgba(139, 92, 246, 0.15)',
      unit: 'chat inquiries',
    },
    bookings: {
      label: 'Bookings',
      icon: Calendar,
      colorClass: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/30',
      strokeColor: '#f59e0b',
      fillColor: 'rgba(245, 158, 11, 0.15)',
      unit: 'appointments',
    },
    allActions: {
      label: 'Total Customer Actions',
      icon: Navigation,
      colorClass: 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
      strokeColor: '#6366f1',
      fillColor: 'rgba(99, 102, 241, 0.15)',
      unit: 'total actions',
    },
    views: {
      label: 'Search & Maps Impressions',
      icon: Search,
      colorClass: 'text-teal-600 dark:text-teal-400 bg-teal-500/10 border-teal-500/30',
      strokeColor: '#14b8a6',
      fillColor: 'rgba(20, 184, 166, 0.15)',
      unit: 'profile impressions',
    },
  };

  const activeConfig = metricConfigs[activeGrowthMetric];

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {actionNotification && (
        <div
          className={`p-3.5 rounded-2xl text-xs font-bold flex items-center justify-between border shadow-lg transition-all animate-in fade-in slide-in-from-top-3 duration-200 ${
            actionNotification.type === 'success'
              ? 'bg-emerald-500 text-white border-emerald-600'
              : 'bg-rose-500 text-white border-rose-600'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{actionNotification.message}</span>
          </div>
          <button onClick={() => setActionNotification(null)} className="text-white/80 hover:text-white text-xs">
            ✕
          </button>
        </div>
      )}

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
                  <Database className="w-3 h-3" />
                  PostgreSQL Verified Data
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 flex items-center gap-2 flex-wrap">
                <span>📍 {currentInsight.address || `${city}, Jharkhand`}</span>
                <span>•</span>
                <span>🕒 Active Focal Month: <strong>{currentInsight.period}</strong></span>
                <span>•</span>
                <span>📊 Tracked Months: <strong>{sortedInsights.length}</strong></span>
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              icon={RefreshCw}
              onClick={() => loadDatabaseInsights()}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs font-bold"
            >
              Reload Data
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={Upload}
              onClick={() => handleOpenReuploadModal()}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs font-bold"
            >
              Upload Month CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={Edit3}
              onClick={() => handleOpenReuploadModal(currentInsight.month, currentInsight.year)}
              className="bg-indigo-900/40 hover:bg-indigo-900/70 text-indigo-200 border-indigo-500/40 text-xs font-bold"
            >
              Re-upload {currentInsight.period}
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={RefreshCw}
              onClick={() => handleOpenReuploadModal()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm text-xs font-bold"
            >
              Google Maps API
            </Button>
          </div>
        </div>

        {/* Historical Month Selector */}
        <div className="pt-2 border-t border-indigo-500/20 flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] text-slate-400 font-semibold shrink-0">Select Focal Month:</span>
          {sortedInsights.map((ins, idx) => (
            <div key={idx} className="flex items-center gap-0.5 shrink-0">
              <button
                onClick={() => setSelectedPeriodIndex(idx)}
                className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  selectedPeriodIndex === idx
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <span>{ins.period}</span>
                <span className="text-[10px] opacity-75">({ins.totalActions} actions)</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 5 Monthly Growth KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Direction Requests Growth */}
        <div
          onClick={() => setActiveGrowthMetric('directions')}
          className={`p-4 rounded-3xl border transition-all cursor-pointer shadow-sm space-y-2 ${
            activeGrowthMetric === 'directions'
              ? 'bg-rose-50/60 dark:bg-rose-950/40 border-rose-400 ring-2 ring-rose-500/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-rose-300'
          }`}
        >
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Direction Requests
            </span>
            <div className="w-7 h-7 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between gap-1">
            <div className="text-2xl font-black text-rose-600 dark:text-rose-400">
              {directions}
            </div>
            {directionsMoM && (
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center">
                <ArrowUpRight className="w-3 h-3" />
                {directionsMoM}
              </span>
            )}
          </div>
          <div className="text-[10px] text-slate-500 truncate">
            Monthly navigation routes
          </div>
        </div>

        {/* Website Clicks Growth */}
        <div
          onClick={() => setActiveGrowthMetric('websiteClicks')}
          className={`p-4 rounded-3xl border transition-all cursor-pointer shadow-sm space-y-2 ${
            activeGrowthMetric === 'websiteClicks'
              ? 'bg-sky-50/60 dark:bg-sky-950/40 border-sky-400 ring-2 ring-sky-500/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-sky-300'
          }`}
        >
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Website Clicks
            </span>
            <div className="w-7 h-7 rounded-xl bg-sky-500/10 text-sky-600 flex items-center justify-center">
              <Globe className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between gap-1">
            <div className="text-2xl font-black text-sky-600 dark:text-sky-400">
              {websiteClicks}
            </div>
            {websiteClicksMoM && (
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center">
                <ArrowUpRight className="w-3 h-3" />
                {websiteClicksMoM}
              </span>
            )}
          </div>
          <div className="text-[10px] text-slate-500 truncate">
            1-page site traffic
          </div>
        </div>

        {/* Phone Calls Growth */}
        <div
          onClick={() => setActiveGrowthMetric('calls')}
          className={`p-4 rounded-3xl border transition-all cursor-pointer shadow-sm space-y-2 ${
            activeGrowthMetric === 'calls'
              ? 'bg-emerald-50/60 dark:bg-emerald-950/40 border-emerald-400 ring-2 ring-emerald-500/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-300'
          }`}
        >
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Phone Calls
            </span>
            <div className="w-7 h-7 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <Phone className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between gap-1">
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {calls}
            </div>
            {callsMoM && (
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center">
                <ArrowUpRight className="w-3 h-3" />
                {callsMoM}
              </span>
            )}
          </div>
          <div className="text-[10px] text-slate-500 truncate">
            Direct phone dials
          </div>
        </div>

        {/* Messages Growth */}
        <div
          onClick={() => setActiveGrowthMetric('messages')}
          className={`p-4 rounded-3xl border transition-all cursor-pointer shadow-sm space-y-2 ${
            activeGrowthMetric === 'messages'
              ? 'bg-violet-50/60 dark:bg-violet-950/40 border-violet-400 ring-2 ring-violet-500/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-violet-300'
          }`}
        >
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Messages
            </span>
            <div className="w-7 h-7 rounded-xl bg-violet-500/10 text-violet-600 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between gap-1">
            <div className="text-2xl font-black text-violet-600 dark:text-violet-400">
              {messages}
            </div>
            {messagesMoM && (
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center">
                <ArrowUpRight className="w-3 h-3" />
                {messagesMoM}
              </span>
            )}
          </div>
          <div className="text-[10px] text-slate-500 truncate">
            Business chat inquiries
          </div>
        </div>

        {/* Bookings Growth */}
        <div
          onClick={() => setActiveGrowthMetric('bookings')}
          className={`p-4 rounded-3xl border transition-all cursor-pointer shadow-sm space-y-2 ${
            activeGrowthMetric === 'bookings'
              ? 'bg-amber-50/60 dark:bg-amber-950/40 border-amber-400 ring-2 ring-amber-500/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-amber-300'
          }`}
        >
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Bookings
            </span>
            <div className="w-7 h-7 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between gap-1">
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
              {bookings}
            </div>
            {bookingsMoM && (
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center">
                <ArrowUpRight className="w-3 h-3" />
                {bookingsMoM}
              </span>
            )}
          </div>
          <div className="text-[10px] text-slate-500 truncate">
            Direct appointments
          </div>
        </div>
      </div>

      {/* MONTHLY GROWTH INTERACTIVE CHART SECTION */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900">
                <BarChart3 className="w-4 h-4" />
              </span>
              <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
                Monthly Growth Trend Chart
              </h4>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Tracking authentic month-by-month growth for <strong>{activeConfig.label}</strong> across Google Business Profile.
            </p>
          </div>

          {/* Metric Selector Tabs */}
          <div className="flex flex-wrap gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs font-bold">
            <button
              onClick={() => setActiveGrowthMetric('directions')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                activeGrowthMetric === 'directions'
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Directions</span>
            </button>

            <button
              onClick={() => setActiveGrowthMetric('websiteClicks')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                activeGrowthMetric === 'websiteClicks'
                  ? 'bg-sky-500 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Website Clicks</span>
            </button>

            <button
              onClick={() => setActiveGrowthMetric('calls')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                activeGrowthMetric === 'calls'
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Calls</span>
            </button>

            <button
              onClick={() => setActiveGrowthMetric('messages')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                activeGrowthMetric === 'messages'
                  ? 'bg-violet-500 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Messages</span>
            </button>

            <button
              onClick={() => setActiveGrowthMetric('bookings')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                activeGrowthMetric === 'bookings'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Bookings</span>
            </button>

            <button
              onClick={() => setActiveGrowthMetric('allActions')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                activeGrowthMetric === 'allActions'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>All Actions</span>
            </button>

            <button
              onClick={() => setActiveGrowthMetric('views')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                activeGrowthMetric === 'views'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search vs Maps Views</span>
            </button>
          </div>
        </div>

        {/* SVG Monthly Growth Chart */}
        <div className="relative p-6 rounded-3xl bg-slate-950 text-white border border-slate-800 shadow-inner overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: activeConfig.strokeColor }} />
              <span className="text-xs font-bold text-slate-200">
                {activeConfig.label} ({chartDataPoints.length} Month{chartDataPoints.length > 1 ? 's' : ''} Synced in Database)
              </span>
            </div>
            {chartDataPoints.length > 1 && (
              <span className="text-[11px] font-extrabold text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3" />
                Latest MoM Growth: {chartDataPoints[chartDataPoints.length - 1].momChange || '+0.0%'}
              </span>
            )}
          </div>

          {/* Chart Canvas Area */}
          <div className="h-64 w-full flex flex-col justify-end">
            <svg className="w-full h-48 overflow-visible" viewBox="0 0 800 200" preserveAspectRatio="none">
              <defs>
                <linearGradient id={`gradient-${activeGrowthMetric}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={activeConfig.strokeColor} stopOpacity="0.4" />
                  <stop offset="100%" stopColor={activeConfig.strokeColor} stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0, 50, 100, 150].map((yVal, i) => (
                <line
                  key={i}
                  x1="40"
                  y1={yVal}
                  x2="780"
                  y2={yVal}
                  stroke="#334155"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                  opacity="0.3"
                />
              ))}

              {/* Multi-Point Trajectory Area and Line */}
              {(() => {
                const totalPoints = chartDataPoints.length;
                if (totalPoints === 1) {
                  // Single Month Baseline Rendering
                  const p = chartDataPoints[0];
                  const x = 400;
                  const y = 160 - (p.value / Math.max(1, maxChartValue)) * 130;
                  return (
                    <g>
                      <line x1="40" y1={y} x2="780" y2={y} stroke={activeConfig.strokeColor} strokeWidth="2" strokeDasharray="3 3" opacity="0.4" />
                      <circle cx={x} cy={y} r="8" fill={activeConfig.strokeColor} className="animate-pulse" />
                      <circle cx={x} cy={y} r="4" fill="#ffffff" />
                      <text x={x} y={y - 14} fill="#ffffff" fontSize="13" fontWeight="bold" textAnchor="middle">
                        {p.value} {activeConfig.unit} ({p.period})
                      </text>
                    </g>
                  );
                }

                // Multi-Month SVG Points
                const step = totalPoints > 1 ? (740 - 60) / (totalPoints - 1) : 0;
                const coords = chartDataPoints.map((p, idx) => {
                  const x = 60 + idx * step;
                  const y = 170 - (p.value / Math.max(1, maxChartValue)) * 140;
                  return { x, y, p };
                });

                const pathData = coords.reduce((acc, c, idx) => {
                  return `${acc} ${idx === 0 ? 'M' : 'L'} ${c.x} ${c.y}`;
                }, '');

                const areaData = `${pathData} L ${coords[coords.length - 1].x} 190 L ${coords[0].x} 190 Z`;

                return (
                  <g>
                    <path d={areaData} fill={`url(#gradient-${activeGrowthMetric})`} />
                    <path d={pathData} fill="none" stroke={activeConfig.strokeColor} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                    {coords.map((c, idx) => (
                      <g key={idx} className="cursor-pointer">
                        <circle cx={c.x} cy={c.y} r="7" fill={activeConfig.strokeColor} />
                        <circle cx={c.x} cy={c.y} r="3.5" fill="#ffffff" />
                        <text x={c.x} y={c.y - 12} fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle">
                          {c.p.value}
                        </text>
                        {c.p.momChange && (
                          <text x={c.x} y={c.y - 26} fill="#34d399" fontSize="9" fontWeight="bold" textAnchor="middle">
                            {c.p.momChange}
                          </text>
                        )}
                      </g>
                    ))}
                  </g>
                );
              })()}
            </svg>

            {/* X-Axis Month Labels */}
            <div className="flex justify-between items-center px-4 pt-3 border-t border-slate-800 text-[11px] font-bold text-slate-400">
              {chartDataPoints.map((p, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedPeriodIndex(idx)}
                  className={`cursor-pointer transition-colors px-2 py-1 rounded-lg ${
                    selectedPeriodIndex === idx
                      ? 'text-white bg-indigo-600/40 border border-indigo-500/40'
                      : 'hover:text-slate-200'
                  }`}
                >
                  {p.period}
                </div>
              ))}
            </div>
          </div>

          {/* Prompt banner */}
          <div className="mt-4 p-3 rounded-2xl bg-indigo-950/40 border border-indigo-800/40 text-xs text-indigo-200 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>
                All months are saved directly to your PostgreSQL database. You can upload new months, re-upload/overwrite, or delete any record at any time.
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleOpenReuploadModal()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white border-0 text-[10px] font-bold py-1 px-2.5 h-auto shrink-0"
            >
              + Add / Upload Month
            </Button>
          </div>
        </div>

        {/* Month-by-Month Detailed Growth Table */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h5 className="font-extrabold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-indigo-500" />
              Database Performance Log & Actions
            </h5>
            <span className="text-[11px] font-bold text-slate-500">
              {sortedInsights.length} reporting period{sortedInsights.length > 1 ? 's' : ''} stored
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-[10px] font-extrabold uppercase text-slate-400">
                <tr>
                  <th className="py-3 px-4">Reporting Month</th>
                  <th className="py-3 px-3 text-center">Search Views</th>
                  <th className="py-3 px-3 text-center">Maps Views</th>
                  <th className="py-3 px-3 text-center">Directions</th>
                  <th className="py-3 px-3 text-center">Website Clicks</th>
                  <th className="py-3 px-3 text-center">Calls</th>
                  <th className="py-3 px-3 text-center">Messages</th>
                  <th className="py-3 px-3 text-center">Bookings</th>
                  <th className="py-3 px-3 text-center">Total Actions</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {sortedInsights.map((ins, idx) => {
                  const isCurrent = selectedPeriodIndex === idx;
                  const sViews = ins.totalSearchViews || (ins.searchMobile + ins.searchDesktop) || 0;
                  const mViews = ins.totalMapsViews || (ins.mapsMobile + ins.mapsDesktop) || 0;
                  const tActions = (ins.directions || 0) + (ins.calls || 0) + (ins.websiteClicks || 0) + (ins.messages || 0) + (ins.bookings || 0);
                  const isDeleting = deletingId === ins.id || deletingId === `${ins.year}_${ins.month}`;

                  return (
                    <tr
                      key={idx}
                      onClick={() => setSelectedPeriodIndex(idx)}
                      className={`cursor-pointer transition-colors ${
                        isCurrent
                          ? 'bg-indigo-50/50 dark:bg-indigo-950/30 font-bold'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      <td className="py-3 px-4 font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                        <span>{ins.period}</span>
                        {isCurrent && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] bg-indigo-600 text-white font-bold">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center text-slate-700 dark:text-slate-300 font-semibold">
                        {sViews}
                      </td>
                      <td className="py-3 px-3 text-center text-slate-700 dark:text-slate-300 font-semibold">
                        {mViews}
                      </td>
                      <td className="py-3 px-3 text-center font-extrabold text-rose-600 dark:text-rose-400">
                        {ins.directions || 0}
                      </td>
                      <td className="py-3 px-3 text-center font-extrabold text-sky-600 dark:text-sky-400">
                        {ins.websiteClicks || 0}
                      </td>
                      <td className="py-3 px-3 text-center font-extrabold text-emerald-600 dark:text-emerald-400">
                        {ins.calls || 0}
                      </td>
                      <td className="py-3 px-3 text-center font-semibold text-violet-600 dark:text-violet-400">
                        {ins.messages || 0}
                      </td>
                      <td className="py-3 px-3 text-center font-semibold text-amber-600 dark:text-amber-400">
                        {ins.bookings || 0}
                      </td>
                      <td className="py-3 px-3 text-center font-black text-indigo-600 dark:text-indigo-400">
                        {tActions}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          {/* Re-upload / Overwrite button */}
                          <button
                            title={`Re-upload or overwrite ${ins.period} CSV`}
                            onClick={() => handleOpenReuploadModal(ins.month, ins.year)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete button */}
                          <button
                            title={`Delete ${ins.period} data`}
                            disabled={isDeleting}
                            onClick={(e) => handleDeleteInsight(ins, e)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 2-Column Visual Breakdown Grid for Selected Focal Month */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Platform & Device Breakdown */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Search className="w-4 h-4 text-indigo-500" />
                  <span>Platform Impressions Breakdown ({currentInsight.period})</span>
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
                <span>Customer Actions ({currentInsight.period})</span>
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
        onClose={() => {
          setIsUploadModalOpen(false);
          setModalInitialMonth(undefined);
          setModalInitialYear(undefined);
        }}
        onInsightsSaved={handleInsightsSaved}
        businessName={businessName}
        clientId={clientId}
        initialMonth={modalInitialMonth}
        initialYear={modalInitialYear}
      />
    </div>
  );
};
