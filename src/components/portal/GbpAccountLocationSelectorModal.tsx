'use client';

import React, { useState } from 'react';
import {
  Globe,
  CheckCircle2,
  Star,
  MapPin,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Building2,
  ExternalLink,
} from 'lucide-react';
import { Button, Modal, Badge } from '@/components/ui';
import { SyncedBusinessProfile, saveSyncedBusinessProfile } from '@/lib/client-portal-sync';
import confetti from 'canvas-confetti';

export interface GbpDiscoveredLocation {
  id: string;
  locationName: string;
  primaryCategory: string;
  formattedAddress: string;
  rating: number;
  reviewCount: number;
  photosCount: number;
  googleMapsUrl: string;
  placeId?: string;
  isMatched: boolean;
  matchConfidence: number;
  reviews: any[];
  isOperational: boolean;
  accountName?: string;
}

export interface GbpAccountLocationSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  googleEmail: string;
  clientBusinessName: string;
  discoveredLocations: GbpDiscoveredLocation[];
  accessToken?: string;
  onSelectLocation: (selected: GbpDiscoveredLocation) => Promise<void>;
}

export const GbpAccountLocationSelectorModal: React.FC<GbpAccountLocationSelectorModalProps> = ({
  isOpen,
  onClose,
  googleEmail,
  clientBusinessName,
  discoveredLocations,
  accessToken,
  onSelectLocation,
}) => {
  const [selectedId, setSelectedId] = useState<string>(
    discoveredLocations.find((l) => l.isMatched)?.id || discoveredLocations[0]?.id || ''
  );
  const [isApplying, setIsApplying] = useState(false);

  const selectedLoc = discoveredLocations.find((l) => l.id === selectedId) || discoveredLocations[0];

  const handleConfirmSync = async () => {
    if (!selectedLoc) return;
    setIsApplying(true);
    try {
      await onSelectLocation(selectedLoc);
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
        });
      } catch {}
      onClose();
    } catch (e) {
      console.error('Failed to link GBP location:', e);
      alert('Failed to sync location. Please try again.');
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Select Google Business Profile Location"
      maxWidth="lg"
    >
      <div className="space-y-6">
        {/* Account Header */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-900/40 via-slate-900 to-indigo-950 border border-blue-500/30 text-xs flex items-center justify-between gap-3 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-blue-400 block tracking-wider">
                Google Account Authorized
              </span>
              <span className="font-bold text-sm text-white block">{googleEmail || 'Verified Owner'}</span>
              <span className="text-[11px] text-slate-300">
                Found {discoveredLocations.length} Google Business Profile {discoveredLocations.length === 1 ? 'listing' : 'listings'} linked to this account.
              </span>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
            ✓ OAuth Active
          </span>
        </div>

        {/* Location Selection List */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-900 dark:text-white">
              Choose Listing for Client 360 ({clientBusinessName}):
            </span>
            <span className="text-slate-400 text-[11px]">Click to select</span>
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {discoveredLocations.map((loc) => {
              const isSelected = loc.id === selectedId;

              return (
                <div
                  key={loc.id}
                  onClick={() => setSelectedId(loc.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
                    isSelected
                      ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-500 ring-2 ring-indigo-500/20'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <strong className="text-sm font-black text-slate-900 dark:text-white">
                          {loc.locationName}
                        </strong>
                        {loc.isMatched && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-500 text-white flex items-center gap-1 shadow-xs">
                            <Sparkles className="w-2.5 h-2.5" />
                            Best Match ({loc.matchConfidence}%)
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {loc.primaryCategory}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                        <span className="truncate">{loc.formattedAddress}</span>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-3 text-xs pt-1">
                        <span className="flex items-center gap-1 font-bold text-amber-500">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          {loc.rating}★
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {loc.reviewCount} Google Reviews
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className="text-emerald-600 text-[11px] font-bold">
                          {loc.reviews?.length || 0} Synced Reviews
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0 pt-1">
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-600 text-white'
                            : 'border-slate-300 dark:border-slate-700'
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Summary Details */}
        {selectedLoc && (
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
            <div className="flex justify-between items-center text-slate-500">
              <span>Selected Listing:</span>
              <strong className="text-slate-900 dark:text-white">{selectedLoc.locationName}</strong>
            </div>
            <div className="flex justify-between items-center text-slate-500">
              <span>Google Location ID:</span>
              <span className="font-mono text-[11px] text-indigo-600">{selectedLoc.id}</span>
            </div>
            <div className="flex justify-between items-center text-slate-500">
              <span>Reviews to Import:</span>
              <span className="font-bold text-emerald-600">
                {selectedLoc.reviews?.length || selectedLoc.reviewCount} Customer Reviews
              </span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isApplying}>
            Cancel
          </Button>

          <Button
            variant="success"
            size="md"
            icon={Sparkles}
            isLoading={isApplying}
            disabled={isApplying || !selectedLoc}
            onClick={handleConfirmSync}
          >
            {isApplying ? 'Linking & Importing Reviews...' : 'Confirm & Sync Live Google Profile'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
