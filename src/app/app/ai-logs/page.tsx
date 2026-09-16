'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Coins,
  Cpu,
  DollarSign,
  TrendingUp,
  Search,
  Filter,
  Download,
  Plus,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Building,
  User,
  ShieldCheck,
  MapPin,
  Globe,
  Layers,
  Activity,
  ArrowUpRight,
} from 'lucide-react';
import { Button, Input, Modal, Badge } from '@/components/ui';
import { formatINR } from '@/lib/utils';

export default function AiLogsDashboardPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({
    totalRequests: 0,
    totalAiCalls: 0,
    totalGoogleApiCalls: 0,
    totalPromptTokens: 0,
    totalCompletionTokens: 0,
    totalTokens: 0,
    totalCostUsd: 0,
    totalCostInr: 0,
    totalGoogleCostUsd: 0,
    totalGoogleCostInr: 0,
    totalAiCostUsd: 0,
    totalAiCostInr: 0,
    totalCreditsDeducted: 0,
  });
  const [clients, setClients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [clientFilter, setClientFilter] = useState('ALL');

  // Credit Refill Modal
  const [isRefillModalOpen, setIsRefillModalOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [refillCredits, setRefillCredits] = useState(50);
  const [refillNote, setRefillNote] = useState('Bonus Support Pack');
  const [isSubmittingRefill, setIsSubmittingRefill] = useState(false);
  const [refillSuccessMsg, setRefillSuccessMsg] = useState<string | null>(null);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/ai-logs');
      const data = await res.json();
      if (data.success) {
        setLogs(data.data || []);
        setSummary(data.summary || {});
        setClients(data.clients || []);
        if (data.clients && data.clients.length > 0 && !selectedClientId) {
          setSelectedClientId(data.clients[0].id);
        }
      }
    } catch (e) {
      console.error('Error fetching AI & API logs:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleRefillCredits = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientId || refillCredits <= 0) return;

    setIsSubmittingRefill(true);
    setRefillSuccessMsg(null);

    try {
      const res = await fetch('/api/admin/ai-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: selectedClientId,
          creditsToAdd: Number(refillCredits),
          note: refillNote,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setRefillSuccessMsg(data.message || 'Credits granted successfully!');
        fetchLogs();
        setTimeout(() => {
          setRefillSuccessMsg(null);
          setIsRefillModalOpen(false);
        }, 2000);
      } else {
        alert(data.error || 'Failed to grant credits.');
      }
    } catch (err: any) {
      alert(err.message || 'Error granting credits.');
    } finally {
      setIsSubmittingRefill(false);
    }
  };

  const handleExportCsv = () => {
    if (logs.length === 0) return;

    const headers = [
      'Log ID',
      'Timestamp',
      'Client / User Name',
      'Business Client',
      'Service Provider',
      'Action Code',
      'Feature Description',
      'Credits Deducted',
      'Calls / Prompt Tokens',
      'Completion Tokens',
      'Total Tokens/Calls',
      'GCP Infrastructure Cost USD',
      'GCP Infrastructure Cost INR',
      'Status',
    ];

    const rows = logs.map((l) => {
      const isGoogle = (l.action && l.action.startsWith('GOOGLE_')) || (l.metadata?.apiProvider && String(l.metadata.apiProvider).includes('Google'));
      return [
        l.id,
        new Date(l.createdAt).toLocaleString(),
        `"${l.userName || ''}"`,
        `"${l.businessName || ''}"`,
        isGoogle ? 'Google Maps & Places Platform' : 'Google Cloud Gemini AI',
        l.action,
        `"${l.featureName || ''}"`,
        l.creditsDeducted,
        l.promptTokens || 0,
        l.completionTokens || 0,
        l.totalTokens || 0,
        l.estimatedCostUsd || 0,
        l.estimatedCostInr || 0,
        l.status,
      ];
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `digital_ranchi_api_expense_audit_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredLogs = logs.filter((l) => {
    const matchesSearch =
      (l.userName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.businessName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.featureName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.action || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesAction =
      actionFilter === 'ALL' ||
      (actionFilter === 'GOOGLE_ALL' && (l.action.startsWith('GOOGLE_') || l.metadata?.apiProvider?.includes('Google'))) ||
      (actionFilter === 'AI_ALL' && !l.action.startsWith('GOOGLE_')) ||
      l.action.toUpperCase() === actionFilter.toUpperCase();

    const matchesClient =
      clientFilter === 'ALL' ||
      l.clientId === clientFilter ||
      (l.businessName && clients.find((c) => c.id === clientFilter)?.businessName === l.businessName);

    return matchesSearch && matchesAction && matchesClient;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Gemini 1.5 Flash Rate ($0.075 / 1M tok)
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 flex items-center gap-1">
              <MapPin className="w-3 h-3" /> Google Maps & Places API ($17 - $32 / 1K calls)
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Live INR Rate: ₹86.5/USD
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white mt-2 flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-600" />
            AI & Google Maps Platform API Expense Audit Monitor
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor real-time Google Places synchronization, Google Maps lookups, Gemini AI generations, request counts, and exact infrastructure billing per client.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            onClick={fetchLogs}
            disabled={isLoading}
          >
            Refresh
          </Button>

          <Button
            variant="outline"
            size="sm"
            icon={Download}
            onClick={handleExportCsv}
            disabled={logs.length === 0}
          >
            Export Expense CSV
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => setIsRefillModalOpen(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-600/30"
          >
            Refill Client AI Credits
          </Button>
        </div>
      </div>

      {/* KPI Cards: 4 Summary Metric Columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Google Maps / Places API Usage */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Google Maps & Places Calls
            </span>
            <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/50 text-sky-600">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-sky-600 dark:text-sky-400">
            {summary.totalGoogleApiCalls ?? 0} <span className="text-xs font-semibold text-slate-400">calls</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium pt-1 border-t border-slate-100 dark:border-slate-800">
            <span>Places Sync & Lookups</span>
            <span className="text-sky-600 font-bold">₹{Number(summary.totalGoogleCostInr || 0).toFixed(2)}</span>
          </div>
        </div>

        {/* Card 2: Gemini AI Invocations */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Gemini AI Invocations
            </span>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400">
            {summary.totalAiCalls ?? 0} <span className="text-xs font-semibold text-slate-400">prompts</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium pt-1 border-t border-slate-100 dark:border-slate-800">
            <span>{summary.totalCreditsDeducted ?? 0} Wallet Credits</span>
            <span className="text-purple-600 font-bold">₹{Number(summary.totalAiCostInr || 0).toFixed(2)}</span>
          </div>
        </div>

        {/* Card 3: Total AI Tokens */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Tokens Consumed
            </span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
            {(summary.totalTokens || 0).toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 font-medium pt-1 border-t border-slate-100 dark:border-slate-800 truncate">
            {(summary.totalPromptTokens || 0).toLocaleString()} in / {(summary.totalCompletionTokens || 0).toLocaleString()} out
          </div>
        </div>

        {/* Card 4: Total Combined Infrastructure Expense */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total GCP Infra Expense
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            ₹{summary.totalCostInr ?? 0}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium pt-1 border-t border-slate-100 dark:border-slate-800">
            <span>Combined Total</span>
            <span className="text-emerald-600 font-bold">${summary.totalCostUsd ?? 0} USD</span>
          </div>
        </div>
      </div>

      {/* Per-Client Usage & Expense Breakdown Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Building className="w-4 h-4 text-purple-600" />
              Client-Wise AI, Google Maps & Infrastructure Cost Breakdown
            </h3>
            <p className="text-xs text-slate-500">
              Complete breakdown by registered business: Google Maps API calls, Gemini AI requests, wallet balances, and exact GCP billing.
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
            {clients.length} Registered Businesses
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950 border-y border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase tracking-wider text-slate-400">
              <tr>
                <th className="py-2.5 px-3">Business Client</th>
                <th className="py-2.5 px-3">AI Wallet</th>
                <th className="py-2.5 px-3">SaaS Tier</th>
                <th className="py-2.5 px-3">Google Maps Calls</th>
                <th className="py-2.5 px-3">Gemini AI Calls</th>
                <th className="py-2.5 px-3">Tokens Used</th>
                <th className="py-2.5 px-3">Total Infra Expense (₹)</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {clients.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-slate-400">
                    No client accounts registered yet.
                  </td>
                </tr>
              ) : (
                clients.map((c) => {
                  const clientLogs = logs.filter(
                    (l) => l.clientId === c.id || (l.businessName && l.businessName === c.businessName)
                  );
                  
                  // Separate Google Maps vs Gemini AI logs
                  const mapsLogs = clientLogs.filter((l) => (l.action && l.action.startsWith('GOOGLE_')) || l.metadata?.apiProvider?.includes('Google'));
                  const aiLogs = clientLogs.filter((l) => !mapsLogs.includes(l));

                  const totalMapsCalls = mapsLogs.reduce((acc, l) => acc + (l.promptTokens || l.totalTokens || 1), 0);
                  const totalAiCalls = aiLogs.length;
                  const totalClientTokens = aiLogs.reduce((acc, l) => acc + (l.totalTokens || 0), 0);
                  const totalClientCostInr = clientLogs.reduce((acc, l) => acc + (l.estimatedCostInr || 0), 0);
                  const totalClientCostUsd = clientLogs.reduce((acc, l) => acc + (l.estimatedCostUsd || 0), 0);
                  
                  const credits = c.aiCreditBalance ?? 20;
                  const isLow = credits <= 5;
                  const isSelected = clientFilter === c.id;

                  return (
                    <tr
                      key={c.id}
                      className={`hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors ${
                        isSelected ? 'bg-purple-50/50 dark:bg-purple-950/20' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          {c.businessName}
                        </div>
                        <span className="text-[10px] text-slate-400">{c.email}</span>
                      </td>

                      <td className="py-2.5 px-3">
                        <span
                          className={`font-black inline-flex items-center gap-1 ${
                            credits === 0
                              ? 'text-rose-600'
                              : isLow
                              ? 'text-amber-600'
                              : 'text-purple-600 dark:text-purple-300'
                          }`}
                        >
                          <Sparkles className="w-3 h-3" />
                          {credits} Cr {credits === 0 ? '(0 left)' : ''}
                        </span>
                      </td>

                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            c.subscriptionStatus === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200'
                              : 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200'
                          }`}
                        >
                          {c.subscriptionStatus === 'ACTIVE' ? 'Active SaaS (₹1.5k)' : '14-Day Free Demo'}
                        </span>
                      </td>

                      <td className="py-2.5 px-3">
                        <span className="font-bold text-sky-600 dark:text-sky-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {totalMapsCalls} calls
                        </span>
                      </td>

                      <td className="py-2.5 px-3">
                        <span className="font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          {totalAiCalls} calls
                        </span>
                      </td>

                      <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
                        {totalClientTokens.toLocaleString()} tok
                      </td>

                      <td className="py-2.5 px-3">
                        <div className="font-black text-emerald-600 dark:text-emerald-400">
                          ₹{totalClientCostInr.toFixed(4)}
                        </div>
                        <span className="text-[10px] text-slate-400">
                          (${totalClientCostUsd.toFixed(4)})
                        </span>
                      </td>

                      <td className="py-2.5 px-3 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setClientFilter(isSelected ? 'ALL' : c.id)}
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                              isSelected
                                ? 'bg-purple-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                            }`}
                          >
                            {isSelected ? 'Showing Logs' : 'Filter Logs'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedClientId(c.id);
                              setRefillCredits(50);
                              setRefillNote(`Topup for ${c.businessName}`);
                              setIsRefillModalOpen(true);
                            }}
                            className="px-2 py-1 rounded-lg text-[10px] font-bold bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 hover:bg-purple-100 border border-purple-200 dark:border-purple-800"
                          >
                            +Refill
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full md:w-auto flex-1">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search client, business, or API action..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <select
            value={clientFilter}
            onChange={(e) => setClientFilter(e.target.value)}
            className="text-xs p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-medium max-w-[200px]"
          >
            <option value="ALL">All Client Accounts</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.businessName} ({c.aiCreditBalance ?? 20}cr)
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {[
            { id: 'ALL', label: 'All Logs' },
            { id: 'GOOGLE_ALL', label: '🗺️ Google Maps/Places' },
            { id: 'AI_ALL', label: '✨ Gemini AI' },
            { id: 'GOOGLE_PLACES_SYNC', label: 'GBP Sync' },
            { id: 'GOOGLE_REVIEWS_API', label: 'Live Review Reply' },
            { id: 'REVIEW_REPLY', label: 'AI Reviews' },
            { id: 'SITE_BUILDER_AI_FILL', label: 'AI Site Builder' },
            { id: 'AI_TEMPLATE_SYNTHESIS', label: 'AI Posters' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActionFilter(item.id)}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                actionFilter === item.id
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase tracking-wider text-slate-400">
              <tr>
                <th className="py-3 px-4">Client / User</th>
                <th className="py-3 px-4">Provider / Action</th>
                <th className="py-3 px-4">Feature Details</th>
                <th className="py-3 px-4">Wallet Impact</th>
                <th className="py-3 px-4">Usage Volume (Tokens / Calls)</th>
                <th className="py-3 px-4">GCP Expense ($ / ₹)</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Loading API & AI usage logs...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No usage logs found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const isGoogle = (log.action && log.action.startsWith('GOOGLE_')) || (log.metadata?.apiProvider && String(log.metadata.apiProvider).includes('Google'));

                  return (
                    <tr
                      key={log.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      {/* Client / User */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {log.businessName || 'Business Client'}
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {log.userName || 'Portal User'}
                        </span>
                      </td>

                      {/* Provider / Action Badge */}
                      <td className="py-3 px-4">
                        {isGoogle ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-200 dark:border-sky-800 inline-flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {log.action}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800 inline-flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            {log.action}
                          </span>
                        )}
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {isGoogle ? 'Google Maps Platform' : 'Gemini 1.5 Flash'}
                        </div>
                      </td>

                      {/* Feature Details */}
                      <td className="py-3 px-4">
                        <div className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 max-w-xs truncate">
                          {log.featureName}
                        </div>
                        {log.metadata?.apiType && (
                          <span className="text-[10px] text-slate-400 block font-mono">
                            Type: {log.metadata.apiType}
                          </span>
                        )}
                      </td>

                      {/* Wallet Impact */}
                      <td className="py-3 px-4">
                        <span
                          className={`font-black ${
                            log.creditsDeducted < 0
                              ? 'text-emerald-600'
                              : log.creditsDeducted > 0
                              ? 'text-rose-600'
                              : 'text-slate-400'
                          }`}
                        >
                          {log.creditsDeducted > 0
                            ? `-${log.creditsDeducted} Cr`
                            : log.creditsDeducted < 0
                            ? `+${Math.abs(log.creditsDeducted)} Cr`
                            : '0 Cr (Infra)'}
                        </span>
                      </td>

                      {/* Usage Volume */}
                      <td className="py-3 px-4">
                        {isGoogle ? (
                          <div>
                            <div className="font-bold text-sky-700 dark:text-sky-300">
                              {log.promptTokens || log.totalTokens || 1} API Request{((log.promptTokens || log.totalTokens || 1) > 1) ? 's' : ''}
                            </div>
                            <span className="text-[10px] text-slate-400">
                              Official GCP Rate
                            </span>
                          </div>
                        ) : (
                          <div>
                            <div className="font-bold text-slate-800 dark:text-slate-200">
                              {(log.totalTokens || 0).toLocaleString()} tok
                            </div>
                            <span className="text-[10px] text-slate-400">
                              {log.promptTokens || 0} in / {log.completionTokens || 0} out
                            </span>
                          </div>
                        )}
                      </td>

                      {/* GCP Expense */}
                      <td className="py-3 px-4">
                        <div className="font-black text-emerald-600 dark:text-emerald-400">
                          ₹{log.estimatedCostInr || 0}
                        </div>
                        <span className="text-[10px] text-slate-400">
                          ${log.estimatedCostUsd || 0} USD
                        </span>
                      </td>

                      {/* Timestamp */}
                      <td className="py-3 px-4 text-slate-500 text-[11px] whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        {log.status === 'SUCCESS' ? (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200">
                            Success
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200">
                            {log.status}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Credit Refill Modal */}
      <Modal
        isOpen={isRefillModalOpen}
        onClose={() => setIsRefillModalOpen(false)}
        title="Admin Client AI Wallet Refill"
      >
        <form onSubmit={handleRefillCredits} className="space-y-4 text-xs">
          {refillSuccessMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{refillSuccessMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Select Client Business *
            </label>
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-medium"
              required
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.businessName} ({c.email}) — Current Balance: {c.aiCreditBalance ?? 20} Credits
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Credits to Add *
            </label>
            <input
              type="number"
              min="1"
              max="10000"
              value={refillCredits}
              onChange={(e) => setRefillCredits(Number(e.target.value))}
              className="w-full text-xs p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Admin Grant Note / Reason
            </label>
            <input
              type="text"
              placeholder="e.g. Monthly Retainer Refill, Support Pack, etc."
              value={refillNote}
              onChange={(e) => setRefillNote(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsRefillModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmittingRefill}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              Grant +{refillCredits} AI Credits
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
