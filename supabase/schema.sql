-- ==============================================================================
-- Creafolio: Supabase Database Schema & Row Level Security (RLS)
-- ==============================================================================
-- Table: portfolios
-- Centralized repository for owner-curated design portfolios and references.
-- ==============================================================================

-- 1. Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Create the portfolios table
CREATE TABLE IF NOT EXISTS public.portfolios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  domain TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Portfolios',
  description TEXT DEFAULT '',
  image TEXT DEFAULT '',
  icon TEXT DEFAULT '',
  tags TEXT[] NOT NULL DEFAULT '{}',
  pinned BOOLEAN NOT NULL DEFAULT false,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Helpful column comments
COMMENT ON TABLE public.portfolios IS 'Curated design and portfolio reference collection for Creafolio.';
COMMENT ON COLUMN public.portfolios.id IS 'Primary key UUID.';
COMMENT ON COLUMN public.portfolios.url IS 'Normalized target URL, unique across all entries.';
COMMENT ON COLUMN public.portfolios.title IS 'Display title of the portfolio or tool.';
COMMENT ON COLUMN public.portfolios.domain IS 'Hostname extracted from URL.';
COMMENT ON COLUMN public.portfolios.category IS 'Primary category: Portfolios, UI & Components, Inspiration, Tools & Resources.';
COMMENT ON COLUMN public.portfolios.pinned IS 'Featured resource flag (sorted to top).';
COMMENT ON COLUMN public.portfolios.published IS 'Visibility flag: true = visible to public, false = admin draft only.';

-- 4. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_portfolios_published ON public.portfolios (published);
CREATE INDEX IF NOT EXISTS idx_portfolios_pinned ON public.portfolios (pinned);
CREATE INDEX IF NOT EXISTS idx_portfolios_category ON public.portfolios (category);
CREATE INDEX IF NOT EXISTS idx_portfolios_created_at ON public.portfolios (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_portfolios_url ON public.portfolios (url);

-- 5. Automatic updated_at timestamp trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_portfolios_updated_at ON public.portfolios;
CREATE TRIGGER trigger_portfolios_updated_at
BEFORE UPDATE ON public.portfolios
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- 6. Row Level Security (RLS) Configuration
-- ==============================================================================

-- Enable RLS on the portfolios table
ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;

-- Policy 1: Public Read Access
-- Anonymous visitors and authenticated users can SELECT only published portfolios.
DROP POLICY IF EXISTS "Public can view published portfolios" ON public.portfolios;
CREATE POLICY "Public can view published portfolios"
ON public.portfolios
FOR SELECT
TO public
USING (published = true);

-- Policy 2: Admin Full Access (SELECT, INSERT, UPDATE, DELETE)
-- Authenticated users (the site owner) have full management rights.
DROP POLICY IF EXISTS "Admin full access" ON public.portfolios;
CREATE POLICY "Admin full access"
ON public.portfolios
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- OPTIONAL HARDENED POLICY FOR SINGLE OWNER ACCOUNT:
-- If you want to strictly restrict write access to one specific owner email,
-- you can uncomment the following replacement for Policy 2:
--
-- DROP POLICY IF EXISTS "Admin full access" ON public.portfolios;
-- CREATE POLICY "Admin full access"
-- ON public.portfolios
-- FOR ALL
-- TO authenticated
-- USING (auth.jwt() ->> 'email' = 'your-admin-email@domain.com')
-- WITH CHECK (auth.jwt() ->> 'email' = 'your-admin-email@domain.com');

-- ==============================================================================
-- 7. Seed Initial Curated References (Optional)
-- Run this block if you are setting up a fresh database and want the default collection.
-- ==============================================================================
INSERT INTO public.portfolios (url, title, domain, category, description, image, icon, tags, pinned, published)
VALUES
  (
    'https://21st.dev',
    '21st.dev — The NPM for Design Engineers',
    '21st.dev',
    'UI & Components',
    'Open-source community component library with copy-paste Tailwind and React micro-interactions.',
    'https://image.thum.io/get/width/800/crop/600/https://21st.dev',
    'https://unavatar.io/21st.dev?fallback=https://icons.duckduckgo.com/ip3/21st.dev.ico',
    ARRAY['UI Components', 'Tailwind', 'React'],
    true,
    true
  ),
  (
    'https://ui.aceternity.com',
    'Aceternity UI',
    'ui.aceternity.com',
    'UI & Components',
    'Trending animated components built with Framer Motion and Tailwind CSS for modern landing pages.',
    'https://image.thum.io/get/width/800/crop/600/https://ui.aceternity.com',
    'https://unavatar.io/ui.aceternity.com?fallback=https://icons.duckduckgo.com/ip3/ui.aceternity.com.ico',
    ARRAY['UI Components', 'Framer Motion', 'Animations'],
    true,
    true
  ),
  (
    'https://bruno-simon.com',
    'Bruno Simon',
    'bruno-simon.com',
    'Portfolios',
    'Interactive 3D physics portfolio built with Three.js and custom vehicle simulation.',
    'https://image.thum.io/get/width/800/crop/600/https://bruno-simon.com',
    'https://unavatar.io/bruno-simon.com?fallback=https://icons.duckduckgo.com/ip3/bruno-simon.com.ico',
    ARRAY['3D / WebGL', 'Interactive', 'Creative Dev'],
    true,
    true
  ),
  (
    'https://pavelstetkevych.com',
    'Pavel Stetkevych',
    'pavelstetkevych.com',
    'Portfolios',
    'Editorial digital product design portfolio with refined typography and micro-interactions.',
    'https://image.thum.io/get/width/800/crop/600/https://pavelstetkevych.com',
    'https://unavatar.io/pavelstetkevych.com?fallback=https://icons.duckduckgo.com/ip3/pavelstetkevych.com.ico',
    ARRAY['Design', 'Dark Mode', 'Product'],
    false,
    true
  ),
  (
    'https://magicui.design',
    'Magic UI',
    'magicui.design',
    'UI & Components',
    'UI library for design engineers offering 50+ animated components for landing pages.',
    'https://image.thum.io/get/width/800/crop/600/https://magicui.design',
    'https://unavatar.io/magicui.design?fallback=https://icons.duckduckgo.com/ip3/magicui.design.ico',
    ARRAY['UI Components', 'React', 'Motion'],
    false,
    true
  ),
  (
    'https://siteinspire.com',
    'Siteinspire',
    'siteinspire.com',
    'Inspiration',
    'Showcase of the finest web and interactive design from around the world.',
    'https://image.thum.io/get/width/800/crop/600/https://siteinspire.com',
    'https://unavatar.io/siteinspire.com?fallback=https://icons.duckduckgo.com/ip3/siteinspire.com.ico',
    ARRAY['Inspiration', 'Web Design', 'Showcase'],
    false,
    true
  ),
  (
    'https://rauno.me',
    'Rauno Freiberg',
    'rauno.me',
    'Portfolios',
    'Design Engineer at Vercel. Crafting invisible details and high-polish user interfaces.',
    'https://image.thum.io/get/width/800/crop/600/https://rauno.me',
    'https://unavatar.io/rauno.me?fallback=https://icons.duckduckgo.com/ip3/rauno.me.ico',
    ARRAY['Design Engineering', 'Minimal', 'Craft'],
    false,
    true
  ),
  (
    'https://www.realtimecolors.com',
    'Realtime Colors',
    'realtimecolors.com',
    'Tools & Resources',
    'Visualize UI color palettes and typography in real-time on actual website layouts.',
    'https://image.thum.io/get/width/800/crop/600/https://www.realtimecolors.com',
    'https://unavatar.io/realtimecolors.com?fallback=https://icons.duckduckgo.com/ip3/realtimecolors.com.ico',
    ARRAY['Colors', 'Design Tools', 'Generators'],
    false,
    true
  )
ON CONFLICT (url) DO NOTHING;
