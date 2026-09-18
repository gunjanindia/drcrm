'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  ToggleLeft,
  ToggleRight,
  Download,
  Phone,
  MessageCircle,
  CheckCircle2,
  Clock,
  Star,
  ExternalLink,
  Search,
  Filter,
  User,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { PrivateFeedback } from '@/types';

export default function PrivateFeedbackInboxPage() {
  const [feedbacks, setFeedbacks] = useState<PrivateFeedback[]>([]);
  const [isShieldActive, setIsShieldActive] = useState(true);
  const [totalIntercepted, setTotalIntercepted] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ALL' | 'NEW' | 'CONTACTED' | 'RESOLVED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Resolving modal state
  const [selectedFeedback, setSelectedFeedback] = useState<PrivateFeedback | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [isResolving, setIsResolving] = useState(false);

  const fetchFeedbackData = () => {
    fetch('/api/portal/feedback')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setFeedbacks(data.data.feedbacks || []);
          setIsShieldActive(data.data.isShieldActive ?? true);
          setTotalIntercepted(data.data.totalIntercepted ?? (data.data.feedbacks || []).length);
        }
      })
      .catch((err) => console.error('Error loading feedback:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchFeedbackData();
  }, []);

  const handleToggleShield = async () => {
    const nextState = !isShieldActive;
    setIsShieldActive(nextState);
    try {
      await fetch('/api/portal/feedback', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isShieldActive: nextState }),
      });
    } catch (e) {
      console.error('Error toggling shield:', e);
    }
  };

  const handleUpdateStatus = async (feedbackId: string, newStatus: 'NEW' | 'CONTACTED' | 'RESOLVED', notes?: string) => {
    try {
      const res = await fetch('/api/portal/feedback', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feedbackId,
          status: newStatus,
          resolutionNotes: notes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        fetchFeedbackData();
        setSelectedFeedback(null);
        setResolutionNotes('');
      }
    } catch (e) {
      console.error('Error updating feedback status:', e);
    }
  };

  const exportToCSV = () => {
    if (feedbacks.length === 0) return;
    const headers = ['Feedback ID', 'Customer Name', 'Phone', 'Email', 'Star Rating', 'Message', 'Status', 'Date', 'Resolution Notes'];
    const rows = feedbacks.map((f) => [
      f.id,
      `"${f.customerName.replace(/"/g, '""')}"`,
      `"${f.customerPhone}"`,
      `"${f.customerEmail || 'N/A'}"`,
      f.rating,
      `"${f.message.replace(/"/g, '""')}"`,
      f.status,
      new Date(f.createdAt).toLocaleDateString(),
      `"${(f.resolutionNotes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `private_customer_feedback_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredFeedbacks = feedbacks.filter((f) => {
    const matchesTab = activeTab === 'ALL' || f.status === activeTab;
    const matchesQuery =
      !searchQuery ||
      f.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.customerPhone.includes(searchQuery) ||
      f.message.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesQuery;
  });

  const unresolvedCount = feedbacks.filter((f) => f.status === 'NEW').length;
  const inProgressCount = feedbacks.filter((f) => f.status === 'CONTACTED').length;
  const resolvedCount = feedbacks.filter((f) => f.status === 'RESOLVED').length;

  return (
    <div className="space-y-6 max-w-6xl pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              Smart Sentiment Shield
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Private Customer Feedback Inbox
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            1–3 star customer grievances caught by Smart Sentiment Routing before reaching your public Google Maps profile.
          </p>
        </div>

        <button
          type="button"
          onClick={exportToCSV}
          disabled={feedbacks.length === 0}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-700 shadow-sm shrink-0"
        >
          <Download className="w-3.5 h-3.5 text-indigo-400" />
          Export Complaints to CSV
        </button>
      </div>

      {/* HERO BANNER: SMART SENTIMENT SHIELD CONTROL & METRICS */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg ${
                isShieldActive
                  ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 shadow-emerald-600/30'
                  : 'bg-slate-800 text-slate-500'
              }`}
            >
              {isShieldActive ? <ShieldCheck className="w-7 h-7" /> : <ShieldAlert className="w-7 h-7" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Smart Sentiment Routing Shield</h3>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                    isShieldActive
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  }`}
                >
                  {isShieldActive ? 'Active & Protecting 5★ Rating' : 'Disabled (Direct Public Routing)'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed max-w-xl">
                {isShieldActive
                  ? '4–5 star ratings are instantly routed to Google Maps with 1-click AI copy. 1–3 star ratings are intercepted privately into this inbox so you can resolve customer complaints directly.'
                  : 'All customers are sent directly to Google Maps regardless of star rating.'}
              </p>
            </div>
          </div>

          {/* Master Switch */}
          <div className="flex items-center gap-4 bg-slate-950/60 border border-slate-800 rounded-2xl p-3 shrink-0">
            <div className="text-right">
              <span className="text-xs font-bold text-white block">Sentiment Filter</span>
              <span className="text-[10px] text-slate-400">{isShieldActive ? 'Enabled' : 'Disabled'}</span>
            </div>
            <button
              type="button"
              onClick={handleToggleShield}
              className="text-3xl transition-transform active:scale-95"
            >
              {isShieldActive ? (
                <ToggleRight className="w-10 h-10 text-emerald-400" />
              ) : (
                <ToggleLeft className="w-10 h-10 text-slate-600" />
              )}
            </button>
          </div>
        </div>

        {/* Quick KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800">
          <div className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-3">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Complaints Shielded</span>
            <span className="text-lg font-black text-emerald-400">{totalIntercepted}</span>
          </div>
          <div className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-3">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Needs Attention</span>
            <span className="text-lg font-black text-rose-400">{unresolvedCount}</span>
          </div>
          <div className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-3">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">In Progress</span>
            <span className="text-lg font-black text-amber-400">{inProgressCount}</span>
          </div>
          <div className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-3">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Resolved Successfully</span>
            <span className="text-lg font-black text-indigo-400">{resolvedCount}</span>
          </div>
        </div>
      </div>

      {/* FEEDBACK LIST & FILTERS */}
      <div className="space-y-4">
        {/* Search & Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-2xl">
            {(['ALL', 'NEW', 'CONTACTED', 'RESOLVED'] as const).map((tab) => {
              const active = activeTab === tab;
              const count =
                tab === 'ALL'
                  ? feedbacks.length
                  : tab === 'NEW'
                  ? unresolvedCount
                  : tab === 'CONTACTED'
                  ? inProgressCount
                  : resolvedCount;

              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    active ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>{tab === 'ALL' ? 'All Complaints' : tab === 'NEW' ? 'Unresolved' : tab === 'CONTACTED' ? 'Contacted' : 'Resolved'}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${active ? 'bg-indigo-700 text-white' : 'bg-slate-800 text-slate-400'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search bar */}
          <div className="relative max-w-xs w-full">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search customer, phone or keyword..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Complaints Feed */}
        {filteredFeedbacks.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-white">No Private Complaints Found</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {searchQuery
                ? 'No customer complaints match your search query.'
                : 'Your Smart Sentiment Shield is actively filtering reviews. No unresolved 1-3 star grievances at this time.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredFeedbacks.map((item) => {
              const cleanPhone = item.customerPhone.replace(/[^0-9]/g, '');
              const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                `Hi ${item.customerName}, this is management from ${item.businessName}. We received your feedback regarding your recent visit and would like to personally make it right.`
              )}`;

              return (
                <div
                  key={item.id}
                  className={`bg-slate-900 border rounded-3xl p-5 space-y-4 shadow-xl transition-all relative overflow-hidden ${
                    item.status === 'NEW'
                      ? 'border-rose-500/40 bg-gradient-to-br from-slate-900 to-rose-950/20'
                      : item.status === 'CONTACTED'
                      ? 'border-amber-500/40'
                      : 'border-slate-800 opacity-80'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-sm text-white">{item.customerName}</span>
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase border ${
                            item.status === 'NEW'
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                              : item.status === 'CONTACTED'
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          }`}
                        >
                          {item.status === 'NEW' ? 'Needs Call' : item.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 flex items-center gap-2">
                        <span>{item.customerPhone}</span>
                        {item.customerEmail && <span>• {item.customerEmail}</span>}
                      </p>
                    </div>

                    {/* Star Rating Badge */}
                    <div className="flex items-center gap-0.5 px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold text-xs shrink-0">
                      <span>{item.rating}★</span>
                      <Star className="w-3 h-3 fill-amber-400" />
                    </div>
                  </div>

                  {/* Message */}
                  <div className="bg-slate-950/70 rounded-2xl p-3.5 text-xs text-slate-200 leading-relaxed border border-slate-800/80">
                    "{item.message}"
                  </div>

                  {item.resolutionNotes && (
                    <div className="text-[11px] text-emerald-300 bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-2.5">
                      <strong>Resolution Note:</strong> {item.resolutionNotes}
                    </div>
                  )}

                  {/* Actions Strip */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800">
                    <span className="text-[10px] text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>

                    <div className="flex items-center gap-2">
                      {/* 1-Click WhatsApp */}
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => item.status === 'NEW' && handleUpdateStatus(item.id, 'CONTACTED')}
                        className="p-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all flex items-center gap-1"
                        title="Contact via WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">WhatsApp</span>
                      </a>

                      {/* Direct Call */}
                      <a
                        href={`tel:${item.customerPhone}`}
                        onClick={() => item.status === 'NEW' && handleUpdateStatus(item.id, 'CONTACTED')}
                        className="p-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-bold transition-all flex items-center gap-1"
                        title="Call Customer"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Call</span>
                      </a>

                      {/* Mark as Resolved */}
                      {item.status !== 'RESOLVED' ? (
                        <button
                          type="button"
                          onClick={() => setSelectedFeedback(item)}
                          className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-sm"
                        >
                          Resolve
                        </button>
                      ) : (
                        <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Resolved
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* RESOLUTION MODAL */}
      {selectedFeedback && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                Resolve Customer Complaint
              </h3>
              <button
                type="button"
                onClick={() => setSelectedFeedback(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Mark complaint from <strong>{selectedFeedback.customerName}</strong> as resolved. Add optional notes for your records:
            </p>

            <textarea
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              rows={3}
              placeholder="e.g. Called customer, offered complimentary consultation, customer is satisfied."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500 resize-none"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedFeedback(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleUpdateStatus(selectedFeedback.id, 'RESOLVED', resolutionNotes)}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md"
              >
                Confirm Resolved
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
