'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Globe,
  Sparkles,
  Plus,
  Search,
  Filter,
  Palette,
  Wrench,
  HelpCircle,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Eye,
  RefreshCw,
  Layout,
  ExternalLink,
  Layers,
  Zap,
} from 'lucide-react';
import { Button, Badge, Modal } from '@/components/ui';
import {
  CategoryTemplateEditorModal,
  CategoryTemplateData,
} from '@/components/admin/CategoryTemplateEditorModal';
import { GeminiGbpTemplateGeneratorModal } from '@/components/admin/GeminiGbpTemplateGeneratorModal';

export default function SuperAdminTemplatesPage() {
  const [templates, setTemplates] = useState<CategoryTemplateData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'custom' | 'builtin' | 'ai'>('all');

  // Modals
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<CategoryTemplateData | null>(null);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const fetchTemplates = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/templates');
      const data = await res.json();
      if (res.ok && data.data) {
        setTemplates(data.data);
      }
    } catch (e) {
      console.error('Failed to load category templates:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleSaveTemplate = async (savedData: CategoryTemplateData) => {
    const res = await fetch('/api/admin/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(savedData),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to save template');
    }
    await fetchTemplates();
  };

  const handleDeleteTemplate = async (categoryKey: string, id?: string) => {
    if (!confirm(`Are you sure you want to delete / reset the template for "${categoryKey}"?`)) {
      return;
    }

    setIsDeleting(categoryKey);
    try {
      const res = await fetch(`/api/admin/templates?categoryKey=${encodeURIComponent(categoryKey)}&id=${encodeURIComponent(id || '')}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        await fetchTemplates();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete template');
      }
    } catch (e: any) {
      alert(e.message || 'Error deleting template');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleOpenAiGenerator = () => {
    setIsAiModalOpen(true);
  };

  const handleTemplateGeneratedByAi = (generatedTemplate: CategoryTemplateData) => {
    setEditingTemplate(generatedTemplate);
    setIsEditorOpen(true);
  };

  const filteredTemplates = useMemo(() => {
    return templates.filter((t) => {
      const matchesSearch =
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.categoryKey.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.taglineDefault && t.taglineDefault.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      if (filterType === 'custom') return t.isCustom;
      if (filterType === 'builtin') return !t.isCustom;
      if (filterType === 'ai') return t.isAiGenerated;
      return true;
    });
  }, [templates, searchQuery, filterType]);

  const customCount = templates.filter((t) => t.isCustom).length;
  const aiCount = templates.filter((t) => t.isAiGenerated).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Hero Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
              <Layers className="w-3.5 h-3.5" />
              One-Page Website Engine Hub
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-white/10 text-slate-200 border border-white/15">
              Super Admin Management
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Category & Website Templates
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Create and edit industry-specific conversion funnels for client One-Page Websites. Customize default services, localized FAQs, colors, and generate production templates from Google Business Profiles using Gemini AI.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Button
            variant="outline"
            size="sm"
            icon={Sparkles}
            onClick={handleOpenAiGenerator}
            className="bg-gradient-to-r from-violet-600/30 to-indigo-600/30 hover:bg-violet-600/40 border-violet-500/40 text-violet-200 font-bold"
          >
            ✨ Generate with Gemini AI
          </Button>

          <Button
            size="sm"
            icon={Plus}
            onClick={() => {
              setEditingTemplate(null);
              setIsEditorOpen(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
          >
            New Category Template
          </Button>
        </div>
      </div>

      {/* Stats Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Templates</span>
          <span className="text-2xl font-black text-slate-900 dark:text-white">{templates.length}</span>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 block">Custom Admin Templates</span>
          <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{customCount}</span>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-violet-500 block">AI-Synthesized</span>
          <span className="text-2xl font-black text-violet-600 dark:text-violet-400">{aiCount}</span>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 block">Built-in Presets</span>
          <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{templates.length - customCount}</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search category name, key (e.g. FABRICATION), or keywords..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              filterType === 'all'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            All ({templates.length})
          </button>
          <button
            onClick={() => setFilterType('custom')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              filterType === 'custom'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            Custom ({customCount})
          </button>
          <button
            onClick={() => setFilterType('ai')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              filterType === 'ai'
                ? 'bg-violet-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            AI Generated ({aiCount})
          </button>
          <button
            onClick={() => setFilterType('builtin')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              filterType === 'builtin'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            Built-in ({templates.length - customCount})
          </button>
        </div>
      </div>

      {/* Templates Grid */}
      {isLoading ? (
        <div className="py-20 text-center space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-indigo-500" />
          <p className="text-xs text-slate-400">Loading category templates...</p>
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="py-16 text-center space-y-4 rounded-3xl bg-slate-50 dark:bg-slate-900/40 border border-dashed border-slate-300 dark:border-slate-800 p-8">
          <Layers className="w-10 h-10 text-slate-400 mx-auto" />
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">No Category Templates Found</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              {searchQuery
                ? `No templates match "${searchQuery}". Try a different keyword.`
                : 'Get started by creating a new category template or synthesizing one from Google Business Profile data using Gemini AI.'}
            </p>
          </div>
          <div className="flex justify-center gap-3">
            <Button size="sm" icon={Sparkles} onClick={handleOpenAiGenerator}>
              Generate with Gemini AI
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={Plus}
              onClick={() => {
                setEditingTemplate(null);
                setIsEditorOpen(true);
              }}
            >
              Create Manually
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTemplates.map((t) => (
            <div
              key={t.categoryKey}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-4 relative overflow-hidden group"
            >
              {/* Top Bar */}
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className="w-3 h-3 rounded-full shrink-0 shadow-xs"
                      style={{ backgroundColor: t.accentColor }}
                    />
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {t.categoryKey}
                    </span>
                    {t.isAiGenerated && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-violet-500/15 text-violet-600 dark:text-violet-400 border border-violet-500/30 flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5" />
                        AI Generated
                      </span>
                    )}
                    {t.isCustom && !t.isAiGenerated && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30">
                        Custom
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-black text-base text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {t.name}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                    {t.taglineDefault || t.subheadlineTemplate}
                  </p>
                </div>

                {/* Hero Headline Sample Box */}
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/80 text-[11px] space-y-1">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">
                    Hero Headline
                  </span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 line-clamp-2">
                    {t.headlineTemplate}
                  </p>
                </div>

                {/* Counts & CTA Pills */}
                <div className="flex flex-wrap items-center gap-2 pt-1 text-[10px]">
                  <span className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                    <Wrench className="w-3 h-3 text-indigo-500" />
                    {t.defaultServices?.length || 0} Services
                  </span>
                  <span className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                    <HelpCircle className="w-3 h-3 text-amber-500" />
                    {t.defaultFaqs?.length || 0} FAQs
                  </span>
                  <span className="px-2 py-1 rounded-xl font-bold text-white text-[10px]" style={{ backgroundColor: t.accentColor }}>
                    CTA: {t.primaryCtaText}
                  </span>
                </div>
              </div>

              {/* Bottom Card Controls */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  icon={Edit2}
                  onClick={() => {
                    setEditingTemplate(t);
                    setIsEditorOpen(true);
                  }}
                  className="flex-1 text-xs"
                >
                  Edit Template
                </Button>

                {t.isCustom && (
                  <button
                    onClick={() => handleDeleteTemplate(t.categoryKey, t.id)}
                    disabled={isDeleting === t.categoryKey}
                    className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                    title="Delete / Reset Template"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Template Editor Modal */}
      {isEditorOpen && (
        <CategoryTemplateEditorModal
          isOpen={isEditorOpen}
          onClose={() => {
            setIsEditorOpen(false);
            setEditingTemplate(null);
          }}
          template={editingTemplate}
          onSave={handleSaveTemplate}
        />
      )}

      {/* Gemini AI Generator Modal */}
      {isAiModalOpen && (
        <GeminiGbpTemplateGeneratorModal
          isOpen={isAiModalOpen}
          onClose={() => setIsAiModalOpen(false)}
          onTemplateGenerated={handleTemplateGeneratedByAi}
        />
      )}
    </div>
  );
}
