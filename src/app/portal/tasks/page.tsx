'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle2, Clock } from 'lucide-react';
import { Task } from '@/types';
import { formatDate, getStatusBadgeClass } from '@/lib/utils';

export default function ClientTasksProgressPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [clientName, setClientName] = useState<string>('Your Business Account');

  useEffect(() => {
    fetch('/api/clients')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setClientName(data.data[0].businessName);
        }
      })
      .catch(() => {});

    fetch('/api/tasks')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setTasks(data.data);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
          Live Service Tasks & Deliverable Progress
        </h2>
        <p className="text-xs text-slate-500">
          Real-time visibility into all recurring optimizations and deliverables performed for {clientName}.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
        {tasks.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No live tasks currently scheduled.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {tasks.map((t) => (
              <div key={t.id} className="p-4 flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      t.status === 'COMPLETED'
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                        : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400'
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
        )}
      </div>
    </div>
  );
}
