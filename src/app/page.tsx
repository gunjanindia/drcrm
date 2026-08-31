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
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui';
import { AuditScorecard } from '@/components/audit/AuditScorecard';
import { CheckoutModal } from '@/components/billing/CheckoutModal';
import { globalStore } from '@/lib/store';
import { Package } from '@/types';
import { formatINR } from '@/lib/utils';

export default function HomePage() {
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const packages = globalStore.packages;

  const handleOpenCheckout = (pkg: Package) => {
    setSelectedPackage(pkg);
    setIsCheckoutOpen(true);
  };

  const handlePackageFromAudit = (pkgId: string) => {
    const pkg = packages.find((p) => p.id === pkgId) || packages[1];
    setSelectedPackage(pkg);
    setIsCheckoutOpen(true);
  };

  const faqs = [
    {
      q: 'How long does Google Maps verification and setup take?',
      a: 'Initial claim and category verification typically completes within 48 to 72 hours under our standard operating SLA. Our team handles address geotagging, category mapping, and business hours directly.',
    },
    {
      q: 'Do you guarantee 5-star reviews on Google?',
      a: 'We never fabricate reviews or manipulate algorithms. We provide custom acrylic QR stands and automated WhatsApp review request links so your genuine in-store customers can submit 5-star reviews effortlessly in 10 seconds.',
    },
    {
      q: 'What is included in the 1-Page Mini Website?',
      a: 'You get a blazing-fast, mobile-optimized website featuring your business photo gallery, service price list, opening hours, interactive Google Map directions, and direct 1-click WhatsApp & phone call buttons.',
    },
    {
      q: 'Are taxes applicable to these packages?',
      a: 'Digital Ranchi currently operates in Non-GST mode (Bill of Supply). There are no additional tax surcharges. The price you see is the final price.',
    },
    {
      q: 'Can I upgrade from Starter to Premium Retainer later?',
      a: 'Yes, anytime! When upgrading, your account manager will transition your account seamlessly and begin weekly geotagged updates, social creatives, and monthly growth reporting.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
      <Navbar />

      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
        {/* Glow ambient backgrounds */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-indigo-500/15 to-sky-400/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/80 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Rank #1 on Google Maps in Ranchi & Jharkhand</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1]">
              Get Your Business Found on{' '}
              <span className="bg-gradient-to-r from-indigo-600 via-sky-500 to-indigo-600 bg-clip-text text-transparent">
                Google & WhatsApp
              </span>
            </h1>

            {/* Supporting Subheadline */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto font-normal">
              Get more calls, direct showroom visits, map directions, genuine 5-star reviews, and WhatsApp inquiries from customers searching for businesses like yours.
            </p>

            {/* CTA Group */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <a href="#audit-section" className="w-full sm:w-auto">
                <Button variant="primary" size="lg" icon={Sparkles} className="w-full shadow-indigo-600/30">
                  Get Free Digital Presence Audit
                </Button>
              </a>
              <a href="#pricing-section" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" icon={ArrowRight} className="w-full">
                  View Packages (From ₹499)
                </Button>
              </a>
              <a
                href="https://wa.me/919431109876?text=Hi%20Digital%20Ranchi,%20I%20want%20to%20talk%20to%20an%20expert"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto"
              >
                <Button variant="secondary" size="lg" icon={MessageCircle} className="w-full shadow-sky-600/20">
                  Talk to Expert
                </Button>
              </a>
            </div>

            {/* Trust Metric Strip */}
            <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Verified Local Partner</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>4.8/5 Rating Across 250+ Ranchi SMBs</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-indigo-500" />
                <span>48-Hour Onboarding SLA</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THE LOCAL PROBLEM SECTION */}
      <section className="py-16 bg-white dark:bg-slate-900 border-y border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-rose-500">
              The Cost of Invisibility
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-2">
              Why Local Businesses Lose 70% of Nearby Customers
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
              Every day, thousands of people in Ranchi search for clinics, restaurants, shops, and coaching centers on their phones. If you are not in the Top 3 Map Pack, they go to your competitor.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-rose-50/40 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/15 text-rose-600 flex items-center justify-center font-bold">
                01
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Unclaimed or Unranked Maps Profile
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                When customers search for "near me", Google hides businesses with missing categories, wrong geotags, or unverified hours.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-600 flex items-center justify-center font-bold">
                02
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Zero Frictionless Review System
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Happy customers walk out without leaving a review because typing your business name and searching is too slow. Without a direct QR stand, review count stagnates.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-900/40 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/15 text-indigo-600 flex items-center justify-center font-bold">
                03
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                No Fast WhatsApp Landing Page
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Customers hesitate to call unknown numbers. Without a 1-page mini website with direct 1-click WhatsApp messaging, you lose high-intent leads.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. HOW DIGITAL RANCHI HELPS (THE 5-PILLAR SYSTEM) */}
      <section className="py-20 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
              The Growth Ecosystem
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-2">
              Everything Your Local Business Needs to Win Online
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2.5 text-center">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 mx-auto flex items-center justify-center">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Google Maps Setup</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Address geotagging, exact categories, verified phone number & business hours.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2.5 text-center">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 mx-auto flex items-center justify-center">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Smart Review QR Stand</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Custom printable acrylic stand design for in-store 10-second 5-star customer reviews.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2.5 text-center">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-600 mx-auto flex items-center justify-center">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">1-Page Mini Website</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Fast mobile landing page with photo gallery, services, map directions & CTAs.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2.5 text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 mx-auto flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Local Map Pack SEO</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Local directory citations, keyword rank tracking, and competitor outranking.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2.5 text-center">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-600 mx-auto flex items-center justify-center">
                <MessageCircle className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">WhatsApp Integration</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                1-click WhatsApp buttons on Google, Website & QR stands to capture hot inquiries.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. INTERACTIVE AUDIT SECTION */}
      <section id="audit-section" className="py-20 bg-white dark:bg-slate-900 border-y border-slate-200/80 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <AuditScorecard onPackageSelect={handlePackageFromAudit} />
        </div>
      </section>

      {/* 5. PRICING PACKAGES SECTION */}
      <section id="pricing-section" className="py-20 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
              Simple, Transparent Pricing
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mt-2">
              Choose the Right Plan for Your Business
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
              No hidden fees. Razorpay instant checkout with automated 7-day kickoff.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {packages.slice(0, 3).map((pkg) => (
              <div
                key={pkg.id}
                className={`rounded-3xl p-7 flex flex-col justify-between transition-all relative ${
                  pkg.isPopular
                    ? 'bg-slate-900 text-white shadow-2xl border-2 border-indigo-500 scale-105 z-10'
                    : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md'
                }`}
              >
                {pkg.isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-sky-400 text-slate-950 font-bold text-xs shadow-md tracking-wider uppercase">
                    Most Popular Choice
                  </div>
                )}

                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-black tracking-tight">{pkg.name}</h3>
                      <p className={`text-xs mt-1 ${pkg.isPopular ? 'text-slate-300' : 'text-slate-500'}`}>
                        {pkg.tagline}
                      </p>
                    </div>
                  </div>

                  <div className="my-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black">{formatINR(pkg.price)}</span>
                      <span className={`text-xs ${pkg.isPopular ? 'text-slate-300' : 'text-slate-500'}`}>
                        {pkg.billingFrequency === 'MONTHLY' ? '/month' : 'one-time setup'}
                      </span>
                    </div>
                  </div>

                  <ul className="space-y-3 text-xs mb-8">
                    {pkg.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <CheckCircle2
                          className={`w-4 h-4 shrink-0 mt-0.5 ${
                            pkg.isPopular ? 'text-indigo-400' : 'text-emerald-500'
                          }`}
                        />
                        <span className={pkg.isPopular ? 'text-slate-200' : 'text-slate-700 dark:text-slate-300'}>
                          {f}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <Button
                    variant={pkg.isPopular ? 'amber' : 'primary'}
                    size="lg"
                    className="w-full"
                    onClick={() => handleOpenCheckout(pkg)}
                    icon={ArrowRight}
                  >
                    Get {pkg.name}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. VERIFIED SOCIAL PROOF & CASE STUDIES */}
      <section className="py-20 bg-white dark:bg-slate-900 border-y border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
              Proven Results
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-2">
              Trusted by 250+ Leading Ranchi Businesses
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center gap-1 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-500" />
                ))}
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic">
                "Within 30 days of placing their acrylic Review QR stand at our clinic reception, we generated 60+ new 5-star Google reviews. Our patient inquiries from Google Maps tripled."
              </p>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Dr. Alok Srivastava</h4>
                  <p className="text-[11px] text-slate-500">Ranchi Dental Care & Implant Center</p>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  +210% Calls
                </span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center gap-1 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-500" />
                ))}
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic">
                "We were losing banquet bookings to older hotels. Digital Ranchi optimized our Google 3-Pack presence and built our mini website. We closed 14 wedding bookings directly from WhatsApp."
              </p>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Vikram Malhotra</h4>
                  <p className="text-[11px] text-slate-500">Hotel Maple Wood & Banquet</p>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Rank #1 Map Pack
                </span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center gap-1 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-500" />
                ))}
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic">
                "The monthly client portal makes approvals and reporting super clear. We review post designs in 1 click and receive full transparent growth metrics every month without chasing."
              </p>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Pooja Agarwal</h4>
                  <p className="text-[11px] text-slate-500">Kaveri Family Salon & Studio</p>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  4.7⭐ Rating
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. 6-STEP PROCESS */}
      <section className="py-20 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
              Clear & Accountable
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-2">
              Our 6-Step Growth Framework
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-center">
            {[
              { step: '01', title: 'Consultation', desc: 'Understand your local market & target customer base.' },
              { step: '02', title: 'Presence Audit', desc: 'Identify critical Google Maps & review gaps.' },
              { step: '03', title: 'Setup & Verification', desc: 'Geotagging, categories, and review QR kit.' },
              { step: '04', title: 'Launch', desc: 'Deploy mini website & publish optimized GBP profile.' },
              { step: '05', title: 'Growth', desc: 'Weekly posts, review responses, and citation building.' },
              { step: '06', title: 'Monthly Report', desc: 'Transparent call & direction metrics in Client Portal.' },
            ].map((s, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">{s.step}</span>
                <h4 className="font-bold text-xs text-slate-900 dark:text-white">{s.title}</h4>
                <p className="text-[11px] text-slate-500 leading-snug">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. CONFIGURABLE FAQ SECTION */}
      <section className="py-20 bg-white dark:bg-slate-900 border-y border-slate-200/80 dark:border-slate-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
              Got Questions?
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-2">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between font-bold text-xs sm:text-sm text-slate-900 dark:text-white"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform ${
                      openFaq === idx ? 'rotate-180 text-indigo-600' : ''
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="p-4 pt-0 text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-200/60 dark:border-slate-800/60 animate-in fade-in">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. FINAL HIGH-IMPACT CTA */}
      <section className="py-20 bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Start Today in Less Than 2 Minutes</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
            Stop Losing Customers to Competitors on Google Maps
          </h2>

          <p className="text-xs sm:text-sm text-indigo-200 max-w-xl mx-auto">
            Run your free instant audit or pick a package today. Our team starts your optimization within 48 hours with guaranteed SLA accountability.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <a href="#audit-section" className="w-full sm:w-auto">
              <Button variant="amber" size="lg" icon={Sparkles} className="w-full">
                Check Your Digital Presence Free
              </Button>
            </a>
            <a href="#pricing-section" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full text-white border-slate-700 hover:bg-slate-800">
                View Growth Plans
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
