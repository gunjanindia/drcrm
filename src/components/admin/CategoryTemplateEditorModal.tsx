'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Edit2,
  Save,
  Globe,
  Palette,
  Layout,
  HelpCircle,
  Wrench,
  Eye,
  ArrowRight,
  Phone,
  MessageSquare,
  Star,
  Check,
  Zap,
} from 'lucide-react';
import { Button, Modal, Badge } from '@/components/ui';

export interface CategoryTemplateData {
  id?: string;
  categoryKey: string;
  name: string;
  taglineDefault: string;
  headlineTemplate: string;
  subheadlineTemplate: string;
  primaryCtaText: string;
  primaryCtaType: 'whatsapp' | 'call' | 'book' | 'quote' | 'menu';
  secondaryCtaText: string;
  secondaryCtaType: 'call' | 'whatsapp' | 'directions' | 'gallery' | 'services';
  accentColor: string;
  accentBg: string;
  gradient: string;
  badgeText: string;
  servicesTitle: string;
  servicesSubtitle: string;
  galleryTitle: string;
  trustTitle: string;
  defaultServices: Array<{ title: string; desc: string; price?: string; badge?: string }>;
  defaultFaqs: Array<{ q: string; a: string }>;
  defaultGalleryImages?: Array<{ title: string; category: string; aspect: string }>;
  customCss?: string;
  isCustom?: boolean;
  isAiGenerated?: boolean;
}

export interface CategoryTemplateEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  template?: CategoryTemplateData | null;
  onSave: (savedData: CategoryTemplateData) => Promise<void>;
}

const GRADIENT_PRESETS = [
  { label: 'Slate Dark (Universal)', value: 'from-slate-950 via-slate-900 to-slate-950' },
  { label: 'Midnight Blue (Corporate & Health)', value: 'from-slate-950 via-blue-950 to-slate-950' },
  { label: 'Indigo Velvet (Tech & Modern)', value: 'from-slate-950 via-indigo-950 to-slate-950' },
  { label: 'Deep Purple (Creative & Photo)', value: 'from-stone-950 via-purple-950 to-stone-950' },
  { label: 'Gourmet Rose (Dining & Salon)', value: 'from-stone-950 via-rose-950 to-stone-950' },
  { label: 'Emerald Forest (Nature & Estate)', value: 'from-slate-950 via-emerald-950 to-slate-950' },
  { label: 'Amber Luxe (Jewelry & Premium)', value: 'from-stone-950 via-amber-950 to-stone-950' },
  { label: 'Automotive Red (Garage & Speed)', value: 'from-stone-950 via-zinc-900 to-stone-950' },
];

export const CategoryTemplateEditorModal: React.FC<CategoryTemplateEditorModalProps> = ({
  isOpen,
  onClose,
  template,
  onSave,
}) => {
  const [activeTab, setActiveTab] = useState<'branding' | 'hero' | 'services' | 'faqs' | 'preview'>('branding');
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [categoryKey, setCategoryKey] = useState('');
  const [taglineDefault, setTaglineDefault] = useState('');
  const [headlineTemplate, setHeadlineTemplate] = useState('');
  const [subheadlineTemplate, setSubheadlineTemplate] = useState('');
  const [primaryCtaText, setPrimaryCtaText] = useState('Get Free Quote');
  const [primaryCtaType, setPrimaryCtaType] = useState<'whatsapp' | 'call' | 'book' | 'quote' | 'menu'>('whatsapp');
  const [secondaryCtaText, setSecondaryCtaText] = useState('Call Directly');
  const [secondaryCtaType, setSecondaryCtaType] = useState<'call' | 'whatsapp' | 'directions' | 'gallery' | 'services'>('call');
  const [accentColor, setAccentColor] = useState('#4f46e5');
  const [accentBg, setAccentBg] = useState('bg-indigo-600');
  const [gradient, setGradient] = useState('from-slate-950 via-indigo-950 to-slate-950');
  const [badgeText, setBadgeText] = useState('Verified Local Business');
  const [servicesTitle, setServicesTitle] = useState('Our Professional Services');
  const [servicesSubtitle, setServicesSubtitle] = useState('Tailored solutions delivered with precision.');
  const [galleryTitle, setGalleryTitle] = useState('Our Work & Showcase');
  const [trustTitle, setTrustTitle] = useState('Why Choose Us');
  const [services, setServices] = useState<Array<{ title: string; desc: string; price?: string; badge?: string }>>([]);
  const [faqs, setFaqs] = useState<Array<{ q: string; a: string }>>([]);

  // Load template into form
  useEffect(() => {
    if (template) {
      setName(template.name || '');
      setCategoryKey(template.categoryKey || '');
      setTaglineDefault(template.taglineDefault || '');
      setHeadlineTemplate(template.headlineTemplate || '');
      setSubheadlineTemplate(template.subheadlineTemplate || '');
      setPrimaryCtaText(template.primaryCtaText || 'Get Free Quote');
      setPrimaryCtaType(template.primaryCtaType || 'whatsapp');
      setSecondaryCtaText(template.secondaryCtaText || 'Call Directly');
      setSecondaryCtaType(template.secondaryCtaType || 'call');
      setAccentColor(template.accentColor || '#4f46e5');
      setAccentBg(template.accentBg || 'bg-indigo-600');
      setGradient(template.gradient || 'from-slate-950 via-indigo-950 to-slate-950');
      setBadgeText(template.badgeText || 'Verified Local Business');
      setServicesTitle(template.servicesTitle || 'Our Professional Services');
      setServicesSubtitle(template.servicesSubtitle || 'Tailored solutions delivered with precision.');
      setGalleryTitle(template.galleryTitle || 'Our Work & Showcase');
      setTrustTitle(template.trustTitle || 'Why Choose Us');
      setServices(template.defaultServices || []);
      setFaqs(template.defaultFaqs || []);
    } else {
      // Defaults for brand new template
      setName('');
      setCategoryKey('');
      setTaglineDefault('Quality Service • Verified Standards • Direct Support');
      setHeadlineTemplate('Dedicated {name} Services in {city}');
      setSubheadlineTemplate('Providing professional local solutions with verified customer satisfaction.');
      setPrimaryCtaText('Request Free Quote');
      setPrimaryCtaType('whatsapp');
      setSecondaryCtaText('Call Desk');
      setSecondaryCtaType('call');
      setAccentColor('#0284c7');
      setAccentBg('bg-sky-600');
      setGradient('from-slate-950 via-slate-900 to-slate-950');
      setBadgeText('Verified Google Business');
      setServicesTitle('Our Core Services & Solutions');
      setServicesSubtitle('Specialized services designed to exceed expectations.');
      setGalleryTitle('Our Work Highlights');
      setTrustTitle('Why Choose Us');
      setServices([
        { title: 'Primary Specialized Service', desc: 'Comprehensive execution using verified standards and quality materials.', price: '₹999 onwards', badge: 'Most Popular' },
        { title: 'Consultation & Diagnostics', desc: 'Personalized evaluation to guide you towards the best possible solution.', price: 'Free' },
        { title: 'Full Package Service', desc: 'End-to-end priority service with complete warranty and follow-up support.', price: 'Custom Quote' },
      ]);
      setFaqs([
        { q: 'How do I book an appointment or order?', a: 'Tap the WhatsApp button or call us directly. We respond promptly during working hours.' },
        { q: 'Do you provide transparent pricing?', a: 'Yes, all prices are confirmed upfront with zero hidden charges.' },
      ]);
    }
  }, [template, isOpen]);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!template) {
      setCategoryKey(val.toUpperCase().replace(/[^A-Z0-9]/g, '_').slice(0, 24));
    }
  };

  const handleAddService = () => {
    setServices([
      ...services,
      { title: 'New Service Item', desc: 'Description of service benefits and coverage.', price: 'Standard Rates', badge: 'New' },
    ]);
  };

  const handleUpdateService = (index: number, field: string, value: string) => {
    const updated = [...services];
    updated[index] = { ...updated[index], [field]: value };
    setServices(updated);
  };

  const handleDeleteService = (index: number) => {
    setServices(services.filter((_, i) => i !== index));
  };

  const handleAddFaq = () => {
    setFaqs([
      ...faqs,
      { q: 'New frequently asked question?', a: 'Clear, reassuring answer for local customers.' },
    ]);
  };

  const handleUpdateFaq = (index: number, field: 'q' | 'a', value: string) => {
    const updated = [...faqs];
    updated[index] = { ...updated[index], [field]: value };
    setFaqs(updated);
  };

  const handleDeleteFaq = (index: number) => {
    setFaqs(faqs.filter((_, i) => i !== index));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !categoryKey.trim()) {
      alert('Please provide a Category Name and Category Key.');
      return;
    }

    setIsSaving(true);
    try {
      await onSave({
        id: template?.id,
        categoryKey: categoryKey.toUpperCase().replace(/[^A-Z0-9_]/g, '_').trim(),
        name: name.trim(),
        taglineDefault: taglineDefault.trim(),
        headlineTemplate: headlineTemplate.trim(),
        subheadlineTemplate: subheadlineTemplate.trim(),
        primaryCtaText,
        primaryCtaType,
        secondaryCtaText,
        secondaryCtaType,
        accentColor,
        accentBg,
        gradient,
        badgeText,
        servicesTitle,
        servicesSubtitle,
        galleryTitle,
        trustTitle,
        defaultServices: services,
        defaultFaqs: faqs,
        isCustom: true,
        isAiGenerated: template?.isAiGenerated || false,
      });
      onClose();
    } catch (err: any) {
      console.error('Failed to save category template:', err);
      alert(err.message || 'Failed to save category template.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={template ? `Edit Template: ${template.name}` : 'Create New Category Template'}
      maxWidth="2xl"
    >
      <form onSubmit={handleFormSubmit} className="space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('branding')}
            className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all ${
              activeTab === 'branding'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Palette className="w-4 h-4" />
            Branding & Theme
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('hero')}
            className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all ${
              activeTab === 'hero'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Layout className="w-4 h-4" />
            Hero & CTAs
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('services')}
            className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all ${
              activeTab === 'services'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Wrench className="w-4 h-4" />
            Services ({services.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('faqs')}
            className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all ${
              activeTab === 'faqs'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            FAQs ({faqs.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all ${
              activeTab === 'preview'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Eye className="w-4 h-4" />
            Live Preview
          </button>
        </div>

        {/* Tab 1: Branding & Theme */}
        {activeTab === 'branding' && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Category Display Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Aluminum & Glass Fabrication"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Category Unique Key *</label>
                <input
                  type="text"
                  required
                  value={categoryKey}
                  onChange={(e) => setCategoryKey(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '_'))}
                  placeholder="e.g. FABRICATION"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-slate-900 dark:text-white uppercase"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Default Tagline</label>
              <input
                type="text"
                value={taglineDefault}
                onChange={(e) => setTaglineDefault(e.target.value)}
                placeholder="e.g. Precision Engineering • Premium Quality • Timely Execution"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Accent Color (Hex)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-10 h-10 rounded-xl cursor-pointer border-0 bg-transparent"
                  />
                  <input
                    type="text"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="font-bold text-slate-700 dark:text-slate-300">Hero Trust Badge Text</label>
                <input
                  type="text"
                  value={badgeText}
                  onChange={(e) => setBadgeText(e.target.value)}
                  placeholder="e.g. Architectural & Industrial Grade Quality"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Hero Gradient Atmosphere</label>
              <select
                value={gradient}
                onChange={(e) => setGradient(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs"
              >
                {GRADIENT_PRESETS.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label} ({g.value})
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Tab 2: Hero & CTAs */}
        {activeTab === 'hero' && (
          <div className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">
                Headline Template <span className="text-slate-400 font-normal">(Tokens: {'{name}'}, {'{city}'})</span>
              </label>
              <input
                type="text"
                required
                value={headlineTemplate}
                onChange={(e) => setHeadlineTemplate(e.target.value)}
                placeholder="e.g. Expert Aluminum, Toughened Glass & Architectural Glazing in {city}"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Subheadline Template</label>
              <textarea
                rows={3}
                required
                value={subheadlineTemplate}
                onChange={(e) => setSubheadlineTemplate(e.target.value)}
                placeholder="e.g. Specialized in structural glazing, sliding windows, and architectural elevation partitions. Verified on Google Maps."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Primary CTA */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
                <span className="font-bold text-slate-900 dark:text-white block">Primary High-Intent CTA</span>
                <div className="space-y-1">
                  <label className="text-slate-500 text-[11px]">Button Label</label>
                  <input
                    type="text"
                    value={primaryCtaText}
                    onChange={(e) => setPrimaryCtaText(e.target.value)}
                    placeholder="e.g. Request Free Quote"
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-500 text-[11px]">Action Type</label>
                  <select
                    value={primaryCtaType}
                    onChange={(e) => setPrimaryCtaType(e.target.value as any)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  >
                    <option value="whatsapp">Open WhatsApp Chat</option>
                    <option value="call">Call Phone Number</option>
                    <option value="book">Book Appointment</option>
                    <option value="quote">Request Instant Quote</option>
                    <option value="menu">View Menu / Price List</option>
                  </select>
                </div>
              </div>

              {/* Secondary CTA */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
                <span className="font-bold text-slate-900 dark:text-white block">Secondary CTA</span>
                <div className="space-y-1">
                  <label className="text-slate-500 text-[11px]">Button Label</label>
                  <input
                    type="text"
                    value={secondaryCtaText}
                    onChange={(e) => setSecondaryCtaText(e.target.value)}
                    placeholder="e.g. Call Fabricator Directly"
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-500 text-[11px]">Action Type</label>
                  <select
                    value={secondaryCtaType}
                    onChange={(e) => setSecondaryCtaType(e.target.value as any)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  >
                    <option value="call">Call Phone Number</option>
                    <option value="whatsapp">Open WhatsApp Chat</option>
                    <option value="directions">Google Maps Directions</option>
                    <option value="services">Scroll to Services</option>
                    <option value="gallery">Scroll to Gallery</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Services Section Title</label>
                <input
                  type="text"
                  value={servicesTitle}
                  onChange={(e) => setServicesTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Services Section Subtitle</label>
                <input
                  type="text"
                  value={servicesSubtitle}
                  onChange={(e) => setServicesSubtitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Services CRUD */}
        {activeTab === 'services' && (
          <div className="space-y-4 text-xs">
            <div className="flex justify-between items-center">
              <p className="text-slate-500">
                Configure default service packages generated for local businesses in this category.
              </p>
              <Button type="button" size="sm" icon={Plus} onClick={handleAddService}>
                Add Service Item
              </Button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {services.map((srv, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">
                      Service #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteService(idx)}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                      title="Delete Service"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-slate-500 text-[11px]">Service Title</label>
                      <input
                        type="text"
                        value={srv.title}
                        onChange={(e) => handleUpdateService(idx, 'title', e.target.value)}
                        placeholder="Service Name"
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-500 text-[11px]">Price / Rate</label>
                      <input
                        type="text"
                        value={srv.price || ''}
                        onChange={(e) => handleUpdateService(idx, 'price', e.target.value)}
                        placeholder="e.g. ₹999 / Custom Quote"
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-slate-500 text-[11px]">Description</label>
                      <input
                        type="text"
                        value={srv.desc}
                        onChange={(e) => handleUpdateService(idx, 'desc', e.target.value)}
                        placeholder="Detailed service scope..."
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-500 text-[11px]">Badge (Optional)</label>
                      <input
                        type="text"
                        value={srv.badge || ''}
                        onChange={(e) => handleUpdateService(idx, 'badge', e.target.value)}
                        placeholder="e.g. Most Popular / High Demand"
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: FAQs CRUD */}
        {activeTab === 'faqs' && (
          <div className="space-y-4 text-xs">
            <div className="flex justify-between items-center">
              <p className="text-slate-500">
                Configure default localized FAQs that answer high-intent customer questions for this category.
              </p>
              <Button type="button" size="sm" icon={Plus} onClick={handleAddFaq}>
                Add FAQ
              </Button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">
                      FAQ #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteFaq(idx)}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                      title="Delete FAQ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-500 text-[11px]">Question</label>
                    <input
                      type="text"
                      value={faq.q}
                      onChange={(e) => handleUpdateFaq(idx, 'q', e.target.value)}
                      placeholder="Frequently asked question..."
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-500 text-[11px]">Answer</label>
                    <textarea
                      rows={2}
                      value={faq.a}
                      onChange={(e) => handleUpdateFaq(idx, 'a', e.target.value)}
                      placeholder="Clear, authoritative answer..."
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: Live Preview */}
        {activeTab === 'preview' && (
          <div className="space-y-4 text-xs">
            <div className="p-6 rounded-3xl bg-slate-950 text-white border border-slate-800 space-y-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-72 h-72 rounded-full blur-3xl opacity-20 pointer-events-none" style={{ backgroundColor: accentColor }} />

              {/* Sample Header */}
              <div className="flex justify-between items-center border-b border-slate-800/80 pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-white" style={{ backgroundColor: accentColor }}>
                    {name.charAt(0) || 'B'}
                  </div>
                  <div>
                    <span className="font-black text-sm block tracking-tight">{name || 'Business Name'}</span>
                    <span className="text-[10px] text-slate-400">{taglineDefault}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold text-white flex items-center gap-1" style={{ backgroundColor: accentColor }}>
                    <MessageSquare className="w-3 h-3" />
                    {primaryCtaText}
                  </span>
                </div>
              </div>

              {/* Hero Banner Preview */}
              <div className="space-y-3 py-4 text-center max-w-2xl mx-auto">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-white/10 text-slate-200 border border-white/15">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  {badgeText}
                </div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  {headlineTemplate.replace('{name}', name).replace('{city}', 'Dhanbad')}
                </h2>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {subheadlineTemplate.replace('{city}', 'Dhanbad')}
                </p>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button type="button" className="px-5 py-2.5 rounded-xl font-bold text-white text-xs flex items-center gap-2 shadow-lg" style={{ backgroundColor: accentColor }}>
                    <MessageSquare className="w-3.5 h-3.5" />
                    {primaryCtaText}
                  </button>
                  <button type="button" className="px-4 py-2.5 rounded-xl font-bold text-white text-xs bg-white/10 hover:bg-white/15 border border-white/15 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    {secondaryCtaText}
                  </button>
                </div>
              </div>

              {/* Services Sample Grid */}
              <div className="space-y-3 pt-4 border-t border-slate-800/80">
                <h3 className="font-bold text-sm text-center text-white">{servicesTitle}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {services.slice(0, 3).map((s, i) => (
                    <div key={i} className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                      <div className="flex justify-between items-start gap-1">
                        <strong className="text-xs text-white font-bold">{s.title}</strong>
                        {s.badge && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold text-white" style={{ backgroundColor: accentColor }}>
                            {s.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2">{s.desc}</p>
                      <span className="text-[10px] font-bold text-emerald-400 block pt-1">{s.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Action Buttons */}
        <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>

          <Button type="submit" isLoading={isSaving} icon={Save}>
            Save Template
          </Button>
        </div>
      </form>
    </Modal>
  );
};
