import { supabase, isSupabaseConfigured } from "./supabase";
import { PortfolioItem, MigrationSummary } from "@/types";

export const DEFAULT_PORTFOLIOS: PortfolioItem[] = [
  {
    id: "seed-1",
    url: "https://21st.dev",
    title: "21st.dev — The NPM for Design Engineers",
    domain: "21st.dev",
    category: "UI & Components",
    description: "Open-source community component library with copy-paste Tailwind and React micro-interactions.",
    image: "https://image.thum.io/get/width/800/crop/600/https://21st.dev",
    icon: "https://unavatar.io/21st.dev?fallback=https://icons.duckduckgo.com/ip3/21st.dev.ico",
    tags: ["UI Components", "Tailwind", "React"],
    pinned: true,
    published: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 7,
  },
  {
    id: "seed-2",
    url: "https://ui.aceternity.com",
    title: "Aceternity UI",
    domain: "ui.aceternity.com",
    category: "UI & Components",
    description: "Trending animated components built with Framer Motion and Tailwind CSS for modern landing pages.",
    image: "https://image.thum.io/get/width/800/crop/600/https://ui.aceternity.com",
    icon: "https://unavatar.io/ui.aceternity.com?fallback=https://icons.duckduckgo.com/ip3/ui.aceternity.com.ico",
    tags: ["UI Components", "Framer Motion", "Animations"],
    pinned: true,
    published: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 6,
  },
  {
    id: "seed-3",
    url: "https://bruno-simon.com",
    title: "Bruno Simon",
    domain: "bruno-simon.com",
    category: "Portfolios",
    description: "Interactive 3D physics portfolio built with Three.js and custom vehicle simulation.",
    image: "https://image.thum.io/get/width/800/crop/600/https://bruno-simon.com",
    icon: "https://unavatar.io/bruno-simon.com?fallback=https://icons.duckduckgo.com/ip3/bruno-simon.com.ico",
    tags: ["3D / WebGL", "Interactive", "Creative Dev"],
    pinned: true,
    published: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 5,
  },
  {
    id: "seed-4",
    url: "https://pavelstetkevych.com",
    title: "Pavel Stetkevych",
    domain: "pavelstetkevych.com",
    category: "Portfolios",
    description: "Editorial digital product design portfolio with refined typography and micro-interactions.",
    image: "https://image.thum.io/get/width/800/crop/600/https://pavelstetkevych.com",
    icon: "https://unavatar.io/pavelstetkevych.com?fallback=https://icons.duckduckgo.com/ip3/pavelstetkevych.com.ico",
    tags: ["Design", "Dark Mode", "Product"],
    pinned: false,
    published: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 4,
  },
  {
    id: "seed-5",
    url: "https://magicui.design",
    title: "Magic UI",
    domain: "magicui.design",
    category: "UI & Components",
    description: "UI library for design engineers offering 50+ animated components for landing pages.",
    image: "https://image.thum.io/get/width/800/crop/600/https://magicui.design",
    icon: "https://unavatar.io/magicui.design?fallback=https://icons.duckduckgo.com/ip3/magicui.design.ico",
    tags: ["UI Components", "React", "Motion"],
    pinned: false,
    published: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
  },
  {
    id: "seed-6",
    url: "https://siteinspire.com",
    title: "Siteinspire",
    domain: "siteinspire.com",
    category: "Inspiration",
    description: "Showcase of the finest web and interactive design from around the world.",
    image: "https://image.thum.io/get/width/800/crop/600/https://siteinspire.com",
    icon: "https://unavatar.io/siteinspire.com?fallback=https://icons.duckduckgo.com/ip3/siteinspire.com.ico",
    tags: ["Inspiration", "Web Design", "Showcase"],
    pinned: false,
    published: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
  },
  {
    id: "seed-7",
    url: "https://rauno.me",
    title: "Rauno Freiberg",
    domain: "rauno.me",
    category: "Portfolios",
    description: "Design Engineer at Vercel. Crafting invisible details and high-polish user interfaces.",
    image: "https://image.thum.io/get/width/800/crop/600/https://rauno.me",
    icon: "https://unavatar.io/rauno.me?fallback=https://icons.duckduckgo.com/ip3/rauno.me.ico",
    tags: ["Design Engineering", "Minimal", "Craft"],
    pinned: false,
    published: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 1,
  },
  {
    id: "seed-8",
    url: "https://www.realtimecolors.com",
    title: "Realtime Colors",
    domain: "realtimecolors.com",
    category: "Tools & Resources",
    description: "Visualize UI color palettes and typography in real-time on actual website layouts.",
    image: "https://image.thum.io/get/width/800/crop/600/https://www.realtimecolors.com",
    icon: "https://unavatar.io/realtimecolors.com?fallback=https://icons.duckduckgo.com/ip3/realtimecolors.com.ico",
    tags: ["Colors", "Design Tools", "Generators"],
    pinned: false,
    published: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 12,
  },
];

/**
 * Normalizes URL: trims, enforces https, strips trailing slashes
 */
export function normalizeUrl(rawUrl: string): string {
  let clean = rawUrl.trim();
  if (!/^https?:\/\//i.test(clean)) {
    clean = "https://" + clean;
  }
  return clean.replace(/\/+$/, "");
}

/**
 * Extracts clean domain hostname
 */
export function extractDomain(url: string): string {
  try {
    const parsed = new URL(normalizeUrl(url));
    return parsed.hostname.replace(/^www\./, "");
  } catch {
    return url.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0];
  }
}

/**
 * Transforms Supabase database row to frontend PortfolioItem
 */
function mapRowToItem(row: Record<string, unknown>): PortfolioItem {
  return {
    id: String(row.id),
    url: String(row.url || ""),
    title: String(row.title || "Untitled"),
    domain: String(row.domain || extractDomain(String(row.url || ""))),
    category: String(row.category || "Portfolios"),
    description: String(row.description || ""),
    image: String(row.image || ""),
    icon: String(row.icon || ""),
    tags: Array.isArray(row.tags) ? row.tags : [],
    pinned: Boolean(row.pinned),
    published: row.published !== undefined ? Boolean(row.published) : true,
    created_at: row.created_at ? String(row.created_at) : undefined,
    updated_at: row.updated_at ? String(row.updated_at) : undefined,
    createdAt: row.created_at ? new Date(String(row.created_at)).getTime() : Date.now(),
  };
}

/**
 * Public: Fetch all published portfolio items
 */
export async function fetchPublishedPortfolios(): Promise<PortfolioItem[]> {
  if (!isSupabaseConfigured()) {
    return DEFAULT_PORTFOLIOS;
  }

  const { data, error } = await supabase
    .from("portfolios")
    .select("*")
    .eq("published", true)
    .order("pinned", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching published portfolios:", error);
    throw error;
  }

  return (data || []).map(mapRowToItem);
}

/**
 * Admin: Fetch all portfolio items including unpublished drafts
 */
export async function fetchAdminPortfolios(): Promise<PortfolioItem[]> {
  if (!isSupabaseConfigured()) {
    return DEFAULT_PORTFOLIOS;
  }

  const { data, error } = await supabase
    .from("portfolios")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching admin portfolios:", error);
    throw error;
  }

  return (data || []).map(mapRowToItem);
}

/**
 * Admin: Create a new portfolio entry in Supabase
 */
export async function createPortfolio(item: Partial<PortfolioItem>): Promise<PortfolioItem> {
  if (!item.url) throw new Error("URL is required");
  const cleanUrl = normalizeUrl(item.url);
  const domain = item.domain || extractDomain(cleanUrl);

  const payload = {
    url: cleanUrl,
    title: item.title?.trim() || domain,
    domain,
    category: item.category || "Portfolios",
    description: item.description?.trim() || "",
    image: item.image?.trim() || `https://image.thum.io/get/width/800/crop/600/${encodeURIComponent(cleanUrl)}`,
    icon: item.icon?.trim() || `https://unavatar.io/${domain}?fallback=https://icons.duckduckgo.com/ip3/${domain}.ico`,
    tags: item.tags && item.tags.length > 0 ? item.tags : [item.category || "Portfolios"],
    pinned: Boolean(item.pinned),
    published: item.published !== undefined ? Boolean(item.published) : true,
  };

  const { data, error } = await supabase
    .from("portfolios")
    .insert([payload])
    .select()
    .single();

  if (error) {
    console.error("Error creating portfolio item:", error);
    throw error;
  }

  return mapRowToItem(data);
}

/**
 * Admin: Update an existing portfolio entry
 */
export async function updatePortfolio(
  id: string,
  updates: Partial<PortfolioItem>
): Promise<PortfolioItem> {
  const payload: Record<string, unknown> = {};

  if (updates.url !== undefined) {
    payload.url = normalizeUrl(updates.url);
    payload.domain = extractDomain(payload.url as string);
  }
  if (updates.title !== undefined) payload.title = updates.title.trim();
  if (updates.category !== undefined) payload.category = updates.category;
  if (updates.description !== undefined) payload.description = updates.description.trim();
  if (updates.image !== undefined) payload.image = updates.image.trim();
  if (updates.icon !== undefined) payload.icon = updates.icon.trim();
  if (updates.tags !== undefined) payload.tags = updates.tags;
  if (updates.pinned !== undefined) payload.pinned = Boolean(updates.pinned);
  if (updates.published !== undefined) payload.published = Boolean(updates.published);

  const { data, error } = await supabase
    .from("portfolios")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating portfolio item:", error);
    throw error;
  }

  return mapRowToItem(data);
}

/**
 * Admin: Delete a portfolio entry
 */
export async function deletePortfolio(id: string): Promise<void> {
  const { error } = await supabase.from("portfolios").delete().eq("id", id);
  if (error) {
    console.error("Error deleting portfolio item:", error);
    throw error;
  }
}

/**
 * Admin: Toggle pinned status
 */
export async function togglePin(id: string, nextPinned: boolean): Promise<void> {
  const { error } = await supabase
    .from("portfolios")
    .update({ pinned: nextPinned })
    .eq("id", id);

  if (error) {
    console.error("Error toggling pin status:", error);
    throw error;
  }
}

/**
 * Admin: Toggle published status
 */
export async function togglePublish(id: string, nextPublished: boolean): Promise<void> {
  const { error } = await supabase
    .from("portfolios")
    .update({ published: nextPublished })
    .eq("id", id);

  if (error) {
    console.error("Error toggling publish status:", error);
    throw error;
  }
}

/**
 * Safe Migration Utility: Transfers local items into Supabase
 * Handles deduplication against existing records in the database.
 */
export async function migrateLocalDataToSupabase(
  localItems: PortfolioItem[]
): Promise<MigrationSummary> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured. Please set environment variables first.");
  }

  const summary: MigrationSummary = {
    total: localItems.length,
    added: 0,
    skipped: 0,
    errors: 0,
  };

  if (!localItems || localItems.length === 0) {
    return summary;
  }

  // 1. Fetch all existing URLs from database
  const { data: existingRows, error: fetchErr } = await supabase
    .from("portfolios")
    .select("url");

  if (fetchErr) {
    console.error("Failed to read existing items during migration:", fetchErr);
    throw fetchErr;
  }

  const existingUrls = new Set(
    (existingRows || []).map((r) => normalizeUrl(r.url).toLowerCase())
  );

  // 2. Filter & format items to insert
  const toInsert = [];
  const batchSeen = new Set<string>();

  for (const item of localItems) {
    if (!item || !item.url) {
      summary.skipped++;
      continue;
    }

    const norm = normalizeUrl(item.url).toLowerCase();
    if (existingUrls.has(norm) || batchSeen.has(norm)) {
      summary.skipped++;
      continue;
    }

    batchSeen.add(norm);

    const domain = item.domain || extractDomain(item.url);
    toInsert.push({
      url: normalizeUrl(item.url),
      title: item.title || domain,
      domain,
      category: item.category || "Portfolios",
      description: item.description || "",
      image: item.image || `https://image.thum.io/get/width/800/crop/600/${encodeURIComponent(item.url)}`,
      icon: item.icon || `https://unavatar.io/${domain}?fallback=https://icons.duckduckgo.com/ip3/${domain}.ico`,
      tags: Array.isArray(item.tags) && item.tags.length > 0 ? item.tags : [item.category || "Portfolios"],
      pinned: Boolean(item.pinned),
      published: item.published !== undefined ? Boolean(item.published) : true,
    });
  }

  if (toInsert.length === 0) {
    return summary;
  }

  // 3. Batch insert (chunks of 50 to avoid payload limits)
  const chunkSize = 50;
  for (let i = 0; i < toInsert.length; i += chunkSize) {
    const chunk = toInsert.slice(i, i + chunkSize);
    const { data, error } = await supabase.from("portfolios").insert(chunk).select("id");

    if (error) {
      console.error("Error inserting migration chunk:", error);
      summary.errors += chunk.length;
    } else {
      summary.added += data ? data.length : chunk.length;
    }
  }

  return summary;
}

/**
 * Export portfolio records to a downloadable JSON file
 */
export function exportPortfoliosToJson(items: PortfolioItem[]): void {
  const dataStr =
    "data:text/json;charset=utf-8," +
    encodeURIComponent(JSON.stringify(items, null, 2));
  const dlAnchor = document.createElement("a");
  dlAnchor.setAttribute("href", dataStr);
  dlAnchor.setAttribute(
    "download",
    `creafolio_export_${new Date().toISOString().slice(0, 10)}.json`
  );
  document.body.appendChild(dlAnchor);
  dlAnchor.click();
  dlAnchor.remove();
}
