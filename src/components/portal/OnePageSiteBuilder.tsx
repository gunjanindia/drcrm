'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Globe,
  Sparkles,
  Smartphone,
  Monitor,
  CheckCircle2,
  ExternalLink,
  Phone,
  MessageCircle,
  MapPin,
  Clock,
  Star,
  Share2,
  Copy,
  Check,
  Save,
  Download,
  Code,
  Layers,
  HelpCircle,
  RefreshCw,
  Eye,
  Plus,
  Trash2,
  Upload,
  Image as ImageIcon,
  X,
  Edit3,
  AlertCircle,
} from 'lucide-react';
import {
  buildGeneratedWebsiteData,
  generateStandaloneHtmlBundle,
  detectCategoryKeyFromGbp,
  CATEGORY_THEMES,
  LocalCategoryKey,
  GeneratedWebsiteData,
} from '@/lib/one-page-site-engine';
import { usePortalProfile } from '@/contexts/PortalProfileContext';
import { Button } from '@/components/ui';

export interface ServiceItem {
  title: string;
  desc: string;
  price: string;
  badge?: string;
  icon?: string;
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface OnePageSiteBuilderProps {
  initialConfig?: any;
}

export const OnePageSiteBuilder: React.FC<OnePageSiteBuilderProps> = () => {
  const { profile, updateProfile } = usePortalProfile();

  const [categoryKey, setCategoryKey] = useState<LocalCategoryKey>(
    detectCategoryKeyFromGbp(profile.category)
  );

  const initialTheme = CATEGORY_THEMES[detectCategoryKeyFromGbp(profile.category)] || CATEGORY_THEMES.GENERAL;

  const [headline, setHeadline] = useState(
    profile.miniSiteConfig?.headline ||
      initialTheme.headlineTemplate(profile.businessName, profile.city || '')
  );
  const [subheadline, setSubheadline] = useState(
    profile.miniSiteConfig?.subheadline ||
      initialTheme.subheadlineTemplate(profile.category, profile.city || '')
  );
  const [aboutText, setAboutText] = useState(
    profile.miniSiteConfig?.aboutText ||
      `Welcome to ${profile.businessName}. We are dedicated to providing our clients with top quality, reliable service, and fast local response.`
  );
  const [phone, setPhone] = useState(profile.phone || '+91 94311 00000');
  const [whatsapp, setWhatsapp] = useState(profile.whatsapp || '919431100000');
  const [address, setAddress] = useState(profile.address || profile.city || 'Main Commercial Market');
  const [workingHours, setWorkingHours] = useState(
    profile.miniSiteConfig?.workingHours || 'Mon – Sat: 9:30 AM – 8:30 PM | Sun: Open'
  );

  // Logo & Banner
  const [logoUrl, setLogoUrl] = useState<string>(profile.miniSiteConfig?.logoUrl || '');
  const [bannerUrl, setBannerUrl] = useState<string>(profile.miniSiteConfig?.bannerUrl || '');

  // Editable Services & FAQs
  const [services, setServices] = useState<ServiceItem[]>(
    (profile.miniSiteConfig?.services && profile.miniSiteConfig.services.length > 0)
      ? profile.miniSiteConfig.services.map((s) => ({
          title: s.title,
          desc: s.desc,
          price: s.price || 'Standard',
          badge: (s as any).badge || '',
          icon: s.icon || 'Sparkles',
        }))
      : initialTheme.defaultServices.map((s) => ({
          title: s.title,
          desc: s.desc,
          price: s.price || 'Standard',
          badge: s.badge || '',
          icon: 'Sparkles',
        }))
  );

  const [faqs, setFaqs] = useState<FaqItem[]>(
    (profile.miniSiteConfig?.faqs && profile.miniSiteConfig.faqs.length > 0)
      ? profile.miniSiteConfig.faqs
      : initialTheme.defaultFaqs
  );

  // Custom Raw HTML Editor
  const [customHtml, setCustomHtml] = useState<string>(profile.miniSiteConfig?.customHtml || '');
  const [useCustomHtml, setUseCustomHtml] = useState<boolean>(!!profile.miniSiteConfig?.customHtml);

  const [deviceView, setDeviceView] = useState<'mobile' | 'desktop'>('mobile');
  const [activeTab, setActiveTab] = useState<'content' | 'images' | 'services' | 'faqs' | 'code'>('content');
  const [isSaved, setIsSaved] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedHtml, setCopiedHtml] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const siteSlug = profile.businessName
    ? profile.businessName.toLowerCase().replace(/[^a-z0-9]/g, '-')
    : 'my-business-site';
  const livePreviewUrl = `/s/${siteSlug}`;

  const currentTheme = CATEGORY_THEMES[categoryKey] || CATEGORY_THEMES.GENERAL;

  // Build the website data for rendering and bundle export
  const generatedData: GeneratedWebsiteData = buildGeneratedWebsiteData({
    businessName: profile.businessName,
    category: currentTheme.name,
    city: profile.city,
    address,
    phone,
    whatsapp,
    email: profile.email,
    googleMapsUrl: profile.googleMapsUrl,
    rating: profile.averageRating || 4.9,
    reviewCount: profile.reviewCount || 30,
    workingHours,
    headline,
    subheadline,
    customAbout: aboutText,
    logoUrl,
    bannerUrl,
    customServices: services.map((s) => ({
      title: s.title,
      desc: s.desc,
      price: s.price,
      badge: s.badge,
    })),
    customFaqs: faqs,
    realReviews: profile.reviews?.map((r) => ({
      authorName: r.authorName,
      rating: r.rating,
      text: r.content,
      relativeTime: r.date,
    })),
  });

  const { html: autoGeneratedHtml } = generateStandaloneHtmlBundle(generatedData);
  const effectiveHtml = useCustomHtml && customHtml.trim() ? customHtml : autoGeneratedHtml;

  const handleCategorySelect = (key: LocalCategoryKey) => {
    setCategoryKey(key);
    const th = CATEGORY_THEMES[key];
    setHeadline(th.headlineTemplate(profile.businessName, profile.city || ''));
    setSubheadline(th.subheadlineTemplate(th.name, profile.city || ''));
    setServices(
      th.defaultServices.map((s) => ({
        title: s.title,
        desc: s.desc,
        price: s.price || 'Standard',
        badge: s.badge || '',
        icon: 'Sparkles',
      }))
    );
    setFaqs(th.defaultFaqs);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        setLogoUrl(reader.result.toString());
      }
    };
    reader.readAsDataURL(file);
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        setBannerUrl(reader.result.toString());
      }
    };
    reader.readAsDataURL(file);
  };

  // CRUD for Services
  const handleAddService = () => {
    setServices([
      ...services,
      {
        title: 'New Service / Product Offering',
        desc: 'Detailed description of this offering and customer benefits.',
        price: '₹499 onwards',
        badge: 'New',
        icon: 'Sparkles',
      },
    ]);
  };

  const handleUpdateService = (index: number, field: keyof ServiceItem, value: string) => {
    const updated = [...services];
    updated[index] = { ...updated[index], [field]: value };
    setServices(updated);
  };

  const handleDeleteService = (index: number) => {
    setServices(services.filter((_, i) => i !== index));
  };

  const handleResetServices = () => {
    setServices(
      currentTheme.defaultServices.map((s) => ({
        title: s.title,
        desc: s.desc,
        price: s.price || 'Standard',
        badge: s.badge || '',
        icon: 'Sparkles',
      }))
    );
  };

  // CRUD for FAQs
  const handleAddFaq = () => {
    setFaqs([
      ...faqs,
      {
        q: 'What is another common question your customers ask?',
        a: 'Provide a clear, helpful, and transparent answer for your clients.',
      },
    ]);
  };

  const handleUpdateFaq = (index: number, field: keyof FaqItem, value: string) => {
    const updated = [...faqs];
    updated[index] = { ...updated[index], [field]: value };
    setFaqs(updated);
  };

  const handleDeleteFaq = (index: number) => {
    setFaqs(faqs.filter((_, i) => i !== index));
  };

  const handleResetFaqs = () => {
    setFaqs(currentTheme.defaultFaqs);
  };

  // Save changes to profile & context
  const handleSaveAndPublish = () => {
    const fullSiteUrl =
      typeof window !== 'undefined'
        ? `${window.location.origin}${livePreviewUrl}`
        : livePreviewUrl;

    updateProfile({
      ...profile,
      websiteUrl: fullSiteUrl,
      miniSiteConfig: {
        category: 'RETAIL',
        headline,
        subheadline,
        tagline: currentTheme.taglineDefault,
        aboutText,
        ownerName: profile.businessName + ' Team',
        ownerTitle: currentTheme.name,
        logoUrl: logoUrl || undefined,
        bannerUrl: bannerUrl || undefined,
        services: services.map((s) => ({
          title: s.title,
          desc: s.desc,
          price: s.price || 'Standard',
          icon: s.icon || 'Sparkles',
          badge: s.badge || undefined,
        })),
        faqs,
        customHtml: useCustomHtml ? customHtml : undefined,
        workingHours,
        address,
        phone,
        whatsapp,
        themeColor: currentTheme.accentColor,
        bannerGradient: currentTheme.gradient,
        customSlug: siteSlug,
      },
    });

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleCopyLink = () => {
    const fullUrl = window.location.origin + livePreviewUrl;
    navigator.clipboard.writeText(fullUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleDownloadCode = () => {
    const blob = new Blob([effectiveHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${siteSlug}-index.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyHtml = () => {
    navigator.clipboard.writeText(effectiveHtml);
    setCopiedHtml(true);
    setTimeout(() => setCopiedHtml(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Action Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
              ⚡ 100% Fully Editable
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              ✓ Instant Live Preview
            </span>
            {isSaved && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500 text-white animate-pulse">
                ✓ Saved & Published!
              </span>
            )}
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1.5 flex items-center gap-2">
            <Globe className="w-5 h-5 text-sky-600" />
            1-Page Verified Business Website Generator & Editor
          </h3>
          <p className="text-xs text-slate-500">
            Edit text, upload logo/banner, customize services & FAQs, edit raw HTML, and publish directly to your Google profile.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <a
            href={livePreviewUrl}
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-all shadow-xs"
          >
            <Eye className="w-3.5 h-3.5 text-indigo-500" />
            <span>Open Full Live Site</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>

          <Button variant="outline" size="sm" icon={copiedUrl ? Check : Copy} onClick={handleCopyLink}>
            {copiedUrl ? 'Copied Link!' : 'Copy Site URL'}
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={isSaved ? Check : Save}
            onClick={handleSaveAndPublish}
            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md"
          >
            {isSaved ? 'Changes Saved!' : 'Save & Publish Website'}
          </Button>
        </div>
      </div>

      {/* Category Architecture Preset Switcher */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="font-bold uppercase tracking-wider text-slate-400 text-[10px] flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-500" />
            Category Template Preset:
          </span>
          <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
            {currentTheme.name}
          </span>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {(Object.keys(CATEGORY_THEMES) as LocalCategoryKey[]).map((key) => {
            const th = CATEGORY_THEMES[key];
            const isSelected = categoryKey === key;
            return (
              <button
                key={key}
                onClick={() => handleCategorySelect(key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                <span>{th.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2-Column Interface: Left Full Editor / Right Live Device Mockup */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Comprehensive Editor Panel */}
        <div className="lg:col-span-6 space-y-4">
          {/* Customizer Navigation Tabs */}
          <div className="flex rounded-2xl bg-slate-100 dark:bg-slate-800 p-1 text-xs font-bold gap-1 overflow-x-auto">
            <button
              onClick={() => setActiveTab('content')}
              className={`flex-1 py-1.5 px-2 rounded-xl whitespace-nowrap transition-all ${
                activeTab === 'content'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              1. Content & Info
            </button>
            <button
              onClick={() => setActiveTab('images')}
              className={`flex-1 py-1.5 px-2 rounded-xl whitespace-nowrap transition-all ${
                activeTab === 'images'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              2. Logo & Banner
            </button>
            <button
              onClick={() => setActiveTab('services')}
              className={`flex-1 py-1.5 px-2 rounded-xl whitespace-nowrap transition-all ${
                activeTab === 'services'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              3. Services ({services.length})
            </button>
            <button
              onClick={() => setActiveTab('faqs')}
              className={`flex-1 py-1.5 px-2 rounded-xl whitespace-nowrap transition-all ${
                activeTab === 'faqs'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              4. FAQs ({faqs.length})
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`flex-1 py-1.5 px-2 rounded-xl whitespace-nowrap transition-all ${
                activeTab === 'code'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              5. HTML Code
            </button>
          </div>

          {/* TAB 1: Core Text & Contact Information */}
          {activeTab === 'content' && (
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">
                  Hero Text & Business Details
                </h4>
                <span className="text-[10px] text-slate-400">All fields update live in preview</span>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Main Headline (Hero H1)
                </label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Subheadline / Value Proposition
                </label>
                <textarea
                  value={subheadline}
                  onChange={(e) => setSubheadline(e.target.value)}
                  rows={2}
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  About & Overview Text
                </label>
                <textarea
                  value={aboutText}
                  onChange={(e) => setAboutText(e.target.value)}
                  rows={3}
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Phone (Call CTA)
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    WhatsApp (Chat CTA)
                  </label>
                  <input
                    type="text"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Location Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Business Working Hours
                </label>
                <input
                  type="text"
                  value={workingHours}
                  onChange={(e) => setWorkingHours(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          )}

          {/* TAB 2: Logo and Hero Banner Uploads */}
          {activeTab === 'images' && (
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 text-xs">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">
                  Brand Imagery & Visual Assets
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Upload local files or paste image URLs to display on your header and hero banner.
                </p>
              </div>

              {/* Logo Section */}
              <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-sky-500" />
                    Business Logo Image
                  </label>
                  {logoUrl && (
                    <button
                      onClick={() => setLogoUrl('')}
                      className="text-rose-500 hover:text-rose-600 font-bold text-[11px] flex items-center gap-1"
                    >
                      <X className="w-3.5 h-3.5" />
                      Remove
                    </button>
                  )}
                </div>

                {logoUrl && (
                  <div className="flex items-center gap-3 p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                    <img
                      src={logoUrl}
                      alt="Logo Preview"
                      className="h-12 max-w-[120px] object-contain rounded-lg border border-slate-100"
                    />
                    <span className="text-[11px] text-emerald-600 font-bold">✓ Logo Active</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="file"
                    ref={logoInputRef}
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    icon={Upload}
                    onClick={() => logoInputRef.current?.click()}
                    className="w-full text-xs"
                  >
                    Upload Logo File
                  </Button>

                  <input
                    type="text"
                    placeholder="Or paste Logo Image URL..."
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    className="text-xs p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                  />
                </div>
              </div>

              {/* Hero Banner Section */}
              <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-indigo-500" />
                    Hero Background Banner Image
                  </label>
                  {bannerUrl && (
                    <button
                      onClick={() => setBannerUrl('')}
                      className="text-rose-500 hover:text-rose-600 font-bold text-[11px] flex items-center gap-1"
                    >
                      <X className="w-3.5 h-3.5" />
                      Remove
                    </button>
                  )}
                </div>

                {bannerUrl && (
                  <div className="relative rounded-xl overflow-hidden h-24 border border-slate-200 dark:border-slate-800">
                    <img
                      src={bannerUrl}
                      alt="Banner Preview"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 text-white text-[10px] font-bold">
                      ✓ Banner Active
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="file"
                    ref={bannerInputRef}
                    accept="image/*"
                    onChange={handleBannerUpload}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    icon={Upload}
                    onClick={() => bannerInputRef.current?.click()}
                    className="w-full text-xs"
                  >
                    Upload Banner File
                  </Button>

                  <input
                    type="text"
                    placeholder="Or paste Banner Image URL..."
                    value={bannerUrl}
                    onChange={(e) => setBannerUrl(e.target.value)}
                    className="text-xs p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Full CRUD for Services */}
          {activeTab === 'services' && (
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">
                    Services & Products ({services.length})
                  </h4>
                  <p className="text-[11px] text-slate-500">Add, edit pricing, or remove offerings.</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" icon={RefreshCw} onClick={handleResetServices}>
                    Reset
                  </Button>
                  <Button variant="primary" size="sm" icon={Plus} onClick={handleAddService}>
                    Add Service
                  </Button>
                </div>
              </div>

              <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                {services.map((srv, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2.5 relative group"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-black text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded-md text-[10px]">
                        Service #{idx + 1}
                      </span>
                      <button
                        onClick={() => handleDeleteService(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                        title="Delete Service"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-2">
                        <label className="font-bold text-slate-600 dark:text-slate-400 block mb-0.5 text-[10px]">
                          Title
                        </label>
                        <input
                          type="text"
                          value={srv.title}
                          onChange={(e) => handleUpdateService(idx, 'title', e.target.value)}
                          className="w-full text-xs p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-bold text-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-600 dark:text-slate-400 block mb-0.5 text-[10px]">
                          Price / Rate
                        </label>
                        <input
                          type="text"
                          value={srv.price}
                          onChange={(e) => handleUpdateService(idx, 'price', e.target.value)}
                          className="w-full text-xs p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-2">
                        <label className="font-bold text-slate-600 dark:text-slate-400 block mb-0.5 text-[10px]">
                          Description
                        </label>
                        <textarea
                          value={srv.desc}
                          onChange={(e) => handleUpdateService(idx, 'desc', e.target.value)}
                          rows={2}
                          className="w-full text-xs p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-600 dark:text-slate-400 block mb-0.5 text-[10px]">
                          Badge (Optional)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Popular"
                          value={srv.badge || ''}
                          onChange={(e) => handleUpdateService(idx, 'badge', e.target.value)}
                          className="w-full text-xs p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: Full CRUD for FAQs */}
          {activeTab === 'faqs' && (
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">
                    Frequently Asked Questions ({faqs.length})
                  </h4>
                  <p className="text-[11px] text-slate-500">Edit or add customer FAQs.</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" icon={RefreshCw} onClick={handleResetFaqs}>
                    Reset
                  </Button>
                  <Button variant="primary" size="sm" icon={Plus} onClick={handleAddFaq}>
                    Add FAQ
                  </Button>
                </div>
              </div>

              <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                {faqs.map((faq, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2 relative group"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-black text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded-md text-[10px]">
                        FAQ #{idx + 1}
                      </span>
                      <button
                        onClick={() => handleDeleteFaq(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                        title="Delete FAQ"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div>
                      <label className="font-bold text-slate-600 dark:text-slate-400 block mb-0.5 text-[10px]">
                        Question
                      </label>
                      <input
                        type="text"
                        value={faq.q}
                        onChange={(e) => handleUpdateFaq(idx, 'q', e.target.value)}
                        className="w-full text-xs p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-bold text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-600 dark:text-slate-400 block mb-0.5 text-[10px]">
                        Answer
                      </label>
                      <textarea
                        value={faq.a}
                        onChange={(e) => handleUpdateFaq(idx, 'a', e.target.value)}
                        rows={2}
                        className="w-full text-xs p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: Editable Raw HTML Code */}
          {activeTab === 'code' && (
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3.5 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">
                    Standalone HTML Editor
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Edit raw HTML/CSS/JS directly and save your custom modifications.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" icon={Download} onClick={handleDownloadCode}>
                    Download
                  </Button>
                  <Button variant="outline" size="sm" icon={copiedHtml ? Check : Copy} onClick={handleCopyHtml}>
                    {copiedHtml ? 'Copied' : 'Copy'}
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  Custom HTML Override:
                </span>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useCustomHtml}
                    onChange={(e) => {
                      setUseCustomHtml(e.target.checked);
                      if (e.target.checked && !customHtml) {
                        setCustomHtml(autoGeneratedHtml);
                      }
                    }}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-[11px] text-slate-500">Enable Custom HTML</span>
                </label>
              </div>

              <textarea
                value={useCustomHtml ? customHtml : autoGeneratedHtml}
                onChange={(e) => {
                  setUseCustomHtml(true);
                  setCustomHtml(e.target.value);
                }}
                rows={14}
                className="w-full p-3 rounded-2xl bg-slate-950 text-slate-200 font-mono text-[10px] leading-relaxed border border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />

              {useCustomHtml && (
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => {
                      setUseCustomHtml(false);
                      setCustomHtml('');
                    }}
                    className="text-slate-400 hover:text-slate-600 text-[11px] underline"
                  >
                    Reset to Auto-Generated HTML
                  </button>
                  <Button
                    variant="primary"
                    size="sm"
                    icon={Save}
                    onClick={handleSaveAndPublish}
                  >
                    Save Custom HTML
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Bottom Floating Save Button */}
          <div className="pt-2">
            <Button
              variant="primary"
              size="lg"
              icon={isSaved ? Check : Save}
              onClick={handleSaveAndPublish}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 shadow-lg"
            >
              {isSaved ? '✓ All Changes Saved & Published!' : 'Save & Publish All Changes'}
            </Button>
          </div>
        </div>

        {/* Right Live Device Mockup Preview */}
        <div className="lg:col-span-6 space-y-3 flex flex-col items-center">
          {/* Device Toggle */}
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setDeviceView('mobile')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                deviceView === 'mobile'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              Mobile (375px)
            </button>
            <button
              onClick={() => setDeviceView('desktop')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                deviceView === 'desktop'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              Desktop View
            </button>
          </div>

          {/* Live Preview Container Frame */}
          <div
            className={`w-full transition-all duration-300 ${
              deviceView === 'mobile' ? 'max-w-[390px]' : 'max-w-full'
            }`}
          >
            <div className="rounded-3xl border-8 border-slate-900 bg-slate-50 text-slate-900 shadow-2xl overflow-hidden text-xs max-h-[680px] overflow-y-auto">
              {/* Header with Logo */}
              <div className="p-3.5 bg-white border-b border-slate-200 flex items-center justify-between sticky top-0 z-20">
                <div className="flex items-center gap-2">
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt={profile.businessName}
                      className="h-7 max-w-[90px] object-contain rounded"
                    />
                  ) : (
                    <div className={`w-7 h-7 rounded-lg ${currentTheme.accentBg} text-white font-bold flex items-center justify-center text-[10px]`}>
                      {profile.businessName.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                  <span className="font-extrabold text-xs text-slate-900 truncate max-w-[130px]">
                    {profile.businessName}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <a
                    href={`https://wa.me/${whatsapp}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-1 rounded-full bg-emerald-500 text-white font-bold text-[10px] flex items-center gap-1 shadow-xs"
                  >
                    <MessageCircle className="w-3 h-3 fill-current" />
                    <span>WhatsApp</span>
                  </a>
                  <a
                    href={`tel:${phone}`}
                    className={`px-2.5 py-1 rounded-full ${currentTheme.accentBg} text-white font-bold text-[10px] flex items-center gap-1 shadow-xs`}
                  >
                    <Phone className="w-3 h-3" />
                    <span>Call</span>
                  </a>
                </div>
              </div>

              {/* Hero Banner (Supports Custom Background Image) */}
              <div
                className={`p-6 text-white text-center space-y-3 relative overflow-hidden`}
                style={{
                  background: bannerUrl
                    ? `linear-gradient(rgba(15, 23, 42, 0.78), rgba(15, 23, 42, 0.9)), url('${bannerUrl}') center/cover no-repeat`
                    : undefined,
                }}
              >
                {!bannerUrl && (
                  <div className={`absolute inset-0 bg-gradient-to-br ${currentTheme.gradient} -z-10`} />
                )}

                <span className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-400 text-slate-950 uppercase tracking-wider">
                  ★ Rated {profile.averageRating || 4.9} on Google Maps ({profile.reviewCount || 30}+ Reviews)
                </span>
                <h1 className="text-base sm:text-lg font-black tracking-tight leading-snug">
                  {headline}
                </h1>
                <p className="text-[11px] text-slate-300 leading-relaxed">{subheadline}</p>

                {/* Instant Dual CTA Buttons */}
                <div className="flex gap-2 pt-2 justify-center flex-wrap">
                  <a
                    href={`https://wa.me/${whatsapp}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[11px] flex items-center gap-1.5 shadow-md"
                  >
                    <MessageCircle className="w-3.5 h-3.5 fill-current" />
                    <span>{currentTheme.primaryCtaText}</span>
                  </a>
                  <a
                    href={`tel:${phone}`}
                    className="px-3.5 py-2 rounded-xl bg-white text-slate-900 font-bold text-[11px] flex items-center gap-1.5 shadow-md"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{currentTheme.secondaryCtaText}</span>
                  </a>
                </div>
              </div>

              {/* Trust Metrics Bar */}
              <div className="grid grid-cols-4 bg-white border-b border-slate-200 text-center py-2 px-1 text-[9px]">
                <div>
                  <strong className="block text-slate-900">{profile.averageRating || 4.9}★</strong>
                  <span className="text-slate-400">Rating</span>
                </div>
                <div>
                  <strong className="block text-slate-900">{profile.reviewCount || 30}+</strong>
                  <span className="text-slate-400">Reviews</span>
                </div>
                <div>
                  <strong className="block text-emerald-600">100%</strong>
                  <span className="text-slate-400">Verified</span>
                </div>
                <div>
                  <strong className="block text-indigo-600">Fast</strong>
                  <span className="text-slate-400">Support</span>
                </div>
              </div>

              {/* Editable Services List */}
              <div className="p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-xs text-slate-900">
                    {currentTheme.servicesTitle}
                  </h4>
                  <span className="text-[10px] text-slate-400">
                    {services.length} items
                  </span>
                </div>

                <div className="space-y-2">
                  {services.map((srv, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-white border border-slate-200/80 flex items-start justify-between shadow-xs gap-2"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <h5 className="font-bold text-xs text-slate-900">{srv.title}</h5>
                          {srv.badge && (
                            <span className="text-[8px] font-extrabold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                              {srv.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 leading-tight">{srv.desc}</p>
                      </div>
                      {srv.price && (
                        <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg shrink-0">
                          {srv.price}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Customer Reviews Section */}
              <div className="p-4 bg-slate-100 border-y border-slate-200 space-y-2">
                <h4 className="font-extrabold text-xs text-slate-900">Customer Reviews</h4>
                <div className="space-y-2">
                  {(generatedData.reviews || []).slice(0, 2).map((rev, idx) => (
                    <div key={idx} className="p-3 rounded-2xl bg-white border border-slate-200 text-[10px] space-y-1">
                      <div className="text-amber-400">{'★'.repeat(rev.rating)}</div>
                      <p className="text-slate-600 italic">"{rev.text}"</p>
                      <div className="text-slate-400 font-bold">{rev.authorName} • {rev.relativeTime}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Editable FAQs Accordion */}
              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-xs text-slate-900">Frequently Asked Questions</h4>
                  <span className="text-[10px] text-slate-400">{faqs.length} FAQs</span>
                </div>
                <div className="space-y-1.5">
                  {faqs.map((faq, idx) => {
                    const isOpen = openFaqIndex === idx;
                    return (
                      <div key={idx} className="rounded-xl bg-white border border-slate-200 overflow-hidden text-[10px]">
                        <button
                          onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                          className="w-full p-2.5 text-left font-bold text-slate-800 flex justify-between items-center"
                        >
                          <span>{faq.q}</span>
                          <span>{isOpen ? '▲' : '▼'}</span>
                        </button>
                        {isOpen && (
                          <div className="p-2.5 pt-0 text-slate-500 border-t border-slate-100">
                            {faq.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Working Hours & Map Location */}
              <div className="p-4 bg-white border-t border-slate-200 space-y-2.5 text-[11px]">
                <div className="flex items-start gap-2 text-slate-700">
                  <Clock className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-slate-900">Business Hours:</span>
                    <span>{workingHours}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2 text-slate-700">
                  <MapPin className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-slate-900">Address:</span>
                    <span>{address}</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 bg-slate-900 text-white text-center text-[10px] space-y-1">
                <p className="font-semibold">{profile.businessName}</p>
                <p className="text-slate-400">Official Google Business Profile Verified 1-Page Website</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
