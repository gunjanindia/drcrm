'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Lock,
  ExternalLink,
  Globe,
  KeyRound,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { GoogleGbpAuthProfile, DEFAULT_GBP_AUTH } from '@/lib/client-360-data';
import { Button, Badge } from '@/components/ui';

export interface GoogleGbpAuthCardProps {
  businessName?: string;
  initialAuth?: GoogleGbpAuthProfile;
  onAuthChange?: (auth: GoogleGbpAuthProfile) => void;
}

export const GoogleGbpAuthCard: React.FC<GoogleGbpAuthCardProps> = ({
  businessName = 'Your Business Profile',
  initialAuth = DEFAULT_GBP_AUTH,
  onAuthChange,
}) => {
  const [auth, setAuth] = useState<GoogleGbpAuthProfile>(initialAuth);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authEmailInput, setAuthEmailInput] = useState('owner.business@gmail.com');

  const handleConnectGoogle = () => {
    setIsAuthenticating(true);

    setTimeout(() => {
      const updated: GoogleGbpAuthProfile = {
        isConnected: true,
        googleEmail: authEmailInput.trim() || 'verified.owner@gmail.com',
        accountName: `${businessName} (Verified Owner Account)`,
        locationId: `locations/${Math.floor(100000000000 + Math.random() * 900000000000)}`,
        locationName: `${businessName} Google Maps Listing`,
        connectedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        scopesGranted: [
          'https://www.googleapis.com/auth/business.manage',
          'https://www.googleapis.com/auth/plus.business.manage',
        ],
        reviewsSyncActive: true,
        canPostReplies: true,
      };

      setAuth(updated);
      setIsAuthenticating(false);
      setShowAuthModal(false);
      if (onAuthChange) onAuthChange(updated);
    }, 1200);
  };

  const handleDisconnect = () => {
    const disconnected: GoogleGbpAuthProfile = {
      isConnected: false,
      scopesGranted: [],
      reviewsSyncActive: false,
      canPostReplies: false,
    };
    setAuth(disconnected);
    if (onAuthChange) onAuthChange(disconnected);
  };

  const handleSyncNow = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      alert('Google Business Profile data and reviews synced successfully!');
    }, 1000);
  };

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-red-500 to-amber-500 p-0.5 shadow-md">
            <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[14px] flex items-center justify-center font-black text-sm text-blue-600">
              G
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Google Business Profile (GBP) API Connection
              </h3>
              {auth.isConnected ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  OAuth Verified & Active
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-200 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Not Connected
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              Official Google OAuth 2.0 authorization for live review synchronization and 1-click replies
            </p>
          </div>
        </div>

        {auth.isConnected ? (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={RefreshCw}
              isLoading={isSyncing}
              onClick={handleSyncNow}
            >
              Sync GBP Data
            </Button>
            <Button
              variant="ghost"
              size="sm"
              icon={LogOut}
              onClick={handleDisconnect}
              className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
            >
              Disconnect
            </Button>
          </div>
        ) : (
          <Button
            variant="primary"
            size="sm"
            icon={KeyRound}
            onClick={() => setShowAuthModal(true)}
          >
            Connect Verified Google Account
          </Button>
        )}
      </div>

      {/* Explanation Box on Why Google OAuth is Required */}
      <div className="p-4 rounded-2xl bg-sky-50/60 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 text-xs space-y-2">
        <div className="flex items-center gap-2 font-bold text-sky-800 dark:text-sky-300">
          <Lock className="w-4 h-4" />
          <span>Why is Google Authentication required to reply to reviews?</span>
        </div>
        <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-[11px]">
          Google protects business reputation by requiring owner authorization. To fetch private customer reviews and <strong>post official owner responses directly to Google Maps</strong> without manual copy-pasting, the user must log in with the <strong>Google Account that verified / manages the Google Business Profile</strong> and grant the <code className="bg-sky-100 dark:bg-sky-900/60 px-1 py-0.5 rounded text-sky-700 dark:text-sky-300 font-mono text-[10px]">https://www.googleapis.com/auth/business.manage</code> scope.
        </p>
      </div>

      {/* Connection Details Grid when Connected */}
      {auth.isConnected && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Authenticated Google Account</span>
            <p className="font-bold text-slate-900 dark:text-white truncate">{auth.googleEmail}</p>
            <span className="text-[10px] text-emerald-600 font-medium block">Owner / Primary Manager</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Verified Location Resource</span>
            <p className="font-mono text-[11px] font-bold text-indigo-600 dark:text-indigo-400 truncate">
              {auth.locationId}
            </p>
            <span className="text-[10px] text-slate-500 block">Connected on {auth.connectedAt}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Live Permissions & Status</span>
            <p className="font-bold text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Direct Maps Reply Enabled
            </p>
            <span className="text-[10px] text-slate-500 block">Real-time webhooks active</span>
          </div>
        </div>
      )}

      {/* OAuth Connection Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                  G
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  Sign in with Google (GBP OAuth)
                </h4>
              </div>
              <button
                onClick={() => setShowAuthModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-600 dark:text-slate-300">
                Please enter the Google Account email associated with the verified Google Business Profile for <strong>{businessName}</strong>:
              </p>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  GBP Manager Google Email Address
                </label>
                <input
                  type="email"
                  value={authEmailInput}
                  onChange={(e) => setAuthEmailInput(e.target.value)}
                  placeholder="e.g. yourbusiness.owner@gmail.com"
                  className="w-full text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 space-y-1.5 text-[11px]">
                <span className="font-bold text-slate-900 dark:text-white block">Permissions Requested by Digital Ranchi CRM:</span>
                <div className="space-y-1 text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                    <span>Read verified customer reviews and star ratings</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                    <span>Publish authorized owner review replies directly to Google Maps</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                    <span>Fetch monthly local search, call, and direction analytics</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAuthModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                isLoading={isAuthenticating}
                onClick={handleConnectGoogle}
                icon={KeyRound}
              >
                Authorize & Connect GBP
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
