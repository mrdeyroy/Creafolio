import { supabase, isSupabaseConfigured } from "./supabase";
import { PortfolioItem, Collection, MigrationSummary } from "@/types";
import { validateAndSanitizeUrl } from "./url-security";

export function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "collection"
  );
}

export const DEFAULT_COLLECTIONS: Collection[] = [
  {
    id: "c1000000-0000-0000-0000-000000000001",
    name: "UI & Components",
    slug: "ui-components",
    description: "Component libraries, design kits, and interactive micro-interactions.",
    display_order: 1,
  },
  {
    id: "c1000000-0000-0000-0000-000000000002",
    name: "Landing Pages",
    slug: "landing-pages",
    description: "High-converting SaaS, marketing, and product landing pages.",
    display_order: 2,
  },
  {
    id: "c1000000-0000-0000-0000-000000000003",
    name: "Portfolios",
    slug: "portfolios",
    description: "Personal developer, designer, and studio portfolios showcasing exceptional craft.",
    display_order: 3,
  },
  {
    id: "c1000000-0000-0000-0000-000000000004",
    name: "Design Systems",
    slug: "design-systems",
    description: "Comprehensive design language and documentation systems.",
    display_order: 4,
  },
  {
    id: "c1000000-0000-0000-0000-000000000005",
    name: "Animations & Interactions",
    slug: "animations-interactions",
    description: "Motion design, transitions, and polished interactive experiences.",
    display_order: 5,
  },
  {
    id: "c1000000-0000-0000-0000-000000000006",
    name: "3D & WebGL",
    slug: "3d-webgl",
    description: "Experimental WebGL, Three.js, shaders, and immersive 3D experiences.",
    display_order: 6,
  },
  {
    id: "c1000000-0000-0000-0000-000000000007",
    name: "AI Tools",
    slug: "ai-tools",
    description: "AI-powered creative tools, generative UI, and assistive design utilities.",
    display_order: 7,
  },
  {
    id: "c1000000-0000-0000-0000-000000000008",
    name: "Developer Tools",
    slug: "developer-tools",
    description: "Code generators, developer utilities, inspection, and productivity tools.",
    display_order: 8,
  },
  {
    id: "c1000000-0000-0000-0000-000000000009",
    name: "Fonts, Icons & Assets",
    slug: "fonts-icons-assets",
    description: "Icon libraries, curated typography, illustrations, and digital design assets.",
    display_order: 9,
  },
  {
    id: "c1000000-0000-0000-0000-000000000010",
    name: "Inspiration & Experiments",
    slug: "inspiration-experiments",
    description: "Creative coding experiments, visual galleries, and award-winning showcases.",
    display_order: 10,
  },
];

export const DEFAULT_PORTFOLIOS: PortfolioItem[] = [
  {
    id: "seed-1",
    url: "https://21st.dev",
    title: "21st.dev — The NPM for Design Engineers",
    domain: "21st.dev",
    collections: [DEFAULT_COLLECTIONS[0], DEFAULT_COLLECTIONS[7]], // UI & Components, Developer Tools
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
    collections: [
      DEFAULT_COLLECTIONS[0],
      DEFAULT_COLLECTIONS[1],
      DEFAULT_COLLECTIONS[3],
      DEFAULT_COLLECTIONS[4],
    ], // UI & Components, Landing Pages, Design Systems, Animations & Interactions
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
    collections: [
      DEFAULT_COLLECTIONS[2],
      DEFAULT_COLLECTIONS[5],
      DEFAULT_COLLECTIONS[9],
    ], // Portfolios, 3D & WebGL, Inspiration & Experiments
    description: "Interactive 3D physics portfolio built with Three.js and custom vehicle simulation.",
    image: "https://image.thum.io/get/width/800/crop/600/https://bruno-simon.com",
    video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    previewType: "video",
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
    collections: [DEFAULT_COLLECTIONS[2]], // Portfolios
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
    collections: [
      DEFAULT_COLLECTIONS[0],
      DEFAULT_COLLECTIONS[1],
      DEFAULT_COLLECTIONS[4],
    ], // UI & Components, Landing Pages, Animations & Interactions
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
    collections: [DEFAULT_COLLECTIONS[9]], // Inspiration & Experiments
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
    collections: [
      DEFAULT_COLLECTIONS[2],
      DEFAULT_COLLECTIONS[3],
      DEFAULT_COLLECTIONS[4],
    ], // Portfolios, Design Systems, Animations & Interactions
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
    collections: [DEFAULT_COLLECTIONS[7], DEFAULT_COLLECTIONS[8]], // Developer Tools, Fonts, Icons & Assets
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
 * Intelligently guesses one or more collections from URL, title, description, and tags
 */
export function guessCollections(
  url: string,
  title?: string,
  description?: string,
  tags?: string[]
): string[] {
  const text = `${url} ${title || ""} ${description || ""} ${(tags || []).join(" ")}`.toLowerCase();
  const matchedNames: string[] = [];

  if (/\b(ai|gpt|llm|copilot|openai|claude|v0|midjourney|generative|prompt)\b/.test(text)) {
    matchedNames.push("AI Tools");
  }
  if (/\b(component|components|ui|shadcn|radix|tailwind|chakra|mantine|daisyui|21st\.dev)\b/.test(text)) {
    matchedNames.push("UI & Components");
  }
  if (/\b(landing|saas|marketing page|homepage|conversion)\b/.test(text)) {
    matchedNames.push("Landing Pages");
  }
  if (/\b(design system|styleguide|brand guideline|token|tokens)\b/.test(text)) {
    matchedNames.push("Design Systems");
  }
  if (/\b(animation|animations|motion|framer|framer-motion|gsap|transitions|micro-interaction)\b/.test(text)) {
    matchedNames.push("Animations & Interactions");
  }
  if (/\b(3d|webgl|three\.?js|shader|shaders|canvas|spline|physics)\b/.test(text)) {
    matchedNames.push("3D & WebGL");
  }
  if (/\b(font|fonts|typography|type|icon|icons|svg|glyph|assets|illustrations|figma)\b/.test(text)) {
    matchedNames.push("Fonts, Icons & Assets");
  }
  if (/\b(tool|tools|generator|devtools|utility|utilities|palette|regex|json|formatter|inspect|npm)\b/.test(text)) {
    matchedNames.push("Developer Tools");
  }
  if (/\b(portfolio|portfolios|personal site|cv|resume|developer folio|designer folio)\b/.test(text)) {
    matchedNames.push("Portfolios");
  }
  if (/\b(inspiration|showcase|gallery|experiments|award|awwwards|fwa|siteinspire|creative)\b/.test(text)) {
    matchedNames.push("Inspiration & Experiments");
  }

  if (matchedNames.length === 0) {
    if (text.includes("folio") || text.includes(".me") || text.includes("personal")) {
      matchedNames.push("Portfolios");
    } else {
      matchedNames.push("Inspiration & Experiments");
    }
  }

  return matchedNames;
}

/**
 * Transforms Supabase database row to frontend PortfolioItem
 */
function mapRowToItem(row: Record<string, unknown>, knownCollections: Collection[] = DEFAULT_COLLECTIONS): PortfolioItem {
  // Extract collections from many-to-many join or fallback
  const rawCollections: Collection[] = [];

  if (Array.isArray(row.portfolio_collections)) {
    for (const pc of row.portfolio_collections) {
      const col = (pc as { collection?: Record<string, unknown> })?.collection;
      if (col && typeof col === "object") {
        rawCollections.push({
          id: String(col.id),
          name: String(col.name),
          slug: String(col.slug || slugify(String(col.name))),
          description: col.description ? String(col.description) : "",
          display_order: typeof col.display_order === "number" ? col.display_order : 0,
        });
      }
    }
  } else if (Array.isArray(row.collections)) {
    for (const c of row.collections) {
      if (typeof c === "object" && c !== null) {
        const col = c as Record<string, unknown>;
        rawCollections.push({
          id: String(col.id),
          name: String(col.name),
          slug: String(col.slug || slugify(String(col.name))),
          description: col.description ? String(col.description) : "",
          display_order: typeof col.display_order === "number" ? col.display_order : 0,
        });
      }
    }
  }

  // Remap any legacy collection names into the 10 standard collections
  const resolvedCollections: Collection[] = [];
  const addCollectionByName = (targetName: string) => {
    const found = knownCollections.find(
      (c) => c.name.toLowerCase() === targetName.toLowerCase() || c.slug === slugify(targetName)
    );
    if (found && !resolvedCollections.some((rc) => rc.name === found.name)) {
      resolvedCollections.push(found);
    }
  };

  for (const rc of rawCollections) {
    const rawName = rc.name.trim();
    if (rawName.toLowerCase() === "tools & resources") {
      // Reassign to appropriate tool collections based on item fields
      const guessed = guessCollections(
        String(row.url || ""),
        String(row.title || ""),
        String(row.description || ""),
        Array.isArray(row.tags) ? (row.tags as string[]) : []
      );
      const filtered = guessed.filter((g) =>
        ["AI Tools", "Developer Tools", "Fonts, Icons & Assets", "Inspiration & Experiments"].includes(g)
      );
      if (filtered.length > 0) {
        filtered.forEach(addCollectionByName);
      } else {
        addCollectionByName("Developer Tools");
      }
    } else if (rawName.toLowerCase() === "creative websites") {
      addCollectionByName("3D & WebGL");
      addCollectionByName("Inspiration & Experiments");
    } else if (rawName.toLowerCase() === "inspiration") {
      addCollectionByName("Inspiration & Experiments");
    } else {
      const match = knownCollections.find(
        (kc) => kc.name.toLowerCase() === rawName.toLowerCase() || kc.slug === slugify(rawName)
      );
      if (match) {
        if (!resolvedCollections.some((c) => c.name === match.name)) {
          resolvedCollections.push(match);
        }
      } else {
        resolvedCollections.push(rc);
      }
    }
  }

  // Backward compatibility: if row has legacy "category" and no junction entries yet
  if (resolvedCollections.length === 0 && row.category) {
    const catName = String(row.category).trim();
    if (catName) {
      if (catName.toLowerCase() === "tools & resources") {
        addCollectionByName("Developer Tools");
      } else if (catName.toLowerCase() === "inspiration") {
        addCollectionByName("Inspiration & Experiments");
      } else if (catName.toLowerCase() === "creative websites") {
        addCollectionByName("3D & WebGL");
      } else {
        addCollectionByName(catName);
      }
    }
  }

  // If still empty, assign default Portfolios or Inspiration & Experiments
  if (resolvedCollections.length === 0) {
    resolvedCollections.push(DEFAULT_COLLECTIONS[2]); // Portfolios
  }

  return {
    id: String(row.id),
    url: String(row.url || ""),
    title: String(row.title || "Untitled"),
    domain: String(row.domain || extractDomain(String(row.url || ""))),
    collections: resolvedCollections,
    collection_ids: resolvedCollections.map((c) => c.id),
    description: String(row.description || ""),
    image: String(row.image || ""),
    video: row.video ? String(row.video) : null,
    previewType:
      row.preview_type === "video" || row.previewType === "video" ? "video" : "image",
    icon: String(row.icon || ""),
    tags: Array.isArray(row.tags) ? row.tags : [],
    pinned: Boolean(row.pinned),
    published: row.published !== undefined ? Boolean(row.published) : true,
    created_at: row.created_at ? String(row.created_at) : undefined,
    updated_at: row.updated_at ? String(row.updated_at) : undefined,
    createdAt: row.created_at ? new Date(String(row.created_at)).getTime() : Date.now(),
  };
}

// ============================================================================
// COLLECTIONS API
// ============================================================================

/**
 * Fetch all collections, ordered by display_order then name
 */
export async function fetchCollections(): Promise<Collection[]> {
  if (!isSupabaseConfigured()) {
    return DEFAULT_COLLECTIONS;
  }

  const { data, error } = await supabase
    .from("collections")
    .select("*")
    .order("display_order", { ascending: true })
    .order("name", { ascending: true });

  if (error || !data || data.length === 0) {
    return DEFAULT_COLLECTIONS;
  }

  // Filter out removed legacy collections: "Tools & Resources", "Creative Websites"
  // and rename "Inspiration" to "Inspiration & Experiments"
  const result: Collection[] = [];
  const seenSlugs = new Set<string>();

  for (const c of data) {
    const rawName = String(c.name).trim();
    if (
      rawName.toLowerCase() === "tools & resources" ||
      rawName.toLowerCase() === "creative websites"
    ) {
      continue; // Skip deprecated collection names
    }

    let name = rawName;
    let slug = String(c.slug || slugify(name));
    if (name.toLowerCase() === "inspiration") {
      name = "Inspiration & Experiments";
      slug = "inspiration-experiments";
    }

    if (!seenSlugs.has(slug)) {
      seenSlugs.add(slug);
      result.push({
        id: String(c.id),
        name,
        slug,
        description: c.description ? String(c.description) : "",
        display_order: typeof c.display_order === "number" ? c.display_order : 0,
        created_at: c.created_at ? String(c.created_at) : undefined,
        updated_at: c.updated_at ? String(c.updated_at) : undefined,
      });
    }
  }

  // Ensure all 10 standard collections are present in the list
  for (const std of DEFAULT_COLLECTIONS) {
    if (!seenSlugs.has(std.slug)) {
      seenSlugs.add(std.slug);
      result.push(std);
    }
  }

  return result.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
}

/**
 * Safely normalizes Supabase collections and resource links to the exact 10 standard collections.
 * - Reassigns resources from removed collections (e.g. Tools & Resources -> AI Tools, Developer Tools, Fonts/Icons, etc.)
 * - Renames Inspiration -> Inspiration & Experiments
 * - Removes deprecated collections
 * - Preserves every single resource without duplication or data loss
 */
export async function normalizeStandardCollectionsInSupabase(): Promise<{
  updated: number;
  removed: number;
}> {
  if (!isSupabaseConfigured()) {
    return { updated: 0, removed: 0 };
  }

  let updatedCount = 0;
  let removedCount = 0;

  // 1. Fetch current collections from Supabase
  const { data: dbCols, error } = await supabase.from("collections").select("*");
  if (error || !dbCols) return { updated: 0, removed: 0 };

  // 2. Ensure all 10 standard collections exist in the collections table
  const colMap = new Map<string, Collection>();
  for (const std of DEFAULT_COLLECTIONS) {
    const existing = dbCols.find(
      (c) => c.name.toLowerCase() === std.name.toLowerCase()
    );
    if (existing) {
      await supabase
        .from("collections")
        .update({
          slug: std.slug,
          description: std.description,
          display_order: std.display_order,
        })
        .eq("id", existing.id);

      colMap.set(std.name.toLowerCase(), {
        id: existing.id,
        name: existing.name,
        slug: std.slug,
        description: std.description,
        display_order: std.display_order,
      });
    } else {
      const { data: inserted } = await supabase
        .from("collections")
        .insert({
          name: std.name,
          slug: std.slug,
          description: std.description,
          display_order: std.display_order,
        })
        .select()
        .single();
      if (inserted) {
        colMap.set(std.name.toLowerCase(), {
          id: inserted.id,
          name: inserted.name,
          slug: inserted.slug,
          description: inserted.description,
          display_order: inserted.display_order,
        });
      }
    }
  }

  // 3. Process non-standard collections
  const standardNames = new Set(DEFAULT_COLLECTIONS.map((c) => c.name.toLowerCase()));
  const deprecatedCols = dbCols.filter(
    (c) => !standardNames.has(c.name.toLowerCase().trim())
  );

  for (const oldCol of deprecatedCols) {
    // Fetch all resources linked to this deprecated collection
    const { data: links } = await supabase
      .from("portfolio_collections")
      .select("portfolio_id")
      .eq("collection_id", oldCol.id);

    if (links && links.length > 0) {
      for (const link of links) {
        // Fetch resource details
        const { data: item } = await supabase
          .from("portfolio_items")
          .select("*")
          .eq("id", link.portfolio_id)
          .single();

        let destNames: string[] = [];
        if (oldCol.name.toLowerCase() === "inspiration") {
          destNames = ["Inspiration & Experiments"];
        } else if (oldCol.name.toLowerCase() === "creative websites") {
          destNames = ["3D & WebGL", "Inspiration & Experiments"];
        } else if (oldCol.name.toLowerCase() === "tools & resources") {
          if (item) {
            const guessed = guessCollections(
              item.url || "",
              item.title || "",
              item.description || "",
              item.tags || []
            );
            destNames = guessed.filter((g) =>
              [
                "AI Tools",
                "Developer Tools",
                "Fonts, Icons & Assets",
                "Inspiration & Experiments",
              ].includes(g)
            );
          }
          if (destNames.length === 0) destNames = ["Developer Tools"];
        } else {
          if (item) {
            destNames = guessCollections(
              item.url || "",
              item.title || "",
              item.description || "",
              item.tags || []
            );
          }
          if (destNames.length === 0) destNames = ["Inspiration & Experiments"];
        }

        // Link item to new destination collections
        for (const dest of destNames) {
          const targetCol = colMap.get(dest.toLowerCase());
          if (targetCol) {
            await supabase
              .from("portfolio_collections")
              .insert({
                portfolio_id: link.portfolio_id,
                collection_id: targetCol.id,
              })
              .select();
            updatedCount++;
          }
        }
      }
    }

    // Clean up junction entries and delete old collection
    await supabase.from("portfolio_collections").delete().eq("collection_id", oldCol.id);
    await supabase.from("collections").delete().eq("id", oldCol.id);
    removedCount++;
  }

  return { updated: updatedCount, removed: removedCount };
}

/**
 * Create a new collection
 */
export async function createCollection(
  name: string,
  description?: string,
  display_order?: number
): Promise<Collection> {
  const cleanName = name.trim();
  if (!cleanName) throw new Error("Collection name is required");
  const cleanSlug = slugify(cleanName);

  if (!isSupabaseConfigured()) {
    const newCol: Collection = {
      id: `local-col-${Date.now()}`,
      name: cleanName,
      slug: cleanSlug,
      description: description?.trim() || "",
      display_order: display_order || 99,
      created_at: new Date().toISOString(),
    };
    return newCol;
  }

  const payload = {
    name: cleanName,
    slug: cleanSlug,
    description: description?.trim() || "",
    display_order: display_order || 99,
  };

  const { data, error } = await supabase
    .from("collections")
    .insert([payload])
    .select()
    .single();

  if (error) {
    console.error("Error creating collection:", error);
    throw error;
  }

  return {
    id: String(data.id),
    name: String(data.name),
    slug: String(data.slug),
    description: data.description ? String(data.description) : "",
    display_order: data.display_order || 0,
    created_at: data.created_at ? String(data.created_at) : undefined,
    updated_at: data.updated_at ? String(data.updated_at) : undefined,
  };
}

/**
 * Update an existing collection
 */
export async function updateCollection(
  id: string,
  updates: Partial<Collection>
): Promise<Collection> {
  const payload: Record<string, unknown> = {};

  if (updates.name !== undefined) {
    const cleanName = updates.name.trim();
    payload.name = cleanName;
    payload.slug = slugify(cleanName);
  }
  if (updates.description !== undefined) {
    payload.description = updates.description.trim();
  }
  if (updates.display_order !== undefined) {
    payload.display_order = updates.display_order;
  }

  if (!isSupabaseConfigured()) {
    return {
      id,
      name: updates.name || "Collection",
      slug: slugify(updates.name || "Collection"),
      description: updates.description || "",
      display_order: updates.display_order || 0,
    };
  }

  const { data, error } = await supabase
    .from("collections")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating collection:", error);
    throw error;
  }

  return {
    id: String(data.id),
    name: String(data.name),
    slug: String(data.slug),
    description: data.description ? String(data.description) : "",
    display_order: data.display_order || 0,
    created_at: data.created_at ? String(data.created_at) : undefined,
    updated_at: data.updated_at ? String(data.updated_at) : undefined,
  };
}

/**
 * Delete a collection
 */
export async function deleteCollection(id: string): Promise<void> {
  if (!isSupabaseConfigured()) return;

  const { error } = await supabase.from("collections").delete().eq("id", id);
  if (error) {
    console.error("Error deleting collection:", error);
    throw error;
  }
}

/**
 * Reorder collections by array of IDs in intended sequence
 */
export async function reorderCollections(orderedIds: string[]): Promise<void> {
  if (!isSupabaseConfigured()) return;

  for (let index = 0; index < orderedIds.length; index++) {
    const id = orderedIds[index];
    await supabase
      .from("collections")
      .update({ display_order: index + 1 })
      .eq("id", id);
  }
}

// ============================================================================
// PORTFOLIO ITEMS API
// ============================================================================

/**
 * Public: Fetch all published portfolio items with their collections
 */
export async function fetchPublishedPortfolios(): Promise<PortfolioItem[]> {
  if (!isSupabaseConfigured()) {
    return DEFAULT_PORTFOLIOS;
  }

  // Attempt query with many-to-many collections join from portfolio_items
  const { data, error } = await supabase
    .from("portfolio_items")
    .select(`
      *,
      portfolio_collections (
        collection:collections (
          id,
          name,
          slug,
          description,
          display_order
        )
      )
    `)
    .eq("published", true)
    .order("pinned", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    // If portfolio_items relation doesn't exist yet, fallback to legacy portfolios table
    console.warn("Notice: Fetching from legacy portfolios table fallback:", error.message);
    const { data: legacyData, error: legacyErr } = await supabase
      .from("portfolios")
      .select("*")
      .eq("published", true)
      .order("pinned", { ascending: false })
      .order("created_at", { ascending: false });

    if (legacyErr) {
      console.error("Error fetching published portfolios:", legacyErr);
      return DEFAULT_PORTFOLIOS;
    }

    return (legacyData || []).map((row) => mapRowToItem(row));
  }

  return (data || []).map((row) => mapRowToItem(row));
}

/**
 * Admin: Fetch all portfolio items including unpublished drafts
 */
export async function fetchAdminPortfolios(): Promise<PortfolioItem[]> {
  if (!isSupabaseConfigured()) {
    return DEFAULT_PORTFOLIOS;
  }

  const { data, error } = await supabase
    .from("portfolio_items")
    .select(`
      *,
      portfolio_collections (
        collection:collections (
          id,
          name,
          slug,
          description,
          display_order
        )
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.warn("Notice: Fetching admin portfolios from legacy table fallback:", error.message);
    const { data: legacyData, error: legacyErr } = await supabase
      .from("portfolios")
      .select("*")
      .order("created_at", { ascending: false });

    if (legacyErr) {
      console.error("Error fetching admin portfolios:", legacyErr);
      return DEFAULT_PORTFOLIOS;
    }

    return (legacyData || []).map((row) => mapRowToItem(row));
  }

  return (data || []).map((row) => mapRowToItem(row));
}

/**
 * Admin: Create a new portfolio entry and associate collections
 */
export async function createPortfolio(
  item: Partial<PortfolioItem>,
  collectionIds: string[] = []
): Promise<PortfolioItem> {
  if (!item.url) throw new Error("A website URL is required.");
  const validated = validateAndSanitizeUrl(item.url);
  if (!validated.isValid || !validated.sanitizedUrl) {
    throw new Error(validated.error || "Please provide a valid website address.");
  }
  const cleanUrl = validated.sanitizedUrl;
  const domain = item.domain || validated.domain || extractDomain(cleanUrl);

  const previewType = item.previewType || (item.video?.trim() ? "video" : "image");
  const videoUrl = item.video?.trim() || null;

  const payload: Record<string, unknown> = {
    url: cleanUrl,
    title: item.title?.trim() || domain,
    domain,
    description: item.description?.trim() || "",
    image: item.image?.trim() || `https://image.thum.io/get/width/800/crop/600/${encodeURIComponent(cleanUrl)}`,
    video: videoUrl,
    preview_type: previewType,
    icon: item.icon?.trim() || `https://unavatar.io/${domain}?fallback=https://icons.duckduckgo.com/ip3/${domain}.ico`,
    tags: item.tags && item.tags.length > 0 ? item.tags : ["Design"],
    pinned: Boolean(item.pinned),
    published: item.published !== undefined ? Boolean(item.published) : true,
  };

  if (!isSupabaseConfigured()) {
    const newItem: PortfolioItem = {
      id: `local-${Date.now()}`,
      url: cleanUrl,
      title: item.title?.trim() || domain,
      domain,
      description: item.description?.trim() || "",
      image: item.image?.trim() || `https://image.thum.io/get/width/800/crop/600/${encodeURIComponent(cleanUrl)}`,
      video: videoUrl,
      previewType,
      icon: item.icon?.trim() || `https://unavatar.io/${domain}?fallback=https://icons.duckduckgo.com/ip3/${domain}.ico`,
      tags: item.tags && item.tags.length > 0 ? item.tags : ["Design"],
      pinned: Boolean(item.pinned),
      published: item.published !== undefined ? Boolean(item.published) : true,
      collections: DEFAULT_COLLECTIONS.filter((c) => collectionIds.includes(c.id)),
      collection_ids: collectionIds,
      createdAt: Date.now(),
    };
    return newItem;
  }

  // 1. Insert into portfolio_items (or fallback portfolios)
  let insertedRow: Record<string, unknown> | null = null;
  let { data: itemData, error: itemError } = await supabase
    .from("portfolio_items")
    .insert([payload])
    .select()
    .single();

  if (itemError) {
    // Check if error is duplicate URL
    if (
      (itemError as { code?: string }).code === "23505" ||
      itemError.message?.toLowerCase().includes("unique") ||
      itemError.message?.toLowerCase().includes("duplicate")
    ) {
      throw new Error("This resource URL has already been added to Creafolio.");
    }

    // If the error was due to missing video/preview_type columns in unmigrated database, retry without them
    if (itemError.message?.includes("video") || itemError.message?.includes("preview_type")) {
      const fallbackPayload = { ...payload };
      delete fallbackPayload.video;
      delete fallbackPayload.preview_type;
      const retry = await supabase.from("portfolio_items").insert([fallbackPayload]).select().single();
      itemData = retry.data;
      itemError = retry.error;

      if (
        itemError &&
        ((itemError as { code?: string }).code === "23505" ||
          itemError.message?.toLowerCase().includes("unique") ||
          itemError.message?.toLowerCase().includes("duplicate"))
      ) {
        throw new Error("This resource URL has already been added to Creafolio.");
      }
    }
  }

  if (itemError) {
    // Attempt fallback to portfolios table
    const legacyPayload = { ...payload };
    delete legacyPayload.video;
    delete legacyPayload.preview_type;
    const { data: legacyData, error: legacyErr } = await supabase
      .from("portfolios")
      .insert([legacyPayload])
      .select()
      .single();

    if (legacyErr) {
      if (
        (legacyErr as { code?: string }).code === "23505" ||
        legacyErr.message?.toLowerCase().includes("unique") ||
        legacyErr.message?.toLowerCase().includes("duplicate")
      ) {
        throw new Error("This resource URL has already been added to Creafolio.");
      }
      console.error("Error creating portfolio item:", legacyErr);
      throw legacyErr;
    }
    insertedRow = legacyData;
  } else {
    insertedRow = itemData;
  }

  const itemId = String(insertedRow?.id);

  // 2. Insert into portfolio_collections junction table
  if (collectionIds.length > 0) {
    const junctionRows = collectionIds.map((cid) => ({
      portfolio_id: itemId,
      collection_id: cid,
    }));

    const { error: junctionErr } = await supabase
      .from("portfolio_collections")
      .insert(junctionRows);

    if (junctionErr) {
      console.warn("Could not insert portfolio_collections junction rows:", junctionErr.message);
    }
  }

  // Refetch complete item with collections
  const { data: refetched } = await supabase
    .from("portfolio_items")
    .select(`
      *,
      portfolio_collections (
        collection:collections (
          id,
          name,
          slug,
          description,
          display_order
        )
      )
    `)
    .eq("id", itemId)
    .single();

  if (refetched) {
    return mapRowToItem(refetched);
  }

  return mapRowToItem(insertedRow || {});
}

/**
 * Admin: Update an existing portfolio entry and sync collections
 */
export async function updatePortfolio(
  id: string,
  updates: Partial<PortfolioItem>,
  collectionIds?: string[]
): Promise<PortfolioItem> {
  const payload: Record<string, unknown> = {};

  if (updates.url !== undefined) {
    const validated = validateAndSanitizeUrl(updates.url);
    if (!validated.isValid || !validated.sanitizedUrl) {
      throw new Error(validated.error || "Please provide a valid website address.");
    }
    payload.url = validated.sanitizedUrl;
    payload.domain = validated.domain || extractDomain(payload.url as string);
  }
  if (updates.title !== undefined) payload.title = updates.title.trim();
  if (updates.description !== undefined) payload.description = updates.description.trim();
  if (updates.image !== undefined) payload.image = updates.image.trim();
  if (updates.video !== undefined) payload.video = updates.video?.trim() || null;
  if (updates.previewType !== undefined) payload.preview_type = updates.previewType;
  if (updates.icon !== undefined) payload.icon = updates.icon.trim();
  if (updates.tags !== undefined) payload.tags = updates.tags;
  if (updates.pinned !== undefined) payload.pinned = Boolean(updates.pinned);
  if (updates.published !== undefined) payload.published = Boolean(updates.published);

  if (!isSupabaseConfigured()) {
    return {
      id,
      url: (payload.url as string) || updates.url || "",
      title: (payload.title as string) || updates.title || "",
      domain: (payload.domain as string) || updates.domain || "",
      collections: DEFAULT_COLLECTIONS.filter((c) => (collectionIds || []).includes(c.id)),
      collection_ids: collectionIds || [],
      description: (payload.description as string) || updates.description || "",
      image: (payload.image as string) || updates.image || "",
      video: payload.video !== undefined ? (payload.video as string | null) : (updates.video ?? null),
      previewType:
        payload.preview_type !== undefined
          ? (payload.preview_type as "image" | "video")
          : (updates.previewType ?? "image"),
      icon: (payload.icon as string) || updates.icon || "",
      tags: (payload.tags as string[]) || updates.tags || [],
      pinned: Boolean(payload.pinned ?? updates.pinned),
      published: Boolean(payload.published ?? updates.published ?? true),
      updated_at: new Date().toISOString(),
    };
  }

  // 1. Update resource row in portfolio_items or portfolios
  let updatedRow: Record<string, unknown> | null = null;
  let { data: itemData, error: itemError } = await supabase
    .from("portfolio_items")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (itemError) {
    if (
      (itemError as { code?: string }).code === "23505" ||
      itemError.message?.toLowerCase().includes("unique") ||
      itemError.message?.toLowerCase().includes("duplicate")
    ) {
      throw new Error("Another resource with this URL already exists in Creafolio.");
    }

    if (itemError.message?.includes("video") || itemError.message?.includes("preview_type")) {
      const fallbackPayload = { ...payload };
      delete fallbackPayload.video;
      delete fallbackPayload.preview_type;
      const retry = await supabase
        .from("portfolio_items")
        .update(fallbackPayload)
        .eq("id", id)
        .select()
        .single();
      itemData = retry.data;
      itemError = retry.error;

      if (
        itemError &&
        ((itemError as { code?: string }).code === "23505" ||
          itemError.message?.toLowerCase().includes("unique") ||
          itemError.message?.toLowerCase().includes("duplicate"))
      ) {
        throw new Error("Another resource with this URL already exists in Creafolio.");
      }
    }
  }

  if (itemError) {
    const legacyPayload = { ...payload };
    delete legacyPayload.video;
    delete legacyPayload.preview_type;
    const { data: legacyData, error: legacyErr } = await supabase
      .from("portfolios")
      .update(legacyPayload)
      .eq("id", id)
      .select()
      .single();

    if (legacyErr) {
      if (
        (legacyErr as { code?: string }).code === "23505" ||
        legacyErr.message?.toLowerCase().includes("unique") ||
        legacyErr.message?.toLowerCase().includes("duplicate")
      ) {
        throw new Error("Another resource with this URL already exists in Creafolio.");
      }
      console.error("Error updating portfolio item:", legacyErr);
      throw legacyErr;
    }
    updatedRow = legacyData;
  } else {
    updatedRow = itemData;
  }

  // 2. Sync collection relations if collectionIds provided
  if (collectionIds !== undefined) {
    try {
      // Remove previous relations
      await supabase.from("portfolio_collections").delete().eq("portfolio_id", id);

      // Insert new relations
      if (collectionIds.length > 0) {
        const rows = collectionIds.map((cid) => ({
          portfolio_id: id,
          collection_id: cid,
        }));
        await supabase.from("portfolio_collections").insert(rows);
      }
    } catch (relErr) {
      console.warn("Could not sync portfolio_collections junction table:", relErr);
    }
  }

  // 3. Return full item with collections
  const { data: refetched } = await supabase
    .from("portfolio_items")
    .select(`
      *,
      portfolio_collections (
        collection:collections (
          id,
          name,
          slug,
          description,
          display_order
        )
      )
    `)
    .eq("id", id)
    .single();

  if (refetched) {
    return mapRowToItem(refetched);
  }

  return mapRowToItem(updatedRow || {});
}

/**
 * Admin: Delete a portfolio entry
 */
export async function deletePortfolio(id: string): Promise<void> {
  if (!isSupabaseConfigured()) return;

  // Cleanup junction table first if needed
  try {
    await supabase.from("portfolio_collections").delete().eq("portfolio_id", id);
  } catch {
    // Ignore if cascade or relation missing
  }

  const { error } = await supabase.from("portfolio_items").delete().eq("id", id);
  if (error) {
    // Fallback to portfolios table
    const { error: legacyErr } = await supabase.from("portfolios").delete().eq("id", id);
    if (legacyErr) {
      console.error("Error deleting portfolio item:", legacyErr);
      throw legacyErr;
    }
  }
}

/**
 * Admin: Toggle pinned status
 */
export async function togglePin(id: string, nextPinned: boolean): Promise<void> {
  if (!isSupabaseConfigured()) return;

  const { error } = await supabase
    .from("portfolio_items")
    .update({ pinned: nextPinned })
    .eq("id", id);

  if (error) {
    await supabase.from("portfolios").update({ pinned: nextPinned }).eq("id", id);
  }
}

/**
 * Admin: Toggle published status
 */
export async function togglePublish(id: string, nextPublished: boolean): Promise<void> {
  if (!isSupabaseConfigured()) return;

  const { error } = await supabase
    .from("portfolio_items")
    .update({ published: nextPublished })
    .eq("id", id);

  if (error) {
    await supabase.from("portfolios").update({ published: nextPublished }).eq("id", id);
  }
}

/**
 * Safe Migration Utility: Transfers local items into Supabase
 * Ensures:
 * 1. Existing collections are fetched or created without duplicates (normalized names).
 * 2. Existing resources are inserted or matched by URL without duplicate records.
 * 3. Resources are linked to collections via portfolio_collections.
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

  // 1. Fetch all existing collections from Supabase
  let dbCollections = await fetchCollections();
  const collectionMapByName = new Map<string, Collection>();
  for (const col of dbCollections) {
    collectionMapByName.set(col.name.toLowerCase().trim(), col);
  }

  // 2. Fetch all existing URLs from database to avoid duplicate resources
  let existingUrls = new Set<string>();
  const { data: existingRows } = await supabase
    .from("portfolio_items")
    .select("url");

  if (existingRows) {
    existingUrls = new Set(
      existingRows.map((r) => normalizeUrl(r.url).toLowerCase())
    );
  } else {
    const { data: legacyRows } = await supabase.from("portfolios").select("url");
    if (legacyRows) {
      existingUrls = new Set(
        legacyRows.map((r) => normalizeUrl(r.url).toLowerCase())
      );
    }
  }

  // 3. Process each item
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

    // Resolve collections for this item ensuring only the 10 standard collections are used
    const targetCollectionIds: string[] = [];

    // Helper to resolve standard collection by name
    const resolveColId = (targetName: string): string | null => {
      const col = dbCollections.find(
        (c) =>
          c.name.toLowerCase() === targetName.toLowerCase() ||
          c.slug.toLowerCase() === slugify(targetName)
      );
      return col ? col.id : null;
    };

    // From item.collections
    if (Array.isArray(item.collections) && item.collections.length > 0) {
      for (const col of item.collections) {
        const colName = col.name.trim();
        if (colName.toLowerCase() === "tools & resources") {
          const guessed = guessCollections(item.url, item.title, item.description, item.tags);
          const filtered = guessed.filter((g) =>
            ["AI Tools", "Developer Tools", "Fonts, Icons & Assets", "Inspiration & Experiments"].includes(g)
          );
          const finalNames = filtered.length > 0 ? filtered : ["Developer Tools"];
          for (const fn of finalNames) {
            const cid = resolveColId(fn);
            if (cid && !targetCollectionIds.includes(cid)) targetCollectionIds.push(cid);
          }
        } else if (colName.toLowerCase() === "creative websites") {
          const cid1 = resolveColId("3D & WebGL");
          const cid2 = resolveColId("Inspiration & Experiments");
          if (cid1 && !targetCollectionIds.includes(cid1)) targetCollectionIds.push(cid1);
          if (cid2 && !targetCollectionIds.includes(cid2)) targetCollectionIds.push(cid2);
        } else if (colName.toLowerCase() === "inspiration") {
          const cid = resolveColId("Inspiration & Experiments");
          if (cid && !targetCollectionIds.includes(cid)) targetCollectionIds.push(cid);
        } else {
          const cid = resolveColId(colName);
          if (cid && !targetCollectionIds.includes(cid)) {
            targetCollectionIds.push(cid);
          }
        }
      }
    }
    // From legacy item.category
    else if (item.category) {
      const catName = item.category.trim();
      if (catName.toLowerCase() === "tools & resources") {
        const cid = resolveColId("Developer Tools");
        if (cid) targetCollectionIds.push(cid);
      } else if (catName.toLowerCase() === "inspiration") {
        const cid = resolveColId("Inspiration & Experiments");
        if (cid) targetCollectionIds.push(cid);
      } else if (catName.toLowerCase() === "creative websites") {
        const cid = resolveColId("3D & WebGL");
        if (cid) targetCollectionIds.push(cid);
      } else {
        const cid = resolveColId(catName);
        if (cid) targetCollectionIds.push(cid);
      }
    }

    // Fallback if no collection identified: intelligently guess or default to Portfolios
    if (targetCollectionIds.length === 0) {
      const guessed = guessCollections(item.url, item.title, item.description, item.tags);
      for (const g of guessed) {
        const cid = resolveColId(g);
        if (cid && !targetCollectionIds.includes(cid)) {
          targetCollectionIds.push(cid);
        }
      }
      if (targetCollectionIds.length === 0 && dbCollections.length > 0) {
        targetCollectionIds.push(dbCollections[0].id);
      }
    }

    try {
      await createPortfolio(item, targetCollectionIds);
      summary.added++;
    } catch (err) {
      console.error("Error migrating portfolio item:", err);
      summary.errors++;
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
