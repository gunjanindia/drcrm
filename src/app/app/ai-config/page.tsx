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
} from 'lucide-react';
import { GlobalAiPromptConfig } from '@/types';

export default function AdminAiConfigPage() {
  const [configs, setConfigs] = useState<GlobalAiPromptConfig[]>([]);
  const [selectedConfig, setSelectedConfig] = useState<GlobalAiPromptConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form states for selected config
  const [displayName, setDisplayName] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [seoKeywords, setSeoKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState('');
  const [fallbackReviews, setFallbackReviews] = useState<string[]>([]);
  const [fallbackInput, setFallbackInput] = useState('');

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/ai-config');
      if (res.ok) {
        const json = await res.json();
        const data: GlobalAiPromptConfig[] = json.data || json || [];
        setConfigs(data);
        if (data.length > 0 && !selectedConfig) {
          selectCategory(data[0]);
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
        isActive: selectedConfig.isActive ?? true,
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
                Master AI Review Engine Configuration
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  Global System Directives
                </span>
              </h1>
              <p className="text-sm text-slate-400 mt-0.5">
                Manage foundational prompt templates, SEO keyword injections, and zero-cost fallback generators by business category.
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
          {/* Category Selector Sidebar */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-purple-400" />
                  Industry Categories ({configs.length})
                </span>
              </div>
              <div className="space-y-1.5">
                {configs.map((cfg) => {
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
                      <div>
                        <div className="text-xs font-bold">{cfg.displayName || cfg.category}</div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                          {cfg.category} • {cfg.fallbackReviews?.length || 0} fallbacks
                        </div>
                      </div>
                      <ArrowRight
                        className={`w-4 h-4 transition-transform ${
                          isSelected ? 'text-purple-400 translate-x-0.5' : 'text-slate-600'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Prompt Editor & Rules Center */}
          <div className="lg:col-span-8 space-y-6">
            {selectedConfig ? (
              <div className="space-y-6">
                {/* Category Display Name */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-2">
                    <Database className="w-4 h-4 text-indigo-400" />
                    Display Name & Category Code
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:border-purple-500 focus:outline-none"
                      placeholder="Category Display Name"
                    />
                    <input
                      type="text"
                      disabled
                      value={selectedConfig.category}
                      className="bg-slate-950/50 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-500 font-mono"
                    />
                  </div>
                </div>

                {/* System Prompt Box */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-300 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      System Instruction / Prompt Persona
                    </label>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Category: {selectedConfig.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Defines the foundational instructions and constraints for formulating authentic local Google reviews.
                  </p>
                  <textarea
                    rows={5}
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
              <div className="p-12 text-center text-slate-500">
                Select a category from the left to configure AI prompts.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
