import { NextResponse } from 'next/server';
import { globalStore } from '@/lib/store';
import { checkAndDeductAiCredits } from '@/lib/ai-credits';
import { checkRateLimit } from '@/lib/rate-limiter';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug') || '';
    const scanType = searchParams.get('type') || 'QR'; // 'NFC' | 'QR'

    if (!slug) {
      return NextResponse.json({ error: 'Standee slug is required' }, { status: 400 });
    }

    const order = globalStore.getStandeeOrderBySlug(slug);
    let client = order ? globalStore.clients.find((c) => c.id === order.clientId) : null;

    if (!client) {
      // Fallback matching by businessName slug
      const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9]/g, '-');
      client = globalStore.clients.find(
        (c) =>
          c.businessName
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '-')
            .includes(cleanSlug) ||
          cleanSlug.includes(
            c.businessName
              .toLowerCase()
              .replace(/[^a-z0-9]/g, '-')
          )
      ) || globalStore.clients[0];
    }

    const clientId = client?.id || order?.clientId || 'cli_city_dental';
    const settings = globalStore.getAiReviewSettings(clientId);

    // Record Telemetry scan
    if (scanType === 'NFC') {
      globalStore.recordStandeeScan(clientId, 'NFC');
    } else {
      globalStore.recordStandeeScan(clientId, 'QR');
    }

    return NextResponse.json({
      success: true,
      data: {
        clientId,
        businessName: client?.businessName || 'Business Profile',
        category: client?.category || 'Local Business',
        city: client?.city || 'Ranchi',
        rating: client?.averageRating || 5.0,
        reviewCount: client?.reviewCount || 30,
        googleMapsUrl: settings.reviewRedirectUrl || client?.googleMapsUrl || `https://maps.google.com/?q=${encodeURIComponent(client?.businessName || 'Business')}`,
        isShieldActive: settings.isShieldActive ?? true,
        keyServices: settings.keyServices || [],
        targetKeywords: settings.targetKeywords || [],
        tone: settings.tone || 'PROFESSIONAL',
      },
    });
  } catch (err: any) {
    console.error('GET /api/public/review error:', err);
    return NextResponse.json({ error: 'Failed to initialize review experience' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const forwardedHeader = request.headers.get('x-forwarded-for');
    const clientIp = forwardedHeader ? forwardedHeader.split(',')[0].trim() : 'unknown-ip';

    // Rate limiting: max 20 requests per minute per IP
    const rateCheck = checkRateLimit(`pub_rev_${clientIp}`, 20, 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json({ error: 'Too many requests. Please try again shortly.' }, { status: 429 });
    }

    const body = await request.json();
    const { action, clientId, rating = 5, customerName, customerPhone, customerEmail, message, selectedAspects, source = 'NFC_STANDEE' } = body;

    const client = globalStore.clients.find((c) => c.id === clientId) || globalStore.clients[0];
    const settings = globalStore.getAiReviewSettings(clientId || client.id);

    // ACTION 1: Generate AI Review Variations (4-5 Stars)
    if (action === 'generate_review') {
      const apiKey = process.env.GEMINI_API_KEY;
      const businessName = client?.businessName || 'Our Business';
      const category = client?.category || 'Local Business';
      const city = client?.city || 'Ranchi';
      const keywords = (settings.targetKeywords || []).join(', ');
      const services = (selectedAspects && selectedAspects.length > 0 ? selectedAspects : settings.keyServices || []).join(', ');

      let reviewSuggestions: string[] = [];

      if (apiKey && apiKey !== 'mock_key' && apiKey.length > 15) {
        try {
          const prompt = `You are a real, satisfied customer writing a 5-star Google Maps review for "${businessName}" (${category}) in ${city}.
Tone: ${settings.tone || 'PROFESSIONAL'}.
Key Services / Highlights: ${services || 'prompt service, quality work'}.
SEO Keywords to naturally weave in without keyword stuffing: ${keywords || 'best service'}.
Instructions: ${settings.customInstructions || 'Highlight courteous staff and reliable results.'}

Generate 3 DISTINCT, highly realistic, natural 5-star review variations (Short & Punchy, Detailed Experience, Enthusiastic Recommendation).
Return as a pure JSON array of 3 strings ONLY: ["Review 1...", "Review 2...", "Review 3..."]`;

          const geminiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                  temperature: 0.8,
                  topP: 0.95,
                  maxOutputTokens: 1024,
                },
              }),
            }
          );

          if (geminiRes.ok) {
            const data = await geminiRes.json();
            const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
            const cleanedText = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(cleanedText);
            if (Array.isArray(parsed) && parsed.length > 0) {
              reviewSuggestions = parsed;
            }
          }
        } catch (e) {
          console.warn('Gemini public review generation error, using smart fallback template:', e);
        }
      }

      // Fallback heuristics if API unreachable
      if (reviewSuggestions.length === 0) {
        const catConfig = globalStore.globalAiPromptConfigs.find(
          (c) => c.category.toLowerCase() === category.toLowerCase()
        ) || globalStore.globalAiPromptConfigs[0];

        reviewSuggestions = catConfig?.fallbackReviews || [
          `Outstanding experience with ${businessName}! Extremely polite staff, punctual service, and honest pricing. Easily the best ${category} in ${city}.`,
          `Very impressed by the quality of work and attention to detail. The team explained everything clearly and delivered beyond expectations. 5 stars!`,
          `Prompt turnaround, great ambiance, and fair transparent charges. Highly recommended to anyone looking for trusted ${category} in ${city}!`,
        ];
      }

      // Deduct AI credits for merchant & log usage
      await checkAndDeductAiCredits({
        clientId: client.id,
        businessName: client.businessName,
        action: 'REVIEW_REPLY',
        featureName: `Smart Standee AI Review Generation (${rating}★)`,
        creditsToDeduct: 1,
        promptText: `Public NFC/QR review generation for ${businessName}`,
        completionText: reviewSuggestions.join(' | '),
      }).catch(() => null);

      // Record Telemetry
      globalStore.recordStandeeScan(client.id, 'REVIEW_GEN');

      return NextResponse.json({
        success: true,
        data: {
          reviews: reviewSuggestions,
          googleMapsUrl: settings.reviewRedirectUrl || client.googleMapsUrl || `https://maps.google.com/?q=${encodeURIComponent(businessName)}`,
        },
      });
    }

    // ACTION 2: Submit Private Feedback (1-3 Stars)
    if (action === 'submit_private_feedback') {
      if (!message || !message.trim()) {
        return NextResponse.json({ error: 'Feedback message is required' }, { status: 400 });
      }

      const feedback = globalStore.addPrivateFeedback({
        clientId: client.id,
        businessName: client.businessName,
        customerName: customerName?.trim() || 'Anonymous Customer',
        customerPhone: customerPhone?.trim() || 'Not Provided',
        customerEmail: customerEmail?.trim() || undefined,
        rating: Number(rating) || 2,
        message: message.trim(),
        status: 'NEW',
        source: source === 'NFC' ? 'NFC_STANDEE' : 'QR_CODE',
      });

      return NextResponse.json({
        success: true,
        message: 'Thank you for your valuable feedback. Our management team will look into this immediately to resolve your concerns.',
        data: feedback,
      });
    }

    // ACTION 3: Record Google Review Dialog Redirect
    if (action === 'record_google_redirect') {
      globalStore.recordStandeeScan(client.id, 'GOOGLE_REDIRECT');
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    console.error('POST /api/public/review error:', err);
    return NextResponse.json({ error: 'Failed to process review request' }, { status: 500 });
  }
}
