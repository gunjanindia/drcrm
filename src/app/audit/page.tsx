'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { AuditScorecard } from '@/components/audit/AuditScorecard';
import { CheckoutModal } from '@/components/billing/CheckoutModal';
import { globalStore } from '@/lib/store';
import { Package } from '@/types';

export default function AuditPage() {
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const handlePackageFromAudit = (pkgId: string) => {
    const pkg = globalStore.packages.find((p) => p.id === pkgId) || globalStore.packages[1];
    setSelectedPackage(pkg);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
      <Navbar />
      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        <AuditScorecard onPackageSelect={handlePackageFromAudit} />
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
