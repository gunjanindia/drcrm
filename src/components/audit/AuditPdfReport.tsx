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
import { useSiteSettings } from '@/contexts/SiteSettingsContext';

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
  const { settings, refreshSettings } = useSiteSettings();
  const brandName = settings.brandName || 'DIGITAL RANCHI';
  const brandInitials = settings.brandInitials || 'DR';

  // Automatically refresh settings on mount so any newly saved phone/email/address in Admin are live
  React.useEffect(() => {
    if (typeof refreshSettings === 'function') {
      refreshSettings();
    }
  }, [refreshSettings]);

  const handlePrint = () => {
    window.print();
  };

  const reportId = `${brandInitials.toUpperCase()}-AUD-${Math.abs(
    (audit.businessName || brandInitials).split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0)
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

  const agencyAddress = settings.address
    ? settings.address
    : [settings.city || 'Ranchi', settings.state || 'Jharkhand', settings.pincode ? `${settings.pincode}` : '834001'].filter(Boolean).join(', ');

  const agencyPhone = settings.phone || settings.whatsapp || '+91 94311 09876';
  const agencyEmail = settings.supportEmail || settings.email || 'support@digitalranchi.in';
  const agencyWebsite = settings.websiteUrl || `${brandName.toLowerCase().replace(/[^a-z0-9]/g, '')}.in`;

  const businessEmail = audit.email || `${(audit.businessName || 'lead').toLowerCase().replace(/[^a-z0-9]/g, '')}@lead.${agencyWebsite}`;
  const businessPhone = audit.phone || '+91 98765 43210';
  const businessContact = audit.contactName || audit.businessName || 'Business Owner';
  const businessCategory = audit.category || audit.matchedPlace?.matchedCategory || 'Local Business / Healthcare';
  const businessCity = audit.city || audit.matchedPlace?.formattedAddress || 'Ranchi, Jharkhand';

  return (
    <div className="bg-slate-100 dark:bg-slate-950 min-h-screen py-4 sm:py-6 px-2 sm:px-4 print:p-0 print:m-0 print:bg-white print:text-black print:min-h-0">
      {/* Scoped Print Stylesheet */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page {
            size: A4 portrait;
            margin: 6mm 8mm 6mm 8mm;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #0f172a !important;
            width: 100% !important;
            height: auto !important;
            overflow: visible !important;
          }
          /* Hide non-printable elements */
          .print-hidden,
          button,
          [role="dialog"] > button {
            display: none !important;
          }
          #audit-report-printable {
            display: block !important;
            position: relative !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
            background: #ffffff !important;
            color: #0f172a !important;
          }
          .avoid-page-break {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        }
      `}} />

      {/* Top Action Bar (Hidden in Print) */}
      <div className="max-w-4xl mx-auto mb-4 flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm print:hidden">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            Executive Digital Presence Audit Report
          </h2>
          <p className="text-xs text-slate-500">
            Official PDF document prepared by {brandName} Growth Engine.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onClose && (
            <Button variant="outline" size="sm" onClick={onClose}>
              Close Preview
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
      <div
        id="audit-report-printable"
        className="max-w-4xl mx-auto bg-white text-slate-900 shadow-2xl border border-slate-200 rounded-3xl p-5 sm:p-8 print:shadow-none print:border-none print:p-0 print:rounded-none print:max-w-full"
      >
        
        {/* 1. OFFICIAL BRAND HEADER */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b-2 border-indigo-600/20">
          <div className="flex items-center gap-3.5">
            {settings.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt={brandName}
                className="w-12 h-12 rounded-2xl object-contain p-1 border border-slate-200 bg-white shadow-md shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-sky-500 text-white flex items-center justify-center font-black text-xl shadow-md shrink-0">
                {brandInitials}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950 uppercase">{brandName}</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  OFFICIAL AUDIT
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                {settings.brandTagline || "Jharkhand's #1 Local Business Growth & Google Maps Acceleration System"}
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right text-xs text-slate-600 space-y-0.5 font-medium">
            <p className="font-bold text-slate-900">{brandName} Growth Operations</p>
            <p className="text-slate-600">{agencyAddress}</p>
            <p className="text-slate-700">
              <span>{agencyEmail}</span>
              <span className="mx-1.5">•</span>
              <span className="font-semibold text-slate-900">{agencyPhone}</span>
            </p>
            <p className="text-[11px] text-indigo-600 font-bold">{agencyWebsite}</p>
          </div>
        </div>

        {/* 2. DYNAMIC AUDITED BUSINESS & METADATA GRID */}
        <div className="my-5 p-4 rounded-2xl bg-slate-50 border border-slate-200/90 text-xs shadow-xs">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pb-3 border-b border-slate-200/80">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-500 block">Report Ref:</span>
              <span className="font-mono font-bold text-indigo-700 text-xs">{reportId}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-500 block">Audited Business:</span>
              <span className="font-bold text-slate-950 text-xs truncate block">{audit.businessName}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-500 block">Owner / Contact:</span>
              <span className="font-bold text-slate-800 text-xs truncate block">{businessContact}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-500 block">Phone / WhatsApp:</span>
              <span className="font-bold text-indigo-600 text-xs block">{businessPhone}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-3">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-500 block">Business Email:</span>
              <span className="font-medium text-slate-700 text-xs truncate block">{businessEmail}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-500 block">Category / Type:</span>
              <span className="font-semibold text-slate-800 text-xs truncate block">{businessCategory}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-500 block">Location / City:</span>
              <span className="font-bold text-slate-900 text-xs truncate block">{businessCity}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-500 block">Audit Date:</span>
              <span className="font-semibold text-slate-800 text-xs block">{scanDate}</span>
            </div>
          </div>
        </div>

        {/* 3. EXECUTIVE SCORE & KEY METRICS (4 CARDS) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-6">
          {/* Card 1: Overall Score */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-slate-900 to-indigo-950 text-white flex flex-col justify-between shadow-md">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-200">
              Digital Presence Score
            </span>
            <div className="my-1.5 flex items-baseline gap-1.5">
              <span className="text-3xl sm:text-4xl font-black">{audit.overallScore}</span>
              <span className="text-xs font-semibold text-indigo-300">/ 100</span>
            </div>
            <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded w-fit ${
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
          <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 flex flex-col justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
              Google Average Rating
            </span>
            <div className="my-1.5 flex items-center gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-amber-900">
                {rating > 0 ? rating.toFixed(1) : 'N/A'}
              </span>
              <div className="flex text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${
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
          <div className="p-3.5 rounded-2xl bg-sky-50/70 border border-sky-200 flex flex-col justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-800">
              Verified Google Reviews
            </span>
            <div className="my-1.5">
              <span className="text-2xl sm:text-3xl font-black text-sky-950">
                {reviewsCount}
              </span>
              <span className="text-xs text-sky-700 ml-1">Reviews</span>
            </div>
            <span className="text-[11px] text-sky-800 font-medium">
              {reviewsCount >= 50 ? 'Competitive Volume' : reviewsCount > 0 ? 'Growth Opportunity' : 'Zero Reviews Found'}
            </span>
          </div>

          {/* Card 4: Verification Status */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex flex-col justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
              Google Maps Status
            </span>
            <div className="my-1.5 flex items-center gap-1.5 text-emerald-700">
              {audit.validationStatus === 'VERIFIED_MATCH' ? (
                <>
                  <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
                  <span className="font-bold text-xs sm:text-sm text-emerald-950 leading-tight">
                    Verified Profile
                  </span>
                </>
              ) : (
                <>
                  <ShieldAlert className="w-6 h-6 text-amber-600 shrink-0" />
                  <span className="font-bold text-xs sm:text-sm text-amber-950 leading-tight">
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
        <div className="mb-6">
          <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 mb-3 pb-1 border-b border-slate-200 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            6-Pillar Local Presence Diagnostic Breakdown
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {Object.entries(audit.breakdown).map(([pillar, score]) => (
              <div key={pillar} className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-700 truncate capitalize">
                    {pillar.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <span className={`font-black ${score >= 70 ? 'text-emerald-600' : score >= 40 ? 'text-indigo-600' : 'text-rose-600'}`}>
                    {score}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {/* Strengths */}
          <div className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-200/80 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              Verified Digital Strengths ({audit.strengths.length})
            </h4>
            {audit.strengths.length > 0 ? (
              <ul className="space-y-1.5 text-xs text-slate-800">
                {audit.strengths.map((s, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
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
          <div className="p-4 rounded-2xl bg-amber-50/40 border border-amber-200/80 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              Critical Gaps & Missing Visibility ({audit.criticalWeaknesses.length})
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-800">
              {audit.criticalWeaknesses.map((w, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-amber-600 font-bold">•</span>
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 6. RECOMMENDED ACTION PLAN & PACKAGE */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white mb-6 space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-indigo-800/60">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">
                Strategic Growth Recommendation
              </span>
              <h4 className="text-base font-black mt-0.5">
                Recommended Solution: {audit.suggestedPackage.name}
              </h4>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-xl sm:text-2xl font-black text-amber-400">
                ₹{audit.suggestedPackage.price.toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-slate-300 block">{audit.suggestedPackage.frequency}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
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

          <div className="pt-1 flex justify-between items-center print:hidden">
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
        <div className="pt-4 border-t-2 border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div className="space-y-0.5 text-center sm:text-left">
            <div className="flex items-center gap-1.5 justify-center sm:justify-start font-bold text-slate-900">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>{brandName} Certified Local Business Audit</span>
            </div>
            <p className="text-[11px] text-slate-600">
              Scanned on public Google Maps algorithms, directory citations, and mobile speed indexes.
            </p>
          </div>

          <div className="text-center sm:text-right font-mono text-[11px] text-slate-600">
            <p>Verification Link: {agencyWebsite}/audit</p>
            <p>Helpline: {agencyPhone} | {agencyEmail}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
