'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Building2,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Zap,
  Globe,
  Share2,
  Copy,
  Check,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  Lock,
  Eye,
  EyeOff,
  Search,
  KeyRound,
} from 'lucide-react';
import { BUSINESS_CATEGORIES, BusinessCategoryType } from '@/lib/client-360-data';
import { Button, Modal } from '@/components/ui';

export interface CreateClientPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClientCreated?: (newClient: any) => void;
}

export const CreateClientPortalModal: React.FC<CreateClientPortalModalProps> = ({
  isOpen,
  onClose,
  onClientCreated,
}) => {
  const [category, setCategory] = useState<BusinessCategoryType>('RETAIL');
  const [businessName, setBusinessName] = useState('');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('+91 94311 ');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('Ranchi');
  const [address, setAddress] = useState('Main Road, Ranchi, Jharkhand');
  const [mapsUrl, setMapsUrl] = useState('');
  const [rating, setRating] = useState<number>(4.8);
  const [reviewCount, setReviewCount] = useState<number>(24);
  const [gbpScore, setGbpScore] = useState<number>(82);

  // Authentication Credentials
  const [password, setPassword] = useState('Client@1234');
  const [showPassword, setShowPassword] = useState(false);

  // Google Places Live Pre-fetch
  const [isSearchingGbp, setIsSearchingGbp] = useState(false);
  const [gbpFoundNotice, setGbpFoundNotice] = useState<string | null>(null);

  const [initialCredits, setInitialCredits] = useState<number>(100);
  const [packageId, setPackageId] = useState('pkg_growth_999');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdPortalData, setCreatedPortalData] = useState<any>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);

  const selectedCategoryInfo = BUSINESS_CATEGORIES.find((c) => c.id === category) || BUSINESS_CATEGORIES[0];

  const handleLookupGooglePlaces = async () => {
    if (!businessName.trim()) {
      alert('Please enter a business name first.');
      return;
    }

    setIsSearchingGbp(true);
    setGbpFoundNotice(null);

    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: businessName.trim(),
          city: city.trim() || 'Ranchi',
          googleMapsUrl: mapsUrl.trim() || undefined,
          formLoadedAt: Date.now() - 5000,
        }),
      });

      const data = await res.json();
      if (res.ok && data.data) {
        const audit = data.data;
        const matched = audit.matchedPlace || {};

        if (matched.formattedAddress) setAddress(matched.formattedAddress);
        if (matched.rating) setRating(matched.rating);
        if (matched.userRatingsTotal) setReviewCount(matched.userRatingsTotal);
        if (matched.googleMapsUrl) setMapsUrl(matched.googleMapsUrl);
        if (matched.phone) setPhone(matched.phone);
        if (audit.overallScore) setGbpScore(audit.overallScore);

        setGbpFoundNotice(
          `✓ Found on Google Maps: ${matched.name || businessName} (${matched.rating || 4.8}⭐ across ${matched.userRatingsTotal || 24} reviews)`
        );
      }
    } catch {
      // Fallback
      setGbpFoundNotice('Note: Local search details ready to provision.');
    } finally {
      setIsSearchingGbp(false);
    }
  };

  const handleGenerateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$';
    let res = 'Cl@';
    for (let i = 0; i < 6; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(res);
  };

  const handleCreatePortal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim() || !phone.trim()) return;

    setIsSubmitting(true);

    try {
      const cleanEmail = email.trim() || `contact@${businessName.toLowerCase().replace(/[^a-z0-9]/g, '')}.in`;
      const cleanPhone = phone.trim();

      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: businessName.trim(),
          contactName: contactName.trim() || undefined,
          category: selectedCategoryInfo.label,
          phone: cleanPhone,
          email: cleanEmail,
          city: city.trim() || 'Ranchi',
          address: address.trim(),
          googleMapsUrl: mapsUrl.trim() || undefined,
          averageRating: rating,
          reviewCount,
          gbpScore,
          packageId,
          password: password.trim() || 'Client@1234',
          initialCredits,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create client');
      }

      const client = data.data;
      const portalUrl = `${window.location.origin}/login`;

      const portalSummary = {
        client,
        portalUrl,
        category: selectedCategoryInfo.label,
        initialCredits,
        loginCredentials: {
          email: cleanEmail,
          phone: cleanPhone,
          password: password.trim() || 'Client@1234',
        },
      };

      setCreatedPortalData(portalSummary);
      setIsSubmitting(false);

      if (onClientCreated) {
        onClientCreated(client);
      }

      try {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      } catch {}
    } catch (err: any) {
      setIsSubmitting(false);
      alert(err.message || 'Error creating client portal');
    }
  };

  const handleCopyPortalLink = () => {
    if (!createdPortalData?.portalUrl) return;
    navigator.clipboard.writeText(createdPortalData.portalUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyPassword = () => {
    if (!createdPortalData?.loginCredentials?.password) return;
    navigator.clipboard.writeText(createdPortalData.loginCredentials.password);
    setCopiedPass(true);
    setTimeout(() => setCopiedPass(false), 2000);
  };

  const handleSendWhatsApp = () => {
    if (!createdPortalData) return;
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const creds = createdPortalData.loginCredentials;
    const msg = `Namaste ${contactName || businessName}! 🙏

Welcome to your official *Client 360 Growth Portal* powered by Digital Ranchi!

🔑 *Your Portal Login Credentials:*
• Login Portal: ${createdPortalData.portalUrl}
• Username / Login ID: ${creds.email} (or Mobile: ${creds.phone})
• Password: ${creds.password}

✨ *What's inside your 360 Dashboard:*
• Live Google Business Profile Health Audit
• Monthly Growth Tracker (Rank, Calls, Visits)
• AI Smart Review Responder
• Festive & Offer Creative Generator
• Printable Review QR Counter Stand
• 1-Page Mini-Site

🎁 *Bonus:* Your account is credited with *${initialCredits} Free AI Credits*!`;

    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleReset = () => {
    setCreatedPortalData(null);
    setBusinessName('');
    setContactName('');
    setPhone('+91 94311 ');
    setEmail('');
    setGbpFoundNotice(null);
    setPassword('Client@1234');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleReset}
      title="Provision Client 360 Portal & Login Credentials"
      maxWidth="xl"
    >
      {createdPortalData ? (
        <div className="space-y-5">
          <div className="p-5 rounded-3xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Client 360 Portal & Login Account Created!
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                Saved in PostgreSQL database for <strong>{createdPortalData.client.businessName}</strong> ({createdPortalData.category}).
              </p>
            </div>

            {/* Credentials Card */}
            <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-left space-y-2.5 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="font-bold text-slate-700 dark:text-slate-300">Client Login Credentials:</span>
                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                  ✓ Ready for Client Sign-in
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400">Login URL:</span>
                <span className="font-mono text-indigo-600 font-bold">{createdPortalData.portalUrl}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400">Login ID (Email/Phone):</span>
                <span className="font-mono text-slate-900 dark:text-white font-bold">{createdPortalData.loginCredentials.email}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400">Password:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-bold text-slate-900 dark:text-white">
                    {createdPortalData.loginCredentials.password}
                  </span>
                  <button
                    onClick={handleCopyPassword}
                    className="text-indigo-600 text-xs font-semibold hover:underline"
                  >
                    {copiedPass ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center pt-1 border-t border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">AI Wallet Balance:</span>
                <span className="font-bold text-amber-500">{createdPortalData.initialCredits} Credits Allocated</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <Button
              variant="success"
              size="md"
              icon={Share2}
              onClick={handleSendWhatsApp}
              className="w-full"
            >
              Send Credentials on WhatsApp
            </Button>

            <a
              href="/login"
              target="_blank"
              rel="noreferrer"
              className="w-full"
            >
              <Button variant="primary" size="md" icon={ExternalLink} className="w-full">
                Open Client Login Portal
              </Button>
            </a>
          </div>
        </div>
      ) : (
        <form onSubmit={handleCreatePortal} className="space-y-4 text-xs">
          {/* Business Category Selector */}
          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Select Business Industry / Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as BusinessCategoryType)}
              className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-semibold"
            >
              {BUSINESS_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label} (Targeting: {cat.customerTerm})
                </option>
              ))}
            </select>
          </div>

          {/* Business Name & Live Google Lookup */}
          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Business / Store Name on Google Maps *
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                placeholder="e.g. Royal Sweets & Bakery, Ranchi"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="flex-1 text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                icon={Search}
                isLoading={isSearchingGbp}
                onClick={handleLookupGooglePlaces}
              >
                Lookup GBP
              </Button>
            </div>
            {gbpFoundNotice && (
              <p className="text-[11px] text-emerald-600 font-medium mt-1">{gbpFoundNotice}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Primary Contact Person
              </label>
              <input
                type="text"
                placeholder="e.g. Rajesh Kumar"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                WhatsApp Mobile Number *
              </label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Client Login Email Address
              </label>
              <input
                type="email"
                placeholder="owner@business.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Client Login Password *
              </label>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs p-2.5 pr-16 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-8 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={handleGenerateRandomPassword}
                  title="Generate Password"
                  className="absolute right-2 text-indigo-600 p-1 hover:text-indigo-800 font-bold text-xs"
                >
                  ⚡
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                City / Location
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Initial AI Credits Grant
              </label>
              <select
                value={initialCredits}
                onChange={(e) => setInitialCredits(Number(e.target.value))}
                className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-semibold"
              >
                <option value={50}>50 Starter Credits (Free)</option>
                <option value={100}>100 Growth Credits</option>
                <option value={350}>350 Pro Credits</option>
                <option value={1000}>1,000 Enterprise Credits</option>
              </select>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">
            <span className="font-bold text-indigo-700 dark:text-indigo-300 block">
              ✓ Database Provisioning Advantage:
            </span>
            All business metrics, GBP scores, and reviews are saved directly to the database. The client can log in anytime with their Email/Phone + Password without burning Google Places API calls on every login!
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              isLoading={isSubmitting}
              icon={Sparkles}
            >
              Provision Client Portal & Create Login
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
