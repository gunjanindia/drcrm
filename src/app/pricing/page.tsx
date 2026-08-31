'use client';

import React, { useState } from 'react';
import { CheckCircle2, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui';
import { CheckoutModal } from '@/components/billing/CheckoutModal';
import { globalStore } from '@/lib/store';
import { Package } from '@/types';
import { formatINR } from '@/lib/utils';

export default function PricingPage() {
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const packages = globalStore.packages;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
      <Navbar />

      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
            Transparent Investment Plans
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white mt-2">
            Accelerate Your Local Business
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
            Choose between verified one-time launch setups or complete monthly growth retainers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {packages.slice(0, 3).map((pkg) => (
            <div
              key={pkg.id}
              className={`rounded-3xl p-8 flex flex-col justify-between transition-all relative ${
                pkg.isPopular
                  ? 'bg-slate-900 text-white shadow-2xl border-2 border-indigo-500 scale-105 z-10'
                  : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 shadow-sm'
              }`}
            >
              {pkg.isPopular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-sky-400 text-slate-950 font-bold text-xs shadow-md uppercase tracking-wider">
                  Recommended Choice
                </div>
              )}

              <div>
                <h3 className="text-2xl font-black">{pkg.name}</h3>
                <p className={`text-xs mt-1.5 ${pkg.isPopular ? 'text-slate-300' : 'text-slate-500'}`}>
                  {pkg.tagline}
                </p>

                <div className="my-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black">{formatINR(pkg.price)}</span>
                    <span className={`text-xs ${pkg.isPopular ? 'text-slate-300' : 'text-slate-500'}`}>
                      {pkg.billingFrequency === 'MONTHLY' ? '/month' : 'one-time'}
                    </span>
                  </div>
                </div>

                <ul className="space-y-3 text-xs mb-8">
                  {pkg.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <CheckCircle2
                        className={`w-4 h-4 shrink-0 mt-0.5 ${
                          pkg.isPopular ? 'text-indigo-400' : 'text-emerald-500'
                        }`}
                      />
                      <span className={pkg.isPopular ? 'text-slate-200' : 'text-slate-700 dark:text-slate-300'}>
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button
                variant={pkg.isPopular ? 'amber' : 'primary'}
                size="lg"
                className="w-full"
                onClick={() => {
                  setSelectedPackage(pkg);
                  setIsCheckoutOpen(true);
                }}
                icon={ArrowRight}
              >
                Instant Checkout ({formatINR(pkg.price)})
              </Button>
            </div>
          ))}
        </div>
      </main>

      <Footer />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        pkg={selectedPackage}
      />
    </div>
  );
}
