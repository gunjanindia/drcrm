import React from 'react';
import { Search, Bell, Sparkles, Shield, Receipt, HelpCircle, Building } from 'lucide-react';
import { Button, Badge } from '@/components/ui';
import { globalStore } from '@/lib/store';

export interface TopbarProps {
  onOpenAi?: () => void;
  title?: string;
  subtitle?: string;
}

export const Topbar: React.FC<TopbarProps> = ({
  onOpenAi,
  title = 'Agency Operations Command Center',
  subtitle = 'Digital Ranchi Local Growth OS',
}) => {
  const isGst = globalStore.taxConfig.isGstRegistered;

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 px-6 flex items-center justify-between sticky top-0 z-30">
      <div>
        <h1 className="text-base font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
          {title}
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
      </div>

      <div className="flex items-center gap-3">
        {/* Global Search Bar */}
        <div className="relative hidden md:block w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search leads, clients, tasks..."
            className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white placeholder-slate-400"
          />
        </div>

        {/* Tax Mode Status Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-medium border border-slate-200 dark:border-slate-700">
          <Receipt className="w-3.5 h-3.5 text-indigo-500" />
          <span className="text-slate-600 dark:text-slate-300">
            Tax Mode: <strong className={isGst ? 'text-emerald-500' : 'text-amber-500'}>{isGst ? 'GST Active' : 'Non-GST'}</strong>
          </span>
        </div>

        {/* AI Assistant Quick Launcher */}
        <Button
          variant="amber"
          size="sm"
          icon={Sparkles}
          onClick={onOpenAi}
          className="shadow-amber-500/20"
        >
          Ask AI
        </Button>

        {/* Notifications */}
        <button className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative">
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-1.5 right-1.5 ring-2 ring-white dark:ring-slate-900" />
        </button>
      </div>
    </header>
  );
};
