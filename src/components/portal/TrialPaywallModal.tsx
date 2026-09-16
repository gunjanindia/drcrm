'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Lock,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  CreditCard,
  Zap,
  ArrowRight,
  MessageCircle,
  Clock,
  Coins,
} from 'lucide-react';
import { Button, Modal } from '@/components/ui';
import { formatINR } from '@/lib/utils';

export interface TrialPaywallModalProps {
  isOpen: boolean;
  onClose?: () => void;
  businessName: string;
  monthlyFee?: number;
  onSubscribed?: () => void;
}

export const TrialPaywallModal: React.FC<TrialPaywallModalProps> = ({
  isOpen,
  onClose,
  businessName,
  monthlyFee = 1500,
  onSubscribed,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handlePayMonthlyFee = async () => {
    setIsProcessing(true);
    try {
      // Simulate Razorpay Payment Flow
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setIsProcessing(false);
      setIsSuccess(true);

      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore
      }

      if (onSubscribed) {
        onSubscribed();
      }
    } catch (e) {
      setIsProcessing(false);
      alert('Subscription payment failed. Please try again or pay via UPI.');
    }
  };

  const adminWhatsAppUrl = `https://wa.me/917004700318?text=${encodeURIComponent(
    `Hi Digital Ranchi, I want to renew my Client 360 Monthly Platform Subscription (₹${monthlyFee}/mo) for ${businessName}.`
  )}`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (onClose) onClose();
      }}
      title="14-Day Free Demo Trial Completed"
    >
      <div className="space-y-5 text-slate-800 dark:text-slate-100 text-xs">
        {isSuccess ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Client 360 Subscription Activated!
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Thank you for subscribing to Client 360 for <strong>{businessName}</strong>. Your full suite access and AI credits are active for the next 30 days.
              </p>
            </div>
            <Button
              variant="primary"
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              onClick={() => {
                setIsSuccess(false);
                if (onClose) onClose();
              }}
            >
              Continue to Dashboard
            </Button>
          </div>
        ) : (
          <>
            {/* Header Box */}
            <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-black text-slate-900 dark:text-white">
                  Unlock Unrestricted Access to Client 360
                </h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  Your 14-day free demo trial has concluded. Activate your monthly platform plan to keep your Google Maps ranking, live reviews sync, and AI tools running seamlessly.
                </p>
              </div>
            </div>

            {/* Plan Details Card */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border-2 border-indigo-500/40 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-black uppercase tracking-wider">
                    Full Growth Plan
                  </span>
                  <h3 className="text-base font-black text-slate-900 dark:text-white mt-1">
                    Client 360 Platform Subscription
                  </h3>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                    {formatINR(monthlyFee)}
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold">per month</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Rank #1 on Google Maps in {businessName}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>24/7 Live Review Management & AI Replies</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>1-Page High-Converting Website Builder</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>50 Monthly AI Credits Included</span>
                </div>
              </div>

              <button
                onClick={handlePayMonthlyFee}
                disabled={isProcessing}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/30 cursor-pointer"
              >
                <CreditCard className="w-4 h-4" />
                <span>
                  {isProcessing
                    ? 'Processing Razorpay Payment...'
                    : `Pay ${formatINR(monthlyFee)} / Month via Razorpay / UPI`}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Offline Support Option */}
            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
              <span>Prefer Direct Bank Transfer / UPI or Invoice?</span>
              <a
                href={adminWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Chat with Admin</span>
              </a>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};
