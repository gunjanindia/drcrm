'use client';

import React, { useState, useEffect } from 'react';
import { PortalSidebar } from '@/components/layout/PortalSidebar';
import { GbpDataSyncWizardModal } from '@/components/portal/GbpDataSyncWizardModal';
import {
  getSyncedBusinessProfile,
  SyncedBusinessProfile,
  DEMO_BUSINESS_PROFILE,
  fetchPortalProfileFromServer,
} from '@/lib/client-portal-sync';
import { Sparkles, CheckCircle2, AlertTriangle, RefreshCw, ShieldAlert, PhoneCall, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui';

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<SyncedBusinessProfile>(DEMO_BUSINESS_PROFILE);
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  useEffect(() => {
    setProfile(getSyncedBusinessProfile());
    fetchPortalProfileFromServer().then((loaded) => {
      if (loaded) setProfile(loaded);
    });

    const handleProfileUpdate = (e: any) => {
      if (e.detail) setProfile(e.detail);
    };

    window.addEventListener('drcrm_gbp_profile_updated', handleProfileUpdate);
    return () => window.removeEventListener('drcrm_gbp_profile_updated', handleProfileUpdate);
  }, []);

  const isPaused = profile.status === 'PAUSED' || profile.status === 'CHURNED';

  return (
    <div className="flex h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-white overflow-hidden">
      {/* Client Sidebar */}
      <PortalSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Deactivated / Suspended Account Alert Banner */}
        {isPaused && (
          <div className="bg-gradient-to-r from-rose-700 via-rose-800 to-amber-900 px-4 py-3 text-white text-xs font-bold flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg shrink-0 border-b border-rose-600/50">
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 rounded-xl bg-black/25 text-white">
                <ShieldAlert className="w-4 h-4 text-rose-300" />
              </span>
              <span>
                <strong>Portal Access Suspended:</strong> This Client 360 portal has been deactivated. Please contact Digital Ranchi administration to reactivate your services.
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <a
                href={`https://wa.me/917004700318?text=${encodeURIComponent(
                  `Hi Digital Ranchi, please reactivate my Client 360 portal for ${profile.businessName}.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-black uppercase tracking-wider transition-all shadow-sm flex items-center gap-1.5"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                WhatsApp Admin
              </a>
              <a
                href="tel:+917004700318"
                className="px-3 py-1.5 rounded-xl bg-black/30 hover:bg-black/40 text-white text-[11px] font-bold transition-all flex items-center gap-1.5"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                Call Support
              </a>
            </div>
          </div>
        )}

        {/* First-Time Setup Alert Banner if in Demo Mode */}
        {!isPaused && !profile.isLiveSynced && (
          <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 px-4 py-2.5 text-slate-950 text-xs font-bold flex flex-col sm:flex-row items-center justify-between gap-2 shadow-md shrink-0">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-black/20 text-white">
                <AlertTriangle className="w-3.5 h-3.5" />
              </span>
              <span>
                Currently showing Baseline Preview Data. Connect your official Google Business Profile to sync your actual ranking, real reviews & live data!
              </span>
            </div>
            <button
              onClick={() => setIsWizardOpen(true)}
              className="px-3 py-1 rounded-xl bg-slate-950 hover:bg-slate-900 text-white text-[11px] font-black uppercase tracking-wider transition-all shadow-sm shrink-0 flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3 h-3 text-amber-300" />
              Run 2-Min GBP Setup Wizard
            </button>
          </div>
        )}

        {/* Header */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 px-6 flex items-center justify-between sticky top-0 z-30 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900 dark:text-white tracking-tight truncate max-w-[340px]">
                {profile.businessName}
              </h1>
              {isPaused ? (
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-300 flex items-center gap-1">
                  <ShieldAlert className="w-2.5 h-2.5" />
                  Deactivated
                </span>
              ) : profile.isLiveSynced ? (
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  Live GBP Synced
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                  Preview Mode
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              {profile.category} • {profile.city} • Client 360 Growth Portal
            </p>
          </div>

          <div className="flex items-center gap-2">
            {!isPaused && (
              <Button
                variant="outline"
                size="sm"
                icon={RefreshCw}
                onClick={() => setIsWizardOpen(true)}
              >
                {profile.isLiveSynced ? 'Update GBP Sync' : 'Sync Live GBP'}
              </Button>
            )}

            <a
              href={`https://wa.me/917004700318?text=${encodeURIComponent(
                `Hi Digital Ranchi, I have a question about Client 360 portal for ${profile.businessName}.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100 transition-colors hidden sm:inline-block"
            >
              WhatsApp Support
            </a>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-slate-950">
          <div className="max-w-6xl mx-auto space-y-6">{children}</div>
        </main>
      </div>

      {/* GBP Data Sync Wizard Modal */}
      <GbpDataSyncWizardModal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onSyncComplete={(newProfile) => {
          setProfile(newProfile);
          setIsWizardOpen(false);
        }}
      />
    </div>
  );
}
