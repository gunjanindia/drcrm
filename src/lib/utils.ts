import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString: string | undefined): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString: string | undefined): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
}

export function generateId(prefix: string = 'dr'): string {
  return `${prefix}_${Math.random().toString(36).substring(2, 9)}_${Date.now().toString(36)}`;
}

export function getHealthScoreColor(score: 'GREEN' | 'YELLOW' | 'RED'): string {
  switch (score) {
    case 'GREEN':
      return 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
    case 'YELLOW':
      return 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30';
    case 'RED':
      return 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30';
    default:
      return 'bg-slate-500/15 text-slate-600 border-slate-500/30';
  }
}

export function getStatusBadgeClass(status: string): string {
  switch (status) {
    case 'WON':
    case 'COMPLETED':
    case 'ACTIVE':
    case 'APPROVED':
    case 'CAPTURED':
    case 'PAID':
    case 'RESOLVED':
      return 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
    case 'IN_PROGRESS':
    case 'ASSIGNED':
    case 'QUALIFIED':
    case 'OPEN':
      return 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20';
    case 'WAITING':
    case 'CLIENT_APPROVAL':
    case 'PROPOSAL':
    case 'NEGOTIATION':
    case 'PENDING':
    case 'ONBOARDING':
      return 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20';
    case 'LOST':
    case 'CANCELLED':
    case 'CHANGES_REQUESTED':
    case 'FAILED':
    case 'OVERDUE':
    case 'AT_RISK':
    case 'CHURNED':
      return 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/20';
    case 'NEW':
    case 'BACKLOG':
    case 'DRAFT':
    case 'CONTACTED':
    case 'AUDIT':
    default:
      return 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/20';
  }
}
