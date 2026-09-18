import { NextResponse } from 'next/server';
import { getCurrentUserSession } from '@/lib/auth';
import { checkAndDeductAiCredits } from '@/lib/ai-credits';

export async function POST(request: Request) {
  try {
    const session = await getCurrentUserSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      reviewText = '',
      authorName = 'Valued Customer',
      rating = 5,
      businessName = 'Our Business',
      tone = 'professional', // 'professional' | 'grateful' | 'apologetic' | 'promotional'
      city = 'Ranchi',
    } = body;

    // AI Credit Gating & Deduction
    const creditCheck = await checkAndDeductAiCredits({
      userId: session?.userId,
      clientId: session?.clientId,
      userName: session?.name || authorName,
      businessName: businessName,
      action: 'REVIEW_REPLY',
      featureName: `AI Google Review Reply (${rating}★ - ${tone})`,
      creditsToDeduct: 1,
      promptText: `${reviewText} ${authorName} ${rating} ${businessName}`,
    });

    if (!creditCheck.allowed) {
      return NextResponse.json(
        {
          error: creditCheck.error || 'AI_CREDITS_EXHAUSTED',
          message: creditCheck.message || 'You have used all available AI credits. Please recharge your AI Wallet.',
          creditsRemaining: creditCheck.remainingCredits,
        },
        { status: 402 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    let replyText = '';

    if (apiKey && apiKey !== 'mock_key' && apiKey.length > 15) {
      try {
        const prompt = `You are a Google Business Profile reputation management expert. Write an authentic, personalized official owner response to this customer review.

Review Details:
- Customer Name: ${authorName}
- Star Rating: ${rating}/5
- Review Content: "${reviewText || 'Positive customer experience.'}"
- Business Name: ${businessName}
- City: ${city}
- Tone Desired: ${tone}

Guidelines:
- If 4-5 stars: Warmly thank them by name, reference specifics if mentioned, and invite them back.
- If 1-3 stars: Empathetically acknowledge feedback, apologize for the inconvenience, provide direct contact details for resolution without being defensive.
- Keep response between 2 to 4 sentences. Natural, professional, and courteous.
- Do NOT include quotes or placeholders. Return pure plain text reply only.`;

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.7,
                topP: 0.95,
                maxOutputTokens: 250,
              },
            }),
          }
        );

        if (geminiRes.ok) {
          const data = await geminiRes.json();
          replyText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
        }
      } catch (geminiErr) {
        console.warn('Gemini Review Reply API error, falling back to heuristic reply:', geminiErr);
      }
    }

    // Fallback heuristic response
    if (!replyText) {
      if (rating >= 4) {
        replyText = `Thank you so much, ${authorName}! We are thrilled to hear you had a great experience with ${businessName}. Your kind support motivates our entire team in ${city}. We look forward to serving you again soon!`;
      } else {
        replyText = `Dear ${authorName}, thank you for sharing your honest feedback. We are truly sorry that your experience did not meet expectations. At ${businessName}, we hold our quality standards high. Please connect with us directly so we can resolve this to your complete satisfaction.`;
      }
    }

    return NextResponse.json({
      success: true,
      replyText,
      creditsRemaining: creditCheck.remainingCredits,
      source: apiKey ? 'GEMINI_AI' : 'SYNTHESIS_ENGINE',
    });
  } catch (error: any) {
    console.error('Error generating AI review reply:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate review reply.' },
      { status: 500 }
    );
  }
}
