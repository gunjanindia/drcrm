'use client';

import React, { useState } from 'react';
import { Receipt, DollarSign, CreditCard, ShieldCheck, Download, Plus, RefreshCw } from 'lucide-react';
import { Button, Badge } from '@/components/ui';
import { globalStore } from '@/lib/store';
import { globalTaxEngine } from '@/lib/tax-engine';
import { formatINR, formatDate, getStatusBadgeClass } from '@/lib/utils';

export default function BillingPage() {
  const [invoices, setInvoices] = useState(globalStore.invoices);
  const [payments, setPayments] = useState(globalStore.payments);
  const [taxConfig, setTaxConfig] = useState(globalStore.taxConfig);

  const totalBilled = invoices.reduce((acc, inv) => acc + inv.totalAmount, 0);
  const totalCollected = payments.reduce((acc, p) => acc + p.amount, 0);
  const outstandingAmount = totalBilled - totalCollected;

  const handleToggleGstMode = () => {
    const nextGst = !taxConfig.isGstRegistered;
    const updated = globalTaxEngine.updateConfig({
      isGstRegistered: nextGst,
      defaultTaxMode: nextGst ? 'GST' : 'NON_GST',
      gstin: nextGst ? '20ABCDE1234F1Z5' : null,
    });
    globalStore.taxConfig = updated;
    setTaxConfig({ ...updated });
    alert(
      nextGst
        ? 'GST Mode Activated! Future invoices will compute CGST (9%) + SGST (9%) with GSTIN 20ABCDE1234F1Z5.'
        : 'Switched back to Non-GST Mode (Bill of Supply). 0% Tax applicable.'
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Billing, Invoicing & Tax Architecture
          </h2>
          <p className="text-xs text-slate-500">
            Internal billing engine decoupled from Razorpay with configurable Non-GST / GST support.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant={taxConfig.isGstRegistered ? 'success' : 'outline'}
            size="sm"
            onClick={handleToggleGstMode}
            icon={RefreshCw}
          >
            Mode: {taxConfig.isGstRegistered ? 'GST Active (Switch to Non-GST)' : 'Non-GST (Test GST Activation)'}
          </Button>
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Total Billed
          </span>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {formatINR(totalBilled)}
          </div>
          <span className="text-[11px] text-slate-500">{invoices.length} Invoices Issued</span>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500">
            Total Collected
          </span>
          <div className="text-2xl font-black text-emerald-600 mt-1">
            {formatINR(totalCollected)}
          </div>
          <span className="text-[11px] text-slate-500">{payments.length} Payments Captured</span>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500">
            Outstanding Due
          </span>
          <div className="text-2xl font-black text-amber-600 mt-1">
            {formatINR(outstandingAmount)}
          </div>
          <span className="text-[11px] text-slate-500">Upcoming Renewals</span>
        </div>
      </div>

      {/* Invoices List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden space-y-4 p-6">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            Recent Invoices & Bills of Supply
          </h3>
          <span className="text-xs text-slate-500 font-mono">
            Active Mode: {taxConfig.defaultTaxMode}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Subtotal</th>
                <th className="py-3 px-4">Tax</th>
                <th className="py-3 px-4">Grand Total</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Download</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {invoices.slice(0, 10).map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-mono font-bold text-indigo-600">{inv.invoiceNumber}</td>
                  <td className="py-3 px-4 font-semibold">{inv.clientName}</td>
                  <td className="py-3 px-4 text-slate-500">{inv.invoiceType}</td>
                  <td className="py-3 px-4">{formatINR(inv.subtotal)}</td>
                  <td className="py-3 px-4">{formatINR(inv.totalTax)}</td>
                  <td className="py-3 px-4 font-bold">{formatINR(inv.totalAmount)}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getStatusBadgeClass(inv.status)}`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => alert(`Downloading PDF Invoice ${inv.invoiceNumber}...`)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors"
                      title="Download PDF"
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
    </div>
  );
}
