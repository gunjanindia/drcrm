'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  MapPin,
  Star,
  ShieldCheck,
  ShieldAlert,
  Search,
  TrendingUp,
  AlertTriangle,
  Sparkles,
  Printer,
  FileText,
  MessageCircle,
  Copy,
  Check,
  Plus,
  Trash2,
  RotateCw,
  Users,
  X,
  Store,
  Calendar,
  Zap,
  UserCheck,
  ExternalLink,
} from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { globalStore } from '@/lib/store';
import { AuditRecord, DigitalPresenceAuditResult, Lead } from '@/types';
import { AuditPdfReport } from '@/components/audit/AuditPdfReport';

export default function GbpManagementPage() {
  const [activeTab, setActiveTab] = useState<'scanner' | 'history' | 'monitored'>('scanner');

  // --- LIVE STAFF SCANNER STATE ---
  const [bizName, setBizName] = useState('');
  const [contactName, setContactName] = useState('');
  const [city, setCity] = useState('Ranchi');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState('');
  const [mapsUrl, setMapsUrl] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | undefined>(undefined);
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [currentAuditResult, setCurrentAuditResult] = useState<DigitalPresenceAuditResult | null>(null);

  // --- AUDIT HISTORY & LEADS STATE ---
  const [auditRecords, setAuditRecords] = useState<AuditRecord[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historySearch, setHistorySearch] = useState('');
  const [historyFilter, setHistoryFilter] = useState<'ALL' | 'CRITICAL' | 'MODERATE' | 'STRONG' | 'STAFF' | 'LEADS'>('ALL');

  // --- MODALS & ACTIONS STATE ---
  const [selectedAuditForPdf, setSelectedAuditForPdf] = useState<DigitalPresenceAuditResult | null>(null);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [copiedPitchId, setCopiedPitchId] = useState<string | null>(null);
  const [deletingAuditId, setDeletingAuditId] = useState<string | null>(null);
  const [convertingLeadName, setConvertingLeadName] = useState<string | null>(null);

  // --- MONITORED GBP LISTINGS ---
  const gbpProfiles = globalStore.gbpProfiles;
  const [monitoredSearch, setMonitoredSearch] = useState('');

  // Fetch audit history and CRM leads
  const fetchAuditData = async () => {
    try {
      setIsLoadingHistory(true);
      const [auditRes, leadsRes] = await Promise.all([
        fetch('/api/audit'),
        fetch('/api/leads'),
      ]);

      if (auditRes.ok) {
        const auditJson = await auditRes.json();
        if (auditJson.success && Array.isArray(auditJson.data)) {
          setAuditRecords(auditJson.data);
          globalStore.auditRecords = auditJson.data;
        }
      }

      if (leadsRes.ok) {
        const leadsJson = await leadsRes.json();
        if (leadsJson.success && Array.isArray(leadsJson.data)) {
          setLeads(leadsJson.data);
          globalStore.leads = leadsJson.data;
        }
      }
    } catch (err) {
      console.error('Failed to load audit and leads data:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchAuditData();
  }, []);

  // Helper to check if an audit is converted or linked to a CRM lead
  const isAuditLinkedToLead = (record: AuditRecord | DigitalPresenceAuditResult) => {
    if ((record as AuditRecord).isConvertedToLead || (record as AuditRecord).leadId) return true;
    const recordDigits = (record.phone || '').replace(/[^0-9]/g, '').slice(-10);
    return leads.some((l) => {
      const leadDigits = (l.phone || '').replace(/[^0-9]/g, '').slice(-10);
      const phoneMatch = Boolean(recordDigits && leadDigits && leadDigits === recordDigits);
      const nameMatch = Boolean(
        l.businessName &&
        record.businessName &&
        l.businessName.trim().toLowerCase() === record.businessName.trim().toLowerCase()
      );
      return phoneMatch || nameMatch;
    });
  };

  // Helper to find the matched lead
  const getLinkedLead = (record: AuditRecord | DigitalPresenceAuditResult) => {
    if ((record as AuditRecord).leadId) {
      const found = leads.find((l) => l.id === (record as AuditRecord).leadId);
      if (found) return found;
    }
    const recordDigits = (record.phone || '').replace(/[^0-9]/g, '').slice(-10);
    return leads.find((l) => {
      const leadDigits = (l.phone || '').replace(/[^0-9]/g, '').slice(-10);
      const phoneMatch = Boolean(recordDigits && leadDigits && leadDigits === recordDigits);
      const nameMatch = Boolean(
        l.businessName &&
        record.businessName &&
        l.businessName.trim().toLowerCase() === record.businessName.trim().toLowerCase()
      );
      return phoneMatch || nameMatch;
    });
  };

  // Handle Live Staff Audit Execution
  const handleRunStaffAudit = async (placeIdOverride?: string) => {
    if (!bizName.trim()) {
      setScanError('Please enter a business or clinic name.');
      return;
    }

    try {
      setIsScanning(true);
      setScanError(null);

      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: bizName.trim(),
          contactName: contactName.trim() || undefined,
          city: city.trim() || 'Ranchi',
          phone: phone.trim() || undefined,
          category: category.trim() || undefined,
          googleMapsUrl: mapsUrl.trim() || undefined,
          websiteUrl: websiteUrl.trim() || undefined,
          selectedPlaceId: placeIdOverride || selectedPlaceId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate presence audit');
      }

      if (data.success && data.data) {
        setCurrentAuditResult(data.data);
        if (placeIdOverride) {
          setSelectedPlaceId(placeIdOverride);
        }
        await fetchAuditData();
      }
    } catch (err: any) {
      console.error('Staff audit error:', err);
      setScanError(err?.message || 'Error executing Google Business Profile audit.');
    } finally {
      setIsScanning(false);
    }
  };

  // Convert AuditRecord to DigitalPresenceAuditResult for PDF rendering
  const handleOpenPdfFromRecord = (record: AuditRecord) => {
    const auditRes: DigitalPresenceAuditResult = {
      businessName: record.businessName,
      contactName: record.contactName || record.businessName,
      phone: record.phone,
      email: record.email,
      category: record.category,
      city: record.city || 'Ranchi, Jharkhand',
      overallScore: record.overallScore,
      isVerifiedOnGoogle: record.validationStatus === 'VERIFIED_MATCH',
      validationStatus: record.validationStatus,
      averageRating: record.averageRating,
      reviewCount: record.reviewCount,
      scannedAt: record.scannedAt,
      matchedPlace: record.matchedPlace,
      candidates: record.candidates,
      breakdown: record.breakdown,
      strengths: record.strengths || [],
      criticalWeaknesses: record.criticalWeaknesses || [],
      recommendedImprovements: record.recommendedImprovements || [],
      suggestedPackage: {
        id: record.suggestedPackageId || 'pkg_growth_999',
        name: record.suggestedPackageName || 'Growth Kickstart',
        price: record.suggestedPackagePrice || 999,
        frequency: 'one-time setup',
      },
      disclaimer: 'Official Digital Presence Audit Report generated by Digital Ranchi OS.',
    };

    setSelectedAuditForPdf(auditRes);
    setIsPdfModalOpen(true);
  };

  // 1-Click WhatsApp Share Link Generator
  const generateWhatsAppShareUrl = (targetPhone?: string, businessTitle?: string, score?: number, rating?: number, reviews?: number) => {
    const rawPhone = (targetPhone || '').replace(/[^0-9]/g, '');
    const phoneDigits = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone || '919431109876';
    const name = businessTitle || 'your business';
    const scoreVal = score !== undefined ? `${score}/100` : 'N/A';
    const ratingVal = rating ? `${rating.toFixed(1)}★` : 'N/A';
    const reviewsVal = reviews !== undefined ? `${reviews}` : '0';

    const text = `Hi, this is Digital Ranchi Growth Operations.\n\nWe completed an Executive Google Maps & Digital Presence Audit for *${name}*:\n\n📊 *Overall Visibility Score*: ${scoreVal}\n⭐ *Google Rating*: ${ratingVal} (${reviewsVal} verified reviews)\n📍 *Map Pack Status*: ${score && score >= 75 ? 'Strong Visibility' : 'Critical Gaps Detected'}\n\n📄 *Full PDF Report*: https://digitalranchi.in/audit\n\nWould you like our team to review your Google Maps 3-Pack rankings and review stand setup? Let us know!`;

    return `https://wa.me/${phoneDigits}?text=${encodeURIComponent(text)}`;
  };

  // Copy Executive Summary text to clipboard
  const handleCopySummary = (recordId: string, businessTitle: string, score: number, rating?: number, reviews?: number) => {
    const text = `*${businessTitle}* — Google Business Presence Audit:\n• Overall Score: ${score}/100\n• Google Rating: ${rating ? `${rating.toFixed(1)}★` : 'N/A'} (${reviews || 0} reviews)\n• Status: ${score >= 75 ? 'Strong' : score >= 50 ? 'Moderate' : 'Critical Fixes Needed'}\n• Verified via Digital Ranchi Growth Engine`;
    navigator.clipboard.writeText(text);
    setCopiedPitchId(recordId);
    setTimeout(() => setCopiedPitchId(null), 2500);
  };

  // Convert Audited Business to CRM Lead (Retaining audit item in list & updating status)
  const handleConvertAuditToLead = async (record: AuditRecord) => {
    try {
      setConvertingLeadName(record.businessName);
      const cleanPhone = (record.phone || '').trim().replace(/[^0-9+]/g, '');
      const formattedPhone = cleanPhone || `+91 98765 43210`;

      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: record.businessName,
          contactName: record.contactName || record.businessName,
          phone: formattedPhone,
          whatsapp: formattedPhone,
          email: `${record.businessName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'lead'}@lead.digitalranchi.in`,
          category: record.category || 'Local Business',
          city: record.city || 'Ranchi',
          state: 'Jharkhand',
          leadSource: 'GBP Staff Audit Command Center',
          estimatedValue: record.suggestedPackagePrice || 999,
          leadScore: record.overallScore,
          auditScore: record.overallScore,
          status: 'AUDIT',
          notes: `Created from GBP Audit Log. Score: ${record.overallScore}/100. Rating: ${record.averageRating || 'N/A'}★ (${record.reviewCount || 0} reviews). Status: ${record.validationStatus}.`,
        }),
      });

      if (res.ok) {
        const leadJson = await res.json();
        const createdLead = leadJson.data;

        // Mark the audit record as converted to lead via PATCH
        await fetch('/api/audit', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: record.id,
            isConvertedToLead: true,
            leadId: createdLead?.id,
          }),
        }).catch(() => null);

        // Update local audit records and leads state without removing from list
        setAuditRecords((prev) =>
          prev.map((r) =>
            r.id === record.id
              ? { ...r, isConvertedToLead: true, leadId: createdLead?.id }
              : r
          )
        );

        if (createdLead) {
          setLeads((prev) => [createdLead, ...prev]);
        }

        alert(`✅ Created Lead for "${record.businessName}" in CRM Pipeline! Audit record remains active in history.`);
      } else {
        alert('Failed to save lead in CRM pipeline.');
      }
    } catch (err) {
      console.error('Lead conversion error:', err);
      alert('Error creating lead from audit record.');
    } finally {
      setConvertingLeadName(null);
    }
  };

  // Delete Audit Record
  const handleDeleteAuditRecord = async (recordId: string) => {
    if (!confirm('Are you sure you want to delete this audit record from history?')) return;
    try {
      setDeletingAuditId(recordId);
      const res = await fetch(`/api/audit?id=${recordId}`, { method: 'DELETE' });
      if (res.ok) {
        setAuditRecords((prev) => prev.filter((r) => r.id !== recordId));
      } else {
        alert('Failed to delete audit record');
      }
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setDeletingAuditId(null);
    }
  };

  // Filtered Audit History Records
  const filteredHistory = auditRecords.filter((r) => {
    const matchesSearch =
      r.businessName.toLowerCase().includes(historySearch.toLowerCase()) ||
      r.city.toLowerCase().includes(historySearch.toLowerCase()) ||
      (r.phone && r.phone.includes(historySearch)) ||
      (r.auditedByUserName && r.auditedByUserName.toLowerCase().includes(historySearch.toLowerCase()));

    if (!matchesSearch) return false;

    if (historyFilter === 'CRITICAL') return r.overallScore < 50;
    if (historyFilter === 'MODERATE') return r.overallScore >= 50 && r.overallScore < 75;
    if (historyFilter === 'STRONG') return r.overallScore >= 75;
    if (historyFilter === 'STAFF') return r.isStaffAudit === true;
    if (historyFilter === 'LEADS') return isAuditLinkedToLead(r);
    return true;
  });

  // Filtered Monitored Listings
  const filteredMonitored = gbpProfiles.filter(
    (p) =>
      p.clientName.toLowerCase().includes(monitoredSearch.toLowerCase()) ||
      p.primaryCategory.toLowerCase().includes(monitoredSearch.toLowerCase())
  );

  return (
    <>
      <div className={`space-y-6 ${isPdfModalOpen ? 'print:hidden' : ''}`} data-hide-on-audit-print={isPdfModalOpen ? 'true' : 'false'}>
        {/* Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>Google Business Profile (GBP) & Audit Hub</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-500" />
              <span>Unrestricted Staff Audits</span>
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit any local business on Google Maps without daily limits, track permanent audit history, link to CRM leads, and share via WhatsApp.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAuditData}
            isLoading={isLoadingHistory}
            icon={RotateCw}
          >
            Refresh
          </Button>
          <Link href="/app/leads">
            <Button variant="outline" size="sm" icon={Users}>
              View Leads Pipeline ({leads.length})
            </Button>
          </Link>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 w-fit">
        <button
          onClick={() => setActiveTab('scanner')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'scanner'
              ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Live GBP Audit Scanner</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'history'
              ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Audit History & Intelligence Log</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold ml-1">
            {auditRecords.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('monitored')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'monitored'
              ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Monitored Client Listings</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: LIVE STAFF SCANNER (UNRESTRICTED) */}
      {/* ========================================================= */}
      {activeTab === 'scanner' && (
        <div className="space-y-6">
          {/* Scanner Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center font-bold">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    Staff Live GBP Diagnostic Scanner
                  </h3>
                  <p className="text-xs text-slate-500">
                    Real-time multi-query Google Maps search & HTML review extraction (No daily limit).
                  </p>
                </div>
              </div>

              <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                Staff Bypass Active
              </span>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleRunStaffAudit();
              }}
              className="space-y-4 text-xs"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Business / Clinic Name *"
                  placeholder="e.g. Asian Hospital, Dhanbad or Kaveri Salon, Ranchi"
                  value={bizName}
                  onChange={(e) => setBizName(e.target.value)}
                  required
                />
                <Input
                  label="City / Location *"
                  placeholder="e.g. Ranchi, Dhanbad, Jamshedpur"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                />
                <Input
                  label="Owner Phone / WhatsApp (For Direct Share)"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Category / Industry"
                  placeholder="e.g. Hospital, Dental Clinic, Restaurant"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
                <Input
                  label="Google Maps URL (Optional direct match)"
                  placeholder="https://maps.app.goo.gl/... or google.com/maps/..."
                  value={mapsUrl}
                  onChange={(e) => setMapsUrl(e.target.value)}
                />
                <Input
                  label="Website URL (Optional)"
                  placeholder="https://businesswebsite.in"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                />
              </div>

              {scanError && (
                <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{scanError}</span>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={isScanning}
                  icon={Sparkles}
                  className="shadow-indigo-600/30"
                >
                  Run Real-Time GBP Audit
                </Button>
              </div>
            </form>
          </div>

          {/* Audit Results Presentation */}
          {currentAuditResult && (
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg space-y-6 animate-in fade-in slide-in-from-bottom-4">
              
              {/* Header with Quick Action Bar */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center text-white font-black shadow-md ${
                      currentAuditResult.overallScore >= 75
                        ? 'bg-gradient-to-tr from-emerald-600 to-teal-500'
                        : currentAuditResult.overallScore >= 50
                        ? 'bg-gradient-to-tr from-indigo-600 to-sky-500'
                        : 'bg-gradient-to-tr from-rose-600 to-amber-500'
                    }`}
                  >
                    <span className="text-2xl">{currentAuditResult.overallScore}</span>
                    <span className="text-[9px] uppercase opacity-80">Score</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <span>{currentAuditResult.businessName}</span>
                      {isAuditLinkedToLead(currentAuditResult) && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1">
                          <UserCheck className="w-3 h-3 text-indigo-600" />
                          <span>Lead in CRM</span>
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{currentAuditResult.matchedPlace?.formattedAddress || currentAuditResult.city || 'Ranchi'}</span>
                    </p>
                  </div>
                </div>

                {/* 1-Click Action Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    icon={Printer}
                    onClick={() => {
                      setSelectedAuditForPdf(currentAuditResult);
                      setIsPdfModalOpen(true);
                    }}
                    className="shadow-indigo-600/20"
                  >
                    Download / Print PDF
                  </Button>

                  <a
                    href={generateWhatsAppShareUrl(
                      currentAuditResult.phone || phone,
                      currentAuditResult.businessName,
                      currentAuditResult.overallScore,
                      currentAuditResult.averageRating,
                      currentAuditResult.reviewCount
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Share on WhatsApp
                  </a>

                  {isAuditLinkedToLead(currentAuditResult) ? (
                    <Link
                      href={`/app/leads?search=${encodeURIComponent(currentAuditResult.businessName)}`}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 border border-indigo-200 dark:border-indigo-800 font-bold text-xs transition-all"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Open in Leads</span>
                    </Link>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      icon={Plus}
                      onClick={() => handleConvertAuditToLead(currentAuditResult as any)}
                      isLoading={convertingLeadName === currentAuditResult.businessName}
                    >
                      Convert to Lead
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    icon={copiedPitchId === 'current' ? Check : Copy}
                    onClick={() =>
                      handleCopySummary(
                        'current',
                        currentAuditResult.businessName,
                        currentAuditResult.overallScore,
                        currentAuditResult.averageRating,
                        currentAuditResult.reviewCount
                      )
                    }
                  >
                    {copiedPitchId === 'current' ? 'Copied!' : 'Copy Summary'}
                  </Button>
                </div>
              </div>

              {/* Multiple Candidate Branches Disambiguation */}
              {currentAuditResult.candidates && currentAuditResult.candidates.length > 1 && (
                <div className="p-4 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                    <Store className="w-4 h-4 text-indigo-600" />
                    <span>Multiple Locations Found ({currentAuditResult.candidates.length} Google Maps Places):</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {currentAuditResult.candidates.map((cand) => {
                      const isSelected =
                        currentAuditResult.matchedPlace?.placeId === cand.placeId ||
                        selectedPlaceId === cand.placeId;
                      return (
                        <div
                          key={cand.placeId}
                          onClick={() => handleRunStaffAudit(cand.placeId)}
                          className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-white dark:bg-slate-900 border-indigo-500 shadow-md ring-2 ring-indigo-500/20'
                              : 'bg-white/70 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-indigo-300'
                          }`}
                        >
                          <div className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
                            <span>{cand.name}</span>
                            {isSelected && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-indigo-600 text-white">
                                Active
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5 truncate">{cand.formattedAddress}</p>
                          {cand.rating && (
                            <span className="text-[10px] font-bold text-amber-600 mt-1 inline-flex items-center gap-1">
                              <Star className="w-3 h-3 fill-current" />
                              {cand.rating}★ ({cand.userRatingsTotal || 0} reviews)
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Key Metrics Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40">
                  <span className="text-[10px] font-bold text-amber-800 uppercase block">Google Rating</span>
                  <div className="my-1 flex items-center gap-1">
                    <span className="text-2xl font-black text-amber-900 dark:text-amber-300">
                      {currentAuditResult.averageRating ? currentAuditResult.averageRating.toFixed(1) : 'N/A'}
                    </span>
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  </div>
                  <span className="text-[11px] text-amber-700">Verified Google Place</span>
                </div>

                <div className="p-4 rounded-2xl bg-sky-50/60 dark:bg-sky-950/20 border border-sky-200/60 dark:border-sky-900/40">
                  <span className="text-[10px] font-bold text-sky-800 uppercase block">Total Reviews</span>
                  <div className="my-1">
                    <span className="text-2xl font-black text-sky-950 dark:text-sky-300">
                      {currentAuditResult.reviewCount !== undefined ? currentAuditResult.reviewCount : 0}
                    </span>
                    <span className="text-[11px] text-sky-700 ml-1">Reviews</span>
                  </div>
                  <span className="text-[11px] text-sky-700">Customer Feedback</span>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase block">Verification Status</span>
                  <div className="my-1 flex items-center gap-1 font-black text-emerald-950 dark:text-emerald-300 text-sm">
                    {currentAuditResult.validationStatus === 'VERIFIED_MATCH' ? (
                      <>
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>Verified Profile</span>
                      </>
                    ) : (
                      <>
                        <ShieldAlert className="w-4 h-4 text-amber-600" />
                        <span>Unclaimed / Missing</span>
                      </>
                    )}
                  </div>
                  <span className="text-[11px] text-emerald-700 truncate block">
                    {currentAuditResult.city || 'Ranchi'}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-900/40">
                  <span className="text-[10px] font-bold text-indigo-800 uppercase block">Recommended Solution</span>
                  <div className="my-1 font-black text-indigo-950 dark:text-indigo-300 text-sm truncate">
                    {currentAuditResult.suggestedPackage?.name}
                  </div>
                  <span className="text-[11px] text-indigo-700">
                    ₹{currentAuditResult.suggestedPackage?.price.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* 6-Pillar Breakdown */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  6-Pillar Diagnostic Scores:
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  {Object.entries(currentAuditResult.breakdown).map(([pillar, score]) => (
                    <div
                      key={pillar}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800"
                    >
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-slate-700 dark:text-slate-300 capitalize truncate">
                          {pillar.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <span
                          className={`font-black ${
                            score >= 70 ? 'text-emerald-600' : score >= 40 ? 'text-indigo-600' : 'text-rose-600'
                          }`}
                        >
                          {score}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 mt-1.5 overflow-hidden">
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
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: AUDIT HISTORY & INTELLIGENCE LOG */}
      {/* ========================================================= */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {/* Filters & Search */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search audits by business, phone, city, auditor..."
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
              {[
                { id: 'ALL', label: 'All Audits' },
                { id: 'STAFF', label: 'Staff Scans' },
                { id: 'LEADS', label: 'In Leads Pipeline' },
                { id: 'CRITICAL', label: 'Critical (<50)' },
                { id: 'MODERATE', label: 'Moderate (50-74)' },
                { id: 'STRONG', label: 'Strong (75+)' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setHistoryFilter(f.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    historyFilter === f.id
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* History Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-950/70 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">Business & City</th>
                    <th className="py-3.5 px-4">Google Rating & Reviews</th>
                    <th className="py-3.5 px-4">Presence Score</th>
                    <th className="py-3.5 px-4">Audited By / Date</th>
                    <th className="py-3.5 px-4">Pipeline Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredHistory.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-500">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Calendar className="w-8 h-8 text-slate-300 dark:text-slate-700" />
                          <p className="font-semibold text-sm">No past audit logs found</p>
                          <p className="text-xs text-slate-400">
                            Run a live audit using the scanner tab above.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredHistory.map((rec) => {
                      const ratingVal = rec.averageRating || (rec.validationStatus === 'VERIFIED_MATCH' ? 4.6 : 0);
                      const reviewsVal = rec.reviewCount !== undefined ? rec.reviewCount : 0;
                      const dateStr = rec.scannedAt
                        ? new Date(rec.scannedAt).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : 'Just now';

                      const isLinked = isAuditLinkedToLead(rec);
                      const matchedLead = getLinkedLead(rec);

                      return (
                        <tr key={rec.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900 dark:text-white text-sm">
                              {rec.businessName}
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                              <span className="font-medium text-slate-700 dark:text-slate-300">{rec.city || 'Ranchi'}</span>
                              <span>•</span>
                              <span>{rec.category || 'Local Business'}</span>
                              {rec.phone && (
                                <>
                                  <span>•</span>
                                  <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{rec.phone}</span>
                                </>
                              )}
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1 text-amber-500 font-bold">
                              <span>{ratingVal > 0 ? ratingVal.toFixed(1) : 'N/A'}</span>
                              <Star className="w-3.5 h-3.5 fill-amber-500" />
                              <span className="text-slate-500 font-normal ml-1">
                                ({reviewsVal} reviews)
                              </span>
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5 font-bold">
                                <span
                                  className={
                                    rec.overallScore >= 75
                                      ? 'text-emerald-600'
                                      : rec.overallScore >= 50
                                      ? 'text-amber-600'
                                      : 'text-rose-600'
                                  }
                                >
                                  {rec.overallScore}/100
                                </span>
                              </div>
                              <div className="w-20 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    rec.overallScore >= 75
                                      ? 'bg-emerald-500'
                                      : rec.overallScore >= 50
                                      ? 'bg-amber-500'
                                      : 'bg-rose-500'
                                  }`}
                                  style={{ width: `${rec.overallScore}%` }}
                                />
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <div className="font-medium text-slate-800 dark:text-slate-200">
                              {rec.auditedByUserName || 'Public Visitor'}
                            </div>
                            <div className="text-[10px] text-slate-400">{dateStr}</div>
                          </td>

                          <td className="py-3 px-4">
                            <div className="flex flex-col gap-1">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase w-fit ${
                                  rec.validationStatus === 'VERIFIED_MATCH'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800'
                                    : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800'
                                }`}
                              >
                                {rec.validationStatus === 'VERIFIED_MATCH' ? 'Verified GBP' : 'Unclaimed'}
                              </span>

                              {isLinked ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1 w-fit">
                                  <UserCheck className="w-3 h-3 text-indigo-600" />
                                  <span>In CRM Leads</span>
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full text-[10px] text-slate-500 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 w-fit">
                                  Audit Record
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* PDF View / Print */}
                              <button
                                onClick={() => handleOpenPdfFromRecord(rec)}
                                className="px-2 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 border border-indigo-200 dark:border-indigo-800 font-bold text-[11px] flex items-center gap-1 transition-all"
                                title="Download / Print PDF Report"
                              >
                                <FileText className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">PDF</span>
                              </button>

                              {/* WhatsApp Share */}
                              <a
                                href={generateWhatsAppShareUrl(
                                  rec.phone,
                                  rec.businessName,
                                  rec.overallScore,
                                  rec.averageRating,
                                  rec.reviewCount
                                )}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border border-emerald-500/30 transition-colors"
                                title="Share Report on WhatsApp"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                              </a>

                              {/* Convert to Lead OR Open Linked Lead */}
                              {isLinked ? (
                                <Link
                                  href={`/app/leads?search=${encodeURIComponent(rec.businessName)}`}
                                  className="px-2 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 border border-indigo-200 dark:border-indigo-800 font-bold text-[11px] flex items-center gap-1 transition-all"
                                  title={`Open Lead (${matchedLead?.contactName || rec.businessName}) in CRM`}
                                >
                                  <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                                  <span className="hidden sm:inline">Open Lead</span>
                                </Link>
                              ) : (
                                <button
                                  onClick={() => handleConvertAuditToLead(rec)}
                                  disabled={convertingLeadName === rec.businessName}
                                  className="px-2 py-1 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 hover:bg-sky-100 border border-sky-200 dark:border-sky-800 font-bold text-[11px] flex items-center gap-1 transition-all"
                                  title="Add to Leads Pipeline"
                                >
                                  <Plus className="w-3.5 h-3.5 text-sky-600" />
                                  <span className="hidden sm:inline">
                                    {convertingLeadName === rec.businessName ? 'Adding...' : '+ Lead'}
                                  </span>
                                </button>
                              )}

                              {/* Delete Record */}
                              <button
                                onClick={() => handleDeleteAuditRecord(rec.id)}
                                disabled={deletingAuditId === rec.id}
                                className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 hover:bg-rose-100 border border-rose-200 dark:border-rose-800 transition-colors"
                                title="Delete from History"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
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
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: MONITORED CLIENT LISTINGS */}
      {/* ========================================================= */}
      {activeTab === 'monitored' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search client GBP listings..."
                value={monitoredSearch}
                onChange={(e) => setMonitoredSearch(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredMonitored.map((profile) => (
              <div
                key={profile.id}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      {profile.clientName}
                    </h3>
                    <p className="text-[11px] text-slate-500">{profile.primaryCategory}</p>
                  </div>
                  <span className="text-xs font-black text-indigo-600 px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800">
                    GBP Health: {profile.healthScore}%
                  </span>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                    <span className="text-[9px] text-slate-400 block uppercase font-bold">Rating</span>
                    <span className="font-bold text-amber-500 flex items-center justify-center gap-0.5">
                      {profile.rating} <Star className="w-3 h-3 fill-amber-500" />
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                    <span className="text-[9px] text-slate-400 block uppercase font-bold">Reviews</span>
                    <span className="font-bold text-slate-900 dark:text-white">{profile.reviewCount}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                    <span className="text-[9px] text-slate-400 block uppercase font-bold">Photos</span>
                    <span className="font-bold text-emerald-600">{profile.photosCount} Live</span>
                  </div>
                </div>

                {/* Top Keywords */}
                <div className="space-y-1.5 text-xs">
                  <span className="font-bold text-[11px] text-slate-700 dark:text-slate-300 block">
                    Top Tracked Local Search Keywords:
                  </span>
                  {profile.topKeywords.map((kw, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-[11px]"
                    >
                      <span className="text-slate-700 dark:text-slate-300">"{kw.keyword}"</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400">{kw.localSearchVolume}</span>
                        <span className="font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded">
                          Rank #{kw.rank}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      </div>

      {/* PDF View / Print Full Modal */}
      {isPdfModalOpen && selectedAuditForPdf && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm p-2 sm:p-4 flex items-start justify-center print:p-0 print:bg-white print:static print:overflow-visible print:block">
          <div className="relative w-full max-w-5xl my-4 sm:my-8 print:my-0 print:max-w-full print:static">
            <button
              onClick={() => setIsPdfModalOpen(false)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 shadow-md print:hidden"
            >
              <X className="w-5 h-5" />
            </button>
            <AuditPdfReport
              audit={selectedAuditForPdf}
              onClose={() => setIsPdfModalOpen(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}
