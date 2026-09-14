'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Zap,
  CheckCircle2,
  CreditCard,
  Coins,
  ShieldCheck,
  ArrowRight,
  History,
  Lock,
} from 'lucide-react';
import { AI_POINTS_PACKAGES, AIPointsPackage } from '@/lib/client-360-data';
import { Button, Modal } from '@/components/ui';
import { formatINR } from '@/lib/utils';

export interface AIPointsWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPoints: number;
  onPointsAdded: (added: number) => void;
}

export const AIPointsWalletModal: React.FC<AIPointsWalletModalProps> = ({
  isOpen,
  onClose,
  currentPoints,
  onPointsAdded,
}) => {
  const [selectedPack, setSelectedPack] = useState<AIPointsPackage>(AI_POINTS_PACKAGES[1]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'recharge' | 'history'>('recharge');

  const [usageHistory] = useState([
    { id: 'tx_1', item: 'AI Review Reply generated', change: -1, date: 'Today, 2:15 PM' },
    { id: 'tx_2', item: 'Holi Festival Creative Card generated', change: -2, date: 'Yesterday' },
    { id: 'tx_3', item: 'Starter AI Pack Recharge via Razorpay', change: +110, date: 'Sep 10, 2026' },
  ]);

  const handleRazorpayRecharge = async () => {
    setIsProcessing(true);

    try {
      // Simulate Razorpay checkout verification flow
      await new Promise((resolve) => setTimeout(resolve, 1400));

      const totalCredits = selectedPack.points + selectedPack.bonusPoints;
      onPointsAdded(totalCredits);
      setIsProcessing(false);
      setPaymentSuccess(true);

      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore
      }
    } catch (e) {
      setIsProcessing(false);
      alert('Payment processing failed. Please try again.');
    }
  };

  const handleDone = () => {
    setPaymentSuccess(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="AI Intelligence Credits & Wallet"
      maxWidth="lg"
    >
      <div className="space-y-6">
        {/* Balance Top Card */}
        <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 text-slate-950 shadow-lg flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-900/80 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 fill-slate-950" />
              Available AI Points Balance
            </span>
            <div className="text-3xl font-black tracking-tight text-slate-950">
              {currentPoints} <span className="text-sm font-bold text-slate-900/80">Credits</span>
            </div>
            <p className="text-[11px] font-medium text-slate-900/80">
              Use for AI Review Responses (1 pt), Festival Posts (2 pts), Mini-Site AI (5 pts)
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-slate-950">
            <Coins className="w-6 h-6" />
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('recharge')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'recharge'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Instant Razorpay Recharge
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            Usage Log
          </button>
        </div>

        {paymentSuccess ? (
          <div className="p-6 text-center space-y-4 rounded-3xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
            <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-md shadow-emerald-500/30">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Recharge Successful!
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                <strong>+{selectedPack.points + selectedPack.bonusPoints} AI Credits</strong> have been added to your client wallet via verified Razorpay transaction.
              </p>
            </div>
            <Button variant="success" size="sm" onClick={handleDone}>
              Continue to AI Studio
            </Button>
          </div>
        ) : activeTab === 'recharge' ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {AI_POINTS_PACKAGES.map((pkg) => {
                const isSelected = selectedPack.id === pkg.id;
                return (
                  <div
                    key={pkg.id}
                    onClick={() => setSelectedPack(pkg)}
                    className={`relative p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 shadow-md ring-2 ring-indigo-600/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-white dark:bg-slate-900'
                    }`}
                  >
                    {pkg.popular && (
                      <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full text-[9px] font-black bg-indigo-600 text-white uppercase tracking-wider shadow">
                        Best Value
                      </span>
                    )}

                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{pkg.name}</h4>
                      <div className="text-xl font-black text-slate-900 dark:text-white">
                        {formatINR(pkg.priceINR)}
                      </div>
                      <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        {pkg.points} + {pkg.bonusPoints} Bonus Pts
                      </div>
                    </div>

                    <ul className="mt-3 space-y-1 pt-3 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-500">
                      {pkg.features.map((f, i) => (
                        <li key={i} className="flex items-center gap-1.5 truncate">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    Razorpay 256-Bit Encrypted Checkout
                  </p>
                  <span className="text-[10px] text-slate-400">
                    Supports UPI (GPay, PhonePe, Paytm), NetBanking & Cards
                  </span>
                </div>
              </div>

              <Button
                variant="primary"
                size="md"
                isLoading={isProcessing}
                onClick={handleRazorpayRecharge}
                icon={Zap}
                className="w-full sm:w-auto"
              >
                Pay {formatINR(selectedPack.priceINR)} with Razorpay
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2 text-xs">
            {usageHistory.map((h) => (
              <div
                key={h.id}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between"
              >
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">{h.item}</p>
                  <span className="text-[10px] text-slate-400">{h.date}</span>
                </div>
                <span
                  className={`font-black font-mono text-xs ${
                    h.change > 0 ? 'text-emerald-600' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {h.change > 0 ? `+${h.change}` : h.change} Pts
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
};
