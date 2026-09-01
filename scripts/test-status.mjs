async function testKeyStatus() {
  const apiKey = 'AIzaSyDfL-tzzrNWS1-sZzHLNk1RRhLVFcWBMLU';

  console.log('Testing Places API (New) for "Glow heaven ladies beauty parlour Ranchi":');
  const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask':
        'places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.photos,places.googleMapsUri,places.businessStatus',
    },
    body: JSON.stringify({
      textQuery: 'Glow heaven ladies beauty parlour Ranchi',
      languageCode: 'en',
    }),
  });

  const data = await res.json();
  console.log('API Status Response:', JSON.stringify(data, null, 2));
}

testKeyStatus().catch(console.error);
