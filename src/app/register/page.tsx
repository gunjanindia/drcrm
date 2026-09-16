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
  Star,
  TrendingUp,
  Globe,
  MessageCircle,
  PhoneCall,
  Zap,
  Award,
  ChevronRight,
  Coins,
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
      const returnUrl = encodeURIComponent(window.location.origin + '/portal');
      window.location.href = `/api/auth/google/gbp?mode=register&redirect_uri=${returnUrl}`;
    } catch (err) {
      console.error('Error initiating Google OAuth:', err);
      setErrorMessage('Could not connect to Google Auth. Please register with email/password.');
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 dark:bg-slate-950 p-3 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Background ambient lighting effects */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-600/15 rounded-full blur-[140px] pointer-events-none" />

      {/* Main 2-Column Container */}
      <div className="w-full max-w-6xl bg-slate-900/90 dark:bg-slate-900/90 border border-slate-800 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 relative z-10">
        
        {/* ========================================================================= */}
        {/* LEFT COLUMN: 2D Vector Illustration, Growth Metrics & Advantages List    */}
        {/* ========================================================================= */}
        <div className="lg:col-span-6 bg-gradient-to-br from-indigo-950/80 via-slate-900/90 to-purple-950/80 p-6 sm:p-10 border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-col justify-between space-y-8">
          
          {/* Brand Header */}
          <div className="space-y-3">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black shadow-lg shadow-indigo-600/40">
                DR
              </div>
              <div>
                <span className="font-black text-xl tracking-tight text-white block">
                  DIGITAL RANCHI
                </span>
                <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider block">
                  Local Growth OS & Client 360
                </span>
              </div>
            </Link>

            <div className="pt-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Client 360 Growth Suite</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white mt-2 leading-tight">
                Grow Your Business on <br />
                <span className="bg-gradient-to-r from-sky-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
                  Google Maps & WhatsApp
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
                Empower your business with Jharkhand's #1 local growth platform. Get ranked #1, automate customer reviews, and convert local searches into high-paying customers.
              </p>
            </div>
          </div>

          {/* 2D Vector Graphical Growth Simulation Card */}
          <div className="relative p-5 rounded-3xl bg-slate-950/60 border border-indigo-500/20 shadow-xl overflow-hidden space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                  Live Business Growth Engine
                </span>
              </div>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Rank #1 Local
              </span>
            </div>

            {/* 2D Vector Graphical SVG */}
            <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 relative">
              <svg className="w-full h-28" viewBox="0 0 360 110" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#38bdf8" />
                    <stop offset="50%" stopColor="#818cf8" />
                    <stop offset="100%" stopColor="#c084fc" />
                  </linearGradient>
                </defs>

                {/* Grid Lines */}
                <line x1="0" y1="25" x2="360" y2="25" stroke="#334155" strokeDasharray="3 3" strokeOpacity="0.4" />
                <line x1="0" y1="55" x2="360" y2="55" stroke="#334155" strokeDasharray="3 3" strokeOpacity="0.4" />
                <line x1="0" y1="85" x2="360" y2="85" stroke="#334155" strokeDasharray="3 3" strokeOpacity="0.4" />

                {/* Area Fill */}
                <path
                  d="M 0 95 Q 60 85, 120 70 T 240 38 T 360 15 L 360 110 L 0 110 Z"
                  fill="url(#growthGrad)"
                />

                {/* Growth Curve Line */}
                <path
                  d="M 0 95 Q 60 85, 120 70 T 240 38 T 360 15"
                  stroke="url(#lineGrad)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />

                {/* Data Points */}
                <circle cx="120" cy="70" r="4" fill="#38bdf8" className="animate-ping" />
                <circle cx="120" cy="70" r="4" fill="#38bdf8" />
                <circle cx="240" cy="38" r="4" fill="#818cf8" />
                <circle cx="360" cy="15" r="5" fill="#c084fc" />
              </svg>

              {/* Vector Badges Overlay */}
              <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-slate-800/80 text-center">
                <div className="p-1.5 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-medium">Map Clicks</span>
                  <span className="text-xs font-black text-sky-400">+340%</span>
                </div>
                <div className="p-1.5 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-medium">Calls & Leads</span>
                  <span className="text-xs font-black text-indigo-400">185 / mo</span>
                </div>
                <div className="p-1.5 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-medium">5★ Reviews</span>
                  <span className="text-xs font-black text-amber-400">4.9 ★ (88+)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Advantages List */}
          <div className="space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              Why Jharkhand Businesses Choose Client 360:
            </span>

            <div className="space-y-2.5">
              <div className="flex items-start gap-3 p-2.5 rounded-2xl bg-slate-950/40 border border-slate-800/60">
                <div className="w-7 h-7 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">#1 Google Maps Rank & Local SEO</h4>
                  <p className="text-[11px] text-slate-400">
                    Appear first when customers search for your products or treatments in your city.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-2xl bg-slate-950/40 border border-slate-800/60">
                <div className="w-7 h-7 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Gemini AI Review Reply Engine & 20 Free Credits</h4>
                  <p className="text-[11px] text-slate-400">
                    Auto-respond to reviews in 1-click and synthesize high-converting content with Gemini AI.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-2xl bg-slate-950/40 border border-slate-800/60">
                <div className="w-7 h-7 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Globe className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">1-Page High-Converting Verified Website</h4>
                  <p className="text-[11px] text-slate-400">
                    Launch an instant mobile-ready website with WhatsApp chat, direct call CTA, and services list.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Trust Footer Strip */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 flex-wrap gap-2">
            <div className="flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>
                <strong className="text-white">4.9/5</strong> Rating Across 250+ Jharkhand SMBs
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>No Credit Card Required</span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: Interactive Registration Form & Google Auth                */}
        {/* ========================================================================= */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 p-6 sm:p-10 flex flex-col justify-between space-y-6">
          
          <div className="space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                14-Day Free Demo Trial
              </span>
              <span className="px-3 py-1 rounded-full text-[11px] font-black bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5" />
                20 AI Credits
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Create Your Client 360 Account
            </h2>
            <p className="text-xs text-slate-500">
              Fill in your business details below to get instant access to your growth dashboard.
            </p>
          </div>

          {/* Google 1-Click Fast OAuth */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={isGoogleLoading}
              className="w-full py-3 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 font-bold text-xs flex items-center justify-center gap-3 transition-all shadow-xs cursor-pointer"
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
              <span>
                {isGoogleLoading ? 'Connecting Google Account...' : 'Continue with Google Account'}
              </span>
            </button>

            <div className="flex items-center gap-3">
              <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                or sign up with email
              </span>
              <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-600 dark:text-rose-400 font-medium">
              {errorMessage}
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleRegister} className="space-y-3.5 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Full Name *"
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
                placeholder="e.g. contact@business.in"
                icon={Mail}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Input
                label="Business / Store Name *"
                type="text"
                placeholder="e.g. Ranchi Health Clinic"
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
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-indigo-500"
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
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-indigo-500"
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
              label="Create Secure Password *"
              type="password"
              placeholder="At least 6 characters"
              icon={Lock}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full py-3 font-extrabold bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 text-xs cursor-pointer"
              disabled={isLoading}
            >
              {isLoading ? (
                <span>Activating Your 14-Day Free Demo...</span>
              ) : (
                <>
                  <span>Start 14-Day Free Trial (20 AI Credits)</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          {/* Footer Navigation */}
          <div className="text-center pt-3 border-t border-slate-100 dark:border-slate-800">
            <p className="text-xs text-slate-500">
              Already have an account?{' '}
              <Link
                href="/login"
                className="text-indigo-600 dark:text-indigo-400 font-extrabold hover:underline"
              >
                Sign In to Platform →
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
