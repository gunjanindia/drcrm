/**
 * AI Review Generation Engine & Context Synthesizer
 * Generates natural, SEO-optimized, highly contextual Google Maps reviews
 * strictly tailored to business type, selected aspects, target keywords, tone, and custom guidelines.
 */

export interface ReviewGenContext {
  businessName: string;
  businessType: string;
  city: string;
  aspects: string[];
  targetKeywords?: string[];
  tone: 'FRIENDLY' | 'PROFESSIONAL' | 'SHORT_PUNCHY' | 'DETAILED';
  customInstructions?: string;
  rating?: number;
}

export function synthesizeContextualReview(ctx: ReviewGenContext, variantIndex: number = 0): string {
  const {
    businessName = 'Our Business',
    businessType = 'Local Business',
    city = 'Ranchi',
    aspects = [],
    targetKeywords = [],
    tone = 'PROFESSIONAL',
    customInstructions = '',
  } = ctx;

  const aspectList = aspects.length > 0 ? aspects : ['prompt service', 'great support'];
  const primaryAspect = aspectList[0] || 'quality service';
  const secondaryAspect = aspectList[1] || aspectList[0] || 'customer experience';
  const combinedAspects = aspectList.length > 1 ? `${primaryAspect} and ${secondaryAspect}` : primaryAspect;

  const keyword = targetKeywords.length > 0 && targetKeywords[0] ? targetKeywords[0].trim() : `best ${businessType} in ${city}`;
  const secondaryKeyword = targetKeywords.length > 1 && targetKeywords[1] ? targetKeywords[1].trim() : '';

  // Tailored tone generators
  switch (tone) {
    case 'FRIENDLY': {
      const friendlyVariants = [
        `Had a wonderful experience at ${businessName}! The staff was super helpful, welcoming, and attentive. Their ${combinedAspects} truly stood out. Definitely the ${keyword}! Highly recommended to everyone in ${city}.`,
        `Visiting ${businessName} was such a delight! From the warm greetings to their top-notch ${primaryAspect}, everything was handled with care and genuine warmth. Truly one of the best places for ${businessType} in ${city}!`,
        `So glad I found ${businessName}! Their team goes above and beyond, especially with ${combinedAspects}. If you are looking for ${keyword}, this is the place to go! ⭐⭐⭐⭐⭐`,
      ];
      return friendlyVariants[variantIndex % friendlyVariants.length];
    }

    case 'SHORT_PUNCHY': {
      const punchyVariants = [
        `Top-notch ${businessType}! Excellent ${combinedAspects} and prompt service. Hands down the ${keyword}. 5/5 stars!`,
        `Outstanding experience at ${businessName}. Super reliable, great ${primaryAspect}, and transparent team. Best in ${city}!`,
        `Quick, efficient, and high quality ${combinedAspects}. If you need ${keyword}, look no further than ${businessName}.`,
      ];
      return punchyVariants[variantIndex % punchyVariants.length];
    }

    case 'DETAILED': {
      const detailedVariants = [
        `I have been thoroughly impressed with the standard of service at ${businessName}. Their expertise in ${primaryAspect} is evident from the first interaction. The team is dedicated, punctual, and ensures ${secondaryAspect} is managed seamlessly. Without doubt, they are the ${keyword}. Highly recommended for anyone seeking reliable ${businessType} in ${city}.`,
        `Exceptional quality and genuine professionalism at ${businessName}. What stood out most was their attention to detail regarding ${combinedAspects}. The entire process was smooth, transparent, and well-organized. Truly an exemplary ${businessType} in ${city}.`,
        `My experience with ${businessName} exceeded expectations. Their staff took the time to understand all requirements and delivered exceptional ${primaryAspect}. Having experienced their ${secondaryAspect}, I can confidently state they are the ${keyword}. A well-deserved 5 stars!`,
      ];
      return detailedVariants[variantIndex % detailedVariants.length];
    }

    case 'PROFESSIONAL':
    default: {
      const professionalVariants = [
        `Exceptional experience with ${businessName}. Their professionalism, prompt communication, and outstanding ${combinedAspects} set a high benchmark. Easily the ${keyword}. Highly recommended!`,
        `Highly impressed by the standard of work and customer care at ${businessName}. The team demonstrated great expertise in ${primaryAspect}, maintaining transparency and quality throughout. The best ${businessType} in ${city}.`,
        `A completely seamless and satisfactory engagement with ${businessName}. Their dedication to ${combinedAspects} is commendable. One of the finest choices for ${keyword} in ${city}.`,
      ];
      return professionalVariants[variantIndex % professionalVariants.length];
    }
  }
}

export function generateReviewSuggestions(ctx: ReviewGenContext): string[] {
  return [
    synthesizeContextualReview(ctx, 0),
    synthesizeContextualReview(ctx, 1),
    synthesizeContextualReview(ctx, 2),
  ];
}
