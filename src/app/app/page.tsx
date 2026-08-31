'use client';

import React from 'react';
import Link from 'next/link';
import {
  Users,
  Building2,
  CheckSquare,
  TrendingUp,
  Receipt,
  AlertTriangle,
  Clock,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { StatCard, Button, Badge } from '@/components/ui';
import { globalStore } from '@/lib/store';
import { formatINR, getHealthScoreColor, getStatusBadgeClass, formatDate } from '@/lib/utils';

export default function AgencyDashboardPage() {
  const leads = globalStore.leads;
  const clients = globalStore.clients;
  const tasks = globalStore.tasks;
  const invoices = globalStore.invoices;
  const activities = globalStore.activities;

  const totalMRR = clients.reduce((acc, c) => acc + c.monthlyRevenue, 0);
  const activeClientsCount = clients.filter((c) => c.status === 'ACTIVE').length;
  const pendingLeadsCount = leads.filter((l) => l.status === 'NEW' || l.status === 'CONTACTED').length;
  const completedTasksCount = tasks.filter((t) => t.status === 'COMPLETED').length;
  const overdueOrUrgentTasks = tasks.filter((t) => t.priority === 'URGENT' && t.status !== 'COMPLETED');

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
            <Sparkles className="w-3 h-3" />
            Agency Command Hub
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            Welcome back, Gunjan!
          </h2>
          <p className="text-xs text-indigo-200">
            Digital Ranchi is currently powering <strong>{clients.length} active local businesses</strong> across Jharkhand.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/app/leads">
            <Button variant="outline" size="sm" className="text-white border-slate-700 hover:bg-slate-800">
              View New Leads ({leads.filter((l) => l.status === 'NEW').length})
            </Button>
          </Link>
          <Link href="/app/tasks">
            <Button variant="amber" size="sm" icon={CheckSquare}>
              Task Board
            </Button>
          </Link>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Monthly Recurring Rev (MRR)"
          value={formatINR(totalMRR)}
          change="+18.4% this mo"
          isPositive={true}
          icon={Receipt}
          subtext={`${clients.length} Active Accounts`}
          accentColor="indigo"
        />
        <StatCard
          title="Total Active Clients"
          value={activeClientsCount}
          change="+5 this week"
          isPositive={true}
          icon={Building2}
          subtext="20 Premium Retainers"
          accentColor="emerald"
        />
        <StatCard
          title="Unqualified Inquiries"
          value={pendingLeadsCount}
          change="8 High Score"
          isPositive={true}
          icon={Users}
          subtext="From Website & WhatsApp"
          accentColor="sky"
        />
        <StatCard
          title="Tasks Completed"
          value={`${completedTasksCount}/${tasks.length}`}
          change="94% SLA rate"
          isPositive={true}
          icon={CheckSquare}
          subtext="Google Maps & Reviews"
          accentColor="amber"
        />
      </div>

      {/* Middle Section: Urgent Operational Queue & Pipeline Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Urgent Action Queue (2 cols) */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Urgent Deliverables & SLA Queue
              </h3>
              <p className="text-xs text-slate-500">Tasks requiring immediate attention or client approval</p>
            </div>
            <Link href="/app/tasks" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
              View All Tasks →
            </Link>
          </div>

          <div className="space-y-2.5">
            {tasks.slice(0, 5).map((t) => (
              <div
                key={t.id}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase ${getStatusBadgeClass(
                      t.status
                    )}`}
                  >
                    {t.status.replace('_', ' ')}
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 dark:text-white truncate">{t.title}</p>
                    <span className="text-[11px] text-slate-500">Assigned: {t.assignedToName}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-500" />
                    Due {formatDate(t.dueDate)}
                  </span>
                  <Link href={`/app/tasks`}>
                    <Button variant="outline" size="sm">
                      Inspect
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Client Health & Risk Radar (1 col) */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Client Health Radar
              </h3>
              <p className="text-xs text-slate-500">AI-analyzed churn & renewal risks</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
              3 At-Risk
            </span>
          </div>

          <div className="space-y-3">
            {clients
              .filter((c) => c.healthScore !== 'GREEN')
              .slice(0, 4)
              .map((c) => (
                <div
                  key={c.id}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900 dark:text-white truncate">
                      {c.businessName}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${getHealthScoreColor(
                        c.healthScore
                      )}`}
                    >
                      {c.healthScore}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    {c.healthReason}
                  </p>
                  <div className="pt-1 flex justify-between items-center text-[10px]">
                    <span className="text-slate-400">Renewal: {formatDate(c.renewalDate)}</span>
                    <Link
                      href={`/app/clients/${c.id}`}
                      className="text-indigo-600 font-semibold hover:underline"
                    >
                      Open 360 →
                    </Link>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Agency Timeline Activity */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Real-Time Operations & Revenue Activity Feed
        </h3>

        <div className="space-y-3">
          {activities.map((act) => (
            <div
              key={act.id}
              className="flex items-start gap-3.5 text-xs pb-3 border-b border-slate-100 dark:border-slate-800 last:border-0 last:pb-0"
            >
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white">{act.title}</span>
                  <span className="text-[10px] text-slate-400">{formatDate(act.timestamp)}</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5">{act.description}</p>
                <span className="text-[10px] text-indigo-500 font-medium">Actor: {act.actorName}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
