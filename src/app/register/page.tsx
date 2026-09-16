'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Lock,
  Mail,
  User,
  Phone,
  Building,
  MapPin,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Layers,
} from 'lucide-react';
import { Button, Input } from '@/components/ui';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [city, setCity] = useState('Ranchi');
  const [category, setCategory] = useState('Local Business');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !whatsapp || !email || !businessName || !password) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          whatsapp: whatsapp.trim(),
          email: email.trim().toLowerCase(),
          businessName: businessName.trim(),
          city: city.trim(),
          category: category.trim(),
          password,
          authMethod: 'CREDENTIALS',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'Registration failed. Please check your details.');
        setIsLoading(false);
        return;
      }

      router.push(data.redirectUrl || '/portal');
    } catch (err: any) {
      setErrorMessage('Network error during registration. Please try again.');
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsGoogleLoading(true);
    try {
      // Initiate Google OAuth Flow with GBP Scope
      const returnUrl = encodeURIComponent(window.location.origin + '/portal');
      window.location.href = `/api/auth/google/gbp?mode=register&redirect_uri=${returnUrl}`;
    } catch (err) {
      console.error('Error initiating Google OAuth:', err);
      setErrorMessage('Could not connect to Google Auth. Please register with email/password.');
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950 p-4 py-8">
      {/* Background ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6 relative z-10">
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
          <div className="flex items-center justify-center gap-2 flex-wrap pt-1">
            <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              14-Day Free Demo Trial
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-black bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              20 Free AI Credits Included
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            Get Started with Client 360 Growth Suite
          </h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Rank #1 on Google Maps, generate authentic 5-star reviews, launch your 1-page website, and convert searches into WhatsApp inquiries.
          </p>
        </div>

        {/* Google OAuth Quick Sign Up Button */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={isGoogleLoading}
            className="w-full py-3 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-100 font-bold text-xs flex items-center justify-center gap-3 transition-all shadow-xs"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{isGoogleLoading ? 'Connecting Google Account...' : 'Continue with Google Account'}</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              or register with details
            </span>
            <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
          </div>
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-600 dark:text-rose-400 font-medium">
            {errorMessage}
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleRegister} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Your Full Name *"
              type="text"
              placeholder="e.g. Rahul Sharma"
              icon={User}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <Input
              label="WhatsApp Mobile Number *"
              type="tel"
              placeholder="e.g. 9835124567"
              icon={Phone}
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Email Address *"
              type="email"
              placeholder="e.g. business@gmail.com"
              icon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Business / Store Name *"
              type="text"
              placeholder="e.g. Ranchi Dental Care"
              icon={Building}
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                City / Location *
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Ranchi">Ranchi</option>
                  <option value="Dhanbad">Dhanbad</option>
                  <option value="Jamshedpur">Jamshedpur</option>
                  <option value="Deoghar">Deoghar</option>
                  <option value="Bokaro">Bokaro</option>
                  <option value="Hazaribagh">Hazaribagh</option>
                  <option value="Giridih">Giridih</option>
                  <option value="Ramgarh">Ramgarh</option>
                  <option value="Other">Other City (India)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Business Category *
              </label>
              <div className="relative">
                <Layers className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Clinic & Healthcare">Clinic & Healthcare</option>
                  <option value="Dental Clinic">Dental Clinic</option>
                  <option value="Salon & Beauty Parlour">Salon & Beauty Parlour</option>
                  <option value="Gym & Fitness Center">Gym & Fitness Center</option>
                  <option value="Restaurant & Cafe">Restaurant & Cafe</option>
                  <option value="Hotel & Banquet">Hotel & Banquet</option>
                  <option value="Automobile & Garage">Automobile & Garage</option>
                  <option value="Retail & Showroom">Retail & Showroom</option>
                  <option value="Fabrication & Interior">Fabrication & Interior</option>
                  <option value="Professional Services">Professional Services</option>
                  <option value="Local Business">Other Local Business</option>
                </select>
              </div>
            </div>
          </div>

          <Input
            label="Create Password *"
            type="password"
            placeholder="At least 6 characters"
            icon={Lock}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {/* Trial Value Perks */}
          <div className="p-3.5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 space-y-1.5">
            <span className="font-black text-indigo-700 dark:text-indigo-300 text-[11px] flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              What's included in your 14-Day Free Demo:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                <span>Full Client 360 Dashboard</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                <span>20 Gemini AI Credits</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                <span>One-Page Website Builder</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                <span>Live Google Maps Sync</span>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full py-3 font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 text-xs"
            disabled={isLoading}
          >
            {isLoading ? (
              <span>Activating Your Free Trial...</span>
            ) : (
              <>
                <span>Start 14-Day Free Trial (20 AI Credits)</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </form>

        {/* Footer info & Link to Login */}
        <div className="text-center pt-2 border-t border-slate-100 dark:border-slate-800">
          <p className="text-xs text-slate-500">
            Already have an account?{' '}
            <Link
              href="/login"
              className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
            >
              Sign In to Platform
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
