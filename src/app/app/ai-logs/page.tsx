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
} from 'lucide-react';
import { Button, Input, Modal, Badge } from '@/components/ui';
import { formatINR } from '@/lib/utils';

export default function AiLogsDashboardPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({
    totalRequests: 0,
    totalPromptTokens: 0,
    totalCompletionTokens: 0,
    totalTokens: 0,
    totalCostUsd: 0,
    totalCostInr: 0,
    totalCreditsDeducted: 0,
  });
  const [clients, setClients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

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
      console.error('Error fetching AI logs:', e);
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
      'ID',
      'Timestamp',
      'User Name',
      'Business Name',
      'Action',
      'Feature Name',
      'Credits Deducted',
      'Prompt Tokens',
      'Completion Tokens',
      'Total Tokens',
      'GCP Cost USD',
      'GCP Cost INR',
      'Status',
    ];

    const rows = logs.map((l) => [
      l.id,
      new Date(l.createdAt).toLocaleString(),
      `"${l.userName || ''}"`,
      `"${l.businessName || ''}"`,
      l.action,
      `"${l.featureName || ''}"`,
      l.creditsDeducted,
      l.promptTokens || 0,
      l.completionTokens || 0,
      l.totalTokens || 0,
      l.estimatedCostUsd || 0,
      l.estimatedCostInr || 0,
      l.status,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `digital_ranchi_ai_usage_logs_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredLogs = logs.filter((l) => {
    const matchesSearch =
      (l.userName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.businessName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.featureName || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesAction =
      actionFilter === 'ALL' || l.action.toUpperCase() === actionFilter.toUpperCase();

    return matchesSearch && matchesAction;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
              ⚡ Live GCP Token Costing Engine
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Gemini 1.5 Flash Rate
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white mt-1.5 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            AI Credit Usage & GCP Cost Audit Monitor
          </h2>
          <p className="text-xs text-slate-500">
            Monitor real-time Gemini AI usage across client portals, calculate exact GCP token costs, and manage wallet credit allowances.
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
            Export CSV
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => setIsRefillModalOpen(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-600/30"
          >
            Refill Client Credits
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total AI Calls
            </span>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {summary.totalRequests.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-400 block font-medium">
            {summary.totalCreditsDeducted} Credits Consumed
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Tokens Used
            </span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
            {summary.totalTokens.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-400 block font-medium">
            {summary.totalPromptTokens.toLocaleString()} in / {summary.totalCompletionTokens.toLocaleString()} out
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Actual GCP Cost ($ USD)
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            ${summary.totalCostUsd}
          </div>
          <span className="text-[11px] text-slate-400 block font-medium">
            At $0.075 / 1M prompt & $0.30 / 1M output
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Estimated GCP Cost (₹ INR)
            </span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
            ₹{summary.totalCostInr}
          </div>
          <span className="text-[11px] text-slate-400 block font-medium">
            Calculated at ₹86.5 / USD
          </span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by client, business or feature..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {['ALL', 'REVIEW_REPLY', 'SITE_BUILDER_AI_FILL', 'AI_TEMPLATE_SYNTHESIS', 'AI_AGENT_QUERY'].map(
            (action) => (
              <button
                key={action}
                onClick={() => setActionFilter(action)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                  actionFilter === action
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {action === 'ALL'
                  ? 'All Actions'
                  : action === 'REVIEW_REPLY'
                  ? 'Reviews'
                  : action === 'SITE_BUILDER_AI_FILL'
                  ? 'Site Builder'
                  : action === 'AI_TEMPLATE_SYNTHESIS'
                  ? 'Templates'
                  : 'AI Agent'}
              </button>
            )
          )}
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase tracking-wider text-slate-400">
              <tr>
                <th className="py-3 px-4">Client / User</th>
                <th className="py-3 px-4">Feature / Action</th>
                <th className="py-3 px-4">Credits</th>
                <th className="py-3 px-4">Tokens (Prompt + Compl)</th>
                <th className="py-3 px-4">GCP Cost ($ / ₹)</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Loading AI usage logs...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No AI usage logs found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {log.businessName || 'Business Client'}
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {log.userName || 'Portal User'}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                        {log.action}
                      </span>
                      <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 max-w-xs truncate">
                        {log.featureName}
                      </div>
                    </td>

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
                          ? `-${log.creditsDeducted}`
                          : log.creditsDeducted < 0
                          ? `+${Math.abs(log.creditsDeducted)}`
                          : '0'}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800 dark:text-slate-200">
                        {(log.totalTokens || 0).toLocaleString()} tok
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {log.promptTokens || 0} in / {log.completionTokens || 0} out
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-emerald-600 dark:text-emerald-400">
                        ${log.estimatedCostUsd || 0}
                      </div>
                      <span className="text-[10px] text-slate-400">
                        ≈ ₹{log.estimatedCostInr || 0}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-500 text-[11px]">
                      {new Date(log.createdAt).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>

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
                ))
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
