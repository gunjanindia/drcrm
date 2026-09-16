'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Building2,
  Search,
  Star,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  Plus,
  Building,
  Sparkles,
  Globe,
  QrCode,
  PauseCircle,
  PlayCircle,
  Trash2,
  ShieldAlert,
  CheckCircle2,
} from 'lucide-react';
import { Button, Input, Modal, Badge } from '@/components/ui';
import { globalStore } from '@/lib/store';
import { Client } from '@/types';
import { formatINR, formatDate, getHealthScoreColor } from '@/lib/utils';
import { CreateClientPortalModal } from '@/components/admin/CreateClientPortalModal';

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [filterHealth, setFilterHealth] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isProvisionModalOpen, setIsProvisionModalOpen] = useState(false);

  // AI Refill state
  const [refillClient, setRefillClient] = useState<Client | null>(null);
  const [refillAmount, setRefillAmount] = useState(50);
  const [refillNote, setRefillNote] = useState('Admin Support Pack');
  const [isRefilling, setIsRefilling] = useState(false);
  const [refillSuccess, setRefillSuccess] = useState<string | null>(null);

  // Deactivate / Delete states
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // New Client Form
  const [bizName, setBizName] = useState('');
  const [category, setCategory] = useState('Clinic');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('Ranchi');
  const [packageId, setPackageId] = useState('pkg_growth_999');

  const fetchClients = () => {
    fetch('/api/clients')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setClients(data.data);
          globalStore.clients = data.data;
        }
      })
      .catch((err) => console.error('Failed to load clients:', err));
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bizName.trim()) return;

    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: bizName.trim(),
          category,
          phone,
          email,
          city,
          packageId,
        }),
      });

      if (res.ok) {
        fetchClients();
        setIsAddModalOpen(false);
        setBizName('');
        setPhone('');
        setEmail('');
      }
    } catch (err) {
      console.error('Failed to create client:', err);
    }
  };

  const handleToggleStatus = async (client: Client) => {
    const nextStatus = client.status === 'PAUSED' ? 'ACTIVE' : 'PAUSED';
    setUpdatingId(client.id);
    try {
      const res = await fetch('/api/clients', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: client.id,
          status: nextStatus,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setClients((prev) =>
          prev.map((c) => (c.id === client.id ? { ...c, status: nextStatus as any } : c))
        );
      }
    } catch (e) {
      console.error('Failed to toggle client status:', e);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteClient = async () => {
    if (!clientToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/clients?id=${encodeURIComponent(clientToDelete.id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setClients((prev) => prev.filter((c) => c.id !== clientToDelete.id));
        setClientToDelete(null);
      } else {
        alert(data.error || 'Failed to delete client');
      }
    } catch (e) {
      console.error('Failed to delete client:', e);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredClients = clients.filter((c) => {
    const matchesSearch =
      c.businessName.toLowerCase().includes(search.toLowerCase()) ||
      c.category.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search);
    const matchesHealth = filterHealth === 'ALL' || c.healthScore === filterHealth;
    const matchesStatus =
      filterStatus === 'ALL' ||
      (filterStatus === 'ACTIVE' && c.status !== 'PAUSED') ||
      (filterStatus === 'PAUSED' && c.status === 'PAUSED');
    return matchesSearch && matchesHealth && matchesStatus;
  });

  const handleRefillCredits = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refillClient || refillAmount <= 0) return;

    setIsRefilling(true);
    setRefillSuccess(null);

    try {
      const res = await fetch('/api/admin/ai-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: refillClient.id,
          creditsToAdd: Number(refillAmount),
          note: refillNote,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setRefillSuccess(`Successfully added +${refillAmount} AI Credits to ${refillClient.businessName}!`);
        fetchClients();
        setTimeout(() => {
          setRefillSuccess(null);
          setRefillClient(null);
        }, 1500);
      } else {
        alert(data.error || 'Failed to grant AI credits.');
      }
    } catch (err: any) {
      alert(err.message || 'Error granting AI credits.');
    } finally {
      setIsRefilling(false);
    }
  };

  const totalCredits = clients.reduce((acc, c) => acc + (c.aiCreditBalance ?? 20), 0);
  const totalDemo = clients.filter((c) => c.subscriptionStatus !== 'ACTIVE').length;
  const totalActiveRevenue = clients.reduce((acc, c) => acc + (c.monthlyRevenue || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Client Directory & SaaS Growth Monitor
          </h2>
          <p className="text-xs text-slate-500">
            {clients.length} Client Accounts with Client 360 portal management, AI Credit Wallets & retainers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={Sparkles}
            onClick={() => setIsProvisionModalOpen(true)}
          >
            Provision Client 360 Portal
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => setIsAddModalOpen(true)}
          >
            Add Account
          </Button>
        </div>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">Total Clients</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{clients.length}</div>
          <span className="text-[10px] text-emerald-500 font-bold block">100% Client 360 Ready</span>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-[10px] text-purple-600 dark:text-purple-400 uppercase font-black tracking-wider block">AI Credits Active</span>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
            <Sparkles className="w-5 h-5" />
            {totalCredits.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-400 font-medium block">In client wallet balances</span>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-[10px] text-amber-600 dark:text-amber-400 uppercase font-black tracking-wider block">14-Day Free Demos</span>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400">{totalDemo}</div>
          <span className="text-[10px] text-slate-400 font-medium block">Demo trials in progress</span>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase font-black tracking-wider block">Total Monthly MRR</span>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{formatINR(totalActiveRevenue)}</div>
          <span className="text-[10px] text-slate-400 font-medium block">Retainers & Platform fees</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search client business name, category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            {['ALL', 'ACTIVE', 'PAUSED'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  filterStatus === st
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {st === 'ALL' ? 'All Status' : st === 'ACTIVE' ? 'Active Portals' : 'Deactivated'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1">
            {['ALL', 'GREEN', 'YELLOW', 'RED'].map((h) => (
              <button
                key={h}
                onClick={() => setFilterHealth(h)}
                className={`px-2.5 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  filterHealth === h
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                {h === 'ALL' ? 'All Health' : `Health: ${h}`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Clients Grid */}
      {filteredClients.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
          <Building2 className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">No clients found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Click &quot;Provision Client 360 Portal&quot; or &quot;Add Account&quot; above to register an active business.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredClients.map((client) => {
            const isPaused = client.status === 'PAUSED' || client.status === 'CHURNED';
            const credits = client.aiCreditBalance ?? 20;
            const isLowCredits = credits <= 5;
            return (
              <div
                key={client.id}
                className={`p-5 rounded-3xl bg-white dark:bg-slate-900 border shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 ${
                  isPaused ? 'border-rose-200 dark:border-rose-950/60 bg-rose-50/20' : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">
                        {client.businessName}
                      </h3>
                      <span className="text-[11px] text-slate-500">{client.category} • {client.city}</span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                          isPaused
                            ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border-rose-300'
                            : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-300'
                        }`}
                      >
                        {isPaused ? 'DEACTIVATED' : 'ACTIVE'}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${getHealthScoreColor(
                          client.healthScore
                        )}`}
                      >
                        {client.healthScore}
                      </span>
                    </div>
                  </div>

                  {/* AI Credits Balance & SaaS Status Bar */}
                  <div className="p-2.5 rounded-2xl bg-purple-500/10 dark:bg-purple-950/40 border border-purple-500/20 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded-lg bg-purple-500/20 text-purple-600 dark:text-purple-300">
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block uppercase leading-tight">AI Credits Balance</span>
                        <span className={`font-black ${credits === 0 ? 'text-rose-600' : isLowCredits ? 'text-amber-600' : 'text-purple-600 dark:text-purple-300'}`}>
                          {credits} Credits {credits === 0 ? '(Exhausted)' : isLowCredits ? '(Low)' : ''}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase leading-tight">Platform Tier</span>
                      <span className="font-bold text-[11px] text-slate-700 dark:text-slate-300">
                        {client.subscriptionStatus === 'ACTIVE' ? 'Active SaaS' : '14-Day Free Demo'}
                      </span>
                    </div>
                  </div>

                  {/* Package & Revenue */}
                  <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Active Package</span>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400 truncate block max-w-[140px]">
                        {client.packageName}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block font-medium">Monthly Rev</span>
                      <span className="font-black text-slate-900 dark:text-white">
                        {formatINR(client.monthlyRevenue)}
                      </span>
                    </div>
                  </div>

                  {/* GBP & Review Metrics */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                      <span className="text-[9px] text-slate-400 uppercase font-bold block">Rating</span>
                      <span className="font-bold text-amber-500 flex items-center justify-center gap-0.5">
                        {client.averageRating} <Star className="w-3 h-3 fill-amber-500" />
                      </span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                      <span className="text-[9px] text-slate-400 uppercase font-bold block">Reviews</span>
                      <span className="font-bold text-slate-900 dark:text-white">{client.reviewCount}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                      <span className="text-[9px] text-slate-400 uppercase font-bold block">GBP Score</span>
                      <span className="font-bold text-indigo-600">{client.gbpScore}%</span>
                    </div>
                  </div>

                  {/* Health Reason */}
                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                    {client.healthReason}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-1 text-[11px]">
                    <Link href={`/portal?clientId=${client.id}`} target="_blank" className="flex-1">
                      <Button variant="ghost" size="sm" icon={Globe} className="w-full text-sky-600 hover:bg-sky-50 text-[11px] py-1 h-8">
                        Portal
                      </Button>
                    </Link>
                    <Link href={`/app/clients/${client.id}`} className="flex-1">
                      <Button variant="outline" size="sm" icon={ArrowUpRight} className="w-full text-[11px] py-1 h-8">
                        Admin 360
                      </Button>
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setRefillClient(client);
                        setRefillAmount(50);
                        setRefillNote(`Manual Refill for ${client.businessName}`);
                      }}
                      className="px-2.5 py-1 rounded-xl bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 hover:bg-purple-100 transition-colors text-[11px] font-bold flex items-center gap-1 border border-purple-200 dark:border-purple-800 h-8"
                    >
                      <Sparkles className="w-3 h-3 text-purple-600" />
                      +Refill
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-1 pt-1 border-t border-slate-100 dark:border-slate-800/60">
                    <button
                      onClick={() => handleToggleStatus(client)}
                      disabled={updatingId === client.id}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 ${
                        isPaused
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 hover:bg-emerald-100'
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 hover:bg-amber-100'
                      }`}
                    >
                      {isPaused ? <PlayCircle className="w-3 h-3" /> : <PauseCircle className="w-3 h-3" />}
                      {updatingId === client.id ? 'Updating...' : isPaused ? 'Reactivate' : 'Deactivate'}
                    </button>

                    <button
                      onClick={() => setClientToDelete(client)}
                      className="text-[10px] font-bold px-2 py-1 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Admin AI Credit Refill Modal */}
      {refillClient && (
        <Modal
          isOpen={true}
          onClose={() => setRefillClient(null)}
          title={`Refill AI Credits for ${refillClient.businessName}`}
          description={`Current Wallet Balance: ${refillClient.aiCreditBalance ?? 20} AI Credits`}
        >
          <form onSubmit={handleRefillCredits} className="space-y-4 text-xs">
            {refillSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{refillSuccess}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Credits to Add *
              </label>
              <input
                type="number"
                min="1"
                max="10000"
                value={refillAmount}
                onChange={(e) => setRefillAmount(Number(e.target.value))}
                className="w-full text-xs p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Refill Reason / Note
              </label>
              <input
                type="text"
                value={refillNote}
                onChange={(e) => setRefillNote(e.target.value)}
                placeholder="e.g. Monthly Retainer Refill or Bonus"
                className="w-full text-xs p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setRefillClient(null)}
                disabled={isRefilling}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isRefilling}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                Grant +{refillAmount} Credits
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Client Confirmation Modal */}
      {clientToDelete && (
        <Modal
          isOpen={true}
          onClose={() => setClientToDelete(null)}
          title="Delete Client 360 Portal"
          description="Permanently remove client account, portal login, and all associated CRM records."
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-200 space-y-2">
              <p className="font-bold flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                Warning: Permanent deletion cannot be undone.
              </p>
              <p>
                Deleting <strong>{clientToDelete.businessName}</strong> will purge:
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300">
                <li>Client 360 portal user credentials and session</li>
                <li>Tasks, deliverables, and support tickets</li>
                <li>Invoices, payments, and timeline activity history</li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setClientToDelete(null)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={Trash2}
                onClick={handleDeleteClient}
                disabled={isDeleting}
                className="bg-rose-600 hover:bg-rose-700 text-white"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete Permanently'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Provision Client 360 Portal Modal */}
      <CreateClientPortalModal
        isOpen={isProvisionModalOpen}
        onClose={() => setIsProvisionModalOpen(false)}
        onClientCreated={() => fetchClients()}
      />

      {/* Add Client Account Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Active Client Account"
        description="Register a newly signed business client directly into CRM."
      >
        <form onSubmit={handleCreateClient} className="space-y-3 text-xs">
          <Input
            label="Business Name *"
            placeholder="e.g. Glow Heaven Ladies Beauty Parlour"
            value={bizName}
            onChange={(e) => setBizName(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Category"
              placeholder="e.g. Beauty Parlour / Salon"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
            <Input
              label="City"
              placeholder="e.g. Ranchi"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Phone / WhatsApp"
              placeholder="+91 94311 00000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <Input
              label="Email"
              placeholder="contact@business.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Active Service Package
            </label>
            <select
              value={packageId}
              onChange={(e) => setPackageId(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white"
            >
              {globalStore.packages.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({formatINR(p.price)} - {p.billingFrequency})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" size="sm" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Client
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
