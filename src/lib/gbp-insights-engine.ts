// GOOGLE BUSINESS PROFILE INSIGHTS ENGINE & CSV PARSER
// Supports authentic Google Business Profile exported CSVs, Performance API data, and KPI calculations

export interface GbpDailyOrMonthlyInsight {
  id?: string;
  period: string; // e.g., 'Recent 30 Days', 'August 2026', '2026-09-01 - 2026-09-15'
  shopCode?: string;
  businessName: string;
  address?: string;
  labels?: string;
  searchMobile: number;
  searchDesktop: number;
  mapsMobile: number;
  mapsDesktop: number;
  calls: number;
  messages: number;
  bookings: number;
  directions: number;
  websiteClicks: number;
  foodOrders: number;
  foodMenuClicks: number;
  hotelBookings: number;
  totalSearchViews: number;
  totalMapsViews: number;
  totalViews: number;
  totalActions: number;
  importedAt: string;
  source: 'CSV_UPLOAD' | 'GOOGLE_API' | 'MANUAL_ENTRY';
}

export const SEEDED_AUTHENTIC_GBP_INSIGHT: GbpDailyOrMonthlyInsight = {
  id: 'insight_seeded_1',
  period: 'Official Google Maps Insight Export',
  shopCode: '03393595767821993654',
  businessName: 'Life in Lights Academy',
  address: 'Near De Nobili School Parking, Jai Prakash Nagar, Dhanbad, Jharkhand 826001',
  labels: '',
  searchMobile: 71,
  searchDesktop: 30,
  mapsMobile: 24,
  mapsDesktop: 17,
  calls: 1,
  messages: 0,
  bookings: 0,
  directions: 48,
  websiteClicks: 3,
  foodOrders: 0,
  foodMenuClicks: 0,
  hotelBookings: 0,
  totalSearchViews: 101,
  totalMapsViews: 41,
  totalViews: 142,
  totalActions: 52,
  importedAt: new Date().toLocaleString(),
  source: 'CSV_UPLOAD',
};

/**
 * Robust CSV line splitter that respects quotes containing commas.
 */
export function splitCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim().replace(/^"|"$/g, ''));
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim().replace(/^"|"$/g, ''));
  return result;
}

/**
 * Parses raw CSV text exported from Google Business Profile Insights manager.
 * Handles both the 2-row header standard format (with description row) and single header format.
 */
export function parseGbpInsightsCsv(csvText: string, periodLabel?: string): GbpDailyOrMonthlyInsight[] {
  if (!csvText || !csvText.trim()) return [];

  const rawLines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (rawLines.length < 2) return [];

  // Find header row (the row containing 'Business name' or 'Shop code' or 'Google Search')
  let headerIndex = -1;
  for (let i = 0; i < rawLines.length; i++) {
    const lower = rawLines[i].toLowerCase();
    if (lower.includes('business name') || lower.includes('google search') || lower.includes('shop code')) {
      headerIndex = i;
      break;
    }
  }

  if (headerIndex === -1) {
    throw new Error('Could not identify valid Google Business Profile CSV headers in uploaded file.');
  }

  const headers = splitCsvLine(rawLines[headerIndex]).map((h) => h.toLowerCase().trim());
  const results: GbpDailyOrMonthlyInsight[] = [];

  // Data rows start after header row (and skip description sub-header row if present)
  for (let i = headerIndex + 1; i < rawLines.length; i++) {
    const line = rawLines[i];
    // Check if this row is the description row (starts with "Number of people" or mostly empty commas)
    if (line.toLowerCase().includes('number of people that viewed') || line.toLowerCase().includes('number of interactions')) {
      continue;
    }

    const cols = splitCsvLine(line);
    if (cols.length < 5) continue;

    // Helper to find column by multiple possible header keywords
    const getNum = (keywords: string[]): number => {
      for (const kw of keywords) {
        const idx = headers.findIndex((h) => h.includes(kw));
        if (idx !== -1 && cols[idx] !== undefined) {
          const val = parseInt(cols[idx].replace(/[^0-9]/g, ''), 10);
          return isNaN(val) ? 0 : val;
        }
      }
      return 0;
    };

    const getString = (keywords: string[]): string => {
      for (const kw of keywords) {
        const idx = headers.findIndex((h) => h.includes(kw));
        if (idx !== -1 && cols[idx] !== undefined) {
          return cols[idx];
        }
      }
      return '';
    };

    const businessName = getString(['business name', 'name', 'title']) || 'Google Business Profile';
    const shopCode = getString(['shop code', 'store code', 'shop']);
    const address = getString(['address', 'location', 'street']);
    const labels = getString(['labels', 'label']);

    const searchMobile = getNum(['search – mobile', 'search - mobile', 'search mobile']);
    const searchDesktop = getNum(['search – desktop', 'search - desktop', 'search desktop']);
    const mapsMobile = getNum(['maps – mobile', 'maps - mobile', 'maps mobile']);
    const mapsDesktop = getNum(['maps – desktop', 'maps - desktop', 'maps desktop']);
    const calls = getNum(['calls', 'phone calls', 'call']);
    const messages = getNum(['messages', 'conversations', 'chats']);
    const bookings = getNum(['bookings', 'booking']);
    const directions = getNum(['directions', 'direction requests', 'route']);
    const websiteClicks = getNum(['website clicks', 'website', 'web']);
    const foodOrders = getNum(['food orders', 'orders']);
    const foodMenuClicks = getNum(['food menu', 'menu clicks']);
    const hotelBookings = getNum(['hotel bookings']);

    const totalSearchViews = searchMobile + searchDesktop;
    const totalMapsViews = mapsMobile + mapsDesktop;
    const totalViews = totalSearchViews + totalMapsViews;
    const totalActions = calls + messages + bookings + directions + websiteClicks + foodOrders;

    results.push({
      id: `insight_${Date.now()}_${i}`,
      period: periodLabel || `Uploaded Report (${new Date().toLocaleDateString()})`,
      shopCode,
      businessName,
      address,
      labels,
      searchMobile,
      searchDesktop,
      mapsMobile,
      mapsDesktop,
      calls,
      messages,
      bookings,
      directions,
      websiteClicks,
      foodOrders,
      foodMenuClicks,
      hotelBookings,
      totalSearchViews,
      totalMapsViews,
      totalViews,
      totalActions,
      importedAt: new Date().toLocaleString(),
      source: 'CSV_UPLOAD',
    });
  }

  return results;
}
