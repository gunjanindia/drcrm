import React from 'react';
import Link from 'next/link';
import { Sparkles, MapPin, ArrowRight, ShieldCheck, PhoneCall, LayoutDashboard, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui';

export const Navbar: React.FC = () => {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/85 dark:bg-slate-950/85 border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <MapPin className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-800 dark:from-white dark:via-indigo-200 dark:to-slate-300 bg-clip-text text-transparent">
              DIGITAL RANCHI
            </span>
            <span className="text-[10px] uppercase font-semibold tracking-widest text-indigo-600 dark:text-indigo-400">
              Local Growth OS
            </span>
          </div>
        </Link>

        {/* Public Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300">
          <Link href="/services" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            Services
          </Link>
          <Link href="/pricing" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            Packages
          </Link>
          <Link href="/audit" className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-semibold hover:opacity-80 transition-opacity">
            <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
            Free Audit
          </Link>
          <Link href="/contact" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            Contact
          </Link>
        </nav>

        {/* Action CTAs & Portal Switchers */}
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
              Sign In
            </Button>
          </Link>
          <Link href="/portal">
            <Button variant="outline" size="sm" icon={UserCheck} className="hidden sm:inline-flex">
              Client Portal
            </Button>
          </Link>
          <Link href="/app">
            <Button variant="primary" size="sm" icon={LayoutDashboard}>
              Agency CRM
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};
