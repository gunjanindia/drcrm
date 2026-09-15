// ONE-PAGE LOCAL BUSINESS WEBSITE ENGINE (GBP LINKED & CONVERSION OPTIMIZED)
// Adapts dynamically to ANY Google Business Profile category with custom layout, theme, CTAs, FAQs, and Schema.

export type LocalCategoryKey =
  | 'FABRICATION'
  | 'RESTAURANT'
  | 'SALON'
  | 'CLINIC'
  | 'LAWYER'
  | 'REAL_ESTATE'
  | 'HOTEL'
  | 'IT_AGENCY'
  | 'CONSTRUCTION'
  | 'GYM'
  | 'GARAGE'
  | 'COACHING'
  | 'PHOTOGRAPHY'
  | 'HOME_SERVICES'
  | 'RETAIL'
  | 'GENERAL';

export interface CategoryTheme {
  name: string;
  categoryKey: LocalCategoryKey;
  taglineDefault: string;
  headlineTemplate: (name: string, city: string) => string;
  subheadlineTemplate: (category: string, city: string) => string;
  primaryCtaText: string;
  primaryCtaType: 'call' | 'whatsapp' | 'book' | 'quote' | 'menu';
  secondaryCtaText: string;
  secondaryCtaType: 'call' | 'whatsapp' | 'directions' | 'gallery' | 'services';
  accentColor: string;
  accentBg: string;
  gradient: string;
  badgeText: string;
  servicesTitle: string;
  servicesSubtitle: string;
  galleryTitle: string;
  trustTitle: string;
  defaultServices: Array<{ title: string; desc: string; price?: string; badge?: string }>;
  defaultFaqs: Array<{ q: string; a: string }>;
  defaultGalleryImages: Array<{ title: string; category: string; aspect: string }>;
}

export const CATEGORY_THEMES: Record<LocalCategoryKey, CategoryTheme> = {
  FABRICATION: {
    name: 'Aluminum & Glass Fabrication',
    categoryKey: 'FABRICATION',
    taglineDefault: 'Precision Engineering • Premium Quality • Timely Execution',
    headlineTemplate: (name, city) => `Expert Aluminum, Toughened Glass & Architectural Fabrication${city ? ` in ${city}` : ''}`,
    subheadlineTemplate: (cat, city) => `Specialized in structural glazing, sliding windows, ACP cladding, and custom interior glass partitions. Verified on Google Maps.`,
    primaryCtaText: 'Request Free Quote',
    primaryCtaType: 'whatsapp',
    secondaryCtaText: 'Call Fabricator',
    secondaryCtaType: 'call',
    accentColor: '#0284c7', // Sky / Industrial
    accentBg: 'bg-sky-600',
    gradient: 'from-slate-900 via-sky-950 to-slate-900',
    badgeText: 'Architectural & Industrial Grade Quality',
    servicesTitle: 'Our Fabrication & Glazing Services',
    servicesSubtitle: 'Tailored structural aluminum, toughened glass, and architectural metalwork designed for residential and commercial spaces.',
    galleryTitle: 'Completed Projects & Glazing Portfolio',
    trustTitle: 'Why Choose Our Fabrication Work',
    defaultServices: [
      { title: 'Toughened Glass Partitions', desc: '10mm–12mm safety glass partitions for offices, conference halls, and modern homes.', price: 'Custom Quote', badge: 'High Demand' },
      { title: 'Aluminum Sliding Doors & Windows', desc: 'Heavy-duty extruded aluminum profiles with smooth silent roller mechanisms.', price: 'Per Sq.Ft', badge: 'Popular' },
      { title: 'ACP Sheet Cladding & Facades', desc: 'Weather-resistant Aluminum Composite Panel exterior wall elevation & shop front cladding.', price: 'Standard Rates' },
      { title: 'Structural Glazing & Spider Fitting', desc: 'Modern frameless commercial building elevation glazing with warranty.', price: 'Custom Specs' },
      { title: 'Shower Cubicles & Railings', desc: 'Stainless steel glass railings, staircase balustrades, and luxury frosted shower glass.', price: 'Custom Quote' },
      { title: 'Repairs & Hardware Replacement', desc: 'Fast glass replacement, lock alignments, and hydraulic floor spring repairs.', price: 'Fast Turnaround' },
    ],
    defaultFaqs: [
      { q: 'Do you provide on-site measurement and estimation?', a: 'Yes, our team visits your site to take precise laser measurements and provides a detailed quotation before starting work.' },
      { q: 'What brand and thickness of glass and aluminum do you use?', a: 'We use premium ISI-certified toughened glass (8mm to 12mm) and heavy-gauge virgin aluminum profiles for maximum durability.' },
      { q: 'How long does a typical installation take?', a: 'Most residential window and partition projects are completed within 3 to 7 business days following site measurement approval.' },
      { q: 'Do you offer custom designs for modern office spaces?', a: 'Yes, we specialize in frameless acoustic glass cabins, frosted branded designs, and minimalist slim-profile partitions.' },
    ],
    defaultGalleryImages: [
      { title: 'Office Acoustic Glass Cabins', category: 'Commercial Partitions', aspect: 'landscape' },
      { title: 'Slimline Black Aluminum Windows', category: 'Residential Windows', aspect: 'landscape' },
      { title: 'Modern Exterior ACP Building Facade', category: 'Exterior Cladding', aspect: 'landscape' },
      { title: 'Frameless Glass Staircase Railing', category: 'Architectural Glazing', aspect: 'landscape' },
    ],
  },

  RESTAURANT: {
    name: 'Restaurant, Cafe & Dining',
    categoryKey: 'RESTAURANT',
    taglineDefault: 'Authentic Flavors • Fresh Ingredients • Warm Hospitality',
    headlineTemplate: (name, city) => `Delicious Culinary Dining & Fresh Delicacies${city ? ` in ${city}` : ''}`,
    subheadlineTemplate: (cat, city) => `Experience mouth-watering recipes, welcoming ambience, and hygienic multi-cuisine food crafted with love.`,
    primaryCtaText: 'Call to Reserve Table',
    primaryCtaType: 'call',
    secondaryCtaText: 'Order via WhatsApp',
    secondaryCtaType: 'whatsapp',
    accentColor: '#e11d48', // Rose / Gourmet
    accentBg: 'bg-rose-600',
    gradient: 'from-stone-900 via-rose-950 to-stone-900',
    badgeText: 'Fresh & Hygienic Gourmet Experience',
    servicesTitle: 'Menu Specialties & Dining Options',
    servicesSubtitle: 'Savor our signature chef-curated dishes, combos, and beverages prepared fresh daily.',
    galleryTitle: 'Our Culinary Showcase & Ambience',
    trustTitle: 'The Secret Behind Our Great Taste',
    defaultServices: [
      { title: 'Chef Signature Platters', desc: 'Multi-course family specialties prepared with authentic spices and fresh ingredients.', price: '₹349 onwards', badge: 'Chef Special' },
      { title: 'Dine-In & Private Family Zone', desc: 'Comfortable air-conditioned family seating with warm hospitality and quick service.', price: 'Table Booking' },
      { title: 'Express Takeaway & Delivery', desc: 'Hygienically packed tamper-proof delivery right to your doorstep.', price: 'Direct Order', badge: 'Fast Delivery' },
      { title: 'Birthday & Party Celebrations', desc: 'Exclusive venue arrangement, festive food packages, and personalized celebration setups.', price: 'Custom Menu' },
    ],
    defaultFaqs: [
      { q: 'Do you offer home delivery or direct WhatsApp ordering?', a: 'Yes! You can order directly by sending us your menu choices on WhatsApp or by calling our desk.' },
      { q: 'Can we book tables in advance for large family gatherings?', a: 'Yes, we recommend reserving at least a few hours in advance for weekends and festive gatherings.' },
      { q: 'Are vegetarian and pure veg options available?', a: 'Yes, we have dedicated pure vegetarian preparation counters and an extensive vegetarian menu.' },
      { q: 'What are your operating hours?', a: 'We are open all 7 days for lunch and dinner. Check our location section below for exact daily timings.' },
    ],
    defaultGalleryImages: [
      { title: 'Signature Chef Special Cuisine', category: 'Main Course', aspect: 'landscape' },
      { title: 'Warm & Cozy Dining Ambience', category: 'Interior Seating', aspect: 'landscape' },
      { title: 'Freshly Baked Gourmet Starters', category: 'Appetizers', aspect: 'landscape' },
      { title: 'Artisan Mocktails & Desserts', category: 'Beverages', aspect: 'landscape' },
    ],
  },

  SALON: {
    name: 'Salon, Spa & Beauty Care',
    categoryKey: 'SALON',
    taglineDefault: 'Luxury Care • Certified Stylists • Trendsetting Styles',
    headlineTemplate: (name, city) => `Premium Hair, Skin & Bridal Makeover Salon${city ? ` in ${city}` : ''}`,
    subheadlineTemplate: (cat, city) => `Look your radiant best with expert styling, rejuvenating skincare therapies, and luxury grooming packages.`,
    primaryCtaText: 'Book Appointment on WhatsApp',
    primaryCtaType: 'whatsapp',
    secondaryCtaText: 'Call Salon',
    secondaryCtaType: 'call',
    accentColor: '#db2777', // Pink / Glamour
    accentBg: 'bg-pink-600',
    gradient: 'from-slate-950 via-pink-950 to-slate-950',
    badgeText: 'Certified Stylists & Premium Salon Products',
    servicesTitle: 'Our Signature Beauty & Hair Therapies',
    servicesSubtitle: 'Comprehensive grooming, skincare, hair transformations, and bridal packages tailored for you.',
    galleryTitle: 'Hair Transformations & Styling Gallery',
    trustTitle: 'Why Clients Love Our Salon Experience',
    defaultServices: [
      { title: 'Hair Styling, Keratin & Botoplex', desc: 'Precision haircuts, smoothing treatments, global hair coloring, and balayage highlights.', price: '₹499 onwards', badge: 'Trending' },
      { title: 'Hydra Glow & Deep Skin Facials', desc: 'Clinical deep-pore cleansing, hydration infusion, and anti-pigmentation glow therapies.', price: '₹1,199 onwards', badge: 'Popular' },
      { title: 'Bridal & Groom Complete Packages', desc: 'High-definition bridal makeup, pre-wedding skin rituals, mehendi styling, and draping.', price: 'Custom Package', badge: 'Special' },
      { title: 'Aromatherapy Pedicure & Manicure', desc: 'Relaxing spa exfoliation, nail grooming, gel polish, and deep moisture paraffin wax.', price: '₹399 onwards' },
    ],
    defaultFaqs: [
      { q: 'Is prior appointment mandatory?', a: 'While walk-ins are welcomed based on availability, booking in advance via WhatsApp ensures zero waiting time.' },
      { q: 'What brand products do you use for hair and skin treatments?', a: 'We exclusively use international salon-grade brands (L’Oréal Professional, Schwarzkopf, Cheryl’s Cosmeceuticals, O3+).' },
      { q: 'Do you offer customized bridal and pre-wedding packages?', a: 'Yes, we provide 1-on-1 consultations and custom multi-session bridal packages suited to your schedule and skin type.' },
      { q: 'Are all hygiene and sterilization protocols followed?', a: 'Strictly. All tools, towels, and equipment are sterilized after every single client.' },
    ],
    defaultGalleryImages: [
      { title: 'Hair Smoothing & Balayage Glow', category: 'Hair Transformation', aspect: 'landscape' },
      { title: 'Radiant HD Bridal Makeover', category: 'Bridal Studio', aspect: 'landscape' },
      { title: 'Modern Clean Aesthetic Salon Floor', category: 'Salon Interior', aspect: 'landscape' },
      { title: 'Hydra Clinical Facial Therapy', category: 'Skin Care', aspect: 'landscape' },
    ],
  },

  CLINIC: {
    name: 'Doctor, Clinic & Hospital',
    categoryKey: 'CLINIC',
    taglineDefault: 'Compassionate Care • Accurate Diagnosis • Patient First',
    headlineTemplate: (name, city) => `Trusted Healthcare, Specialist Consultation & Wellness${city ? ` in ${city}` : ''}`,
    subheadlineTemplate: (cat, city) => `Delivering accurate medical diagnosis, experienced doctor consultations, and compassionate clinical care.`,
    primaryCtaText: 'Call for Appointment',
    primaryCtaType: 'call',
    secondaryCtaText: 'Book via WhatsApp',
    secondaryCtaType: 'whatsapp',
    accentColor: '#059669', // Emerald / Healthcare
    accentBg: 'bg-emerald-600',
    gradient: 'from-slate-900 via-teal-950 to-slate-900',
    badgeText: 'Verified Clinical Standards & Expert Care',
    servicesTitle: 'Specialist Treatments & Diagnostic Care',
    servicesSubtitle: 'Dedicated medical consultations, preventive screenings, and patient wellness treatments.',
    galleryTitle: 'Clinical Facilities & Care Environment',
    trustTitle: 'Why Patients Place Their Trust in Us',
    defaultServices: [
      { title: 'Specialist Doctor Consultation', desc: 'In-depth clinical evaluation, medical history review, and evidence-based treatment plans.', price: 'Consultation Fee', badge: 'Expert' },
      { title: 'Diagnostic Screenings & Lab Tests', desc: 'Accurate clinical diagnostics, digital monitoring, and timely medical reporting.', price: 'Standard Rates' },
      { title: 'Preventive Health & Wellness Checks', desc: 'Comprehensive seasonal health packages, BP/diabetes monitoring, and lifestyle guidance.', price: 'Package Rates', badge: 'Recommended' },
      { title: 'Follow-Up & Telephonic Queries', desc: 'Prompt patient assistance for prescription refills, reports discussion, and urgent advice.', price: 'Direct Care' },
    ],
    defaultFaqs: [
      { q: 'What are the clinic consultation timings?', a: 'Consultations are scheduled during morning and evening OPD hours. Please call or WhatsApp to confirm the doctor’s daily slot.' },
      { q: 'Can I book an appointment on WhatsApp?', a: 'Yes, simply message us your name, preferred time, and chief complaint on WhatsApp for instant confirmation.' },
      { q: 'Do you maintain digital records and reports?', a: 'Yes, patient histories and digital prescriptions are safely documented for easy continuity of care.' },
      { q: 'What safety and hygiene measures are followed?', a: 'Our clinic strictly adheres to bio-medical waste regulations and sanitization protocols after every patient visit.' },
    ],
    defaultGalleryImages: [
      { title: 'Modern Consultation Suite', category: 'Consultation Room', aspect: 'landscape' },
      { title: 'Advanced Diagnostic Equipment', category: 'Facilities', aspect: 'landscape' },
      { title: 'Hygienic Patient Reception Area', category: 'Clinic Environment', aspect: 'landscape' },
      { title: 'Patient Wellness Screening Desk', category: 'Diagnostic Care', aspect: 'landscape' },
    ],
  },

  LAWYER: {
    name: 'Lawyer & Legal Services',
    categoryKey: 'LAWYER',
    taglineDefault: 'Strategic Counsel • Ethical Representation • Proven Advocacy',
    headlineTemplate: (name, city) => `Experienced Legal Counsel, Advisory & Litigation Services${city ? ` in ${city}` : ''}`,
    subheadlineTemplate: (cat, city) => `Providing transparent legal guidance, strong courtroom representation, and confidential legal consultations.`,
    primaryCtaText: 'Schedule Legal Consultation',
    primaryCtaType: 'call',
    secondaryCtaText: 'Inquire on WhatsApp',
    secondaryCtaType: 'whatsapp',
    accentColor: '#4f46e5', // Indigo / Conservative
    accentBg: 'bg-indigo-600',
    gradient: 'from-slate-950 via-indigo-950 to-slate-950',
    badgeText: 'Confidential & Strategic Legal Representation',
    servicesTitle: 'Legal Practice Areas & Advisory',
    servicesSubtitle: 'Comprehensive legal assistance across litigation, property disputes, documentation, and compliance.',
    galleryTitle: 'Law Chambers & Professional Presence',
    trustTitle: 'Why Choose Our Legal Chambers',
    defaultServices: [
      { title: 'Civil & Property Disputes', desc: 'Title verification, property partition, land disputes, and builder-buyer litigation.', price: 'Consultation Basis', badge: 'Core Practice' },
      { title: 'Legal Documentation & Contracts', desc: 'Drafting agreements, sale deeds, power of attorney, wills, and corporate contracts.', price: 'Standard Fee' },
      { title: 'Commercial & Corporate Advisory', desc: 'Business compliance, contract disputes, trademark advisory, and partnership deeds.', price: 'Retainer / Case' },
      { title: 'Court Representation & Appeals', desc: 'Dedicated advocacy across District Courts, High Court, Tribunals, and Consumer Forums.', price: 'Case Basis' },
    ],
    defaultFaqs: [
      { q: 'Is the initial consultation completely confidential?', a: 'Yes, all client discussions and documents are strictly protected under attorney-client privilege.' },
      { q: 'What documents should I bring for the first meeting?', a: 'Please bring all relevant notices, agreements, registered deeds, and chronological case notes.' },
      { q: 'How do you structure legal fees?', a: 'We maintain 100% transparency with clear consultation fees and stage-wise litigation agreements.' },
      { q: 'Can legal consultations be conducted remotely?', a: 'Yes, we provide audio and video consultations for outstation and corporate clients.' },
    ],
    defaultGalleryImages: [
      { title: 'Law Chambers & Library', category: 'Legal Chambers', aspect: 'landscape' },
      { title: 'Client Discussion Conference Room', category: 'Advisory Suite', aspect: 'landscape' },
    ],
  },

  REAL_ESTATE: {
    name: 'Real Estate Agency & Properties',
    categoryKey: 'REAL_ESTATE',
    taglineDefault: 'Verified Properties • Transparent Deals • Local Expertise',
    headlineTemplate: (name, city) => `Verified Residential & Commercial Real Estate Deals${city ? ` in ${city}` : ''}`,
    subheadlineTemplate: (cat, city) => `Helping you buy, sell, and lease prime plots, luxury apartments, and high-yield commercial properties with zero hassle.`,
    primaryCtaText: 'Call Property Advisor',
    primaryCtaType: 'call',
    secondaryCtaText: 'Browse on WhatsApp',
    secondaryCtaType: 'whatsapp',
    accentColor: '#0284c7', // Sky / Corporate
    accentBg: 'bg-sky-600',
    gradient: 'from-slate-900 via-blue-950 to-slate-900',
    badgeText: '100% Legal Title & Verified Listings',
    servicesTitle: 'Property Services & Featured Categories',
    servicesSubtitle: 'Explore verified residential homes, prime commercial retail spaces, and investment plots.',
    galleryTitle: 'Featured Properties & Site Locations',
    trustTitle: 'Why Real Estate Buyers & Sellers Trust Us',
    defaultServices: [
      { title: 'Residential 2/3/4 BHK Flats & Villas', desc: 'Ready-to-move and newly launched gated community apartments with modern amenities.', price: 'Best Market Rates', badge: 'Verified' },
      { title: 'Commercial Retail & Office Spaces', desc: 'High-footfall commercial shops, office floors, and showrooms in top business hubs.', price: 'Prime Locations', badge: 'High ROI' },
      { title: 'Approved Freehold Plots & Land', desc: 'Clear-title residential and commercial development plots with wide road connectivity.', price: 'Per Sq.Ft' },
      { title: 'Property Valuation & Legal Verification', desc: 'Comprehensive registry checking, mutation assistance, and property paperwork support.', price: 'Assistance Included' },
    ],
    defaultFaqs: [
      { q: 'Are all listed properties legally verified?', a: 'Yes, every property in our portfolio undergoes thorough title and registry verification before listing.' },
      { q: 'Do you assist with home loans and bank approvals?', a: 'Yes, we partner with leading nationalized and private banks to ensure seamless loan processing.' },
      { q: 'Can you arrange on-site property visits?', a: 'Absolutely. We arrange accompanied site visits at your convenience throughout the week.' },
      { q: 'What are your consultancy charges for buyers?', a: 'We maintain clear, standard commission rates with zero hidden costs.' },
    ],
    defaultGalleryImages: [
      { title: 'Luxury 3 BHK Modern Living Room', category: 'Residential Interior', aspect: 'landscape' },
      { title: 'Modern Commercial Retail Complex', category: 'Commercial Hub', aspect: 'landscape' },
      { title: 'Gated Community Township View', category: 'Township', aspect: 'landscape' },
      { title: 'Prime Roadside Commercial Plot', category: 'Land & Plots', aspect: 'landscape' },
    ],
  },

  HOTEL: {
    name: 'Hotel, Guest House & Hospitality',
    categoryKey: 'HOTEL',
    taglineDefault: 'Comfortable Stays • Modern Amenities • Prime Location',
    headlineTemplate: (name, city) => `Comfortable Luxury Stays, Banquet & Hospitality${city ? ` in ${city}` : ''}`,
    subheadlineTemplate: (cat, city) => `Enjoy clean, well-furnished rooms, 24/7 room service, free high-speed Wi-Fi, and warm welcoming hospitality.`,
    primaryCtaText: 'Call to Book Room',
    primaryCtaType: 'call',
    secondaryCtaText: 'Inquire on WhatsApp',
    secondaryCtaType: 'whatsapp',
    accentColor: '#d97706', // Amber / Hospitality
    accentBg: 'bg-amber-600',
    gradient: 'from-stone-900 via-amber-950 to-stone-900',
    badgeText: 'Premium Cleanliness & Hospitality Guaranteed',
    servicesTitle: 'Our Rooms & Guest Amenities',
    servicesSubtitle: 'Designed for business travelers, couples, and family vacations with all essential comforts.',
    galleryTitle: 'Room Interiors & Hotel Gallery',
    trustTitle: 'What Makes Your Stay Memorable',
    defaultServices: [
      { title: 'Executive Deluxe AC Rooms', desc: 'Spacious air-conditioned rooms with plush king bedding, smart TV, and clean attached bath.', price: '₹1,499/night', badge: 'Popular' },
      { title: 'Premium Family Suites', desc: 'Twin-room suites with living area, mini fridge, and high-speed fiber Wi-Fi.', price: '₹2,499/night', badge: 'Spacious' },
      { title: '24/7 Room Service & Dining', desc: 'Freshly prepared multi-cuisine meals and complimentary breakfast options.', price: 'In-House Dining' },
      { title: 'Banquet & Meeting Hall', desc: 'Air-conditioned conference and party hall for corporate meets, ring ceremonies, and birthdays.', price: 'Custom Quote' },
    ],
    defaultFaqs: [
      { q: 'What are the standard check-in and check-out timings?', a: 'Standard check-in is 12:00 PM and check-out is 11:00 AM. Early check-in is subject to room availability.' },
      { q: 'Is valid Government ID mandatory for all guests?', a: 'Yes, all adult guests must present a valid Government photo ID (Aadhaar, Voter ID, Passport, or DL) at check-in.' },
      { q: 'Is free Wi-Fi and parking available?', a: 'Yes, we provide complimentary high-speed Wi-Fi across the property and dedicated secure parking.' },
      { q: 'Can we book rooms directly via WhatsApp or phone?', a: 'Yes, direct bookings via call or WhatsApp receive the best available rates with zero booking fee.' },
    ],
    defaultGalleryImages: [
      { title: 'Executive Deluxe King Bedroom', category: 'Deluxe Room', aspect: 'landscape' },
      { title: 'Clean Modern Bathroom & Shower', category: 'Bathroom Amenities', aspect: 'landscape' },
      { title: 'Welcoming Reception & Lobby Lounge', category: 'Hotel Lobby', aspect: 'landscape' },
      { title: 'In-House Restaurant & Breakfast Spread', category: 'Dining Area', aspect: 'landscape' },
    ],
  },

  IT_AGENCY: {
    name: 'IT, Software & Digital Marketing Agency',
    categoryKey: 'IT_AGENCY',
    taglineDefault: 'Cutting-Edge Code • High-Impact ROI • Scalable Tech',
    headlineTemplate: (name, city) => `Modern Web Development, Local SEO & Digital Growth Solutions${city ? ` in ${city}` : ''}`,
    subheadlineTemplate: (cat, city) => `Empowering local businesses with high-converting websites, Google Business Profile ranking, custom web apps, and automated marketing.`,
    primaryCtaText: 'Discuss Your Project',
    primaryCtaType: 'whatsapp',
    secondaryCtaText: 'Call Agency',
    secondaryCtaType: 'call',
    accentColor: '#6366f1', // Indigo / Modern Tech
    accentBg: 'bg-indigo-600',
    gradient: 'from-slate-950 via-indigo-950 to-slate-950',
    badgeText: 'Proven ROI & Modern Digital Growth',
    servicesTitle: 'Our Digital & Engineering Services',
    servicesSubtitle: 'Full-stack software engineering, local search optimization, and conversion-focused digital infrastructure.',
    galleryTitle: 'Recent Client Projects & Case Studies',
    trustTitle: 'Why Growing Brands Partner With Us',
    defaultServices: [
      { title: 'Google Business Profile & Local SEO', desc: 'Rank #1 in Google Maps Local Pack, capture genuine customer reviews, and maximize call leads.', price: 'Monthly Retainer', badge: 'High ROI' },
      { title: 'Modern Mobile-First Web Development', desc: 'Ultra-fast Next.js / React websites with lightning-fast mobile performance and clean UI/UX.', price: 'Fixed Project', badge: 'Popular' },
      { title: 'Custom CRM & Business Automation', desc: 'Streamline lead tracking, billing, automated WhatsApp notifications, and customer workflows.', price: 'Custom Quote' },
      { title: 'Paid Ads & Lead Generation (Meta/Google)', desc: 'Targeted hyper-local advertising campaigns delivering measurable customer inquiries.', price: 'Ad Management' },
    ],
    defaultFaqs: [
      { q: 'How fast can our new business website go live?', a: 'Standard business websites and landing pages typically launch within 3 to 5 business days.' },
      { q: 'Do you handle Google Business Profile verification and ranking?', a: 'Yes, we handle complete NAP optimization, citation building, review automation, and ongoing ranking boosts.' },
      { q: 'Will our website work seamlessly on mobile phones?', a: '100%. All our sites are built mobile-first with optimized performance, instant WhatsApp integration, and direct call actions.' },
      { q: 'Do you provide post-launch maintenance and support?', a: 'Yes, we offer ongoing monthly maintenance, security backups, content updates, and analytics monitoring.' },
    ],
    defaultGalleryImages: [
      { title: 'High-Converting Local Business Website', category: 'Web App', aspect: 'landscape' },
      { title: 'Google Maps #1 Ranking Results Dashboard', category: 'SEO Case Study', aspect: 'landscape' },
      { title: 'Custom Automated CRM Workspace', category: 'Software Suite', aspect: 'landscape' },
      { title: 'Mobile WhatsApp Commerce Funnel', category: 'Mobile UX', aspect: 'landscape' },
    ],
  },

  CONSTRUCTION: {
    name: 'Construction, Builder & Contractor',
    categoryKey: 'CONSTRUCTION',
    taglineDefault: 'Solid Foundations • Superior Materials • On-Time Handover',
    headlineTemplate: (name, city) => `Quality Residential & Commercial Construction Contractor${city ? ` in ${city}` : ''}`,
    subheadlineTemplate: (cat, city) => `From foundation to finishing: turnkey building construction, structural engineering, renovation, and interior execution.`,
    primaryCtaText: 'Request Site Estimate',
    primaryCtaType: 'whatsapp',
    secondaryCtaText: 'Call Contractor',
    secondaryCtaType: 'call',
    accentColor: '#ea580c', // Orange / Construction
    accentBg: 'bg-orange-600',
    gradient: 'from-stone-900 via-orange-950 to-stone-900',
    badgeText: 'Engineered Quality & Transparent Construction',
    servicesTitle: 'Construction & Civil Engineering Services',
    servicesSubtitle: 'End-to-end building construction, architectural planning, and turnkey structural solutions.',
    galleryTitle: 'Ongoing & Completed Construction Projects',
    trustTitle: 'Why Homeowners & Builders Trust Our Work',
    defaultServices: [
      { title: 'Turnkey Residential House Construction', desc: 'Complete structural construction with material, architectural floor plans, plumbing, and electrification.', price: 'Per Sq.Ft', badge: 'Turnkey' },
      { title: 'Commercial Building & Complex Execution', desc: 'Heavy RCC framed commercial structures, showroom spaces, and multi-story complexes.', price: 'Contract Basis' },
      { title: 'Home Renovation & Extension Works', desc: 'Floor additions, structural strengthening, waterproofing, and modern exterior remodeling.', price: 'Custom Quote', badge: 'Fast Service' },
      { title: 'Architectural 2D/3D Planning & Approvals', desc: 'Municipal building plan sanctions, 3D front elevation designs, and structural drawings.', price: 'Per Drawing' },
    ],
    defaultFaqs: [
      { q: 'Do you undertake construction with materials (turnkey)?', a: 'Yes, we provide complete turnkey contracts with ISI-grade cement, TMT steel, branded tiles, and electrical fittings.' },
      { q: 'How do you monitor quality and milestone timelines?', a: 'We have dedicated civil engineers supervising daily, and work progress is shared with weekly milestone reports.' },
      { q: 'Do you help with municipal building approvals and 3D elevations?', a: 'Yes, our architectural team prepares sanctioned plans, 3D elevations, and structural drawings.' },
      { q: 'Is there a formal legal contract before starting work?', a: 'Always. We sign a detailed agreement clearly outlining material specifications, payment milestones, and delivery timeline.' },
    ],
    defaultGalleryImages: [
      { title: 'Modern 3-Story Luxury Villa Construction', category: 'Turnkey Villa', aspect: 'landscape' },
      { title: 'RCC Commercial Complex Framework', category: 'Commercial Civil', aspect: 'landscape' },
      { title: 'Modern Front Elevation Remodeling', category: 'Exterior Design', aspect: 'landscape' },
      { title: 'Interior Finishing & Tiling Work', category: 'Finishing Works', aspect: 'landscape' },
    ],
  },

  GYM: {
    name: 'Gym, Fitness & Crossfit Studio',
    categoryKey: 'GYM',
    taglineDefault: 'Train Hard • Stay Consistent • Transform Your Body',
    headlineTemplate: (name, city) => `State-of-the-Art Fitness Center & Strength Training${city ? ` in ${city}` : ''}`,
    subheadlineTemplate: (cat, city) => `Transform your fitness with modern imported equipment, certified personal trainers, and motivating workout environment.`,
    primaryCtaText: 'Claim Free Trial Workout',
    primaryCtaType: 'whatsapp',
    secondaryCtaText: 'Call Gym Desk',
    secondaryCtaType: 'call',
    accentColor: '#f59e0b', // Amber / Energy
    accentBg: 'bg-amber-500',
    gradient: 'from-slate-950 via-zinc-900 to-slate-950',
    badgeText: 'Imported Biomechanical Equipment & Certified Coaches',
    servicesTitle: 'Our Training Programs & Membership Plans',
    servicesSubtitle: 'Comprehensive fitness programs suited for beginners, athletes, weight loss, and muscle building.',
    galleryTitle: 'Gym Floor & Workout Arena',
    trustTitle: 'Why Members Transform Their Bodies Here',
    defaultServices: [
      { title: 'Strength Training & Cardio Zone', desc: 'Full access to heavy free-weights, Olympic barbells, plate-loaded machines, and treadmills.', price: '₹999/mo onwards', badge: 'Popular' },
      { title: '1-on-1 Certified Personal Coaching', desc: 'Dedicated trainer for posture correction, customized progressive overload, and diet charts.', price: '₹3,500/mo', badge: 'Results' },
      { title: 'Fat Loss & HIIT Bootcamp', desc: 'High-intensity interval training designed to burn calories and boost metabolic conditioning.', price: 'Included in Plan' },
      { title: 'Personalized Nutrition & Diet Planning', desc: 'Custom macros and meal plans formulated to support your muscle gain and fat loss goals.', price: 'Free with Annual' },
    ],
    defaultFaqs: [
      { q: 'Can I take a free trial workout before joining?', a: 'Yes! You can book a free 1-day trial workout by messaging us on WhatsApp or walking into our reception.' },
      { q: 'Are general trainers available on the gym floor to guide beginners?', a: 'Yes, our certified floor trainers are always present to help beginners with correct form and machine setup.' },
      { q: 'What are the morning and evening gym timings?', a: 'We operate early morning to late evening with separate slots available for women if requested.' },
      { q: 'Are flexible monthly and annual membership plans available?', a: 'Yes, we offer 1-month, 3-month, 6-month, and discounted annual memberships.' },
    ],
    defaultGalleryImages: [
      { title: 'Heavy Dumbbell & Free Weight Arena', category: 'Strength Floor', aspect: 'landscape' },
      { title: 'Cardio Line & Treadmill Section', category: 'Cardio Zone', aspect: 'landscape' },
      { title: 'Crossfit Functional Training Turf', category: 'Functional Area', aspect: 'landscape' },
      { title: 'Clean Locker Rooms & Changing Area', category: 'Amenities', aspect: 'landscape' },
    ],
  },

  GARAGE: {
    name: 'Automobile Garage & Car Care',
    categoryKey: 'GARAGE',
    taglineDefault: 'Expert Mechanics • Genuine Parts • Transparent Pricing',
    headlineTemplate: (name, city) => `Multi-Brand Car Service, Periodic Maintenance & Denting-Painting${city ? ` in ${city}` : ''}`,
    subheadlineTemplate: (cat, city) => `Complete automobile care by certified mechanics: computer diagnostics, engine service, AC repair, and premium body shop paint booth.`,
    primaryCtaText: 'Book Car Service',
    primaryCtaType: 'whatsapp',
    secondaryCtaText: 'Call Garage Desk',
    secondaryCtaType: 'call',
    accentColor: '#dc2626', // Red / Automotive
    accentBg: 'bg-red-600',
    gradient: 'from-stone-950 via-zinc-900 to-stone-950',
    badgeText: '100% Genuine OEM Spares & Computerized Diagnostics',
    servicesTitle: 'Our Automobile Services & Maintenance',
    servicesSubtitle: 'Comprehensive car repair, periodic maintenance, and detailing solutions for all car brands.',
    galleryTitle: 'Workshop & Paint Booth Facility',
    trustTitle: 'Why Car Owners Choose Our Workshop',
    defaultServices: [
      { title: 'Periodic Comprehensive Service', desc: 'Engine oil change, oil filter, air filter, brake cleaning, 40-point vehicle safety inspection.', price: '₹2,499 onwards', badge: 'Essential' },
      { title: 'Denting, Painting & Paint Booth Finish', desc: 'Precision panel dent removal, computerized color matching, and scratch-resistant clear coat.', price: 'Per Panel Rate', badge: 'Body Shop' },
      { title: 'Car AC Repair & Gas Refilling', desc: 'Complete AC cooling coil cleaning, condenser flush, leak testing, and original refrigerant gas refill.', price: '₹1,299 onwards' },
      { title: 'Clutch, Suspension & Brake Overhaul', desc: 'Genuine shock absorber replacement, clutch plate overhaul, and disc brake machining.', price: 'Inspection Basis' },
    ],
    defaultFaqs: [
      { q: 'Do you service all brands of cars (Maruti, Hyundai, Tata, Honda, Mahindra, etc.)?', a: 'Yes, we are a fully equipped multi-brand workshop with scanners and tools for all Indian and imported cars.' },
      { q: 'Do you offer doorstep pickup and drop service?', a: 'Yes, we offer convenient doorstep car pickup and delivery within our city service radius.' },
      { q: 'Are only genuine OEM spare parts used for repairs?', a: 'Yes, we use 100% authentic OEM/OES certified spares with transparent billing and warranty.' },
      { q: 'Do you provide an upfront estimate before starting work?', a: 'Always. We diagnose the vehicle, share a transparent line-item estimate, and only proceed upon your approval.' },
    ],
    defaultGalleryImages: [
      { title: 'Hydraulic Lift & Diagnostic Workshop Floor', category: 'Service Bay', aspect: 'landscape' },
      { title: 'Dust-Free Heated Paint Booth Facility', category: 'Paint Booth', aspect: 'landscape' },
      { title: 'Wheel Alignment & Balancing Bay', category: 'Suspension & Tires', aspect: 'landscape' },
      { title: 'Premium Foam Wash & Interior Detailing', category: 'Car Detailing', aspect: 'landscape' },
    ],
  },

  COACHING: {
    name: 'Coaching, School & Training Institute',
    categoryKey: 'COACHING',
    taglineDefault: 'Concept Clarity • Top Faculty • Proven Results',
    headlineTemplate: (name, city) => `Premier Coaching, Academic Excellence & Skill Mastery${city ? ` in ${city}` : ''}`,
    subheadlineTemplate: (cat, city) => `Empowering students with structured syllabus mastery, experienced faculty, regular mock tests, and personalized doubt sessions.`,
    primaryCtaText: 'Book Free Demo Class',
    primaryCtaType: 'whatsapp',
    secondaryCtaText: 'Call Academic Desk',
    secondaryCtaType: 'call',
    accentColor: '#2563eb', // Blue / Academic
    accentBg: 'bg-blue-600',
    gradient: 'from-slate-950 via-blue-950 to-slate-950',
    badgeText: 'Proven Track Record & Expert Faculty',
    servicesTitle: 'Our Courses, Batches & Programs',
    servicesSubtitle: 'Focused academic and competitive coaching programs designed to build confidence and rank performance.',
    galleryTitle: 'Classrooms, Library & Student Achievements',
    trustTitle: 'Why Parents & Students Choose Our Institute',
    defaultServices: [
      { title: 'Foundation & Board Mastery Batches', desc: 'Deep concept clarity, textbook coverage, chapter-wise assignments, and weekly tests.', price: 'Monthly / Term', badge: 'Core' },
      { title: 'Competitive Exam Preparation', desc: 'High-yield problem solving, past 10 years question analysis, and full-length simulated mock exams.', price: 'Annual Batch', badge: 'High Rankers' },
      { title: '1-on-1 Personal Doubt Clearing', desc: 'Daily dedicated doubt sessions with faculty to ensure no student lags behind.', price: 'Included' },
      { title: 'Printed Study Materials & Test Series', desc: 'Exhaustive theory booklets, mind maps, formula sheets, and online progress tracking.', price: 'Comprehensive' },
    ],
    defaultFaqs: [
      { q: 'Can a student attend demo classes before admission?', a: 'Yes! We offer 2 free demo classes so students can experience our teaching methodology firsthand.' },
      { q: 'What is the batch size for regular classes?', a: 'We maintain small, focused batches (20–25 students) to ensure individual attention and doubt resolution.' },
      { q: 'How are parents updated about student performance?', a: 'We share weekly attendance and test score reports directly with parents on WhatsApp, followed by periodic PTMs.' },
      { q: 'Are scholarships or fee concessions available for merit students?', a: 'Yes, we conduct periodic admission scholarship tests offering up to 50% tuition fee waiver for top scorers.' },
    ],
    defaultGalleryImages: [
      { title: 'Smart Air-Conditioned Classroom', category: 'Classroom', aspect: 'landscape' },
      { title: 'Quiet Study Library & Doubt Counter', category: 'Library', aspect: 'landscape' },
      { title: 'Annual Student Felicitation Ceremony', category: 'Achievers', aspect: 'landscape' },
    ],
  },

  PHOTOGRAPHY: {
    name: 'Photographer & Visual Studio',
    categoryKey: 'PHOTOGRAPHY',
    taglineDefault: 'Timeless Memories • Cinematic Framing • Passionate Storytelling',
    headlineTemplate: (name, city) => `Cinematic Wedding, Event & Commercial Photography${city ? ` in ${city}` : ''}`,
    subheadlineTemplate: (cat, city) => `Capturing heartfelt emotions, candid moments, and stunning portraits with high-end camera equipment and artisan color grading.`,
    primaryCtaText: 'Check Date Availability',
    primaryCtaType: 'whatsapp',
    secondaryCtaText: 'Call Studio',
    secondaryCtaType: 'call',
    accentColor: '#8b5cf6', // Violet / Creative
    accentBg: 'bg-violet-600',
    gradient: 'from-stone-950 via-purple-950 to-stone-950',
    badgeText: 'Cinematic 4K Storytelling & High-Resolution Delivery',
    servicesTitle: 'Photography & Filmmaking Services',
    servicesSubtitle: 'Complete photography packages covering life’s most precious celebrations and commercial brand campaigns.',
    galleryTitle: 'Featured Portfolio & Photo Highlights',
    trustTitle: 'Why Clients Love Our Visual Storytelling',
    defaultServices: [
      { title: 'Candid Wedding & Pre-Wedding Shoots', desc: 'Artistic couple portraits, emotional candid frames, drone cinematography, and luxury photobooks.', price: 'Package Rates', badge: 'Most Loved' },
      { title: 'Maternity, Newborn & Kids Portraits', desc: 'Gentle, creative in-studio and outdoor shoots with customizable themes and props.', price: '₹4,999 onwards', badge: 'Special' },
      { title: 'Commercial & Product Photography', desc: 'High-res studio lighting product shoots, fashion lookbooks, and corporate headshots.', price: 'Per Shoot' },
      { title: 'Traditional Events & Birthday Coverage', desc: 'Full event coverage with synchronized lighting, instant printing options, and HD video teasers.', price: 'Event Basis' },
    ],
    defaultFaqs: [
      { q: 'How early should we book our wedding or event dates?', a: 'For wedding seasons, we recommend booking 2 to 4 months in advance to lock your dates.' },
      { q: 'How long does it take to deliver final photos and video albums?', a: 'Teaser highlights are delivered within 48–72 hours. Complete color-graded photos and luxury albums are delivered within 3–4 weeks.' },
      { q: 'Do you travel outstation for destination shoots?', a: 'Yes! We travel across India for pre-weddings, weddings, and commercial campaigns.' },
      { q: 'What equipment do you use?', a: 'We use full-frame Sony/Canon cinema cameras, GM prime lenses, Ronin stabilizers, and licensed 4K drones.' },
    ],
    defaultGalleryImages: [
      { title: 'Emotional Candid Wedding Rituals', category: 'Wedding', aspect: 'landscape' },
      { title: 'Romantic Outdoor Pre-Wedding Portrait', category: 'Pre-Wedding', aspect: 'landscape' },
      { title: 'Creative In-Studio Portrait Lighting', category: 'Portraits', aspect: 'landscape' },
    ],
  },

  HOME_SERVICES: {
    name: 'Electrician, Plumber & Home Services',
    categoryKey: 'HOME_SERVICES',
    taglineDefault: 'Fast Arrival • Verified Technicians • Honest Pricing',
    headlineTemplate: (name, city) => `Reliable Electrician, Plumbing & Home Repair Services${city ? ` in ${city}` : ''}`,
    subheadlineTemplate: (cat, city) => `Quick doorstep repair and installation services by experienced, verified technicians with upfront pricing and service warranty.`,
    primaryCtaText: 'Call for Quick Visit',
    primaryCtaType: 'call',
    secondaryCtaText: 'Book on WhatsApp',
    secondaryCtaType: 'whatsapp',
    accentColor: '#0891b2', // Cyan / Services
    accentBg: 'bg-cyan-600',
    gradient: 'from-slate-900 via-cyan-950 to-slate-900',
    badgeText: 'Verified & Background-Checked Technicians',
    servicesTitle: 'Our Home Repair & Maintenance Solutions',
    servicesSubtitle: 'Fast, dependable electrical, plumbing, and appliance repair solutions for your home and office.',
    galleryTitle: 'Completed Installations & Repair Work',
    trustTitle: 'Why Thousands Rely on Our Home Services',
    defaultServices: [
      { title: 'Complete Home Electrical Wiring & Repairs', desc: 'Short circuit troubleshooting, MCB installation, inverter wiring, and lighting fixtures.', price: '₹199 visit', badge: 'Fast Arrival' },
      { title: 'Plumbing, Pipe Fitting & Leakage Fix', desc: 'Pipe leak repairs, bathroom sanitary fittings, water motor pump installation, and tap replacements.', price: 'Standard Rates' },
      { title: 'Appliance Installation & Maintenance', desc: 'Geyser installation, ceiling fan fitting, RO water purifier setup, and switchboard upgrades.', price: 'Per Unit' },
      { title: 'Emergency Breakdown Visits', desc: 'Rapid response team for urgent electrical power cuts, water overflows, and drainage blockages.', price: 'Immediate Visit', badge: 'Urgent' },
    ],
    defaultFaqs: [
      { q: 'How quickly can a technician reach my location?', a: 'For nearby local areas, our technician typically arrives within 30 to 60 minutes of booking.' },
      { q: 'Is there a warranty on repair work done?', a: 'Yes, we provide a 30-day service warranty on all installations and repair jobs.' },
      { q: 'Are your technicians verified and experienced?', a: 'All our technicians are thoroughly background-verified with a minimum of 4+ years practical field experience.' },
      { q: 'How do you charge for spare parts and materials?', a: 'Spare parts are charged at actual MRP with genuine receipts, or you can purchase them directly.' },
    ],
    defaultGalleryImages: [
      { title: 'Neat Modern Electrical Panel & MCB Setup', category: 'Electrical', aspect: 'landscape' },
      { title: 'Concealed Bathroom Plumbing & Fixtures', category: 'Plumbing', aspect: 'landscape' },
    ],
  },

  RETAIL: {
    name: 'Retail Store, Showroom & Shopping',
    categoryKey: 'RETAIL',
    taglineDefault: '100% Authentic Products • Best Local Pricing • Direct Support',
    headlineTemplate: (name, city) => `Premium Quality Products, Authentic Brands & Local Store${city ? ` in ${city}` : ''}`,
    subheadlineTemplate: (cat, city) => `Shop the finest curated collections with transparent pricing, instant WhatsApp inquiries, and fast in-store or doorstep service.`,
    primaryCtaText: 'Order / Inquire on WhatsApp',
    primaryCtaType: 'whatsapp',
    secondaryCtaText: 'Call Store',
    secondaryCtaType: 'call',
    accentColor: '#0284c7', // Sky / Commercial
    accentBg: 'bg-sky-600',
    gradient: 'from-slate-900 via-sky-950 to-slate-900',
    badgeText: '100% Authentic Quality Guaranteed',
    servicesTitle: 'Featured Collections & Services',
    servicesSubtitle: 'Browse our popular seasonal collections, in-store perks, and fast fulfillment options.',
    galleryTitle: 'Store Showroom & Featured Products',
    trustTitle: 'Why Customers Love Shopping With Us',
    defaultServices: [
      { title: 'Curated Seasonal Collection', desc: 'Authentic branded products selected for high durability, style, and everyday value.', price: 'Best Price', badge: 'New Arrival' },
      { title: 'WhatsApp Catalog & Express Order', desc: 'Browse latest stock photos on WhatsApp and get same-day home delivery or counter pickup.', price: 'Free Delivery', badge: 'Popular' },
      { title: 'In-Store Demo & Personal Assistance', desc: 'Visit our showroom for hands-on product inspection and expert recommendations.', price: 'Complimentary' },
      { title: 'Gift Hampers & Festive Packages', desc: 'Custom packaging and special pricing for festive and corporate gifting.', price: 'Custom Packs' },
    ],
    defaultFaqs: [
      { q: 'Can I order directly on WhatsApp?', a: 'Yes! Send us a message on WhatsApp with the product photo or requirement, and we will confirm stock and pricing instantly.' },
      { q: 'What are the payment options accepted at the store?', a: 'We accept UPI (GPay, PhonePe, Paytm), all major Debit/Credit cards, Net Banking, and Cash.' },
      { q: 'Is home delivery available for local orders?', a: 'Yes, we provide same-day local express delivery for orders placed before 5 PM.' },
      { q: 'What is your exchange policy?', a: 'We offer an easy 7-day exchange on unused items with original purchase bill and tags.' },
    ],
    defaultGalleryImages: [
      { title: 'Well-Stocked Modern Store Showroom', category: 'Showroom', aspect: 'landscape' },
      { title: 'Featured Premium Product Collection', category: 'Featured Products', aspect: 'landscape' },
    ],
  },

  GENERAL: {
    name: 'General Local Business',
    categoryKey: 'GENERAL',
    taglineDefault: 'Trusted Local Service • Quality First • Customer Focused',
    headlineTemplate: (name, city) => `Dedicated Quality Services & Trusted Local Solutions${city ? ` in ${city}` : ''}`,
    subheadlineTemplate: (cat, city) => `Providing prompt assistance, verified customer satisfaction, and transparent pricing for our local community.`,
    primaryCtaText: 'Call Us Today',
    primaryCtaType: 'call',
    secondaryCtaText: 'Message on WhatsApp',
    secondaryCtaType: 'whatsapp',
    accentColor: '#0284c7',
    accentBg: 'bg-sky-600',
    gradient: 'from-slate-900 via-indigo-950 to-slate-900',
    badgeText: 'Verified Quality & Prompt Local Service',
    servicesTitle: 'Our Core Services & Solutions',
    servicesSubtitle: 'Comprehensive services designed to meet your specific needs with excellence and reliability.',
    galleryTitle: 'Our Work & Facility Highlights',
    trustTitle: 'Why Our Clients Rely on Us',
    defaultServices: [
      { title: 'Primary Professional Service', desc: 'High quality execution tailored to your specific requirements with direct support.', price: 'Standard Rates', badge: 'Popular' },
      { title: 'On-Demand Consultation & Support', desc: 'Prompt customer assistance and expert guidance to help you choose the right solution.', price: 'Free Advice' },
      { title: 'Custom Solutions & Maintenance', desc: 'Flexible packages suited for recurring needs and long-term satisfaction.', price: 'Custom Quote' },
    ],
    defaultFaqs: [
      { q: 'How can I get in touch for immediate assistance?', a: 'You can call us directly or tap the WhatsApp button to chat with our team right away.' },
      { q: 'What are your operating hours?', a: 'Please check our business hours section below. We respond promptly to all incoming customer inquiries.' },
      { q: 'Where are you located?', a: 'Our complete address is provided below with a 1-click Google Maps directions link for easy navigation.' },
    ],
    defaultGalleryImages: [
      { title: 'Professional Workspace & Front Desk', category: 'Workspace', aspect: 'landscape' },
      { title: 'Quality Service Delivery in Action', category: 'Our Work', aspect: 'landscape' },
    ],
  },
};

// Category detection helper
export function detectCategoryKeyFromGbp(categoryName: string = ''): LocalCategoryKey {
  const norm = categoryName.toLowerCase();
  if (norm.includes('aluminum') || norm.includes('glass') || norm.includes('fabrication') || norm.includes('glazing') || norm.includes('window') || norm.includes('door')) return 'FABRICATION';
  if (norm.includes('restaurant') || norm.includes('cafe') || norm.includes('dining') || norm.includes('food') || norm.includes('bakery') || norm.includes('dhaba') || norm.includes('bar')) return 'RESTAURANT';
  if (norm.includes('salon') || norm.includes('beauty') || norm.includes('parlour') || norm.includes('spa') || norm.includes('makeup') || norm.includes('hair') || norm.includes('bridal')) return 'SALON';
  if (norm.includes('clinic') || norm.includes('doctor') || norm.includes('hospital') || norm.includes('dental') || norm.includes('health') || norm.includes('physician') || norm.includes('care') || norm.includes('medical')) return 'CLINIC';
  if (norm.includes('lawyer') || norm.includes('legal') || norm.includes('advocate') || norm.includes('attorney') || norm.includes('court') || norm.includes('chambers')) return 'LAWYER';
  if (norm.includes('real estate') || norm.includes('property') || norm.includes('realtor') || norm.includes('developer') || norm.includes('builder') || norm.includes('plot')) return 'REAL_ESTATE';
  if (norm.includes('hotel') || norm.includes('resort') || norm.includes('guest house') || norm.includes('lodge') || norm.includes('homestay') || norm.includes('inn')) return 'HOTEL';
  if (norm.includes('digital') || norm.includes('marketing') || norm.includes('seo') || norm.includes('software') || norm.includes('it ') || norm.includes('agency') || norm.includes('web') || norm.includes('tech') || norm.includes('photography academy') || norm.includes('academy')) return 'IT_AGENCY';
  if (norm.includes('construction') || norm.includes('contractor') || norm.includes('civil') || norm.includes('architect') || norm.includes('renovation')) return 'CONSTRUCTION';
  if (norm.includes('gym') || norm.includes('fitness') || norm.includes('yoga') || norm.includes('crossfit') || norm.includes('workout') || norm.includes('trainer')) return 'GYM';
  if (norm.includes('garage') || norm.includes('auto') || norm.includes('car') || norm.includes('mechanic') || norm.includes('bike') || norm.includes('vehicle') || norm.includes('motor')) return 'GARAGE';
  if (norm.includes('coaching') || norm.includes('institute') || norm.includes('tuition') || norm.includes('school') || norm.includes('college') || norm.includes('class') || norm.includes('training') || norm.includes('education')) return 'COACHING';
  if (norm.includes('photographer') || norm.includes('photo') || norm.includes('studio') || norm.includes('video') || norm.includes('cinematography')) return 'PHOTOGRAPHY';
  if (norm.includes('electrician') || norm.includes('plumber') || norm.includes('home service') || norm.includes('repair') || norm.includes('cleaning') || norm.includes('carpenter') || norm.includes('pest')) return 'HOME_SERVICES';
  if (norm.includes('retail') || norm.includes('store') || norm.includes('shop') || norm.includes('mart') || norm.includes('fashion') || norm.includes('electronics') || norm.includes('clothing') || norm.includes('market')) return 'RETAIL';
  return 'GENERAL';
}

export interface GeneratedWebsiteData {
  businessName: string;
  category: string;
  categoryKey: LocalCategoryKey;
  theme: CategoryTheme;
  city: string;
  state?: string;
  address: string;
  phone: string;
  whatsapp: string;
  email: string;
  googleMapsUrl: string;
  rating: number;
  reviewCount: number;
  workingHours: string;
  headline: string;
  subheadline: string;
  aboutText: string;
  services: Array<{ title: string; desc: string; price?: string; badge?: string }>;
  faqs: Array<{ q: string; a: string }>;
  galleryImages: Array<{ title: string; category: string; aspect: string }>;
  reviews: Array<{ authorName: string; rating: number; text: string; relativeTime: string }>;
  jsonLdSchema: string;
}

export function buildGeneratedWebsiteData(params: {
  businessName: string;
  category: string;
  city?: string;
  state?: string;
  address?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  googleMapsUrl?: string;
  rating?: number;
  reviewCount?: number;
  workingHours?: string;
  customHeadline?: string;
  customSubheadline?: string;
  customAbout?: string;
  customServices?: Array<{ title: string; desc: string; price?: string; badge?: string }>;
  realReviews?: Array<{ authorName: string; rating: number; text: string; relativeTime?: string }>;
}): GeneratedWebsiteData {
  const catKey = detectCategoryKeyFromGbp(params.category);
  const theme = CATEGORY_THEMES[catKey] || CATEGORY_THEMES.GENERAL;
  const city = params.city || '';
  const businessName = params.businessName || 'Your Business Name';
  const rating = params.rating && params.rating > 0 ? params.rating : 4.9;
  const reviewCount = params.reviewCount && params.reviewCount > 0 ? params.reviewCount : 25;
  const phone = params.phone || '+91 94311 00000';
  const whatsapp = params.whatsapp || phone.replace(/[^0-9]/g, '');
  const address = params.address || (city ? `${city}` : 'Main Road');
  const workingHours = params.workingHours || 'Mon – Sat: 9:30 AM – 8:30 PM | Sun: Open';

  const headline = params.customHeadline || theme.headlineTemplate(businessName, city);
  const subheadline = params.customSubheadline || theme.subheadlineTemplate(params.category || theme.name, city);
  const aboutText =
    params.customAbout ||
    `Welcome to ${businessName}. We are dedicated to providing our clients with exceptional service, uncompromising quality, and fast local support. Get in touch with us directly via phone or WhatsApp.`;

  const services = params.customServices && params.customServices.length > 0 ? params.customServices : theme.defaultServices;
  const faqs = theme.defaultFaqs;
  const galleryImages = theme.defaultGalleryImages;

  const reviews =
    params.realReviews && params.realReviews.length > 0
      ? params.realReviews.map((r) => ({
          authorName: r.authorName || 'Google User',
          rating: r.rating || 5,
          text: r.text || `Excellent service and professional experience with ${businessName}.`,
          relativeTime: r.relativeTime || 'Recently',
        }))
      : [
          { authorName: 'Verified Google Reviewer', rating: 5, text: `Extremely satisfied with the service and quality of ${businessName}. Highly recommended!`, relativeTime: '2 weeks ago' },
          { authorName: 'Local Customer', rating: 5, text: `Prompt response, courteous staff, and transparent pricing. Will definitely visit again.`, relativeTime: '1 month ago' },
        ];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: businessName,
    image: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=800&auto=format&fit=crop&q=80',
    '@id': params.googleMapsUrl || `https://maps.google.com/?q=${encodeURIComponent(businessName + ' ' + city)}`,
    url: params.googleMapsUrl || '',
    telephone: phone,
    priceRange: '₹₹',
    address: {
      '@type': 'PostalAddress',
      streetAddress: address,
      addressLocality: city || undefined,
      addressCountry: 'IN',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: rating.toString(),
      reviewCount: reviewCount.toString(),
    },
    openingHours: 'Mo,Tu,We,Th,Fr,Sa 09:30-20:30',
  };

  return {
    businessName,
    category: params.category || theme.name,
    categoryKey: catKey,
    theme,
    city,
    state: params.state || '',
    address,
    phone,
    whatsapp,
    email: params.email || '',
    googleMapsUrl: params.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(businessName + ' ' + city)}`,
    rating,
    reviewCount,
    workingHours,
    headline,
    subheadline,
    aboutText,
    services,
    faqs,
    galleryImages,
    reviews,
    jsonLdSchema: JSON.stringify(jsonLd, null, 2),
  };
}

// Generate Standalone HTML5 + CSS + Vanilla JS Bundle ready to host or download
export function generateStandaloneHtmlBundle(data: GeneratedWebsiteData): {
  html: string;
  css: string;
  js: string;
} {
  const css = `
/* Modern Mobile-First CSS Reset & Theme Styles */
:root {
  --primary: ${data.theme.accentColor};
  --primary-dark: #0f172a;
  --bg-light: #f8fafc;
  --text-dark: #0f172a;
  --text-muted: #64748b;
  --card-bg: #ffffff;
  --border-color: #e2e8f0;
}
* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  color: var(--text-dark);
  background-color: var(--bg-light);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}
a { text-decoration: none; color: inherit; }
.container { max-width: 1140px; margin: 0 auto; padding: 0 1.25rem; }

/* Sticky Header */
header {
  position: sticky; top: 0; z-index: 50;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border-color);
  padding: 0.85rem 0;
}
.header-wrap { display: flex; align-items: center; justify-content: space-between; }
.logo-title { font-size: 1.15rem; font-weight: 800; color: var(--text-dark); }
.header-actions { display: flex; gap: 0.5rem; }
.btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 0.4rem;
  padding: 0.6rem 1.1rem; border-radius: 9999px; font-size: 0.85rem; font-weight: 700;
  cursor: pointer; transition: all 0.2s ease; border: none;
}
.btn-primary { background: var(--primary); color: #fff; }
.btn-whatsapp { background: #25d366; color: #fff; }
.btn-outline { background: transparent; border: 1.5px solid var(--border-color); color: var(--text-dark); }
.btn-white { background: #ffffff; color: var(--text-dark); }

/* Hero */
.hero {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  color: #ffffff; padding: 4.5rem 0 3.5rem 0; text-align: center;
}
.hero-badge {
  display: inline-block; padding: 0.35rem 0.85rem; border-radius: 9999px;
  background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2);
  font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 1.25rem;
}
.hero h1 { font-size: 2.2rem; font-weight: 900; line-height: 1.2; margin-bottom: 1rem; }
.hero p { font-size: 1.05rem; color: #cbd5e1; max-width: 680px; margin: 0 auto 2rem auto; }
.hero-btns { display: flex; justify-content: center; gap: 0.75rem; flex-wrap: wrap; }

/* Trust Strip */
.trust-strip { background: #ffffff; border-bottom: 1px solid var(--border-color); padding: 1.25rem 0; }
.trust-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; text-align: center; }
.trust-item strong { display: block; font-size: 1.25rem; color: var(--primary); }
.trust-item span { font-size: 0.8rem; color: var(--text-muted); }

/* Sections */
section { padding: 3.5rem 0; }
.section-head { text-align: center; max-width: 680px; margin: 0 auto 2.5rem auto; }
.section-head h2 { font-size: 1.75rem; font-weight: 800; margin-bottom: 0.5rem; }
.section-head p { color: var(--text-muted); font-size: 0.95rem; }

/* Services Grid */
.services-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.25rem; }
.service-card {
  background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 1rem;
  padding: 1.5rem; transition: transform 0.2s, box-shadow 0.2s; position: relative;
}
.service-card:hover { transform: translateY(-3px); box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05); }
.service-badge { position: absolute; top: 1rem; right: 1rem; font-size: 0.7rem; font-weight: 700; background: #f1f5f9; padding: 0.2rem 0.6rem; border-radius: 9999px; }
.service-card h3 { font-size: 1.1rem; font-weight: 700; margin-bottom: 0.5rem; }
.service-card p { font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1rem; }
.service-price { font-size: 0.9rem; font-weight: 700; color: var(--primary); }

/* Reviews */
.reviews-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.25rem; }
.review-card { background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 1rem; padding: 1.5rem; }
.review-stars { color: #f59e0b; margin-bottom: 0.5rem; }
.review-card p { font-size: 0.9rem; color: #334155; font-style: italic; margin-bottom: 1rem; }
.review-author { font-size: 0.85rem; font-weight: 700; color: var(--text-dark); }
.review-time { font-size: 0.75rem; color: var(--text-muted); }

/* FAQ */
.faq-wrap { max-width: 760px; margin: 0 auto; display: flex; flex-direction: column; gap: 0.75rem; }
.faq-item { background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 0.75rem; overflow: hidden; }
.faq-question { padding: 1.1rem; font-weight: 700; font-size: 0.95rem; cursor: pointer; display: flex; justify-content: space-between; align-items: center; }
.faq-answer { padding: 0 1.1rem 1.1rem 1.1rem; font-size: 0.88rem; color: var(--text-muted); display: none; }
.faq-item.active .faq-answer { display: block; }
.faq-item.active .faq-toggle { transform: rotate(180deg); }
.faq-toggle { transition: transform 0.2s; }

/* Location & Hours */
.location-card {
  background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 1.25rem;
  padding: 2rem; display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 2rem;
}
.info-block h4 { font-size: 1rem; font-weight: 700; margin-bottom: 0.35rem; }
.info-block p { font-size: 0.88rem; color: var(--text-muted); margin-bottom: 1rem; }

/* CTA Footer */
.cta-banner { background: var(--text-dark); color: #ffffff; padding: 3.5rem 0; text-align: center; }
.cta-banner h2 { font-size: 1.85rem; font-weight: 800; margin-bottom: 0.75rem; }
.cta-banner p { color: #94a3b8; margin-bottom: 1.75rem; }

/* Mobile Float Bar */
.mobile-bar {
  display: none; position: fixed; bottom: 0; left: 0; right: 0; z-index: 100;
  background: #ffffff; border-top: 1px solid var(--border-color); padding: 0.6rem 1rem;
  box-shadow: 0 -4px 12px rgba(0,0,0,0.08);
}
.mobile-bar-btns { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; }

@media (max-width: 640px) {
  .hero h1 { font-size: 1.7rem; }
  .mobile-bar { display: block; }
  body { padding-bottom: 4rem; }
}
`;

  const js = `
document.addEventListener('DOMContentLoaded', () => {
  // FAQ Accordion Toggle
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const q = item.querySelector('.faq-question');
    q.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      faqItems.forEach(i => i.classList.remove('active'));
      if (!isActive) item.classList.add('active');
    });
  });
});
`;

  const servicesHtml = data.services
    .map(
      (s) => `
      <div class="service-card">
        ${s.badge ? `<span class="service-badge">${s.badge}</span>` : ''}
        <h3>${s.title}</h3>
        <p>${s.desc}</p>
        ${s.price ? `<div class="service-price">${s.price}</div>` : ''}
      </div>`
    )
    .join('');

  const reviewsHtml = data.reviews
    .map(
      (r) => `
      <div class="review-card">
        <div class="review-stars">${'★'.repeat(r.rating)}</div>
        <p>"${r.text}"</p>
        <div class="review-author">${r.authorName}</div>
        <div class="review-time">${r.relativeTime} • Verified Google Review</div>
      </div>`
    )
    .join('');

  const faqsHtml = data.faqs
    .map(
      (f, idx) => `
      <div class="faq-item ${idx === 0 ? 'active' : ''}">
        <div class="faq-question">
          <span>${f.q}</span>
          <span class="faq-toggle">▼</span>
        </div>
        <div class="faq-answer">
          <p>${f.a}</p>
        </div>
      </div>`
    )
    .join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.businessName} — ${data.category} in ${data.city || 'Local'}</title>
  <meta name="description" content="${data.subheadline}">
  <style>${css}</style>
  <script type="application/ld+json">
  ${data.jsonLdSchema}
  </script>
</head>
<body>

  <!-- Sticky Header -->
  <header>
    <div class="container header-wrap">
      <div class="logo-title">${data.businessName}</div>
      <div class="header-actions">
        <a href="https://wa.me/${data.whatsapp}" class="btn btn-whatsapp" target="_blank" rel="noreferrer">
          💬 WhatsApp
        </a>
        <a href="tel:${data.phone}" class="btn btn-primary">
          📞 Call Now
        </a>
      </div>
    </div>
  </header>

  <!-- Hero Section -->
  <section class="hero">
    <div class="container">
      <div class="hero-badge">★ ${data.rating} Rating on Google Maps (${data.reviewCount}+ Reviews)</div>
      <h1>${data.headline}</h1>
      <p>${data.subheadline}</p>
      <div class="hero-btns">
        <a href="https://wa.me/${data.whatsapp}" class="btn btn-whatsapp btn-lg" target="_blank" rel="noreferrer">
          💬 ${data.theme.primaryCtaText}
        </a>
        <a href="tel:${data.phone}" class="btn btn-white btn-lg">
          📞 ${data.theme.secondaryCtaText}
        </a>
        <a href="${data.googleMapsUrl}" class="btn btn-outline btn-lg" target="_blank" rel="noreferrer">
          📍 Get Directions
        </a>
      </div>
    </div>
  </section>

  <!-- Trust Strip -->
  <div class="trust-strip">
    <div class="container">
      <div class="trust-grid">
        <div class="trust-item">
          <strong>${data.rating}★ Rating</strong>
          <span>Verified Google Maps Listing</span>
        </div>
        <div class="trust-item">
          <strong>${data.reviewCount}+ Reviews</strong>
          <span>Genuine Customer Feedback</span>
        </div>
        <div class="trust-item">
          <strong>100% Genuine</strong>
          <span>Authentic Local Quality</span>
        </div>
        <div class="trust-item">
          <strong>Fast Response</strong>
          <span>Direct Phone & WhatsApp Support</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Services Section -->
  <section id="services">
    <div class="container">
      <div class="section-head">
        <h2>${data.theme.servicesTitle}</h2>
        <p>${data.theme.servicesSubtitle}</p>
      </div>
      <div class="services-grid">
        ${servicesHtml}
      </div>
    </div>
  </section>

  <!-- Customer Reviews Section -->
  <section id="reviews" style="background-color: #f1f5f9;">
    <div class="container">
      <div class="section-head">
        <h2>What Our Customers Say</h2>
        <p>Real feedback from verified clients on Google Maps.</p>
      </div>
      <div class="reviews-grid">
        ${reviewsHtml}
      </div>
    </div>
  </section>

  <!-- FAQ Section -->
  <section id="faq">
    <div class="container">
      <div class="section-head">
        <h2>Frequently Asked Questions</h2>
        <p>Common questions about our ${data.category.toLowerCase()} services.</p>
      </div>
      <div class="faq-wrap">
        ${faqsHtml}
      </div>
    </div>
  </section>

  <!-- Location & Hours Section -->
  <section id="location" style="background-color: #f1f5f9;">
    <div class="container">
      <div class="location-card">
        <div class="info-block">
          <h4>📍 Store Address</h4>
          <p>${data.address}</p>
          <a href="${data.googleMapsUrl}" class="btn btn-primary" target="_blank" rel="noreferrer">
            Open in Google Maps
          </a>
        </div>
        <div class="info-block">
          <h4>🕒 Operating Hours</h4>
          <p>${data.workingHours}</p>
          <div style="font-size: 0.85rem; color: #16a34a; font-weight: 700;">
            ✓ Open Today for Inquiries & Visits
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Final CTA Banner -->
  <div class="cta-banner">
    <div class="container">
      <h2>Looking for ${data.category} in ${data.city || 'Your Area'}?</h2>
      <p>Connect directly with our team on WhatsApp or call for immediate assistance.</p>
      <div class="hero-btns">
        <a href="https://wa.me/${data.whatsapp}" class="btn btn-whatsapp" target="_blank" rel="noreferrer">
          💬 Chat on WhatsApp
        </a>
        <a href="tel:${data.phone}" class="btn btn-white">
          📞 Call ${data.phone}
        </a>
      </div>
    </div>
  </div>

  <!-- Mobile Sticky Action Bar -->
  <div class="mobile-bar">
    <div class="mobile-bar-btns">
      <a href="tel:${data.phone}" class="btn btn-primary">
        📞 Call Now
      </a>
      <a href="https://wa.me/${data.whatsapp}" class="btn btn-whatsapp" target="_blank" rel="noreferrer">
        💬 WhatsApp
      </a>
    </div>
  </div>

  <script>${js}</script>
</body>
</html>`;

  return { html, css, js };
}
