// CLIENT 360 DATA ENGINE & STORAGE FOR METRICS, AUDIT, REVIEWS & CREATIVES (GENERIC FOR ALL BUSINESSES)

export type BusinessCategoryType =
  | 'RETAIL'
  | 'RESTAURANT'
  | 'HEALTHCARE'
  | 'SALON_SPA'
  | 'EDUCATION'
  | 'FITNESS'
  | 'AUTOMOBILE'
  | 'REAL_ESTATE'
  | 'PROFESSIONAL'
  | 'HOME_SERVICES'
  | 'OTHER';

export interface BusinessCategoryInfo {
  id: BusinessCategoryType;
  label: string;
  customerTerm: string; // e.g. "Customers", "Diners", "Patients", "Students", "Clients"
  ownerTerm: string; // e.g. "Store Owner", "Chef/Owner", "Doctor", "Head Stylist", "Director"
  offerExample: string;
  defaultServices: Array<{ title: string; desc: string; price: string; icon: string }>;
}

export const BUSINESS_CATEGORIES: BusinessCategoryInfo[] = [
  {
    id: 'RETAIL',
    label: 'Retail Store & Showroom',
    customerTerm: 'Shoppers / Customers',
    ownerTerm: 'Store Manager / Founder',
    offerExample: 'Festive Flash Sale: Flat 25% Off on All New Arrivals + Free Gift',
    defaultServices: [
      { title: 'New Festive Collection', desc: 'Premium ethnic and casual fashion wear.', price: '₹499 onwards', icon: 'Sparkles' },
      { title: 'Express In-Store Pickup', desc: 'Browse catalog on WhatsApp & pickup in 30 mins.', price: 'Free', icon: 'CheckCircle2' },
      { title: 'Custom Fitting & Alterations', desc: 'Master tailor alterations available on site.', price: '₹99 onwards', icon: 'ShieldCheck' },
      { title: 'Gift Vouchers & Hampers', desc: 'Customizable gift packages for festive occasions.', price: '₹500 - ₹5,000', icon: 'Star' },
    ],
  },
  {
    id: 'RESTAURANT',
    label: 'Restaurant, Cafe & Bakery',
    customerTerm: 'Diners & Guests',
    ownerTerm: 'Head Chef & General Manager',
    offerExample: 'Festive Dining Feast: 15% Off Total Bill + Complimentary Dessert',
    defaultServices: [
      { title: 'Dine-In Special Combos', desc: 'Multi-course family platters and chef specials.', price: '₹699 onwards', icon: 'Sparkles' },
      { title: 'Table Reservation & Parties', desc: 'Book private dining zones for birthday & anniversaries.', price: 'Advance Booking', icon: 'CheckCircle2' },
      { title: 'Live Counter & Buffets', desc: 'Unlimited weekend festive buffet spreads.', price: '₹449/person', icon: 'ShieldCheck' },
      { title: 'Home Delivery & Takeaway', desc: 'Hot hygienic delivery packed in eco-friendly boxes.', price: 'Min order ₹200', icon: 'Star' },
    ],
  },
  {
    id: 'HEALTHCARE',
    label: 'Clinic, Hospital & Pharmacy',
    customerTerm: 'Patients & Families',
    ownerTerm: 'Lead Consultant / Doctor',
    offerExample: 'Family Wellness Drive: Comprehensive Health & Diagnostics Package @ ₹499',
    defaultServices: [
      { title: 'Expert Doctor Consultation', desc: 'Detailed diagnosis with senior specialist.', price: '₹300 onwards', icon: 'ShieldCheck' },
      { title: 'Digital Diagnostic Scans', desc: 'High-precision digital imaging & lab reports.', price: '₹499 onwards', icon: 'Sparkles' },
      { title: 'Preventive Health Checkup', desc: 'Complete lifestyle and health screening.', price: '₹999 onwards', icon: 'CheckCircle2' },
      { title: 'Emergency Care & Pharmacy', desc: '24x7 quick assistance and authentic medicines.', price: 'Standard', icon: 'Star' },
    ],
  },
  {
    id: 'SALON_SPA',
    label: 'Salon, Spa & Beauty Care',
    customerTerm: 'Clients & Guests',
    ownerTerm: 'Creative Director / Master Stylist',
    offerExample: 'Festive Glow Package: Hair Spa + Facial + Manicure @ Flat 35% Off',
    defaultServices: [
      { title: 'Hair Styling & Keratin', desc: 'Precision cuts, coloring, and smoothing therapy.', price: '₹499 onwards', icon: 'Sparkles' },
      { title: 'Hydra Glow Facial', desc: 'Deep skin cleansing, peeling, and brightening serum.', price: '₹1,299 onwards', icon: 'Star' },
      { title: 'Bridal & Groom Packages', desc: 'Complete pre-wedding care and makeover.', price: '₹4,999 onwards', icon: 'ShieldCheck' },
      { title: 'Relaxing Body Massage & Spa', desc: 'Aromatherapy and de-stress muscle therapy.', price: '₹1,499 onwards', icon: 'CheckCircle2' },
    ],
  },
  {
    id: 'EDUCATION',
    label: 'Coaching, School & EdTech',
    customerTerm: 'Students & Parents',
    ownerTerm: 'Academic Director / Principal',
    offerExample: 'Scholarship Admission Week: Up to 40% Fee Waiver for Top Scorers',
    defaultServices: [
      { title: 'Foundation & Board Batches', desc: 'Comprehensive syllabus mastery with top faculty.', price: '₹2,500/mo', icon: 'ShieldCheck' },
      { title: 'Competitive Exam Prep (JEE/NEET/CUET)', desc: 'Mock tests, doubt sessions, and rank booster kits.', price: '₹15,000/yr', icon: 'Sparkles' },
      { title: 'Spoken English & Personality', desc: 'Confidence building, interview prep, and fluency.', price: '₹1,999 onwards', icon: 'Star' },
      { title: 'Free Diagnostic Demo Class', desc: 'Experience our teaching methodology before enrollment.', price: 'Free', icon: 'CheckCircle2' },
    ],
  },
  {
    id: 'FITNESS',
    label: 'Gym, Yoga & Fitness Studio',
    customerTerm: 'Members & Athletes',
    ownerTerm: 'Head Fitness Coach',
    offerExample: 'Festive Transformation Deal: Buy 3 Months Get 1 Month Free + Diet Plan',
    defaultServices: [
      { title: 'Annual Gym Membership', desc: 'Full access to cardio, strength, and crossfit zones.', price: '₹9,999/yr', icon: 'ShieldCheck' },
      { title: 'Personal Training (PT)', desc: '1-on-1 certified trainer for muscle gain/fat loss.', price: '₹4,000/mo', icon: 'Sparkles' },
      { title: 'Zumba, Yoga & Aerobics', desc: 'High-energy group fitness and flexibility sessions.', price: '₹1,500/mo', icon: 'Star' },
      { title: 'Custom Nutrition & Diet Plan', desc: 'Calculated macros tailored to your fitness goal.', price: '₹799 onwards', icon: 'CheckCircle2' },
    ],
  },
  {
    id: 'AUTOMOBILE',
    label: 'Car/Bike Service & Dealership',
    customerTerm: 'Vehicle Owners',
    ownerTerm: 'Service Head / Workshop Owner',
    offerExample: 'Monsoon/Festive Car Care: Complete 40-Point Inspection + Free Foam Wash',
    defaultServices: [
      { title: 'Periodic Maintenance Service', desc: 'Engine oil change, filter replacements, brake check.', price: '₹1,999 onwards', icon: 'ShieldCheck' },
      { title: 'Ceramic Coating & Detailing', desc: '9H deep gloss paint protection and interior spa.', price: '₹5,999 onwards', icon: 'Sparkles' },
      { title: 'Wheel Alignment & Balancing', desc: '3D computerized alignment for smooth highway driving.', price: '₹450 onwards', icon: 'CheckCircle2' },
      { title: 'AC Servicing & Gas Top-up', desc: 'Deep condenser cleaning and odor removal.', price: '₹1,200 onwards', icon: 'Star' },
    ],
  },
  {
    id: 'REAL_ESTATE',
    label: 'Real Estate & Construction',
    customerTerm: 'Property Buyers & Investors',
    ownerTerm: 'Managing Director / Broker',
    offerExample: 'Festive Property Launch: Zero Brokerage + Free Modular Kitchen Voucher',
    defaultServices: [
      { title: '2BHK / 3BHK Premium Flats', desc: 'RERA-approved apartments in prime city locations.', price: '₹45 Lakhs onwards', icon: 'Sparkles' },
      { title: 'Commercial Shops & Office Spaces', desc: 'High-footfall retail units with guaranteed rental yield.', price: '₹25 Lakhs onwards', icon: 'ShieldCheck' },
      { title: 'Residential Plots & Land', desc: 'Clear-title gated township plots with electricity & water.', price: '₹1,200/sq.ft', icon: 'Star' },
      { title: 'Home Loan & Legal Assistance', desc: '1-stop documentation and fastest bank loan approval.', price: 'Free Service', icon: 'CheckCircle2' },
    ],
  },
  {
    id: 'PROFESSIONAL',
    label: 'Legal, CA & Business Services',
    customerTerm: 'Business Clients & Founders',
    ownerTerm: 'Senior Partner / Chartered Accountant',
    offerExample: 'Startup Launch Kit: GST Registration + Company Incorporation @ ₹2,999',
    defaultServices: [
      { title: 'GST Filing & Compliance', desc: 'Monthly return filings and audit advisory.', price: '₹999/mo', icon: 'ShieldCheck' },
      { title: 'Income Tax Return (ITR)', desc: 'Individual & corporate tax planning and filing.', price: '₹799 onwards', icon: 'Sparkles' },
      { title: 'Trademark & Trademark Search', desc: 'Brand name protection across India.', price: '₹4,500 onwards', icon: 'Star' },
      { title: 'Company / LLP Registration', desc: 'End-to-end incorporation with MCA certificate.', price: '₹3,499 onwards', icon: 'CheckCircle2' },
    ],
  },
  {
    id: 'HOME_SERVICES',
    label: 'Home Repair, Interior & Cleaning',
    customerTerm: 'Homeowners & Residents',
    ownerTerm: 'Lead Operations Manager',
    offerExample: 'Home Deep Cleaning Festival Deal: Complete House Cleaning Flat 20% Off',
    defaultServices: [
      { title: 'Full Home Deep Cleaning', desc: 'Kitchen, bathroom, sofa shampooing & sanitization.', price: '₹2,499 onwards', icon: 'Sparkles' },
      { title: 'Electrical & Plumbing Repair', desc: 'Verified technicians with guaranteed service.', price: '₹199 visit fee', icon: 'ShieldCheck' },
      { title: 'Modular Kitchen & Interiors', desc: 'Custom 3D interior design and factory carpentry.', price: '₹1.5 Lakhs onwards', icon: 'Star' },
      { title: 'Pest Control & Termite Treatment', desc: 'Odorless herbal treatment with 1-year warranty.', price: '₹899 onwards', icon: 'CheckCircle2' },
    ],
  },
  {
    id: 'OTHER',
    label: 'General Local Business',
    customerTerm: 'Customers & Clients',
    ownerTerm: 'Business Owner',
    offerExample: 'Special Seasonal Discount: Flat 20% Off All Services This Week',
    defaultServices: [
      { title: 'Standard Service Package', desc: 'High-quality verified local service.', price: '₹499 onwards', icon: 'Sparkles' },
      { title: 'Premium Priority Service', desc: 'Express execution with dedicated support.', price: '₹999 onwards', icon: 'ShieldCheck' },
      { title: 'On-Demand Consultation', desc: 'Direct expert guidance and quotation.', price: 'Free', icon: 'Star' },
      { title: 'Annual Maintenance Contract', desc: 'Round-the-year priority service coverage.', price: '₹2,999/yr', icon: 'CheckCircle2' },
    ],
  },
];

export interface GoogleGbpAuthProfile {
  isConnected: boolean;
  googleEmail?: string;
  accountName?: string;
  locationId?: string;
  locationName?: string;
  connectedAt?: string;
  scopesGranted: string[];
  reviewsSyncActive: boolean;
  canPostReplies: boolean;
}

export interface MonthlyGrowthMetric {
  month: string;
  rank: number; // e.g., 1 (Top 1)
  calls: number; // Phone calls
  visits: number; // Direction requests / profile views
  appointments: number; // Inquiries / bookings
}

export interface AuditFactor {
  id: string;
  category: string;
  name: string;
  score: number; // points earned
  maxScore: number;
  status: 'OPTIMAL' | 'MODERATE' | 'CRITICAL';
  impactDescription: string;
  whatMakesThisScore: string;
  recommendation: string;
  quickActionLabel?: string;
  pointsToGain: number;
}

export interface ClientReviewItem {
  id: string;
  authorName: string;
  rating: number;
  date: string;
  content: string;
  status: 'PENDING' | 'REPLIED';
  sentiment: 'POSITIVE' | 'NEUTRAL' | 'CRITICAL';
  replyText?: string;
  repliedAt?: string;
  source: 'Google Maps' | 'Verified GBP Sync' | 'Direct QR';
  isLiveOnGoogle?: boolean;
}

export interface FestivalPreset {
  id: string;
  name: string;
  tagline: string;
  emoji: string;
  bgGradient: string;
  accentColor: string;
  defaultOfferTitle: string;
  defaultOfferDesc: string;
  suggestedHashtags: string[];
}

export interface MiniSiteConfig {
  category: BusinessCategoryType;
  headline: string;
  subheadline: string;
  tagline: string;
  aboutText: string;
  ownerName: string;
  ownerTitle: string;
  services: Array<{ title: string; desc: string; price: string; icon: string }>;
  workingHours: string;
  address: string;
  phone: string;
  whatsapp: string;
  themeColor: string;
  bannerGradient: string;
  customSlug: string;
}

export interface AIPointsPackage {
  id: string;
  name: string;
  points: number;
  bonusPoints: number;
  priceINR: number;
  popular?: boolean;
  features: string[];
}

// -------------------------------------------------------------
// DEFAULT DATA SETS (GENERIC & ADAPTIVE)
// -------------------------------------------------------------

export const DEFAULT_GBP_AUTH: GoogleGbpAuthProfile = {
  isConnected: true,
  googleEmail: 'business.owner.ranchi@gmail.com',
  accountName: 'Official Business Owner Account',
  locationId: 'locations/184920485729103948',
  locationName: 'Verified Google Business Profile (Ranchi)',
  connectedAt: 'Sep 10, 2026',
  scopesGranted: [
    'https://www.googleapis.com/auth/business.manage',
    'https://www.googleapis.com/auth/plus.business.manage',
  ],
  reviewsSyncActive: true,
  canPostReplies: true,
};

export const DEFAULT_MONTHLY_GROWTH: MonthlyGrowthMetric[] = [
  { month: 'Apr', rank: 8, calls: 42, visits: 950, appointments: 14 },
  { month: 'May', rank: 6, calls: 68, visits: 1380, appointments: 22 },
  { month: 'Jun', rank: 5, calls: 110, visits: 2150, appointments: 38 },
  { month: 'Jul', rank: 3, calls: 175, visits: 3400, appointments: 54 },
  { month: 'Aug', rank: 2, calls: 245, visits: 4900, appointments: 78 },
  { month: 'Sep (Current)', rank: 1, calls: 318, visits: 6850, appointments: 95 },
];

export const DEFAULT_AUDIT_FACTORS: AuditFactor[] = [
  {
    id: 'gbp_optimization',
    category: 'Google Business Profile',
    name: 'Primary Category & NAP Consistency',
    score: 24,
    maxScore: 25,
    status: 'OPTIMAL',
    impactDescription: 'Directly influences Top-3 Map Pack indexing in local radius.',
    whatMakesThisScore: 'Exact Name, Phone & Address match across Google Maps, official records, and directories. Primary category is accurately pinned.',
    recommendation: 'Keep secondary categories and service catalog updated with seasonal offerings.',
    pointsToGain: 1,
  },
  {
    id: 'reviews_velocity',
    category: 'Reputation & Reviews',
    name: 'Review Velocity & 5-Star Average',
    score: 22,
    maxScore: 25,
    status: 'OPTIMAL',
    impactDescription: 'Review count & freshness decide customer trust and Google local algorithm favorability.',
    whatMakesThisScore: 'Average 4.9⭐ rating across verified reviews with steady monthly influx of authentic reviews via counter QR stand.',
    recommendation: 'Aim to cross 50+ total reviews to cement unshakeable #1 position over competitors in the area.',
    quickActionLabel: 'Print Review QR Stand',
    pointsToGain: 3,
  },
  {
    id: 'media_gallery',
    category: 'Media & Photo Cadence',
    name: 'Geotagged Store & Product Photos',
    score: 14,
    maxScore: 20,
    status: 'MODERATE',
    impactDescription: 'Listings with 30+ geotagged photos receive 42% more direction requests on Google Maps.',
    whatMakesThisScore: '18 high-res photos uploaded. Missing recent weekly store interior, team, and product showcase photos.',
    recommendation: 'Upload 5 new photos monthly with city geolocation metadata.',
    quickActionLabel: 'Upload Geotagged Media',
    pointsToGain: 6,
  },
  {
    id: 'response_rate',
    category: 'Customer Engagement',
    name: 'Review Response SLA & Q&A Depth',
    score: 12,
    maxScore: 15,
    status: 'MODERATE',
    impactDescription: '100% response rate increases customer retention and signals active business ownership to Google.',
    whatMakesThisScore: '88% of Google reviews have been answered. 2 reviews currently awaiting official reply.',
    recommendation: 'Use the AI Review Assistant to instantly generate tailored replies for pending reviews in <30 seconds.',
    quickActionLabel: 'Answer Pending Reviews',
    pointsToGain: 3,
  },
  {
    id: 'direct_cta',
    category: 'Conversion Funnel',
    name: '1-Click WhatsApp & Web Booking',
    score: 12,
    maxScore: 15,
    status: 'MODERATE',
    impactDescription: 'Mobile searchers convert 3x faster when direct WhatsApp booking CTA is connected to GBP.',
    whatMakesThisScore: 'Direct phone dial connected. Missing dedicated 1-page mobile site with instant WhatsApp inquiry chat.',
    recommendation: 'Publish your 1-Page Mini-Site with one click and set as official website link on Google Profile.',
    quickActionLabel: 'Build 1-Page Site',
    pointsToGain: 3,
  },
];

export const DEFAULT_CLIENT_REVIEWS: ClientReviewItem[] = [
  {
    id: 'rev_1',
    authorName: 'Rahul Verma',
    rating: 5,
    date: '2 days ago',
    content: 'Outstanding service and very polite staff! Transparent pricing and quick turnaround. Very satisfied with the experience in Ranchi.',
    status: 'PENDING',
    sentiment: 'POSITIVE',
    source: 'Google Maps',
  },
  {
    id: 'rev_2',
    authorName: 'Priya Sundaram',
    rating: 5,
    date: '5 days ago',
    content: 'Very professional, clean environment and great attention to detail. Highly recommend to everyone looking for quality service!',
    status: 'REPLIED',
    sentiment: 'POSITIVE',
    replyText: 'Dear Priya, thank you so much for your wonderful review! We are delighted to know you had a positive experience with us. Looking forward to serving you again! 🙏',
    repliedAt: '4 days ago',
    source: 'Verified GBP Sync',
    isLiveOnGoogle: true,
  },
  {
    id: 'rev_3',
    authorName: 'Sunil Kumar',
    rating: 4,
    date: '1 week ago',
    content: 'Good quality overall, but had to wait about 15 minutes during peak hours on Sunday. Staff was helpful though.',
    status: 'PENDING',
    sentiment: 'NEUTRAL',
    source: 'Google Maps',
  },
  {
    id: 'rev_4',
    authorName: 'Amitabh Sen',
    rating: 5,
    date: '2 weeks ago',
    content: 'Best place in the city for reliable service. Modern setup and honest pricing. Will definitely visit again.',
    status: 'REPLIED',
    sentiment: 'POSITIVE',
    replyText: 'Thank you Amitabh ji! It was our pleasure to serve you. Please reach out if you ever need any assistance.',
    repliedAt: '12 days ago',
    source: 'Direct QR',
    isLiveOnGoogle: true,
  },
];

export const FESTIVAL_PRESETS: FestivalPreset[] = [
  {
    id: 'holi',
    name: 'Holi Festival Special',
    tagline: 'Colors of Happiness & Exclusive Festive Deals',
    emoji: '🎨',
    bgGradient: 'from-pink-600 via-purple-600 to-amber-500',
    accentColor: '#ec4899',
    defaultOfferTitle: 'Festive Celebration Offer: Flat 25% Off + Special Welcome Gift',
    defaultOfferDesc: 'Celebrate this vibrant festival of colors with exclusive privileges! Book or visit this week to claim your complimentary festive gift voucher.',
    suggestedHashtags: ['#Holi2026', '#FestiveOffer', '#SpecialDiscount', '#LocalBusiness', '#HappyHoli'],
  },
  {
    id: 'diwali',
    name: 'Diwali & Dhanteras',
    tagline: 'Light Up Your Celebrations with Mega Savings',
    emoji: '🪔',
    bgGradient: 'from-amber-600 via-orange-600 to-yellow-500',
    accentColor: '#f59e0b',
    defaultOfferTitle: 'Diwali Mega Festive Bonanza: Flat 30% Off on All Premium Packages',
    defaultOfferDesc: 'This festive season, gift your family top-tier quality and exceptional value. Avail limited-period festive privileges and assured rewards.',
    suggestedHashtags: ['#DiwaliOffer', '#Dhanteras2026', '#MegaSavings', '#FestiveSeason', '#ShubhDeepavali'],
  },
  {
    id: 'durga_puja',
    name: 'Durga Puja / Navratri',
    tagline: 'Festive Radiance & Complete Family Happiness',
    emoji: '🌸',
    bgGradient: 'from-rose-700 via-red-600 to-amber-500',
    accentColor: '#e11d48',
    defaultOfferTitle: 'Pujor Utsav Special Deal: Exclusive Combo Package @ Unbeatable Price',
    defaultOfferDesc: 'Step into the festive season with full confidence and joy. Avail exclusive festive combos crafted for you and your loved ones.',
    suggestedHashtags: ['#DurgaPuja2026', '#NavratriSpecial', '#FestiveVibes', '#PujorOffer', '#CelebrationTime'],
  },
  {
    id: 'eid',
    name: 'Eid Mubarak',
    tagline: 'Spread Joy, Harmony & Special Privileges',
    emoji: '🌙',
    bgGradient: 'from-emerald-700 via-teal-600 to-cyan-600',
    accentColor: '#10b981',
    defaultOfferTitle: 'Eid Special Celebration: Free Consultation + 20% Off Premium Services',
    defaultOfferDesc: 'Wishing peace, health, and prosperity to you and your loved ones on this blessed occasion.',
    suggestedHashtags: ['#EidMubarak', '#EidSpecialOffer', '#FestiveDeals', '#Celebration'],
  },
  {
    id: 'independence_day',
    name: 'Independence Day',
    tagline: 'Freedom from High Costs • Quality Guaranteed',
    emoji: '🇮🇳',
    bgGradient: 'from-orange-600 via-slate-800 to-emerald-600',
    accentColor: '#f97316',
    defaultOfferTitle: 'Azadi Mahotsav Special: Flat ₹500 Instant Cashback on All Bookings',
    defaultOfferDesc: 'Celebrating the spirit of independence with accessible, world-class local services.',
    suggestedHashtags: ['#IndependenceDay', '#AzadiSpecial', '#LocalBusiness', '#FreedomOffer'],
  },
  {
    id: 'new_year',
    name: 'New Year 2026',
    tagline: 'New Year, New Upgraded Lifestyle',
    emoji: '✨',
    bgGradient: 'from-indigo-900 via-purple-900 to-sky-700',
    accentColor: '#6366f1',
    defaultOfferTitle: 'New Year Kickstart Offer: Flat 20% Off + Free Priority Support',
    defaultOfferDesc: 'Make 2026 your most rewarding year yet. Limited slots available this month.',
    suggestedHashtags: ['#NewYear2026', '#ResolutionDeal', '#MegaDiscount', '#NewBeginnings'],
  },
];

export const AI_POINTS_PACKAGES: AIPointsPackage[] = [
  {
    id: 'ai_pack_100',
    name: 'Starter AI Pack',
    points: 100,
    bonusPoints: 10,
    priceINR: 199,
    features: [
      '110 Total AI Credits',
      'Instant AI Review Replies (~1 pt each)',
      '10+ Festive & Offer Creatives (~2 pts each)',
      'No Expiration Date',
    ],
  },
  {
    id: 'ai_pack_300',
    name: 'Growth Pro Pack',
    points: 300,
    bonusPoints: 50,
    priceINR: 499,
    popular: true,
    features: [
      '350 Total AI Credits',
      'Automated Review Sentiment & Auto-Drafting',
      'Unlimited Festival Graphic Copy & Banners',
      'One-Click 1-Page Mini-Site AI Generation',
      'Priority Razorpay Verified Billing',
    ],
  },
  {
    id: 'ai_pack_1000',
    name: 'Enterprise Power Pack',
    points: 1000,
    bonusPoints: 250,
    priceINR: 999,
    features: [
      '1,250 Total AI Credits',
      'Multi-Branch & Store Support',
      'Weekly Automated Festival & Offer Scheduling',
      'Unlimited High-Res Creative Exports',
      'Dedicated Account Manager Support',
    ],
  },
];

export const DEFAULT_MINI_SITE: MiniSiteConfig = {
  category: 'RETAIL',
  headline: 'Ranchi Prime Retail & Lifestyle Store',
  subheadline: 'Premium Quality Fashion, Electronics & Daily Essentials in Ranchi',
  tagline: 'Rated #1 Store in Ranchi • 4.9⭐ on Google Maps',
  aboutText: 'Serving Ranchi since 2018, we bring you curated collections, 100% authentic quality, transparent pricing, and fast customer service. Visit our showroom or place direct orders via WhatsApp for express delivery.',
  ownerName: 'Sunil Agarwal',
  ownerTitle: 'Founder & Managing Director',
  services: [
    { title: 'New Festive Collection', desc: 'Premium ethnic and casual fashion wear.', price: '₹499 onwards', icon: 'Sparkles' },
    { title: 'Express In-Store Pickup', desc: 'Browse catalog on WhatsApp & pickup in 30 mins.', price: 'Free', icon: 'CheckCircle2' },
    { title: 'Custom Fitting & Alterations', desc: 'Master tailor alterations available on site.', price: '₹99 onwards', icon: 'ShieldCheck' },
    { title: 'Gift Vouchers & Hampers', desc: 'Customizable gift packages for festive occasions.', price: '₹500 - ₹5,000', icon: 'Star' },
  ],
  workingHours: 'Mon - Sun: 10:00 AM - 9:30 PM',
  address: 'Shop 14, Main Road, Near Lalpur Chowk, Ranchi, Jharkhand - 834001',
  phone: '+91 94311 09876',
  whatsapp: '919431109876',
  themeColor: '#0284c7',
  bannerGradient: 'from-sky-900 via-slate-900 to-indigo-950',
  customSlug: 'ranchi-prime-store',
};
