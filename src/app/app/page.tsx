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
  Bot,
  Zap,
  ArrowRight,
  Filter,
  Check,
  Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui';
import { globalStore } from '@/lib/store';
import { formatINR, formatDate } from '@/lib/utils';

// --- INLINE GREXA-STYLE SVGs FOR EMPTY STATES & AGENT AVATAR ---

const AgentBotAvatar = () => (
  <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#6D28D9] via-[#8B5CF6] to-[#A78BFA] p-0.5 shadow-lg shadow-purple-900/40 flex items-center justify-center shrink-0">
    <div className="w-full h-full bg-[#2E1065]/70 rounded-[14px] flex items-center justify-center backdrop-blur-xs">
      <svg className="w-5 h-5 text-[#EDE9FE]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v2" />
        <rect x="4" y="6" width="16" height="13" rx="4" />
        <path d="M9 11h.01" />
        <path d="M15 11h.01" />
        <path d="M8 15s1.5 1.5 4 1.5 4-1.5 4-1.5" />
      </svg>
    </div>
  </div>
);

// Empty State SVG 1: No Tasks (SLA Cleared)
const EmptyTasksSvg = () => (
  <svg width="110" height="110" viewBox="0 0 120 120" fill="none" className="mx-auto" xmlns="http://www.w3.org/2000/svg">
    <circle cx="60" cy="60" r="50" fill="#8B5CF6" fillOpacity="0.08" />
    <rect x="36" y="32" width="48" height="60" rx="8" stroke="#A78BFA" strokeWidth="2.5" fill="#FFFFFF" fillOpacity="0.05" />
    <path d="M48 28H72V34H48V28Z" fill="#8B5CF6" fillOpacity="0.3" stroke="#8B5CF6" strokeWidth="2" strokeLinejoin="round" />
    <path d="M46 52H62" stroke="#A78BFA" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M46 64H74" stroke="#A78BFA" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="3 3" />
    <circle cx="76" cy="80" r="14" fill="#84CC16" fillOpacity="0.15" stroke="#84CC16" strokeWidth="2.5" />
    <path d="M71 80L75 84L82 76" stroke="#84CC16" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Empty State SVG 2: All Clients Healthy
const EmptyHealthSvg = () => (
  <svg width="110" height="110" viewBox="0 0 120 120" fill="none" className="mx-auto" xmlns="http://www.w3.org/2000/svg">
    <circle cx="60" cy="60" r="50" fill="#84CC16" fillOpacity="0.08" />
    <path d="M60 28L84 38V58C84 74 74 88 60 94C46 88 36 74 36 58V38L60 28Z" stroke="#8B5CF6" strokeWidth="2.5" fill="#FFFFFF" fillOpacity="0.05" strokeLinejoin="round" />
    <path d="M50 60L57 67L72 52" stroke="#84CC16" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Empty State SVG 3: No Activity
const EmptyActivitySvg = () => (
  <svg width="110" height="110" viewBox="0 0 120 120" fill="none" className="mx-auto" xmlns="http://www.w3.org/2000/svg">
    <circle cx="60" cy="60" r="50" fill="#8B5CF6" fillOpacity="0.08" />
    <path d="M35 60H48L54 44L66 76L72 60H85" stroke="#A78BFA" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="60" cy="30" r="3" fill="#8B5CF6" />
    <circle cx="90" cy="60" r="2" fill="#8B5CF6" />
  </svg>
);

// Helper for initial avatar background palette
const getClientAvatarColor = (name: string) => {
  const charCode = name.charCodeAt(0) || 65;
  const colors = [
    'bg-purple-100 text-[#6D28D9] dark:bg-purple-950/80 dark:text-[#A78BFA]',
    'bg-violet-100 text-[#7C3AED] dark:bg-violet-950/80 dark:text-[#C4B5FD]',
    'bg-fuchsia-100 text-[#9333EA] dark:bg-fuchsia-950/80 dark:text-[#E879F9]',
    'bg-indigo-100 text-[#4F46E5] dark:bg-indigo-950/80 dark:text-[#A5B4FC]',
  ];
  return colors[charCode % colors.length];
};

export default function AgencyDashboardPage() {
  const [leads, setLeads] = React.useState<any[]>([]);
  const [clients, setClients] = React.useState<any[]>([]);
  const [tasks, setTasks] = React.useState<any[]>([]);
  const [invoices, setInvoices] = React.useState<any[]>([]);
  const [activities, setActivities] = React.useState<any[]>([]);

  React.useEffect(() => {
    fetch('/api/leads')
      .then((r) => r.json())
      .then((d) => d.success && Array.isArray(d.data) && setLeads(d.data))
      .catch(() => {});

    fetch('/api/clients')
      .then((r) => r.json())
      .then((d) => d.success && Array.isArray(d.data) && setClients(d.data))
      .catch(() => {});

    fetch('/api/tasks')
      .then((r) => r.json())
      .then((d) => d.success && Array.isArray(d.data) && setTasks(d.data))
      .catch(() => {});

    fetch('/api/billing')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data && d.data.invoices) {
          setInvoices(d.data.invoices);
        }
      })
      .catch(() => {});

    // Fallback activities if none fetched
    if (globalStore.activities && globalStore.activities.length > 0) {
      setActivities(globalStore.activities);
    }
  }, []);

  const totalMRR = clients.reduce((acc, c) => acc + (c.monthlyRevenue || 0), 0);
  const activeClientsCount = clients.filter((c) => c.status === 'ACTIVE' || c.status === 'ONBOARDING').length;
  const pendingLeadsCount = leads.filter((l) => l.status === 'NEW' || l.status === 'CONTACTED' || l.status === 'AUDIT').length;
  const completedTasksCount = tasks.filter((t) => t.status === 'COMPLETED').length;
  const urgentTasks = tasks.filter((t) => (t.priority === 'URGENT' || t.priority === 'HIGH') && t.status !== 'COMPLETED');
  const atRiskClients = clients.filter((c) => c.healthScore !== 'GREEN');

  return (
    <div className="space-y-6 font-sans antialiased text-[#1E1B2E] dark:text-[#F5F3FF]">
      
      {/* ========================================================================= */}
      {/* 1. GREXA-STYLE HERO BANNER (PURPLE-VIOLET BRAND GRADIENT + MESH BLOB)     */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden p-7 sm:p-9 rounded-[24px] bg-[linear-gradient(135deg,#6D28D9_0%,#4C1D95_60%,#2E1065_100%)] text-white shadow-xl shadow-purple-950/20 border border-[#8B5CF6]/30">
        {/* Subtle blurred ambient mesh blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#8B5CF6]/20 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-[#A78BFA]/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            {/* Tag Badge with Bot Avatar */}
            <div className="inline-flex items-center gap-2.5 px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-[#EDE9FE] border border-white/20 backdrop-blur-md shadow-sm">
              <AgentBotAvatar />
              <span className="tracking-wide">Agency Command Hub</span>
            </div>

            {/* Headline as a warm, friendly greeting */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white font-heading">
              Welcome back, Gunjan!
            </h1>

            <p className="text-xs sm:text-sm text-purple-200 leading-relaxed font-normal">
              Digital Ranchi is currently powering <strong>{clients.length || globalStore.clients.length} active local businesses</strong> with automated AI reviews and Google Maps ranking.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link href="/app/leads">
              <button className="px-4 py-2.5 rounded-[16px] text-xs font-bold text-white bg-white/10 hover:bg-white/20 border border-white/20 transition-all backdrop-blur-sm">
                View New Leads ({leads.filter((l) => l.status === 'NEW').length})
              </button>
            </Link>

            <Link href="/app/tasks">
              <button className="px-5 py-2.5 rounded-[16px] text-xs font-extrabold text-white bg-gradient-to-r from-[#6D28D9] via-[#7C3AED] to-[#8B5CF6] hover:brightness-110 shadow-lg shadow-purple-950/40 border border-[#A78BFA]/40 transition-all flex items-center gap-2">
                <CheckSquare className="w-4 h-4" />
                <span>Open Task Board</span>
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. PRIMARY KPI GRID (WITH SCANNABLE LEFT ACCENT BARS)                     */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: MRR */}
        <div className="p-5 rounded-[22px] bg-white dark:bg-[#151222] border border-[#EDE9FE] dark:border-[#2A2440] shadow-xs hover:shadow-md transition-all flex items-stretch gap-3.5">
          <div className="w-1 self-stretch rounded-full bg-[#6D28D9] shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280] dark:text-[#A1A1AA]">
                Monthly Recurring Rev (MRR)
              </span>
              <div className="p-2 rounded-xl bg-[#6D28D9]/10 text-[#6D28D9] dark:text-[#A78BFA]">
                <Receipt className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-[#1E1B2E] dark:text-[#F5F3FF]">
                {formatINR(totalMRR || 49980)}
              </span>
              <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-lime-500/10 text-lime-600 dark:text-[#84CC16] border border-lime-500/20">
                +18.4%
              </span>
            </div>
            <p className="text-[11px] text-[#6B7280] dark:text-purple-300/60 font-medium">
              {clients.length || 20} Active Accounts
            </p>
          </div>
        </div>

        {/* KPI 2: Active Clients */}
        <div className="p-5 rounded-[22px] bg-white dark:bg-[#151222] border border-[#EDE9FE] dark:border-[#2A2440] shadow-xs hover:shadow-md transition-all flex items-stretch gap-3.5">
          <div className="w-1 self-stretch rounded-full bg-[#84CC16] shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280] dark:text-[#A1A1AA]">
                Total Active Clients
              </span>
              <div className="p-2 rounded-xl bg-[#84CC16]/10 text-[#84CC16]">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-[#1E1B2E] dark:text-[#F5F3FF]">
                {activeClientsCount || clients.length || 20}
              </span>
              <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-lime-500/10 text-lime-600 dark:text-[#84CC16] border border-lime-500/20">
                All Healthy
              </span>
            </div>
            <p className="text-[11px] text-[#6B7280] dark:text-purple-300/60 font-medium">
              100% Retainer Retention
            </p>
          </div>
        </div>

        {/* KPI 3: Inquiries & Leads */}
        <div className="p-5 rounded-[22px] bg-white dark:bg-[#151222] border border-[#EDE9FE] dark:border-[#2A2440] shadow-xs hover:shadow-md transition-all flex items-stretch gap-3.5">
          <div className="w-1 self-stretch rounded-full bg-[#8B5CF6] shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280] dark:text-[#A1A1AA]">
                Unqualified Inquiries
              </span>
              <div className="p-2 rounded-xl bg-[#8B5CF6]/10 text-[#8B5CF6]">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-[#1E1B2E] dark:text-[#F5F3FF]">
                {pendingLeadsCount || leads.length || 8}
              </span>
              <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-purple-500/10 text-[#6D28D9] dark:text-[#A78BFA] border border-purple-500/20">
                High Score
              </span>
            </div>
            <p className="text-[11px] text-[#6B7280] dark:text-purple-300/60 font-medium">
              From Website & WhatsApp
            </p>
          </div>
        </div>

        {/* KPI 4: Tasks Completed */}
        <div className="p-5 rounded-[22px] bg-white dark:bg-[#151222] border border-[#EDE9FE] dark:border-[#2A2440] shadow-xs hover:shadow-md transition-all flex items-stretch gap-3.5">
          <div className="w-1 self-stretch rounded-full bg-[#A78BFA] shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280] dark:text-[#A1A1AA]">
                Tasks Completed
              </span>
              <div className="p-2 rounded-xl bg-[#A78BFA]/10 text-[#6D28D9] dark:text-[#A78BFA]">
                <CheckSquare className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-[#1E1B2E] dark:text-[#F5F3FF]">
                {completedTasksCount}/{tasks.length || 18}
              </span>
              <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-lime-500/10 text-lime-600 dark:text-[#84CC16] border border-lime-500/20">
                94% SLA
              </span>
            </div>
            <p className="text-[11px] text-[#6B7280] dark:text-purple-300/60 font-medium">
              Google Maps & Review Sync
            </p>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 3. MIDDLE SECTION: URGENT ACTION QUEUE & CLIENT HEALTH RADAR              */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Urgent Action Queue (2 cols) */}
        <div className="lg:col-span-2 p-6 sm:p-7 rounded-[24px] bg-white dark:bg-[#151222] border border-[#EDE9FE] dark:border-[#2A2440] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-1">
            <div>
              <h3 className="text-base font-extrabold text-[#1E1B2E] dark:text-[#F5F3FF]">
                Urgent Deliverables & SLA Queue
              </h3>
              <p className="text-xs text-[#6B7280] dark:text-purple-300/60">
                Tasks requiring immediate attention or client approval
              </p>
            </div>
            <Link
              href="/app/tasks"
              className="text-xs font-bold text-[#6D28D9] dark:text-[#A78BFA] hover:underline flex items-center gap-1"
            >
              <span>View All Tasks</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {tasks.length === 0 ? (
              <div className="py-8 text-center space-y-3">
                <EmptyTasksSvg />
                <h4 className="text-sm font-bold text-[#1E1B2E] dark:text-[#F5F3FF]">
                  Nothing on fire!
                </h4>
                <p className="text-xs text-[#6B7280] dark:text-purple-300/60 max-w-sm mx-auto">
                  All client SLA deliverables and Google Profile tasks are currently on schedule.
                </p>
              </div>
            ) : (
              tasks.slice(0, 5).map((t) => {
                const isUrgent = t.priority === 'URGENT' || t.priority === 'HIGH';
                return (
                  <div
                    key={t.id}
                    className="p-3.5 rounded-[18px] bg-[#F8F7FC] dark:bg-[#1C1830] border border-[#EDE9FE]/80 dark:border-[#2A2440] flex items-center justify-between gap-3 text-xs hover:border-[#8B5CF6]/50 transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Pill Badge */}
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                          t.status === 'COMPLETED'
                            ? 'bg-lime-500/10 text-lime-700 dark:text-[#84CC16] border-lime-500/20'
                            : isUrgent
                            ? 'bg-rose-500/10 text-rose-700 dark:text-[#F43F5E] border-rose-500/20'
                            : 'bg-purple-500/10 text-[#6D28D9] dark:text-[#A78BFA] border-purple-500/20'
                        }`}
                      >
                        {t.status.replace('_', ' ')}
                      </span>
                      <div className="min-w-0">
                        <p className="font-bold text-[#1E1B2E] dark:text-[#F5F3FF] truncate">
                          {t.title}
                        </p>
                        <span className="text-[11px] text-[#6B7280] dark:text-purple-300/60 font-medium">
                          Assigned: {t.assignedToName || 'Gunjan'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[11px] text-[#6B7280] dark:text-purple-300/60 flex items-center gap-1 font-medium">
                        <Clock className={`w-3.5 h-3.5 ${isUrgent ? 'text-[#F59E0B]' : 'text-[#A78BFA]'}`} />
                        Due {formatDate(t.dueDate)}
                      </span>
                      <Link href="/app/tasks">
                        <button className="px-3 py-1.5 rounded-[12px] text-xs font-bold text-[#6D28D9] dark:text-[#A78BFA] bg-white dark:bg-[#151222] border border-[#EDE9FE] dark:border-[#2A2440] hover:bg-[#6D28D9]/10 transition-all">
                          Inspect
                        </button>
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Client Health Radar (1 col) */}
        <div className="p-6 sm:p-7 rounded-[24px] bg-white dark:bg-[#151222] border border-[#EDE9FE] dark:border-[#2A2440] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-1">
            <div>
              <h3 className="text-base font-extrabold text-[#1E1B2E] dark:text-[#F5F3FF]">
                Client Health Radar
              </h3>
              <p className="text-xs text-[#6B7280] dark:text-purple-300/60">
                AI churn & renewal predictions
              </p>
            </div>
            {atRiskClients.length > 0 ? (
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-700 dark:text-[#F43F5E] border border-rose-500/20">
                {atRiskClients.length} At-Risk
              </span>
            ) : (
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-lime-500/10 text-lime-700 dark:text-[#84CC16] border border-lime-500/20">
                All Healthy
              </span>
            )}
          </div>

          <div className="space-y-2.5">
            {atRiskClients.length === 0 ? (
              <div className="py-8 text-center space-y-3">
                <EmptyHealthSvg />
                <h4 className="text-sm font-bold text-[#1E1B2E] dark:text-[#F5F3FF]">
                  All accounts healthy!
                </h4>
                <p className="text-xs text-[#6B7280] dark:text-purple-300/60">
                  Zero churn risk flagged. Every client is reporting positive Google Maps growth.
                </p>
              </div>
            ) : (
              atRiskClients.slice(0, 4).map((c) => (
                <div
                  key={c.id}
                  className="p-3.5 rounded-[18px] bg-[#F8F7FC] dark:bg-[#1C1830] border border-[#EDE9FE]/80 dark:border-[#2A2440] space-y-2 hover:border-[#8B5CF6]/50 transition-all"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      {/* Initial Avatar Circle */}
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center font-extrabold text-[10px] shrink-0 ${getClientAvatarColor(c.businessName)}`}>
                        {c.businessName.charAt(0)}
                      </div>
                      <span className="font-bold text-[#1E1B2E] dark:text-[#F5F3FF] truncate">
                        {c.businessName}
                      </span>
                    </div>

                    <span
                      className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border uppercase ${
                        c.healthScore === 'RED'
                          ? 'bg-rose-500/10 text-rose-700 dark:text-[#F43F5E] border-rose-500/20'
                          : 'bg-amber-500/10 text-amber-700 dark:text-[#F59E0B] border-amber-500/20'
                      }`}
                    >
                      {c.healthScore === 'RED' ? 'Needs Review' : 'Attention'}
                    </span>
                  </div>

                  <p className="text-[11px] text-[#6B7280] dark:text-purple-300/60 leading-snug">
                    {c.healthReason || 'Pending review QR stand delivery or photo verification.'}
                  </p>

                  <div className="pt-1 flex justify-between items-center text-[10px]">
                    <span className="text-[#6B7280] dark:text-purple-300/50 font-medium">
                      Renewal: {formatDate(c.renewalDate)}
                    </span>
                    <Link
                      href={`/app/clients/${c.id}`}
                      className="text-[#6D28D9] dark:text-[#A78BFA] font-bold hover:underline"
                    >
                      Open 360 →
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 4. BOTTOM SECTION: RECENT AGENCY TIMELINE ACTIVITY                       */}
      {/* ========================================================================= */}
      <div className="p-6 sm:p-7 rounded-[24px] bg-white dark:bg-[#151222] border border-[#EDE9FE] dark:border-[#2A2440] shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-1">
          <div>
            <h3 className="text-base font-extrabold text-[#1E1B2E] dark:text-[#F5F3FF]">
              Real-Time Operations & Revenue Activity Feed
            </h3>
            <p className="text-xs text-[#6B7280] dark:text-purple-300/60">
              Live updates across Google Sync, WhatsApp leads, and client approvals
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {activities.length === 0 ? (
            <div className="py-8 text-center space-y-3">
              <EmptyActivitySvg />
              <h4 className="text-sm font-bold text-[#1E1B2E] dark:text-[#F5F3FF]">
                Operations calm & quiet
              </h4>
              <p className="text-xs text-[#6B7280] dark:text-purple-300/60">
                New lead submissions, review replies, and client logins will appear here automatically.
              </p>
            </div>
          ) : (
            activities.slice(0, 6).map((act) => (
              <div
                key={act.id}
                className="flex items-start gap-3.5 text-xs pb-3 border-b border-[#EDE9FE]/60 dark:border-[#2A2440] last:border-0 last:pb-0"
              >
                <div className="w-8 h-8 rounded-[14px] bg-[#6D28D9]/10 text-[#6D28D9] dark:text-[#A78BFA] flex items-center justify-center shrink-0 mt-0.5 border border-[#6D28D9]/20">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-[#1E1B2E] dark:text-[#F5F3FF] truncate">
                      {act.title}
                    </span>
                    <span className="text-[10px] text-[#6B7280] dark:text-purple-300/50 shrink-0 font-medium">
                      {formatDate(act.timestamp)}
                    </span>
                  </div>
                  <p className="text-[#6B7280] dark:text-purple-300/70 text-[11px] mt-0.5 leading-relaxed">
                    {act.description}
                  </p>
                  <span className="text-[10px] text-[#6D28D9] dark:text-[#A78BFA] font-semibold mt-0.5 inline-block">
                    Actor: {act.actorName || 'System AI'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
