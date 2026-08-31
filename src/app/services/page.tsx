'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, QrCode, Globe, TrendingUp, MessageCircle, FileText, CheckCircle2, ArrowRight } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui';
import { globalStore } from '@/lib/store';
import { formatINR } from '@/lib/utils';

export default function ServicesPage() {
  const services = globalStore.services;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
      <Navbar />

      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
            Modular Service Catalogue
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white mt-2">
            Targeted Digital Growth Services
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
            Each service is executed following strict internal SOPs with verified deliverables and measurable local growth.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((srv) => (
            <div
              key={srv.id}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] font-bold px-2 py-1 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 uppercase">
                    {srv.category}
                  </span>
                  <div className="text-right">
                    <span className="text-lg font-black text-slate-900 dark:text-white">
                      {formatINR(srv.basePrice)}
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      {srv.billingType === 'MONTHLY' ? '/mo' : 'one-time'}
                    </span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">{srv.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                  {srv.description}
                </p>

                <div className="space-y-1.5 mb-6">
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                    Core Deliverables:
                  </span>
                  {srv.deliverables.map((d, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>{d}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-medium">SLA: {srv.defaultSlaHours}h</span>
                <Link href="/pricing">
                  <Button variant="primary" size="sm" icon={ArrowRight}>
                    Get in Package
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
