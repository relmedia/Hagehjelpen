import { createClient } from "@/lib/supabase/server";
import {
  type Article,
  type CoverageArea,
  emptyEmailSettings,
  emptySettings,
  type EmailSettings,
  type FaqItem,
  type Mower,
  type Page,
  type PriceTier,
  type Service,
  type SiteSettings,
  type Testimonial,
} from "@/types/content";

// select("*") everywhere so an optional column that hasn't been added to the
// database yet never breaks the whole query.
async function selectAll<T>(table: string): Promise<T[]> {
  const supabase = await createClient();
  const { data } = await supabase.from(table).select("*");
  return (data as T[] | null) ?? [];
}

async function selectOne<T>(table: string, id: string): Promise<T | null> {
  const supabase = await createClient();
  const { data } = await supabase.from(table).select("*").eq("id", id).maybeSingle();
  return (data as T | null) ?? null;
}

function byOrder<T extends { order: number | null }>(a: T, b: T): number {
  return (a.order ?? 0) - (b.order ?? 0);
}

function stringList(value: unknown): string[] | null {
  if (Array.isArray(value)) return value.map((entry) => String(entry)).filter(Boolean);
  if (typeof value === "string" && value.trim() !== "") {
    return value
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
  }
  return null;
}

// ---------------- Services (Tjenester) ----------------

export async function getServices(): Promise<Service[]> {
  return (await selectAll<Service>("services")).slice().sort(byOrder);
}

export async function getService(id: string): Promise<Service | null> {
  return selectOne<Service>("services", id);
}

// ---------------- Mowers (Robotklippere) ----------------

function normalizeMower(mower: Mower): Mower {
  return { ...mower, features: stringList(mower.features) };
}

export async function getMowers(): Promise<Mower[]> {
  return (await selectAll<Mower>("mowers")).map(normalizeMower).sort(byOrder);
}

export async function getMower(id: string): Promise<Mower | null> {
  const mower = await selectOne<Mower>("mowers", id);
  return mower ? normalizeMower(mower) : null;
}

// ---------------- Price tiers (Priser) ----------------

function normalizePriceTier(tier: PriceTier): PriceTier {
  return { ...tier, includes: stringList(tier.includes) };
}

export async function getPriceTiers(): Promise<PriceTier[]> {
  return (await selectAll<PriceTier>("price_tiers")).map(normalizePriceTier).sort(byOrder);
}

export async function getPriceTier(id: string): Promise<PriceTier | null> {
  const tier = await selectOne<PriceTier>("price_tiers", id);
  return tier ? normalizePriceTier(tier) : null;
}

// ---------------- Coverage areas (Dekningsområde) ----------------

export async function getCoverageAreas(): Promise<CoverageArea[]> {
  return (await selectAll<CoverageArea>("coverage_areas"))
    .slice()
    .sort((a, b) => a.postal_code_from - b.postal_code_from);
}

export async function getCoverageArea(id: string): Promise<CoverageArea | null> {
  return selectOne<CoverageArea>("coverage_areas", id);
}

// ---------------- Testimonials (Kundeomtaler) ----------------

export async function getTestimonials(): Promise<Testimonial[]> {
  return (await selectAll<Testimonial>("testimonials")).slice().sort(byOrder);
}

export async function getTestimonial(id: string): Promise<Testimonial | null> {
  return selectOne<Testimonial>("testimonials", id);
}

// ---------------- FAQ (Spørsmål og svar) ----------------

export async function getFaqItems(): Promise<FaqItem[]> {
  return (await selectAll<FaqItem>("faq_items")).slice().sort(byOrder);
}

export async function getFaqItem(id: string): Promise<FaqItem | null> {
  return selectOne<FaqItem>("faq_items", id);
}

// ---------------- Articles (Artikler) ----------------

export async function getArticles(): Promise<Article[]> {
  return (await selectAll<Article>("articles"))
    .slice()
    .sort((a, b) => (b.published_at ?? "").localeCompare(a.published_at ?? ""));
}

export async function getArticle(id: string): Promise<Article | null> {
  return selectOne<Article>("articles", id);
}

// ---------------- Pages (Sider) ----------------

export async function getPages(): Promise<Page[]> {
  return (await selectAll<Page>("pages")).slice().sort((a, b) => a.title.localeCompare(b.title, "nb"));
}

export async function getPage(id: string): Promise<Page | null> {
  return selectOne<Page>("pages", id);
}

// ---------------- Settings (Innstillinger) ----------------

export async function getSettings(): Promise<SiteSettings> {
  const supabase = await createClient();
  const { data } = await supabase.from("settings").select("*").limit(1).maybeSingle();
  return { ...emptySettings, ...(data ?? {}) } as SiteSettings;
}

export async function getEmailSettings(): Promise<EmailSettings> {
  const supabase = await createClient();
  const { data } = await supabase.from("email_settings").select("*").eq("id", "singleton").maybeSingle();
  return { ...emptyEmailSettings, ...(data ?? {}) } as EmailSettings;
}
