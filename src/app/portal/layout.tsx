'use client';

import React from 'react';
import { PortalSidebar } from '@/components/layout/PortalSidebar';

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-white overflow-hidden">
      {/* Client Sidebar */}
      <PortalSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 px-6 flex items-center justify-between sticky top-0 z-30">
          <div>
            <h1 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              Client Growth & Delivery Portal
            </h1>
            <p className="text-xs text-slate-500">Welcome, Ranchi Dental Care & Implant Center</p>
          </div>
          <a
            href="https://wa.me/919431109876?text=Hi%20Digital%20Ranchi,%20I%20have%20a%20question"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100 transition-colors"
          >
            Direct WhatsApp Support
          </a>
        </header>

        <main className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-slate-950">
          <div className="max-w-6xl mx-auto space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
