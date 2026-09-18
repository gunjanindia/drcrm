'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Globe, ArrowLeft, Building2 } from 'lucide-react';

export default function PublicOnePageWebsite() {
  const params = useParams();
  const slug = params?.slug as string;
  const [renderedHtml, setRenderedHtml] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    // 1. Instant local cache check for zero-latency preview
    if (typeof window !== 'undefined') {
      try {
        const localSaved = localStorage.getItem(`drcrm_published_site_${slug}`);
        if (localSaved) {
          const parsed = JSON.parse(localSaved);
          if (parsed && parsed.html) {
            setRenderedHtml(parsed.html);
            setIsLoading(false);
            if (parsed.businessName && typeof document !== 'undefined') {
              document.title = `${parsed.businessName} | Official Website`;
            }
          }
        }
      } catch {}
    }

    let isMounted = true;

    fetch(`/api/public/site/${encodeURIComponent(slug)}`)
      .then(async (res) => {
        const data = await res.json();
        if (!isMounted) return;

        if (res.ok && data.success && data.html) {
          setRenderedHtml(data.html);
          if (data.businessName && typeof document !== 'undefined') {
            document.title = `${data.businessName} | Official Website`;
          }
          try {
            localStorage.setItem(`drcrm_published_site_${slug}`, JSON.stringify({
              html: data.html,
              businessName: data.businessName,
              publishedAt: new Date().toISOString(),
            }));
          } catch {}
        } else {
          setRenderedHtml((prev) => {
            if (!prev) setErrorMessage(data.error || 'Website not found or has not been published yet.');
            return prev;
          });
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('Error fetching public website:', err);
        setRenderedHtml((prev) => {
          if (!prev) setErrorMessage('Failed to connect to website server. Please try again.');
          return prev;
        });
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white p-6 space-y-4 font-sans">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center animate-pulse shadow-lg shadow-indigo-500/30">
          <Globe className="w-6 h-6 text-white" />
        </div>
        <div className="text-center space-y-1">
          <h3 className="font-black text-lg tracking-tight">Loading Verified Website</h3>
          <p className="text-xs text-slate-400 font-mono">digitalranchi.in/s/{slug}</p>
        </div>
      </div>
    );
  }

  if (errorMessage || !renderedHtml) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white p-6 space-y-6 font-sans text-center">
        <div className="w-16 h-16 rounded-3xl bg-slate-800 border border-slate-700 flex items-center justify-center shadow-xl">
          <Building2 className="w-8 h-8 text-amber-400" />
        </div>

        <div className="max-w-md space-y-2">
          <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
            Site Not Found
          </span>
          <h1 className="text-2xl font-black text-white">
            Website Not Found
          </h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            The page <code className="px-2 py-0.5 rounded-md bg-slate-800 text-sky-300 font-mono">/s/{slug}</code> is not published or the link is incorrect.
          </p>
        </div>

        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go to Digital Ranchi Home</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen fixed inset-0 overflow-hidden bg-white z-50">
      <iframe
        srcDoc={renderedHtml}
        className="w-full h-full border-0"
        title="Verified Business Website"
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-modals"
      />
    </div>
  );
}
