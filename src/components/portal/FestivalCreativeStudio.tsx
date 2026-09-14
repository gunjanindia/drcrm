'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Download,
  Share2,
  Copy,
  Check,
  Palette,
  Tag,
  Phone,
  MapPin,
  Gift,
  Zap,
  Building2,
} from 'lucide-react';
import {
  FESTIVAL_PRESETS,
  FestivalPreset,
  BUSINESS_CATEGORIES,
  BusinessCategoryType,
} from '@/lib/client-360-data';
import { aiAssistantEngine } from '@/lib/ai-engine';
import { Button } from '@/components/ui';

export interface FestivalCreativeStudioProps {
  businessName?: string;
  category?: string;
  phone?: string;
  whatsapp?: string;
  address?: string;
  city?: string;
  currentPoints?: number;
  onDeductPoints?: (pts: number) => boolean;
  onOpenRechargeModal?: () => void;
}

export const FestivalCreativeStudio: React.FC<FestivalCreativeStudioProps> = ({
  businessName = 'Ranchi Prime Store',
  category = 'Retail Store',
  phone = '+91 94311 09876',
  whatsapp,
  address = 'Shop 14, Main Road, Near Lalpur Chowk, Ranchi',
  city = 'Ranchi',
  currentPoints = 50,
  onDeductPoints,
  onOpenRechargeModal,
}) => {
  const [selectedFestival, setSelectedFestival] = useState<FestivalPreset>(FESTIVAL_PRESETS[0]);
  const [businessCategory, setBusinessCategory] = useState<BusinessCategoryType>('RETAIL');
  const [offerTitle, setOfferTitle] = useState(FESTIVAL_PRESETS[0].defaultOfferTitle);
  const [offerDesc, setOfferDesc] = useState(FESTIVAL_PRESETS[0].defaultOfferDesc);
  const [ownerName, setOwnerName] = useState('Sunil Agarwal (Founder)');
  const [badgeText, setBadgeText] = useState('FESTIVE PRIVILEGE');
  const [isGeneratingCopy, setIsGeneratingCopy] = useState(false);
  const [generatedCopy, setGeneratedCopy] = useState<any>(null);
  const [copiedType, setCopiedType] = useState<string | null>(null);

  const handleCategorySelect = (catId: BusinessCategoryType) => {
    setBusinessCategory(catId);
    const found = BUSINESS_CATEGORIES.find((c) => c.id === catId);
    if (found) {
      setOfferTitle(`${selectedFestival.name}: ${found.offerExample}`);
      setOwnerName(found.ownerTerm);
    }
    setGeneratedCopy(null);
  };

  const handleFestivalChange = (fest: FestivalPreset) => {
    setSelectedFestival(fest);
    const cat = BUSINESS_CATEGORIES.find((c) => c.id === businessCategory);
    if (cat) {
      setOfferTitle(`${fest.name}: ${cat.offerExample}`);
    } else {
      setOfferTitle(fest.defaultOfferTitle);
    }
    setOfferDesc(fest.defaultOfferDesc);
    setGeneratedCopy(null);
  };

  const handleGenerateAICopy = () => {
    if (onDeductPoints) {
      const ok = onDeductPoints(2);
      if (!ok) {
        if (onOpenRechargeModal) onOpenRechargeModal();
        return;
      }
    }

    setIsGeneratingCopy(true);
    setTimeout(() => {
      const res = aiAssistantEngine.generateFestivalCreativeCopy(
        selectedFestival.name,
        offerTitle,
        businessName,
        city
      );
      setGeneratedCopy(res);
      setIsGeneratingCopy(false);
    }, 700);
  };

  const handleCopyText = (type: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleDownloadCard = () => {
    alert(`Downloading high-resolution ${selectedFestival.name} Graphic for ${businessName}!`);
  };

  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Gift className="w-5 h-5 text-rose-500" />
            Festival & Offer AI Creative Studio (All Businesses)
          </h3>
          <p className="text-xs text-slate-500">
            Design high-converting festive posters and viral WhatsApp broadcasts for retail, food, clinics, salons, coaching, gyms, auto, and more.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          icon={Sparkles}
          isLoading={isGeneratingCopy}
          onClick={handleGenerateAICopy}
        >
          Generate AI Copy & Broadcast (2 Credits)
        </Button>
      </div>

      {/* Business Category & Festival Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2 text-xs">
          <span className="font-bold uppercase tracking-wider text-slate-400 block text-[10px]">
            1. Select Your Business Category
          </span>
          <select
            value={businessCategory}
            onChange={(e) => handleCategorySelect(e.target.value as BusinessCategoryType)}
            className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-semibold"
          >
            {BUSINESS_CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.label} ({cat.customerTerm})
              </option>
            ))}
          </select>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2 text-xs">
          <span className="font-bold uppercase tracking-wider text-slate-400 block text-[10px]">
            2. Select Festival / Occasion Preset
          </span>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {FESTIVAL_PRESETS.map((fest) => {
              const isSelected = selectedFestival.id === fest.id;
              return (
                <button
                  key={fest.id}
                  onClick={() => handleFestivalChange(fest)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  <span>{fest.emoji}</span>
                  <span>{fest.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Studio 2-Column: Left Live Creative Preview Canvas, Right Customizer & AI Copy */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Live Visual Canvas Card (Square 1:1 Preview) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex justify-between items-center px-1">
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              Live Graphic Canvas Preview (1080 x 1080)
            </span>
            <Button variant="outline" size="sm" icon={Download} onClick={handleDownloadCard}>
              Download Poster
            </Button>
          </div>

          {/* Styled Graphic Card Container */}
          <div
            className={`relative aspect-square w-full rounded-3xl bg-gradient-to-br ${selectedFestival.bgGradient} p-6 sm:p-8 text-white shadow-2xl flex flex-col justify-between overflow-hidden border-4 border-white/20`}
          >
            {/* Background Decorative Rings */}
            <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-white/10 blur-2xl pointer-events-none" />
            <div className="absolute -left-16 -bottom-16 w-56 h-56 rounded-full bg-amber-400/20 blur-2xl pointer-events-none" />

            {/* Top Branding Strip */}
            <div className="relative z-10 flex items-start justify-between gap-2 border-b border-white/20 pb-4">
              <div>
                <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/20 backdrop-blur-md border border-white/30 text-amber-200">
                  {badgeText} • {selectedFestival.name.toUpperCase()}
                </span>
                <h4 className="text-lg sm:text-xl font-black tracking-tight mt-1 text-white">
                  {businessName}
                </h4>
                <p className="text-[11px] text-white/80 font-medium">{ownerName}</p>
              </div>

              <div className="text-3xl sm:text-4xl filter drop-shadow-md">
                {selectedFestival.emoji}
              </div>
            </div>

            {/* Middle Big Festive Headline & Offer */}
            <div className="relative z-10 my-auto py-4 space-y-3">
              <div className="inline-block px-3 py-1 rounded-xl bg-amber-400 text-slate-950 text-xs sm:text-sm font-black uppercase tracking-wider shadow-lg">
                ✨ SPECIAL CELEBRATION OFFER
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white leading-tight drop-shadow-md">
                {offerTitle}
              </h2>
              <p className="text-xs sm:text-sm text-white/90 leading-relaxed font-medium bg-black/20 backdrop-blur-xs p-3 rounded-2xl border border-white/10">
                {offerDesc}
              </p>
            </div>

            {/* Bottom Footer CTA Strip */}
            <div className="relative z-10 pt-4 border-t border-white/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 font-bold text-amber-300">
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call/WhatsApp: {phone}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-white/80">
                  <MapPin className="w-3 h-3 shrink-0" />
                  <span className="truncate max-w-[240px]">{address}</span>
                </div>
              </div>

              <div className="px-3 py-1.5 rounded-xl bg-white text-slate-900 font-bold text-xs shadow-md shrink-0">
                Claim Offer Today
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Customizer & AI Caption / WhatsApp Broadcast */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3.5">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">
              Customize Poster Text
            </h4>

            <div>
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Festive Offer Headline
              </label>
              <input
                type="text"
                value={offerTitle}
                onChange={(e) => setOfferTitle(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Offer Description / Details
              </label>
              <textarea
                value={offerDesc}
                onChange={(e) => setOfferDesc(e.target.value)}
                rows={2}
                className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Manager / Owner Tag
                </label>
                <input
                  type="text"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Badge Tag
                </label>
                <input
                  type="text"
                  value={badgeText}
                  onChange={(e) => setBadgeText(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* AI Copy & Social Broadcast Box */}
          <div className="p-5 rounded-3xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 shadow-sm space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                AI Social & WhatsApp Broadcast Copy
              </span>
              <span className="text-[10px] text-slate-500">Ready to post</span>
            </div>

            {generatedCopy ? (
              <div className="space-y-3 text-xs">
                {/* Social Caption */}
                <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase text-slate-400">
                      Instagram / Facebook Caption:
                    </span>
                    <button
                      onClick={() => handleCopyText('social', generatedCopy.caption)}
                      className="text-[10px] font-bold text-indigo-600 hover:underline flex items-center gap-1"
                    >
                      {copiedType === 'social' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      {copiedType === 'social' ? 'Copied!' : 'Copy Caption'}
                    </button>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 whitespace-pre-line text-[11px] leading-relaxed">
                    {generatedCopy.caption}
                  </p>
                </div>

                {/* WhatsApp Broadcast */}
                <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase text-emerald-600">
                      WhatsApp Broadcast Message:
                    </span>
                    <button
                      onClick={() => handleCopyText('wa', generatedCopy.whatsAppBroadcast)}
                      className="text-[10px] font-bold text-emerald-600 hover:underline flex items-center gap-1"
                    >
                      {copiedType === 'wa' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      {copiedType === 'wa' ? 'Copied!' : 'Copy WhatsApp Message'}
                    </button>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 whitespace-pre-line text-[11px] leading-relaxed">
                    {generatedCopy.whatsAppBroadcast}
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center space-y-2 rounded-2xl bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800">
                <p className="text-xs text-slate-500">
                  Click below to generate high-converting WhatsApp broadcasts and social media captions with hashtags.
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  icon={Sparkles}
                  isLoading={isGeneratingCopy}
                  onClick={handleGenerateAICopy}
                >
                  Generate AI Post & Broadcast Copy (2 Credits)
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
