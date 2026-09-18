'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  QrCode,
  Truck,
  CheckCircle2,
  Clock,
  ExternalLink,
  Download,
  Copy,
  ToggleLeft,
  ToggleRight,
  ShieldCheck,
  Sparkles,
  Smartphone,
  Radio,
  Share2,
  RefreshCw,
  Package,
  Layers,
  MapPin,
  Flame,
  Printer,
  ChevronRight,
} from 'lucide-react';
import { usePortalProfile } from '@/contexts/PortalProfileContext';

export default function AiStandeeManagementPage() {
  const { profile } = usePortalProfile();
  const [standeeData, setStandeeData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [nfcSimulating, setNfcSimulating] = useState(false);

  // Form states
  const [isNfcActive, setIsNfcActive] = useState(true);
  const [isQrActive, setIsQrActive] = useState(true);
  const [directGoogleReviewUrl, setDirectGoogleReviewUrl] = useState('');

  const fetchStandeeData = () => {
    fetch('/api/portal/standee')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setStandeeData(data.data);
          if (data.data.order) {
            setIsNfcActive(data.data.order.isNfcActive ?? true);
            setIsQrActive(data.data.order.isQrActive ?? true);
            setDirectGoogleReviewUrl(data.data.order.directGoogleReviewUrl || profile.googleMapsUrl || '');
          }
        }
      })
      .catch((err) => console.error('Error loading standee data:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStandeeData();
  }, []);

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/portal/standee', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: standeeData?.order?.id,
          isNfcActive,
          isQrActive,
          directGoogleReviewUrl,
        }),
      });
      const data = await res.json();
      if (data.success) {
        fetchStandeeData();
      }
    } catch (e) {
      console.error('Error saving standee settings:', e);
    } finally {
      setSaving(false);
    }
  };

  const order = standeeData?.order || {
    status: 'IN_PRODUCTION',
    trackingId: 'DEL992817462',
    courier: 'Delhivery',
    courierUrl: 'https://www.delhivery.com',
    shippingAddress: profile.address || 'Ranchi, Jharkhand',
    qrSlug: profile.businessName?.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'my-business',
    nfcUid: 'NFC-DR-8829104',
  };

  const publicReviewUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/r/${order.qrSlug}`
    : `https://digitalranchi.in/r/${order.qrSlug}`;

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(publicReviewUrl)}&color=0f172a&bgcolor=ffffff&margin=15`;

  const copyPublicLink = () => {
    navigator.clipboard.writeText(publicReviewUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const simulateNfcTap = () => {
    setNfcSimulating(true);
    setTimeout(() => {
      setNfcSimulating(false);
      window.open(`/r/${order.qrSlug}?nfc=1`, '_blank');
    }, 1200);
  };

  // 4 Delivery Stages Stepper logic
  const stages = [
    { key: 'ORDER_PLACED', label: 'Order Placed', desc: 'Hardware & Acrylic Specs Verified' },
    { key: 'IN_PRODUCTION', label: 'Manufacturing', desc: 'UV Laser Engraving & NFC Chip Encoding' },
    { key: 'DISPATCHED', label: 'Shipped (Free India Delivery)', desc: `${order.courier || 'Express Courier'} • AWB: ${order.trackingId || 'In Transit'}` },
    { key: 'DELIVERED', label: 'Delivered', desc: 'Placed on Countertop & Live on Google Maps' },
  ];

  const currentStageIdx =
    order.status === 'DELIVERED' ? 3 : order.status === 'DISPATCHED' ? 2 : order.status === 'IN_PRODUCTION' ? 1 : 0;

  return (
    <div className="space-y-6 max-w-6xl pb-10">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
              <Radio className="w-3 h-3 animate-pulse" />
              Smart NFC + QR Hardware Suite
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold">
              Free India Delivery
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            AI Smart Standee & Hardware Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Monitor real-time shipment status, configure review redirect URLs, download print assets, and simulate NFC customer taps.
          </p>
        </div>

        {/* Quick links */}
        <div className="flex items-center gap-2">
          <Link
            href="/portal/qr-stand"
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-700"
          >
            <Printer className="w-3.5 h-3.5 text-indigo-400" />
            Printable Stand Generator
          </Link>
          <Link
            href="/portal/ai-settings"
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI Review Prompt Settings
          </Link>
        </div>
      </div>

      {/* SECTION 1: PHYSICAL STANDEE SHIPPING TRACKER (4 STAGES) */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Physical Acrylic Standee Delivery Status
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black border border-emerald-500/40 uppercase">
                  Included in Plan
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Destination: <strong className="text-slate-200">{order.shippingAddress}</strong>
              </p>
            </div>
          </div>

          {order.trackingId && (
            <a
              href={order.courierUrl || `https://www.google.com/search?q=${order.trackingId}+tracking`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-indigo-600/30 hover:border-indigo-500 text-indigo-300 text-xs font-bold transition-all border border-slate-700 flex items-center gap-2 shrink-0"
            >
              <span>Track via {order.courier || 'Courier'} ({order.trackingId})</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        {/* Visual Progress Stepper */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
          {stages.map((stg, idx) => {
            const isCompleted = idx <= currentStageIdx;
            const isCurrent = idx === currentStageIdx;
            return (
              <div
                key={stg.key}
                className={`p-4 rounded-2xl border transition-all ${
                  isCurrent
                    ? 'bg-indigo-950/40 border-indigo-500 ring-2 ring-indigo-500/20 shadow-lg'
                    : isCompleted
                    ? 'bg-slate-950/60 border-emerald-500/40 text-slate-200'
                    : 'bg-slate-950/30 border-slate-800/80 text-slate-500'
                }`}
              >
                <div className="flex items-center gap-2.5 mb-2">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                      isCompleted
                        ? 'bg-emerald-500 text-slate-950'
                        : isCurrent
                        ? 'bg-indigo-600 text-white animate-pulse'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {isCompleted ? '✓' : idx + 1}
                  </div>
                  <span className={`text-xs font-bold ${isCompleted ? 'text-white' : 'text-slate-400'}`}>
                    {stg.label}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">{stg.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: DEVICE CONFIGURATION & SIMULATION GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Device Configuration Form (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-indigo-400" />
                  Hardware Device Configuration
                </h3>
                <p className="text-xs text-slate-400">
                  Manage NFC chip status, dynamic QR routing, and Google review target URLs.
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">NFC UID</span>
                <span className="text-xs font-mono font-bold text-indigo-400">{order.nfcUid || 'NFC-DR-8829104'}</span>
              </div>
            </div>

            {/* Hardware Status Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">NFC Tap Sensor</span>
                  <span className="text-[11px] text-slate-400">Instant tap for all smartphones</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsNfcActive(!isNfcActive)}
                  className="text-2xl transition-transform active:scale-95"
                >
                  {isNfcActive ? (
                    <ToggleRight className="w-9 h-9 text-emerald-400" />
                  ) : (
                    <ToggleLeft className="w-9 h-9 text-slate-600" />
                  )}
                </button>
              </div>

              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">Dynamic QR Code</span>
                  <span className="text-[11px] text-slate-400">High-res camera scan code</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsQrActive(!isQrActive)}
                  className="text-2xl transition-transform active:scale-95"
                >
                  {isQrActive ? (
                    <ToggleRight className="w-9 h-9 text-emerald-400" />
                  ) : (
                    <ToggleLeft className="w-9 h-9 text-slate-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Direct Google Review Dialog URL */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>Google Business Profile Review Dialog URL</span>
                <span className="text-[10px] text-emerald-400 font-semibold">Verified Direct Link</span>
              </label>
              <input
                type="url"
                value={directGoogleReviewUrl}
                onChange={(e) => setDirectGoogleReviewUrl(e.target.value)}
                placeholder="https://maps.google.com/?cid=..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
              <p className="text-[11px] text-slate-500">
                Customers selecting 4 or 5 stars will be directly redirected to this Google Maps review dialog.
              </p>
            </div>

            {/* Public Dynamic QR Link & Actions */}
            <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">Live Standee Review Page URL</span>
                <button
                  type="button"
                  onClick={copyPublicLink}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                >
                  {copiedLink ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedLink ? 'Copied Link!' : 'Copy Link'}
                </button>
              </div>
              <div className="p-2.5 bg-black/40 rounded-xl font-mono text-[11px] text-slate-300 break-all border border-slate-800">
                {publicReviewUrl}
              </div>
              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={simulateNfcTap}
                  disabled={nfcSimulating}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-purple-600/20 flex items-center justify-center gap-2"
                >
                  <Radio className={`w-4 h-4 ${nfcSimulating ? 'animate-spin' : 'animate-pulse'}`} />
                  {nfcSimulating ? 'Simulating NFC Phone Tap...' : 'Test NFC Phone Tap Simulator'}
                </button>
                <a
                  href={`/r/${order.qrSlug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-700 shrink-0"
                >
                  <span>Open Live</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Save Settings Button */}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={handleSaveSettings}
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2"
              >
                {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                {saving ? 'Saving...' : 'Save Hardware Settings'}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Print-Ready QR Stand Preview & Downloads (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-xl text-center">
            <h3 className="text-base font-bold text-white flex items-center justify-center gap-2">
              <QrCode className="w-5 h-5 text-indigo-400" />
              Print-Ready QR Standee Module
            </h3>
            <p className="text-xs text-slate-400">
              High-resolution vector assets for physical acrylic stands and counter displays.
            </p>

            {/* QR Card Mockup */}
            <div className="p-5 bg-white rounded-2xl shadow-2xl max-w-[260px] mx-auto border-4 border-slate-200 text-slate-900">
              <div className="flex items-center justify-center gap-1.5 mb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-700">
                  Tap or Scan to Review
                </span>
              </div>
              <img
                src={qrImageUrl}
                alt="Standee Review QR Code"
                className="w-48 h-48 mx-auto rounded-xl shadow-inner border border-slate-200"
              />
              <div className="mt-2 text-center">
                <p className="text-xs font-black truncate">{profile.businessName}</p>
                <p className="text-[9px] text-slate-500 uppercase font-bold">Google Maps Verified 5★</p>
              </div>
            </div>

            {/* Download Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <a
                href={qrImageUrl}
                download={`${order.qrSlug}-review-qr.png`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 border border-slate-700 shadow-sm"
              >
                <Download className="w-3.5 h-3.5 text-indigo-400" />
                PNG (500x500)
              </a>
              <a
                href={qrImageUrl}
                download={`${order.qrSlug}-review-qr.svg`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 border border-slate-700 shadow-sm"
              >
                <Download className="w-3.5 h-3.5 text-purple-400" />
                SVG Vector
              </a>
            </div>

            <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800/80 text-[11px] text-slate-400 text-left space-y-1">
              <p className="font-bold text-slate-300">Acrylic Stand Specs:</p>
              <p>• 4mm Frosted Premium Acrylic with metallic base</p>
              <p>• Embedded NTAG213 NFC chip (144 bytes, 100k writes)</p>
              <p>• High-contrast UV direct substrate printing</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
