'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  MapPin,
  Globe,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  Star,
  Building2,
  Phone,
  AlertCircle,
  ExternalLink,
  Store
} from 'lucide-react';
import { DigitalPresenceAuditResult } from '@/types';
import { Button, Input } from '@/components/ui';

export interface AuditScorecardProps {
  onPackageSelect?: (packageId: string) => void;
  compact?: boolean;
}

export const AuditScorecard: React.FC<AuditScorecardProps> = ({ onPackageSelect, compact }) => {
  const [businessName, setBusinessName] = useState('');
  const [contactName, setContactName] = useState('');
  const [city, setCity] = useState('Ranchi');
  const [mapsUrl, setMapsUrl] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [category, setCategory] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | undefined>(undefined);
  const [auditResult, setAuditResult] = useState<DigitalPresenceAuditResult | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const executeAudit = async (placeIdOverride?: string) => {
    if (!businessName.trim()) return;

    setIsAuditing(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: businessName.trim(),
          contactName: contactName.trim() || undefined,
          city: city.trim() || 'Ranchi',
          googleMapsUrl: mapsUrl.trim() || undefined,
          websiteUrl: websiteUrl.trim() || undefined,
          category: category.trim() || undefined,
          phone: phone.trim() || undefined,
          selectedPlaceId: placeIdOverride || selectedPlaceId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate audit report.');
      }

      setAuditResult(data.data);
      if (placeIdOverride) {
        setSelectedPlaceId(placeIdOverride);
      }
    } catch (err: any) {
      console.error('Audit error:', err);
      setErrorMessage(err?.message || 'Failed to analyze business presence. Please verify your inputs.');
    } finally {
      setIsAuditing(false);
    }
  };

  const handleRunAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSelectedPlaceId(undefined);
    await executeAudit();
  };

  const handleSelectBranch = async (placeId: string) => {
    setSelectedPlaceId(placeId);
    await executeAudit(placeId);
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
            Live Google Maps & Presence Scanner
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Check Your Google Maps & Digital Presence Score
          </h2>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-2">
            Enter your business details below to perform real-time verification of your Google Maps indexation, ratings, and competitor visibility in Jharkhand.
          </p>
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleRunAudit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Business Name *"
              placeholder="e.g. Glow Heaven Ladies Beauty Parlour"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              required
            />
            <Input
              label="Owner / Contact Person *"
              placeholder="e.g. Pooja Sharma"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="WhatsApp Phone Number *"
              placeholder="e.g. +91 94311 00000"
              icon={Phone}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
            <Input
              label="City / Region"
              placeholder="e.g. Ranchi, Jamshedpur, Dhanbad"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
            <Input
              label="Category / Industry"
              placeholder="e.g. Beauty Parlour, Restaurant, Clinic"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Google Maps URL (Optional for live verification)"
              placeholder="https://maps.google.com/?cid=... or maps.app.goo.gl/..."
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

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full shadow-indigo-600/30"
              isLoading={isAuditing}
              icon={Sparkles}
            >
              Verify & Generate Free Presence Audit
            </Button>
          </div>
        </form>

        {/* Audit Results Presentation */}
        {auditResult && (
          <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800 animate-in fade-in slide-in-from-bottom-4">
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800">
              
              {/* Branch / Multi-Candidate Disambiguation Selector */}
              {auditResult.candidates && auditResult.candidates.length > 1 && (
                <div className="mb-6 p-4 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Store className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                      Multiple Google Maps Locations Found ({auditResult.candidates.length} Branches):
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mb-3">
                    We found multiple Google Maps listings matching &quot;{auditResult.businessName}&quot;. Select your exact branch address below to analyze:
                  </p>
                  <div className="space-y-2">
                    {auditResult.candidates.map((cand) => {
                      const isSelected = (auditResult.matchedPlace?.placeId === cand.placeId) || (selectedPlaceId === cand.placeId);
                      return (
                        <div
                          key={cand.placeId}
                          onClick={() => handleSelectBranch(cand.placeId)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                            isSelected
                              ? 'bg-white dark:bg-slate-900 border-indigo-500 shadow-md ring-2 ring-indigo-500/20'
                              : 'bg-white/70 dark:bg-slate-900/70 border-slate-200 dark:border-slate-800 hover:border-indigo-300'
                          }`}
                        >
                          <div className="flex-1">
                            <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-2">
                              <span>{cand.name}</span>
                              {isSelected && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-indigo-600 text-white">
                                  Selected Branch
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                              <MapPin className="w-3 h-3 shrink-0 text-slate-400" />
                              <span>{cand.formattedAddress}</span>
                            </p>
                            {cand.rating && (
                              <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 mt-1 inline-flex items-center gap-1">
                                <Star className="w-3 h-3 fill-current" />
                                {cand.rating}★ ({cand.userRatingsTotal || 0} reviews)
                              </span>
                            )}
                          </div>
                          <Button
                            variant={isSelected ? 'primary' : 'outline'}
                            size="sm"
                            className="shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectBranch(cand.placeId);
                            }}
                          >
                            {isSelected ? 'Currently Selected' : 'Select This Location'}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Validation Status Banner */}
              {auditResult.validationStatus === 'INVALID_URL' && (
                <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-800 dark:text-rose-300 flex items-start gap-3 text-xs">
                  <ShieldAlert className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
                  <div>
                    <strong className="font-bold block text-sm">Fake or Unrecognized Google Maps Link Detected</strong>
                    <span>The Google Maps URL entered does not conform to official Google Maps domains or active location listings. Your visibility score has been marked down accordingly.</span>
                  </div>
                </div>
              )}

              {auditResult.validationStatus === 'UNVERIFIED_OR_NOT_FOUND' && (
                <div className="mb-6 p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200">
                  <div className="flex items-start gap-3 text-xs">
                    <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
                    <div className="flex-1 space-y-2">
                      <div>
                        <strong className="font-bold block text-sm">
                          Google Maps Profile Not Found or Unclaimed
                        </strong>
                        <p className="text-slate-600 dark:text-slate-300 mt-1">
                          We searched Google Maps for local businesses matching &quot;{auditResult.businessName}&quot; in {auditResult.city || 'your area'}, but no verified Google Business Profile was found. Local customers searching nearby are unable to find direct map directions.
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-white/70 dark:bg-slate-900/70 border border-amber-200 dark:border-amber-900/50 space-y-1 text-[11px]">
                        <strong className="text-slate-900 dark:text-white block font-semibold">How to resolve this:</strong>
                        <ul className="space-y-1 text-slate-600 dark:text-slate-400 list-disc list-inside">
                          <li>If your business is already listed under a slightly different name, paste your exact <strong>Google Maps link</strong> above.</li>
                          <li>If you are not yet listed or unverified, activate our <strong>Starter Verification Package (₹499)</strong> to claim your Google Maps pin within 48 hours.</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {auditResult.validationStatus === 'VERIFIED_MATCH' && (
                <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 flex items-start gap-3 text-xs">
                  <ShieldCheck className="w-5 h-5 shrink-0 text-emerald-600 mt-0.5" />
                  <div className="flex-1">
                    <strong className="font-bold block text-sm">Active Google Maps Profile Verified</strong>
                    <div className="text-slate-700 dark:text-slate-200 mt-0.5 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{auditResult.matchedPlace?.formattedAddress || auditResult.businessName}</span>
                    </div>
                    {auditResult.matchedPlace?.rating && auditResult.matchedPlace.rating > 0 ? (
                      <div className="mt-1 flex items-center gap-2 font-medium">
                        <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          {auditResult.matchedPlace.rating}★
                        </span>
                        <span>({auditResult.matchedPlace.userRatingsTotal || 0} customer reviews)</span>
                      </div>
                    ) : (
                      <div className="mt-1 text-slate-500 dark:text-slate-400">
                        Profile link verified on Google Maps.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Overall Score Circle & Summary */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-5">
                  <div className={`relative w-20 h-20 rounded-2xl flex flex-col items-center justify-center text-white shadow-lg shrink-0 ${
                    auditResult.overallScore >= 75
                      ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 shadow-emerald-600/30'
                      : auditResult.overallScore >= 50
                      ? 'bg-gradient-to-tr from-indigo-600 to-sky-500 shadow-indigo-600/30'
                      : 'bg-gradient-to-tr from-rose-600 to-amber-500 shadow-rose-600/30'
                  }`}>
                    <span className="text-2xl font-black">{auditResult.overallScore}</span>
                    <span className="text-[9px] font-semibold uppercase tracking-wider opacity-80">/ 100</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {auditResult.businessName}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Presence Grade:{' '}
                      <strong className={
                        auditResult.overallScore >= 75
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : auditResult.overallScore >= 50
                          ? 'text-indigo-600 dark:text-indigo-400'
                          : 'text-rose-600 dark:text-rose-400'
                      }>
                        {auditResult.overallScore >= 75
                          ? 'Strong (Optimization Ready)'
                          : auditResult.overallScore >= 50
                          ? 'Moderate (Growth Required)'
                          : 'Critical (Missing Verification)'}
                      </strong>
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                      <Building2 className="w-3.5 h-3.5" />
                      <span>{auditResult.city || 'Ranchi, Jharkhand'}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-500 block">Recommended Action:</span>
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
                          className={`h-full rounded-full ${
                            score >= 70 ? 'bg-emerald-500' : score >= 40 ? 'bg-indigo-500' : 'bg-rose-500'
                          }`}
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
                    Verified Strengths ({auditResult.strengths.length})
                  </span>
                  {auditResult.strengths.length > 0 ? (
                    <ul className="space-y-1.5 text-slate-700 dark:text-slate-300">
                      {auditResult.strengths.map((s, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-emerald-500 mt-0.5">•</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-slate-500 italic">No verified digital strengths discovered yet.</p>
                  )}
                </div>

                <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/30">
                  <span className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5 mb-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    Critical Gaps to Fix ({auditResult.criticalWeaknesses.length})
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
                  <h4 className="text-sm font-bold">
                    {auditResult.overallScore < 50
                      ? 'Claim and verify your listing on Google Maps today'
                      : 'Ready to fix these gaps and get 3x more local inquiries?'}
                  </h4>
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
                  Get Package (₹{auditResult.suggestedPackage.price.toLocaleString('en-IN')})
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
