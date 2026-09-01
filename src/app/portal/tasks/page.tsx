'use client';

import React from 'react';
import { ListTodo, CheckCircle2, Clock, ShieldCheck } from 'lucide-react';
import { globalStore } from '@/lib/store';
import { formatDate, getStatusBadgeClass } from '@/lib/utils';

export default function ClientTasksProgressPage() {
  const client = globalStore.clients[0] || {
    id: 'cli_demo',
    businessName: 'Your Business',
  };
  const clientTasks = globalStore.tasks.filter((t) => t.clientId === client.id);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
          Live Service Tasks & Deliverable Progress
        </h2>
        <p className="text-xs text-slate-500">
          Real-time visibility into all recurring optimizations and deliverables performed for {client.businessName}.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {clientTasks.map((t) => (
            <div key={t.id} className="p-4 flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    t.status === 'COMPLETED'
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'bg-indigo-50 text-indigo-600'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">{t.title}</h4>
                  <p className="text-[11px] text-slate-500">{t.description}</p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getStatusBadgeClass(t.status)}`}>
                  {t.status.replace('_', ' ')}
                </span>
                <span className="text-[10px] text-slate-400 block mt-1">Due {formatDate(t.dueDate)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
