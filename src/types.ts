export interface Collection {
  id: string; // UUID from Supabase or unique ID
  name: string;
  slug: string;
  description?: string;
  display_order?: number;
  created_at?: string;
  updated_at?: string;
  count?: number; // Computed number of resources belonging to this collection
}

export interface PortfolioItem {
  id: string; // UUID from Supabase or unique ID
  url: string;
  title: string;
  domain: string;
  collections: Collection[];
  collection_ids?: string[]; // Array of collection UUIDs
  category?: string; // Optional legacy backward-compatibility field
  description: string;
  image: string;
  video?: string | null;
  previewType?: "image" | "video";
  icon: string;
  tags: string[];
  pinned: boolean;
  published: boolean;
  createdAt?: number; // Epoch ms timestamp (used by local caches/fallback)
  created_at?: string; // ISO 8601 string from Supabase
  updated_at?: string; // ISO 8601 string from Supabase
}

export type ViewMode = "grid" | "compact";

export interface MigrationSummary {
  total: number;
  added: number;
  skipped: number;
  errors: number;
}
