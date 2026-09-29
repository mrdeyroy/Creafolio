import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Read environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = (): boolean => {
  return (
    typeof supabaseUrl === "string" &&
    supabaseUrl.trim().length > 0 &&
    !supabaseUrl.includes("your-project-id") &&
    typeof supabaseAnonKey === "string" &&
    supabaseAnonKey.trim().length > 0 &&
    !supabaseAnonKey.includes("your-anon-publishable-key")
  );
};

// Create a safe client. If missing or invalid, we supply a dummy URL so createClient does not crash the bundle.
const validUrl = isSupabaseConfigured() ? supabaseUrl : "https://placeholder-creafolio.supabase.co";
const validKey = isSupabaseConfigured() ? supabaseAnonKey : "placeholder-anon-key";

export const supabase: SupabaseClient = createClient(validUrl, validKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export const designatedAdminEmail = import.meta.env.VITE_ADMIN_EMAIL || "";
