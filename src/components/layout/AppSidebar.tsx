import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  GitPullRequest,
  Building2,
  CheckSquare,
  Repeat,
  MapPin,
  FileText,
  CreditCard,
  Settings,
  Sparkles,
  LifeBuoy,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const AppSidebar: React.FC = () => {
  const pathname = usePathname();

  const navigation = [
    { name: 'Dashboard', href: '/app', icon: LayoutDashboard, exact: true },
    { name: 'Leads & Inquiries', href: '/app/leads', icon: Users },
    { name: 'Sales Pipeline', href: '/app/pipeline', icon: GitPullRequest },
    { name: 'Client 360', href: '/app/clients', icon: Building2 },
    { name: 'Task Board', href: '/app/tasks', icon: CheckSquare },
    { name: 'Recurring Engine', href: '/app/recurring', icon: Repeat },
    { name: 'GBP Health & SEO', href: '/app/gbp', icon: MapPin },
    { name: 'Billing & Invoices', href: '/app/billing', icon: FileText },
    { name: 'AI Operations Agent', href: '/app/ai', icon: Sparkles, badge: 'Gemini' },
    { name: 'System & Tax Settings', href: '/app/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen sticky top-0 shrink-0 text-slate-300">
      {/* Agency Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-600/30">
            DR
          </div>
          <div>
            <span className="font-extrabold text-sm tracking-tight text-white block">
              DIGITAL RANCHI
            </span>
            <span className="text-[10px] text-indigo-400 font-semibold tracking-wider uppercase block">
              Agency Operations OS
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Core Workflows
        </div>
        {navigation.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group',
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon
                  className={cn(
                    'w-4 h-4 transition-colors',
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                  )}
                />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Role & Staff Profile Snapshot + Logout */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-sky-400 flex items-center justify-center text-xs font-bold text-white shrink-0">
            GK
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">Gunjan Kumar</p>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span className="text-[10px] text-slate-400 font-medium truncate">Super Admin • Neon DB</span>
            </div>
          </div>
        </div>

        <button
          onClick={async () => {
            await fetch('/api/auth/logout', { method: 'POST' });
            window.location.href = '/login';
          }}
          className="w-full py-1.5 px-3 rounded-lg bg-slate-800/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 text-[11px] font-semibold transition-colors flex items-center justify-center gap-1.5 border border-slate-700/60"
        >
          <span>Sign Out of CRM</span>
        </button>
      </div>
    </aside>
  );
};
