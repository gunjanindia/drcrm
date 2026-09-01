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
  Building
} from 'lucide-react';
import { Button, Input, Modal, Badge } from '@/components/ui';
import { globalStore } from '@/lib/store';
import { Client } from '@/types';
import { formatINR, formatDate, getHealthScoreColor } from '@/lib/utils';

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [filterHealth, setFilterHealth] = useState('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

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

  const filteredClients = clients.filter((c) => {
    const matchesSearch =
      c.businessName.toLowerCase().includes(search.toLowerCase()) ||
      c.category.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search);
    const matchesHealth = filterHealth === 'ALL' || c.healthScore === filterHealth;
    return matchesSearch && matchesHealth;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Client Directory & Health Monitor
          </h2>
          <p className="text-xs text-slate-500">
            {clients.length} Active Client Accounts with assigned retainers and automated task schedules.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={Plus}
          onClick={() => setIsAddModalOpen(true)}
        >
          Add Client Account
        </Button>
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

        <div className="flex items-center gap-2">
          {['ALL', 'GREEN', 'YELLOW', 'RED'].map((h) => (
            <button
              key={h}
              onClick={() => setFilterHealth(h)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                filterHealth === h
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              {h === 'ALL' ? 'All Clients' : `Health: ${h}`}
            </button>
          ))}
        </div>
      </div>

      {/* Clients Grid */}
      {filteredClients.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
          <Building2 className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">No active clients yet</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Convert leads from your Sales Pipeline or click &quot;Add Client Account&quot; above to add your first active business account.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredClients.map((client) => (
            <div
              key={client.id}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">
                      {client.businessName}
                    </h3>
                    <span className="text-[11px] text-slate-500">{client.category}</span>
                  </div>
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${getHealthScoreColor(
                      client.healthScore
                    )}`}
                  >
                    {client.healthScore}
                  </span>
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

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[10px] text-slate-400">Mgr: {client.assignedManagerName}</span>
                <Link href={`/app/clients/${client.id}`}>
                  <Button variant="outline" size="sm" icon={ArrowUpRight}>
                    Open 360 Hub
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

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
