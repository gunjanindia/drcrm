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
  Mail,
  Send,
  Copy,
  Check,
  MapPin,
  CheckCircle2,
  Filter,
  ShieldCheck,
  PackageCheck,
  Edit2,
  Trash2,
  Activity,
  Zap,
  RotateCw
} from 'lucide-react';
import { Button, Input, Modal, Badge } from '@/components/ui';
import { globalStore } from '@/lib/store';
import { Lead, LeadStatus } from '@/types';
import { formatINR, formatDate, getStatusBadgeClass } from '@/lib/utils';
import { aiAssistantEngine } from '@/lib/ai-engine';

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoadingLeads, setIsLoadingLeads] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Modals state
  const [selectedLeadForAi, setSelectedLeadForAi] = useState<Lead | null>(null);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [selectedLeadForPitch, setSelectedLeadForPitch] = useState<Lead | null>(null);
  const [isPitchModalOpen, setIsPitchModalOpen] = useState(false);
  const [pitchChannel, setPitchChannel] = useState<'WHATSAPP' | 'EMAIL'>('WHATSAPP');
  const [copied, setCopied] = useState(false);

  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [leadToConvert, setLeadToConvert] = useState<Lead | null>(null);
  const [selectedPackageId, setSelectedPackageId] = useState('pkg_growth_999');
  const [isConverting, setIsConverting] = useState(false);

  // Edit Lead Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedLeadForEdit, setSelectedLeadForEdit] = useState<Lead | null>(null);
  const [editBizName, setEditBizName] = useState('');
  const [editContact, setEditContact] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editWhatsapp, setEditWhatsapp] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editState, setEditState] = useState('');
  const [editStatus, setEditStatus] = useState<LeadStatus>('NEW');
  const [editEstimatedValue, setEditEstimatedValue] = useState(999);
  const [editNotes, setEditNotes] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Quick Add Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newBizName, setNewBizName] = useState('');
  const [newContact, setNewContact] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newWhatsapp, setNewWhatsapp] = useState('');
  const [newCategory, setNewCategory] = useState('Clinic / Healthcare');
  const [newCity, setNewCity] = useState('Ranchi');
  const [newEstValue, setNewEstValue] = useState(999);
  const [isCreating, setIsCreating] = useState(false);

  // Audit scanning state
  const [auditingLeadId, setAuditingLeadId] = useState<string | null>(null);

  const fetchLatestLeads = async () => {
    try {
      setIsLoadingLeads(true);
      const res = await fetch('/api/leads');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setLeads(data.data);
          globalStore.leads = data.data;
        }
      }
    } catch (err) {
      console.error('Failed to fetch latest leads:', err);
    } finally {
      setIsLoadingLeads(false);
    }
  };

  React.useEffect(() => {
    fetchLatestLeads();
  }, []);

  const filteredLeads = leads.filter((l) => {
    const matchesSearch =
      l.businessName.toLowerCase().includes(search.toLowerCase()) ||
      l.contactName.toLowerCase().includes(search.toLowerCase()) ||
      l.category.toLowerCase().includes(search.toLowerCase()) ||
      l.phone.includes(search);
    const matchesStatus = selectedStatus === 'ALL' || l.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  // --- Handlers ---
  const handleOpenAiSummary = (lead: Lead) => {
    setSelectedLeadForAi(lead);
    setIsAiModalOpen(true);
  };

  const handleOpenPitchModal = (lead: Lead) => {
    setSelectedLeadForPitch(lead);
    setIsPitchModalOpen(true);
    setCopied(false);
  };

  const handleOpenConvert = (lead: Lead) => {
    setLeadToConvert(lead);
    setIsConvertModalOpen(true);
  };

  const handleOpenEdit = (lead: Lead) => {
    setSelectedLeadForEdit(lead);
    setEditBizName(lead.businessName);
    setEditContact(lead.contactName || '');
    setEditPhone(lead.phone || '');
    setEditWhatsapp(lead.whatsapp || lead.phone || '');
    setEditEmail(lead.email || '');
    setEditCategory(lead.category || 'Local Business');
    setEditCity(lead.city || 'Ranchi');
    setEditState(lead.state || 'Jharkhand');
    setEditStatus(lead.status || 'NEW');
    setEditEstimatedValue(lead.estimatedValue || 999);
    setEditNotes(lead.notes || '');
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeadForEdit) return;

    try {
      setIsSavingEdit(true);
      const updates = {
        businessName: editBizName.trim(),
        contactName: editContact.trim() || editBizName.trim(),
        phone: editPhone.trim(),
        whatsapp: editWhatsapp.trim() || editPhone.trim(),
        email: editEmail.trim(),
        category: editCategory.trim(),
        city: editCity.trim() || 'Ranchi',
        state: editState.trim() || 'Jharkhand',
        status: editStatus,
        estimatedValue: Number(editEstimatedValue) || 999,
        notes: editNotes.trim(),
      };

      const res = await fetch('/api/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedLeadForEdit.id,
          ...updates,
        }),
      });

      if (res.ok) {
        setLeads((prev) =>
          prev.map((l) => (l.id === selectedLeadForEdit.id ? { ...l, ...updates } : l))
        );
        setIsEditModalOpen(false);
      } else {
        alert('Failed to update lead');
      }
    } catch (err) {
      console.error('Update lead error:', err);
      alert('Error updating lead');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleOpenDelete = (lead: Lead) => {
    setLeadToDelete(lead);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!leadToDelete) return;
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/leads?id=${leadToDelete.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setLeads((prev) => prev.filter((l) => l.id !== leadToDelete.id));
        setIsDeleteModalOpen(false);
      } else {
        alert('Failed to delete lead from database.');
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Network error while deleting lead.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRunAuditForLead = async (lead: Lead) => {
    try {
      setAuditingLeadId(lead.id);
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: lead.businessName,
          googleMapsUrl: lead.googleMapsUrl,
          category: lead.category,
          city: lead.city,
          phone: lead.phone,
          contactName: lead.contactName,
        }),
      });

      if (res.ok) {
        const auditRes = await res.json();
        if (auditRes.success && auditRes.data) {
          const newScore = auditRes.data.overallScore;
          // Update in database
          await fetch('/api/leads', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: lead.id,
              auditScore: newScore,
              leadScore: newScore,
              status: lead.status === 'NEW' ? 'AUDIT' : lead.status,
              notes: `${lead.notes || ''} | Presence Audit Score: ${newScore}/100 (${auditRes.data.validationStatus}).`,
            }),
          });
          await fetchLatestLeads();
          alert(`✅ Live Audit Complete for "${lead.businessName}"!\nScore: ${newScore}/100\nStatus: ${auditRes.data.validationStatus}\nRecommended: ${auditRes.data.suggestedPackage?.name}`);
        }
      } else {
        alert('Audit scan could not be completed. Please check connection or business name.');
      }
    } catch (err) {
      console.error('Audit run error:', err);
      alert('Error triggering audit scan.');
    } finally {
      setAuditingLeadId(null);
    }
  };

  const handleConfirmConvert = async () => {
    if (!leadToConvert) return;
    try {
      setIsConverting(true);
      const res = await fetch('/api/leads/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: leadToConvert.id,
          packageId: selectedPackageId,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setLeads((prev) =>
          prev.map((l) => (l.id === leadToConvert.id ? { ...l, status: 'WON' } : l))
        );
        await fetchLatestLeads();
        setIsConvertModalOpen(false);
        alert(
          `Converted ${leadToConvert.businessName} to active Client!\n\n• Client 360 profile generated\n• 7-Day Onboarding project scheduled\n• 7 Kickoff tasks added to Delivery Team\n• Initial billing invoice created in Billed & Invoices`
        );
      } else {
        alert(data.error || 'Failed to convert lead.');
      }
    } catch (err) {
      console.error('Conversion error:', err);
      alert('Network error while converting lead.');
    } finally {
      setIsConverting(false);
    }
  };

  const handleMarkContacted = async (lead: Lead) => {
    if (lead.status === 'NEW' || lead.status === 'AUDIT') {
      try {
        setLeads((prev) =>
          prev.map((l) => (l.id === lead.id ? { ...l, status: 'CONTACTED' } : l))
        );
        await fetch('/api/leads', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: lead.id, status: 'CONTACTED' }),
        });
      } catch (err) {
        console.error('Failed to update lead status:', err);
      }
    }
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBizName || !newPhone) return;

    try {
      setIsCreating(true);
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: newBizName.trim(),
          contactName: newContact.trim() || newBizName.trim(),
          phone: newPhone.trim(),
          whatsapp: newWhatsapp.trim() || newPhone.trim(),
          email: `${newPhone.replace(/[^0-9]/g, '')}@lead.digitalranchi.in`,
          category: newCategory,
          city: newCity.trim() || 'Ranchi',
          state: 'Jharkhand',
          leadSource: 'CRM Direct Ingestion',
          estimatedValue: Number(newEstValue) || 999,
          leadScore: 0,
          auditScore: null,
          status: 'NEW',
          notes: 'Manually logged by Admin.',
        }),
      });

      if (res.ok) {
        await fetchLatestLeads();
        setIsCreateModalOpen(false);
        setNewBizName('');
        setNewContact('');
        setNewPhone('');
        setNewWhatsapp('');
      } else {
        alert('Failed to save lead');
      }
    } catch (err) {
      console.error('Failed to create lead:', err);
      alert('Error creating lead');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>Lead Management & Ingestion</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-200 dark:border-indigo-800">
              {leads.length} Leads
            </span>
          </h2>
          <p className="text-xs text-slate-500">
            Real-time pipeline synced with Neon Cloud Database. Click "Audit Now" to calculate real presence scores.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchLatestLeads}
            isLoading={isLoadingLeads}
            icon={RotateCw}
          >
            Refresh
          </Button>
          <Link href="/app/pipeline">
            <Button variant="outline" size="sm">
              Kanban View
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
            placeholder="Search business name, owner, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {['ALL', 'NEW', 'CONTACTED', 'AUDIT', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST'].map((st) => (
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
                <th className="py-3.5 px-4">Business & Owner Name</th>
                <th className="py-3.5 px-4">Category & Location</th>
                <th className="py-3.5 px-4">Presence Score</th>
                <th className="py-3.5 px-4">Deal Value</th>
                <th className="py-3.5 px-4">Stage</th>
                <th className="py-3.5 px-4">Source</th>
                <th className="py-3.5 px-4 text-right">Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Users className="w-8 h-8 text-slate-300 dark:text-slate-700" />
                      <p className="font-semibold text-sm">No matching leads found</p>
                      <p className="text-xs text-slate-400">
                        Add a lead using the button above or run an audit scanner from the landing page.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => {
                  const hasAuditScore = lead.auditScore !== null && lead.auditScore !== undefined && Number(lead.auditScore) > 0;
                  const scoreVal = hasAuditScore ? Number(lead.auditScore) : 0;
                  const isAuditing = auditingLeadId === lead.id;

                  return (
                    <tr key={lead.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 dark:text-white text-sm">{lead.businessName}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">{lead.contactName || 'Owner'}</span>
                          <span>•</span>
                          <span className="text-indigo-600 dark:text-indigo-400">{lead.phone}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-medium text-slate-800 dark:text-slate-200">{lead.category}</span>
                        <div className="text-[10px] text-slate-400">{lead.city || 'Ranchi'}, {lead.state || 'Jharkhand'}</div>
                      </td>

                      <td className="py-3 px-4">
                        {hasAuditScore ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <span className={`font-bold text-xs ${scoreVal >= 75 ? 'text-emerald-600' : scoreVal >= 50 ? 'text-amber-600' : 'text-rose-600'}`}>
                                {scoreVal}/100
                              </span>
                              <button
                                onClick={() => handleRunAuditForLead(lead)}
                                disabled={isAuditing}
                                title="Re-run Live Presence Audit"
                                className="p-1 rounded text-slate-400 hover:text-indigo-600 transition-colors"
                              >
                                <RotateCw className={`w-3 h-3 ${isAuditing ? 'animate-spin text-indigo-600' : ''}`} />
                              </button>
                            </div>
                            <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${scoreVal >= 75 ? 'bg-emerald-500' : scoreVal >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
                                style={{ width: `${scoreVal}%` }}
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleRunAuditForLead(lead)}
                              disabled={isAuditing}
                              className="px-2 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-bold text-[10px] flex items-center gap-1 transition-all"
                            >
                              <Zap className={`w-3 h-3 text-amber-500 ${isAuditing ? 'animate-pulse' : ''}`} />
                              <span>{isAuditing ? 'Auditing...' : 'Audit Now'}</span>
                            </button>
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                        {formatINR(lead.estimatedValue || 999)}
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
                        {lead.leadSource}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Pitch */}
                          <button
                            onClick={() => handleOpenPitchModal(lead)}
                            className="px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 transition-colors font-semibold text-[11px] flex items-center gap-1"
                            title="Send Audit Pitch & WhatsApp Report"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Pitch</span>
                          </button>

                          {/* AI */}
                          <button
                            onClick={() => handleOpenAiSummary(lead)}
                            className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border border-amber-500/30 transition-colors"
                            title="AI Lead Intelligence"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit Lead */}
                          <button
                            onClick={() => handleOpenEdit(lead)}
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 border border-slate-200 dark:border-slate-700 transition-colors"
                            title="Edit Lead Details"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Lead */}
                          <button
                            onClick={() => handleOpenDelete(lead)}
                            className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800 transition-colors"
                            title="Delete Lead"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Convert */}
                          {lead.status !== 'WON' ? (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleOpenConvert(lead)}
                            >
                              Convert
                            </Button>
                          ) : (
                            <span className="text-[10px] text-emerald-600 font-semibold px-2 py-1 bg-emerald-50 rounded">
                              Won
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Lead Modal */}
      {selectedLeadForEdit && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={`Edit Lead: ${selectedLeadForEdit.businessName}`}
          description="Update business name, owner contact details, deal value, or pipeline stage."
        >
          <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Business / Clinic Name *"
                value={editBizName}
                onChange={(e) => setEditBizName(e.target.value)}
                required
              />
              <Input
                label="Owner / Contact Person *"
                value={editContact}
                onChange={(e) => setEditContact(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Phone Number *"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                required
              />
              <Input
                label="WhatsApp Number"
                value={editWhatsapp}
                onChange={(e) => setEditWhatsapp(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Email Address"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
              />
              <Input
                label="Category / Industry"
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="City"
                value={editCity}
                onChange={(e) => setEditCity(e.target.value)}
              />
              <Input
                label="State"
                value={editState}
                onChange={(e) => setEditState(e.target.value)}
              />
              <Input
                label="Deal Value (₹)"
                type="number"
                value={editEstimatedValue}
                onChange={(e) => setEditEstimatedValue(Number(e.target.value))}
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Pipeline Stage:
              </label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value as LeadStatus)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 text-xs text-slate-900 dark:text-white"
              >
                {['NEW', 'CONTACTED', 'QUALIFIED', 'AUDIT', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST'].map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Internal Sales & Follow-up Notes:
              </label>
              <textarea
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                rows={3}
                placeholder="Log customer discussions, pricing feedback, next steps..."
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <Button variant="outline" size="sm" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={isSavingEdit}>
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Lead Confirmation Modal */}
      {leadToDelete && (
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="Delete Lead Confirmation"
          description="Are you sure you want to permanently delete this lead from the CRM?"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300">
              <p className="font-bold">Warning: This action cannot be undone.</p>
              <p className="mt-1 text-[11px]">
                Deleting <strong>{leadToDelete.businessName}</strong> ({leadToDelete.contactName}, {leadToDelete.phone}) will remove the record from your Neon PostgreSQL database.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setIsDeleteModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmDelete}
                isLoading={isDeleting}
                className="!bg-rose-600 hover:!bg-rose-700 text-white"
              >
                Delete Permanently
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
        description="Record a walk-in, phone call, or field sales discovery with zero default score until audited"
      >
        <form onSubmit={handleCreateLead} className="space-y-3 text-xs">
          <Input
            label="Business / Clinic Name *"
            placeholder="e.g. Ranchi Optical House"
            value={newBizName}
            onChange={(e) => setNewBizName(e.target.value)}
            required
          />
          <Input
            label="Owner / Contact Person *"
            placeholder="e.g. Ankit Singhal"
            value={newContact}
            onChange={(e) => setNewContact(e.target.value)}
            required
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Phone Number *"
              placeholder="+91 98765 43210"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              required
            />
            <Input
              label="WhatsApp Number"
              placeholder="+91 98765 43210"
              value={newWhatsapp}
              onChange={(e) => setNewWhatsapp(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Category"
              placeholder="e.g. Clinic / Coaching / Retail"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            />
            <Input
              label="City"
              placeholder="Ranchi"
              value={newCity}
              onChange={(e) => setNewCity(e.target.value)}
            />
            <Input
              label="Deal Value (₹)"
              type="number"
              value={newEstValue}
              onChange={(e) => setNewEstValue(Number(e.target.value))}
            />
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 text-[11px]">
            💡 <strong>Note:</strong> New leads start with <em>Pending Audit</em>. You can click <strong>"Audit Now"</strong> on the leads table anytime to run a live Google presence audit.
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <Button variant="outline" size="sm" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isCreating}>
              Save Lead to Database
            </Button>
          </div>
        </form>
      </Modal>

      {/* 1-Click Audit Pitch Dispatcher Modal */}
      {selectedLeadForPitch && (
        <Modal
          isOpen={isPitchModalOpen}
          onClose={() => setIsPitchModalOpen(false)}
          title={`Dispatch Audit Pitch: ${selectedLeadForPitch.businessName}`}
          description="Personalized outreach based on Google Presence Audit findings & recommended growth package."
        >
          {(() => {
            const pitch = aiAssistantEngine.generateDetailedSalesPitch(selectedLeadForPitch);
            return (
              <div className="space-y-4 text-xs">
                {/* Channel Selector */}
                <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                  <button
                    onClick={() => setPitchChannel('WHATSAPP')}
                    className={`flex-1 py-1.5 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
                      pitchChannel === 'WHATSAPP'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp Pitch
                  </button>
                  <button
                    onClick={() => setPitchChannel('EMAIL')}
                    className={`flex-1 py-1.5 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
                      pitchChannel === 'EMAIL'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Mail className="w-4 h-4" />
                    Email Proposal
                  </button>
                </div>

                {pitchChannel === 'WHATSAPP' ? (
                  <div className="space-y-3">
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-emerald-800 dark:text-emerald-300">
                          Pre-formatted WhatsApp Pitch:
                        </span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(pitch.whatsAppText);
                            setCopied(true);
                            setTimeout(() => setCopied(false), 2000);
                          }}
                          className="px-2 py-1 rounded bg-white dark:bg-slate-900 text-emerald-600 font-semibold text-[10px] border border-emerald-200 shadow-sm flex items-center gap-1"
                        >
                          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          {copied ? 'Copied!' : 'Copy Text'}
                        </button>
                      </div>
                      <pre className="whitespace-pre-wrap font-sans text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-emerald-100 max-h-48 overflow-y-auto">
                        {pitch.whatsAppText}
                      </pre>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <Button variant="outline" size="sm" onClick={() => setIsPitchModalOpen(false)}>
                        Cancel
                      </Button>
                      <a
                        href={`https://wa.me/${selectedLeadForPitch.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                          pitch.whatsAppText
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => handleMarkContacted(selectedLeadForPitch)}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/30"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Open WhatsApp & Send</span>
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-xl space-y-2">
                      <span className="font-bold text-indigo-800 dark:text-indigo-300 block">
                        Subject: {pitch.emailSubject}
                      </span>
                      <pre className="whitespace-pre-wrap font-sans text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-indigo-100 max-h-48 overflow-y-auto">
                        {pitch.emailBody}
                      </pre>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <Button variant="outline" size="sm" onClick={() => setIsPitchModalOpen(false)}>
                        Cancel
                      </Button>
                      <a
                        href={`mailto:${selectedLeadForPitch.email}?subject=${encodeURIComponent(
                          pitch.emailSubject
                        )}&body=${encodeURIComponent(pitch.emailBody)}`}
                        onClick={() => handleMarkContacted(selectedLeadForPitch)}
                        className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/30"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Send Email via Client</span>
                      </a>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </Modal>
      )}

      {/* AI Lead Intelligence Modal */}
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
                    onClick={() => handleMarkContacted(selectedLeadForAi)}
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
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmConvert}
                isLoading={isConverting}
              >
                Confirm Conversion
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
