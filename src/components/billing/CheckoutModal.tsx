'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { ShieldCheck, CheckCircle2, Lock, ArrowRight, Sparkles, CreditCard } from 'lucide-react';
import { Package } from '@/types';
import { globalStore } from '@/lib/store';
import { paymentProvider } from '@/lib/payment-engine';
import { formatINR } from '@/lib/utils';
import { Button, Input, Modal } from '@/components/ui';

export interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  pkg: Package | null;
  onSuccess?: (clientId: string) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  pkg,
  onSuccess,
}) => {
  const [businessName, setBusinessName] = useState('');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('Ranchi');
  const [category, setCategory] = useState('Local Business');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [newClientSummary, setNewClientSummary] = useState<any>(null);

  if (!pkg) return null;

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName || !phone || !contactName) return;

    setIsProcessing(true);

    try {
      const res = await fetch('/api/orders/public-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageId: pkg.id,
          businessName,
          contactName,
          phone,
          email,
          city,
          category,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Checkout processing failed');
      }

      setIsProcessing(false);
      setIsSuccess(true);
      setNewClientSummary({
        client: data.client,
        project: data.project,
        taskCount: data.tasks?.length || 7,
        paymentId: data.payment?.gatewayPaymentId || 'pay_RZP_VERIFIED',
      });

      // Trigger confetti celebration
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // Ignore if canvas-confetti is not loaded
      }

      if (onSuccess && data.client?.id) {
        onSuccess(data.client.id);
      }
    } catch (err: any) {
      setIsProcessing(false);
      alert(err?.message || 'Error during checkout verification. Please try again.');
    }
  };

  const handleResetAndClose = () => {
    setIsSuccess(false);
    setNewClientSummary(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleResetAndClose}
      title={isSuccess ? 'Payment Successful & Onboarding Started!' : `Get ${pkg.name}`}
      description={
        isSuccess
          ? 'Your account has been created and our automated 7-day kickoff is running.'
          : 'Complete your instant booking with server-side verified Razorpay processing.'
      }
      maxWidth="lg"
    >
      {!isSuccess ? (
        <form onSubmit={handleCheckoutSubmit} className="space-y-4">
          {/* Package Summary Pill */}
          <div className="p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">
                Selected Growth Package
              </span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                {pkg.name}
              </span>
            </div>
            <div className="text-right">
              <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">
                {formatINR(pkg.price)}
              </span>
              <span className="text-[10px] text-slate-500 block">
                {pkg.billingFrequency === 'MONTHLY' ? '/month' : 'one-time setup'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Business Name *"
              placeholder="e.g. Royal Sweets & Bakery"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              required
            />
            <Input
              label="Owner / Contact Person *"
              placeholder="e.g. Ramesh Kumar"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Mobile / WhatsApp Number *"
              placeholder="+91 98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
            <Input
              label="Email Address"
              type="email"
              placeholder="owner@business.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
            <Input
              label="Business Category"
              placeholder="e.g. Clinic, Restaurant, Salon"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>

          {/* Trust Banner */}
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5 text-[11px]">
              <Lock className="w-3.5 h-3.5 text-emerald-500" />
              <span>Razorpay 256-bit Encrypted Checkout</span>
            </div>
            <span className="text-[11px] font-medium">Non-GST Bill of Supply</span>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full shadow-indigo-600/30"
              isLoading={isProcessing}
              icon={CreditCard}
            >
              Pay {formatINR(pkg.price)} & Start Onboarding
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-5 text-center py-2 animate-in zoom-in-95">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 text-emerald-600 border border-emerald-500/30 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white">
              Welcome, {newClientSummary?.client?.businessName}!
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              Your payment of <strong>{formatINR(pkg.price)}</strong> has been verified. We have automatically initialized your 7-day growth project.
            </p>
          </div>

          {/* Onboarding Schedule Card */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-left text-xs space-y-2">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 font-medium">Account ID:</span>
              <strong className="text-slate-900 dark:text-white font-mono">{newClientSummary?.client?.id}</strong>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 font-medium">Assigned Account Manager:</span>
              <strong className="text-indigo-600 dark:text-indigo-400">{newClientSummary?.client?.assignedManagerName}</strong>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Scheduled Onboarding Tasks:</span>
              <span className="font-bold text-emerald-600">{newClientSummary?.taskCount} Automated Tasks Ready</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <a href="/portal" className="w-full sm:w-1/2">
              <Button variant="secondary" size="md" className="w-full">
                Open Client Portal
              </Button>
            </a>
            <a href="/app" className="w-full sm:w-1/2">
              <Button variant="primary" size="md" className="w-full">
                View in Agency CRM
              </Button>
            </a>
          </div>
        </div>
      )}
    </Modal>
  );
};
