import { lookupGooglePlace } from '../src/lib/google-places.ts';

async function testNewPlacesKey() {
  process.env.GOOGLE_PLACES_API_KEY = 'AIzaSyB63ku-P0PIYy-KYXBqeL_m1QlVYbmNKPM';

  console.log('Testing NEW Google Places API key with "Glow heaven ladies beauty parlour":');
  const result = await lookupGooglePlace(
    'Glow heaven ladies beauty parlour',
    'Ranchi',
    undefined,
    'Beauty Parlour'
  );

  console.log('\n--- Result from Live Google API ---');
  console.log(JSON.stringify(result, null, 2));
}

testNewPlacesKey().catch(console.error);
