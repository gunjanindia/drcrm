'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Activity,
  TrendingUp,
  MessageSquare,
  Sparkles,
  QrCode,
  Globe,
  CheckCircle2,
  ListTodo,
  FileBarChart2,
  Receipt,
  HelpCircle,
  Zap,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  getSyncedBusinessProfile,
  SyncedBusinessProfile,
  DEMO_BUSINESS_PROFILE,
} from '@/lib/client-portal-sync';

export const PortalSidebar: React.FC = () => {
  const pathname = usePathname();
  const [profile, setProfile] = React.useState<SyncedBusinessProfile>(DEMO_BUSINESS_PROFILE);

  React.useEffect(() => {
    setProfile(getSyncedBusinessProfile());
    const handleUpdate = (e: any) => {
      if (e.detail) setProfile(e.detail);
    };
    window.addEventListener('drcrm_gbp_profile_updated', handleUpdate);
    return () => window.removeEventListener('drcrm_gbp_profile_updated', handleUpdate);
  }, []);

  const pendingCount = (profile.reviews || []).filter((r) => r.status === 'PENDING').length;

  const navigation = [
    { name: 'Dashboard Overview', href: '/portal', icon: LayoutDashboard, exact: true, badge: profile.averageRating ? `${profile.averageRating}★` : undefined },
    {
      name: 'Google Reviews & Reply',
      href: '/portal/reviews',
      icon: MessageSquare,
      badge: pendingCount > 0 ? `${pendingCount} Urgent` : undefined,
      isUrgent: pendingCount > 0,
    },
    { name: 'Local SEO & Growth', href: '/portal/growth', icon: TrendingUp, badge: `${profile.gbpScore || 85}/100 Score` },
    { name: 'Festival Posters Studio', href: '/portal/creative-studio', icon: Sparkles, badge: 'AI' },
    { name: 'Review QR Stand & Site', href: '/portal/qr-stand', icon: QrCode },
    { name: 'My Plan & Invoices', href: '/portal/invoices', icon: Receipt },
  ];

  const initials = profile.businessName
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'DR';

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen sticky top-0 shrink-0 text-slate-300">
      {/* Client Profile Header */}
      <div className="p-5 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-sky-600/30 text-xs">
            {initials}
          </div>
          <div className="min-w-0">
            <span className="font-bold text-xs text-white truncate block">
              {profile.businessName}
            </span>
            <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider block truncate">
              {profile.isLiveSynced ? 'Verified Live Profile' : 'Demo Mode'}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Client 360 Workspace
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
                'flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group',
                isActive
                  ? 'bg-sky-600 text-white shadow-sm shadow-sky-500/20 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              )}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <item.icon
                  className={cn(
                    'w-4 h-4 shrink-0 transition-colors',
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                  )}
                />
                <span className="truncate">{item.name}</span>
              </div>
              {item.badge && (
                <span
                  className={cn(
                    'text-[9px] font-bold px-1.5 py-0.5 rounded border shrink-0',
                    item.isUrgent
                      ? 'bg-amber-500/25 text-amber-300 border-amber-500/40 animate-pulse'
                      : item.badge === 'AI' || item.badge === 'New'
                      ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  )}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Dedicated Manager Card + Logout */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40 space-y-3">
        <div className="text-[10px] uppercase font-bold text-slate-500">
          Dedicated Account Manager
        </div>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
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

        <button
          onClick={async () => {
            await fetch('/api/auth/logout', { method: 'POST' });
            window.location.href = '/login';
          }}
          className="w-full py-1.5 px-3 rounded-lg bg-slate-800/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 text-[11px] font-semibold transition-colors flex items-center justify-center gap-1.5 border border-slate-700/60"
        >
          <span>Sign Out of Portal</span>
        </button>
      </div>
    </aside>
  );
};
