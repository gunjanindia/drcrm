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
  const [district, setDistrict] = useState('');
  const [address, setAddress] = useState('');
  const [category, setCategory] = useState('Local Business');
  const [password, setPassword] = useState('');
  const [googleMapsUrlInput, setGoogleMapsUrlInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Anti-bot & Cost Defense States
  const [hpField, setHpField] = useState('');
  const [formLoadedAt, setFormLoadedAt] = useState<number>(0);
  const [sessionToken, setSessionToken] = useState<string>('');

  React.useEffect(() => {
    setFormLoadedAt(Date.now());
    setSessionToken(`sess_${Math.random().toString(36).substring(2, 10)}_${Date.now().toString(36)}`);
  }, []);

  // GBP Candidate Discovery State
  const [isSearchingGbp, setIsSearchingGbp] = useState(false);
  const [gbpCandidates, setGbpCandidates] = useState<any[]>([]);
  const [hasSearchedGbp, setHasSearchedGbp] = useState(false);
  const [selectedGbp, setSelectedGbp] = useState<any | null>(null);
  const [showAddressRefine, setShowAddressRefine] = useState(false);
  const [isUnlistedBusiness, setIsUnlistedBusiness] = useState(false);

  const handleSearchGbpCandidates = async () => {
    const cleanBiz = businessName.trim();
    const cleanUrl = googleMapsUrlInput.trim();

    if (!cleanBiz && !cleanUrl) {
      setErrorMessage('Please enter your Business Name or Google Maps link to search for your profile.');
      return;
    }

    if (cleanBiz && cleanBiz.length < 3 && !cleanUrl) {
      setErrorMessage('Please enter at least 3 characters of your Business Name to search Google Maps.');
      return;
    }

    setIsSearchingGbp(true);
    setErrorMessage(null);
    setGbpCandidates([]);
    setIsUnlistedBusiness(false);

    try {
      const res = await fetch('/api/portal/gbp-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: cleanBiz,
          city: city.trim(),
          district: district.trim(),
          address: address.trim(),
          googleMapsUrl: cleanUrl || undefined,
          category: category.trim(),
          sessionToken,
          hp_field: hpField,
          formLoadedAt,
        }),
      });

      const data = await res.json();
      setHasSearchedGbp(true);

      if (res.status === 429) {
        setErrorMessage(data.error || 'Search rate limit reached. You can register as unlisted / manual details below.');
        setShowAddressRefine(true);
        setIsUnlistedBusiness(true);
        return;
      }

      if (res.ok && Array.isArray(data.candidates) && data.candidates.length > 0) {
        setGbpCandidates(data.candidates);
        // If exact match or only 1 high-confidence candidate, pre-select it
        if (data.candidates.length === 1 && data.candidates[0].matchConfidence >= 80) {
          setSelectedGbp(data.candidates[0]);
        }
      } else {
        setGbpCandidates([]);
        setShowAddressRefine(true);
      }
    } catch (err) {
      console.error('GBP search error:', err);
      setHasSearchedGbp(true);
      setShowAddressRefine(true);
    } finally {
      setIsSearchingGbp(false);
    }
  };

  const handleSelectCandidate = (candidate: any) => {
    setSelectedGbp(candidate);
    setIsUnlistedBusiness(false);
    if (candidate.name && candidate.name !== businessName) {
      setBusinessName(candidate.name);
    }
    if (candidate.formattedAddress && !address) {
      setAddress(candidate.formattedAddress);
    }
    if (candidate.googleMapsUrl) {
      setGoogleMapsUrlInput(candidate.googleMapsUrl);
    }
  };

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
          businessName: (selectedGbp?.name || businessName).trim(),
          city: city.trim(),
          district: district.trim(),
          address: selectedGbp?.formattedAddress || address.trim(),
          category: category.trim(),
          password,
          authMethod: 'CREDENTIALS',
          placeId: selectedGbp?.placeId || '',
          googleMapsUrl: selectedGbp?.googleMapsUrl || googleMapsUrlInput.trim() || '',
          averageRating: selectedGbp?.rating ?? 5.0,
          reviewCount: selectedGbp?.userRatingsTotal ?? 0,
          gbpScore: selectedGbp ? 88 : 75,
          isGbpLinked: !!selectedGbp && !isUnlistedBusiness,
          reviews: selectedGbp?.reviews || [],
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'Registration failed. Please check your details.');
        setIsLoading(false);
        return;
      }

      // Clear any previous user's cached profile in browser localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('drcrm_synced_gbp_profile_v2');
      }

      router.push(data.redirectUrl || '/portal');
    } catch (err: any) {
      setErrorMessage('Network error during registration. Please try again.');
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsGoogleLoading(true);
    setErrorMessage(null);
    try {
      const returnUrl = encodeURIComponent(window.location.origin + '/portal');
      const bizParam = encodeURIComponent(businessName.trim() || name.trim() || 'My Business');
      const emailParam = encodeURIComponent(email.trim().toLowerCase() || '');
      window.location.href = `/api/auth/google/gbp?mode=register&businessName=${bizParam}&email=${emailParam}&redirect_uri=${returnUrl}`;
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
      <div className="w-full max-w-6xl bg-slate-900/90 dark:bg-slate-900/90 border border-slate-800 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 relative z-10 my-6">
        
        {/* ========================================================================= */}
        {/* LEFT COLUMN: 2D Vector Illustration, Growth Metrics & Advantages List    */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 bg-gradient-to-br from-indigo-950/80 via-slate-900/90 to-purple-950/80 p-6 sm:p-8 border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-col justify-between space-y-6">
          
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
          <div className="relative p-4 rounded-2xl bg-slate-950/60 border border-indigo-500/20 shadow-xl overflow-hidden space-y-3">
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
            <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800 relative">
              <svg className="w-full h-20" viewBox="0 0 360 90" fill="none" xmlns="http://www.w3.org/2000/svg">
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
                <path d="M 0 75 Q 60 65, 120 50 T 240 28 T 360 10 L 360 90 L 0 90 Z" fill="url(#growthGrad)" />
                <path d="M 0 75 Q 60 65, 120 50 T 240 28 T 360 10" stroke="url(#lineGrad)" strokeWidth="3" strokeLinecap="round" />
                <circle cx="120" cy="50" r="3.5" fill="#38bdf8" />
                <circle cx="240" cy="28" r="3.5" fill="#818cf8" />
                <circle cx="360" cy="10" r="4.5" fill="#c084fc" />
              </svg>

              <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-slate-800/80 text-center">
                <div className="p-1 rounded-lg bg-slate-950/80 border border-slate-800">
                  <span className="text-[9px] text-slate-400 block font-medium">Map Clicks</span>
                  <span className="text-[11px] font-black text-sky-400">+340%</span>
                </div>
                <div className="p-1 rounded-lg bg-slate-950/80 border border-slate-800">
                  <span className="text-[9px] text-slate-400 block font-medium">Calls & Leads</span>
                  <span className="text-[11px] font-black text-indigo-400">185 / mo</span>
                </div>
                <div className="p-1 rounded-lg bg-slate-950/80 border border-slate-800">
                  <span className="text-[9px] text-slate-400 block font-medium">5★ Reviews</span>
                  <span className="text-[11px] font-black text-amber-400">4.9 ★ (88+)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Advantages List */}
          <div className="space-y-2.5">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              Why Jharkhand Businesses Choose Client 360:
            </span>

            <div className="space-y-2">
              <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-950/40 border border-slate-800/60">
                <div className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-3 h-3" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">#1 Google Maps Rank & Local SEO</h4>
                  <p className="text-[10px] text-slate-400">
                    Appear first when customers search for your products in your district.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-950/40 border border-slate-800/60">
                <div className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-3 h-3" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Gemini AI Review Reply Engine</h4>
                  <p className="text-[10px] text-slate-400">
                    Auto-respond to reviews in 1-click and get 20 free AI credits.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Trust Footer Strip */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400 flex-wrap gap-2">
            <div className="flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>
                <strong className="text-white">4.9/5</strong> Rating Across 250+ Jharkhand SMBs
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>14-Day Free Demo</span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: Interactive Registration Form & Google Auth                */}
        {/* ========================================================================= */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 sm:p-8 flex flex-col justify-between space-y-5">
          
          <div className="space-y-1.5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="px-3 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                <Clock className="w-3 h-3" />
                14-Day Free Demo Trial
              </span>
              <span className="px-3 py-0.5 rounded-full text-[10px] font-black bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center gap-1.5">
                <Coins className="w-3 h-3" />
                20 AI Credits
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Create Your Client 360 Account
            </h2>
            <p className="text-xs text-slate-500">
              Confirm your Google Business Profile & business details to activate your dashboard.
            </p>
          </div>

          {/* Google 1-Click Fast OAuth */}
          <div className="space-y-2.5">
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={isGoogleLoading}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 font-bold text-xs flex items-center justify-center gap-3 transition-all shadow-xs cursor-pointer"
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
            {/* Hidden Anti-Bot Honeypot Trap */}
            <input
              type="text"
              name="hp_field"
              value={hpField}
              onChange={(e) => setHpField(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
              className="hidden"
              aria-hidden="true"
              style={{ display: 'none', position: 'absolute', left: '-9999px' }}
            />

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
                onChange={(e) => {
                  setBusinessName(e.target.value);
                  if (selectedGbp) setSelectedGbp(null);
                }}
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
                    onChange={(e) => {
                      setCity(e.target.value);
                      if (selectedGbp) setSelectedGbp(null);
                    }}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-indigo-500"
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
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-indigo-500"
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

            {/* ========================================================================= */}
            {/* GOOGLE BUSINESS PROFILE (GBP) VERIFICATION & DISAMBIGUATION SECTION       */}
            {/* ========================================================================= */}
            <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-slate-950 border border-indigo-200 dark:border-indigo-900/50 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
                    <MapPin className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                      Confirm Your Google Business Profile
                      <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">(Recommended)</span>
                    </h4>
                    <p className="text-[10px] text-slate-500">
                      Match your exact Google Maps pin to activate 5★ reviews & rank tracking
                    </p>
                  </div>
                </div>

                {!selectedGbp && !isUnlistedBusiness && (
                  <button
                    type="button"
                    onClick={handleSearchGbpCandidates}
                    disabled={isSearchingGbp || !businessName.trim()}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-[11px] font-extrabold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    {isSearchingGbp ? (
                      <span>Searching Google Maps...</span>
                    ) : (
                      <>
                        <Sparkles className="w-3 h-3 text-amber-300" />
                        <span>Find My Google Listing</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Selected Confirmed Profile Badge */}
              {selectedGbp && !isUnlistedBusiness && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-600 text-white flex items-center gap-1">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        Confirmed Actual GBP
                      </span>
                      <span className="text-xs font-extrabold text-emerald-900 dark:text-emerald-200">
                        {selectedGbp.name}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                      {selectedGbp.formattedAddress}
                    </p>
                    <div className="flex items-center gap-3 text-[10px] text-slate-500 pt-0.5">
                      <span className="flex items-center gap-1 font-bold text-amber-500">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        {selectedGbp.rating?.toFixed(1) || '5.0'}★ ({selectedGbp.userRatingsTotal || 0} reviews)
                      </span>
                      <span>• Category: {selectedGbp.matchedCategory || category}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedGbp(null);
                      setHasSearchedGbp(false);
                      setShowAddressRefine(true);
                    }}
                    className="text-[10px] font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white underline shrink-0 cursor-pointer"
                  >
                    Change Listing
                  </button>
                </div>
              )}

              {/* Unlisted / New Business Badge */}
              {isUnlistedBusiness && (
                <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-[11px] text-slate-700 dark:text-slate-300">
                    <Building className="w-3.5 h-3.5 text-slate-500" />
                    <span>Registering as new / unlisted Google Business Profile (Setup assistance included)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsUnlistedBusiness(false);
                      setShowAddressRefine(false);
                    }}
                    className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 underline cursor-pointer"
                  >
                    Search Again
                  </button>
                </div>
              )}

              {/* Candidate Selection List (When multiple matching listings found) */}
              {!selectedGbp && !isUnlistedBusiness && gbpCandidates.length > 0 && (
                <div className="space-y-2 pt-1">
                  <p className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300">
                    We found {gbpCandidates.length} Google Maps {gbpCandidates.length === 1 ? 'profile' : 'profiles'}. Select your exact location:
                  </p>

                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {gbpCandidates.map((cand, idx) => (
                      <div
                        key={cand.placeId || idx}
                        onClick={() => handleSelectCandidate(cand)}
                        className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-xs transition-all cursor-pointer flex items-center justify-between gap-3 group"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                              {cand.name}
                            </span>
                            {cand.rating && (
                              <span className="text-[10px] font-bold text-amber-500 flex items-center gap-0.5">
                                <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                                {cand.rating?.toFixed(1)} ({cand.userRatingsTotal || 0})
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-500 line-clamp-1">
                            {cand.formattedAddress}
                          </p>
                        </div>

                        <button
                          type="button"
                          className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 group-hover:bg-indigo-600 text-indigo-600 group-hover:text-white dark:text-indigo-400 text-[10px] font-extrabold transition-colors shrink-0"
                        >
                          Select This Profile →
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Disambiguation & More Details Input (District, Street Address, Google Maps Link) */}
              {!selectedGbp && !isUnlistedBusiness && (
                <div className="space-y-2 pt-1 border-t border-indigo-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setShowAddressRefine(!showAddressRefine)}
                      className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>
                        {showAddressRefine ? '− Hide specific address & link fields' : '+ Refine with District / Locality, Street Address or Google Maps URL'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsUnlistedBusiness(true)}
                      className="text-[10px] font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 underline cursor-pointer"
                    >
                      Not on Google Maps yet?
                    </button>
                  </div>

                  {showAddressRefine && (
                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5 animate-in fade-in duration-200">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-0.5">
                            District / Area / Locality
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Lalpur, Doranda, Bank More"
                            value={district}
                            onChange={(e) => setDistrict(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-0.5">
                            Exact Street Address / Landmark
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Near Plaza Cinema, Main Road"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-0.5">
                          Direct Google Maps Share Link (Optional)
                        </label>
                        <input
                          type="url"
                          placeholder="e.g. https://maps.app.goo.gl/... or https://google.com/maps/place/..."
                          value={googleMapsUrlInput}
                          onChange={(e) => setGoogleMapsUrlInput(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs"
                        />
                      </div>

                      <div className="flex justify-end pt-1">
                        <button
                          type="button"
                          onClick={handleSearchGbpCandidates}
                          disabled={isSearchingGbp}
                          className="px-3 py-1 rounded-lg bg-slate-900 dark:bg-indigo-600 hover:bg-black dark:hover:bg-indigo-700 text-white font-bold text-[11px] flex items-center gap-1.5 cursor-pointer"
                        >
                          <Sparkles className="w-3 h-3 text-amber-300" />
                          <span>{isSearchingGbp ? 'Searching...' : 'Search with Details'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
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
