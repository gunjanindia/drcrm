'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  MapPin,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  Star,
  QrCode,
  Globe,
  MessageCircle,
  PhoneCall,
  Search,
  Zap,
  Users,
  ChevronDown,
  Layers,
  Award,
  Bot,
  RefreshCw,
  Send,
  Check,
  Building2,
  Clock,
  Heart,
  ChevronRight,
  ExternalLink,
  Flame,
  Smartphone,
  Laptop,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui';
import { AuditScorecard } from '@/components/audit/AuditScorecard';
import { CheckoutModal } from '@/components/billing/CheckoutModal';
import { globalStore } from '@/lib/store';
import { Package } from '@/types';
import { formatINR } from '@/lib/utils';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';

export default function HomePage() {
  const { settings } = useSiteSettings();
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Grexa-style Interactive AI Agent Showcase State
  const [activeAgentTab, setActiveAgentTab] = useState<'gbp' | 'ai-reviews' | 'site-builder' | 'qr-stand' | 'radar'>('ai-reviews');

  // Interactive Review Replier Demo State
  const sampleReviews = [
    {
      id: 1,
      author: 'Priya Sharma',
      rating: 5,
      comment: 'Doctor Sahay and the clinic staff were extremely attentive. Diagnosis was fast and the medicine provided quick relief. Highly recommended in Ranchi!',
      businessType: 'Apex Healthcare Clinic',
      date: 'Yesterday',
    },
    {
      id: 2,
      author: 'Rohit Verma',
      rating: 5,
      comment: 'Super fast haircut and premium beard grooming at Kaveri Salon. Ambience is clean and staff is very polite. Will definitely visit again!',
      businessType: 'Kaveri Family Salon',
      date: '2 days ago',
    },
    {
      id: 3,
      author: 'Amitabh Sen',
      rating: 4,
      comment: 'Food was delicious especially the handi biryani. Service was good during rush hour. Ample parking space near Harmu bypass.',
      businessType: 'The Royal Treat Restaurant',
      date: '3 days ago',
    },
  ];

  const [selectedReviewIdx, setSelectedReviewIdx] = useState(0);
  const [replyTone, setReplyTone] = useState<'warm' | 'professional' | 'promo'>('warm');
  const [generatedReply, setGeneratedReply] = useState<string>(
    'Dear Priya Sharma, thank you so much for your heartwarming 5-star review! Dr. Sahay and our entire team at Apex Healthcare are delighted to know you had a smooth diagnosis and quick recovery. Wishing you great health always!'
  );
  const [isGeneratingReply, setIsGeneratingReply] = useState(false);
  const [copiedReply, setCopiedReply] = useState(false);

  // Interactive 1-Page Site Demo State
  const [selectedSiteVertical, setSelectedSiteVertical] = useState<'clinic' | 'salon' | 'restaurant' | 'gym'>('clinic');
  const [siteDeviceView, setSiteDeviceView] = useState<'mobile' | 'desktop'>('mobile');

  const packages = globalStore.packages;
  const brandName = settings.brandName || 'Digital Ranchi';
  const whatsappDigits = (settings.whatsapp || '919431109876').replace(/[^0-9]/g, '');

  const handleOpenCheckout = (pkg: Package) => {
    setSelectedPackage(pkg);
    setIsCheckoutOpen(true);
  };

  const handlePackageFromAudit = (pkgId: string) => {
    const pkg = packages.find((p) => p.id === pkgId) || packages[1];
    setSelectedPackage(pkg);
    setIsCheckoutOpen(true);
  };

  const generateAiReplyDemo = (reviewIdx: number, tone: 'warm' | 'professional' | 'promo') => {
    setIsGeneratingReply(true);
    const review = sampleReviews[reviewIdx];

    setTimeout(() => {
      let reply = '';
      if (review.businessType.includes('Clinic')) {
        if (tone === 'warm') {
          reply = `Dear ${review.author}, thank you so much for trusting Dr. Sahay and Apex Healthcare! We are delighted to hear you felt well-cared for. Your health and comfort are our topmost priority.`;
        } else if (tone === 'professional') {
          reply = `Thank you ${review.author} for your review of Apex Healthcare & Diagnostic Center. Our clinical team remains committed to accurate diagnoses and gold-standard patient care.`;
        } else {
          reply = `Thank you ${review.author}! We appreciate your feedback. Apex Healthcare also offers preventative full-body health checks with instant digital reports every weekend. Stay healthy!`;
        }
      } else if (review.businessType.includes('Salon')) {
        if (tone === 'warm') {
          reply = `Hey ${review.author}, thank you for the glowing 5 stars! The team at Kaveri Salon loved hosting you. We can’t wait to style you again on your next visit! ✨`;
        } else if (tone === 'professional') {
          reply = `Dear ${review.author}, thank you for rating Kaveri Family Salon. We take pride in maintaining strict hygiene standards and skilled stylists for all our clients.`;
        } else {
          reply = `Thank you ${review.author}! Glad you loved the beard grooming. Book your next visit via our WhatsApp for an exclusive 15% VIP member loyalty perk!`;
        }
      } else {
        if (tone === 'warm') {
          reply = `Namaste ${review.author}, thank you for dining with us at The Royal Treat! We are thrilled you enjoyed the signature Handi Biryani. See you again soon with family! 🍲`;
        } else if (tone === 'professional') {
          reply = `Thank you ${review.author} for your valuable review. We appreciate your feedback regarding our cuisine and parking convenience, and look forward to serving you again.`;
        } else {
          reply = `Thank you ${review.author}! Mention this review on your next weekend dinner to enjoy a complimentary dessert on the house! 🍨`;
        }
      }

      setGeneratedReply(reply);
      setIsGeneratingReply(false);
    }, 600);
  };

  const siteTemplates = {
    clinic: {
      name: 'Dr. Sahay Child & General Clinic',
      badge: 'Pediatrician & Family Physician',
      heroTagline: 'Caring, Gentle & Modern Healthcare for Your Family in Ranchi',
      rating: '4.9 (184 Reviews)',
      address: 'Near Dangratoli Chowk, Circular Road, Ranchi',
      timing: 'Mon - Sat: 9:00 AM - 8:30 PM',
      services: ['Child Vaccination & Growth', 'Viral & Chronic Care', 'ECG & Instant Blood Tests', 'Online WhatsApp Prescriptions'],
      ctaText: 'Book Appointment on WhatsApp',
    },
    salon: {
      name: 'Kaveri Luxury Family Salon',
      badge: 'Unisex Hair, Skin & Bridal Studio',
      heroTagline: 'Transform Your Look with Ranchi’s Top Hair & Beauty Artists',
      rating: '4.8 (296 Reviews)',
      address: 'Opposite Plaza Cinema, H.B. Road, Ranchi',
      timing: 'All Days: 10:00 AM - 9:00 PM',
      services: ['Keratin & Hair Botox', 'HD Bridal Makeup', 'HydraFacial Glow Therapy', 'Men’s Beard Sculpting'],
      ctaText: 'Reserve Slot on WhatsApp',
    },
    restaurant: {
      name: 'The Royal Treat Biryani & Dining',
      badge: 'Authentic Mughlai & Tandoor',
      heroTagline: 'Rich Royal Flavours, Fresh Clay Pot Cooking & Cozy Ambiance',
      rating: '4.7 (520 Reviews)',
      address: 'Harmu Housing Colony, Argora Bypass, Ranchi',
      timing: 'Daily: 11:30 AM - 11:00 PM',
      services: ['Dum Clay Pot Biryani', 'Live Tandoor Platters', 'Family Dining & Party Hall', 'Takeaway & Express Delivery'],
      ctaText: 'Order / Reserve Table on WhatsApp',
    },
    gym: {
      name: 'IronCore Fitness Club & MMA',
      badge: '24/7 Premium Unisex Gym',
      heroTagline: 'Build Strength, Lose Fat & Dominate Your Goals in Ranchi',
      rating: '4.9 (142 Reviews)',
      address: 'Bariatu Road, Near RIMS, Ranchi',
      timing: 'Mon - Sat: 5:30 AM - 10:30 PM',
      services: ['Strength & Hypertrophy', 'Personal Certified Coaching', 'Steam Bath & Sauna', 'Diet & Nutrition Blueprint'],
      ctaText: 'Get 3-Day Free Pass on WhatsApp',
    },
  };

  const currentTemplate = siteTemplates[selectedSiteVertical];

  const faqs = [
    {
      q: 'How does the Client 360 AI SaaS platform work?',
      a: 'Client 360 is an all-in-one local marketing OS designed specifically for local SMBs. You connect your Google Business Profile in 1 click, instantly launch a mobile-optimized 1-page website, reply to customer reviews with 1-click Gemini AI, and track direction calls & customer revenue effortlessly.',
    },
    {
      q: 'What is included in the 14-Day Free Demo Trial?',
      a: 'You get full immediate access to the Client 360 platform, 20 Gemini AI credits to test auto-replying to Google reviews, the interactive 1-Page Mini Website Builder with your custom live link, and smart review QR stand generator without entering any credit card details.',
    },
    {
      q: 'How long does Google Maps verification and setup take?',
      a: 'Initial claim and category verification typically completes within 48 to 72 hours under our standard operating SLA. Our team handles address geotagging, category mapping, and business hours directly.',
    },
    {
      q: 'Do you guarantee genuine 5-star reviews on Google?',
      a: 'We strictly adhere to Google policies and never fabricate reviews. Instead, we equip your physical store/clinic with custom acrylic QR stands and automated WhatsApp review triggers that allow your actual satisfied in-store customers to submit 5-star reviews in just 10 seconds.',
    },
    {
      q: 'Can I use Digital Ranchi for my agency or upgrade later?',
      a: 'Yes, absolutely! You can start with the Client 360 SaaS plan at ₹1,500/month or choose our managed retainer packages where our dedicated local team handles weekly geotagged updates, social creative posters, and monthly growth reporting.',
    },
    {
      q: 'Are taxes applicable to these packages?',
      a: `${brandName} operates with 100% transparent pricing. ${settings.taxModeNotice || 'All services and SaaS subscriptions come with instant GST invoices and zero hidden surcharges.'} The price you see is the final price.`,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-white selection:bg-indigo-500 selection:text-white font-sans antialiased">
      <Navbar />

      {/* TOP ANNOUNCEMENT BANNER */}
      <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-950 text-white px-4 py-2.5 text-xs font-bold border-b border-indigo-500/30 flex items-center justify-center gap-2 text-center shadow-md relative z-20">
        <span className="px-2.5 py-0.5 rounded-full bg-purple-500/30 text-purple-300 text-[10px] font-black uppercase tracking-wider border border-purple-400/30 inline-flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-300" />
          ✨ New SaaS Release
        </span>
        <span>
          <strong>Client 360 Local Growth OS:</strong> 14-Day Free Demo Trial with 20 Gemini AI Credits Included!
        </span>
        <Link
          href="/register"
          className="ml-2 inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[11px] font-black hover:scale-105 transition-all shadow-sm"
        >
          <span>Claim Free Trial</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* ========================================================================= */}
      {/* 1. HERO SECTION (GREXA STYLE)                                             */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 border-b border-slate-800/80">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-gradient-to-tr from-indigo-600/25 via-purple-600/20 to-sky-500/20 rounded-full blur-[130px] pointer-events-none" />
        <div className="absolute -top-10 left-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 right-10 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto space-y-6">
            
            {/* Top Grexa-style Pill Tag */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-indigo-950/80 text-indigo-300 border border-indigo-500/40 shadow-lg shadow-indigo-950/50 backdrop-blur-md">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>AI-Powered Local Growth Platform for Jharkhand & Beyond</span>
            </div>

            {/* Main Punchy Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.08]">
              Your All-in-One <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-sky-400 bg-clip-text text-transparent">AI Marketing Team</span> that Delivers Real Revenue
            </h1>

            {/* Supporting Subheadline */}
            <p className="text-base sm:text-lg md:text-xl text-slate-300 leading-relaxed max-w-3xl mx-auto font-normal">
              Trusted by 250+ doctors, salons, gyms, restaurants & businesses. Rank #1 on Google Maps, generate instant Gemini AI review replies, and launch high-converting 1-page websites with direct WhatsApp leads.
            </p>

            {/* CTA Group */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
              <Link href="/register" className="w-full sm:w-auto">
                <Button
                  variant="primary"
                  size="lg"
                  icon={Sparkles}
                  className="w-full bg-gradient-to-r from-indigo-500 via-purple-600 to-indigo-600 hover:from-indigo-600 hover:to-purple-700 text-white font-extrabold shadow-2xl shadow-indigo-500/40 text-sm py-4 px-8 rounded-2xl hover:scale-105 transition-all"
                >
                  Start 14-Day Free Demo (20 AI Credits)
                </Button>
              </Link>
              
              <a
                href={`https://wa.me/${whatsappDigits}?text=Hi%20${encodeURIComponent(brandName)},%20I%20want%20a%20free%20demo%20of%20Client%20360`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto"
              >
                <Button
                  variant="secondary"
                  size="lg"
                  icon={MessageCircle}
                  className="w-full bg-slate-900/90 border border-slate-700 hover:bg-slate-800 text-white font-bold py-4 px-7 rounded-2xl shadow-lg"
                >
                  Book Free Demo on WhatsApp
                </Button>
              </a>

              <a href="#audit-section" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  icon={Search}
                  className="w-full border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 py-4 px-6 rounded-2xl"
                >
                  Free Digital Audit
                </Button>
              </a>
            </div>

            {/* Trust Metric Strip */}
            <div className="pt-8 flex flex-wrap items-center justify-center gap-8 text-xs font-semibold text-slate-400">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Verified Local Google Partner</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span>4.9/5 Rating Across 250+ Local SMBs</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-indigo-400" />
                <span>100% Automated • No Credit Card Required</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. GREXA-STYLE INTERACTIVE "MEET YOUR AI MARKETING TEAM" TABBED SHOWCASE  */}
      {/* ========================================================================= */}
      <section id="ai-team-showcase" className="py-20 bg-slate-950 relative overflow-hidden border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-black bg-purple-500/20 text-purple-300 border border-purple-500/30">
              <Bot className="w-4 h-4 text-amber-400" />
              <span>Autonomous AI Engine</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white">
              Meet Your <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-sky-400 bg-clip-text text-transparent">Digital Marketing AI Team</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-2xl mx-auto">
              Test and experience our 5 specialized AI agents built to handle local search ranking, instant review management, and high-converting web landing pages.
            </p>
          </div>

          {/* Tab Selection Grid: 100% visible on mobile, tablet, and desktop with zero horizontal scroll clipping */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3 max-w-5xl mx-auto w-full">
            {[
              { id: 'ai-reviews', num: '01', label: 'Gemini AI Review Replier', icon: Bot, badge: 'Interactive' },
              { id: 'site-builder', num: '02', label: '1-Page Mini Site Engine', icon: Globe, badge: 'Live Preview' },
              { id: 'gbp', num: '03', label: 'Google Maps Rank Booster', icon: MapPin, badge: 'Top 3 Pack' },
              { id: 'qr-stand', num: '04', label: 'Counter QR Stand Kit', icon: QrCode, badge: '5-Star Boost' },
              { id: 'radar', num: '05', label: 'Local Growth Radar', icon: TrendingUp, badge: 'Analytics' },
            ].map((tab, idx) => {
              const Icon = tab.icon;
              const isActive = activeAgentTab === tab.id;
              const isLastOdd = idx === 4; // 5th item spans 2 cols on 2-col mobile screens
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveAgentTab(tab.id as any)}
                  className={`p-3 sm:p-3.5 rounded-2xl font-bold text-left transition-all duration-200 cursor-pointer flex flex-col justify-between gap-2.5 ${
                    isLastOdd ? 'col-span-2 sm:col-span-1' : 'col-span-1'
                  } ${
                    isActive
                      ? 'bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 text-white shadow-xl shadow-indigo-600/30 border-2 border-indigo-300 ring-2 ring-indigo-500/40 scale-[1.02]'
                      : 'bg-slate-900/90 hover:bg-slate-850 text-slate-300 border border-slate-800 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                      isActive ? 'bg-white/20 text-white shadow-xs' : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider ${
                      isActive ? 'bg-white text-indigo-900 font-extrabold shadow-xs' : 'bg-slate-800/80 text-slate-400 border border-slate-700/60'
                    }`}>
                      {tab.badge}
                    </span>
                  </div>

                  <div>
                    <span className={`text-[10px] font-mono font-bold block ${isActive ? 'text-indigo-200' : 'text-slate-500'}`}>
                      AGENT {tab.num}
                    </span>
                    <h3 className={`text-xs sm:text-xs font-black tracking-tight leading-snug ${isActive ? 'text-white' : 'text-slate-200'}`}>
                      {tab.label}
                    </h3>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Interactive Agent Showcase Content Container */}
          <div className="mt-8 bg-slate-900/90 rounded-3xl border border-slate-800 p-6 md:p-10 shadow-2xl relative overflow-hidden">
            
            {/* ---------------- TAB 1: GEMINI AI REVIEW REPLIER ---------------- */}
            {activeAgentTab === 'ai-reviews' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in fade-in">
                {/* Left: Input Selection */}
                <div className="lg:col-span-5 space-y-5">
                  <div>
                    <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>Interactive Sandbox</span>
                    </div>
                    <h3 className="text-xl font-black text-white">
                      Try Instant 1-Click AI Review Reply
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Select a sample customer review below and test how Gemini AI writes empathetic, brand-aligned replies with zero manual effort.
                    </p>
                  </div>

                  {/* Sample Reviews Picker */}
                  <div className="space-y-2.5">
                    <label className="text-xs font-bold text-slate-300">Choose a Sample Customer Review:</label>
                    <div className="space-y-2">
                      {sampleReviews.map((rev, idx) => (
                        <div
                          key={rev.id}
                          onClick={() => {
                            setSelectedReviewIdx(idx);
                            generateAiReplyDemo(idx, replyTone);
                          }}
                          className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                            selectedReviewIdx === idx
                              ? 'bg-indigo-950/40 border-indigo-500 shadow-md ring-1 ring-indigo-500/50'
                              : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-white">{rev.author}</span>
                              <span className="text-[10px] text-slate-400">({rev.businessType})</span>
                            </div>
                            <div className="flex text-amber-400">
                              {[...Array(rev.rating)].map((_, i) => (
                                <Star key={i} className="w-3 h-3 fill-amber-400" />
                              ))}
                            </div>
                          </div>
                          <p className="text-xs text-slate-300 mt-1 line-clamp-2 italic">
                            "{rev.comment}"
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tone Controls */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-300">Select AI Persona & Tone:</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'warm', label: 'Warm & Caring' },
                        { id: 'professional', label: 'Professional' },
                        { id: 'promo', label: 'VIP Perk / Promo' },
                      ].map((t) => (
                        <button
                          key={t.id}
                          onClick={() => {
                            setReplyTone(t.id as any);
                            generateAiReplyDemo(selectedReviewIdx, t.id as any);
                          }}
                          className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                            replyTone === t.id
                              ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                              : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    size="md"
                    icon={isGeneratingReply ? RefreshCw : Sparkles}
                    onClick={() => generateAiReplyDemo(selectedReviewIdx, replyTone)}
                    disabled={isGeneratingReply}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold"
                  >
                    {isGeneratingReply ? 'Generating AI Reply with Gemini...' : 'Re-Generate Reply (1 Credit)'}
                  </Button>
                </div>

                {/* Right: Simulated Live Output */}
                <div className="lg:col-span-7 bg-slate-950 rounded-2xl border border-slate-800 p-6 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs">
                        AI
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          Gemini 2.5 Flash Response
                          <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-mono">
                            0.4s Latency
                          </span>
                        </span>
                        <p className="text-[10px] text-slate-400">Ready to post to Google Maps API</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono text-purple-400 font-bold bg-purple-950/60 px-2 py-1 rounded-lg border border-purple-800/50">
                      ✨ 20 Free Credits in Trial
                    </span>
                  </div>

                  {/* Customer Review Box */}
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800/80 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-indigo-600/30 text-indigo-300 flex items-center justify-center text-[10px] font-bold">
                          {sampleReviews[selectedReviewIdx].author[0]}
                        </div>
                        <span className="font-bold text-white">{sampleReviews[selectedReviewIdx].author}</span>
                        <span className="text-[10px] text-slate-400">• {sampleReviews[selectedReviewIdx].date}</span>
                      </div>
                      <div className="flex text-amber-400">
                        {[...Array(sampleReviews[selectedReviewIdx].rating)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-300 italic">
                      "{sampleReviews[selectedReviewIdx].comment}"
                    </p>
                  </div>

                  {/* AI Generated Reply */}
                  <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-950/60 to-purple-950/60 border border-indigo-500/40 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                        <Bot className="w-3.5 h-3.5 text-indigo-400" />
                        Official Business Owner Reply (AI Generated):
                      </span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(generatedReply);
                          setCopiedReply(true);
                          setTimeout(() => setCopiedReply(false), 2000);
                        }}
                        className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                      >
                        {copiedReply ? <Check className="w-3 h-3 text-emerald-400" /> : null}
                        {copiedReply ? 'Copied!' : 'Copy Reply'}
                      </button>
                    </div>

                    <p className="text-xs text-slate-200 leading-relaxed">
                      {isGeneratingReply ? (
                        <span className="inline-flex items-center gap-2 text-indigo-400 animate-pulse">
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          Gemini AI is analyzing customer sentiment and crafting reply...
                        </span>
                      ) : (
                        generatedReply
                      )}
                    </p>
                  </div>

                  {/* Action Bar */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                    <span className="text-slate-400">
                      ⚡ Replies in 10 seconds • 100% Google SEO Policy Compliant
                    </span>
                    <Link href="/register">
                      <Button variant="primary" size="sm" icon={ArrowRight} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
                        Start Free Trial & Automate
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* ---------------- TAB 2: 1-PAGE MINI SITE ENGINE ---------------- */}
            {activeAgentTab === 'site-builder' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in fade-in">
                {/* Left: Controls */}
                <div className="lg:col-span-5 space-y-5">
                  <div>
                    <div className="flex items-center gap-2 text-sky-400 text-xs font-bold uppercase tracking-wider mb-1">
                      <Globe className="w-4 h-4" />
                      <span>Instant Mobile Site Engine</span>
                    </div>
                    <h3 className="text-xl font-black text-white">
                      Live 1-Page Mini Website Simulator
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Every Client 360 subscription includes an ultra-fast, mobile-first website hosted at <code className="text-sky-300 bg-slate-950 px-1 py-0.5 rounded">dr.com/s/your-brand</code> with direct WhatsApp booking!
                    </p>
                  </div>

                  {/* Industry Template Switcher */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-300">Select Industry Template:</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'clinic', label: 'Doctor / Clinic' },
                        { id: 'salon', label: 'Salon & Spa' },
                        { id: 'restaurant', label: 'Restaurant / Cafe' },
                        { id: 'gym', label: 'Gym / Fitness' },
                      ].map((t) => (
                        <button
                          key={t.id}
                          onClick={() => setSelectedSiteVertical(t.id as any)}
                          className={`p-2.5 rounded-xl text-xs font-bold border transition-all text-left ${
                            selectedSiteVertical === t.id
                              ? 'bg-sky-950/60 border-sky-500 text-white shadow-sm'
                              : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Device Viewport Switcher */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-300">Preview Device Viewport:</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSiteDeviceView('mobile')}
                        className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-2 transition-all ${
                          siteDeviceView === 'mobile'
                            ? 'bg-indigo-600 text-white border-indigo-500'
                            : 'bg-slate-950 text-slate-400 border-slate-800'
                        }`}
                      >
                        <Smartphone className="w-3.5 h-3.5" />
                        Mobile View (90% Traffic)
                      </button>
                      <button
                        onClick={() => setSiteDeviceView('desktop')}
                        className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-2 transition-all ${
                          siteDeviceView === 'desktop'
                            ? 'bg-indigo-600 text-white border-indigo-500'
                            : 'bg-slate-950 text-slate-400 border-slate-800'
                        }`}
                      >
                        <Laptop className="w-3.5 h-3.5" />
                        Desktop View
                      </button>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs text-slate-300">
                    <div className="flex items-center gap-2 font-bold text-white">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      Key Included Features:
                    </div>
                    <ul className="space-y-1.5 pl-6 list-disc text-slate-400 text-[11px]">
                      <li>1-Click Direct WhatsApp Booking CTAs</li>
                      <li>Interactive Google Maps Direction Link</li>
                      <li>Full Services & Pricing Menu with Photos</li>
                      <li>SEO Structured Schema for Ranchi Local Search</li>
                    </ul>
                  </div>

                  <Link href="/register" className="block">
                    <Button variant="primary" size="md" icon={Sparkles} className="w-full bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-bold">
                      Claim Your Free 1-Page Mini Site
                    </Button>
                  </Link>
                </div>

                {/* Right: Mockup Screen Preview */}
                <div className="lg:col-span-7 flex justify-center">
                  <div className={`w-full transition-all duration-300 ${
                    siteDeviceView === 'mobile' ? 'max-w-[340px]' : 'max-w-full'
                  }`}>
                    {/* Simulated Phone / Browser Frame */}
                    <div className="bg-slate-950 rounded-3xl border-4 border-slate-800 shadow-2xl overflow-hidden">
                      {/* Top Browser Bar */}
                      <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                        </div>
                        <div className="px-2.5 py-0.5 rounded-full bg-slate-950 font-mono text-[9px] text-slate-300 border border-slate-800">
                          https://dr.com/s/{selectedSiteVertical}-ranchi
                        </div>
                        <span className="text-emerald-400 font-bold">● LIVE</span>
                      </div>

                      {/* Mini Site Preview Body */}
                      <div className="p-4 space-y-4 bg-slate-900 text-slate-100 text-xs">
                        {/* Header Banner */}
                        <div className="text-center space-y-1 py-2 border-b border-slate-800">
                          <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold">
                            {currentTemplate.badge}
                          </span>
                          <h4 className="text-base font-black text-white mt-1">
                            {currentTemplate.name}
                          </h4>
                          <p className="text-[11px] text-slate-400">
                            {currentTemplate.heroTagline}
                          </p>
                          <div className="flex items-center justify-center gap-1 text-amber-400 text-[10px] font-bold pt-1">
                            <Star className="w-3 h-3 fill-amber-400" />
                            <span>{currentTemplate.rating}</span>
                          </div>
                        </div>

                        {/* Direct CTAs */}
                        <div className="grid grid-cols-2 gap-2">
                          <a
                            href={`https://wa.me/${whatsappDigits}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-center flex items-center justify-center gap-1.5 shadow-md"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </a>
                          <a
                            href="tel:+919431109876"
                            className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-center flex items-center justify-center gap-1.5 shadow-md"
                          >
                            <PhoneCall className="w-3.5 h-3.5" />
                            <span>Call Now</span>
                          </a>
                        </div>

                        {/* Services List */}
                        <div className="space-y-1.5">
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            Popular Offerings:
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                            {currentTemplate.services.map((svc, i) => (
                              <div key={i} className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-[11px] flex items-center gap-2">
                                <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                                <span className="truncate">{svc}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Timing & Location */}
                        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-[11px] text-slate-300">
                          <div className="flex items-center gap-1.5 text-slate-200 font-semibold">
                            <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                            <span className="truncate">{currentTemplate.address}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span>{currentTemplate.timing}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ---------------- TAB 3: GOOGLE MAPS RANK BOOSTER ---------------- */}
            {activeAgentTab === 'gbp' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center animate-in fade-in">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
                    <MapPin className="w-4 h-4" />
                    <span>#1 Map Pack Domination</span>
                  </div>
                  <h3 className="text-2xl font-black text-white">
                    Google Business Profile (GBP) Ranking Agent
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    When nearby customers search for your business on Google or Google Maps, 70% of clicks go exclusively to the top 3 spots. Our AI agent continuously audits and optimizes your listing.
                  </p>
                  <ul className="space-y-2.5 text-xs text-slate-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Automatic Geotagged photo uploads with longitude & latitude metadata</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Primary & secondary category synchronization</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Weekly local event and festival post auto-scheduling</span>
                    </li>
                  </ul>
                  <Link href="/register">
                    <Button variant="primary" size="md" icon={Sparkles} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold mt-2">
                      Connect Your Google Profile Free
                    </Button>
                  </Link>
                </div>

                {/* Visual Rank Card */}
                <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                    <span className="text-xs font-bold text-white">Google 3-Pack Rank Radar</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                      Position #1 • Ranchi Hub
                    </span>
                  </div>
                  <div className="space-y-2">
                    {[
                      { rank: 1, name: 'Your Business (Optimized with DR)', score: '98/100', status: 'Dominating' },
                      { rank: 2, name: 'Competitor A (Main Road)', score: '72/100', status: 'Unclaimed GBP' },
                      { rank: 3, name: 'Competitor B (Lalpur Chowk)', score: '64/100', status: 'Low Reviews' },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-xl flex items-center justify-between text-xs ${
                          item.rank === 1
                            ? 'bg-gradient-to-r from-indigo-950/80 to-purple-950/80 border border-indigo-500/50 text-white font-bold'
                            : 'bg-slate-900 border border-slate-800 text-slate-400'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                            item.rank === 1 ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-400'
                          }`}>
                            #{item.rank}
                          </span>
                          <span>{item.name}</span>
                        </div>
                        <span className={`text-[10px] ${item.rank === 1 ? 'text-emerald-400' : 'text-slate-500'}`}>
                          {item.score}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ---------------- TAB 4: COUNTER QR STAND KIT ---------------- */}
            {activeAgentTab === 'qr-stand' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center animate-in fade-in">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                    <QrCode className="w-4 h-4" />
                    <span>In-Store Review Accelerator</span>
                  </div>
                  <h3 className="text-2xl font-black text-white">
                    Smart Acrylic Counter QR Stand Kit
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Satisfied walk-in customers often forget to leave reviews. We print and deliver custom acrylic counter QR stands that directly open your 5-star Google review box in 10 seconds.
                  </p>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-emerald-400 font-bold text-sm block">10 Seconds</span>
                      <span className="text-slate-400 text-[11px]">Average scan to 5-star review time</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-indigo-400 font-bold text-sm block">+300% Boost</span>
                      <span className="text-slate-400 text-[11px]">Monthly review velocity</span>
                    </div>
                  </div>
                  <Link href="/register">
                    <Button variant="primary" size="md" icon={QrCode} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
                      Generate Your Counter QR Stand
                    </Button>
                  </Link>
                </div>

                {/* QR Visual */}
                <div className="bg-gradient-to-b from-slate-950 to-slate-900 p-8 rounded-3xl border border-slate-800 text-center space-y-3">
                  <div className="w-28 h-28 bg-white p-2 rounded-2xl mx-auto flex items-center justify-center shadow-xl">
                    <QrCode className="w-full h-full text-slate-950" />
                  </div>
                  <h4 className="text-sm font-bold text-white">Scan & Review on Google Maps</h4>
                  <div className="flex items-center justify-center gap-1 text-amber-400 text-xs">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Pre-fills 5 stars automatically on mobile cameras
                  </p>
                </div>
              </div>
            )}

            {/* ---------------- TAB 5: LOCAL GROWTH RADAR ---------------- */}
            {activeAgentTab === 'radar' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center animate-in fade-in">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-wider">
                    <TrendingUp className="w-4 h-4" />
                    <span>Real-Time Business Analytics</span>
                  </div>
                  <h3 className="text-2xl font-black text-white">
                    Local Rank & Growth Radar
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Track your business performance transparently. Real-time metrics on how many direction requests, direct phone calls, and website visits you gain every month.
                  </p>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-emerald-400 font-extrabold text-base block">+210%</span>
                      <span className="text-slate-400 text-[10px]">Phone Calls</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-sky-400 font-extrabold text-base block">+340%</span>
                      <span className="text-slate-400 text-[10px]">Directions</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-purple-400 font-extrabold text-base block">+185%</span>
                      <span className="text-slate-400 text-[10px]">Site Clicks</span>
                    </div>
                  </div>
                </div>

                {/* Radar Mockup */}
                <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-white">30-Day Growth Overview</span>
                    <span className="text-emerald-400 font-mono text-[11px] font-bold">▲ All Metrics Up</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div>
                      <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                        <span>Direct Customer Calls</span>
                        <span className="text-white font-bold">142 Calls (+48 this month)</span>
                      </div>
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full w-[82%]"></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                        <span>Google Maps Driving Directions</span>
                        <span className="text-white font-bold">380 Requests (+120%)</span>
                      </div>
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-sky-500 rounded-full w-[94%]"></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                        <span>1-Page Mini Website Clicks</span>
                        <span className="text-white font-bold">1,240 Visits</span>
                      </div>
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500 rounded-full w-[76%]"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. GREXA-STYLE "BUILT FOR SMALL BUSINESS OWNERS" INDUSTRY BENTO GRID       */}
      {/* ========================================================================= */}
      <section className="py-20 bg-slate-900 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">
              Purpose-Built for Local Verticals
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Built for Small Business Owners
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              You focus on your craft and business operations while Digital Ranchi drives your local footfall and online growth.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                title: 'Doctors & Health Clinics',
                stat: '+210% Patient Calls',
                desc: 'Instant Google appointment clicks, pediatrician & specialist keywords.',
                icon: Heart,
                color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
              },
              {
                title: 'Salons & Luxury Spas',
                stat: '+185% WhatsApp Bookings',
                desc: 'Bridal makeovers, haircut catalogs, and instant review QR stands.',
                icon: Sparkles,
                color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
              },
              {
                title: 'Restaurants, Cafes & Bars',
                stat: '+300% Footfall Growth',
                desc: 'Digital menu photo showcase, table reservations & review collection.',
                icon: Flame,
                color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
              },
              {
                title: 'Gyms & Fitness Centres',
                stat: '+140% New Members',
                desc: 'Free trial pass triggers on WhatsApp and high-intent local map SEO.',
                icon: TrendingUp,
                color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
              },
              {
                title: 'Hotels, Banquets & Venues',
                stat: '14+ Monthly Inquiries',
                desc: 'Wedding booking inquiries, hall photos & 360 virtual tours.',
                icon: Building2,
                color: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
              },
              {
                title: 'Bakers & Cake Studios',
                stat: '+220% Weekend Orders',
                desc: 'Custom cake design gallery with 1-click WhatsApp checkout.',
                icon: Star,
                color: 'text-pink-400 bg-pink-500/10 border-pink-500/20',
              },
              {
                title: 'Coaching & Tuition Hubs',
                stat: '+190% Batch Admissions',
                desc: 'Test series results, faculty showcase and verified parent reviews.',
                icon: Award,
                color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
              },
              {
                title: 'Car Garages & Handymen',
                stat: '+250% Emergency Calls',
                desc: '24/7 towing & roadside repair discovery on Google Maps search.',
                icon: Zap,
                color: 'text-teal-400 bg-teal-500/10 border-teal-500/20',
              },
            ].map((v, i) => {
              const Icon = v.icon;
              return (
                <div
                  key={i}
                  className="p-5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all space-y-3 group hover:-translate-y-1 shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${v.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {v.stat}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                      {v.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {v.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Banner under verticals */}
          <div className="mt-8 p-6 rounded-3xl bg-gradient-to-r from-indigo-950 via-purple-950 to-slate-950 border border-indigo-500/30 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left space-y-1">
              <h4 className="font-bold text-white text-base">Don’t see your exact business category?</h4>
              <p className="text-xs text-slate-300">Our AI Growth OS works for any local service, retail, or clinic business across India.</p>
            </div>
            <Link href="/register">
              <Button variant="primary" size="sm" icon={Sparkles} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 px-6">
                Start 14-Day Free Demo
              </Button>
            </Link>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. WHY LOCAL SMBs SWITCH FROM EXPENSIVE AGENCIES TO DR LOCAL OS           */}
      {/* ========================================================================= */}
      <section className="py-20 bg-slate-950 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">
              The Smarter Choice
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-2">
              Why Local Businesses are Switching to Digital Ranchi
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              Compare traditional slow marketing agencies with our automated AI Growth platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Traditional Agency */}
            <div className="p-7 rounded-3xl bg-slate-900/60 border border-rose-900/40 space-y-4">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                <span className="w-6 h-6 rounded-full bg-rose-500/20 flex items-center justify-center text-xs">✕</span>
                <span>Traditional Marketing Agencies</span>
              </div>
              <ul className="space-y-3 text-xs text-slate-400">
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">✕</span>
                  <span>Expensive retainers: ₹15,000 to ₹30,000/month with lock-in contracts</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">✕</span>
                  <span>Slow turnaround: Days to reply to customer reviews manually</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">✕</span>
                  <span>No automated software: You have no dashboard or live metrics</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">✕</span>
                  <span>Complex slow websites that take 4 weeks and cost extra</span>
                </li>
              </ul>
            </div>

            {/* Digital Ranchi AI Growth Suite */}
            <div className="p-7 rounded-3xl bg-gradient-to-b from-indigo-950/70 to-slate-900 border-2 border-indigo-500/60 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-indigo-300 font-bold text-sm">
                  <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs">✓</span>
                  <span>Digital Ranchi AI Growth OS</span>
                </div>
                <span className="text-[10px] font-black uppercase bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-full">
                  10x Faster & Smarter
                </span>
              </div>
              <ul className="space-y-3 text-xs text-slate-200">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span><strong>1/10th the cost:</strong> Starting at just ₹1,500/mo (with 14-day free demo)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span><strong>Gemini AI Automation:</strong> 1-click 10-second review replies</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span><strong>Instant 1-Page Mini Site:</strong> Ready in 2 minutes with direct WhatsApp leads</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span><strong>Client 360 Portal:</strong> Real-time direction calls & rank tracking dashboard</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. INTERACTIVE AUDIT SECTION                                              */}
      {/* ========================================================================= */}
      <section id="audit-section" className="py-20 bg-slate-900 border-b border-slate-800/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <AuditScorecard onPackageSelect={handlePackageFromAudit} />
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. PRICING PACKAGES & SAAS TRIAL SECTION                                  */}
      {/* ========================================================================= */}
      <section id="pricing-section" className="py-20 bg-slate-950 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">
              Simple, Transparent Pricing
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Choose the Right Plan for Your Business
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              No hidden fees. Instant setup with 14-day free trial on Client 360 SaaS.
            </p>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {packages.slice(0, 3).map((pkg) => (
              <div
                key={pkg.id}
                className={`rounded-3xl p-7 flex flex-col justify-between transition-all relative ${
                  pkg.isPopular
                    ? 'bg-gradient-to-b from-indigo-950 to-slate-900 text-white shadow-2xl border-2 border-indigo-500 scale-105 z-10'
                    : 'bg-slate-900 text-white border border-slate-800 shadow-sm hover:shadow-md'
                }`}
              >
                {pkg.isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-black text-xs shadow-md tracking-wider uppercase">
                    Most Popular Choice
                  </div>
                )}

                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-black tracking-tight">{pkg.name}</h3>
                      <p className={`text-xs mt-1 ${pkg.isPopular ? 'text-indigo-200' : 'text-slate-400'}`}>
                        {pkg.tagline}
                      </p>
                    </div>
                  </div>

                  <div className="my-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black">{formatINR(pkg.price)}</span>
                      <span className={`text-xs ${pkg.isPopular ? 'text-indigo-200' : 'text-slate-400'}`}>
                        {pkg.billingFrequency === 'MONTHLY' ? '/month' : 'one-time setup'}
                      </span>
                    </div>
                  </div>

                  <ul className="space-y-3 text-xs mb-8">
                    {pkg.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <CheckCircle2
                          className={`w-4 h-4 shrink-0 mt-0.5 ${
                            pkg.isPopular ? 'text-indigo-400' : 'text-emerald-400'
                          }`}
                        />
                        <span className={pkg.isPopular ? 'text-slate-200' : 'text-slate-300'}>
                          {f}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <Button
                    variant={pkg.isPopular ? 'primary' : 'outline'}
                    size="lg"
                    className="w-full font-bold"
                    onClick={() => handleOpenCheckout(pkg)}
                    icon={ArrowRight}
                  >
                    Get {pkg.name}
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* SaaS Demo Callout Card */}
          <div className="mt-12 p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 max-w-4xl mx-auto">
            <div className="space-y-1 text-center md:text-left">
              <span className="text-xs font-bold text-emerald-400 flex items-center justify-center md:justify-start gap-1.5">
                <Check className="w-4 h-4" /> Want to try the AI software first?
              </span>
              <h4 className="text-base font-bold text-white">
                Start Client 360 AI Platform 14-Day Free Demo
              </h4>
              <p className="text-xs text-slate-400">
                Includes 20 free Gemini AI credits & 1-page website. ₹1,500/month after trial.
              </p>
            </div>
            <Link href="/register" className="shrink-0 w-full md:w-auto">
              <Button variant="primary" size="md" icon={Sparkles} className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold">
                Claim 14-Day Free Trial →
              </Button>
            </Link>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. VERIFIED SOCIAL PROOF & LOCAL CASE STUDIES                             */}
      {/* ========================================================================= */}
      <section className="py-20 bg-slate-900 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">
              Proven Results
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Trusted by 250+ Leading Jharkhand Businesses
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed italic">
                "Within 30 days of placing their acrylic Review QR stand at our clinic reception, we generated 60+ new 5-star Google reviews. Our patient inquiries from Google Maps tripled."
              </p>
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">Dr. Rajesh Sahay</h4>
                  <p className="text-[11px] text-slate-400">Apex Healthcare & Diagnostic Center</p>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                  +210% Calls
                </span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed italic">
                "We were losing banquet bookings to older hotels. Digital Ranchi optimized our Google 3-Pack presence and built our mini website. We closed 14 wedding bookings directly from WhatsApp."
              </p>
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">Vikram Malhotra</h4>
                  <p className="text-[11px] text-slate-400">Hotel Maple Wood & Banquet</p>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                  Rank #1 Map Pack
                </span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed italic">
                "The monthly client portal makes approvals and reporting super clear. We review post designs in 1 click and receive full transparent growth metrics every month without chasing."
              </p>
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">Pooja Agarwal</h4>
                  <p className="text-[11px] text-slate-400">Kaveri Family Salon & Studio</p>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                  4.8⭐ Rating
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. 6-STEP PROCESS FRAMEWORK                                               */}
      {/* ========================================================================= */}
      <section className="py-20 bg-slate-950 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">
              Clear & Accountable
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Our 6-Step Growth Framework
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-center">
            {[
              { step: '01', title: 'Consultation', desc: 'Understand your target local customers in Ranchi.' },
              { step: '02', title: 'Presence Audit', desc: 'Identify critical Google Maps & review gaps.' },
              { step: '03', title: 'GBP Setup', desc: 'Geotagging, categories, and review QR stand kit.' },
              { step: '04', title: 'Mini Site Launch', desc: 'Deploy mobile 1-page site with WhatsApp link.' },
              { step: '05', title: 'AI Automation', desc: 'Gemini review replies & weekly geotagged updates.' },
              { step: '06', title: 'Monthly Growth', desc: 'Transparent call & direction metrics in Client 360.' },
            ].map((s, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="text-xs font-black text-indigo-400">{s.step}</span>
                <h4 className="font-bold text-xs text-white">{s.title}</h4>
                <p className="text-[11px] text-slate-400 leading-snug">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 9. CONFIGURABLE FAQ ACCORDION                                             */}
      {/* ========================================================================= */}
      <section className="py-20 bg-slate-900 border-b border-slate-800/80">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-12 space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">
              Got Questions?
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between font-bold text-xs sm:text-sm text-white"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform ${
                      openFaq === idx ? 'rotate-180 text-indigo-400' : ''
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="p-4 pt-0 text-xs text-slate-400 leading-relaxed border-t border-slate-800/80 animate-in fade-in">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 10. FINAL HIGH-IMPACT CTA BANNER                                          */}
      {/* ========================================================================= */}
      <section className="py-20 bg-gradient-to-r from-indigo-950 via-slate-950 to-purple-950 text-white relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Start Today in Less Than 2 Minutes</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
            Stop Losing Local Customers to Competitors on Google Maps
          </h2>

          <p className="text-xs sm:text-sm text-indigo-200 max-w-xl mx-auto">
            Run your free instant audit or start the 14-day free demo of Client 360. Includes 20 Gemini AI credits to accelerate your 5-star review replies today.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link href="/register" className="w-full sm:w-auto">
              <Button variant="primary" size="lg" icon={Sparkles} className="w-full bg-gradient-to-r from-indigo-500 via-purple-600 to-indigo-600 hover:from-indigo-600 hover:to-purple-700 text-white font-extrabold shadow-xl shadow-indigo-600/40 text-xs py-3.5 px-8">
                Start 14-Day Free Trial (20 AI Credits)
              </Button>
            </Link>
            <a href="#audit-section" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full text-white border-slate-700 hover:bg-slate-800">
                Run Free Digital Audit
              </Button>
            </a>
          </div>
        </div>
      </section>

      <Footer />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        pkg={selectedPackage}
      />
    </div>
  );
}
