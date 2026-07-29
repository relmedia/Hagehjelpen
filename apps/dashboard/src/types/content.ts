export type Service = {
  id: string;
  title: string;
  slug: string;
  short_description: string | null;
  body: string | null;
  price_from: number | null;
  image_url: string | null;
  image_alt: string | null;
  order: number | null;
  active: boolean | null;
};

// A robot mower model we install and recommend in the mower advisor.
export type Mower = {
  id: string;
  title: string;
  slug: string;
  brand: string | null;
  max_area: number | null;
  max_slope: number | null;
  boundary: string | null;
  price: number | null;
  features: string[] | null;
  short_description: string | null;
  body: string | null;
  image_url: string | null;
  image_alt: string | null;
  order: number | null;
  active: boolean | null;
};

// One row in the installation price table on the website.
export type PriceTier = {
  id: string;
  title: string;
  min_area: number | null;
  max_area: number | null;
  price: number | null;
  includes: string[] | null;
  note: string | null;
  order: number | null;
  active: boolean | null;
};

export type CoverageZone = "kjerne" | "utvidet";

// Postcodes we serve, and what the trip costs outside the core area.
export type CoverageArea = {
  id: string;
  postal_code: string;
  place: string;
  zone: CoverageZone;
  travel_fee: number | null;
  note: string | null;
  active: boolean | null;
};

export type Testimonial = {
  id: string;
  name: string;
  place: string | null;
  rating: number | null;
  quote: string;
  service: string | null;
  published_at: string | null;
  order: number | null;
  published: boolean | null;
};

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  order: number | null;
  published: boolean | null;
};

export type Page = {
  id: string;
  title: string;
  slug: string;
  body: string | null;
};

export type Article = {
  id: string;
  title: string;
  slug: string;
  published_at: string | null;
  excerpt: string | null;
  cover_image_url: string | null;
  body: string | null;
};

export const COVERAGE_ZONE_LABELS: Record<CoverageZone, string> = {
  kjerne: "Kjerneområde",
  utvidet: "Utvidet område",
};

export type EmailSettings = {
  id: string;
  resend_api_key: string | null;
  email_from: string | null;
  lead_admin_email: string | null;
};

export const emptyEmailSettings: EmailSettings = {
  id: "singleton",
  resend_api_key: null,
  email_from: null,
  lead_admin_email: null,
};

export type SiteSettings = {
  id: string;
  title: string | null;
  tagline: string | null;
  hero_heading: string | null;
  hero_body: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  org_number: string | null;
  service_area: string | null;
  hourly_rate: number | null;
  facebook_url: string | null;
  instagram_url: string | null;
  meta_description: string | null;
};

export const emptySettings: SiteSettings = {
  id: "singleton",
  title: "",
  tagline: "",
  hero_heading: "",
  hero_body: "",
  phone: "",
  email: "",
  address: "",
  org_number: "",
  service_area: "",
  hourly_rate: null,
  facebook_url: "",
  instagram_url: "",
  meta_description: "",
};
