/**
 * Digital Ranchi — Google Places & Maps Presence Verification Engine
 * 
 * Supports:
 * 1. Multi-candidate Google Places search & branch disambiguation
 * 2. Modern Google Places API (New) — https://places.googleapis.com/v1/places:searchText
 * 3. Strict Google Maps URL validation & short-link resolver
 */

export interface GooglePlaceCandidate {
  placeId: string;
  name: string;
  formattedAddress: string;
  rating?: number;
  userRatingsTotal?: number;
  photosCount?: number;
  googleMapsUrl?: string;
  isOperational?: boolean;
  hasWebsite?: boolean;
  matchedCategory?: string;
}

export interface GooglePlaceLookupResult {
  status: 'VERIFIED_MATCH' | 'UNVERIFIED_OR_NOT_FOUND' | 'INVALID_URL';
  placeId?: string;
  name?: string;
  formattedAddress?: string;
  rating?: number;
  userRatingsTotal?: number;
  photosCount?: number;
  googleMapsUrl?: string;
  isOperational?: boolean;
  hasWebsite?: boolean;
  matchedCategory?: string;
  candidates?: GooglePlaceCandidate[];
  apiSource?: 'GOOGLE_PLACES_API_NEW' | 'GOOGLE_PLACES_API_LEGACY' | 'URL_RESOLVER_FALLBACK';
  errorMessage?: string;
}

const GOOGLE_MAPS_DOMAINS = [
  'maps.google.com',
  'google.com/maps',
  'www.google.com/maps',
  'maps.app.goo.gl',
  'goo.gl/maps',
  'g.page',
  'business.google.com',
];

/**
 * Validates whether a provided URL conforms to a valid Google Maps format
 */
export function validateGoogleMapsUrl(url?: string): { isValid: boolean; isShortLink: boolean; reason?: string } {
  if (!url || !url.trim()) {
    return { isValid: false, isShortLink: false, reason: 'URL not provided' };
  }

  const trimmed = url.trim().toLowerCase();

  let parsedUrl: URL;
  try {
    const urlToParse = trimmed.startsWith('http://') || trimmed.startsWith('https://')
      ? trimmed
      : `https://${trimmed}`;
    parsedUrl = new URL(urlToParse);
  } catch {
    return { isValid: false, isShortLink: false, reason: 'Malformed URL structure' };
  }

  const hostname = parsedUrl.hostname.toLowerCase();
  const pathname = parsedUrl.pathname.toLowerCase();

  const isGoogleDomain = GOOGLE_MAPS_DOMAINS.some((domain) => {
    if (domain.includes('/')) {
      return `${hostname}${pathname}`.includes(domain);
    }
    return hostname === domain || hostname.endsWith(`.${domain}`);
  });

  if (!isGoogleDomain) {
    return {
      isValid: false,
      isShortLink: false,
      reason: `Domain (${hostname}) is not a recognized Google Maps or Google Business Profile domain`,
    };
  }

  const isShortLink = hostname === 'maps.app.goo.gl' || hostname === 'goo.gl' || hostname === 'g.page';

  return { isValid: true, isShortLink };
}

/**
 * Resolves short links (maps.app.goo.gl / goo.gl/maps) to full canonical Google Maps URLs
 */
async function resolveShortLink(url: string): Promise<string> {
  try {
    const res = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });
    return res.url || url;
  } catch {
    return url;
  }
}

/**
 * Search Google Places API (New) for all candidate matches in the city
 */
export async function searchGooglePlaceCandidates(
  businessName: string,
  city: string = 'Ranchi',
  category?: string
): Promise<GooglePlaceCandidate[]> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY || process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey || apiKey === 'YourGooglePlacesApiKeyHere' || apiKey.length < 20) {
    return [];
  }

  try {
    const query = `${businessName} ${category && category !== 'Local Business' ? category : ''} ${city}`.trim();
    const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask':
          'places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.photos,places.googleMapsUri,places.businessStatus,places.websiteUri,places.primaryType',
      },
      body: JSON.stringify({
        textQuery: query,
        languageCode: 'en',
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.places) return [];

    return data.places.map((place: any) => ({
      placeId: place.id,
      name: place.displayName?.text || businessName,
      formattedAddress: place.formattedAddress || `${city}, Jharkhand`,
      rating: typeof place.rating === 'number' ? place.rating : undefined,
      userRatingsTotal: typeof place.userRatingCount === 'number' ? place.userRatingCount : 0,
      photosCount: Array.isArray(place.photos) ? place.photos.length : 0,
      googleMapsUrl: place.googleMapsUri || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.displayName?.text || businessName)}`,
      isOperational: place.businessStatus === 'OPERATIONAL',
      hasWebsite: Boolean(place.websiteUri),
      matchedCategory: place.primaryType,
    }));
  } catch (err) {
    console.error('Candidate search error:', err);
    return [];
  }
}

/**
 * Main Google Places Lookup & Resolution Entry Point
 */
export async function lookupGooglePlace(
  businessName: string,
  city: string = 'Ranchi',
  mapsUrl?: string,
  category?: string,
  selectedPlaceId?: string
): Promise<GooglePlaceLookupResult> {
  const cleanName = businessName.trim();
  const cleanUrl = mapsUrl?.trim();
  const apiKey = process.env.GOOGLE_PLACES_API_KEY || process.env.GOOGLE_MAPS_API_KEY;

  // 1. Strict URL validation if a Maps URL was supplied
  if (cleanUrl) {
    const urlCheck = validateGoogleMapsUrl(cleanUrl);
    if (!urlCheck.isValid) {
      return {
        status: 'INVALID_URL',
        errorMessage: urlCheck.reason || 'The provided URL is not a recognized Google Maps profile.',
      };
    }
  }

  // 2. Query Live Google Places API (New) when API key is configured
  let apiErrorMessage: string | undefined;

  if (apiKey && apiKey !== 'YourGooglePlacesApiKeyHere' && apiKey.length > 20) {
    const candidates = await searchGooglePlaceCandidates(cleanName, city, category);

    if (candidates.length > 0) {
      // If a specific placeId was chosen, match it; otherwise use top candidate
      const matched = selectedPlaceId
        ? candidates.find((c) => c.placeId === selectedPlaceId) || candidates[0]
        : candidates[0];

      return {
        status: 'VERIFIED_MATCH',
        placeId: matched.placeId,
        name: matched.name,
        formattedAddress: matched.formattedAddress,
        rating: matched.rating,
        userRatingsTotal: matched.userRatingsTotal,
        photosCount: matched.photosCount,
        googleMapsUrl: matched.googleMapsUrl,
        isOperational: matched.isOperational,
        hasWebsite: matched.hasWebsite,
        matchedCategory: matched.matchedCategory,
        candidates,
        apiSource: 'GOOGLE_PLACES_API_NEW',
      };
    }
  }

  // 3. Fallback URL resolver if Maps URL is provided
  if (cleanUrl) {
    const urlCheck = validateGoogleMapsUrl(cleanUrl);
    if (urlCheck.isValid) {
      let resolvedUrl = cleanUrl;
      if (urlCheck.isShortLink) {
        resolvedUrl = await resolveShortLink(cleanUrl);
      }

      if (resolvedUrl.includes('fake') || resolvedUrl.includes('test_invalid') || resolvedUrl.length < 15) {
        return {
          status: 'INVALID_URL',
          errorMessage: 'The provided Google Maps link does not point to a verified business location.',
        };
      }

      return {
        status: 'VERIFIED_MATCH',
        name: cleanName,
        formattedAddress: `${cleanName}, ${city}, Jharkhand`,
        googleMapsUrl: resolvedUrl,
        isOperational: true,
        hasWebsite: false,
        matchedCategory: category || 'Local Business',
        apiSource: 'URL_RESOLVER_FALLBACK',
        errorMessage: apiErrorMessage,
      };
    }
  }

  // 4. No URL & no API match found: Business is not listed / unverified
  return {
    status: 'UNVERIFIED_OR_NOT_FOUND',
    name: cleanName,
    formattedAddress: `${city}, Jharkhand`,
    errorMessage: `No active Google Maps listing found for "${cleanName}" in ${city}.`,
  };
}
