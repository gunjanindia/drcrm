'use client';

import React, { useState } from 'react';
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
  Building2,
} from 'lucide-react';
import {
  MiniSiteConfig,
  DEFAULT_MINI_SITE,
  BUSINESS_CATEGORIES,
  BusinessCategoryType,
} from '@/lib/client-360-data';
import { Button } from '@/components/ui';

export interface OnePageSiteBuilderProps {
  initialConfig?: MiniSiteConfig;
  onSave?: (cfg: MiniSiteConfig) => void;
}

export const OnePageSiteBuilder: React.FC<OnePageSiteBuilderProps> = ({
  initialConfig = DEFAULT_MINI_SITE,
  onSave,
}) => {
  const [siteConfig, setSiteConfig] = useState<MiniSiteConfig>(initialConfig);
  const [deviceView, setDeviceView] = useState<'mobile' | 'desktop'>('mobile');
  const [isSaved, setIsSaved] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  React.useEffect(() => {
    if (initialConfig) {
      setSiteConfig(initialConfig);
    }
  }, [initialConfig]);

  const sitePublicUrl = `https://digitalranchi.in/s/${siteConfig.customSlug}`;

  const handleCategoryTemplateChange = (catId: BusinessCategoryType) => {
    const cat = BUSINESS_CATEGORIES.find((c) => c.id === catId);
    if (!cat) return;

    setSiteConfig((prev) => ({
      ...prev,
      category: catId,
      headline: `${prev.headline.split(' - ')[0] || 'Your Business'} (${cat.label})`,
      subheadline: `Top Rated ${cat.label} Services & Trusted Quality in Ranchi`,
      ownerTitle: cat.ownerTerm,
      services: cat.defaultServices,
      aboutText: `Welcome to our ${cat.label.toLowerCase()} in Ranchi. We are committed to providing our ${cat.customerTerm.toLowerCase()} with exceptional quality, guaranteed satisfaction, and prompt support. Visit us or connect directly via WhatsApp!`,
    }));
  };

  const handleSaveSite = () => {
    setIsSaved(true);
    if (onSave) onSave(siteConfig);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(sitePublicUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Action Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-sky-600" />
            1-Page Mini-Site Builder (GBP Linked - All Businesses)
          </h3>
          <p className="text-xs text-slate-500">
            Ultra-fast mobile landing page with 1-click WhatsApp & Call appointment booking. Set as official GBP website link.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" icon={copiedUrl ? Check : Copy} onClick={handleCopyLink}>
            {copiedUrl ? 'Copied Link!' : 'Copy Site URL'}
          </Button>
          <Button variant="primary" size="sm" icon={isSaved ? Check : Save} onClick={handleSaveSite}>
            {isSaved ? 'Published & Linked!' : 'Publish to GBP'}
          </Button>
        </div>
      </div>

      {/* Industry Template Switcher */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2 text-xs">
        <span className="font-bold uppercase tracking-wider text-slate-400 block text-[10px]">
          Quick Load Industry Template Preset:
        </span>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {BUSINESS_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryTemplateChange(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                siteConfig.category === cat.id
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2-Column: Left Customizer Form, Right Live Responsive Mini-Site Frame */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Customizer Settings */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3.5 text-xs">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">
              Site Content & Branding
            </h4>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Main Business Title
              </label>
              <input
                type="text"
                value={siteConfig.headline}
                onChange={(e) => setSiteConfig({ ...siteConfig, headline: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Subheading / Value Proposition
              </label>
              <input
                type="text"
                value={siteConfig.subheadline}
                onChange={(e) => setSiteConfig({ ...siteConfig, subheadline: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                About & Overview Text
              </label>
              <textarea
                value={siteConfig.aboutText}
                onChange={(e) => setSiteConfig({ ...siteConfig, aboutText: e.target.value })}
                rows={3}
                className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Owner / Manager Name
                </label>
                <input
                  type="text"
                  value={siteConfig.ownerName}
                  onChange={(e) => setSiteConfig({ ...siteConfig, ownerName: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Designation
                </label>
                <input
                  type="text"
                  value={siteConfig.ownerTitle}
                  onChange={(e) => setSiteConfig({ ...siteConfig, ownerTitle: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  WhatsApp Number
                </label>
                <input
                  type="text"
                  value={siteConfig.whatsapp}
                  onChange={(e) => setSiteConfig({ ...siteConfig, whatsapp: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Calling Phone
                </label>
                <input
                  type="text"
                  value={siteConfig.phone}
                  onChange={(e) => setSiteConfig({ ...siteConfig, phone: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Working / Operating Hours
              </label>
              <input
                type="text"
                value={siteConfig.workingHours}
                onChange={(e) => setSiteConfig({ ...siteConfig, workingHours: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Right Live Device Mockup Preview */}
        <div className="lg:col-span-7 space-y-3 flex flex-col items-center">
          {/* Device Toggle */}
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setDeviceView('mobile')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                deviceView === 'mobile'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-xs'
                  : 'text-slate-500'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              Mobile Preview
            </button>
            <button
              onClick={() => setDeviceView('desktop')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                deviceView === 'desktop'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-xs'
                  : 'text-slate-500'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              Desktop View
            </button>
          </div>

          {/* Device Frame */}
          <div
            className={`w-full transition-all duration-300 ${
              deviceView === 'mobile' ? 'max-w-[375px]' : 'max-w-full'
            }`}
          >
            <div className="rounded-3xl border-8 border-slate-900 bg-slate-50 text-slate-900 shadow-2xl overflow-hidden text-xs max-h-[640px] overflow-y-auto">
              {/* Site Hero Banner */}
              <div className="p-6 bg-gradient-to-r from-sky-900 via-slate-900 to-indigo-950 text-white space-y-3 text-center">
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-400 text-slate-950 uppercase tracking-wider">
                  ★ Rated 4.9 on Google Maps
                </span>
                <h1 className="text-base sm:text-lg font-black tracking-tight leading-snug">
                  {siteConfig.headline}
                </h1>
                <p className="text-[11px] text-sky-200">{siteConfig.subheadline}</p>

                {/* Instant Dual CTA Buttons */}
                <div className="flex gap-2 pt-2 justify-center">
                  <a
                    href={`https://wa.me/${siteConfig.whatsapp}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[11px] flex items-center gap-1.5 shadow-md"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    WhatsApp Direct
                  </a>
                  <a
                    href={`tel:${siteConfig.phone}`}
                    className="px-3 py-2 rounded-xl bg-white text-slate-900 font-bold text-[11px] flex items-center gap-1.5 shadow-md"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    Call Now
                  </a>
                </div>
              </div>

              {/* Owner / About Section */}
              <div className="p-5 bg-white border-b border-slate-100 space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white font-bold flex items-center justify-center text-sm">
                    {siteConfig.headline.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-slate-900">{siteConfig.ownerName}</h3>
                    <p className="text-[10px] text-slate-500">{siteConfig.ownerTitle}</p>
                  </div>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed pt-1">
                  {siteConfig.aboutText}
                </p>
              </div>

              {/* Key Offerings Grid */}
              <div className="p-5 space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">
                  Featured Products & Services
                </h4>
                <div className="space-y-2">
                  {siteConfig.services.map((srv, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-between shadow-xs"
                    >
                      <div>
                        <h5 className="font-bold text-xs text-slate-900">{srv.title}</h5>
                        <p className="text-[10px] text-slate-500">{srv.desc}</p>
                      </div>
                      <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg shrink-0 ml-2">
                        {srv.price}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Working Hours & Map Location */}
              <div className="p-5 bg-white border-t border-slate-100 space-y-3">
                <div className="flex items-start gap-2 text-[11px] text-slate-700">
                  <Clock className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Business Hours:</span>
                    <span>{siteConfig.workingHours}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2 text-[11px] text-slate-700">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Location Address:</span>
                    <span>{siteConfig.address}</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 bg-slate-900 text-white text-center text-[10px] space-y-1">
                <p className="font-semibold">{siteConfig.headline}</p>
                <p className="text-slate-400">Official Google Business Profile Verified 1-Page Mini Site</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
