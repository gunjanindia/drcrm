import { NextResponse } from 'next/server';
import { getCurrentUserSession } from '@/lib/auth';
import { checkAndDeductAiCredits } from '@/lib/ai-credits';

export async function POST(request: Request) {
  try {
    const session = await getCurrentUserSession();
    // Portal users (clients) or Admin users can use the AI fill route
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      businessName = '',
      category = 'Local Business',
      city = 'Dhanbad',
      currentAddress = '',
      currentPhone = '',
      currentWhatsapp = '',
      currentWorkingHours = '',
      section = 'all', // 'all' | 'contact' | 'about' | 'services' | 'reviews' | 'gallery' | 'faqs'
    } = body;

    // AI Credit Gating & Deduction
    const creditCheck = await checkAndDeductAiCredits({
      userId: session?.userId,
      clientId: session?.clientId,
      userName: session?.name || 'Portal User',
      businessName: businessName || 'Client Business',
      action: 'SITE_BUILDER_AI_FILL',
      featureName: `Site Builder AI Auto-Fill (${section.toUpperCase()})`,
      creditsToDeduct: 1,
      promptText: `${businessName} ${category} ${city} ${section}`,
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

    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    let aiData: any = null;

    if (apiKey && apiKey !== 'mock_key' && apiKey.length > 15) {
      try {
        const prompt = `You are an elite AI Business Consultant and Website Optimization Expert for local Indian businesses.
Fill in and generate comprehensive, high-converting, realistic data for a One-Page Website.

Business Information:
- Business Name: ${businessName || 'Local Business'}
- Category: ${category}
- City / Region: ${city || 'India'}
- Current Phone: ${currentPhone || 'Not set'}
- Current WhatsApp: ${currentWhatsapp || 'Not set'}
- Current Address: ${currentAddress || 'Not set'}
- Current Working Hours: ${currentWorkingHours || 'Not set'}
- Section Requested: ${section}

Provide clean, realistic, premium content suitable for India. If current phone/WhatsApp/address/working hours are already valid, you may refine them, or generate clean, realistic professional contact details for ${city || 'the region'} (e.g. Phone: "+91 98351 24567", WhatsApp: "+91 98351 24567", Address: realistic commercial area in ${city || 'City Center'}).

Return a pure JSON object ONLY (NO markdown code blocks, NO backticks, NO markdown syntax) matching this schema:
{
  "phone": "+91 98351 24567",
  "whatsapp": "+91 98351 24567",
  "address": "Shop / Floor No., Main Road, Near Landmark, ${city || 'City Center'}",
  "workingHours": "Mon - Sat: 9:30 AM - 8:30 PM | Sunday: 10:00 AM - 2:00 PM",
  "headline": "Punchy, high-converting headline tailored to ${businessName || category} in ${city}",
  "subheadline": "Persuasive 2-sentence value proposition explaining why customers should choose ${businessName || 'us'}.",
  "aboutTitle": "About ${businessName || 'Our Business'}",
  "aboutText": "Compelling 2-paragraph narrative highlighting dedication to customer satisfaction, modern methodology, experienced team, and trusted reputation in ${city}.",
  "aboutBadge": "10+ Years",
  "aboutBadgeTitle": "Industry Experience",
  "aboutBadgeDesc": "Committed to delivering unmatched quality & trusted customer care across ${city}.",
  "aboutPillars": [
    "Certified & Highly Experienced Specialists",
    "100% Transparent & Fair Pricing",
    "Modern Techniques & Top-Tier Equipment",
    "Fast Support & Dedicated Aftercare"
  ],
  "ratingOverride": 4.9,
  "reviewCountOverride": 68,
  "services": [
    { "title": "Service 1 Name", "desc": "Clear, appealing description of deliverables.", "price": "₹999 onwards", "badge": "Most Popular" },
    { "title": "Service 2 Name", "desc": "Description...", "price": "Custom Quote", "badge": "Essential" },
    { "title": "Service 3 Name", "desc": "Description...", "price": "₹1,499 onwards" },
    { "title": "Service 4 Name", "desc": "Description...", "price": "Free Consultation" }
  ],
  "faqs": [
    { "q": "How can I book an appointment or get a service estimate?", "a": "You can reach out directly via WhatsApp or call our support line. We respond promptly with detailed pricing." },
    { "q": "What makes ${businessName || 'your business'} stand out in ${city}?", "a": "We prioritize verified quality, certified expertise, and complete pricing transparency without hidden costs." },
    { "q": "What are your standard business hours and modes of payment?", "a": "We are open Monday through Saturday with UPI, cards, and cash payment options available." }
  ],
  "reviews": [
    { "authorName": "Amit Sharma", "rating": 5, "text": "Outstanding service from ${businessName}! Extremely polite staff, prompt turnaround, and fair charges.", "relativeTime": "1 week ago" },
    { "authorName": "Pooja Verma", "rating": 5, "text": "Very clean facility and knowledgeable team. Easily the best experience in ${city}.", "relativeTime": "3 weeks ago" },
    { "authorName": "Rajesh Kumar", "rating": 5, "text": "Highly recommended for their professional approach and honest advice. Will visit again!", "relativeTime": "1 month ago" }
  ],
  "galleryImages": [
    { "title": "Main Facility & Service Area", "category": "Facility", "aspect": "landscape" },
    { "title": "Professional Work in Action", "category": "Work Showcase", "aspect": "landscape" },
    { "title": "Verified Quality Results", "category": "Client Results", "aspect": "landscape" }
  ]
}`;

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
                maxOutputTokens: 2048,
              },
            }),
          }
        );

        if (geminiRes.ok) {
          const data = await geminiRes.json();
          const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
          const cleanedText = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
          aiData = JSON.parse(cleanedText);
        }
      } catch (geminiErr) {
        console.warn('Gemini API call failed, using intelligent synthesis engine:', geminiErr);
      }
    }

    // Heuristics Fallback Engine if Gemini API is unreachable or not configured
    if (!aiData) {
      const cCity = city?.trim() || 'Dhanbad';
      const cName = businessName?.trim() || 'Premier Care';
      const cCat = category?.trim() || 'Professional Service';

      const isMedical = /clinic|doctor|dental|hospital|health|physician|derma|skin/i.test(cCat);
      const isSalon = /salon|beauty|spa|hair|makeup|bridal|parlour/i.test(cCat);
      const isFood = /restaurant|cafe|dining|food|bakery|bar|kitchen/i.test(cCat);
      const isAuto = /garage|car|auto|motor|repair|bike/i.test(cCat);

      const generatedPhone = currentPhone && currentPhone.length > 8 ? currentPhone : '+91 98351 24567';
      const generatedWhatsapp = currentWhatsapp && currentWhatsapp.length > 8 ? currentWhatsapp : generatedPhone;
      const generatedAddress = currentAddress && currentAddress.length > 10 ? currentAddress : `City Center Mall Road, Near Bank More, ${cCity}, Jharkhand`;
      const generatedHours = currentWorkingHours && currentWorkingHours.length > 6 ? currentWorkingHours : 'Mon - Sat: 9:30 AM - 8:30 PM | Sun: 10:00 AM - 2:00 PM';

      let headline = `Top-Rated ${cCat} in ${cCity} – Trusted by Hundreds of Clients`;
      let subheadline = `Experience premium, certified ${cCat} solutions at ${cName}. Personalized attention, modern standards, and honest local pricing.`;
      let aboutBadge = '10+ Years';
      let aboutBadgeTitle = 'Trusted Experience';
      let aboutBadgeDesc = `Proudly serving ${cCity} with dedicated quality and verified client satisfaction.`;
      let services = [
        { title: 'Signature Consultation & Assessment', desc: `In-depth evaluation tailored to your exact ${cCat} needs with honest recommendations.`, price: 'Free / ₹499', badge: 'Most Popular' },
        { title: 'Comprehensive Care & Treatment Package', desc: 'End-to-end service using standard procedures and high-grade materials.', price: '₹1,499 onwards', badge: 'Recommended' },
        { title: 'Express & Priority Support', desc: 'Fast turnaround service with dedicated technician or specialist support.', price: 'Custom Quote' },
        { title: 'Maintenance & Follow-up Support', desc: 'Ensuring long-term results and peace of mind with verified guarantees.', price: 'Included' },
      ];

      if (isMedical) {
        headline = `Specialized Healthcare & Patient-First Treatments in ${cCity}`;
        subheadline = `Welcome to ${cName}. Board-certified doctors, modern medical equipment, and gentle, comprehensive care for your whole family.`;
        aboutBadge = '12+ Years';
        aboutBadgeTitle = 'Clinical Excellence';
        services = [
          { title: 'Complete Diagnostic Health Checkup', desc: 'Detailed physical evaluation with vitals, diagnostic review, and tailored advice.', price: '₹500 onwards', badge: 'Essential' },
          { title: 'Advanced Specialized Treatment', desc: 'State-of-the-art procedure conducted by certified specialists with maximum comfort.', price: '₹1,500 onwards', badge: 'High Demand' },
          { title: 'Preventive Care & Health Screening', desc: 'Early detection, routine checkups, and preventive wellness programs.', price: '₹999 onwards' },
          { title: 'Emergency & Urgent Consultation', desc: 'Prompt medical attention for urgent symptoms and immediate stabilization.', price: 'Walk-in' },
        ];
      } else if (isSalon) {
        headline = `Transform Your Look with Luxury Hair, Skin & Makeup in ${cCity}`;
        subheadline = `Indulge in high-end styling and rejuvenating skin therapies at ${cName}. Premium international products and certified beauty artists.`;
        aboutBadge = '8+ Years';
        aboutBadgeTitle = 'Beauty Artistry';
        services = [
          { title: 'Signature Haircut, Wash & Blowdry', desc: 'Custom face-flattering cuts and deep nourishing spa treatment.', price: '₹699 onwards', badge: 'Popular' },
          { title: 'Hydra Glow Skin Treatment & Facial', desc: 'Deep pore cleansing, fruit enzymatic peeling, and collagen hydration.', price: '₹1,499 onwards', badge: 'Trending' },
          { title: 'Bridal & Party Makeover Packages', desc: 'HD and Airbrush makeup, hairstyling, saree draping, and pre-bridal glow.', price: '₹4,999 onwards' },
          { title: 'Keratin & Protein Hair Smoothening', desc: 'Frizz-free, glossy hair treatment that lasts up to 6 months.', price: '₹2,999 onwards' },
        ];
      } else if (isFood) {
        headline = `Authentic Flavors, Fresh Ingredients & Cozy Dining in ${cCity}`;
        subheadline = `Discover rich culinary traditions and modern taste at ${cName}. Freshly prepared dishes, warm ambiance, and doorstep delivery.`;
        aboutBadge = '15+ Years';
        aboutBadgeTitle = 'Culinary Legacy';
        services = [
          { title: 'Chef Special Sizzlers & Grills', desc: 'Served hot with signature herbs, roasted veggies, and secret house sauce.', price: '₹349 onwards', badge: 'Must Try' },
          { title: 'Family Feast Platter', desc: 'Curated multi-course combo featuring appetizers, main course, breads & dessert.', price: '₹999 for four', badge: 'Best Value' },
          { title: 'Handcrafted Beverages & Desserts', desc: 'Freshly brewed coffees, mocktails, artisanal ice creams, and pastries.', price: '₹149 onwards' },
          { title: 'Private Party & Catering Service', desc: 'Customized menus for birthdays, corporate lunches, and family gatherings.', price: 'Custom Quote' },
        ];
      }

      aiData = {
        phone: generatedPhone,
        whatsapp: generatedWhatsapp,
        address: generatedAddress,
        workingHours: generatedHours,
        headline,
        subheadline,
        aboutTitle: `About ${cName}`,
        aboutText: `${cName} is one of the most trusted ${cCat} centers in ${cCity}. Founded with a clear vision to offer transparent, top-tier services, we combine years of hands-on experience with modern equipment to ensure every customer receives exceptional care.\n\nOur team is committed to ethical standards, personalized consultations, and continuous support. Whether you visit us for routine services or specialized assistance, we guarantee punctuality, cleanliness, and reliable results that build lifelong relationships.`,
        aboutBadge,
        aboutBadgeTitle,
        aboutBadgeDesc: `Dedicated to providing unmatched ${cCat} experiences with verified five-star ratings across ${cCity}.`,
        aboutPillars: [
          'Certified & Experienced Professionals',
          '100% Transparent Pricing – Zero Hidden Fees',
          'Modern Facilities & Sterile Hygiene Standards',
          'Prompt WhatsApp & Call Assistance',
        ],
        ratingOverride: 4.9,
        reviewCountOverride: 76,
        services,
        faqs: [
          {
            q: `How can I book a slot or consult with ${cName}?`,
            a: 'You can tap the WhatsApp or Call button directly on this page. Our team responds within minutes to confirm your convenient timing.',
          },
          {
            q: `Where is ${cName} located in ${cCity}?`,
            a: `We are conveniently located at ${generatedAddress}. Ample parking and easy landmark access are available.`,
          },
          {
            q: 'What modes of payment do you accept?',
            a: 'We accept UPI (Google Pay, PhonePe, Paytm), credit/debit cards, net banking, and cash.',
          },
          {
            q: 'Do you offer custom packages or walk-in appointments?',
            a: 'Yes, we welcome walk-in visits during operational hours and offer tailored packages customized to your specific needs.',
          },
        ],
        reviews: [
          {
            authorName: 'Rahul Mukherjee',
            rating: 5,
            text: `Best ${cCat} experience in ${cCity}! The staff at ${cName} is extremely professional, polite, and caring. Highly recommended to everyone.`,
            relativeTime: '1 week ago',
          },
          {
            authorName: 'Sneha Kumari',
            rating: 5,
            text: `Impressed with their attention to detail and honest advice. The ambiance is great and pricing is completely transparent.`,
            relativeTime: '2 weeks ago',
          },
          {
            authorName: 'Vikram Singh',
            rating: 5,
            text: `Prompt response on WhatsApp and smooth booking. They delivered exactly what was promised. 5 stars all the way!`,
            relativeTime: '1 month ago',
          },
        ],
        galleryImages: [
          { title: `${cName} Facility & Service Area`, category: 'Facility Showcase', aspect: 'landscape' },
          { title: 'Quality In Action', category: 'Live Work', aspect: 'landscape' },
          { title: 'Client Smiles & Transformations', category: 'Satisfaction', aspect: 'landscape' },
        ],
      };
    }

    return NextResponse.json({
      success: true,
      data: aiData,
      source: apiKey ? 'GEMINI_AI' : 'SYNTHESIS_ENGINE',
    });
  } catch (error: any) {
    console.error('Error in AI data fill API:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to auto-fill website data with AI.' },
      { status: 500 }
    );
  }
}
