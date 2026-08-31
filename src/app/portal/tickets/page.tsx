'use client';

import React, { useState } from 'react';
import { HelpCircle, Plus, Send, CheckCircle2, Clock } from 'lucide-react';
import { Button, Input, Modal } from '@/components/ui';
import { globalStore } from '@/lib/store';
import { Ticket, TicketCategory } from '@/types';
import { formatDate, getStatusBadgeClass } from '@/lib/utils';

export default function ClientTicketsPage() {
  const client = globalStore.clients[0];
  const [tickets, setTickets] = useState<Ticket[]>(
    globalStore.tickets.filter((t) => t.clientId === client.id)
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<TicketCategory>('GOOGLE_MAPS');
  const [description, setDescription] = useState('');

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !description) return;

    const newTicket: Ticket = {
      id: `tkt_${Date.now()}`,
      tenantId: 'tenant_main',
      clientId: client.id,
      clientName: client.businessName,
      ticketNumber: `TKT-2026-${Math.floor(100 + Math.random() * 900)}`,
      category,
      subject,
      description,
      priority: 'HIGH',
      status: 'OPEN',
      assignedToName: client.assignedManagerName,
      slaDeadline: new Date(Date.now() + 24 * 3600000).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    globalStore.tickets.unshift(newTicket);
    setTickets([newTicket, ...tickets]);
    setIsModalOpen(false);
    setSubject('');
    setDescription('');
    alert('Ticket submitted! Your Account Manager Neha has been alerted on WhatsApp.');
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Support & Service Requests
          </h2>
          <p className="text-xs text-slate-500">
            Submit requests for Google Maps edits, website changes, social media creatives, or billing questions.
          </p>
        </div>

        <Button variant="primary" size="sm" icon={Plus} onClick={() => setIsModalOpen(true)}>
          Raise New Request
        </Button>
      </div>

      {/* Tickets List */}
      <div className="space-y-3">
        {tickets.map((tkt) => (
          <div
            key={tkt.id}
            className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2 text-xs"
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-sky-600">{tkt.ticketNumber}</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm">{tkt.subject}</span>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getStatusBadgeClass(tkt.status)}`}>
                {tkt.status}
              </span>
            </div>

            <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
              {tkt.description}
            </p>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[10px] text-slate-400">
              <span>Category: {tkt.category.replace('_', ' ')}</span>
              <span>Assigned: {tkt.assignedToName} • Submitted {formatDate(tkt.createdAt)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* New Ticket Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Submit New Support Request"
        description="Our team acknowledges requests within 2 hours under standard SLA."
      >
        <form onSubmit={handleCreateTicket} className="space-y-4 text-xs">
          <Input
            label="Request Title / Subject *"
            placeholder="e.g. Update emergency contact phone on Google Maps"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
          />

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider text-[11px]">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as TicketCategory)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 text-xs text-slate-900 dark:text-white"
            >
              <option value="GOOGLE_MAPS">Google Maps / GBP</option>
              <option value="WEBSITE">Mini Website Update</option>
              <option value="REVIEWS">Review QR Stand</option>
              <option value="CREATIVE">Creative Graphic / Social Post</option>
              <option value="BILLING">Billing & Renewal</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider text-[11px]">
              Detailed Description *
            </label>
            <textarea
              rows={4}
              required
              placeholder="Describe the exact changes or assistance needed..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" icon={Send}>
              Submit Request
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
