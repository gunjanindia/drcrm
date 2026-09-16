'use client';

import React from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Lock,
  MessageCircle,
  PhoneCall,
  ExternalLink,
  Sparkles,
  Building,
  Mail,
  HelpCircle,
} from 'lucide-react';
import { Button, Modal } from '@/components/ui';

export interface GbpLinkGateModalProps {
  isOpen: boolean;
  onClose?: () => void;
  businessName: string;
  userEmail?: string;
  onConnectGoogle?: () => void;
}

export const GbpLinkGateModal: React.FC<GbpLinkGateModalProps> = ({
  isOpen,
  onClose,
  businessName,
  userEmail,
  onConnectGoogle,
}) => {
  const adminWhatsAppUrl = `https://wa.me/917004700318?text=${encodeURIComponent(
    `Hi Digital Ranchi Admin, my business '${businessName}' is not linked with my Google account (${userEmail || ''}). Please verify and link my Google Business Profile to my Client 360 dashboard.`
  )}`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        // Can be dismissed or kept persistent
        if (onClose) onClose();
      }}
      title="Google Business Profile Verification Required"
    >
      <div className="space-y-5 text-slate-800 dark:text-slate-100 text-xs">
        {/* Warning Hero Box */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-black text-slate-900 dark:text-white">
              Business Not Linked to Authenticated Google Account
            </h4>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              The Google Business Profile for <strong>"{businessName}"</strong> is not yet associated with your signed-in Google account (<strong>{userEmail || 'Active Session'}</strong>).
            </p>
          </div>
        </div>

        {/* Steps Required */}
        <div className="space-y-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="font-black uppercase tracking-wider text-[10px] text-slate-400 block mb-1">
            Required Next Steps to Access Dashboard:
          </span>

          <div className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                1
              </span>
              <p>
                <strong>Sign in with Verified Google Owner Account:</strong> If your Google Business Profile is managed under a different Gmail/Workspace account, reconnect with that account.
              </p>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                2
              </span>
              <p>
                <strong>Request Admin Access Linking:</strong> Contact Digital Ranchi Admin to grant delegated manager access or manually link your Google Maps Place ID.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-1">
          {onConnectGoogle && (
            <button
              onClick={onConnectGoogle}
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-600/20"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#ffffff"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
              </svg>
              <span>Connect Different Google Account</span>
            </button>
          )}

          <div className="grid grid-cols-2 gap-2">
            <a
              href={adminWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp Admin</span>
            </a>

            <a
              href="tel:+917004700318"
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Call +91 70047 00318</span>
            </a>
          </div>
        </div>

        {/* Demo Mode Notice */}
        <p className="text-[10px] text-slate-400 text-center">
          Security policy: Only verified Google Business Profile owners and authorized staff may access live GBP controls and automated reviews.
        </p>
      </div>
    </Modal>
  );
};
