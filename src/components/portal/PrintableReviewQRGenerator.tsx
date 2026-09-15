'use client';

import React, { useState } from 'react';
import {
  QrCode,
  Printer,
  Download,
  Star,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui';

export interface PrintableReviewQRGeneratorProps {
  businessName?: string;
  category?: string;
  city?: string;
  googleReviewUrl?: string;
}

export const PrintableReviewQRGenerator: React.FC<PrintableReviewQRGeneratorProps> = ({
  businessName = 'Your Business Name',
  category = 'Retail & Commercial Store',
  city = '',
  googleReviewUrl = 'https://business.google.com/reviews',
}) => {
  const [standTitle, setStandTitle] = useState('Help Us Grow with Your 5-Star Feedback!');
  const [standSub, setStandSub] = useState('Scan with your phone camera to share your valuable review on Google Maps');
  const [accentTheme, setAccentTheme] = useState<'indigo' | 'emerald' | 'amber' | 'dark'>('indigo');
  const [standFormat, setStandFormat] = useState<'stand' | 'tent' | 'sticker'>('stand');
  const [copiedLink, setCopiedLink] = useState(false);

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
    googleReviewUrl
  )}&color=0f172a&bgcolor=ffffff`;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(googleReviewUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const getThemeClass = () => {
    switch (accentTheme) {
      case 'emerald':
        return 'from-emerald-600 to-teal-800 border-emerald-500';
      case 'amber':
        return 'from-amber-500 to-orange-700 border-amber-400';
      case 'dark':
        return 'from-slate-900 to-slate-950 border-slate-700';
      case 'indigo':
      default:
        return 'from-indigo-600 via-sky-600 to-blue-700 border-indigo-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <QrCode className="w-5 h-5 text-indigo-600" />
            Printable Google Review QR Stand Generator (All Businesses)
          </h3>
          <p className="text-xs text-slate-500">
            Generate acrylic counter stands, table tents, and review stickers that redirect customers straight to your Google Maps review page.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" icon={copiedLink ? Check : Copy} onClick={handleCopyLink}>
            {copiedLink ? 'Link Copied!' : 'Copy Review Link'}
          </Button>
          <Button variant="primary" size="sm" icon={Printer} onClick={handlePrint}>
            Print / Save PDF Stand
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls & Customization */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3.5">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">
              Stand Customization
            </h4>

            <div>
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Display Headline
              </label>
              <input
                type="text"
                value={standTitle}
                onChange={(e) => setStandTitle(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Subtext & Guidance
              </label>
              <textarea
                value={standSub}
                onChange={(e) => setStandSub(e.target.value)}
                rows={2}
                className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            {/* Stand Format */}
            <div>
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Card Format / Size
              </label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <button
                  onClick={() => setStandFormat('stand')}
                  className={`p-2 rounded-xl border text-center font-semibold transition-all ${
                    standFormat === 'stand'
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950 text-indigo-600'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600'
                  }`}
                >
                  Acrylic Stand (5x7)
                </button>
                <button
                  onClick={() => setStandFormat('tent')}
                  className={`p-2 rounded-xl border text-center font-semibold transition-all ${
                    standFormat === 'tent'
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950 text-indigo-600'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600'
                  }`}
                >
                  Table Tent (A5)
                </button>
                <button
                  onClick={() => setStandFormat('sticker')}
                  className={`p-2 rounded-xl border text-center font-semibold transition-all ${
                    standFormat === 'sticker'
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950 text-indigo-600'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600'
                  }`}
                >
                  Counter Sticker
                </button>
              </div>
            </div>

            {/* Theme Colors */}
            <div>
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Header Color Palette
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setAccentTheme('indigo')}
                  className={`w-7 h-7 rounded-full bg-indigo-600 border-2 ${
                    accentTheme === 'indigo' ? 'border-slate-900 dark:border-white ring-2 ring-indigo-400' : 'border-transparent'
                  }`}
                />
                <button
                  onClick={() => setAccentTheme('emerald')}
                  className={`w-7 h-7 rounded-full bg-emerald-600 border-2 ${
                    accentTheme === 'emerald' ? 'border-slate-900 dark:border-white ring-2 ring-emerald-400' : 'border-transparent'
                  }`}
                />
                <button
                  onClick={() => setAccentTheme('amber')}
                  className={`w-7 h-7 rounded-full bg-amber-500 border-2 ${
                    accentTheme === 'amber' ? 'border-slate-900 dark:border-white ring-2 ring-amber-400' : 'border-transparent'
                  }`}
                />
                <button
                  onClick={() => setAccentTheme('dark')}
                  className={`w-7 h-7 rounded-full bg-slate-900 border-2 ${
                    accentTheme === 'dark' ? 'border-indigo-600 ring-2 ring-slate-400' : 'border-transparent'
                  }`}
                />
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs space-y-2">
            <span className="font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              Direct-to-Google Review URL Configured
            </span>
            <p className="text-slate-600 dark:text-slate-400 text-[11px] truncate font-mono">
              {googleReviewUrl}
            </p>
          </div>
        </div>

        {/* Right Preview Card: Print Layout */}
        <div className="lg:col-span-7 flex justify-center">
          <div
            id="printable-qr-stand"
            className={`w-full max-w-[380px] bg-white text-slate-900 rounded-3xl border-4 shadow-2xl overflow-hidden flex flex-col items-center text-center p-6 space-y-4`}
          >
            {/* Header Brand Bar */}
            <div className={`w-full p-4 rounded-2xl bg-gradient-to-r ${getThemeClass()} text-white space-y-1 shadow-md`}>
              <div className="flex items-center justify-center gap-1 text-amber-300">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-300" />
                ))}
              </div>
              <h3 className="text-base font-black tracking-tight">{businessName}</h3>
              <p className="text-[10px] text-white/80 font-medium uppercase tracking-wider">{category} • {city}</p>
            </div>

            {/* Stand Main Prompt */}
            <div className="space-y-1">
              <h2 className="text-sm font-black text-slate-900 tracking-tight leading-snug">
                {standTitle}
              </h2>
              <p className="text-[11px] text-slate-500 max-w-[280px] mx-auto">
                {standSub}
              </p>
            </div>

            {/* The Actual QR Code Container with Frame */}
            <div className="p-4 rounded-3xl bg-slate-50 border-2 border-slate-200 shadow-inner flex flex-col items-center space-y-2">
              <div className="w-44 h-44 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrImageUrl}
                  alt="Google Review QR"
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                <QrCode className="w-3.5 h-3.5 text-indigo-600" />
                <span>Instant Google Review</span>
              </div>
            </div>

            {/* 3 Step Instruction Pills */}
            <div className="w-full grid grid-cols-3 gap-1.5 text-[10px] text-slate-600 pt-1">
              <div className="p-2 rounded-xl bg-slate-100 font-semibold">
                <span className="block font-black text-indigo-600">1</span>
                <span>Open Camera</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-100 font-semibold">
                <span className="block font-black text-indigo-600">2</span>
                <span>Scan QR</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-100 font-semibold">
                <span className="block font-black text-indigo-600">3</span>
                <span>Rate 5★</span>
              </div>
            </div>

            {/* Footer Watermark */}
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest pt-2">
              Powered by Digital Ranchi • Verified Business Hub
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
