function extractPlaceId(urlOrId) {
  if (!urlOrId) return null;
  const str = urlOrId.trim();
  if (/^ChIJ[a-zA-Z0-9_-]{20,}$/.test(str)) return str;
  const match = str.match(/(ChIJ[a-zA-Z0-9_-]{20,})/);
  if (match && match[1]) return match[1];
  const qMatch = str.match(/[?&](?:placeid|place_id|query_place_id)=([^&]+)/i);
  if (qMatch && qMatch[1]) return decodeURIComponent(qMatch[1]);
  return null;
}

function extractCid(url) {
  if (!url) return null;
  const str = url.trim();
  const cidParamMatch = str.match(/[?&]cid=([0-9]+)/i);
  if (cidParamMatch && cidParamMatch[1]) return cidParamMatch[1];
  const hexMatch = str.match(/!1s0x[0-9a-fA-F]+:(0x[0-9a-fA-F]+)/);
  if (hexMatch && hexMatch[1]) {
    try {
      return BigInt(hexMatch[1]).toString();
    } catch {}
  }
  const hexMatch2 = str.match(/(0x[0-9a-fA-F]+):(0x[0-9a-fA-F]+)/);
  if (hexMatch2 && hexMatch2[2]) {
    try {
      return BigInt(hexMatch2[2]).toString();
    } catch {}
  }
  return null;
}

function buildGoogleReviewDialogUrl(params) {
  const { placeId, googleMapsUrl, businessName, city } = params || {};

  // 1. Direct Place ID provided or found in placeId param
  const cleanPlaceId = extractPlaceId(placeId);
  if (cleanPlaceId) {
    return 'https://search.google.com/local/writereview?placeid=' + encodeURIComponent(cleanPlaceId);
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
      return 'https://search.google.com/local/writereview?placeid=' + encodeURIComponent(urlPlaceId);
    }

    // CID extracted from googleMapsUrl (decimal or hex)
    const urlCid = extractCid(trimmedUrl);
    if (urlCid) {
      return 'https://search.google.com/local/writereview?cid=' + encodeURIComponent(urlCid);
    }

    // g.page short link format (e.g. https://g.page/r/XXXXX or https://g.page/mybusiness)
    if (trimmedUrl.includes('g.page/')) {
      if (trimmedUrl.endsWith('/review')) return trimmedUrl;
      return trimmedUrl.replace(/\/+$/, '') + '/review';
    }

    // If it's a maps.app.goo.gl or goo.gl shortlink without explicit ID
    if (trimmedUrl.startsWith('http')) {
      return trimmedUrl;
    }
  }

  // 3. Fallback to Google Maps review intent search with business name & city
  const name = businessName && businessName !== 'Verified Business' && businessName !== 'Our Business'
    ? businessName
    : 'Local Business';
  const query = city ? name + ' ' + city : name;
  return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(query);
}

// Tests
console.log('Test 1 (Place ID):', buildGoogleReviewDialogUrl({ placeId: 'ChIJAQN8pJQf9TkRsHVxKxqf_VI' }));
console.log('Test 2 (Hex URL):', buildGoogleReviewDialogUrl({ googleMapsUrl: 'https://www.google.com/maps/place/Lay+Taal/@23.36,85.32/data=!3m1!4b1!4m6!3m5!1s0x39f4e194a47c0369:0x55ff9f1a2b71b5b1!8m2!3d23.36!4d85.32' }));
console.log('Test 3 (CID param URL):', buildGoogleReviewDialogUrl({ googleMapsUrl: 'https://maps.google.com/?cid=123456789012345' }));
console.log('Test 4 (g.page shortlink):', buildGoogleReviewDialogUrl({ googleMapsUrl: 'https://g.page/r/Cb_12345' }));
console.log('Test 5 (writereview as is):', buildGoogleReviewDialogUrl({ googleMapsUrl: 'https://search.google.com/local/writereview?placeid=ChIJAQN8pJQf9TkRsHVxKxqf_VI' }));
console.log('Test 6 (Fallback):', buildGoogleReviewDialogUrl({ businessName: 'Lay Taal Dance Academy', city: 'Ranchi' }));
