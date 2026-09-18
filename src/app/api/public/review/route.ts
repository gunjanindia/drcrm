import { NextResponse } from 'next/server';
import { globalStore } from '@/lib/store';
import { checkAndDeductAiCredits } from '@/lib/ai-credits';
import { checkRateLimit } from '@/lib/rate-limiter';

// Intelligent Category Classification Helper
function getCategoryAndConfig(categoryOrName: string, globalConfigs: any[]) {
  const text = (categoryOrName || '').toLowerCase();

  // 1. Beauty, Salon, Spa, Parlour, Makeup, Hair, Skincare
  if (
    text.includes('salon') ||
    text.includes('beauty') ||
    text.includes('parlour') ||
    text.includes('parlor') ||
    text.includes('spa') ||
    text.includes('makeup') ||
    text.includes('hair') ||
    text.includes('skin') ||
    text.includes('nail') ||
    text.includes('cosmetic') ||
    text.includes('barber')
  ) {
    const config = globalConfigs?.find((c) => c.category === 'BEAUTY_SALON') || globalConfigs?.[2];
    return {
      categoryKey: 'BEAUTY_SALON',
      categoryLabel: 'Salon & Beauty Parlour',
      defaultServices: ['Hair Styling & Cut', 'Bridal Makeup', 'Facial Glow Treatment', 'Hair Spa', 'Hygienic Manicure & Pedicure'],
      config,
    };
  }

  // 2. Food, Restaurant, Cafe, Bakery, Sweets, Dining
  if (
    text.includes('food') ||
    text.includes('restaur') ||
    text.includes('cafe') ||
    text.includes('bakery') ||
    text.includes('sweet') ||
    text.includes('dining') ||
    text.includes('hotel') ||
    text.includes('bar') ||
    text.includes('dhaba') ||
    text.includes('catering') ||
    text.includes('pizza') ||
    text.includes('burger')
  ) {
    const config = globalConfigs?.find((c) => c.category === 'FOOD_BEVERAGE') || globalConfigs?.[1];
    return {
      categoryKey: 'FOOD_BEVERAGE',
      categoryLabel: 'Restaurant & Cafe',
      defaultServices: ['Delicious Fresh Food', 'Quick Table Service', 'Cozy Ambiance', 'Family Dining', 'Authentic Taste'],
      config,
    };
  }

  // 3. Healthcare, Dental, Clinic, Doctor, Hospital, Medical
  if (
    text.includes('dent') ||
    text.includes('clinic') ||
    text.includes('doctor') ||
    text.includes('hospital') ||
    text.includes('health') ||
    text.includes('medical') ||
    text.includes('physio') ||
    text.includes('pharma')
  ) {
    const config = globalConfigs?.find((c) => c.category === 'HEALTHCARE') || globalConfigs?.[0];
    return {
      categoryKey: 'HEALTHCARE',
      categoryLabel: 'Dental & Healthcare Clinic',
      defaultServices: ['Painless Treatment', 'Doctor Consultation', 'Clean Clinic', 'Accurate Diagnosis', 'Gentle Care'],
      config,
    };
  }

  // 4. Retail & General Services
  const config = globalConfigs?.find((c) => c.category === 'RETAIL_SERVICES') || globalConfigs?.[3] || globalConfigs?.[0];
  return {
    categoryKey: 'RETAIL_SERVICES',
    categoryLabel: categoryOrName || 'Retail & Services',
    defaultServices: ['Quality Service', 'Honest Pricing', 'Prompt Response', 'Expert Consultation', 'Reliable Support'],
    config,
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug') || '';
    const scanType = searchParams.get('type') || 'QR'; // 'NFC' | 'QR'

    if (!slug) {
      return NextResponse.json({ error: 'Standee slug is required' }, { status: 400 });
    }

    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    const order = globalStore.getStandeeOrderBySlug(cleanSlug);
    let client = order ? globalStore.clients.find((c) => c.id === order.clientId) : null;

    if (!client) {
      client = globalStore.clients.find(
        (c) =>
          c.businessName.toLowerCase().replace(/[^a-z0-9]/g, '-').includes(cleanSlug) ||
          cleanSlug.includes(c.businessName.toLowerCase().replace(/[^a-z0-9]/g, '-'))
      ) || null;
    }

    const businessName = client?.businessName || cleanSlug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || 'Salon & Beauty Parlour';
    const rawCategory = client?.category || businessName;
    const { categoryKey, categoryLabel, defaultServices } = getCategoryAndConfig(rawCategory, globalStore.globalAiPromptConfigs);

    const clientId = client?.id || order?.clientId || `cli_${cleanSlug}`;
    const settings = globalStore.getAiReviewSettings(clientId);

    // Record Telemetry scan
    if (scanType === 'NFC') {
      globalStore.recordStandeeScan(clientId, 'NFC');
    } else {
      globalStore.recordStandeeScan(clientId, 'QR');
    }

    const keyServices = settings.keyServices && settings.keyServices.length > 0 && !settings.keyServices.includes('Painless Root Canal')
      ? settings.keyServices
      : defaultServices;

    const city = client?.city || 'Ranchi';

    return NextResponse.json({
      success: true,
      data: {
        clientId,
        businessName,
        category: settings.businessType || categoryLabel,
        city,
        rating: client?.averageRating || 5.0,
        reviewCount: client?.reviewCount || 42,
        googleMapsUrl: settings.reviewRedirectUrl || client?.googleMapsUrl || `https://maps.google.com/?q=${encodeURIComponent(businessName)}`,
        isShieldActive: settings.isShieldActive ?? true,
        keyServices,
        targetKeywords: settings.targetKeywords || [`best ${categoryLabel} in ${city}`, 'quick service'],
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

    const client = globalStore.clients.find((c) => c.id === clientId);
    const settings = globalStore.getAiReviewSettings(clientId || client?.id || 'dynamic');

    const businessName = client?.businessName || settings.businessType || 'Our Business';
    const city = client?.city || 'Ranchi';
    const rawCategory = settings.businessType || client?.category || businessName;
    const { categoryKey, categoryLabel, defaultServices } = getCategoryAndConfig(rawCategory, globalStore.globalAiPromptConfigs);

    // ACTION 1: Generate AI Review Variations (4-5 Stars)
    if (action === 'generate_review') {
      const apiKey = process.env.GEMINI_API_KEY;
      const keywords = (settings.targetKeywords || []).join(', ');
      const services = (selectedAspects && selectedAspects.length > 0 ? selectedAspects : (settings.keyServices?.length ? settings.keyServices : defaultServices)).join(', ');

      let reviewSuggestions: string[] = [];

      if (apiKey && apiKey !== 'mock_key' && apiKey.length > 15) {
        try {
          const prompt = `You are a real, satisfied customer writing a 5-star Google Maps review for "${businessName}" which is a "${categoryLabel}" in ${city}.
Tone: ${settings.tone || 'PROFESSIONAL'}.
Key Services / Highlights: ${services}.
SEO Keywords to naturally weave in without keyword stuffing: ${keywords || 'best service in town'}.
Instructions: ${settings.customInstructions || `Highlight courteous staff, skilled team, spotless hygiene, and outstanding ${categoryLabel} experience.`}

Generate 3 DISTINCT, highly realistic, natural 5-star review variations specifically for a ${categoryLabel} (Short & Punchy, Detailed Experience, Enthusiastic Recommendation).
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

      // Intelligent Fallback templates tailored strictly to category
      if (reviewSuggestions.length === 0) {
        if (categoryKey === 'BEAUTY_SALON') {
          reviewSuggestions = [
            `Loved my visit to ${businessName}! The stylist understood exactly what I wanted, and the salon maintained impeccable hygiene. Easily the best salon in ${city}!`,
            `Outstanding beauty services and very courteous staff at ${businessName}. Used premium branded products and took great care. 5 stars without hesitation!`,
            `Very relaxing ambiance and skilled artists at ${businessName}. Left feeling completely refreshed and satisfied with the results. Highly recommended!`,
          ];
        } else if (categoryKey === 'FOOD_BEVERAGE') {
          reviewSuggestions = [
            `Amazing food and delightful ambiance at ${businessName}! The flavors were authentic and portion sizes are generous. Best dining in ${city}!`,
            `Super quick service, polite staff, and mouthwatering dishes at ${businessName}. Highly recommended to everyone!`,
            `Cozy vibes and top-notch taste. Every dish was freshly prepared and served piping hot at ${businessName}. 10/10 recommendation!`,
          ];
        } else if (categoryKey === 'HEALTHCARE') {
          reviewSuggestions = [
            `Excellent experience with the doctor and courteous staff at ${businessName}. The clinic is spotlessly clean and treatment was completely painless. Highly recommended in ${city}!`,
            `Very professional consultation and caring demeanor at ${businessName}. Explained the diagnosis clearly with transparent fees. Truly grateful for the treatment.`,
            `State-of-the-art facility at ${businessName} with minimal waiting time. The doctor gave ample time and answered all my concerns. Five stars!`,
          ];
        } else {
          reviewSuggestions = [
            `Outstanding experience with ${businessName}! Extremely polite staff, punctual service, and honest pricing. Easily the best ${categoryLabel} in ${city}.`,
            `Very impressed by the quality of work and attention to detail at ${businessName}. The team delivered beyond expectations. 5 stars!`,
            `Prompt turnaround, great ambiance, and fair transparent charges at ${businessName}. Highly recommended to anyone in ${city}!`,
          ];
        }
      }

      // Deduct AI credits for merchant & log usage
      if (client?.id) {
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
      }

      return NextResponse.json({
        success: true,
        data: {
          reviews: reviewSuggestions,
          googleMapsUrl: settings.reviewRedirectUrl || client?.googleMapsUrl || `https://maps.google.com/?q=${encodeURIComponent(businessName)}`,
        },
      });
    }

    // ACTION 2: Submit Private Feedback (1-3 Stars)
    if (action === 'submit_private_feedback') {
      if (!message || !message.trim()) {
        return NextResponse.json({ error: 'Feedback message is required' }, { status: 400 });
      }

      const feedback = globalStore.addPrivateFeedback({
        clientId: client?.id || clientId || 'guest_feedback',
        businessName,
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
      if (client?.id) {
        globalStore.recordStandeeScan(client.id, 'GOOGLE_REDIRECT');
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    console.error('POST /api/public/review error:', err);
    return NextResponse.json({ error: 'Failed to process review request' }, { status: 500 });
  }
}
