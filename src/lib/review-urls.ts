/**
 * Digital Ranchi — Google Business Profile Review Dialog URL Builder
 * Converts any Google Maps URL, Place ID, CID, or shortlink into the official
 * Google Business Profile Direct Review Dialog URL.
 */

export function extractPlaceId(urlOrId?: string | null): string | null {
  if (!urlOrId || typeof urlOrId !== 'string') return null;
  const str = urlOrId.trim();

  // If already a clean Google Place ID
  if (/^ChIJ[a-zA-Z0-9_-]{20,}$/.test(str)) {
    return str;
  }

  // Look for ChIJ placeId inside URL or text
  const match = str.match(/(ChIJ[a-zA-Z0-9_-]{20,})/);
  if (match && match[1]) {
    return match[1];
  }

  // Look for query param placeid or place_id or query_place_id
  const qMatch = str.match(/[?&](?:placeid|place_id|query_place_id)=([^&]+)/i);
  if (qMatch && qMatch[1]) {
    return decodeURIComponent(qMatch[1]);
  }

  return null;
}

export function extractCid(url?: string | null): string | null {
  if (!url || typeof url !== 'string') return null;
  const str = url.trim();

  // 1. Check for ?cid=123456 or &cid=123456
  const cidParamMatch = str.match(/[?&]cid=([0-9]+)/i);
  if (cidParamMatch && cidParamMatch[1]) {
    return cidParamMatch[1];
  }

  // 2. Check for Google Maps !1s0x...:0xHEX data parameter
  const hexMatch = str.match(/!1s0x[0-9a-fA-F]+:(0x[0-9a-fA-F]+)/i);
  if (hexMatch && hexMatch[1]) {
    try {
      return BigInt(hexMatch[1]).toString();
    } catch {
      // Ignore BigInt parse failure
    }
  }

  // 3. Check for raw (0xHEX1:0xHEX2)
  const hexMatch2 = str.match(/(0x[0-9a-fA-F]+):(0x[0-9a-fA-F]+)/i);
  if (hexMatch2 && hexMatch2[2]) {
    try {
      return BigInt(hexMatch2[2]).toString();
    } catch {
      // Ignore BigInt parse failure
    }
  }

  return null;
}

export interface GoogleReviewUrlParams {
  placeId?: string | null;
  googleMapsUrl?: string | null;
  businessName?: string | null;
  city?: string | null;
}

/**
 * Builds the official Google Review Dialog URL that directly opens the 5-star rating
 * and review submission dialog on desktop and mobile.
 */
export function buildGoogleReviewDialogUrl(params: GoogleReviewUrlParams): string {
  const { placeId, googleMapsUrl, businessName, city } = params;

  // 1. Direct Place ID provided or found in placeId param
  const cleanPlaceId = extractPlaceId(placeId);
  if (cleanPlaceId) {
    return `https://search.google.com/local/writereview?placeid=${encodeURIComponent(cleanPlaceId)}`;
  }

  // 2. If googleMapsUrl is provided, parse and convert to direct review URL
  if (googleMapsUrl && typeof googleMapsUrl === 'string') {
    const trimmedUrl = googleMapsUrl.trim();

    // Already direct writereview URL
    if (trimmedUrl.includes('search.google.com/local/writereview')) {
      return trimmedUrl;
    }

    // Place ID extracted from googleMapsUrl
    const urlPlaceId = extractPlaceId(trimmedUrl);
    if (urlPlaceId) {
      return `https://search.google.com/local/writereview?placeid=${encodeURIComponent(urlPlaceId)}`;
    }

    // CID extracted from googleMapsUrl (decimal or hex)
    const urlCid = extractCid(trimmedUrl);
    if (urlCid) {
      return `https://search.google.com/local/writereview?cid=${encodeURIComponent(urlCid)}`;
    }

    // g.page short link format (e.g. https://g.page/r/XXXXX or https://g.page/mybusiness)
    if (trimmedUrl.includes('g.page/')) {
      if (trimmedUrl.endsWith('/review')) return trimmedUrl;
      return trimmedUrl.replace(/\/+$/, '') + '/review';
    }

    // If it's a valid web URL (e.g. shortlink maps.app.goo.gl)
    if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
      return trimmedUrl;
    }
  }

  // 3. Fallback to Google Maps review intent search with business name & city
  const name =
    businessName && businessName !== 'Verified Business' && businessName !== 'Our Business'
      ? businessName
      : 'Local Business';
  const query = city ? `${name} ${city}` : name;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

// Alias for convenience
export const getDirectGoogleReviewDialogUrl = buildGoogleReviewDialogUrl;
