'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import {
  Building2,
  Phone,
  Mail,
  MapPin,
  Globe,
  Star,
  CheckCircle2,
  Clock,
  Sparkles,
  Receipt,
  FileText,
  HelpCircle,
  TrendingUp,
  MessageCircle,
  ArrowLeft,
  DollarSign,
  AlertTriangle,
} from 'lucide-react';
import { Button, Badge, Modal } from '@/components/ui';
import { globalStore } from '@/lib/store';
import { formatINR, formatDate, getHealthScoreColor, getStatusBadgeClass } from '@/lib/utils';
import { aiAssistantEngine } from '@/lib/ai-engine';

export default function Client360Page({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const clientId = resolvedParams.id;

  const [activeTab, setActiveTab] = useState<
    'overview' | 'services' | 'tasks' | 'approvals' | 'billing' | 'tickets' | 'timeline' | 'ai'
  >('overview');

  const client = globalStore.clients.find((c) => c.id === clientId) || globalStore.clients[0];
  const clientTasks = globalStore.tasks.filter((t) => t.clientId === client.id);
  const clientInvoices = globalStore.invoices.filter((inv) => inv.clientId === client.id);
  const clientPayments = globalStore.payments.filter((p) => p.clientId === client.id);
  const clientTickets = globalStore.tickets.filter((t) => t.clientId === client.id);
  const clientDeliverables = globalStore.deliverables.filter((d) => d.clientId === client.id);
  const clientActivities = globalStore.activities.filter((a) => a.clientId === client.id);

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'services', label: 'Services & Package' },
    { id: 'tasks', label: `Tasks (${clientTasks.length})` },
    { id: 'approvals', label: `Approvals (${clientDeliverables.length})` },
    { id: 'billing', label: `Invoices (${clientInvoices.length})` },
    { id: 'tickets', label: `Tickets (${clientTickets.length})` },
    { id: 'timeline', label: 'Timeline' },
    { id: 'ai', label: 'AI & Upsell Engine' },
  ];

  return (
    <div className="space-y-6">
      {/* Back Button & Header */}
      <div className="flex items-center gap-3">
        <Link href="/app/clients">
          <Button variant="outline" size="sm" icon={ArrowLeft}>
            Back to Clients
          </Button>
        </Link>
      </div>

      {/* Client Identity Header Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-sky-500 flex items-center justify-center text-white text-xl font-black shadow-lg shadow-indigo-600/30">
              {client.businessName.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {client.businessName}
                </h2>
                <span
                  className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase ${getHealthScoreColor(
                    client.healthScore
                  )}`}
                >
                  Health: {client.healthScore}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {client.category} • {client.city}, Jharkhand • Active since {formatDate(client.activeSince)}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href={`https://wa.me/${client.phone.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="secondary" size="sm" icon={MessageCircle}>
                WhatsApp Client
              </Button>
            </a>
            <Link href="/portal">
              <Button variant="outline" size="sm">
                View Client Portal View
              </Button>
            </Link>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-1 overflow-x-auto pt-3 border-t border-slate-100 dark:border-slate-800">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === t.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Business & Contact Details
              </h3>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Primary Contact:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{client.phone}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Email:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{client.email}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Address:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{client.address}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Assigned Account Manager:</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">{client.assignedManagerName}</span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Google Business Profile Metrics
              </h3>
              <div className="grid grid-cols-3 gap-3 text-center text-xs">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 block font-medium text-[10px]">Google Rating</span>
                  <span className="text-lg font-black text-amber-500 flex items-center justify-center gap-1">
                    {client.averageRating} <Star className="w-4 h-4 fill-amber-500" />
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 block font-medium text-[10px]">Total Reviews</span>
                  <span className="text-lg font-black text-slate-900 dark:text-white">{client.reviewCount}</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 block font-medium text-[10px]">GBP Health Score</span>
                  <span className="text-lg font-black text-indigo-600">{client.gbpScore}/100</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Health & Retention Status
            </h3>
            <div
              className={`p-4 rounded-2xl border text-xs space-y-2 ${getHealthScoreColor(
                client.healthScore
              )}`}
            >
              <div className="flex justify-between items-center font-bold">
                <span>Health Grade:</span>
                <span>{client.healthScore}</span>
              </div>
              <p className="text-[11px] leading-relaxed opacity-90">{client.healthReason}</p>
            </div>

            <div className="text-xs space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex justify-between">
                <span className="text-slate-400">Monthly Revenue:</span>
                <strong className="text-slate-900 dark:text-white">{formatINR(client.monthlyRevenue)}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Next Renewal:</span>
                <strong className="text-slate-900 dark:text-white">{formatDate(client.renewalDate)}</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Services & Package */}
      {activeTab === 'services' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">
                Subscribed Package
              </span>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                {client.packageName}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Renewing on {formatDate(client.renewalDate)} at {formatINR(client.monthlyRevenue)}/month
              </p>
            </div>
            <Button variant="amber" size="sm">
              Upgrade Plan
            </Button>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <h4 className="font-bold text-xs text-slate-900 dark:text-white mb-3">
              Included Services & Deliverables
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {globalStore.services.slice(0, 5).map((srv) => (
                <div
                  key={srv.id}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span className="font-bold text-slate-900 dark:text-white">{srv.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-semibold">{srv.billingType}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Tasks */}
      {activeTab === 'tasks' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Work & Deliverable Tasks for {client.businessName}
            </h3>
            <Button variant="primary" size="sm">
              + New Task
            </Button>
          </div>

          <div className="space-y-2">
            {clientTasks.map((t) => (
              <div
                key={t.id}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase ${getStatusBadgeClass(
                      t.status
                    )}`}
                  >
                    {t.status}
                  </span>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">{t.title}</p>
                    <span className="text-[10px] text-slate-400">Assigned: {t.assignedToName}</span>
                  </div>
                </div>
                <span className="text-[11px] text-slate-500">Due {formatDate(t.dueDate)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Approvals */}
      {activeTab === 'approvals' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            Client Creative & Deliverable Approvals
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {clientDeliverables.map((deliv) => (
              <div
                key={deliv.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3 text-xs"
              >
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-slate-900 dark:text-white">{deliv.title}</h4>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                      deliv.status === 'APPROVED'
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                        : 'bg-amber-50 text-amber-600 border-amber-200'
                    }`}
                  >
                    {deliv.status}
                  </span>
                </div>
                {deliv.captionText && (
                  <p className="text-slate-600 dark:text-slate-400 text-[11px] italic bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                    "{deliv.captionText}"
                  </p>
                )}
                <span className="text-[10px] text-slate-400 block">
                  Scheduled for: {formatDate(deliv.scheduledFor)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Billing & Invoices */}
      {activeTab === 'billing' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Invoices & Payment Records
            </h3>
            <span className="text-xs text-slate-500 font-medium">Mode: Non-GST Bill of Supply</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 uppercase text-[10px] font-bold">
                <tr>
                  <th className="p-3">Invoice Number</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Total Amount</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Due Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {clientInvoices.map((inv) => (
                  <tr key={inv.id}>
                    <td className="p-3 font-mono font-bold text-indigo-600">{inv.invoiceNumber}</td>
                    <td className="p-3">{inv.invoiceType}</td>
                    <td className="p-3 font-bold">{formatINR(inv.totalAmount)}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getStatusBadgeClass(inv.status)}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="p-3 text-slate-500">{formatDate(inv.dueDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 6: Support Tickets */}
      {activeTab === 'tickets' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            Client Requests & Support Tickets
          </h3>
          <div className="space-y-2.5">
            {clientTickets.map((tkt) => (
              <div
                key={tkt.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold text-indigo-600">{tkt.ticketNumber}</span>
                    <h4 className="font-bold text-slate-900 dark:text-white">{tkt.subject}</h4>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">{tkt.description}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${getStatusBadgeClass(tkt.status)}`}>
                  {tkt.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 7: Timeline */}
      {activeTab === 'timeline' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            Full Client History & Audit Trail
          </h3>
          <div className="space-y-4">
            {clientActivities.map((act) => (
              <div key={act.id} className="flex items-start gap-3.5 text-xs">
                <div className="w-7 h-7 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white">{act.title}</span>
                    <span className="text-[10px] text-slate-400">{formatDate(act.timestamp)}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">{act.description}</p>
                  <span className="text-[10px] text-indigo-500">By: {act.actorName}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 8: AI & Upsell Engine */}
      {activeTab === 'ai' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Google Gemini Intelligence: {client.businessName}
              </h3>
              <p className="text-xs text-slate-500">
                Grounded analysis of service upsells and monthly performance drafting
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs space-y-2">
            <span className="font-bold text-indigo-700 dark:text-indigo-300 block">
              Recommended Upsell Opportunity:
            </span>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              Client has active Google Business Profile management and Review QR stands, but has not yet activated <strong>Local Citation & Map Pack SEO</strong>. Competitors in Ranchi are building directory citations rapidly. Recommending upgrading to Local SEO Booster (₹1,499/mo).
            </p>
          </div>

          {/* Monthly Report Draft Preview */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs space-y-3">
            {(() => {
              const rpt = aiAssistantEngine.generateMonthlyClientReport(client);
              return (
                <>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900 dark:text-white">
                      AI Generated Monthly Executive Summary:
                    </span>
                    <Button variant="outline" size="sm">
                      Export Report to Client Portal
                    </Button>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 italic bg-white dark:bg-slate-900 p-3 rounded-xl border">
                    "{rpt.executiveSummary}"
                  </p>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
