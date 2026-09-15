'use client';

import React, { useState, useEffect } from 'react';
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

export interface OnePageSiteBuilderProps {
  initialConfig?: any;
}

export const OnePageSiteBuilder: React.FC<OnePageSiteBuilderProps> = () => {
  const { profile, updateProfile } = usePortalProfile();
  const [categoryKey, setCategoryKey] = useState<LocalCategoryKey>(
    detectCategoryKeyFromGbp(profile.category)
  );
  const [headline, setHeadline] = useState(
    profile.miniSiteConfig?.headline ||
      CATEGORY_THEMES[detectCategoryKeyFromGbp(profile.category)]?.headlineTemplate(
        profile.businessName,
        profile.city || ''
      )
  );
  const [subheadline, setSubheadline] = useState(
    profile.miniSiteConfig?.subheadline ||
      CATEGORY_THEMES[detectCategoryKeyFromGbp(profile.category)]?.subheadlineTemplate(
        profile.category,
        profile.city || ''
      )
  );
  const [aboutText, setAboutText] = useState(
    profile.miniSiteConfig?.aboutText ||
      `Welcome to ${profile.businessName}. We are dedicated to providing our clients with top quality, reliable service, and fast local response.`
  );
  const [phone, setPhone] = useState(profile.phone || '+91 94311 00000');
  const [whatsapp, setWhatsapp] = useState(profile.whatsapp || '919431100000');
  const [address, setAddress] = useState(profile.address || profile.city || 'Main Market');
  const [workingHours, setWorkingHours] = useState(
    profile.miniSiteConfig?.workingHours || 'Mon – Sat: 9:30 AM – 8:30 PM | Sun: Open'
  );

  const [deviceView, setDeviceView] = useState<'mobile' | 'desktop'>('mobile');
  const [activeTab, setActiveTab] = useState<'content' | 'theme' | 'code'>('content');
  const [isSaved, setIsSaved] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedHtml, setCopiedHtml] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const siteSlug = profile.businessName
    ? profile.businessName.toLowerCase().replace(/[^a-z0-9]/g, '-')
    : 'my-business-site';
  const livePreviewUrl = `/s/${siteSlug}`;

  const currentTheme = CATEGORY_THEMES[categoryKey] || CATEGORY_THEMES.GENERAL;

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
    customHeadline: headline,
    customSubheadline: subheadline,
    customAbout: aboutText,
    realReviews: profile.reviews?.map((r) => ({
      authorName: r.authorName,
      rating: r.rating,
      text: r.content,
      relativeTime: r.date,
    })),
  });

  const { html, css, js } = generateStandaloneHtmlBundle(generatedData);

  const handleCategorySelect = (key: LocalCategoryKey) => {
    setCategoryKey(key);
    const th = CATEGORY_THEMES[key];
    setHeadline(th.headlineTemplate(profile.businessName, profile.city || ''));
    setSubheadline(th.subheadlineTemplate(th.name, profile.city || ''));
  };

  const handleSaveAndPublish = () => {
    updateProfile({
      ...profile,
      websiteUrl: typeof window !== 'undefined' ? window.location.origin + livePreviewUrl : livePreviewUrl,
      miniSiteConfig: {
        category: 'RETAIL',
        headline,
        subheadline,
        tagline: currentTheme.taglineDefault,
        aboutText,
        ownerName: profile.businessName + ' Team',
        ownerTitle: currentTheme.name,
        services: currentTheme.defaultServices.map((s) => ({
          title: s.title,
          desc: s.desc,
          price: s.price || 'Standard',
          icon: 'Sparkles',
        })),
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
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleCopyLink = () => {
    const fullUrl = window.location.origin + livePreviewUrl;
    navigator.clipboard.writeText(fullUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleDownloadCode = () => {
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${siteSlug}-index.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyHtml = () => {
    navigator.clipboard.writeText(html);
    setCopiedHtml(true);
    setTimeout(() => setCopiedHtml(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Action Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
              ⚡ Mobile-First & Conversion Focused
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              ✓ GBP Linked
            </span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1.5 flex items-center gap-2">
            <Globe className="w-5 h-5 text-sky-600" />
            1-Page Verified Business Website Generator
          </h3>
          <p className="text-xs text-slate-500">
            Automatically adapts to any Google Business category with custom layout, 1-click WhatsApp/Call CTAs, reviews, and SEO schema.
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

          <Button variant="primary" size="sm" icon={isSaved ? Check : Save} onClick={handleSaveAndPublish}>
            {isSaved ? 'Published & Linked!' : 'Publish to Google'}
          </Button>
        </div>
      </div>

      {/* Category Preset Picker */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-bold uppercase tracking-wider text-slate-400 text-[10px] flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-500" />
            Select Business Category Architecture:
          </span>
          <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
            Current: {currentTheme.name}
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

      {/* Main 2-Column Interface: Left Form / Right Interactive Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Control Panel */}
        <div className="lg:col-span-5 space-y-4">
          {/* Customizer Tabs */}
          <div className="flex rounded-2xl bg-slate-100 dark:bg-slate-800 p-1 text-xs font-bold">
            <button
              onClick={() => setActiveTab('content')}
              className={`flex-1 py-1.5 rounded-xl transition-all ${
                activeTab === 'content'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500'
              }`}
            >
              Content & Text
            </button>
            <button
              onClick={() => setActiveTab('theme')}
              className={`flex-1 py-1.5 rounded-xl transition-all ${
                activeTab === 'theme'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500'
              }`}
            >
              Services & FAQs
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`flex-1 py-1.5 rounded-xl transition-all ${
                activeTab === 'code'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500'
              }`}
            >
              Export Code
            </button>
          </div>

          {activeTab === 'content' && (
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Hero Headline
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
                  Subheadline / Offer Description
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

              <div className="grid grid-cols-2 gap-2">
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
                  Business Hours
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

          {activeTab === 'theme' && (
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 text-xs">
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-2">
                  Category Services ({currentTheme.defaultServices.length})
                </h4>
                <div className="space-y-2">
                  {currentTheme.defaultServices.map((s, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                      <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                        <span>{s.title}</span>
                        {s.price && <span className="text-[10px] text-indigo-500">{s.price}</span>}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{s.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-2">
                  Pre-configured FAQs ({currentTheme.defaultFaqs.length})
                </h4>
                <div className="space-y-2">
                  {currentTheme.defaultFaqs.map((f, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                      <span className="font-bold text-slate-900 dark:text-white block">{f.q}</span>
                      <span className="text-[11px] text-slate-500 block mt-0.5">{f.a}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'code' && (
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3.5 text-xs">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">
                  Standalone Production Bundle
                </h4>
                <Button variant="primary" size="sm" icon={Download} onClick={handleDownloadCode}>
                  Download HTML
                </Button>
              </div>

              <p className="text-slate-500 text-[11px]">
                Valid, zero-dependency HTML5 file with embedded responsive CSS, vanilla JavaScript accordion, and LocalBusiness JSON-LD schema.
              </p>

              <div className="relative">
                <pre className="p-3 rounded-2xl bg-slate-950 text-slate-300 font-mono text-[10px] max-h-56 overflow-auto border border-slate-800">
                  {html.substring(0, 1200)}...
                </pre>
                <button
                  onClick={handleCopyHtml}
                  className="absolute top-2 right-2 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold flex items-center gap-1"
                >
                  {copiedHtml ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedHtml ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Live Device Mockup Preview */}
        <div className="lg:col-span-7 space-y-3 flex flex-col items-center">
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

          {/* Interactive Preview Container */}
          <div
            className={`w-full transition-all duration-300 ${
              deviceView === 'mobile' ? 'max-w-[390px]' : 'max-w-full'
            }`}
          >
            <div className="rounded-3xl border-8 border-slate-900 bg-slate-50 text-slate-900 shadow-2xl overflow-hidden text-xs max-h-[640px] overflow-y-auto">
              {/* Mock Header */}
              <div className="p-3.5 bg-white border-b border-slate-200 flex items-center justify-between sticky top-0 z-20">
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-lg ${currentTheme.accentBg} text-white font-bold flex items-center justify-center text-[10px]`}>
                    {profile.businessName.substring(0, 2).toUpperCase()}
                  </div>
                  <span className="font-extrabold text-xs text-slate-900 truncate max-w-[140px]">
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

              {/* Mock Hero */}
              <div className={`p-6 bg-gradient-to-br ${currentTheme.gradient} text-white text-center space-y-3`}>
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

              {/* Trust Bar */}
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

              {/* Services List */}
              <div className="p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-xs text-slate-900">
                    {currentTheme.servicesTitle}
                  </h4>
                  <span className="text-[10px] text-slate-400">
                    {currentTheme.defaultServices.length} offerings
                  </span>
                </div>

                <div className="space-y-2">
                  {currentTheme.defaultServices.map((srv, idx) => (
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

              {/* FAQ Accordion */}
              <div className="p-4 space-y-2">
                <h4 className="font-extrabold text-xs text-slate-900">Frequently Asked Questions</h4>
                <div className="space-y-1.5">
                  {currentTheme.defaultFaqs.map((faq, idx) => {
                    const isOpen = openFaq === idx;
                    return (
                      <div key={idx} className="rounded-xl bg-white border border-slate-200 overflow-hidden text-[10px]">
                        <button
                          onClick={() => setOpenFaq(isOpen ? null : idx)}
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
