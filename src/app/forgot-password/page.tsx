'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Lock,
  Mail,
  KeyRound,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { Button, Input } from '@/components/ui';

export default function ForgotPasswordPage() {
  const router = useRouter();

  // Multi-step state: 1 = Request Code, 2 = Set New Password, 3 = Success
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [generatedCodeHint, setGeneratedCodeHint] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Step 1: Request 6-digit verification code
  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'request_code',
          email: email.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'Failed to generate reset code. Please check the email.');
        setIsLoading(false);
        return;
      }

      setGeneratedCodeHint(data.code || null);
      setSuccessMessage(`Verification code dispatched for ${email.trim()}.`);
      setStep(2);
    } catch {
      setErrorMessage('Network error while requesting reset code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Validate code and set new password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !newPassword || !confirmPassword) return;

    if (newPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reset_password',
          email: email.trim(),
          code: code.trim(),
          newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'Invalid code or failed to reset password.');
        setIsLoading(false);
        return;
      }

      setStep(3);
    } catch {
      setErrorMessage('Network error while resetting password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950 p-4">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-600/30">
              DR
            </div>
            <span className="font-black text-xl tracking-tight text-slate-900 dark:text-white">
              DIGITAL RANCHI
            </span>
          </Link>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {step === 3 ? 'Password Reset Complete' : 'Reset Account Password'}
          </h2>
          <p className="text-xs text-slate-500">
            {step === 1 && 'Enter your registered email to receive a 6-digit verification code.'}
            {step === 2 && 'Enter the 6-digit verification code and your new password.'}
            {step === 3 && 'Your credentials have been securely updated in the database.'}
          </p>
        </div>

        {/* Status Messages */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Step 1 Form: Email Request */}
        {step === 1 && (
          <form onSubmit={handleRequestCode} className="space-y-4 text-xs">
            <Input
              label="Registered Email Address *"
              type="email"
              placeholder="e.g. gunjan@digitalranchi.in or client email"
              icon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full shadow-indigo-600/30"
              isLoading={isLoading}
              icon={KeyRound}
            >
              Send Verification Code
            </Button>
          </form>
        )}

        {/* Step 2 Form: Code & New Password */}
        {step === 2 && (
          <form onSubmit={handleResetPassword} className="space-y-4 text-xs">
            {generatedCodeHint && (
              <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 space-y-1">
                <div className="flex items-center justify-between text-indigo-800 dark:text-indigo-300 font-bold text-xs">
                  <span>Your 6-Digit Verification Code:</span>
                  <span className="font-mono text-sm tracking-widest px-2 py-0.5 rounded bg-indigo-600 text-white shadow-sm">
                    {generatedCodeHint}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  Valid for 15 minutes. Enter this code below.
                </p>
              </div>
            )}

            <Input
              label="6-Digit Verification Code *"
              type="text"
              placeholder="e.g. 123456"
              icon={KeyRound}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              maxLength={6}
            />

            <Input
              label="New Password *"
              type="password"
              placeholder="Minimum 6 characters"
              icon={Lock}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />

            <Input
              label="Confirm New Password *"
              type="password"
              placeholder="Re-enter new password"
              icon={Lock}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full shadow-indigo-600/30"
              isLoading={isLoading}
              icon={CheckCircle2}
            >
              Confirm & Reset Password
            </Button>

            <button
              type="button"
              onClick={() => {
                setStep(1);
                setErrorMessage(null);
              }}
              className="w-full text-center text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-[11px] font-semibold transition-colors"
            >
              ← Change Email or Request New Code
            </button>
          </form>
        )}

        {/* Step 3: Success Screen */}
        {step === 3 && (
          <div className="space-y-5 text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-md shadow-emerald-500/20">
              <ShieldCheck className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Success! Your password is updated.
              </h3>
              <p className="text-xs text-slate-500">
                You can now log in to the Agency CRM or Client Portal with your new password.
              </p>
            </div>

            <Link href="/login" className="block">
              <Button variant="primary" size="lg" className="w-full shadow-indigo-600/30" icon={ArrowRight}>
                Go to Login Page
              </Button>
            </Link>
          </div>
        )}

        {/* Bottom Navigation */}
        <div className="text-center pt-2 border-t border-slate-100 dark:border-slate-800">
          <Link href="/login" className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
            ← Return to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
