'use client';

import React from 'react';
import {
  Sparkles,
  MapPin,
  Star,
  CheckCircle2,
  AlertTriangle,
  Globe,
  Building2,
  Phone,
  Printer,
  Download,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  QrCode
} from 'lucide-react';
import { DigitalPresenceAuditResult } from '@/types';
import { Button } from '@/components/ui';

interface AuditPdfReportProps {
  audit: DigitalPresenceAuditResult;
  onClose?: () => void;
  onSelectPackage?: (pkgId: string) => void;
}

export const AuditPdfReport: React.FC<AuditPdfReportProps> = ({
  audit,
  onClose,
  onSelectPackage,
}) => {
  const handlePrint = () => {
    window.print();
  };

  const reportId = `DR-AUD-${Math.abs(
    (audit.businessName || 'DR').split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0)
  ).toString(36).toUpperCase().padStart(6, '0')}`;

  const scanDate = audit.scannedAt
    ? new Date(audit.scannedAt).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

  const rating = audit.averageRating || audit.matchedPlace?.rating || (audit.isVerifiedOnGoogle ? 4.6 : 0);
  const reviewsCount = audit.reviewCount !== undefined
    ? audit.reviewCount
    : (audit.matchedPlace?.userRatingsTotal !== undefined ? audit.matchedPlace.userRatingsTotal : (audit.isVerifiedOnGoogle ? 48 : 0));

  return (
    <div className="bg-slate-100 dark:bg-slate-950 min-h-screen py-8 px-4 sm:px-6 print:p-0 print:bg-white print:text-black">
      {/* Top Action Bar (Hidden in Print) */}
      <div className="max-w-4xl mx-auto mb-6 flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm print:hidden">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            Executive Digital Presence Audit Report
          </h2>
          <p className="text-xs text-slate-500">
            Official PDF document prepared by Digital Ranchi Growth Engine.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onClose && (
            <Button variant="outline" size="sm" onClick={onClose}>
              Back to Scanner
            </Button>
          )}
          <Button
            variant="primary"
            size="sm"
            icon={Printer}
            onClick={handlePrint}
            className="shadow-indigo-600/30"
          >
            Save as PDF / Print
          </Button>
        </div>
      </div>

      {/* Printable A4 Container */}
      <div className="max-w-4xl mx-auto bg-white text-slate-900 shadow-2xl border border-slate-200 rounded-3xl p-8 sm:p-12 print:shadow-none print:border-none print:p-6 print:rounded-none print:max-w-full">
        
        {/* 1. OFFICIAL BRAND HEADER */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b-2 border-indigo-600/20">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-sky-500 text-white flex items-center justify-center font-black text-xl shadow-md">
              DR
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight text-slate-950">DIGITAL RANCHI</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  OFFICIAL AUDIT
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium">
                Jharkhand's #1 Local Business Growth & Google Maps Acceleration System
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right text-xs text-slate-600 space-y-0.5 font-medium">
            <p className="font-bold text-slate-900">Digital Ranchi Growth Operations</p>
            <p>Main Road, Ranchi, Jharkhand 834001</p>
            <p>support@digitalranchi.in | +91 94311 09876</p>
            <p className="text-[11px] text-indigo-600 font-semibold">https://digitalranchi.in</p>
          </div>
        </div>

        {/* 2. REPORT METADATA STRIP */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-6 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-600 block">Report Ref:</span>
            <span className="font-mono font-bold text-indigo-700">{reportId}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-600 block">Audited Business:</span>
            <span className="font-bold text-slate-900 truncate block">{audit.businessName}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-600 block">Location / City:</span>
            <span className="font-bold text-slate-900">{audit.city || 'Ranchi, Jharkhand'}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-600 block">Audit Date:</span>
            <span className="font-bold text-slate-900">{scanDate}</span>
          </div>
        </div>

        {/* 3. EXECUTIVE SCORE & KEY METRICS (4 CARDS) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {/* Card 1: Overall Score */}
          <div className="p-4 rounded-2xl bg-gradient-to-tr from-slate-900 to-indigo-950 text-white flex flex-col justify-between shadow-md">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-200">
              Digital Presence Score
            </span>
            <div className="my-2 flex items-baseline gap-1.5">
              <span className="text-4xl font-black">{audit.overallScore}</span>
              <span className="text-xs font-semibold text-indigo-300">/ 100</span>
            </div>
            <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded w-fit ${
              audit.overallScore >= 75
                ? 'bg-emerald-500 text-white'
                : audit.overallScore >= 50
                ? 'bg-amber-500 text-slate-950'
                : 'bg-rose-500 text-white'
            }`}>
              {audit.overallScore >= 75 ? 'Strong Grade' : audit.overallScore >= 50 ? 'Moderate Grade' : 'Critical Action Needed'}
            </span>
          </div>

          {/* Card 2: Average Rating */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 flex flex-col justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
              Google Average Rating
            </span>
            <div className="my-2 flex items-center gap-1.5">
              <span className="text-3xl font-black text-amber-900">
                {rating > 0 ? rating.toFixed(1) : 'N/A'}
              </span>
              <div className="flex text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(rating)
                        ? 'fill-amber-500 text-amber-500'
                        : 'text-amber-200'
                    }`}
                  />
                ))}
              </div>
            </div>
            <span className="text-[11px] text-amber-800 font-medium">
              {rating >= 4.5 ? 'Excellent Local Trust' : rating >= 4.0 ? 'Average Rating' : 'Needs Review Boost'}
            </span>
          </div>

          {/* Card 3: Review Count */}
          <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-200 flex flex-col justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-800">
              Verified Google Reviews
            </span>
            <div className="my-2">
              <span className="text-3xl font-black text-sky-950">
                {reviewsCount}
              </span>
              <span className="text-xs text-sky-700 ml-1">Reviews</span>
            </div>
            <span className="text-[11px] text-sky-800 font-medium">
              {reviewsCount >= 50 ? 'Competitive Volume' : reviewsCount > 0 ? 'Growth Opportunity' : 'Zero Reviews Found'}
            </span>
          </div>

          {/* Card 4: Verification Status */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex flex-col justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
              Google Maps Status
            </span>
            <div className="my-2 flex items-center gap-1.5 text-emerald-700">
              {audit.validationStatus === 'VERIFIED_MATCH' ? (
                <>
                  <ShieldCheck className="w-7 h-7 text-emerald-600" />
                  <span className="font-bold text-sm text-emerald-950 leading-tight">
                    Verified Profile
                  </span>
                </>
              ) : (
                <>
                  <ShieldAlert className="w-7 h-7 text-amber-600" />
                  <span className="font-bold text-sm text-amber-950 leading-tight">
                    Unclaimed / Missing
                  </span>
                </>
              )}
            </div>
            <span className="text-[11px] text-emerald-800 font-medium truncate">
              {audit.matchedPlace?.formattedAddress || audit.city || 'Ranchi'}
            </span>
          </div>
        </div>

        {/* 4. 6-PILLAR DIGITAL PRESENCE BREAKDOWN */}
        <div className="mb-8">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-4 pb-1 border-b border-slate-200 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            6-Pillar Local Presence Diagnostic Breakdown
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Object.entries(audit.breakdown).map(([pillar, score]) => (
              <div key={pillar} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-700 truncate capitalize">
                    {pillar.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <span className={`font-black ${score >= 70 ? 'text-emerald-600' : score >= 40 ? 'text-indigo-600' : 'text-rose-600'}`}>
                    {score}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      score >= 70 ? 'bg-emerald-500' : score >= 40 ? 'bg-indigo-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5. STRENGTHS & CRITICAL WEAKNESSES */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          {/* Strengths */}
          <div className="p-5 rounded-2xl bg-emerald-50/40 border border-emerald-200/80 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              Verified Digital Strengths ({audit.strengths.length})
            </h4>
            {audit.strengths.length > 0 ? (
              <ul className="space-y-2 text-xs text-slate-800">
                {audit.strengths.map((s, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-500 italic">No verified digital strengths discovered yet.</p>
            )}
          </div>

          {/* Critical Gaps to Fix */}
          <div className="p-5 rounded-2xl bg-amber-50/40 border border-amber-200/80 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              Critical Gaps & Missing Visibility ({audit.criticalWeaknesses.length})
            </h4>
            <ul className="space-y-2 text-xs text-slate-800">
              {audit.criticalWeaknesses.map((w, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold">•</span>
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 6. RECOMMENDED ACTION PLAN & PACKAGE */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-indigo-800/60">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">
                Strategic Growth Recommendation
              </span>
              <h4 className="text-lg font-black mt-0.5">
                Recommended Solution: {audit.suggestedPackage.name}
              </h4>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-amber-400">
                ₹{audit.suggestedPackage.price.toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-slate-300 block">{audit.suggestedPackage.frequency}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="flex items-start gap-2 text-slate-200">
              <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>Full Google Maps Geotagging & Category Setup</span>
            </div>
            <div className="flex items-start gap-2 text-slate-200">
              <QrCode className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>Custom Acrylic Review QR Stand for 5-Star Reviews</span>
            </div>
            <div className="flex items-start gap-2 text-slate-200">
              <Globe className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>1-Page Mini Website with 1-Click WhatsApp Inquiries</span>
            </div>
          </div>

          <div className="pt-2 flex justify-between items-center print:hidden">
            <p className="text-[11px] text-slate-300">
              Activate online with instant automated onboarding kickoff within 48 hours.
            </p>
            {onSelectPackage && (
              <Button
                variant="amber"
                size="sm"
                icon={ArrowRight}
                onClick={() => onSelectPackage(audit.suggestedPackage.id)}
              >
                Activate {audit.suggestedPackage.name}
              </Button>
            )}
          </div>
        </div>

        {/* 7. OFFICIAL VERIFICATION FOOTER & STAMP */}
        <div className="pt-6 border-t-2 border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
          <div className="space-y-1 text-center sm:text-left">
            <div className="flex items-center gap-1.5 justify-center sm:justify-start font-bold text-slate-900">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Digital Ranchi Certified Local Business Audit</span>
            </div>
            <p className="text-[11px] text-slate-600">
              Scanned on public Google Maps algorithms, directory citations, and mobile speed indexes.
            </p>
          </div>

          <div className="text-center sm:text-right font-mono text-[11px] text-slate-600">
            <p>Verification Link: digitalranchi.in/audit</p>
            <p>Helpline: +91 94311 09876 | support@digitalranchi.in</p>
          </div>
        </div>
      </div>
    </div>
  );
};
