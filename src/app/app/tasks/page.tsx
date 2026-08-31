'use client';

import React, { useState } from 'react';
import {
  CheckSquare,
  Search,
  Filter,
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  User,
  Building,
} from 'lucide-react';
import { Button, Modal, Input, Badge } from '@/components/ui';
import { globalStore } from '@/lib/store';
import { Task, TaskStatus } from '@/types';
import { formatDate, getStatusBadgeClass } from '@/lib/utils';

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(globalStore.tasks);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.clientName.toLowerCase().includes(search.toLowerCase()) ||
      t.assignedToName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = selectedStatus === 'ALL' || t.status === selectedStatus;
    const matchesPriority = selectedPriority === 'ALL' || t.priority === selectedPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const updateTaskStatus = (taskId: string, newStatus: TaskStatus) => {
    const task = globalStore.tasks.find((t) => t.id === taskId);
    if (!task) return;
    task.status = newStatus;
    setTasks([...globalStore.tasks]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Work Management & Task Board
          </h2>
          <p className="text-xs text-slate-500">
            {tasks.length} Operational deliverables tracked with strict SLA timers and client approval gates.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tasks, clients, assignee..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
          {['ALL', 'BACKLOG', 'ASSIGNED', 'IN_PROGRESS', 'CLIENT_APPROVAL', 'COMPLETED'].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedStatus === st
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Tasks Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950/70 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Task Deliverable</th>
                <th className="py-3.5 px-4">Client</th>
                <th className="py-3.5 px-4">Priority</th>
                <th className="py-3.5 px-4">Assignee</th>
                <th className="py-3.5 px-4">Due Date</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredTasks.map((task) => (
                <tr key={task.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900 dark:text-white">{task.title}</div>
                    <span className="text-[10px] text-slate-400">ID: {task.id}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {task.clientName}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase ${
                        task.priority === 'URGENT' || task.priority === 'HIGH'
                          ? 'bg-rose-50 text-rose-600 border-rose-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {task.priority}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                    {task.assignedToName}
                  </td>
                  <td className="py-3 px-4 text-slate-500">
                    <div className="flex items-center gap-1 text-[11px]">
                      <Clock className="w-3 h-3 text-amber-500" />
                      <span>{formatDate(task.dueDate)}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase ${getStatusBadgeClass(
                        task.status
                      )}`}
                    >
                      {task.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {task.status !== 'COMPLETED' ? (
                      <button
                        onClick={() => updateTaskStatus(task.id, 'COMPLETED')}
                        className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200 font-semibold text-[10px] transition-colors"
                      >
                        Mark Done
                      </button>
                    ) : (
                      <span className="text-[10px] text-emerald-600 font-bold">✓ Completed</span>
                    )}
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
