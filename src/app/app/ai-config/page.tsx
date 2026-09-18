'use client';

import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  Bot,
  Layers,
  Save,
  CheckCircle2,
  RefreshCw,
  Plus,
  Trash2,
  ShieldAlert,
  Sliders,
  Database,
  ArrowRight,
  X,
  Check,
  Search,
  Wand2,
  AlertTriangle,
  Building,
  Car,
  Dumbbell,
  GraduationCap,
  Scale,
  Camera,
  HeartPulse,
  Utensils,
  Scissors,
  Store,
} from 'lucide-react';
import { GlobalAiPromptConfig } from '@/types';

// Preset Industry Templates for 1-Click Fast Creation
const INDUSTRY_PRESETS = [
  {
    name: 'Automobile, Garages & Car Detailing',
    key: 'AUTOMOBILE_GARAGES',
    icon: Car,
    systemPrompt: 'Generate an authentic, satisfied 5-star vehicle owner review praising honest diagnostic advice, skilled mechanics, transparent repair estimates, punctual delivery, and spotless car wash & detailing.',
    seoKeywords: ['best car garage in Ranchi', 'car detailing studio', 'honest auto mechanic', 'bike servicing center', 'ceramic coating'],
    fallbackReviews: [
      'Top-notch vehicle servicing! The mechanics diagnosed the engine issue quickly and provided a completely honest cost estimate. Delivered right on time.',
      'Got my car detailed and serviced here. The interior cleaning and exterior polish are immaculate. Highly trustworthy garage!',
      'Very professional team with transparent pricing. No unnecessary parts pushed. Easily the best auto service workshop in town.',
    ],
  },
  {
    name: 'Gyms, Fitness Centers & Yoga Studios',
    key: 'GYM_FITNESS',
    icon: Dumbbell,
    systemPrompt: 'Generate an energetic, motivating 5-star member review highlighting state-of-the-art workout equipment, certified personal trainers, spotless clean locker rooms, motivating music, and genuine fitness results.',
    seoKeywords: ['best gym in Ranchi', 'certified personal trainer', 'weight loss fitness studio', 'crossfit workout', 'hygienic gym'],
    fallbackReviews: [
      'Incredible fitness center with modern imported equipment and top-tier certified trainers. The workout vibe is super energetic and motivating!',
      'Lost 8 kgs in 3 months with their personalized workout and diet guidance. The trainers are always attentive and encouraging.',
      'Spotlessly clean gym, great music, and spacious locker rooms. Best fitness club in the city for both beginners and pros!',
    ],
  },
  {
    name: 'Real Estate Builders & Interior Designers',
    key: 'REAL_ESTATE_INTERIOR',
    icon: Building,
    systemPrompt: 'Generate a credible, prestigious 5-star home buyer or client review praising turnkey project delivery, transparent documentation, premium building materials, aesthetic interior aesthetics, and zero hidden costs.',
    seoKeywords: ['best interior designer in Ranchi', 'trusted real estate builder', 'modern modular kitchen', 'turnkey home construction', 'luxury flat developers'],
    fallbackReviews: [
      'Exceptional interior design work! They turned our 3BHK flat into a dream home within our exact budget and timeline. Impeccable finishes.',
      'Very reliable builders with 100% legal clarity and transparent documentation. Delivered the property on schedule with premium construction quality.',
      'From 3D architectural renders to final modular woodwork, their attention to detail was flawless. Highly recommended design firm!',
    ],
  },
  {
    name: 'Coaching Institutes & EdTech Academies',
    key: 'EDUCATION_COACHING',
    icon: GraduationCap,
    systemPrompt: 'Generate a grateful, inspiring 5-star student or parent review praising expert faculty, conceptual doubt clearing sessions, comprehensive test series, disciplined study environment, and stellar exam results.',
    seoKeywords: ['best coaching institute in Ranchi', 'IIT JEE NEET preparation', 'expert faculty coaching', 'regular test series', 'top result academy'],
    fallbackReviews: [
      'Outstanding faculty and structured study material! The teachers clarify every single concept with patience. Best coaching institute for competitive exams.',
      'Enrolled my son here and saw a tremendous improvement in his test ranks. Regular parent-teacher updates and focused doubt clearing sessions.',
      'Disciplined study environment, high-yield practice mock tests, and truly dedicated mentors. Highly recommended for sincere students!',
    ],
  },
  {
    name: 'Legal, Tax Advisory & CA Financial Firms',
    key: 'LEGAL_FINANCIAL',
    icon: Scale,
    systemPrompt: 'Generate a formal, highly authoritative 5-star corporate client review highlighting prompt GST/ITR filing, meticulous compliance audits, honest advisory, and safeguarding business interests.',
    seoKeywords: ['top CA firm in Ranchi', 'GST tax consultant', 'company registration expert', 'income tax return filing', 'business audit advisory'],
    fallbackReviews: [
      'Extremely professional chartered accountancy firm. Managed our company registration and GST audits seamlessly without a single hitch.',
      'Prompt tax filing, meticulous attention to compliance, and very proactive financial advisory. Saved us significant time and money.',
      'Highly trustworthy advisors for business taxation and legal compliance. Five-star corporate consultation!',
    ],
  },
  {
    name: 'Photography, Media & Creative Studios',
    key: 'PHOTOGRAPHY_STUDIO',
    icon: Camera,
    systemPrompt: 'Generate an artistic, enthusiastic 5-star client review praising creative wedding cinematography, crisp portrait color grading, punctual photo album delivery, and comfortable studio photoshoot vibes.',
    seoKeywords: ['best wedding photographer in Ranchi', 'pre-wedding shoot studio', 'commercial video production', 'candid photography', 'cinematic film'],
    fallbackReviews: [
      'Captured our wedding moments so magically! The candid shots and cinematic video editing exceeded all our expectations. True artists!',
      'Very patient team during our pre-wedding shoot. Made us feel super comfortable in front of the camera and delivered the album ahead of time.',
      'Top-notch studio lighting and ultra-crisp 4K video output. Best creative media team in Jharkhand!',
    ],
  },
];

export default function AdminAiConfigPage() {
  const [configs, setConfigs] = useState<GlobalAiPromptConfig[]>([]);
  const [selectedConfig, setSelectedConfig] = useState<GlobalAiPromptConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form states for selected config
  const [displayName, setDisplayName] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [seoKeywords, setSeoKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState('');
  const [fallbackReviews, setFallbackReviews] = useState<string[]>([]);
  const [fallbackInput, setFallbackInput] = useState('');
  const [isActive, setIsActive] = useState(true);

  // New Category Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatKey, setNewCatKey] = useState('');
  const [newCatSystemPrompt, setNewCatSystemPrompt] = useState('');
  const [newCatKeywords, setNewCatKeywords] = useState<string[]>([]);
  const [newCatKeywordInput, setNewCatKeywordInput] = useState('');
  const [newCatFallbacks, setNewCatFallbacks] = useState<string[]>([]);
  const [newCatFallbackInput, setNewCatFallbackInput] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  // Delete State
  const [deleting, setDeleting] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/ai-config');
      if (res.ok) {
        const json = await res.json();
        const data: GlobalAiPromptConfig[] = json.data || json || [];
        setConfigs(data);
        if (data.length > 0) {
          if (!selectedConfig) {
            selectCategory(data[0]);
          } else {
            const current = data.find((c) => c.id === selectedConfig.id);
            if (current) selectCategory(current);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load global AI configs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  const selectCategory = (cfg: GlobalAiPromptConfig) => {
    setSelectedConfig(cfg);
    setDisplayName(cfg.displayName || cfg.category);
    setSystemPrompt(cfg.systemPrompt || '');
    setSeoKeywords(cfg.seoKeywords || []);
    setFallbackReviews(cfg.fallbackReviews || []);
    setIsActive(cfg.isActive ?? true);
  };

  const handleAddKeyword = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && keywordInput.trim()) {
      e.preventDefault();
      if (!seoKeywords.includes(keywordInput.trim())) {
        setSeoKeywords([...seoKeywords, keywordInput.trim()]);
      }
      setKeywordInput('');
    }
  };

  const removeKeyword = (idx: number) => {
    setSeoKeywords(seoKeywords.filter((_, i) => i !== idx));
  };

  const handleAddFallback = () => {
    if (fallbackInput.trim()) {
      setFallbackReviews([...fallbackReviews, fallbackInput.trim()]);
      setFallbackInput('');
    }
  };

  const removeFallback = (idx: number) => {
    setFallbackReviews(fallbackReviews.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    if (!selectedConfig) return;
    try {
      setSaving(true);
      const payload: Partial<GlobalAiPromptConfig> & { id: string } = {
        id: selectedConfig.id,
        category: selectedConfig.category,
        displayName,
        systemPrompt,
        seoKeywords,
        fallbackReviews,
        isActive,
        updatedAt: new Date().toISOString(),
      };

      const res = await fetch('/api/admin/ai-config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        const updatedFull = { ...selectedConfig, ...payload } as GlobalAiPromptConfig;
        setConfigs((prev) =>
          prev.map((c) => (c.id === selectedConfig.id ? updatedFull : c))
        );
        setSelectedConfig(updatedFull);
      }
    } catch (err) {
      console.error('Error updating prompt configuration', err);
    } finally {
      setSaving(false);
    }
  };

  const applyPreset = (preset: typeof INDUSTRY_PRESETS[0]) => {
    setNewCatName(preset.name);
    setNewCatKey(preset.key);
    setNewCatSystemPrompt(preset.systemPrompt);
    setNewCatKeywords(preset.seoKeywords);
    setNewCatFallbacks(preset.fallbackReviews);
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) {
      setCreateError('Please enter an industry category name');
      return;
    }

    try {
      setCreating(true);
      setCreateError('');

      const payload = {
        displayName: newCatName.trim(),
        category: newCatKey.trim() || newCatName.trim(),
        systemPrompt: newCatSystemPrompt.trim(),
        seoKeywords: newCatKeywords,
        fallbackReviews: newCatFallbacks,
        isActive: true,
      };

      const res = await fetch('/api/admin/ai-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success && data.data) {
        const created: GlobalAiPromptConfig = data.data;
        setConfigs((prev) => [...prev, created]);
        selectCategory(created);
        setIsModalOpen(false);
        resetModalForm();
      } else {
        setCreateError(data.error || 'Failed to create industry category');
      }
    } catch (err: any) {
      setCreateError(err.message || 'Network error occurred');
    } finally {
      setCreating(false);
    }
  };

  const resetModalForm = () => {
    setNewCatName('');
    setNewCatKey('');
    setNewCatSystemPrompt('');
    setNewCatKeywords([]);
    setNewCatKeywordInput('');
    setNewCatFallbacks([]);
    setNewCatFallbackInput('');
    setCreateError('');
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      setDeleting(true);
      const res = await fetch(`/api/admin/ai-config?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        const remaining = configs.filter((c) => c.id !== id);
        setConfigs(remaining);
        setConfirmDeleteId(null);
        if (remaining.length > 0) {
          selectCategory(remaining[0]);
        } else {
          setSelectedConfig(null);
        }
      }
    } catch (err) {
      console.error('Failed to delete category:', err);
    } finally {
      setDeleting(false);
    }
  };

  const filteredConfigs = configs.filter(
    (c) =>
      c.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                Agency Operations Command Center
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  Master AI Review Categories
                </span>
              </h1>
              <p className="text-sm text-slate-400 mt-0.5">
                Add and manage foundational prompt personas, SEO keywords, and offline review templates by business industry.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {saveSuccess && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-3 py-1.5 rounded-lg">
              <CheckCircle2 className="w-4 h-4" />
              <span>Prompt rules synced successfully</span>
            </div>
          )}
          <button
            type="button"
            onClick={() => {
              resetModalForm();
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/30"
          >
            <Plus className="w-4 h-4" />
            <span>Add Industry Category</span>
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !selectedConfig}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-lg shadow-purple-600/30 disabled:opacity-50"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Master Config</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-16 flex flex-col items-center justify-center text-slate-400 space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin text-purple-500" />
          <p className="text-sm font-medium">Loading category prompt templates...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Category Selector Sidebar (4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-purple-400" />
                  Industry Categories ({configs.length})
                </span>
                <button
                  onClick={() => {
                    resetModalForm();
                    setIsModalOpen(true);
                  }}
                  className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> New
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Filter categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* List */}
              <div className="space-y-1.5 max-h-[550px] overflow-y-auto pr-1">
                {filteredConfigs.map((cfg) => {
                  const isSelected = selectedConfig?.id === cfg.id;
                  return (
                    <button
                      key={cfg.id}
                      onClick={() => selectCategory(cfg)}
                      className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-purple-950/40 border-purple-500 text-white shadow-md shadow-purple-950/40 font-semibold'
                          : 'bg-slate-950/40 border-slate-800/80 text-slate-300 hover:border-slate-700 hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold truncate">{cfg.displayName || cfg.category}</div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">
                          {cfg.category} • {cfg.fallbackReviews?.length || 0} reviews
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 ml-2">
                        {cfg.isActive === false && (
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" title="Inactive" />
                        )}
                        <ArrowRight
                          className={`w-4 h-4 transition-transform ${
                            isSelected ? 'text-purple-400 translate-x-0.5' : 'text-slate-600'
                          }`}
                        />
                      </div>
                    </button>
                  );
                })}

                {filteredConfigs.length === 0 && (
                  <div className="p-4 text-center text-xs text-slate-500">
                    No categories found. Click "+ Add Industry Category" above to create one.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Category Detail & Prompt Editor (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            {selectedConfig ? (
              <div className="space-y-6">
                {/* Category Header Card */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
                          <Database className="w-4 h-4 text-indigo-400" />
                          Category Identity & System Directive
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono">
                          {selectedConfig.category}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsActive(!isActive)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold border transition-colors flex items-center gap-1.5 ${
                          isActive
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                        {isActive ? 'Active Category' : 'Inactive'}
                      </button>

                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(selectedConfig.id)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700 transition-colors"
                        title="Delete Industry Category"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Delete Confirmation Banner */}
                  {confirmDeleteId === selectedConfig.id && (
                    <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800 text-xs text-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                        <span>Are you sure you want to permanently delete this industry category?</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleDeleteCategory(selectedConfig.id)}
                          disabled={deleting}
                          className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
                        >
                          {deleting ? 'Deleting...' : 'Yes, Delete'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-3 py-1 rounded-lg bg-slate-800 text-slate-300 font-bold text-xs"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-400 mb-1 block">Display Name</label>
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:border-purple-500 focus:outline-none"
                        placeholder="Category Display Name"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-400 mb-1 block">Category Key Code</label>
                      <input
                        type="text"
                        disabled
                        value={selectedConfig.category}
                        className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-500 font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* System Prompt Persona */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-300 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      System Instruction / Review Generation Persona
                    </label>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Applied to all merchants in {displayName}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Defines instructions, credibility criteria, and domain voice for the AI when synthesizing customer reviews.
                  </p>
                  <textarea
                    rows={4}
                    value={systemPrompt}
                    onChange={(e) => setSystemPrompt(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 font-mono focus:border-purple-500 focus:outline-none leading-relaxed resize-y"
                    placeholder="Enter system prompt instruction..."
                  />
                </div>

                {/* Default SEO Keywords */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-300 flex items-center gap-2">
                      <Plus className="w-4 h-4 text-emerald-400" />
                      Default SEO Keywords for Category
                    </label>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Keywords automatically applied to newly onboarded merchants under this category.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {seoKeywords.map((kw, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-purple-950/60 text-purple-300 border border-purple-800/60"
                      >
                        {kw}
                        <button
                          type="button"
                          onClick={() => removeKeyword(idx)}
                          className="hover:text-rose-400"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onKeyDown={handleAddKeyword}
                    placeholder="Type keyword and hit Enter..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:border-purple-500 focus:outline-none"
                  />
                </div>

                {/* Fallback Review Template Bank */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-300 flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-amber-400" />
                      Offline & Zero-Credit Fallback Templates
                    </label>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      These templates are served if the Gemini API is unreachable or the merchant exhausts their monthly AI quota.
                    </p>
                  </div>

                  <div className="space-y-2">
                    {fallbackReviews.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-start justify-between gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300"
                      >
                        <span className="leading-relaxed flex-1 italic font-mono text-[11px]">
                          "{item}"
                        </span>
                        <button
                          type="button"
                          onClick={() => removeFallback(idx)}
                          className="text-slate-500 hover:text-rose-400 shrink-0 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={fallbackInput}
                      onChange={(e) => setFallbackInput(e.target.value)}
                      placeholder="Add fallback review template..."
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:border-purple-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddFallback}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all"
                    >
                      Add Template
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-16 text-center text-slate-500 border border-slate-800 rounded-2xl bg-slate-900">
                <Layers className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                <p className="text-sm font-semibold text-slate-300">No category selected</p>
                <p className="text-xs text-slate-500 mt-1">Select an industry category from the left or create a new one.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADD NEW INDUSTRY CATEGORY MODAL                                           */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl space-y-5 my-8">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Wand2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Add New Industry Category</h3>
                  <p className="text-xs text-slate-400">Configure prompt persona, SEO keywords, and offline fallbacks.</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="p-6 space-y-5 pt-0">
              {createError && (
                <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>{createError}</span>
                </div>
              )}

              {/* 1-Click Industry Presets */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  1-Click Industry Presets (Auto-Fill)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {INDUSTRY_PRESETS.map((preset) => {
                    const IconComp = preset.icon;
                    return (
                      <button
                        key={preset.key}
                        type="button"
                        onClick={() => applyPreset(preset)}
                        className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-indigo-500 text-left text-xs text-slate-300 hover:text-white transition-all flex items-center gap-2 group"
                      >
                        <IconComp className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform shrink-0" />
                        <span className="truncate text-[11px] font-medium">{preset.name.split(',')[0]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Name & Key */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Industry Category Name *</label>
                  <input
                    type="text"
                    required
                    value={newCatName}
                    onChange={(e) => {
                      setNewCatName(e.target.value);
                      if (!newCatKey || newCatKey === newCatName.toUpperCase().replace(/[^A-Z0-9]/g, '_')) {
                        setNewCatKey(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '_'));
                      }
                    }}
                    placeholder="e.g. Gym & Fitness Centers"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Category Identifier Code</label>
                  <input
                    type="text"
                    value={newCatKey}
                    onChange={(e) => setNewCatKey(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '_'))}
                    placeholder="e.g. GYM_FITNESS"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* System Prompt */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">System Instruction / Prompt Persona</label>
                <textarea
                  rows={3}
                  value={newCatSystemPrompt}
                  onChange={(e) => setNewCatSystemPrompt(e.target.value)}
                  placeholder="Generate authentic 5-star customer reviews praising..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500 resize-y"
                />
              </div>

              {/* Default SEO Keywords */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300">Default SEO Keywords</label>
                <div className="flex flex-wrap gap-1.5">
                  {newCatKeywords.map((kw, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs bg-indigo-950/60 text-indigo-300 border border-indigo-800"
                    >
                      {kw}
                      <button
                        type="button"
                        onClick={() => setNewCatKeywords(newCatKeywords.filter((_, i) => i !== idx))}
                        className="hover:text-rose-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCatKeywordInput}
                    onChange={(e) => setNewCatKeywordInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newCatKeywordInput.trim()) {
                        e.preventDefault();
                        if (!newCatKeywords.includes(newCatKeywordInput.trim())) {
                          setNewCatKeywords([...newCatKeywords, newCatKeywordInput.trim()]);
                        }
                        setNewCatKeywordInput('');
                      }
                    }}
                    placeholder="Type keyword and press Enter..."
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newCatKeywordInput.trim() && !newCatKeywords.includes(newCatKeywordInput.trim())) {
                        setNewCatKeywords([...newCatKeywords, newCatKeywordInput.trim()]);
                        setNewCatKeywordInput('');
                      }
                    }}
                    className="px-3 py-1.5 bg-slate-800 text-xs font-bold text-slate-300 rounded-xl hover:bg-slate-700"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Fallback Reviews */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300">Fallback Review Templates ({newCatFallbacks.length})</label>
                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                  {newCatFallbacks.map((fb, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono text-[11px]"
                    >
                      <span className="truncate">{fb}</span>
                      <button
                        type="button"
                        onClick={() => setNewCatFallbacks(newCatFallbacks.filter((_, i) => i !== idx))}
                        className="text-slate-500 hover:text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCatFallbackInput}
                    onChange={(e) => setNewCatFallbackInput(e.target.value)}
                    placeholder="Add sample 5-star review..."
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newCatFallbackInput.trim()) {
                        setNewCatFallbacks([...newCatFallbacks, newCatFallbackInput.trim()]);
                        setNewCatFallbackInput('');
                      }
                    }}
                    className="px-3 py-1.5 bg-slate-800 text-xs font-bold text-slate-300 rounded-xl hover:bg-slate-700"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !newCatName.trim()}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/30 disabled:opacity-50 flex items-center gap-2"
                >
                  {creating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>Create Industry Category</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
