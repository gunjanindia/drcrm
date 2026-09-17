import { NextResponse } from 'next/server';
import { searchGooglePlaceCandidates, lookupGooglePlace } from '@/lib/google-places';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      businessName = '',
      city = 'Ranchi',
      district = '',
      address = '',
      googleMapsUrl = '',
      category = 'Local Business',
    } = body;

    const cleanBizName = businessName.trim();
    const cleanCity = city.trim() || 'Ranchi';
    const cleanDistrict = district.trim();
    const cleanAddress = address.trim();
    const cleanMapsUrl = googleMapsUrl.trim();

    if (!cleanBizName && !cleanMapsUrl) {
      return NextResponse.json(
        { error: 'Business name or Google Maps URL is required for search.' },
        { status: 400 }
      );
    }

    // 1. If exact Google Maps URL is provided, perform deep lookup first
    if (cleanMapsUrl) {
      const directLookup = await lookupGooglePlace(
        cleanBizName || 'My Business',
        cleanCity,
        cleanMapsUrl,
        category
      );

      if (directLookup.status === 'VERIFIED_MATCH') {
        const candidate = {
          placeId: directLookup.placeId || `loc_${Date.now()}`,
          name: directLookup.name || cleanBizName,
          formattedAddress: directLookup.formattedAddress || `${cleanCity}, Jharkhand`,
          rating: directLookup.rating ?? 4.9,
          userRatingsTotal: directLookup.userRatingsTotal ?? 25,
          photosCount: directLookup.photosCount ?? 12,
          googleMapsUrl: directLookup.googleMapsUrl || cleanMapsUrl,
          matchedCategory: directLookup.matchedCategory || category,
          isOperational: directLookup.isOperational ?? true,
          matchConfidence: 100,
          phone: directLookup.phone || '+91 94311 00000',
          reviews: directLookup.reviews || [],
        };

        return NextResponse.json({
          success: true,
          total: 1,
          candidates: [candidate],
          source: 'EXACT_GOOGLE_MAPS_URL',
        });
      }
    }

    // 2. Search candidates via Google Places API (New) with district and address
    const districtOrAddressQuery = [cleanDistrict, cleanAddress].filter(Boolean).join(', ');
    const candidates = await searchGooglePlaceCandidates(
      cleanBizName,
      cleanCity,
      category,
      districtOrAddressQuery
    );

    return NextResponse.json({
      success: true,
      total: candidates.length,
      candidates,
      query: {
        businessName: cleanBizName,
        city: cleanCity,
        district: cleanDistrict,
        address: cleanAddress,
      },
    });
  } catch (error: any) {
    console.error('POST /api/portal/gbp-search error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to search Google Business Profiles' },
      { status: 500 }
    );
  }
}
