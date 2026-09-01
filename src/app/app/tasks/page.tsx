'use client';

import React, { useState, useEffect } from 'react';
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
  UserCheck,
  Calendar,
  AlertCircle,
  Building2,
  Users
} from 'lucide-react';
import { Button, Modal, Input, Badge } from '@/components/ui';
import { globalStore } from '@/lib/store';
import { Task, TaskStatus, TaskPriority, Client, Lead } from '@/types';
import { formatDate, getStatusBadgeClass } from '@/lib/utils';

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(globalStore.tasks);
  const [clients, setClients] = useState<Client[]>(globalStore.clients);
  const [leads, setLeads] = useState<Lead[]>(globalStore.leads);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');
  const [selectedAssigneeId, setSelectedAssigneeId] = useState<string>('ALL');

  // Create Task Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [selectedClientOption, setSelectedClientOption] = useState<string>('');
  const [customClientName, setCustomClientName] = useState('');
  const [newAssigneeId, setNewAssigneeId] = useState(globalStore.users[7]?.id || 'usr_del_exec1');
  const [newPriority, setNewPriority] = useState<TaskPriority>('HIGH');
  const [newDueDate, setNewDueDate] = useState('2026-09-07');
  const [newDescription, setNewDescription] = useState('');

  // Internal team members available for task assignment
  const teamMembers = globalStore.users.filter((u) => u.role !== 'CLIENT');

  const fetchAllTasks = async () => {
    try {
      const res = await fetch('/api/tasks');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setTasks(data.data);
      }
    } catch (err) {
      console.error('Failed to load tasks:', err);
    }
  };

  // Fetch live tasks, clients and leads on mount
  useEffect(() => {
    fetchAllTasks();

    fetch('/api/clients')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setClients(data.data);
          if (data.data.length > 0 && !selectedClientOption) {
            setSelectedClientOption(data.data[0].id);
          }
        }
      })
      .catch((err) => console.error('Failed to load clients:', err));

    fetch('/api/leads')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setLeads(data.data);
        }
      })
      .catch((err) => console.error('Failed to load leads:', err));
  }, []);

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.clientName.toLowerCase().includes(search.toLowerCase()) ||
      t.assignedToName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = selectedStatus === 'ALL' || t.status === selectedStatus;
    const matchesPriority = selectedPriority === 'ALL' || t.priority === selectedPriority;
    const matchesAssignee = selectedAssigneeId === 'ALL' || t.assignedToId === selectedAssigneeId;
    return matchesSearch && matchesStatus && matchesPriority && matchesAssignee;
  });

  const updateTaskStatus = async (taskId: string, newStatus: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );

    try {
      await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: taskId, status: newStatus }),
      });
    } catch (err) {
      console.error('Failed to update task status:', err);
    }
  };

  const reassignTask = async (taskId: string, newUserId: string) => {
    const user = globalStore.users.find((u) => u.id === newUserId) || teamMembers.find((u) => u.id === newUserId);
    if (!user) return;

    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, assignedToId: user.id, assignedToName: user.name }
          : t
      )
    );

    try {
      await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: taskId,
          assignedToId: user.id,
          assignedToName: user.name,
        }),
      });
    } catch (err) {
      console.error('Failed to reassign task:', err);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    let targetClientId = 'cli_custom';
    let targetClientName = 'General Operations';

    if (selectedClientOption === 'CUSTOM') {
      targetClientName = customClientName.trim() || 'Custom Client Account';
    } else if (selectedClientOption.startsWith('lead_')) {
      const lead = leads.find((l) => l.id === selectedClientOption);
      targetClientId = lead?.id || 'lead_1';
      targetClientName = lead?.businessName || 'Lead Account';
    } else {
      const client = clients.find((c) => c.id === selectedClientOption);
      if (client) {
        targetClientId = client.id;
        targetClientName = client.businessName;
      } else if (customClientName.trim()) {
        targetClientName = customClientName.trim();
      }
    }

    const assignee = globalStore.users.find((u) => u.id === newAssigneeId) || teamMembers[0];

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: targetClientId,
          clientName: targetClientName,
          title: newTitle.trim(),
          description: newDescription.trim() || 'Deliverable task assigned via Tasks Board.',
          assignedToId: assignee.id,
          assignedToName: assignee.name,
          priority: newPriority,
          status: 'ASSIGNED',
          slaDeadline: new Date(newDueDate).toISOString(),
          dueDate: new Date(newDueDate).toISOString(),
          isRecurring: false,
        }),
      });

      if (res.ok) {
        await fetchAllTasks();
        setIsCreateModalOpen(false);
        setNewTitle('');
        setCustomClientName('');
        setNewDescription('');
      }
    } catch (err) {
      console.error('Failed to create task:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Work Management & Team Task Allocation
          </h2>
          <p className="text-xs text-slate-500">
            {tasks.length} Operational deliverables assigned across delivery executives, designers, and account managers.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={Plus}
          onClick={() => {
            if (clients.length > 0 && !selectedClientOption) {
              setSelectedClientOption(clients[0].id);
            } else if (clients.length === 0 && leads.length > 0) {
              setSelectedClientOption(leads[0].id);
            } else if (clients.length === 0 && leads.length === 0) {
              setSelectedClientOption('CUSTOM');
            }
            setIsCreateModalOpen(true);
          }}
        >
          Assign New Task
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full md:w-auto flex-1">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search tasks, clients, assignee..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Filter by Team Member */}
          <div className="w-full sm:w-48">
            <select
              value={selectedAssigneeId}
              onChange={(e) => setSelectedAssigneeId(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">All Team Members</option>
              {teamMembers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.department})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
          {['ALL', 'BACKLOG', 'ASSIGNED', 'IN_PROGRESS', 'CLIENT_APPROVAL', 'COMPLETED'].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedStatus === st
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
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
                <th className="py-3.5 px-4">Client / Business</th>
                <th className="py-3.5 px-4">Priority</th>
                <th className="py-3.5 px-4">Assigned Team Member</th>
                <th className="py-3.5 px-4">Due Date</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <CheckSquare className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-700" />
                    <p className="font-semibold text-sm">No tasks currently assigned</p>
                    <p className="text-xs text-slate-400 mt-0.5">Click &quot;Assign New Task&quot; above to allocate work to team members.</p>
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task) => (
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

                    {/* Interactive Inline Team Member Assignee Selector */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <select
                          value={task.assignedToId}
                          onChange={(e) => reassignTask(task.id, e.target.value)}
                          className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                          title="Click to reassign team member"
                        >
                          {teamMembers.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.name} ({m.department})
                            </option>
                          ))}
                        </select>
                      </div>
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create & Assign Task Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Assign New Task to Team Member"
        description="Allocate work deliverable, choose actual client account, select assignee, and set deadline."
      >
        <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
          <Input
            label="Task Deliverable Title *"
            placeholder="e.g. Geotag & upload 10 showroom photos to Google Maps"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Client / Business Account *
              </label>
              <select
                value={selectedClientOption}
                onChange={(e) => setSelectedClientOption(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white font-medium"
              >
                {clients.length > 0 && (
                  <optgroup label="Active Clients">
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.businessName} ({c.city})
                      </option>
                    ))}
                  </optgroup>
                )}

                {leads.length > 0 && (
                  <optgroup label="Pipeline Leads (Audit Inquiries)">
                    {leads.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.businessName} ({l.city})
                      </option>
                    ))}
                  </optgroup>
                )}

                <optgroup label="Other / Direct Entry">
                  <option value="CUSTOM">+ Enter Custom Business Name</option>
                </optgroup>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Assign To Team Member *
              </label>
              <select
                value={newAssigneeId}
                onChange={(e) => setNewAssigneeId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white font-semibold"
              >
                {teamMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} — {m.role.replace('_', ' ')} ({m.department})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Conditional Custom Client Name Field */}
          {selectedClientOption === 'CUSTOM' && (
            <Input
              label="Enter Business / Client Name *"
              placeholder="e.g. Glow Heaven Ladies Beauty Parlour"
              value={customClientName}
              onChange={(e) => setCustomClientName(e.target.value)}
              required
            />
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Priority
              </label>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as TaskPriority)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white"
              >
                <option value="URGENT">URGENT (Immediate Action)</option>
                <option value="HIGH">HIGH (Within 24 Hours)</option>
                <option value="MEDIUM">MEDIUM (Standard SLA)</option>
                <option value="LOW">LOW</option>
              </select>
            </div>

            <Input
              type="date"
              label="Due Date *"
              value={newDueDate}
              onChange={(e) => setNewDueDate(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Instructions / Description
            </label>
            <textarea
              rows={3}
              placeholder="Add specific instructions, review targets, or design guidelines..."
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" size="sm" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Assign Task
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
