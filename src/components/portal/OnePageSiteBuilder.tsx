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
  Wand2,
  Award,
  ShieldCheck,
  MessageSquare,
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

export interface ReviewItem {
  authorName: string;
  rating: number;
  text: string;
  relativeTime?: string;
}

export interface GalleryItem {
  title: string;
  category: string;
  imageUrl?: string;
  aspect?: string;
}

export interface OnePageSiteBuilderProps {
  initialConfig?: any;
}

export const OnePageSiteBuilder: React.FC<OnePageSiteBuilderProps> = () => {
  const { profile, updateProfile } = usePortalProfile();

  const [categoryKey, setCategoryKey] = useState<string>(
    detectCategoryKeyFromGbp(profile.category)
  );

  const [availableTemplates, setAvailableTemplates] = useState<any[]>([]);
  const [templateFilter, setTemplateFilter] = useState<'all' | 'custom' | 'ai' | 'builtin'>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<any | null>(null);

  const initialTheme = CATEGORY_THEMES[detectCategoryKeyFromGbp(profile.category) as LocalCategoryKey] || CATEGORY_THEMES.GENERAL;

  const [headline, setHeadline] = useState(
    profile.miniSiteConfig?.headline ||
      initialTheme.headlineTemplate(profile.businessName, profile.city || '')
  );
  const [subheadline, setSubheadline] = useState(
    profile.miniSiteConfig?.subheadline ||
      initialTheme.subheadlineTemplate(profile.category, profile.city || '')
  );

  // About Section Customization
  const [aboutTitle, setAboutTitle] = useState(
    profile.miniSiteConfig?.aboutTitle ||
      `Trusted ${initialTheme.name} in ${profile.city || 'the Region'}`
  );
  const [aboutText, setAboutText] = useState(
    profile.miniSiteConfig?.aboutText ||
      `Welcome to ${profile.businessName}. We are dedicated to providing our clients with top quality, reliable service, and fast local response.`
  );
  const [aboutBadge, setAboutBadge] = useState(
    profile.miniSiteConfig?.aboutBadge || '#1'
  );
  const [aboutBadgeTitle, setAboutBadgeTitle] = useState(
    profile.miniSiteConfig?.aboutBadgeTitle || 'Committed to Quality Excellence'
  );
  const [aboutBadgeDesc, setAboutBadgeDesc] = useState(
    profile.miniSiteConfig?.aboutBadgeDesc ||
      `Serving customers in ${profile.city || 'the locality'} with unmatched craftsmanship and reliable customer support.`
  );
  const [aboutPillars, setAboutPillars] = useState<string[]>(
    profile.miniSiteConfig?.aboutPillars && profile.miniSiteConfig.aboutPillars.length > 0
      ? profile.miniSiteConfig.aboutPillars
      : ['Certified Professionals', 'Transparent Pricing', 'Prompt Timelines', '5-Star Client Satisfaction']
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

  // Ratings & Reviews Dynamic vs Manual Override
  const [ratingOverride, setRatingOverride] = useState<number | string>(
    profile.miniSiteConfig?.ratingOverride !== undefined
      ? profile.miniSiteConfig.ratingOverride
      : (profile.averageRating || 4.9)
  );
  const [reviewCountOverride, setReviewCountOverride] = useState<number | string>(
    profile.miniSiteConfig?.reviewCountOverride !== undefined
      ? profile.miniSiteConfig.reviewCountOverride
      : (profile.reviewCount || 30)
  );
  const [customReviews, setCustomReviews] = useState<ReviewItem[]>(
    profile.miniSiteConfig?.customReviews && profile.miniSiteConfig.customReviews.length > 0
      ? profile.miniSiteConfig.customReviews
      : profile.reviews && profile.reviews.length > 0
      ? profile.reviews.map((r) => ({
          authorName: r.authorName,
          rating: r.rating,
          text: r.content,
          relativeTime: r.date,
        }))
      : [
          {
            authorName: 'Verified Google Reviewer',
            rating: 5,
            text: `Extremely satisfied with the service and quality of ${profile.businessName}. Highly recommended!`,
            relativeTime: '2 weeks ago',
          },
          {
            authorName: 'Local Customer',
            rating: 5,
            text: 'Prompt response, courteous staff, and transparent pricing. Will definitely visit again.',
            relativeTime: '1 month ago',
          },
        ]
  );

  // Gallery Showcase Customizer
  const [galleryImages, setGalleryImages] = useState<GalleryItem[]>(
    profile.miniSiteConfig?.galleryImages && profile.miniSiteConfig.galleryImages.length > 0
      ? profile.miniSiteConfig.galleryImages
      : initialTheme.defaultGalleryImages
  );

  // Fetch all templates (Custom Admin + AI Synthesized + Built-in) from Super Admin API
  useEffect(() => {
    fetch('/api/admin/templates')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setAvailableTemplates(data.data);
          const detectedKey = detectCategoryKeyFromGbp(profile.category);
          const matched = data.data.find(
            (t: any) =>
              t.categoryKey.toUpperCase() === detectedKey.toUpperCase() ||
              t.name.toLowerCase().includes(profile.category?.toLowerCase() || '')
          );
          if (matched) {
            setSelectedTemplate(matched);
          }
        }
      })
      .catch((err) => console.warn('Could not load custom templates from admin API:', err));
  }, [profile.category]);

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

  useEffect(() => {
    if (profile.miniSiteConfig?.customHtml) {
      setCustomHtml(profile.miniSiteConfig.customHtml);
      setUseCustomHtml(true);
    }
  }, [profile.miniSiteConfig?.customHtml]);

  const [deviceView, setDeviceView] = useState<'mobile' | 'desktop'>('mobile');
  const [activeTab, setActiveTab] = useState<
    'content' | 'about' | 'images' | 'services' | 'reviews' | 'gallery' | 'faqs' | 'code'
  >('content');
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

  const currentTheme = selectedTemplate
    ? {
        name: selectedTemplate.name,
        categoryKey: selectedTemplate.categoryKey,
        taglineDefault: selectedTemplate.taglineDefault,
        headlineTemplate: () => selectedTemplate.headlineTemplate,
        subheadlineTemplate: () => selectedTemplate.subheadlineTemplate,
        primaryCtaText: selectedTemplate.primaryCtaText || 'Get Free Quote',
        primaryCtaType: selectedTemplate.primaryCtaType || 'whatsapp',
        secondaryCtaText: selectedTemplate.secondaryCtaText || 'Call Directly',
        secondaryCtaType: selectedTemplate.secondaryCtaType || 'call',
        accentColor: selectedTemplate.accentColor || '#4f46e5',
        accentBg: selectedTemplate.accentBg || 'bg-indigo-600',
        gradient: selectedTemplate.gradient || 'from-slate-950 via-indigo-950 to-slate-950',
        badgeText: selectedTemplate.badgeText || 'Verified Local Business',
        servicesTitle: selectedTemplate.servicesTitle || 'Our Professional Services',
        servicesSubtitle: selectedTemplate.servicesSubtitle || 'Tailored solutions delivered with precision.',
        galleryTitle: selectedTemplate.galleryTitle || 'Our Work & Showcase',
        trustTitle: selectedTemplate.trustTitle || 'Why Choose Us',
        defaultServices: selectedTemplate.defaultServices || [],
        defaultFaqs: selectedTemplate.defaultFaqs || [],
        defaultGalleryImages: selectedTemplate.defaultGalleryImages || [],
      }
    : CATEGORY_THEMES[categoryKey as LocalCategoryKey] || CATEGORY_THEMES.GENERAL;

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
    rating: Number(ratingOverride) > 0 ? Number(ratingOverride) : profile.averageRating || 4.9,
    reviewCount: Number(reviewCountOverride) > 0 ? Number(reviewCountOverride) : profile.reviewCount || 30,
    workingHours,
    headline,
    subheadline,
    customAboutTitle: aboutTitle,
    customAbout: aboutText,
    customAboutBadge: aboutBadge,
    customAboutBadgeTitle: aboutBadgeTitle,
    customAboutBadgeDesc: aboutBadgeDesc,
    customAboutPillars: aboutPillars,
    logoUrl,
    bannerUrl,
    customServices: services.map((s) => ({
      title: s.title,
      desc: s.desc,
      price: s.price,
      badge: s.badge,
    })),
    customFaqs: faqs,
    customGalleryImages: galleryImages,
    realReviews:
      customReviews && customReviews.length > 0
        ? customReviews
        : profile.reviews?.map((r) => ({
            authorName: r.authorName,
            rating: r.rating,
            text: r.content,
            relativeTime: r.date,
          })),
  });

  const autoGeneratedHtml = generateStandaloneHtmlBundle(generatedData).html;
  const effectiveHtml = useCustomHtml && customHtml.trim() ? customHtml : autoGeneratedHtml;

  const handleSelectTemplate = (tpl: any) => {
    setSelectedTemplate(tpl);
    setCategoryKey(tpl.categoryKey);
    const hl = tpl.headlineTemplate
      ? tpl.headlineTemplate.replace(/\{name\}/g, profile.businessName).replace(/\{city\}/g, profile.city || '')
      : `Dedicated ${tpl.name} in ${profile.city || ''}`;
    const sub = tpl.subheadlineTemplate
      ? tpl.subheadlineTemplate.replace(/\{name\}/g, profile.businessName).replace(/\{city\}/g, profile.city || '')
      : `Specialized ${tpl.name} solutions with verified satisfaction and prompt local support.`;
    setHeadline(hl);
    setSubheadline(sub);
    if (Array.isArray(tpl.defaultServices) && tpl.defaultServices.length > 0) {
      setServices(
        tpl.defaultServices.map((s: any) => ({
          title: s.title,
          desc: s.desc,
          price: s.price || 'Standard',
          badge: s.badge || '',
          icon: 'Sparkles',
        }))
      );
    }
    if (Array.isArray(tpl.defaultFaqs) && tpl.defaultFaqs.length > 0) {
      setFaqs(tpl.defaultFaqs);
    }
  };

  const handleCategorySelect = (key: LocalCategoryKey) => {
    const th = CATEGORY_THEMES[key];
    if (th) {
      handleSelectTemplate({
        categoryKey: key,
        name: th.name,
        taglineDefault: th.taglineDefault,
        headlineTemplate: th.headlineTemplate('{name}', '{city}'),
        subheadlineTemplate: th.subheadlineTemplate(th.name, '{city}'),
        primaryCtaText: th.primaryCtaText,
        primaryCtaType: th.primaryCtaType,
        secondaryCtaText: th.secondaryCtaText,
        secondaryCtaType: th.secondaryCtaType,
        accentColor: th.accentColor,
        accentBg: th.accentBg,
        gradient: th.gradient,
        badgeText: th.badgeText,
        servicesTitle: th.servicesTitle,
        servicesSubtitle: th.servicesSubtitle,
        galleryTitle: th.galleryTitle,
        trustTitle: th.trustTitle,
        defaultServices: th.defaultServices,
        defaultFaqs: th.defaultFaqs,
        defaultGalleryImages: th.defaultGalleryImages,
        isCustom: false,
      });
    }
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
      currentTheme.defaultServices.map((s: any) => ({
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

  // CRUD for About Pillars
  const handleUpdatePillar = (index: number, value: string) => {
    const next = [...aboutPillars];
    next[index] = value;
    setAboutPillars(next);
  };

  const handleAddPillar = () => {
    if (aboutPillars.length < 6) {
      setAboutPillars([...aboutPillars, 'Quality Feature / Guarantee']);
    }
  };

  const handleDeletePillar = (index: number) => {
    setAboutPillars(aboutPillars.filter((_, i) => i !== index));
  };

  // CRUD for Reviews & Testimonials
  const handleAddReview = () => {
    setCustomReviews([
      ...customReviews,
      {
        authorName: 'Customer Name',
        rating: 5,
        text: 'Great experience! Professional service and prompt delivery.',
        relativeTime: 'Recently',
      },
    ]);
  };

  const handleUpdateReview = (index: number, field: keyof ReviewItem, value: any) => {
    const next = [...customReviews];
    next[index] = { ...next[index], [field]: value };
    setCustomReviews(next);
  };

  const handleDeleteReview = (index: number) => {
    setCustomReviews(customReviews.filter((_, i) => i !== index));
  };

  const handleResetReviews = () => {
    if (profile.reviews && profile.reviews.length > 0) {
      setCustomReviews(
        profile.reviews.map((r) => ({
          authorName: r.authorName,
          rating: r.rating,
          text: r.content,
          relativeTime: r.date,
        }))
      );
    } else {
      setCustomReviews([
        {
          authorName: 'Verified Google Reviewer',
          rating: 5,
          text: `Extremely satisfied with the service and quality of ${profile.businessName}. Highly recommended!`,
          relativeTime: '2 weeks ago',
        },
      ]);
    }
  };

  // CRUD for Gallery / Portfolio Showcase
  const handleAddGalleryItem = () => {
    setGalleryImages([
      ...galleryImages,
      {
        title: 'New Project / Product Showcase',
        category: 'Work Portfolio',
        imageUrl: '',
        aspect: 'landscape',
      },
    ]);
  };

  const handleUpdateGalleryItem = (index: number, field: keyof GalleryItem, value: string) => {
    const next = [...galleryImages];
    next[index] = { ...next[index], [field]: value };
    setGalleryImages(next);
  };

  const handleDeleteGalleryItem = (index: number) => {
    setGalleryImages(galleryImages.filter((_, i) => i !== index));
  };

  const handleResetGallery = () => {
    setGalleryImages(currentTheme.defaultGalleryImages);
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
        category: categoryKey as any,
        headline,
        subheadline,
        tagline: currentTheme.taglineDefault,
        aboutTitle,
        aboutText,
        aboutBadge,
        aboutBadgeTitle,
        aboutBadgeDesc,
        aboutPillars,
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
        customHtml: useCustomHtml && customHtml.trim() ? customHtml : effectiveHtml,
        workingHours,
        address,
        phone,
        whatsapp,
        themeColor: currentTheme.accentColor,
        bannerGradient: currentTheme.gradient,
        customSlug: siteSlug,
        ratingOverride: Number(ratingOverride) > 0 ? Number(ratingOverride) : undefined,
        reviewCountOverride: Number(reviewCountOverride) > 0 ? Number(reviewCountOverride) : undefined,
        customReviews,
        galleryImages,
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

      {/* Category & Template Architecture Switcher (Custom Admin, AI-Synthesized, Built-in) */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold uppercase tracking-wider text-slate-400 text-[10px] flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-500" />
              Website Template Engine:
            </span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full inline-block"
                style={{ backgroundColor: currentTheme.accentColor || '#4f46e5' }}
              />
              {currentTheme.name}
            </span>
            {selectedTemplate?.isAiGenerated ? (
              <span className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-[10px] font-bold flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" />
                AI Synthesized
              </span>
            ) : selectedTemplate?.isCustom ? (
              <span className="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold">
                Custom Admin
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold">
                Built-in Preset
              </span>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-0.5 text-[11px] font-semibold">
            <button
              onClick={() => setTemplateFilter('all')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                templateFilter === 'all'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              All ({availableTemplates.length || Object.keys(CATEGORY_THEMES).length})
            </button>
            <button
              onClick={() => setTemplateFilter('custom')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                templateFilter === 'custom'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Custom Admin ({availableTemplates.filter((t) => t.isCustom && !t.isAiGenerated).length})
            </button>
            <button
              onClick={() => setTemplateFilter('ai')}
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                templateFilter === 'ai'
                  ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Sparkles className="w-3 h-3 text-purple-500" />
              AI Synthesized ({availableTemplates.filter((t) => t.isAiGenerated).length})
            </button>
            <button
              onClick={() => setTemplateFilter('builtin')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                templateFilter === 'builtin'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Built-in ({availableTemplates.length > 0 ? availableTemplates.filter((t) => !t.isCustom && !t.isAiGenerated).length : Object.keys(CATEGORY_THEMES).length})
            </button>
          </div>
        </div>

        {/* Scrollable Templates List */}
        <div className="flex gap-2.5 overflow-x-auto pb-1.5 scrollbar-thin">
          {(availableTemplates.length > 0
            ? availableTemplates.filter((t) => {
                if (templateFilter === 'custom') return t.isCustom && !t.isAiGenerated;
                if (templateFilter === 'ai') return t.isAiGenerated;
                if (templateFilter === 'builtin') return !t.isCustom && !t.isAiGenerated;
                return true;
              })
            : (Object.keys(CATEGORY_THEMES) as LocalCategoryKey[]).map((key) => {
                const th = CATEGORY_THEMES[key];
                return {
                  ...th,
                  id: key,
                  categoryKey: key,
                  isCustom: false,
                  isAiGenerated: false,
                };
              })
          ).map((tpl: any) => {
            const isSelected = selectedTemplate?.id
              ? selectedTemplate.id === tpl.id
              : (selectedTemplate?.categoryKey || categoryKey).toUpperCase() === (tpl.categoryKey || tpl.id).toUpperCase();

            return (
              <button
                key={tpl.id || tpl.categoryKey}
                onClick={() => handleSelectTemplate(tpl)}
                className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 border text-left shrink-0 ${
                  isSelected
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white shadow-md scale-102 ring-2 ring-indigo-500/30'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-100 hover:border-slate-300 dark:hover:bg-slate-700'
                }`}
              >
                <span
                  className="w-3 h-3 rounded-full shrink-0 shadow-xs border border-white/20"
                  style={{ backgroundColor: tpl.accentColor || '#4f46e5' }}
                />
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span>{tpl.name}</span>
                    {isSelected && <Check className="w-3 h-3 text-emerald-400 shrink-0" />}
                  </div>
                  <span
                    className={`text-[9px] font-normal ${
                      isSelected ? 'text-slate-300 dark:text-slate-600' : 'text-slate-400'
                    }`}
                  >
                    {tpl.isAiGenerated ? '✨ AI Synth' : tpl.isCustom ? 'Custom Admin' : 'Preset'}
                  </span>
                </div>
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
          <div className="flex rounded-2xl bg-slate-100 dark:bg-slate-800 p-1 text-xs font-bold gap-1 overflow-x-auto scrollbar-thin">
            <button
              onClick={() => setActiveTab('content')}
              className={`py-1.5 px-2.5 rounded-xl whitespace-nowrap transition-all ${
                activeTab === 'content'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              1. Hero & Info
            </button>
            <button
              onClick={() => setActiveTab('about')}
              className={`py-1.5 px-2.5 rounded-xl whitespace-nowrap transition-all flex items-center gap-1 ${
                activeTab === 'about'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Award className="w-3 h-3 text-amber-500" />
              2. About Story
            </button>
            <button
              onClick={() => setActiveTab('images')}
              className={`py-1.5 px-2.5 rounded-xl whitespace-nowrap transition-all ${
                activeTab === 'images'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              3. Branding
            </button>
            <button
              onClick={() => setActiveTab('services')}
              className={`py-1.5 px-2.5 rounded-xl whitespace-nowrap transition-all ${
                activeTab === 'services'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              4. Services ({services.length})
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`py-1.5 px-2.5 rounded-xl whitespace-nowrap transition-all flex items-center gap-1 ${
                activeTab === 'reviews'
                  ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              5. Reviews ({customReviews.length})
            </button>
            <button
              onClick={() => setActiveTab('gallery')}
              className={`py-1.5 px-2.5 rounded-xl whitespace-nowrap transition-all flex items-center gap-1 ${
                activeTab === 'gallery'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <ImageIcon className="w-3 h-3 text-sky-500" />
              6. Gallery ({galleryImages.length})
            </button>
            <button
              onClick={() => setActiveTab('faqs')}
              className={`py-1.5 px-2.5 rounded-xl whitespace-nowrap transition-all ${
                activeTab === 'faqs'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              7. FAQs ({faqs.length})
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`py-1.5 px-2.5 rounded-xl whitespace-nowrap transition-all flex items-center gap-1 ${
                activeTab === 'code'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Code className="w-3 h-3 text-indigo-500" />
              8. HTML
            </button>
          </div>

          {/* TAB 1: Hero & Contact Information */}
          {activeTab === 'content' && (
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">
                  Hero Header & Business Details
                </h4>
                <span className="text-[10px] text-slate-400">Updates live in preview</span>
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

          {/* TAB 2: About Our Business Customizer */}
          {activeTab === 'about' && (
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-amber-500" />
                    About Our Business Customizer
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Customize your company story narrative, trust badge, and key value pillars.
                  </p>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Section Title (H3)
                </label>
                <input
                  type="text"
                  value={aboutTitle}
                  onChange={(e) => setAboutTitle(e.target.value)}
                  placeholder="e.g. Trusted Aluminum & Glass Fabrication in Jamshedpur"
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  About Narrative / Company Story
                </label>
                <textarea
                  value={aboutText}
                  onChange={(e) => setAboutText(e.target.value)}
                  rows={4}
                  placeholder="Describe your business heritage, experience, values, and client focus..."
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white leading-relaxed"
                />
              </div>

              {/* Experience Badge & Subtitle */}
              <div className="p-3.5 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-3">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-500" />
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                    Experience / Award Showcase Box
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="font-bold text-slate-600 dark:text-slate-400 block mb-0.5 text-[10px]">
                      Badge Text
                    </label>
                    <input
                      type="text"
                      value={aboutBadge}
                      onChange={(e) => setAboutBadge(e.target.value)}
                      placeholder="e.g. #1 or 15+ Yrs"
                      className="w-full text-xs p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-black text-amber-600"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="font-bold text-slate-600 dark:text-slate-400 block mb-0.5 text-[10px]">
                      Badge Headline
                    </label>
                    <input
                      type="text"
                      value={aboutBadgeTitle}
                      onChange={(e) => setAboutBadgeTitle(e.target.value)}
                      placeholder="e.g. Committed to Quality Excellence"
                      className="w-full text-xs p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-bold text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-600 dark:text-slate-400 block mb-0.5 text-[10px]">
                    Badge Subtitle / Description
                  </label>
                  <input
                    type="text"
                    value={aboutBadgeDesc}
                    onChange={(e) => setAboutBadgeDesc(e.target.value)}
                    placeholder="Serving clients with verified satisfaction..."
                    className="w-full text-xs p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* 4 Value Pillars */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block text-xs">
                    Key Value Pillars (Checkmark List)
                  </label>
                  {aboutPillars.length < 6 && (
                    <button
                      onClick={handleAddPillar}
                      className="text-indigo-600 hover:text-indigo-700 font-bold text-[11px] flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      Add Pillar
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {aboutPillars.map((pillar, pIdx) => (
                    <div key={pIdx} className="flex items-center gap-1.5">
                      <span className="text-emerald-500 font-bold text-xs shrink-0">✓</span>
                      <input
                        type="text"
                        value={pillar}
                        onChange={(e) => handleUpdatePillar(pIdx, e.target.value)}
                        className="w-full text-xs p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                      />
                      {aboutPillars.length > 2 && (
                        <button
                          onClick={() => handleDeletePillar(pIdx)}
                          className="text-slate-400 hover:text-rose-500 p-1"
                          title="Remove pillar"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Logo and Hero Banner Uploads */}
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

          {/* TAB 4: Full CRUD for Services */}
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

          {/* TAB 5: Ratings & Reviews Customizer (Dynamic Sync + Override) */}
          {activeTab === 'reviews' && (
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    Ratings & Reviews Customizer
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Live dynamic sync from Google Maps + optional manual override controls.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" icon={RefreshCw} onClick={handleResetReviews}>
                    Reset
                  </Button>
                  <Button variant="primary" size="sm" icon={Plus} onClick={handleAddReview}>
                    Add Review
                  </Button>
                </div>
              </div>

              {/* Dynamic Google Sync Indicator Box */}
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-emerald-700 dark:text-emerald-300">
                      ⚡ Dynamic Google Business Profile Sync
                    </span>
                    <span className="px-2 py-0.2 rounded-full bg-emerald-500 text-white text-[9px] font-black">
                      Active
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                    By default, your one-page site automatically pulls live ratings (
                    <strong>{profile.averageRating || 4.9}★</strong>) and review counts (
                    <strong>{profile.reviewCount || 30}+</strong>) directly from Google Maps and injects them into Schema.org SEO metadata.
                  </p>
                </div>
              </div>

              {/* Rating & Review Count Override */}
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Displayed Star Rating (1.0 – 5.0)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1.0"
                    max="5.0"
                    value={ratingOverride}
                    onChange={(e) => setRatingOverride(e.target.value)}
                    className="w-full text-xs p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-bold text-amber-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">e.g. 4.9 or 5.0</span>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Displayed Total Reviews Count
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={reviewCountOverride}
                    onChange={(e) => setReviewCountOverride(e.target.value)}
                    className="w-full text-xs p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-bold text-slate-900 dark:text-white"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">e.g. 35, 50, 100</span>
                </div>
              </div>

              {/* Individual Review Cards CRUD */}
              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {customReviews.map((rev, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2 relative"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-black text-amber-600 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-md text-[10px]">
                        Review #{idx + 1}
                      </span>
                      <button
                        onClick={() => handleDeleteReview(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                        title="Delete Review"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-2">
                        <label className="font-bold text-slate-600 dark:text-slate-400 block mb-0.5 text-[10px]">
                          Reviewer Name
                        </label>
                        <input
                          type="text"
                          value={rev.authorName}
                          onChange={(e) => handleUpdateReview(idx, 'authorName', e.target.value)}
                          className="w-full text-xs p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-bold text-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-600 dark:text-slate-400 block mb-0.5 text-[10px]">
                          Rating Stars
                        </label>
                        <select
                          value={rev.rating}
                          onChange={(e) => handleUpdateReview(idx, 'rating', Number(e.target.value))}
                          className="w-full text-xs p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-bold text-amber-500"
                        >
                          <option value="5">★★★★★ (5 Stars)</option>
                          <option value="4">★★★★☆ (4 Stars)</option>
                          <option value="3">★★★☆☆ (3 Stars)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="font-bold text-slate-600 dark:text-slate-400 block mb-0.5 text-[10px]">
                        Review Text
                      </label>
                      <textarea
                        value={rev.text}
                        onChange={(e) => handleUpdateReview(idx, 'text', e.target.value)}
                        rows={2}
                        className="w-full text-xs p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-600 dark:text-slate-400 block mb-0.5 text-[10px]">
                        Relative Date / Time
                      </label>
                      <input
                        type="text"
                        value={rev.relativeTime || ''}
                        onChange={(e) => handleUpdateReview(idx, 'relativeTime', e.target.value)}
                        placeholder="e.g. 2 weeks ago or Verified Google Review"
                        className="w-full text-xs p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: Gallery / Showcase Customizer */}
          {activeTab === 'gallery' && (
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-sky-500" />
                    Portfolio & Work Showcase ({galleryImages.length})
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Add project photos, category tags, and client deliverable highlights.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" icon={RefreshCw} onClick={handleResetGallery}>
                    Reset
                  </Button>
                  <Button variant="primary" size="sm" icon={Plus} onClick={handleAddGalleryItem}>
                    Add Item
                  </Button>
                </div>
              </div>

              <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                {galleryImages.map((img, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2 relative"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-black text-sky-600 bg-sky-50 dark:bg-sky-950/50 px-2 py-0.5 rounded-md text-[10px]">
                        Showcase Item #{idx + 1}
                      </span>
                      <button
                        onClick={() => handleDeleteGalleryItem(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                        title="Delete Showcase Item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="font-bold text-slate-600 dark:text-slate-400 block mb-0.5 text-[10px]">
                          Project Title
                        </label>
                        <input
                          type="text"
                          value={img.title}
                          onChange={(e) => handleUpdateGalleryItem(idx, 'title', e.target.value)}
                          placeholder="e.g. Slimline Black Windows"
                          className="w-full text-xs p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-bold text-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-600 dark:text-slate-400 block mb-0.5 text-[10px]">
                          Category Tag
                        </label>
                        <input
                          type="text"
                          value={img.category}
                          onChange={(e) => handleUpdateGalleryItem(idx, 'category', e.target.value)}
                          placeholder="e.g. Residential Installation"
                          className="w-full text-xs p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-bold text-slate-600 dark:text-slate-400 block mb-0.5 text-[10px]">
                        Image URL (Optional Override)
                      </label>
                      <input
                        type="text"
                        value={img.imageUrl || ''}
                        onChange={(e) => handleUpdateGalleryItem(idx, 'imageUrl', e.target.value)}
                        placeholder="https://images.unsplash.com/... or custom URL"
                        className="w-full text-xs p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: Full CRUD for FAQs */}
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

          {/* TAB 8: Editable Raw HTML Code */}
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
          {/* Device Toggle & Status Bar */}
          <div className="flex items-center justify-between w-full">
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

            {useCustomHtml && customHtml.trim() ? (
              <span className="px-2.5 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold flex items-center gap-1 border border-indigo-200 dark:border-indigo-800 shadow-xs">
                <Code className="w-3 h-3 text-indigo-500" />
                <span>Custom HTML Preview Active</span>
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold flex items-center gap-1 border border-emerald-200 dark:border-emerald-800 shadow-xs">
                <Sparkles className="w-3 h-3 text-emerald-500" />
                <span>Dynamic Visual Preview</span>
              </span>
            )}
          </div>

          {/* Live Preview Container Frame */}
          <div
            className={`w-full transition-all duration-300 ${
              deviceView === 'mobile' ? 'max-w-[390px]' : 'max-w-full'
            }`}
          >
            <div className="rounded-3xl border-8 border-slate-900 bg-white shadow-2xl overflow-hidden text-xs">
              <div className="relative w-full h-[680px] bg-white">
                <iframe
                  key={`${categoryKey}-${headline}-${services.length}-${faqs.length}-${logoUrl ? '1' : '0'}-${bannerUrl ? '1' : '0'}-${useCustomHtml ? customHtml : ''}`}
                  srcDoc={effectiveHtml}
                  title="Live Site Preview"
                  className="w-full h-full border-0 bg-white"
                  sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
