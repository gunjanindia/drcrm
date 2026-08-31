'use client';

import React from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Clock,
  Star,
  Sparkles,
  ArrowRight,
  Receipt,
  FileBarChart2,
  HelpCircle,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui';
import { globalStore } from '@/lib/store';
import { formatINR, formatDate } from '@/lib/utils';

export default function ClientPortalDashboard() {
  const client = globalStore.clients[0]; // Ranchi Dental Care
  const pendingDeliverables = globalStore.deliverables.filter(
    (d) => d.clientId === client.id && d.status === 'PENDING'
  );
  const activeTasks = globalStore.tasks
    .filter((t) => t.clientId === client.id && t.status !== 'COMPLETED')
    .slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-sky-900 via-slate-900 to-indigo-950 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg">
        <div className="space-y-1">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
            <ShieldCheck className="w-3 h-3" />
            Active Growth Plan: {client.packageName}
          </span>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            Namaste, Dr. Alok!
          </h2>
          <p className="text-xs text-sky-200">
            Next monthly retainer renewal on <strong>{formatDate(client.renewalDate)}</strong> ({formatINR(client.monthlyRevenue)}/month).
          </p>
        </div>

        <Link href="/portal/deliverables">
          <Button variant="amber" size="sm" icon={CheckCircle2}>
            Review Pending Creative ({pendingDeliverables.length})
          </Button>
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Google Rating
          </span>
          <div className="text-2xl font-black text-amber-500 mt-1 flex items-center justify-center gap-1">
            {client.averageRating} <Star className="w-5 h-5 fill-amber-500" />
          </div>
          <span className="text-[11px] text-slate-500">{client.reviewCount} Total Verified Reviews</span>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            GBP Health Score
          </span>
          <div className="text-2xl font-black text-indigo-600 mt-1">
            {client.gbpScore}/100
          </div>
          <span className="text-[11px] text-slate-500">Top-3 Local Map Pack Ranking</span>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500">
            Pending Actions
          </span>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {pendingDeliverables.length} Creative
          </div>
          <span className="text-[11px] text-slate-500">Awaiting your quick approval</span>
        </div>
      </div>

      {/* Ongoing Tasks Stream */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            Current Work in Progress by Digital Ranchi Team
          </h3>
          <Link href="/portal/tasks" className="text-xs font-semibold text-sky-600 hover:underline">
            View All Tasks →
          </Link>
        </div>

        <div className="space-y-2.5">
          {activeTasks.map((t) => (
            <div
              key={t.id}
              className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
            >
              <div>
                <p className="font-bold text-slate-900 dark:text-white">{t.title}</p>
                <span className="text-[10px] text-slate-400">Deliverable specialist: {t.assignedToName}</span>
              </div>
              <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                In Progress
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
