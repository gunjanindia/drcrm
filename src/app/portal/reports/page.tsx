'use client';

import React from 'react';
import { FileBarChart2, Download, TrendingUp, Star, MapPin, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui';
import { globalStore } from '@/lib/store';
import { aiAssistantEngine } from '@/lib/ai-engine';

export default function ClientReportsPage() {
  const client = globalStore.clients[0];
  const report = aiAssistantEngine.generateMonthlyClientReport(client);

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Monthly Performance & Growth Reports
          </h2>
          <p className="text-xs text-slate-500">
            Verified monthly metrics on Google Maps discovery, keyword rankings, and review momentum.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          icon={Download}
          onClick={() => alert('Downloading official Monthly Growth Report PDF...')}
        >
          Download PDF Report
        </Button>
      </div>

      {/* Report Card */}
      <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="pb-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <div>
            <span className="text-[10px] font-bold text-sky-600 uppercase tracking-wider block">
              Digital Ranchi Growth Report
            </span>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{client.businessName}</h3>
          </div>
          <span className="text-xs font-semibold text-slate-500">Month: Current Period</span>
        </div>

        {/* Executive Summary */}
        <div className="p-4 rounded-2xl bg-sky-50/50 dark:bg-sky-950/20 border border-sky-200/50 text-xs leading-relaxed text-slate-700 dark:text-slate-300 italic">
          "{report.executiveSummary}"
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Google Map Rating</span>
            <span className="text-2xl font-black text-amber-500 flex items-center justify-center gap-1 mt-1">
              {client.averageRating} <Star className="w-5 h-5 fill-amber-500" />
            </span>
            <span className="text-[10px] text-emerald-600 font-semibold block mt-1">+14 New Reviews</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">GBP Optimization Score</span>
            <span className="text-2xl font-black text-indigo-600 mt-1 block">
              {client.gbpScore}%
            </span>
            <span className="text-[10px] text-slate-500 block mt-1">Complete Profile Health</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Local Map Pack Rank</span>
            <span className="text-2xl font-black text-emerald-600 mt-1 block">
              #1 in Ranchi
            </span>
            <span className="text-[10px] text-slate-500 block mt-1">Primary Clinic Keywords</span>
          </div>
        </div>

        {/* Monthly Achievements */}
        <div className="space-y-2 text-xs">
          <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
            Key Accomplishments:
          </h4>
          <div className="space-y-1.5">
            {report.achievements.map((a, i) => (
              <div key={i} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>{a}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
