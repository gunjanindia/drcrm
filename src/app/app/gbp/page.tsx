'use client';

import React, { useState } from 'react';
import { MapPin, Star, ShieldCheck, Search, TrendingUp, AlertTriangle } from 'lucide-react';
import { Button, Badge } from '@/components/ui';
import { globalStore } from '@/lib/store';

export default function GbpManagementPage() {
  const gbpProfiles = globalStore.gbpProfiles;
  const [search, setSearch] = useState('');

  const filtered = gbpProfiles.filter((p) =>
    p.clientName.toLowerCase().includes(search.toLowerCase()) ||
    p.primaryCategory.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Google Business Profile (GBP) & Local SEO Center
          </h2>
          <p className="text-xs text-slate-500">
            Monitoring health score, 3-Pack keyword rankings, and review momentum across 20 verified local listings.
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map((profile) => (
          <div
            key={profile.id}
            className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  {profile.clientName}
                </h3>
                <p className="text-[11px] text-slate-500">{profile.primaryCategory}</p>
              </div>
              <span className="text-xs font-black text-indigo-600 px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800">
                GBP Health: {profile.healthScore}%
              </span>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                <span className="text-[9px] text-slate-400 block uppercase font-bold">Rating</span>
                <span className="font-bold text-amber-500 flex items-center justify-center gap-0.5">
                  {profile.rating} <Star className="w-3 h-3 fill-amber-500" />
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                <span className="text-[9px] text-slate-400 block uppercase font-bold">Reviews</span>
                <span className="font-bold text-slate-900 dark:text-white">{profile.reviewCount}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                <span className="text-[9px] text-slate-400 block uppercase font-bold">Photos</span>
                <span className="font-bold text-emerald-600">{profile.photosCount} Live</span>
              </div>
            </div>

            {/* Top Keywords */}
            <div className="space-y-1.5 text-xs">
              <span className="font-bold text-[11px] text-slate-700 dark:text-slate-300 block">
                Top Tracked Local Search Keywords:
              </span>
              {profile.topKeywords.map((kw, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-[11px]"
                >
                  <span className="text-slate-700 dark:text-slate-300">"{kw.keyword}"</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400">{kw.localSearchVolume}</span>
                    <span className="font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded">
                      Rank #{kw.rank}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
