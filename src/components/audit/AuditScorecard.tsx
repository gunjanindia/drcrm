'use client';

import React, { useState } from 'react';
import { Sparkles, MapPin, Globe, CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck, Star } from 'lucide-react';
import { runDigitalPresenceAudit } from '@/lib/audit-engine';
import { DigitalPresenceAuditResult } from '@/types';
import { Button, Input } from '@/components/ui';

export interface AuditScorecardProps {
  onPackageSelect?: (packageId: string) => void;
  compact?: boolean;
}

export const AuditScorecard: React.FC<AuditScorecardProps> = ({ onPackageSelect, compact }) => {
  const [businessName, setBusinessName] = useState('Ranchi Super Clinic');
  const [mapsUrl, setMapsUrl] = useState('https://maps.google.com/?cid=100123');
  const [websiteUrl, setWebsiteUrl] = useState('https://ranchiclinic.in');
  const [category, setCategory] = useState('Clinic / Healthcare');
  const [auditResult, setAuditResult] = useState<DigitalPresenceAuditResult | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);

  const handleRunAudit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim()) return;

    setIsAuditing(true);
    setTimeout(() => {
      const result = runDigitalPresenceAudit(businessName, mapsUrl, websiteUrl, category);
      setAuditResult(result);
      setIsAuditing(false);
    }, 600);
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
      {/* Glow highlight */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-3xl mx-auto">
        {/* Form header */}
        <div className="text-center mb-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            AI-Assisted Free Presence Scanner
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Check Your Google Maps & Digital Presence Score
          </h2>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-2">
            Enter your business details below to see how discoverable you are to local customers in Ranchi.
          </p>
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleRunAudit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Business Name *"
              placeholder="e.g. Kaveri Sweets & Restaurant"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              required
            />
            <Input
              label="Category / Industry"
              placeholder="e.g. Restaurant, Dental, Hotel, Coaching"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Google Maps URL (Optional)"
              placeholder="https://maps.google.com/..."
              icon={MapPin}
              value={mapsUrl}
              onChange={(e) => setMapsUrl(e.target.value)}
            />
            <Input
              label="Website / Mini-Site URL (Optional)"
              placeholder="https://yourbusiness.in"
              icon={Globe}
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
            />
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full shadow-indigo-600/30"
              isLoading={isAuditing}
              icon={Sparkles}
            >
              Generate Free Digital Audit Report
            </Button>
          </div>
        </form>

        {/* Audit Results Presentation */}
        {auditResult && (
          <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800 animate-in fade-in slide-in-from-bottom-4">
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800">
              {/* Overall Score Circle & Summary */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-5">
                  <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 to-sky-500 flex flex-col items-center justify-center text-white shadow-lg shadow-indigo-600/30 shrink-0">
                    <span className="text-2xl font-black">{auditResult.overallScore}</span>
                    <span className="text-[9px] font-semibold uppercase tracking-wider opacity-80">/ 100</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {auditResult.businessName}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Digital Presence Grade: <strong className="text-indigo-600 dark:text-indigo-400">{auditResult.overallScore >= 75 ? 'Good (Optimization Ready)' : 'Moderate (Growth Required)'}</strong>
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-emerald-600 dark:text-emerald-400">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{auditResult.isVerifiedOnGoogle ? 'Google Maps Profile Detected' : 'Unclaimed / Basic Listing'}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-500 block">Recommended Growth Action:</span>
                  <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                    {auditResult.suggestedPackage.name} (₹{auditResult.suggestedPackage.price.toLocaleString('en-IN')})
                  </span>
                </div>
              </div>

              {/* Breakdown Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-6">
                {Object.entries(auditResult.breakdown).map(([key, score]) => (
                  <div key={key} className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider truncate">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                    <div className="flex items-baseline justify-between mt-1">
                      <span className="text-base font-bold text-slate-900 dark:text-white">{score}%</span>
                      <div className="w-12 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-indigo-500"
                          style={{ width: `${score}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Strengths & Weaknesses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/30">
                  <span className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Verified Strengths
                  </span>
                  <ul className="space-y-1.5 text-slate-700 dark:text-slate-300">
                    {auditResult.strengths.map((s, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-emerald-500 mt-0.5">•</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/30">
                  <span className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5 mb-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    Critical Gaps to Fix
                  </span>
                  <ul className="space-y-1.5 text-slate-700 dark:text-slate-300">
                    {auditResult.criticalWeaknesses.map((w, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-amber-500 mt-0.5">•</span>
                        <span>{w}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Next Step CTA */}
              <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-indigo-900 to-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold">Ready to fix these gaps and get 3x more local inquiries?</h4>
                  <p className="text-xs text-indigo-200 mt-0.5">
                    Activate the {auditResult.suggestedPackage.name} with instant automated onboarding.
                  </p>
                </div>
                <Button
                  variant="amber"
                  size="md"
                  onClick={() => onPackageSelect && onPackageSelect(auditResult.suggestedPackage.id)}
                  icon={ArrowRight}
                  className="shrink-0"
                >
                  Get Package (₹{auditResult.suggestedPackage.price})
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
