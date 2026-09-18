'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Wrench,
  HelpCircle,
  Palette,
  ArrowRight,
  Globe,
  Star,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { Button, Modal, Badge } from '@/components/ui';
import { CategoryTemplateData } from './CategoryTemplateEditorModal';
import confetti from 'canvas-confetti';

export interface GeminiGbpTemplateGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTemplateGenerated: (generatedTemplate: CategoryTemplateData) => void;
}

export const GeminiGbpTemplateGeneratorModal: React.FC<GeminiGbpTemplateGeneratorModalProps> = ({
  isOpen,
  onClose,
  onTemplateGenerated,
}) => {
  const [businessName, setBusinessName] = useState('');
  const [category, setCategory] = useState('');
  const [city, setCity] = useState('');
  const [description, setDescription] = useState('');
  const [reviewsSummary, setReviewsSummary] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<CategoryTemplateData | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category.trim()) {
      alert('Please specify a business category.');
      return;
    }

    setIsGenerating(true);
    setGeneratedResult(null);

    try {
      const res = await fetch('/api/admin/templates/generate-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName,
          category,
          city,
          description,
          reviewsSummary,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.data) {
        setGeneratedResult({
          ...data.data,
          isAiGenerated: true,
          isCustom: true,
        });

        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch {}
      } else {
        alert(data.error || 'Failed to generate template with Gemini AI.');
      }
    } catch (err: any) {
      console.error('Error in Gemini generation:', err);
      alert(err.message || 'Error communicating with Gemini AI generator.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplyGenerated = () => {
    if (generatedResult) {
      onTemplateGenerated(generatedResult);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Generate Category Template from GBP with Gemini AI"
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {/* Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-violet-950/60 via-purple-900/40 to-indigo-950 border border-violet-500/30 flex items-center justify-between gap-3 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-violet-500/20 text-violet-400 border border-violet-500/30 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-violet-400 block tracking-wider">
                Powered by Google Gemini AI
              </span>
              <h4 className="font-black text-sm text-white">
                Autonomous One-Page Website Template Synthesis
              </h4>
              <p className="text-[11px] text-slate-300">
                Input your Google Business Profile info to synthesize custom color themes, high-converting CTAs, 6 bespoke service packages, and localized FAQs.
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-violet-500/20 text-violet-300 border border-violet-500/30 shrink-0">
            ✨ AI Ready
          </span>
        </div>

        {/* Input Form */}
        {!generatedResult && (
          <form onSubmit={handleGenerate} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Target Business Name</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Life in Lights Academy"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">GBP Primary Category *</label>
                <input
                  type="text"
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. Photography Academy & Studio"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Target City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Dhanbad"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">
                GBP Business Description & Key Specialties
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Paste key business services, equipment, certifications, or USP..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">
                Customer Reviews Summary / Reputation
              </label>
              <input
                type="text"
                value={reviewsSummary}
                onChange={(e) => setReviewsSummary(e.target.value)}
                placeholder="e.g. 4.9 stars across 30 reviews. Praise for friendly staff and quick service."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                isLoading={isGenerating}
                icon={Sparkles}
                className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold"
              >
                {isGenerating ? 'Synthesizing with Gemini AI...' : 'Generate High-Converting Template'}
              </Button>
            </div>
          </form>
        )}

        {/* AI Result Review */}
        {generatedResult && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                <div>
                  <strong className="text-slate-900 dark:text-white font-black text-sm block">
                    Template Synthesized for {generatedResult.name} ({generatedResult.categoryKey})
                  </strong>
                  <span className="text-slate-500 text-[11px]">
                    Includes {generatedResult.defaultServices?.length || 6} custom service packages and {generatedResult.defaultFaqs?.length || 4} localized FAQs.
                  </span>
                </div>
              </div>
              <button
                onClick={() => setGeneratedResult(null)}
                className="text-xs text-indigo-600 font-bold hover:underline"
              >
                Regenerate
              </button>
            </div>

            {/* Overview Card */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: generatedResult.accentColor }}
                  />
                  <span className="font-bold text-slate-900 dark:text-white">
                    {generatedResult.headlineTemplate.replace('{city}', city)}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {generatedResult.badgeText}
                </span>
              </div>

              <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                {generatedResult.subheadlineTemplate.replace('{city}', city)}
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                <span className="px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold">
                  Primary CTA: {generatedResult.primaryCtaText} ({generatedResult.primaryCtaType})
                </span>
                <span className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">
                  Secondary CTA: {generatedResult.secondaryCtaText} ({generatedResult.secondaryCtaType})
                </span>
              </div>
            </div>

            {/* Sample Services List */}
            <div className="space-y-2">
              <span className="font-bold text-slate-900 dark:text-white">Generated Service Packages:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {generatedResult.defaultServices?.slice(0, 4).map((s, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60"
                  >
                    <div className="flex justify-between items-center">
                      <strong className="text-slate-900 dark:text-white text-xs">{s.title}</strong>
                      <span className="text-[10px] font-bold text-emerald-600">{s.price}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-800">
              <Button type="button" variant="outline" onClick={onClose}>
                Discard
              </Button>

              <Button
                type="button"
                icon={CheckCircle2}
                onClick={handleApplyGenerated}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              >
                Review & Open in Editor
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
