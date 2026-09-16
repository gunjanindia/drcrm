'use client';

import React, { useState } from 'react';
import { Sparkles, Coins, Plus, Clock, ShieldCheck, AlertCircle } from 'lucide-react';
import { AIPointsWalletModal } from './AIPointsWalletModal';

export interface AiCreditWalletBadgeProps {
  credits?: number;
  trialDaysLeft?: number;
  isTrialActive?: boolean;
  subscriptionStatus?: string;
  onCreditsUpdated?: (newCredits: number) => void;
}

export const AiCreditWalletBadge: React.FC<AiCreditWalletBadgeProps> = ({
  credits = 20,
  trialDaysLeft = 14,
  isTrialActive = true,
  subscriptionStatus = 'TRIAL',
  onCreditsUpdated,
}) => {
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [currentCredits, setCurrentCredits] = useState(credits);

  React.useEffect(() => {
    setCurrentCredits(credits);
  }, [credits]);

  const handlePointsAdded = (added: number) => {
    const updated = currentCredits + added;
    setCurrentCredits(updated);
    if (onCreditsUpdated) {
      onCreditsUpdated(updated);
    }
  };

  const isLowCredits = currentCredits <= 5;
  const isZeroCredits = currentCredits === 0;

  return (
    <>
      <div className="flex items-center gap-2">
        {/* Trial Days Indicator Pill */}
        {subscriptionStatus === 'TRIAL' && (
          <div
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all ${
              trialDaysLeft <= 3
                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>
              {trialDaysLeft > 0 ? `${trialDaysLeft} Days Demo Trial` : 'Trial Expired'}
            </span>
          </div>
        )}

        {subscriptionStatus === 'ACTIVE' && (
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Pro Subscribed</span>
          </div>
        )}

        {/* AI Credits Wallet Badge */}
        <button
          onClick={() => setIsWalletOpen(true)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl border font-bold text-xs transition-all shadow-xs cursor-pointer ${
            isZeroCredits
              ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/30 animate-pulse'
              : isLowCredits
              ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30'
              : 'bg-purple-500/10 hover:bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/25'
          }`}
          title="Click to manage AI Credits & Recharge Wallet"
        >
          <div className="flex items-center gap-1.5">
            <Coins
              className={`w-3.5 h-3.5 ${
                isZeroCredits
                  ? 'text-rose-500'
                  : isLowCredits
                  ? 'text-amber-500'
                  : 'text-purple-500'
              }`}
            />
            <span>
              <strong>{currentCredits}</strong> AI Credits
            </span>
          </div>

          <span className="w-4 h-4 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px]">
            <Plus className="w-3 h-3" />
          </span>
        </button>
      </div>

      {/* Wallet Modal */}
      <AIPointsWalletModal
        isOpen={isWalletOpen}
        onClose={() => setIsWalletOpen(false)}
        currentPoints={currentCredits}
        onPointsAdded={handlePointsAdded}
      />
    </>
  );
};
