'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  Phone,
  MessageCircle,
  MapPin,
  Clock,
  Star,
  CheckCircle2,
  ShieldCheck,
  ChevronDown,
  ArrowRight,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import {
  buildGeneratedWebsiteData,
  GeneratedWebsiteData,
  CATEGORY_THEMES,
} from '@/lib/one-page-site-engine';
import { getSyncedBusinessProfile } from '@/lib/client-portal-sync';

export default function PublicOnePageWebsite() {
  const params = useParams();
  const slug = params?.slug as string;
  const [siteData, setSiteData] = useState<GeneratedWebsiteData | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  useEffect(() => {
    const profile = getSyncedBusinessProfile();
    const data = buildGeneratedWebsiteData({
      businessName: profile.businessName || 'Your Business Name',
      category: profile.category || 'Local Business',
      city: profile.city || '',
      address: profile.address || '',
      phone: profile.phone || '+91 94311 00000',
      whatsapp: profile.whatsapp || '919431100000',
      email: profile.email || '',
      googleMapsUrl: profile.googleMapsUrl || '',
      rating: profile.averageRating || 4.9,
      reviewCount: profile.reviewCount || 30,
      customHeadline: profile.miniSiteConfig?.headline,
      customSubheadline: profile.miniSiteConfig?.subheadline,
      customAbout: profile.miniSiteConfig?.aboutText,
      customServices: profile.miniSiteConfig?.services,
      realReviews: profile.reviews?.map((r) => ({
        authorName: r.authorName,
        rating: r.rating,
        text: r.content,
        relativeTime: r.date,
      })),
    });
    setSiteData(data);
  }, [slug]);

  if (!siteData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white text-sm">
        Loading verified website...
      </div>
    );
  }

  const theme = siteData.theme;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased pb-20 sm:pb-0">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-xl ${theme.accentBg} text-white font-black flex items-center justify-center text-xs shadow-xs`}>
              {siteData.businessName.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <span className="font-extrabold text-sm sm:text-base text-slate-900 block leading-tight">
                {siteData.businessName}
              </span>
              <span className="text-[10px] text-slate-500 font-medium">
                {siteData.category}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`https://wa.me/${siteData.whatsapp}`}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-1.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-current" />
              <span className="hidden sm:inline">WhatsApp</span>
            </a>
            <a
              href={`tel:${siteData.phone}`}
              className={`px-3.5 py-1.5 rounded-full ${theme.accentBg} text-white font-bold text-xs flex items-center gap-1.5 shadow-sm hover:opacity-95 transition-all`}
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call Now</span>
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className={`py-14 sm:py-20 px-4 sm:px-6 bg-gradient-to-br ${theme.gradient} text-white text-center relative overflow-hidden`}>
        <div className="max-w-4xl mx-auto space-y-5 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-amber-300 font-bold text-xs uppercase tracking-wider">
            <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
            <span>★ {siteData.rating} Rating on Google Maps ({siteData.reviewCount}+ Verified Reviews)</span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight sm:leading-tight">
            {siteData.headline}
          </h1>

          <p className="text-sm sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {siteData.subheadline}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            <a
              href={`https://wa.me/${siteData.whatsapp}`}
              target="_blank"
              rel="noreferrer"
              className="px-6 py-3 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm flex items-center gap-2 shadow-lg transition-transform active:scale-95"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>{theme.primaryCtaText}</span>
            </a>
            <a
              href={`tel:${siteData.phone}`}
              className="px-6 py-3 rounded-full bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm flex items-center gap-2 shadow-lg transition-transform active:scale-95"
            >
              <Phone className="w-4 h-4" />
              <span>{theme.secondaryCtaText}</span>
            </a>
            <a
              href={siteData.googleMapsUrl}
              target="_blank"
              rel="noreferrer"
              className="px-5 py-3 rounded-full bg-white/15 hover:bg-white/25 text-white font-bold text-sm flex items-center gap-2 border border-white/20 transition-all"
            >
              <MapPin className="w-4 h-4 text-rose-400" />
              <span>Get Directions</span>
            </a>
          </div>
        </div>
      </section>

      {/* Trust Highlights Bar */}
      <div className="bg-white border-b border-slate-200 py-4 px-4 shadow-xs">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-2">
            <div className="text-lg sm:text-xl font-black text-slate-900">{siteData.rating}⭐ Rating</div>
            <div className="text-xs text-slate-500">Google Verified Profile</div>
          </div>
          <div className="p-2">
            <div className="text-lg sm:text-xl font-black text-slate-900">{siteData.reviewCount}+ Reviews</div>
            <div className="text-xs text-slate-500">Authentic Customer Feedback</div>
          </div>
          <div className="p-2">
            <div className="text-lg sm:text-xl font-black text-emerald-600">100% Genuine</div>
            <div className="text-xs text-slate-500">Direct Local Service</div>
          </div>
          <div className="p-2">
            <div className="text-lg sm:text-xl font-black text-indigo-600">Fast Response</div>
            <div className="text-xs text-slate-500">WhatsApp & Phone Active</div>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <section className="py-14 sm:py-18 px-4 sm:px-6 max-w-6xl mx-auto space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-block text-xs font-bold uppercase tracking-wider text-slate-400">
            {theme.name}
          </div>
          <h2 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {theme.servicesTitle}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            {theme.servicesSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {siteData.services.map((srv, idx) => (
            <div
              key={idx}
              className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 hover:border-slate-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 relative"
            >
              {srv.badge && (
                <span className="absolute top-4 right-4 text-[10px] font-extrabold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full border border-slate-200">
                  {srv.badge}
                </span>
              )}
              <div className="space-y-2">
                <div className={`w-8 h-8 rounded-xl ${theme.accentBg}/10 text-slate-900 flex items-center justify-center font-bold text-xs`}>
                  {idx + 1}
                </div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">{srv.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{srv.desc}</p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">{srv.price || 'Best Rates'}</span>
                <a
                  href={`https://wa.me/${siteData.whatsapp}?text=Hi%20${encodeURIComponent(siteData.businessName)},%20I%20want%20to%20inquire%20about%20${encodeURIComponent(srv.title)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                >
                  <span>Inquire</span>
                  <ArrowRight className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Customer Reviews Section */}
      <section className="py-14 sm:py-18 px-4 sm:px-6 bg-slate-100/70 border-y border-slate-200">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              What Customers Say on Google Maps
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Verified {siteData.rating}★ rating based on authentic reviews.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {siteData.reviews.map((rev, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center gap-1 text-amber-400">
                  {Array.from({ length: rev.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-slate-700 italic leading-relaxed">
                  "{rev.text}"
                </p>
                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 text-slate-500">
                  <span className="font-bold text-slate-900">{rev.authorName}</span>
                  <span>{rev.relativeTime}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Category FAQ Section */}
      <section className="py-14 sm:py-18 px-4 sm:px-6 max-w-4xl mx-auto space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Answers to common customer questions about our {siteData.category.toLowerCase()} services.
          </p>
        </div>

        <div className="space-y-3">
          {siteData.faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left font-bold text-xs sm:text-sm text-slate-900 flex items-center justify-between gap-3 hover:bg-slate-50"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                  <div className="p-4 sm:p-5 pt-0 text-xs text-slate-600 leading-relaxed border-t border-slate-100">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Location & Operating Hours */}
      <section className="py-14 sm:py-18 px-4 sm:px-6 bg-white border-t border-slate-200">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Visit Us or Get in Touch
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Convenient location with prompt customer support.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs">
                  <span className="font-extrabold text-sm text-slate-900 block">Address Location:</span>
                  <p className="text-slate-600 leading-relaxed">{siteData.address}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs">
                  <span className="font-extrabold text-sm text-slate-900 block">Operating Hours:</span>
                  <p className="text-slate-600">{siteData.workingHours}</p>
                  <span className="inline-block font-bold text-emerald-600 text-[11px]">
                    ✓ Open Today
                  </span>
                </div>
              </div>

              <a
                href={siteData.googleMapsUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <MapPin className="w-4 h-4 text-rose-400" />
                <span>Open in Google Maps / Get Directions</span>
              </a>
            </div>

            {/* Direct Contact Box */}
            <div className="p-6 rounded-3xl bg-slate-900 text-white space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-wider">
                  Direct Response
                </span>
                <h3 className="text-lg font-bold">Have a Question or Looking for a Quote?</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Call our team directly or message on WhatsApp. We respond promptly to all incoming queries.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <a
                  href={`tel:${siteData.phone}`}
                  className="py-3 rounded-2xl bg-white text-slate-900 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md hover:bg-slate-100 transition-all"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call {siteData.phone}</span>
                </a>
                <a
                  href={`https://wa.me/${siteData.whatsapp}`}
                  target="_blank"
                  rel="noreferrer"
                  className="py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all"
                >
                  <MessageCircle className="w-3.5 h-3.5 fill-current" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-8 px-4 text-center text-xs space-y-2">
        <p className="font-bold text-white text-sm">{siteData.businessName}</p>
        <p className="text-slate-500">Official Google Business Profile Verified 1-Page Website</p>
        <p className="text-[10px] text-slate-600">© {new Date().getFullYear()} {siteData.businessName}. All rights reserved.</p>
      </footer>

      {/* Mobile Floating Sticky CTA */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 p-2.5 shadow-2xl grid grid-cols-2 gap-2">
        <a
          href={`tel:${siteData.phone}`}
          className={`py-2.5 rounded-xl ${theme.accentBg} text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm`}
        >
          <Phone className="w-3.5 h-3.5" />
          <span>Call Now</span>
        </a>
        <a
          href={`https://wa.me/${siteData.whatsapp}`}
          target="_blank"
          rel="noreferrer"
          className="py-2.5 rounded-xl bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm"
        >
          <MessageCircle className="w-3.5 h-3.5 fill-current" />
          <span>WhatsApp</span>
        </a>
      </div>
    </div>
  );
}
