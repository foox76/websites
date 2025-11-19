// FIX: Add all necessary type definitions to make this a valid module and resolve import errors.

export enum Language {
  EN = 'en',
  AR = 'ar',
}

export enum View {
  Home = 'home',
  Services = 'services',
  About = 'about',
  Reviews = 'reviews',
  Treatments = 'treatments',
  Offers = 'offers',
  Contact = 'contact',
  // FIX: Add 'Gallery' to View enum to resolve usage in Header.tsx
  Gallery = 'gallery',
}

export interface TextContent {
  [key: string]: string;
}

export interface FAQ {
  questionKey: string;
  answerKey: string;
}

export interface Service {
  id: string;
  titleKey: string;
  descriptionKey: string;
  longDescriptionKey: string;
  imageUrl: string;
  benefits: string[];
  faqs: FAQ[];
}

export interface SpecialOffer {
  id: string;
  titleKey: string;
  newPrice: string;
  oldPrice: string;
  currencyKey: string;
  tagKey?: string;
  subtextKey?: string;
}

export interface Review {
  id: number;
  name: string;
  // FIX: Rename 'reviewKey' to 'quoteKey' to match usage in Testimonials.tsx
  quoteKey: string;
  rating: number;
  avatarUrl: string;
}

export interface GoogleReviews {
    averageRating: number;
    totalReviews: number;
    reviewsPageUrl: string;
}

export interface StaffMember {
  id: number;
  name: string;
  titleKey: string;
  bioKey: string;
  imageUrl: string;
}

export interface GalleryItem {
  id: number;
  beforeImageUrl: string;
  afterImageUrl: string;
  treatmentKey: string;
}

export interface TreatmentItem {
    id: number;
    serviceKey: string;
}

export interface TreatmentCategory {
    id: string;
    categoryKey: string;
    items: TreatmentItem[];
}

export interface LocationImage {
  imageUrl: string;
  altKey: string;
}

export interface PerformanceSummaryData {
  happyPatients: string;
  fiveStarReviews: string;
  yearsExperience: string;
  successfulProcedures: string;
}

export interface WhyChooseUsItem {
  id: number;
  icon: string;
  titleKey: string;
  descriptionKey: string;
}

// FIX: Add TechnologyItem interface to resolve import error in Technology.tsx
export interface TechnologyItem {
  id: number;
  nameKey: string;
  descriptionKey: string;
  imageUrl: string;
}

export interface ContentData {
  logoUrl: string;
  heroImageUrl: string;
  aboutBgUrl?: string;
  whyChooseUsBgUrl?: string;
  testimonialsBgUrl?: string;
  locationImages: LocationImage[];
  googleMapsUrl: string;
  googleMapsDirectionsUrl: string;
  services: Service[];
  // FIX: Rename 'reviews' to 'testimonials' to match usage in Testimonials.tsx
  testimonials: Review[];
  googleReviews: GoogleReviews;
  staff: StaffMember[];
  gallery: GalleryItem[];
  treatments: TreatmentCategory[];
  performanceSummary: PerformanceSummaryData;
  whyChooseUs: WhyChooseUsItem[];
  technology?: TechnologyItem[];
  specialOffers: SpecialOffer[];
  specialOffersEndDate: string;
}

export interface Data {
  en: TextContent;
  ar: TextContent;
  content: ContentData;
}

export interface LanguageContextType {
  lang: Language;
  toggleLang: () => void;
  text: TextContent;
  isRtl: boolean;
  content: ContentData;
  openWhatsappModal: (message: string, url: string) => void;
}