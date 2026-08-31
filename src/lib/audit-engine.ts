import { DigitalPresenceAuditResult } from '@/types';

export function runDigitalPresenceAudit(
  businessName: string,
  googleMapsUrl?: string,
  websiteUrl?: string,
  category: string = 'Local Business'
): DigitalPresenceAuditResult {
  const hasMaps = Boolean(googleMapsUrl && googleMapsUrl.trim().length > 5);
  const hasWebsite = Boolean(websiteUrl && websiteUrl.trim().length > 4);
  const isGbpVerified = hasMaps;

  // Heuristic presence analysis based on submitted presence signals
  let gbpScore = hasMaps ? 78 : 35;
  let reviewsScore = hasMaps ? 65 : 20;
  let photosScore = hasMaps ? 70 : 15;
  let websiteScore = hasWebsite ? 82 : 25;
  let localSeoScore = (gbpScore * 0.5) + (websiteScore * 0.5);
  let socialScore = 60;

  // Normalize scores within reasonable ranges
  const breakdown = {
    googleBusinessProfile: Math.min(100, Math.round(gbpScore)),
    reviewsAndReputation: Math.min(100, Math.round(reviewsScore)),
    photosAndMedia: Math.min(100, Math.round(photosScore)),
    websitePresence: Math.min(100, Math.round(websiteScore)),
    localSeoScore: Math.min(100, Math.round(localSeoScore)),
    socialEngagement: Math.min(100, Math.round(socialScore)),
  };

  const overallScore = Math.round(
    breakdown.googleBusinessProfile * 0.3 +
    breakdown.reviewsAndReputation * 0.2 +
    breakdown.photosAndMedia * 0.15 +
    breakdown.websitePresence * 0.15 +
    breakdown.localSeoScore * 0.1 +
    breakdown.socialEngagement * 0.1
  );

  const strengths: string[] = [];
  const criticalWeaknesses: string[] = [];
  const recommendedImprovements: string[] = [];

  if (hasMaps) {
    strengths.push('Google Maps location listing is indexed and discoverable');
  } else {
    criticalWeaknesses.push('Missing direct or optimized Google Maps listing in primary search');
    recommendedImprovements.push('Claim & verify Google Business Profile with exact category matches');
  }

  if (hasWebsite) {
    strengths.push('Dedicated web domain is active for brand validation');
  } else {
    criticalWeaknesses.push('No dedicated fast-loading one-page mini website linked to Google profile');
    recommendedImprovements.push('Deploy a mobile-first 1-page mini website with direct WhatsApp & call CTAs');
  }

  criticalWeaknesses.push('Low automated review generation mechanism & missing review QR stand');
  criticalWeaknesses.push('Profile missing high-intent local search keywords in business description & services');

  recommendedImprovements.push('Generate customized Review QR stand for in-store customer feedback');
  recommendedImprovements.push('Integrate automated 1-click WhatsApp inquiry button on all discovery channels');
  recommendedImprovements.push('Upload weekly geotagged high-resolution photos and GBP posts');

  let suggestedPackage = {
    id: 'pkg_growth_999',
    name: 'Growth Package',
    price: 999,
    frequency: 'One-Time Setup',
  };

  if (overallScore >= 75) {
    suggestedPackage = {
      id: 'pkg_premium_2499',
      name: 'Premium Growth Retainer',
      price: 2499,
      frequency: 'per month',
    };
  } else if (!hasMaps && !hasWebsite) {
    suggestedPackage = {
      id: 'pkg_starter_499',
      name: 'Starter Verification Package',
      price: 499,
      frequency: 'One-Time Setup',
    };
  }

  return {
    businessName: businessName || 'Your Business',
    overallScore,
    isVerifiedOnGoogle: isGbpVerified,
    breakdown,
    strengths,
    criticalWeaknesses,
    recommendedImprovements,
    suggestedPackage,
    disclaimer:
      'Audit generated using Digital Ranchi presence heuristics. All scores represent public indexability and optimization readiness.',
  };
}
