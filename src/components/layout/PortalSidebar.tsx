import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CheckCircle2,
  ListTodo,
  FileBarChart2,
  Receipt,
  HelpCircle,
  Building,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const PortalSidebar: React.FC = () => {
  const pathname = usePathname();

  const navigation = [
    { name: 'Dashboard', href: '/portal', icon: LayoutDashboard, exact: true },
    { name: 'Approvals & Creatives', href: '/portal/deliverables', icon: CheckCircle2, badge: '1 Action' },
    { name: 'Live Service Tasks', href: '/portal/tasks', icon: ListTodo },
    { name: 'Monthly Reports', href: '/portal/reports', icon: FileBarChart2 },
    { name: 'Invoices & Renewals', href: '/portal/invoices', icon: Receipt },
    { name: 'Support Tickets', href: '/portal/tickets', icon: HelpCircle },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen sticky top-0 shrink-0 text-slate-300">
      {/* Client Profile Header */}
      <div className="p-5 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-sky-600/30">
            RD
          </div>
          <div className="min-w-0">
            <span className="font-bold text-xs text-white truncate block">
              Ranchi Dental Care
            </span>
            <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider block">
              Premium Growth Tier
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Client Workspace
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
                  ? 'bg-sky-600 text-white shadow-sm shadow-sky-500/20 font-semibold'
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

      {/* Dedicated Manager Card */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        <div className="text-[10px] uppercase font-bold text-slate-500 mb-2">
          Your Account Manager
        </div>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white">
            NP
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-white truncate">Neha Pandey</p>
            <a
              href="https://wa.me/919431109876"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-emerald-400 font-medium hover:underline flex items-center gap-1"
            >
              WhatsApp Support <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
        </div>
      </div>
    </aside>
  );
};
