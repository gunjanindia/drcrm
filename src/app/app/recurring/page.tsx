'use client';

import React, { useState } from 'react';
import { Repeat, Play, CheckCircle2, Clock, Calendar, Plus } from 'lucide-react';
import { Button, Badge } from '@/components/ui';
import { globalStore } from '@/lib/store';
import { formatDate } from '@/lib/utils';

export default function RecurringEnginePage() {
  const [isRunning, setIsRunning] = useState(false);
  const [lastRunSummary, setLastRunSummary] = useState<string | null>(null);

  const premiumClients = globalStore.clients.filter((c) => c.packageName.includes('Premium'));

  const handleTriggerRecurrenceCycle = () => {
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
      setLastRunSummary(
        `Successfully generated 20 recurring monthly tasks for ${premiumClients.length} active Premium Retainer clients (GBP Updates, Review Tracking, Citation Audit, Monthly Report Draft).`
      );
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Recurring Work & Retainer Automation Engine
          </h2>
          <p className="text-xs text-slate-500">
            Automatically spawns monthly GBP monitoring, review response cycles, ranking audits, and client reports.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={Play}
          isLoading={isRunning}
          onClick={handleTriggerRecurrenceCycle}
        >
          Run Monthly Recurrence Cycle Now
        </Button>
      </div>

      {lastRunSummary && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3 text-xs text-emerald-800 dark:text-emerald-300 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{lastRunSummary}</span>
        </div>
      )}

      {/* Recurrence Rules Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-indigo-600 uppercase">Monthly Rule #1</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-600">Active</span>
          </div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            GBP Geotagged Media & Posts
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Spawns 4 weekly post drafts and geotagged showroom photo upload tasks on the 1st of every month.
          </p>
          <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
            Targets: {premiumClients.length} Premium Clients
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-indigo-600 uppercase">Monthly Rule #2</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-600">Active</span>
          </div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            Map Pack Citation & NAP Audit
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Schedules local directory citation building and consistency checks across 15+ Indian portals.
          </p>
          <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
            Targets: {premiumClients.length} Premium Clients
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-indigo-600 uppercase">Monthly Rule #3</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-600">Active</span>
          </div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            AI Monthly Performance Report Draft
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Aggregates verified review statistics and rank changes to draft professional PDF/Web client reports.
          </p>
          <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
            Targets: {premiumClients.length} Premium Clients
          </div>
        </div>
      </div>
    </div>
  );
}
