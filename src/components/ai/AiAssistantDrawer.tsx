'use client';

import React, { useState } from 'react';
import { Sparkles, Send, Bot, User, ArrowRight, CheckCircle, RefreshCw, X } from 'lucide-react';
import { aiAssistantEngine, AIResponse } from '@/lib/ai-engine';
import { Button } from '@/components/ui';

export interface AiAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AiAssistantDrawer: React.FC<AiAssistantDrawerProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<
    Array<{ sender: 'user' | 'ai'; text: string; suggestedActions?: any[] }>
  >([
    {
      sender: 'ai',
      text: "Namaste! I am your Digital Ranchi AI Operations Assistant powered by Google Gemini. How can I assist you with leads, renewals, task SLA, or monthly report generation today?",
      suggestedActions: [
        { label: 'Show clients requiring renewal', action: 'Show clients expiring in 30 days' },
        { label: "Summarize today's urgent tasks", action: "Summarize today's task SLA" },
        { label: 'Which leads need follow-up?', action: 'Which leads have not been followed up?' },
      ],
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (queryText: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim()) return;

    setMessages((prev) => [...prev, { sender: 'user', text: textToSend }]);
    setInput('');
    setIsLoading(true);

    try {
      const response: AIResponse = await aiAssistantEngine.queryOperationsAssistant(textToSend);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: response.answer,
          suggestedActions: response.suggestedActions,
        },
      ]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: 'I encountered an error executing the query. Please try again.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-right">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-500 border border-amber-500/30 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Gemini AI Operations Assistant
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-500 font-semibold uppercase">
                Active
              </span>
            </h3>
            <p className="text-[10px] text-slate-500">Grounded strictly in verified CRM data</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.sender === 'ai' && (
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white shrink-0 mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
            )}
            <div
              className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-indigo-600 text-white rounded-tr-none'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-none border border-slate-200 dark:border-slate-700/60'
              }`}
            >
              <div className="whitespace-pre-line">{m.text}</div>

              {m.suggestedActions && m.suggestedActions.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-700/80 space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block tracking-wider">
                    Recommended Actions:
                  </span>
                  {m.suggestedActions.map((act, aIdx) => (
                    <button
                      key={aIdx}
                      onClick={() => handleSend(act.action)}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 text-[11px] font-medium text-slate-700 dark:text-slate-300 flex items-center justify-between group transition-all"
                    >
                      <span>{act.label}</span>
                      <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all" />
                    </button>
                  ))}
                </div>
              )}
            </div>
            {m.sender === 'user' && (
              <div className="w-7 h-7 rounded-lg bg-slate-700 flex items-center justify-center text-white shrink-0 mt-0.5 text-xs font-bold">
                U
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 items-center text-xs text-slate-500 italic">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white shrink-0">
              <Sparkles className="w-4 h-4 animate-spin" />
            </div>
            <span>Analyzing CRM records and generating insight...</span>
          </div>
        )}
      </div>

      {/* Input Box */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(input);
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything (e.g. at-risk clients, tasks, leads)..."
            className="flex-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
          <Button
            type="submit"
            variant="amber"
            size="sm"
            disabled={!input.trim() || isLoading}
            icon={Send}
          >
            Ask
          </Button>
        </form>
      </div>
    </div>
  );
};
