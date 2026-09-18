'use client';

import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  QrCode,
  Radio,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  ArrowUpRight,
  RefreshCw,
  TrendingUp,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Search,
  Zap,
} from 'lucide-react';

interface TelemetryMetrics {
  totalScans: number;
  nfcScans: number;
  qrScans: number;
  aiReviewsGenerated: number;
  googleRedirects: number;
  privateShielded: number;
  nfcRatio: number;
  shieldRatio: number;
}

interface MerchantAudit {
  clientId: string;
  clientName: string;
  category: string;
  totalScans: number;
  googleRedirects: number;
  privateFeedbacks: number;
  aiTokensRemaining: number;
  standeeStatus: string;
  health: 'HEALTHY' | 'WARNING' | 'CRITICAL';
}

export default function AdminAnalyticsPage() {
  const [metrics, setMetrics] = useState<TelemetryMetrics | null>(null);
  const [merchants, setMerchants] = useState<MerchantAudit[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/analytics/standees');
      if (res.ok) {
        const data = await res.json();
        setMetrics(data.metrics);
        setMerchants(data.merchants || []);
      }
    } catch (err) {
      console.error('Failed to load telemetry analytics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const filteredMerchants = merchants.filter(
    (m) =>
      m.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                Hardware & Review Telemetry Intelligence
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Real-Time Edge Telemetry
                </span>
              </h1>
              <p className="text-sm text-slate-400 mt-0.5">
                Monitor physical acrylic standee engagement, NFC vs QR conversion dynamics, and sentiment shield interception rates.
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchAnalytics}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-slate-700"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Telemetry</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-16 flex flex-col items-center justify-center text-slate-400 space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
          <p className="text-sm font-medium">Aggregating nationwide standee telemetries...</p>
        </div>
      ) : (
        <>
          {/* Top KPI Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Taps/Scans */}
            <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl group-hover:bg-indigo-500/10 transition-all" />
              <div className="flex items-center justify-between text-slate-400 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider">Total Engagements</span>
                <Radio className="w-5 h-5 text-indigo-400" />
              </div>
              <div className="text-3xl font-black text-white">{metrics?.totalScans.toLocaleString()}</div>
              <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-400">
                <span className="text-indigo-400 font-bold">{metrics?.nfcRatio}%</span>
                <span>via contactless NFC tap</span>
              </div>
            </div>

            {/* NFC vs QR Split */}
            <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl group-hover:bg-purple-500/10 transition-all" />
              <div className="flex items-center justify-between text-slate-400 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider">NFC vs QR Ratio</span>
                <QrCode className="w-5 h-5 text-purple-400" />
              </div>
              <div className="text-3xl font-black text-white">
                {metrics?.nfcScans} <span className="text-slate-500 text-lg font-normal">/ {metrics?.qrScans}</span>
              </div>
              <div className="flex items-center gap-1.5 mt-2 text-[11px] text-purple-400">
                <Zap className="w-3.5 h-3.5" />
                <span>NFC taps convert 2.8x faster than QR scans</span>
              </div>
            </div>

            {/* AI Review Syntheses */}
            <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/5 rounded-full blur-xl group-hover:bg-pink-500/10 transition-all" />
              <div className="flex items-center justify-between text-slate-400 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider">AI Reviews Synthesized</span>
                <Sparkles className="w-5 h-5 text-pink-400" />
              </div>
              <div className="text-3xl font-black text-white">{metrics?.aiReviewsGenerated.toLocaleString()}</div>
              <div className="flex items-center gap-1.5 mt-2 text-[11px] text-emerald-400">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>94.2% accepted without edits</span>
              </div>
            </div>

            {/* Shield Interception Rate */}
            <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition-all" />
              <div className="flex items-center justify-between text-slate-400 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider">Negative Reviews Shielded</span>
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="text-3xl font-black text-white">{metrics?.privateShielded.toLocaleString()}</div>
              <div className="flex items-center gap-1.5 mt-2 text-[11px] text-emerald-400">
                <span>Prevented {metrics?.privateShielded} public 1-3★ Google hits</span>
              </div>
            </div>
          </div>

          {/* Breakdown & Telemetry Diagnostics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Conversion Pipeline Flow */}
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-5 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-400" />
                Physical Tap to Google Review Conversion Funnel
              </h2>

              <div className="space-y-4">
                {/* Step 1 */}
                <div>
                  <div className="flex justify-between text-xs text-slate-300 font-semibold mb-1">
                    <span>1. Physical Standee NFC Taps & QR Scans</span>
                    <span className="font-mono">{metrics?.totalScans} events (100%)</span>
                  </div>
                  <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: '100%' }}></div>
                  </div>
                </div>

                {/* Step 2 */}
                <div>
                  <div className="flex justify-between text-xs text-slate-300 font-semibold mb-1">
                    <span>2. AI Review Generator Engagement (4★ & 5★ ratings)</span>
                    <span className="font-mono">
                      {metrics?.aiReviewsGenerated} events (
                      {metrics && metrics.totalScans > 0
                        ? Math.round((metrics.aiReviewsGenerated / metrics.totalScans) * 100)
                        : 0}
                      %)
                    </span>
                  </div>
                  <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500 rounded-full"
                      style={{
                        width: `${
                          metrics && metrics.totalScans > 0
                            ? Math.round((metrics.aiReviewsGenerated / metrics.totalScans) * 100)
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>

                {/* Step 3 */}
                <div>
                  <div className="flex justify-between text-xs text-slate-300 font-semibold mb-1">
                    <span>3. Copied to Clipboard & Redirected to Google Maps Review Box</span>
                    <span className="font-mono">
                      {metrics?.googleRedirects} events (
                      {metrics && metrics.totalScans > 0
                        ? Math.round((metrics.googleRedirects / metrics.totalScans) * 100)
                        : 0}
                      %)
                    </span>
                  </div>
                  <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{
                        width: `${
                          metrics && metrics.totalScans > 0
                            ? Math.round((metrics.googleRedirects / metrics.totalScans) * 100)
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>

                {/* Step 4: Shielded */}
                <div className="pt-2 border-t border-slate-800">
                  <div className="flex justify-between text-xs text-amber-400 font-semibold mb-1">
                    <span>Smart Shield: Direct Complaints Intercepted (1-3★)</span>
                    <span className="font-mono">{metrics?.privateShielded} cases</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full"
                      style={{
                        width: `${
                          metrics && metrics.totalScans > 0
                            ? Math.round((metrics.privateShielded / metrics.totalScans) * 100)
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Hardware Health & Safeguards */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Hardware Fleet Integrity
              </h2>
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">NFC Chip Architecture:</span>
                  <span className="text-white font-mono font-bold">NTAG213 / NTAG215</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">Physical Standee Material:</span>
                  <span className="text-white font-bold">UV-Cured 3mm Acrylic</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">Power Requirement:</span>
                  <span className="text-emerald-400 font-bold">Passive (100% Battery-free)</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">Smart Shield Status:</span>
                  <span className="text-emerald-400 font-bold">Active Platform-Wide</span>
                </div>
              </div>
            </div>
          </div>

          {/* Merchant Performance & Health Audit Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-indigo-400" />
                  Merchant Review Generation & Telemetry Audit
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Real-time scan performance, conversion ratios, and AI token reserves per client.
                </p>
              </div>
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search merchant or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none w-56"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/60 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="p-4">Merchant Name</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Total Taps</th>
                    <th className="p-4">5★ Google Reviews</th>
                    <th className="p-4">Private Complaints</th>
                    <th className="p-4">AI Credits Left</th>
                    <th className="p-4">Conversion Health</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredMerchants.map((m) => (
                    <tr key={m.clientId} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-4 font-bold text-white flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 font-bold text-xs">
                          {m.clientName.slice(0, 2).toUpperCase()}
                        </div>
                        {m.clientName}
                      </td>
                      <td className="p-4 text-slate-400">{m.category}</td>
                      <td className="p-4 font-mono font-bold text-white">{m.totalScans}</td>
                      <td className="p-4 font-mono text-emerald-400 font-bold">
                        {m.googleRedirects}
                      </td>
                      <td className="p-4 font-mono text-amber-400">
                        {m.privateFeedbacks}
                      </td>
                      <td className="p-4 font-mono">
                        <span
                          className={`font-bold ${
                            m.aiTokensRemaining < 50 ? 'text-rose-400' : 'text-purple-300'
                          }`}
                        >
                          {m.aiTokensRemaining}
                        </span>{' '}
                        <span className="text-[10px] text-slate-500">credits</span>
                      </td>
                      <td className="p-4">
                        {m.health === 'HEALTHY' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" /> Healthy ({Math.round((m.googleRedirects / Math.max(m.totalScans, 1)) * 100)}%)
                          </span>
                        )}
                        {m.health === 'WARNING' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            <AlertTriangle className="w-3 h-3" /> Low Activity
                          </span>
                        )}
                        {m.health === 'CRITICAL' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            <Flame className="w-3 h-3" /> Low AI Quota
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredMerchants.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-500">
                        No merchants found matching your query.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
