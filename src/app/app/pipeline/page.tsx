'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sparkles, Phone, ArrowRight, CheckCircle2, Building, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui';
import { globalStore } from '@/lib/store';
import { Lead, LeadStatus } from '@/types';
import { formatINR, getStatusBadgeClass } from '@/lib/utils';

export default function PipelinePage() {
  const [leads, setLeads] = useState<Lead[]>([]);

  const fetchPipelineLeads = async () => {
    try {
      const res = await fetch('/api/leads');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setLeads(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch pipeline leads:', err);
    }
  };

  React.useEffect(() => {
    fetchPipelineLeads();
  }, []);

  const stages: { id: LeadStatus; label: string; color: string }[] = [
    { id: 'NEW', label: 'New Inquiries', color: 'border-indigo-500' },
    { id: 'CONTACTED', label: 'Contacted', color: 'border-blue-500' },
    { id: 'QUALIFIED', label: 'Qualified', color: 'border-sky-500' },
    { id: 'AUDIT', label: 'Audit Shared', color: 'border-amber-500' },
    { id: 'PROPOSAL', label: 'Proposal Sent', color: 'border-purple-500' },
    { id: 'NEGOTIATION', label: 'Negotiation', color: 'border-pink-500' },
    { id: 'WON', label: 'Won / Active', color: 'border-emerald-500' },
  ];

  const moveStage = async (leadId: string, nextStatus: LeadStatus) => {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead) return;

    // Optimistically update UI
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status: nextStatus } : l))
    );

    try {
      if (nextStatus === 'WON') {
        const res = await fetch('/api/leads/convert', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            leadId: lead.id,
            packageId: lead.interestedPackageId || 'pkg_growth_999',
          }),
        });
        if (res.ok) {
          await fetchPipelineLeads();
        }
      } else {
        const res = await fetch('/api/leads', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: lead.id,
            status: nextStatus,
          }),
        });
        if (res.ok) {
          await fetchPipelineLeads();
        }
      }
    } catch (err) {
      console.error('Failed to advance deal stage:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Sales & Deal Pipeline
          </h2>
          <p className="text-xs text-slate-500">
            Interactive deal stages. Move leads forward to trigger audit reviews and customer onboarding.
          </p>
        </div>

        <Link href="/app/leads">
          <Button variant="outline" size="sm">
            View Table List
          </Button>
        </Link>
      </div>

      {/* Kanban Pipeline Board */}
      <div className="flex gap-4 overflow-x-auto pb-6">
        {stages.map((stage) => {
          const stageLeads = leads.filter((l) => l.status === stage.id);
          const stageValue = stageLeads.reduce((acc, l) => acc + l.estimatedValue, 0);

          return (
            <div
              key={stage.id}
              className="w-72 shrink-0 bg-slate-100 dark:bg-slate-900/60 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-3.5 flex flex-col max-h-[calc(100vh-220px)]"
            >
              {/* Column Header */}
              <div className={`pb-3 border-b-2 ${stage.color} mb-3 flex items-center justify-between`}>
                <div>
                  <h3 className="font-bold text-xs text-slate-900 dark:text-white">
                    {stage.label}
                  </h3>
                  <span className="text-[10px] text-slate-400 font-semibold">
                    {formatINR(stageValue)}
                  </span>
                </div>
                <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 text-[10px] font-bold flex items-center justify-center text-slate-700 dark:text-slate-300">
                  {stageLeads.length}
                </span>
              </div>

              {/* Cards Feed */}
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                {stageLeads.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-[11px] italic">
                    No leads in this stage
                  </div>
                ) : (
                  stageLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all space-y-2 text-xs"
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-slate-900 dark:text-white line-clamp-1">
                        {lead.businessName}
                      </span>
                      <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 shrink-0">
                        {formatINR(lead.estimatedValue)}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500">
                      {lead.category} • {lead.city}
                    </p>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800 text-[10px]">
                      <span className="text-slate-400">Score: {lead.leadScore}/100</span>
                      <span className="text-slate-500 font-medium">{lead.leadSource}</span>
                    </div>

                    {/* Fast Stage Progress Buttons */}
                    <div className="pt-2 flex justify-between items-center gap-1 border-t border-slate-100 dark:border-slate-800">
                      {stage.id !== 'WON' && (
                        <button
                          onClick={() => {
                            const nextMap: Record<LeadStatus, LeadStatus> = {
                              NEW: 'CONTACTED',
                              CONTACTED: 'QUALIFIED',
                              QUALIFIED: 'AUDIT',
                              AUDIT: 'PROPOSAL',
                              PROPOSAL: 'NEGOTIATION',
                              NEGOTIATION: 'WON',
                              WON: 'WON',
                              LOST: 'NEW',
                            };
                            moveStage(lead.id, nextMap[lead.status]);
                          }}
                          className="w-full py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-300 font-semibold text-[10px] flex items-center justify-center gap-1 transition-colors"
                        >
                          <span>Advance</span>
                          <ArrowRight className="w-2.5 h-2.5" />
                        </button>
                      )}
                    </div>
                  </div>
                )))
              }
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
