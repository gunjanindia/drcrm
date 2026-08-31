'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  Plus,
  ArrowRight,
  Sparkles,
  Phone,
  MessageCircle,
  MapPin,
  CheckCircle2,
  Filter,
} from 'lucide-react';
import { Button, Input, Modal, Badge } from '@/components/ui';
import { globalStore } from '@/lib/store';
import { Lead } from '@/types';
import { formatINR, formatDate, getStatusBadgeClass } from '@/lib/utils';
import { aiAssistantEngine } from '@/lib/ai-engine';

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>(globalStore.leads);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedLeadForAi, setSelectedLeadForAi] = useState<Lead | null>(null);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [leadToConvert, setLeadToConvert] = useState<Lead | null>(null);
  const [selectedPackageId, setSelectedPackageId] = useState('pkg_growth_999');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New Lead Form
  const [newBizName, setNewBizName] = useState('');
  const [newContact, setNewContact] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newCategory, setNewCategory] = useState('Clinic');

  const filteredLeads = leads.filter((l) => {
    const matchesSearch =
      l.businessName.toLowerCase().includes(search.toLowerCase()) ||
      l.contactName.toLowerCase().includes(search.toLowerCase()) ||
      l.category.toLowerCase().includes(search.toLowerCase()) ||
      l.phone.includes(search);
    const matchesStatus = selectedStatus === 'ALL' || l.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleOpenAiSummary = (lead: Lead) => {
    setSelectedLeadForAi(lead);
    setIsAiModalOpen(true);
  };

  const handleOpenConvert = (lead: Lead) => {
    setLeadToConvert(lead);
    setIsConvertModalOpen(true);
  };

  const handleConfirmConvert = () => {
    if (!leadToConvert) return;
    globalStore.convertLeadToClient(leadToConvert.id, selectedPackageId);
    setLeads([...globalStore.leads]);
    setIsConvertModalOpen(false);
    alert(`Converted ${leadToConvert.businessName} to active Client! Automated 7-Day Onboarding project has been scheduled.`);
  };

  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBizName || !newPhone) return;

    const created = globalStore.createLead({
      businessName: newBizName,
      contactName: newContact || newBizName,
      phone: newPhone,
      whatsapp: newPhone,
      email: `${newPhone}@lead.digitalranchi.in`,
      category: newCategory,
      city: 'Ranchi',
      state: 'Jharkhand',
      leadSource: 'CRM Direct Ingestion',
      estimatedValue: 999,
      leadScore: 85,
      status: 'NEW',
      notes: 'Manually logged in CRM.',
    });

    setLeads([...globalStore.leads]);
    setIsCreateModalOpen(false);
    setNewBizName('');
    setNewContact('');
    setNewPhone('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Lead Management & Pipeline Ingestion
          </h2>
          <p className="text-xs text-slate-500">
            {leads.length} Total Inquiries captured across Website, WhatsApp, and Field Sales
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/app/pipeline">
            <Button variant="outline" size="sm">
              View Kanban Pipeline
            </Button>
          </Link>
          <Button variant="primary" size="sm" icon={Plus} onClick={() => setIsCreateModalOpen(true)}>
            Add New Lead
          </Button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search business name, category, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {['ALL', 'NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'WON', 'LOST'].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedStatus === st
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950/70 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Business & Contact</th>
                <th className="py-3.5 px-4">Category / City</th>
                <th className="py-3.5 px-4">Presence Score</th>
                <th className="py-3.5 px-4">Lead Source</th>
                <th className="py-3.5 px-4">Stage</th>
                <th className="py-3.5 px-4">Assigned Rep</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900 dark:text-white">{lead.businessName}</div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <span>{lead.contactName}</span>
                      <span>•</span>
                      <span className="text-slate-400">{lead.phone}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-medium text-slate-800 dark:text-slate-200">{lead.category}</span>
                    <div className="text-[10px] text-slate-400">{lead.city}, Jharkhand</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">{lead.leadScore}/100</span>
                      <div className="w-12 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 rounded-full"
                          style={{ width: `${lead.leadScore}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                      {lead.leadSource}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase ${getStatusBadgeClass(
                        lead.status
                      )}`}
                    >
                      {lead.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-[11px]">
                    {lead.assignedUserName || 'Unassigned'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenAiSummary(lead)}
                        className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border border-amber-500/30 transition-colors"
                        title="AI Lead Assistant"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                      </button>

                      {lead.status !== 'WON' ? (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleOpenConvert(lead)}
                        >
                          Convert to Client
                        </Button>
                      ) : (
                        <span className="text-[10px] text-emerald-600 font-semibold px-2 py-1 bg-emerald-50 rounded">
                          Converted
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Lead Summary Modal */}
      {selectedLeadForAi && (
        <Modal
          isOpen={isAiModalOpen}
          onClose={() => setIsAiModalOpen(false)}
          title={`Gemini AI Lead Intelligence: ${selectedLeadForAi.businessName}`}
          description="Grounded qualification and custom pitch generation based on local search metrics"
        >
          {(() => {
            const aiData = aiAssistantEngine.generateLeadSummary(selectedLeadForAi);
            return (
              <div className="space-y-4 text-xs">
                <div className="p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 space-y-1">
                  <span className="font-bold text-indigo-700 dark:text-indigo-300 block">
                    Qualification Analysis:
                  </span>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    {aiData.qualificationSummary}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">
                    Suggested Discovery Questions:
                  </span>
                  {aiData.suggestedQuestions.map((q, idx) => (
                    <div key={idx} className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                      {q}
                    </div>
                  ))}
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-2">
                  <span className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                    <MessageCircle className="w-4 h-4 text-emerald-600" />
                    Suggested 1-Click WhatsApp Pitch:
                  </span>
                  <p className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed italic bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-emerald-100">
                    "{aiData.suggestedWhatsAppPitch}"
                  </p>
                  <a
                    href={`https://wa.me/${selectedLeadForAi.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                      aiData.suggestedWhatsAppPitch
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700"
                  >
                    Send on WhatsApp <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })()}
        </Modal>
      )}

      {/* Convert to Client Modal */}
      {leadToConvert && (
        <Modal
          isOpen={isConvertModalOpen}
          onClose={() => setIsConvertModalOpen(false)}
          title={`Convert Lead to Client: ${leadToConvert.businessName}`}
          description="Instantly generate Client 360 profile, assign Account Manager, and spawn 7-day kickoff project."
        >
          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Select Starting Package:
              </label>
              <select
                value={selectedPackageId}
                onChange={(e) => setSelectedPackageId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 text-xs text-slate-900 dark:text-white"
              >
                {globalStore.packages.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({formatINR(p.price)} - {p.billingFrequency})
                  </option>
                ))}
              </select>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5">
              <span className="font-bold text-slate-900 dark:text-white block">
                Automated Actions on Conversion:
              </span>
              <ul className="space-y-1 text-slate-600 dark:text-slate-400 text-[11px]">
                <li>• Client 360 profile created with full history</li>
                <li>• 7-Day Onboarding Project instantiated</li>
                <li>• 7 Kickoff tasks automatically scheduled for Delivery Team</li>
                <li>• Account Manager Neha Pandey assigned</li>
              </ul>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setIsConvertModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleConfirmConvert}>
                Confirm Conversion
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Quick Add Lead Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Add New Lead / Local Inquiry"
        description="Record a walk-in, phone call, or field sales discovery"
      >
        <form onSubmit={handleCreateLead} className="space-y-3">
          <Input
            label="Business Name *"
            placeholder="e.g. Ranchi Optical House"
            value={newBizName}
            onChange={(e) => setNewBizName(e.target.value)}
            required
          />
          <Input
            label="Owner / Contact Person"
            placeholder="e.g. Ankit Singhal"
            value={newContact}
            onChange={(e) => setNewContact(e.target.value)}
          />
          <Input
            label="Phone / WhatsApp Number *"
            placeholder="+91 98765 43210"
            value={newPhone}
            onChange={(e) => setNewPhone(e.target.value)}
            required
          />
          <Input
            label="Category"
            placeholder="e.g. Retail / Optical / Health"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
          />
          <div className="flex justify-end gap-2 pt-3">
            <Button variant="outline" size="sm" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Lead
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
