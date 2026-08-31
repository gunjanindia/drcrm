'use client';

import React, { useState } from 'react';
import { Receipt, Download, CreditCard, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui';
import { globalStore } from '@/lib/store';
import { formatINR, formatDate, getStatusBadgeClass } from '@/lib/utils';
import { CheckoutModal } from '@/components/billing/CheckoutModal';

export default function ClientInvoicesPage() {
  const client = globalStore.clients[0];
  const invoices = globalStore.invoices.filter((inv) => inv.clientId === client.id);
  const pkg = globalStore.packages.find((p) => p.id === client.packageId) || globalStore.packages[2];

  const [isRenewalModalOpen, setIsRenewalModalOpen] = useState(false);

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Billing, Invoices & Monthly Retainer Renewals
          </h2>
          <p className="text-xs text-slate-500">
            View Bills of Supply and pay your monthly service renewals online securely via Razorpay.
          </p>
        </div>

        <Button
          variant="amber"
          size="sm"
          icon={CreditCard}
          onClick={() => setIsRenewalModalOpen(true)}
        >
          Pay Next Month Renewal ({formatINR(client.monthlyRevenue)})
        </Button>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden p-6 space-y-4">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white">
          Invoice History
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3">Invoice Number</th>
                <th className="p-3">Billing Mode</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Status</th>
                <th className="p-3">Date</th>
                <th className="p-3 text-right">Download</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {invoices.map((inv) => (
                <tr key={inv.id}>
                  <td className="p-3 font-mono font-bold text-sky-600">{inv.invoiceNumber}</td>
                  <td className="p-3">{inv.invoiceType}</td>
                  <td className="p-3 font-bold">{formatINR(inv.totalAmount)}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getStatusBadgeClass(inv.status)}`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="p-3 text-slate-500">{formatDate(inv.createdAt)}</td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => alert(`Downloading PDF ${inv.invoiceNumber}...`)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 transition-colors"
                      title="Download PDF Bill"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <CheckoutModal
        isOpen={isRenewalModalOpen}
        onClose={() => setIsRenewalModalOpen(false)}
        pkg={pkg}
      />
    </div>
  );
}
