'use client';

import React, { useState } from 'react';
import { Sparkles, Bot, FileText, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui';
import { globalStore } from '@/lib/store';
import { aiAssistantEngine } from '@/lib/ai-engine';

export default function AiOperationsHubPage() {
  const [selectedClientId, setSelectedClientId] = useState(globalStore.clients[0].id);
  const [reportResult, setReportResult] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const selectedClient = globalStore.clients.find((c) => c.id === selectedClientId) || globalStore.clients[0];

  const handleGenerateReport = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const res = aiAssistantEngine.generateMonthlyClientReport(selectedClient);
      setReportResult(res);
      setIsGenerating(false);
    }, 800);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-500 border border-amber-500/30 uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          Google Gemini AI Operations Engine
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
          AI Intelligence & Automated Client Report Generator
        </h2>
        <p className="text-xs text-slate-500">
          Strictly grounded in verified application metrics. Never hallucinates unsupported ranking claims.
        </p>
      </div>

      {/* Report Generator Controls */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="w-full sm:w-80">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Select Client for Report Drafting:
            </label>
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-2.5 text-xs text-slate-900 dark:text-white"
            >
              {globalStore.clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.businessName} ({c.packageName})
                </option>
              ))}
            </select>
          </div>

          <Button
            variant="amber"
            size="md"
            icon={Sparkles}
            isLoading={isGenerating}
            onClick={handleGenerateReport}
          >
            Draft Monthly Report via Gemini
          </Button>
        </div>
      </div>

      {/* Generated Report Presentation */}
      {reportResult && (
        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 animate-in fade-in">
          <div className="flex justify-between items-start pb-6 border-b border-slate-200 dark:border-slate-800">
            <div>
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">
                Official Monthly Performance Report
              </span>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {selectedClient.businessName}
              </h3>
              <p className="text-xs text-slate-500">
                Period: Current Month • Package: {selectedClient.packageName}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                Download PDF
              </Button>
              <Button variant="primary" size="sm">
                Publish to Client Portal
              </Button>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="space-y-2 text-xs">
            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
              1. Executive Summary:
            </h4>
            <p className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200/50 dark:border-indigo-800/30 text-slate-700 dark:text-slate-300 leading-relaxed italic">
              "{reportResult.executiveSummary}"
            </p>
          </div>

          {/* Key Achievements */}
          <div className="space-y-2 text-xs">
            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
              2. Key Deliverables & Achievements:
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {reportResult.achievements.map((ach: string, i: number) => (
                <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-slate-700 dark:text-slate-300">{ach}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Next Month Action Plan */}
          <div className="space-y-2 text-xs">
            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
              3. Next Month Growth Roadmap:
            </h4>
            <div className="space-y-2">
              {reportResult.nextMonthPlan.map((plan: string, i: number) => (
                <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-start gap-2.5">
                  <ArrowRight className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                  <span className="text-slate-700 dark:text-slate-300">{plan}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
