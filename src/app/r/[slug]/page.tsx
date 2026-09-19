'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  Star,
  Sparkles,
  Copy,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  MessageCircle,
  Phone,
  AlertCircle,
  RefreshCw,
  Send,
  Heart,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { buildGoogleReviewDialogUrl } from '@/lib/review-urls';

export default function PublicStandeeReviewPage() {
  const params = useParams();
  const slug = (params?.slug as string) || '';

  const [loading, setLoading] = useState(true);
  const [merchantData, setMerchantData] = useState<any>(null);
  const [selectedRating, setSelectedRating] = useState<number>(5);
  const [selectedAspects, setSelectedAspects] = useState<string[]>([]);

  // AI Review state
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiReviews, setAiReviews] = useState<string[]>([]);
  const [selectedReviewText, setSelectedReviewText] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [showDirectRedirect, setShowDirectRedirect] = useState(false);

  // Private Feedback state (1-3 stars)
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [privateMessage, setPrivateMessage] = useState('');
  const [isSubmittingPrivate, setIsSubmittingPrivate] = useState(false);
  const [privateSubmitted, setPrivateSubmitted] = useState(false);

  // Fetch Merchant Standee Profile
  useEffect(() => {
    if (!slug) return;
    const isNfc = window.location.search.includes('nfc=1') || window.location.hash.includes('nfc');
    fetch(`/api/public/review?slug=${encodeURIComponent(slug)}&type=${isNfc ? 'NFC' : 'QR'}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setMerchantData(data.data);
          // Pre-select top 2 services as default aspects
          if (data.data.keyServices && data.data.keyServices.length > 0) {
            setSelectedAspects(data.data.keyServices.slice(0, 2));
          }
          // Auto trigger initial review generation for 5 stars
          triggerAiReviewGen(data.data.clientId, 5, data.data.keyServices?.slice(0, 2) || []);
        }
      })
      .catch((err) => console.error('Failed to load merchant standee data:', err))
      .finally(() => setLoading(false));
  }, [slug]);

  const triggerAiReviewGen = async (clientId: string, rating: number, aspects: string[]) => {
    setIsGeneratingAi(true);
    try {
      const res = await fetch('/api/public/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_review',
          clientId,
          rating,
          selectedAspects: aspects,
          source: window.location.search.includes('nfc=1') ? 'NFC' : 'QR',
        }),
      });
      const data = await res.json();
      if (data.success && data.data?.reviews) {
        setAiReviews(data.data.reviews);
        setSelectedReviewText(data.data.reviews[0] || '');
        if (data.data.googleMapsUrl) {
          setMerchantData((prev: any) => ({
            ...prev,
            googleMapsUrl: data.data.googleMapsUrl,
            ...(data.data.placeId && { placeId: data.data.placeId }),
          }));
        }
      }
    } catch (e) {
      console.warn('AI review generation error:', e);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleRatingChange = (newRating: number) => {
    setSelectedRating(newRating);
    setCopied(false);
    if (newRating >= 4 && merchantData?.clientId) {
      triggerAiReviewGen(merchantData.clientId, newRating, selectedAspects);
    }
  };

  const toggleAspect = (aspect: string) => {
    const updated = selectedAspects.includes(aspect)
      ? selectedAspects.filter((a) => a !== aspect)
      : [...selectedAspects, aspect];
    setSelectedAspects(updated);
    if (selectedRating >= 4 && merchantData?.clientId) {
      triggerAiReviewGen(merchantData.clientId, selectedRating, updated);
    }
  };

  const handleCopyAndPost = async () => {
    if (!selectedReviewText) return;
    try {
      await navigator.clipboard.writeText(selectedReviewText);
      setCopied(true);
      setShowDirectRedirect(true);

      // Record Google Redirect telemetry
      if (merchantData?.clientId) {
        fetch('/api/public/review', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'record_google_redirect',
            clientId: merchantData.clientId,
          }),
        }).catch(() => {});
      }

      // Open Google Business Profile Review Dialog URL in a new tab
      const targetUrl = buildGoogleReviewDialogUrl({
        placeId: merchantData?.placeId,
        googleMapsUrl: merchantData?.googleMapsUrl,
        businessName: merchantData?.businessName || 'Business',
        city: merchantData?.city || 'Ranchi',
      });
      window.open(targetUrl, '_blank');
    } catch (e) {
      // Fallback redirect
      const targetUrl = buildGoogleReviewDialogUrl({
        placeId: merchantData?.placeId,
        googleMapsUrl: merchantData?.googleMapsUrl,
        businessName: merchantData?.businessName || 'Business',
        city: merchantData?.city || 'Ranchi',
      });
      window.open(targetUrl, '_blank');
    }
  };

  const handlePrivateFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!privateMessage.trim() || !merchantData?.clientId) return;

    setIsSubmittingPrivate(true);
    try {
      const res = await fetch('/api/public/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'submit_private_feedback',
          clientId: merchantData.clientId,
          rating: selectedRating,
          customerName,
          customerPhone,
          customerEmail,
          message: privateMessage,
          source: window.location.search.includes('nfc=1') ? 'NFC' : 'QR',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPrivateSubmitted(true);
      }
    } catch (err) {
      console.error('Failed to submit private feedback:', err);
    } finally {
      setIsSubmittingPrivate(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-white">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center animate-spin mb-4">
          <Sparkles className="w-6 h-6 text-indigo-400" />
        </div>
        <p className="text-sm font-semibold text-slate-300">Connecting to verified business NFC standee...</p>
      </div>
    );
  }

  const isPositive = selectedRating >= 4;
  const isShieldActive = merchantData?.isShieldActive ?? true;
  const businessName = merchantData?.businessName || 'Verified Local Business';
  const category = merchantData?.category || 'Local Service';
  const city = merchantData?.city || 'Ranchi';

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between py-6 px-4 sm:px-6">
      <div className="max-w-md w-full mx-auto space-y-5">
        {/* Merchant Header Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 text-center relative overflow-hidden shadow-2xl backdrop-blur-xl">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-600/15 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-emerald-600/15 rounded-full blur-2xl pointer-events-none" />

          {/* Verified Google Maps Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold uppercase tracking-wider mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            Verified Google Business Profile
          </div>

          <h1 className="text-xl font-extrabold text-white tracking-tight">{businessName}</h1>
          <p className="text-xs text-slate-400 mt-1">
            {category} • {city}
          </p>

          {/* 5-Star Interactive Rating Selector */}
          <div className="mt-5 pt-4 border-t border-slate-800/80">
            <p className="text-xs font-semibold text-slate-300 mb-2.5">
              How was your experience today?
            </p>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = star <= selectedRating;
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleRatingChange(star)}
                    className={`p-2 rounded-2xl transition-all transform active:scale-95 ${
                      isFilled
                        ? 'text-amber-400 bg-amber-400/15 scale-110 shadow-lg shadow-amber-500/20'
                        : 'text-slate-600 bg-slate-800/50 hover:text-slate-400'
                    }`}
                  >
                    <Star className={`w-7 h-7 ${isFilled ? 'fill-amber-400' : ''}`} />
                  </button>
                );
              })}
            </div>
            <div className="mt-2 text-xs font-bold">
              {selectedRating === 5 && <span className="text-emerald-400">⭐⭐⭐⭐⭐ Outstanding Experience!</span>}
              {selectedRating === 4 && <span className="text-emerald-400">⭐⭐⭐⭐ Very Good Experience!</span>}
              {selectedRating === 3 && <span className="text-amber-400">⭐⭐⭐ Average / Could be better</span>}
              {selectedRating <= 2 && <span className="text-rose-400">⭐ Needs Urgent Improvement</span>}
            </div>
          </div>
        </div>

        {/* FLOW A: 4 or 5 STARS -> AI Google Review Generator */}
        {isPositive ? (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-300">
            {/* Aspect Selection Pills */}
            {merchantData?.keyServices && merchantData.keyServices.length > 0 && (
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-3.5 space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  What did you like most? (Tap to customize AI review)
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {merchantData.keyServices.map((svc: string) => {
                    const active = selectedAspects.includes(svc);
                    return (
                      <button
                        key={svc}
                        type="button"
                        onClick={() => toggleAspect(svc)}
                        className={`text-xs px-2.5 py-1 rounded-xl font-medium transition-all ${
                          active
                            ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {svc} {active ? '✓' : '+'}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* AI Review Generator & Suggestions */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-4 space-y-3 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-white">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-white">AI-Crafted Review Options</span>
                </div>
                <button
                  type="button"
                  onClick={() => triggerAiReviewGen(merchantData.clientId, selectedRating, selectedAspects)}
                  disabled={isGeneratingAi}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                >
                  <RefreshCw className={`w-3 h-3 ${isGeneratingAi ? 'animate-spin' : ''}`} />
                  Regenerate
                </button>
              </div>

              {isGeneratingAi ? (
                <div className="py-8 text-center space-y-2">
                  <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mx-auto" />
                  <p className="text-xs text-slate-400 font-medium">
                    Writing personalized 5-star review based on your feedback...
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {aiReviews.map((rev, idx) => {
                    const isSelected = selectedReviewText === rev;
                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          setSelectedReviewText(rev);
                          setCopied(false);
                        }}
                        className={`p-3 rounded-2xl text-xs leading-relaxed cursor-pointer transition-all border ${
                          isSelected
                            ? 'bg-indigo-950/40 border-indigo-500 text-white ring-2 ring-indigo-500/20 shadow-md'
                            : 'bg-slate-950/50 border-slate-800/80 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="flex-1">{rev}</p>
                          <span
                            className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                              isSelected
                                ? 'bg-indigo-600 border-indigo-500 text-white text-[9px] font-bold'
                                : 'border-slate-700'
                            }`}
                          >
                            {isSelected ? '✓' : ''}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Editable Review Text Box */}
              <div className="pt-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Selected Review Text (Tap to edit before posting)
                </label>
                <textarea
                  value={selectedReviewText}
                  onChange={(e) => setSelectedReviewText(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none"
                  placeholder="Review text will appear here..."
                />
              </div>

              {/* Big CTA Button: Copy & Open Google Maps */}
              <button
                type="button"
                onClick={handleCopyAndPost}
                className={`w-full py-3.5 px-4 rounded-2xl font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-2 transform active:scale-98 ${
                  copied
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30'
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-indigo-600/30'
                }`}
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Copied! Opening Google Review Box...
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy & Post on Google Maps
                    <ExternalLink className="w-4 h-4 ml-1" />
                  </>
                )}
              </button>

              {/* 3 Step Instructions */}
              <div className="bg-slate-950/60 rounded-2xl p-3 text-[11px] text-slate-400 space-y-1.5 border border-slate-800/60">
                <p className="font-bold text-slate-300">How it works:</p>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-indigo-600/30 text-indigo-400 font-bold flex items-center justify-center text-[10px]">1</span>
                  <span>Review text is automatically copied to your clipboard.</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-indigo-600/30 text-indigo-400 font-bold flex items-center justify-center text-[10px]">2</span>
                  <span>Google Maps opens directly to the official review window.</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-indigo-600/30 text-indigo-400 font-bold flex items-center justify-center text-[10px]">3</span>
                  <span>Select 5 stars, paste your copied review, and tap <strong>Post</strong>!</span>
                </div>
              </div>
            </div>
          </div>
        ) : isShieldActive ? (
          /* FLOW B: 1-3 STARS WITH SMART SENTIMENT SHIELD ON -> Private Direct Complaint Box */
          <div className="bg-slate-900/90 border border-rose-900/40 rounded-3xl p-5 space-y-4 shadow-2xl animate-in fade-in slide-in-from-bottom-3 duration-300">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Direct Management Resolution</h3>
                <p className="text-xs text-slate-400">
                  We apologize your experience did not meet expectations.
                </p>
              </div>
            </div>

            {privateSubmitted ? (
              <div className="py-6 text-center space-y-3 bg-emerald-950/20 border border-emerald-500/30 rounded-2xl p-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-white">Thank You for Your Feedback</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Your message has been directly forwarded to the senior management of <strong>{businessName}</strong>. Our team will review your feedback and reach out to resolve this matter promptly.
                </p>
              </div>
            ) : (
              <form onSubmit={handlePrivateFeedbackSubmit} className="space-y-3">
                <p className="text-xs text-slate-300 leading-relaxed">
                  Please let the owner know what went wrong so we can fix it immediately:
                </p>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    What happened? (Required)
                  </label>
                  <textarea
                    required
                    value={privateMessage}
                    onChange={(e) => setPrivateMessage(e.target.value)}
                    rows={3}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 resize-none"
                    placeholder="Tell us about your experience in detail..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Rahul Kumar"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Mobile / WhatsApp
                    </label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="+91 9431100000"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingPrivate}
                  className="w-full py-3 px-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-all shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 mt-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  {isSubmittingPrivate ? 'Sending to Management...' : 'Send Private Feedback to Owner'}
                </button>
              </form>
            )}
          </div>
        ) : (
          /* If Shield is OFF: Fallback direct Google redirect */
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 text-center space-y-3">
            <p className="text-xs text-slate-300">
              Thank you for sharing your feedback. Please click below to post on Google Maps:
            </p>
            <a
              href={buildGoogleReviewDialogUrl({
                placeId: merchantData?.placeId,
                googleMapsUrl: merchantData?.googleMapsUrl,
                businessName: merchantData?.businessName || 'Business',
                city: merchantData?.city || 'Ranchi',
              })}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg"
            >
              Continue to Google Maps Review Box <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}
      </div>

      {/* Powered by Digital Ranchi Footer */}
      <div className="mt-8 text-center text-[11px] text-slate-500 space-y-1">
        <p className="flex items-center justify-center gap-1 font-semibold text-slate-400">
          Powered by <span className="text-indigo-400">Digital Ranchi</span> AI Standee Engine
        </p>
        <p>Instant Google Business Profile Verification & Smart Review System</p>
      </div>
    </div>
  );
}
