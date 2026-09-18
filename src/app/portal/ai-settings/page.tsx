'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  CheckCircle2,
  RefreshCw,
  Plus,
  X,
  Smartphone,
  Star,
  Copy,
  ExternalLink,
  ShieldCheck,
  Radio,
  Sliders,
  HelpCircle,
} from 'lucide-react';
import { usePortalProfile } from '@/contexts/PortalProfileContext';

export default function AiReviewSettingsPage() {
  const { profile } = usePortalProfile();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Settings State
  const [businessType, setBusinessType] = useState('');
  const [keyServices, setKeyServices] = useState<string[]>([]);
  const [newServiceInput, setNewServiceInput] = useState('');
  const [targetKeywords, setTargetKeywords] = useState<string[]>([]);
  const [newKeywordInput, setNewKeywordInput] = useState('');
  const [tone, setTone] = useState<'FRIENDLY' | 'PROFESSIONAL' | 'SHORT_PUNCHY' | 'DETAILED'>('PROFESSIONAL');
  const [customInstructions, setCustomInstructions] = useState('');
  const [isShieldActive, setIsShieldActive] = useState(true);

  // Live Simulator State
  const [simRating, setSimRating] = useState<number>(5);
  const [simSelectedServices, setSimSelectedServices] = useState<string[]>([]);
  const [simReviewPreview, setSimReviewPreview] = useState<string>('');
  const [simGenerating, setSimGenerating] = useState(false);

  useEffect(() => {
    fetch('/api/portal/ai-settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data?.settings) {
          const s = data.data.settings;
          setBusinessType(s.businessType || profile.category || 'Local Business');
          setKeyServices(s.keyServices || ['Painless Service', 'Consultation', 'Spotless Hygiene', 'Fair Pricing']);
          setTargetKeywords(s.targetKeywords || [`best ${profile.category || 'service'} in ${profile.city || 'Ranchi'}`, 'quick service']);
          setTone(s.tone || 'PROFESSIONAL');
          setCustomInstructions(s.customInstructions || '');
          setIsShieldActive(s.isShieldActive ?? true);
          setSimSelectedServices((s.keyServices || []).slice(0, 2));
        }
      })
      .catch((err) => console.error('Failed to load AI review settings:', err))
      .finally(() => setLoading(false));
  }, [profile]);

  // Update simulator review preview when settings change
  useEffect(() => {
    updateSimReview();
  }, [tone, businessType, simSelectedServices, keyServices]);

  const updateSimReview = () => {
    const bName = profile.businessName || 'Our Business';
    const bCity = profile.city || 'Ranchi';
    const aspects = simSelectedServices.length > 0 ? simSelectedServices.join(' and ') : 'service quality';

    if (tone === 'FRIENDLY') {
      setSimReviewPreview(
        `Absolutely loved my visit to ${bName}! The team was so warm and welcoming, and the ${aspects} was fantastic. Highly recommend visiting them in ${bCity}!`
      );
    } else if (tone === 'SHORT_PUNCHY') {
      setSimReviewPreview(
        `Super fast, reliable, and top quality ${aspects}. ${bName} is definitely the best in ${bCity}! 5 stars.`
      );
    } else if (tone === 'DETAILED') {
      setSimReviewPreview(
        `I had a thoroughly professional experience with ${bName}. The staff took time to understand my requirements, executed the ${aspects} with precision, and maintained transparent pricing throughout. Truly commendable service in ${bCity}.`
      );
    } else {
      // PROFESSIONAL
      setSimReviewPreview(
        `Highly professional and courteous experience at ${bName}. Spotless facility, knowledgeable staff, and outstanding ${aspects}. Best ${profile.category || 'service'} in ${bCity}.`
      );
    }
  };

  const handleAddService = () => {
    if (newServiceInput.trim() && !keyServices.includes(newServiceInput.trim())) {
      const updated = [...keyServices, newServiceInput.trim()];
      setKeyServices(updated);
      setNewServiceInput('');
    }
  };

  const handleRemoveService = (serviceToRemove: string) => {
    setKeyServices(keyServices.filter((s) => s !== serviceToRemove));
    setSimSelectedServices(simSelectedServices.filter((s) => s !== serviceToRemove));
  };

  const handleAddKeyword = () => {
    if (newKeywordInput.trim() && !targetKeywords.includes(newKeywordInput.trim())) {
      setTargetKeywords([...targetKeywords, newKeywordInput.trim()]);
      setNewKeywordInput('');
    }
  };

  const handleRemoveKeyword = (keywordToRemove: string) => {
    setTargetKeywords(targetKeywords.filter((k) => k !== keywordToRemove));
  };

  const handleSave = async () => {
    setSaving(true);
    setSavedSuccess(false);
    try {
      const res = await fetch('/api/portal/ai-settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessType,
          keyServices,
          targetKeywords,
          tone,
          isShieldActive,
          customInstructions,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (e) {
      console.error('Failed to save AI settings:', e);
    } finally {
      setSaving(false);
    }
  };

  const tones: Array<{ id: 'FRIENDLY' | 'PROFESSIONAL' | 'SHORT_PUNCHY' | 'DETAILED'; label: string; desc: string; emoji: string }> = [
    { id: 'PROFESSIONAL', label: 'Professional', desc: 'Formal, reassuring, authoritative & clinical', emoji: '👔' },
    { id: 'FRIENDLY', label: 'Friendly & Warm', desc: 'Personal, enthusiastic, cheerful and inviting', emoji: '😊' },
    { id: 'SHORT_PUNCHY', label: 'Short & Punchy', desc: 'Fast, energetic, high-impact review blurbs', emoji: '⚡' },
    { id: 'DETAILED', label: 'Detailed & Thorough', desc: 'Comprehensive, deep trust-building testimonials', emoji: '📝' },
  ];

  return (
    <div className="space-y-6 max-w-6xl pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              AI Review Engine Settings
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Review Generation Context & SEO Engine
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Define target keywords, key offerings, and tone of voice to guide AI review synthesis for customers tapping your NFC standee.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/portal/ai-standee"
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-700"
          >
            <Radio className="w-3.5 h-3.5 text-indigo-400" />
            Standee Hardware
          </Link>
          <Link
            href="/portal/feedback"
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-700"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Private Feedback Shield
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Context & Keyword Configuration (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-xl">
            {/* Section 1: Business Type & Category Context */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Business Specialty / Type</label>
              <input
                type="text"
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                placeholder="e.g. Dental Implant & Root Canal Center"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
              />
              <p className="text-[11px] text-slate-500">
                Helps the AI understand your domain and apply industry-specific terminology.
              </p>
            </div>

            {/* Section 2: Key Products & Offerings (Chips) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>Key Services & Offerings (Customer Review Aspects)</span>
                <span className="text-[10px] text-purple-400 font-semibold">{keyServices.length} Added</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newServiceInput}
                  onChange={(e) => setNewServiceInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddService())}
                  placeholder="Type service (e.g. Painless Root Canal) and press enter"
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                />
                <button
                  type="button"
                  onClick={handleAddService}
                  className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {keyServices.map((svc) => (
                  <span
                    key={svc}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-950/40 border border-purple-800/60 text-purple-200 text-xs font-medium"
                  >
                    {svc}
                    <button
                      type="button"
                      onClick={() => handleRemoveService(svc)}
                      className="text-purple-400 hover:text-rose-400"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Section 3: Target SEO Keywords */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>Target Google Maps SEO Keywords</span>
                <span className="text-[10px] text-emerald-400 font-semibold">Natural Injection</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newKeywordInput}
                  onChange={(e) => setNewKeywordInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddKeyword())}
                  placeholder="e.g. best dentist in Ranchi, affordable implants"
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={handleAddKeyword}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {targetKeywords.map((kw) => (
                  <span
                    key={kw}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-200 text-xs font-medium"
                  >
                    {kw}
                    <button
                      type="button"
                      onClick={() => handleRemoveKeyword(kw)}
                      className="text-emerald-400 hover:text-rose-400"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Section 4: Tone & Persona Selector */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <label className="text-xs font-bold text-slate-300">Tone & Review Persona</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {tones.map((t) => {
                  const active = tone === t.id;
                  return (
                    <div
                      key={t.id}
                      onClick={() => setTone(t.id)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        active
                          ? 'bg-purple-950/40 border-purple-500 ring-2 ring-purple-500/20 text-white shadow-md'
                          : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold flex items-center gap-1.5">
                          <span>{t.emoji}</span> {t.label}
                        </span>
                        {active && <span className="text-[10px] text-purple-400 font-bold">Selected</span>}
                      </div>
                      <p className="text-[11px] text-slate-400 leading-tight">{t.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Section 5: Custom Guidelines */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Custom Prompt Guidelines</label>
              <textarea
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                rows={2}
                placeholder="e.g. Emphasize doctor patience, hygienic environment, and zero hidden charges."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-purple-500 resize-none"
              />
            </div>

            {/* Save Button */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              {savedSuccess ? (
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Settings Saved Live!
                </span>
              ) : (
                <span className="text-[11px] text-slate-500">Changes apply immediately to public NFC scans.</span>
              )}

              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/20 transition-all flex items-center gap-2"
              >
                {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                {saving ? 'Saving...' : 'Save AI Settings'}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Live Mobile Preview Simulator (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl sticky top-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">Live Customer Mobile Simulator</h3>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold">
                Real-Time Preview
              </span>
            </div>

            {/* Smartphone Mockup Frame */}
            <div className="w-full max-w-[320px] mx-auto bg-slate-950 rounded-[36px] p-3 border-4 border-slate-800 shadow-2xl space-y-3 text-slate-100">
              {/* Phone Speaker Notch */}
              <div className="w-20 h-3.5 bg-slate-800 rounded-full mx-auto mb-2 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-slate-900 mr-2" />
                <div className="w-8 h-1 bg-slate-900 rounded-full" />
              </div>

              {/* Inner Mobile Card */}
              <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-3 text-center space-y-2">
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[9px] font-bold">
                  <ShieldCheck className="w-2.5 h-2.5" /> Verified Google Business
                </div>
                <h4 className="text-xs font-bold truncate text-white">{profile.businessName}</h4>
                <p className="text-[10px] text-slate-400">{businessType || profile.category} • {profile.city}</p>

                {/* Rating stars in preview */}
                <div className="flex justify-center gap-1 pt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setSimRating(star)}
                      className={`text-amber-400 p-0.5`}
                    >
                      <Star className={`w-4 h-4 ${star <= simRating ? 'fill-amber-400' : 'text-slate-700'}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Aspect Pills in preview */}
              {keyServices.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-slate-400 block uppercase">What did you like?</span>
                  <div className="flex flex-wrap gap-1">
                    {keyServices.slice(0, 4).map((svc) => {
                      const active = simSelectedServices.includes(svc);
                      return (
                        <button
                          key={svc}
                          type="button"
                          onClick={() => {
                            setSimSelectedServices(
                              active ? simSelectedServices.filter((s) => s !== svc) : [...simSelectedServices, svc]
                            );
                          }}
                          className={`text-[10px] px-2 py-0.5 rounded-lg transition-all ${
                            active ? 'bg-indigo-600 text-white font-bold' : 'bg-slate-900 text-slate-400'
                          }`}
                        >
                          {svc} {active ? '✓' : '+'}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Generated Review Preview Box */}
              <div className="bg-indigo-950/30 border border-indigo-500/40 rounded-2xl p-3 text-[11px] leading-relaxed text-slate-200">
                <div className="flex items-center gap-1.5 text-indigo-400 font-bold text-[10px] mb-1">
                  <Sparkles className="w-3 h-3" />
                  AI Suggested Review ({tone})
                </div>
                <p>{simReviewPreview}</p>
              </div>

              {/* Big CTA */}
              <button
                type="button"
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-[11px] flex items-center justify-center gap-1.5 shadow-md"
              >
                <Copy className="w-3 h-3" />
                Copy & Post on Google Maps
              </button>
            </div>

            <p className="text-[11px] text-slate-500 text-center mt-3">
              This interactive widget reflects what clients see upon NFC tap.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
