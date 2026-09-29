export interface PortfolioItem {
  id: string; // UUID from Supabase or unique ID
  url: string;
  title: string;
  domain: string;
  category: string;
  description: string;
  image: string;
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
