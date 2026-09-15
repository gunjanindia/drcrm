'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  TrendingUp,
  Sparkles,
  ArrowRight,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Target,
} from 'lucide-react';
import { AuditFactor, DEFAULT_AUDIT_FACTORS } from '@/lib/client-360-data';
import { Button, Badge } from '@/components/ui';

export interface DigitalHealthAuditCardProps {
  businessName?: string;
  category?: string;
  city?: string;
  factors?: AuditFactor[];
  onActionTrigger?: (action: string) => void;
}

export const DigitalHealthAuditCard: React.FC<DigitalHealthAuditCardProps> = ({
  businessName = 'Your Verified Business',
  category = 'Local Business',
  city = '',
  factors = DEFAULT_AUDIT_FACTORS,
  onActionTrigger,
}) => {
  const [expandedFactorId, setExpandedFactorId] = useState<string | null>(null);

  const totalScore = factors.reduce((acc, f) => acc + f.score, 0);
  const maxPossible = factors.reduce((acc, f) => acc + f.maxScore, 0);
  const percentage = Math.round((totalScore / maxPossible) * 100);

  const toggleExpand = (id: string) => {
    setExpandedFactorId(expandedFactorId === id ? null : id);
  };

  const getScoreColor = (pct: number) => {
    if (pct >= 80) return 'text-emerald-500 stroke-emerald-500';
    if (pct >= 60) return 'text-amber-500 stroke-amber-500';
    return 'text-rose-500 stroke-rose-500';
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Gauge Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          {/* Radial SVG Gauge */}
          <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-100 dark:text-slate-800 stroke-current"
                strokeWidth="3.5"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={`transition-all duration-1000 ease-out ${getScoreColor(percentage)}`}
                strokeDasharray={`${percentage}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {totalScore}
              </span>
              <span className="text-[10px] text-slate-400 font-bold -mt-1">/ {maxPossible}</span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200">
                Grade: {percentage >= 80 ? 'A+ (High Visibility)' : percentage >= 60 ? 'B (Moderate)' : 'C (Action Required)'}
              </span>
              <span className="text-xs text-slate-400 font-semibold">• Top-3 Local Map Pack</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Digital Presence & Health Audit
            </h3>
            <p className="text-xs text-slate-500 max-w-md">
              Evaluated across 5 core Google ranking signals for <strong>{businessName}</strong> in {city}.
            </p>
          </div>
        </div>

        {/* Potential Score Gain Pill */}
        <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-center sm:text-right shrink-0">
          <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 block">
            Potential Score Increase
          </span>
          <div className="text-xl font-black text-indigo-600 dark:text-indigo-300 mt-0.5">
            +{maxPossible - totalScore} Points Gainable
          </div>
          <span className="text-[11px] text-slate-500 block">
            Follow recommendations below to reach 100/100
          </span>
        </div>
      </div>

      {/* Breakdown: Explain What Makes That Score */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-indigo-600" />
              What Makes Your Health Score ({totalScore}/{maxPossible})
            </h4>
            <p className="text-xs text-slate-500">
              Transparent point evaluation across verified Google Places ranking metrics
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {factors.map((factor) => {
            const isExpanded = expandedFactorId === factor.id;
            const factorPct = Math.round((factor.score / factor.maxScore) * 100);

            return (
              <div
                key={factor.id}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 overflow-hidden transition-all"
              >
                <div
                  onClick={() => toggleExpand(factor.id)}
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-100/60 dark:hover:bg-slate-900/60 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {factor.status === 'OPTIMAL' ? (
                      <div className="w-7 h-7 rounded-xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="w-7 h-7 rounded-xl bg-amber-500/15 text-amber-600 flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900 dark:text-white">
                          {factor.name}
                        </span>
                        <span className="text-[10px] text-slate-400">({factor.category})</span>
                      </div>
                      <p className="text-[11px] text-slate-500">{factor.impactDescription}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="font-black text-xs text-slate-900 dark:text-white">
                        {factor.score} / {factor.maxScore} pts
                      </span>
                      <span className="text-[10px] text-emerald-600 block font-semibold">
                        {factor.pointsToGain > 0 ? `+${factor.pointsToGain} pts available` : 'Maxed'}
                      </span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Expanded Score Explanation & Improvement */}
                {isExpanded && (
                  <div className="p-4 pt-0 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3">
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Why you earned this score:
                        </span>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                          {factor.whatMakesThisScore}
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-sky-50/60 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                          What to do to improve:
                        </span>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                          {factor.recommendation}
                        </p>
                      </div>
                    </div>

                    {factor.quickActionLabel && (
                      <div className="flex justify-end pt-1">
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={Sparkles}
                          onClick={() => onActionTrigger && onActionTrigger(factor.id)}
                        >
                          {factor.quickActionLabel} (+{factor.pointsToGain} pts)
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Suggested Action Plan to Make It Better */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-900 via-slate-900 to-sky-950 text-white shadow-lg space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-sm tracking-tight text-white">
              AI Action Plan to Reach 100/100 Health Score
            </h4>
            <p className="text-[11px] text-sky-200">
              Prioritized high-impact steps to outperform local competitors in Ranchi
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 space-y-2">
            <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Quick Win #1
            </span>
            <p className="font-bold text-white text-xs">Print Review QR Counter Stand</p>
            <p className="text-[11px] text-slate-300">
              Place on your billing counter / reception to automatically gather 10-15 authentic 5-star Google reviews per month.
            </p>
            <Link href="/portal/qr-stand" className="inline-block text-[11px] text-amber-300 hover:underline font-semibold">
              Generate Printable Stand →
            </Link>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 space-y-2">
            <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
              Quick Win #2
            </span>
            <p className="font-bold text-white text-xs">Publish 1-Page Mobile Site</p>
            <p className="text-[11px] text-slate-300">
              Link your 1-page mini-site with 1-click WhatsApp booking to your GBP listing to maximize direct customer inquiries.
            </p>
            <Link href="/portal/site-builder" className="inline-block text-[11px] text-amber-300 hover:underline font-semibold">
              Launch 1-Page Site →
            </Link>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 space-y-2">
            <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Growth Step #3
            </span>
            <p className="font-bold text-white text-xs">Answer All Customer Reviews</p>
            <p className="text-[11px] text-slate-300">
              Use AI Review Assistant to post personalized, warm replies to all customer reviews within 24 hours.
            </p>
            <Link href="/portal/reviews" className="inline-block text-[11px] text-amber-300 hover:underline font-semibold">
              Open Review Assistant →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
