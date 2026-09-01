import { DigitalPresenceAuditResult } from '@/types';
import { lookupGooglePlace, GooglePlaceLookupResult } from './google-places';

export async function runDigitalPresenceAudit(
  businessName: string,
  googleMapsUrl?: string,
  websiteUrl?: string,
  category: string = 'Local Business',
  city: string = 'Ranchi',
  selectedPlaceId?: string
): Promise<DigitalPresenceAuditResult> {
  const hasWebsite = Boolean(websiteUrl && websiteUrl.trim().length > 4);

  // 1. Live Google Places / Maps Resolution & Verification
  const placeResult: GooglePlaceLookupResult = await lookupGooglePlace(
    businessName,
    city,
    googleMapsUrl,
    category,
    selectedPlaceId
  );

  let gbpScore = 20;
  let reviewsScore = 20;
  let photosScore = 15;
  let websiteScore = hasWebsite ? 80 : 20;
  let localSeoScore = 20;
  let socialScore = 40;

  const strengths: string[] = [];
  const criticalWeaknesses: string[] = [];
  const recommendedImprovements: string[] = [];

  if (placeResult.status === 'INVALID_URL') {
    // -------------------------------------------------------------
    // FAKE OR INVALID GOOGLE MAPS URL DETECTED
    // -------------------------------------------------------------
    gbpScore = 10;
    reviewsScore = 10;
    photosScore = 10;
    localSeoScore = 15;
    socialScore = 25;

    criticalWeaknesses.push(
      placeResult.errorMessage || 'Invalid Google Maps URL provided — does not point to an active Google listing.'
    );
    criticalWeaknesses.push(
      'Business listing is unverified or completely invisible to customers searching on Google Maps in ' + city
    );
    criticalWeaknesses.push('High risk of competitor hijacking local search traffic in your area');

    recommendedImprovements.push('Submit authentic address verification & claim official Google Business Profile');
    recommendedImprovements.push('Deploy Digital Ranchi Starter Verification Setup (₹499) for verified map indexation');
  } else if (placeResult.status === 'UNVERIFIED_OR_NOT_FOUND') {
    // -------------------------------------------------------------
    // BUSINESS UNINDEXED / NO CLAIMED PROFILE FOUND ON GOOGLE
    // -------------------------------------------------------------
    gbpScore = 25;
    reviewsScore = 20;
    photosScore = 15;
    localSeoScore = 25;
    socialScore = 35;

    criticalWeaknesses.push(
      `No active Google Business Profile detected for "${businessName}" in ${city}`
    );
    criticalWeaknesses.push('Local customers searching nearby cannot discover your store pin or direct call buttons');
    criticalWeaknesses.push('Zero indexed Google reviews and no counter review QR mechanism');

    recommendedImprovements.push('Claim & verify Google Maps profile with exact category targeting');
    recommendedImprovements.push('Install acrylic Review QR stand to start capturing 5-star customer reviews');
    recommendedImprovements.push('Deploy a mobile-first mini website with 1-click WhatsApp and Call buttons');
  } else {
    // -------------------------------------------------------------
    // VERIFIED GOOGLE MAPS PROFILE DETECTED
    // -------------------------------------------------------------
    const rating = placeResult.rating ?? 4.0;
    const reviewCount = placeResult.userRatingsTotal ?? 0;
    const photosCount = placeResult.photosCount ?? 0;

    // GBP Score
    gbpScore = placeResult.isOperational ? 85 : 60;

    // Reviews Score
    if (reviewCount === 0) {
      reviewsScore = 30;
      criticalWeaknesses.push('No public customer reviews indexed on Google Maps');
      recommendedImprovements.push('Deploy Counter Review QR stand to accelerate first 50 Google reviews');
    } else if (reviewCount < 15) {
      reviewsScore = 55;
      strengths.push(`Has ${reviewCount} customer reviews on Google Maps`);
      criticalWeaknesses.push('Low review count compared to top 3 local competitors in ' + city);
      recommendedImprovements.push('Deploy automated review acceleration drive to cross 50+ reviews milestone');
    } else {
      reviewsScore = Math.min(100, Math.round(75 + Math.min(25, (reviewCount / 50) * 20)));
      strengths.push(`Strong review foundation with ${reviewCount} verified Google reviews`);
    }

    if (rating >= 4.2) {
      strengths.push(`High customer satisfaction rating (${rating.toFixed(1)}★ average)`);
    } else {
      criticalWeaknesses.push(`Average rating is ${rating.toFixed(1)}★ — below the 4.5★ local trust threshold`);
      recommendedImprovements.push('Implement proactive 5-star review filtering and automated review responses');
    }

    // Photos Score
    if (photosCount >= 5) {
      photosScore = 80;
      strengths.push(`Media gallery active with ${photosCount}+ store/menu/product photos`);
    } else {
      photosScore = 40;
      criticalWeaknesses.push('Few or outdated store photos uploaded on Google Maps');
      recommendedImprovements.push('Upload weekly geotagged high-resolution photos and GBP showcase posts');
    }

    localSeoScore = Math.round((gbpScore * 0.6) + (websiteScore * 0.4));
    socialScore = 65;

    strengths.push(`Google Maps profile verified at: ${placeResult.formattedAddress || city}`);
  }

  // Website evaluation
  if (hasWebsite || placeResult.hasWebsite) {
    websiteScore = Math.max(websiteScore, 82);
    strengths.push('Dedicated web domain is active for brand validation');
  } else {
    criticalWeaknesses.push('No fast-loading mobile landing page linked to Google profile');
    recommendedImprovements.push('Deploy mobile-first 1-page mini website with direct WhatsApp & call CTAs');
  }

  // Final breakdown
  const breakdown = {
    googleBusinessProfile: Math.min(100, Math.max(10, Math.round(gbpScore))),
    reviewsAndReputation: Math.min(100, Math.max(10, Math.round(reviewsScore))),
    photosAndMedia: Math.min(100, Math.max(10, Math.round(photosScore))),
    websitePresence: Math.min(100, Math.max(10, Math.round(websiteScore))),
    localSeoScore: Math.min(100, Math.max(10, Math.round(localSeoScore))),
    socialEngagement: Math.min(100, Math.max(10, Math.round(socialScore))),
  };

  const overallScore = Math.round(
    breakdown.googleBusinessProfile * 0.3 +
    breakdown.reviewsAndReputation * 0.2 +
    breakdown.photosAndMedia * 0.15 +
    breakdown.websitePresence * 0.15 +
    breakdown.localSeoScore * 0.1 +
    breakdown.socialEngagement * 0.1
  );

  // Suggested Package
  let suggestedPackage = {
    id: 'pkg_growth_999',
    name: 'Growth Package',
    price: 999,
    frequency: 'One-Time Setup',
  };

  if (placeResult.status === 'INVALID_URL' || placeResult.status === 'UNVERIFIED_OR_NOT_FOUND' || overallScore < 50) {
    suggestedPackage = {
      id: 'pkg_starter_499',
      name: 'Starter Verification Package',
      price: 499,
      frequency: 'One-Time Setup',
    };
  } else if (overallScore >= 75) {
    suggestedPackage = {
      id: 'pkg_premium_2499',
      name: 'Premium Growth Retainer',
      price: 2499,
      frequency: 'per month',
    };
  }

  return {
    businessName: businessName || 'Your Business',
    city,
    overallScore,
    isVerifiedOnGoogle: placeResult.status === 'VERIFIED_MATCH',
    validationStatus: placeResult.status,
    matchedPlace: placeResult.status === 'VERIFIED_MATCH' ? {
      placeId: placeResult.placeId,
      name: placeResult.name,
      formattedAddress: placeResult.formattedAddress,
      rating: placeResult.rating,
      userRatingsTotal: placeResult.userRatingsTotal,
      photosCount: placeResult.photosCount,
      googleMapsUrl: placeResult.googleMapsUrl,
      isOperational: placeResult.isOperational,
      hasWebsite: placeResult.hasWebsite,
      matchedCategory: placeResult.matchedCategory,
    } : undefined,
    candidates: placeResult.candidates,
    breakdown,
    strengths,
    criticalWeaknesses,
    recommendedImprovements,
    suggestedPackage,
    disclaimer:
      'Audit generated using Digital Ranchi Google Maps verification engine. All scores represent public indexability and optimization readiness.',
  };
}
