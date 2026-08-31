'use client';

import React, { useState } from 'react';
import { CheckCircle2, AlertTriangle, Send, Sparkles, MessageSquare, Clock } from 'lucide-react';
import { Button, Modal } from '@/components/ui';
import { globalStore } from '@/lib/store';
import { DeliverableItem } from '@/types';
import { formatDate } from '@/lib/utils';

export default function DeliverablesApprovalPage() {
  const [deliverables, setDeliverables] = useState<DeliverableItem[]>(globalStore.deliverables);
  const [selectedForFeedback, setSelectedForFeedback] = useState<DeliverableItem | null>(null);
  const [feedbackText, setFeedbackText] = useState('');

  const handleApprove = (id: string) => {
    const item = deliverables.find((d) => d.id === id);
    if (!item) return;
    item.status = 'APPROVED';
    item.reviewedAt = new Date().toISOString();
    setDeliverables([...deliverables]);
    alert(`Creative "${item.title}" approved! Our team will schedule it for publication.`);
  };

  const handleRequestChanges = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedForFeedback || !feedbackText.trim()) return;

    selectedForFeedback.status = 'CHANGES_REQUESTED';
    selectedForFeedback.clientFeedback = feedbackText;
    selectedForFeedback.reviewedAt = new Date().toISOString();

    setDeliverables([...deliverables]);
    setSelectedForFeedback(null);
    setFeedbackText('');
    alert('Change request sent to your account manager & designer!');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
          Creative & Post Approvals
        </h2>
        <p className="text-xs text-slate-500">
          Review social creatives, festival announcements, and GBP updates before they go live.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {deliverables.map((item) => (
          <div
            key={item.id}
            className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border border-sky-200 uppercase">
                  {item.platform.replace('_', ' ')}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${
                    item.status === 'APPROVED'
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                      : item.status === 'CHANGES_REQUESTED'
                      ? 'bg-rose-50 text-rose-600 border-rose-200'
                      : 'bg-amber-50 text-amber-600 border-amber-200'
                  }`}
                >
                  {item.status.replace('_', ' ')}
                </span>
              </div>

              <h3 className="font-bold text-sm text-slate-900 dark:text-white">{item.title}</h3>

              {/* Creative Media Preview Box */}
              <div className="w-full h-48 rounded-2xl bg-slate-100 dark:bg-slate-950 overflow-hidden relative border border-slate-200 dark:border-slate-800">
                <img
                  src={item.previewUrl}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {item.captionText && (
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 italic">
                  "{item.captionText}"
                </div>
              )}

              {item.clientFeedback && (
                <div className="p-3 rounded-2xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200/50 text-xs text-rose-700 dark:text-rose-300">
                  <strong>Your Feedback:</strong> {item.clientFeedback}
                </div>
              )}

              <span className="text-[10px] text-slate-400 block">
                Target Publication Date: {formatDate(item.scheduledFor)}
              </span>
            </div>

            {/* Approval Action Buttons */}
            {item.status === 'PENDING' && (
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2.5">
                <Button
                  variant="success"
                  size="sm"
                  className="w-1/2"
                  onClick={() => handleApprove(item.id)}
                  icon={CheckCircle2}
                >
                  Approve Asset
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-1/2 text-rose-600 border-rose-200 hover:bg-rose-50"
                  onClick={() => setSelectedForFeedback(item)}
                  icon={MessageSquare}
                >
                  Request Changes
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Change Request Modal */}
      {selectedForFeedback && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedForFeedback(null)}
          title="Request Changes to Creative"
          description={`Provide specific edits for "${selectedForFeedback.title}"`}
        >
          <form onSubmit={handleRequestChanges} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                What changes would you like our design team to make?
              </label>
              <textarea
                rows={4}
                required
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="e.g. Please change the discount to 25% and update our clinic WhatsApp number..."
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedForFeedback(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="danger" size="sm" icon={Send}>
                Submit Change Request
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
