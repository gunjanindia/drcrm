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
  const [initialCredits, setInitialCredits] = useState<number>(100);
  const [packageId, setPackageId] = useState('pkg_growth_999');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdPortalData, setCreatedPortalData] = useState<any>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const selectedCategoryInfo = BUSINESS_CATEGORIES.find((c) => c.id === category) || BUSINESS_CATEGORIES[0];

  const handleCreatePortal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim() || !phone.trim()) return;

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: businessName.trim(),
          category: selectedCategoryInfo.label,
          phone: phone.trim(),
          email: email.trim() || `${businessName.toLowerCase().replace(/[^a-z0-9]/g, '')}@business.in`,
          city: city.trim() || 'Ranchi',
          address: address.trim(),
          packageId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create client');
      }

      const client = data.data;
      const portalToken = `tok_portal_${Math.random().toString(36).substring(2, 10)}`;
      const portalUrl = `${window.location.origin}/portal?clientId=${client.id}&token=${portalToken}`;

      const portalSummary = {
        client,
        portalUrl,
        portalToken,
        category: selectedCategoryInfo.label,
        initialCredits,
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

  const handleSendWhatsApp = () => {
    if (!createdPortalData) return;
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const msg = `Namaste ${contactName || businessName}! 🙏

Welcome to your official *Client 360 Growth Portal* powered by Digital Ranchi!

✨ *Your Portal Features:*
• Live Google Business Profile Health Audit
• Monthly Growth Tracker (Rank, Calls, Visits)
• AI Smart Review Responder
• Festive & Offer Creative Generator
• Printable Review QR Counter Stand
• 1-Page Mini-Site

👉 *Access Your 360 Portal Here:*
${createdPortalData.portalUrl}

Your account includes *${initialCredits} Free AI Credits*!`;

    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleReset = () => {
    setCreatedPortalData(null);
    setBusinessName('');
    setContactName('');
    setPhone('+91 94311 ');
    setEmail('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleReset}
      title="Provision Client 360 Portal for Business"
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
                Client 360 Portal Activated!
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                Portal provisioned for <strong>{createdPortalData.client.businessName}</strong> ({createdPortalData.category}).
              </p>
            </div>

            <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="font-mono text-[11px] text-indigo-600 dark:text-indigo-400 truncate max-w-[280px]">
                {createdPortalData.portalUrl}
              </span>
              <Button
                variant="outline"
                size="sm"
                icon={copiedLink ? Check : Copy}
                onClick={handleCopyPortalLink}
              >
                {copiedLink ? 'Copied!' : 'Copy Link'}
              </Button>
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
              Send Access via WhatsApp
            </Button>

            <a
              href={createdPortalData.portalUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full"
            >
              <Button variant="primary" size="md" icon={ExternalLink} className="w-full">
                Launch Portal as Client
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Business / Store Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Royal Sweets & Bakery"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
              />
            </div>

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
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                WhatsApp Phone Number *
              </label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="owner@business.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
              />
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
              What gets provisioned automatically:
            </span>
            • 360 Growth Dashboard with Category-Tailored KPIs<br />
            • Google Business Profile OAuth Connection Link<br />
            • Printable Review QR Counter Stand generator<br />
            • 1-Page Mobile Mini-Site with 1-Click WhatsApp Booking
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
              Activate & Provision Client 360 Portal
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
