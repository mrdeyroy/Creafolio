-- ==============================================================================
-- Creafolio: Supabase Database Schema & Row Level Security (RLS)
-- ==============================================================================
-- Architecture:
-- 1. portfolio_items: Master table of curated design/code references
-- 2. collections: Distinct collections (Portfolios, UI & Components, Inspiration, etc.)
-- 3. portfolio_collections: Many-to-many junction table connecting resources to collections
-- ==============================================================================

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Create the collections table
CREATE TABLE IF NOT EXISTS public.collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT DEFAULT '',
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Create the portfolio_items table
CREATE TABLE IF NOT EXISTS public.portfolio_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  domain TEXT NOT NULL,
  description TEXT DEFAULT '',
  image TEXT DEFAULT '',
  video TEXT DEFAULT NULL,
  preview_type TEXT NOT NULL DEFAULT 'image',
  icon TEXT DEFAULT '',
  tags TEXT[] NOT NULL DEFAULT '{}',
  pinned BOOLEAN NOT NULL DEFAULT false,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Create many-to-many junction table
CREATE TABLE IF NOT EXISTS public.portfolio_collections (
  portfolio_id UUID NOT NULL REFERENCES public.portfolio_items(id) ON DELETE CASCADE,
  collection_id UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (portfolio_id, collection_id)
);

-- 5. Helpful Column Comments
COMMENT ON TABLE public.portfolio_items IS 'Curated design and engineering references for Creafolio.';
COMMENT ON TABLE public.collections IS 'Organizational collections for categorizing and discovering resources.';
COMMENT ON TABLE public.portfolio_collections IS 'Junction table linking resources to one or more collections.';

-- 6. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_collections_slug ON public.collections (slug);
CREATE INDEX IF NOT EXISTS idx_collections_display_order ON public.collections (display_order ASC);
CREATE INDEX IF NOT EXISTS idx_portfolio_collections_portfolio ON public.portfolio_collections (portfolio_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_collections_collection ON public.portfolio_collections (collection_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_items_published ON public.portfolio_items (published);
CREATE INDEX IF NOT EXISTS idx_portfolio_items_pinned ON public.portfolio_items (pinned);
CREATE INDEX IF NOT EXISTS idx_portfolio_items_created_at ON public.portfolio_items (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_portfolio_items_url ON public.portfolio_items (url);

-- 7. Automatic updated_at timestamp triggers
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_collections_updated_at ON public.collections;
CREATE TRIGGER trigger_collections_updated_at
BEFORE UPDATE ON public.collections
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trigger_portfolio_items_updated_at ON public.portfolio_items;
CREATE TRIGGER trigger_portfolio_items_updated_at
BEFORE UPDATE ON public.portfolio_items
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- 8. Backwards compatibility view for legacy queries
CREATE OR REPLACE VIEW public.portfolios AS
  SELECT * FROM public.portfolio_items;

-- 9. Row Level Security (RLS) Configuration
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_collections ENABLE ROW LEVEL SECURITY;

-- Collections RLS Policies
DROP POLICY IF EXISTS "Public can view collections" ON public.collections;
CREATE POLICY "Public can view collections"
ON public.collections FOR SELECT TO public
USING (true);

DROP POLICY IF EXISTS "Admin full access collections" ON public.collections;
CREATE POLICY "Admin full access collections"
ON public.collections FOR ALL TO authenticated
USING (true) WITH CHECK (true);

-- Portfolio Items RLS Policies
DROP POLICY IF EXISTS "Public can view published portfolio_items" ON public.portfolio_items;
CREATE POLICY "Public can view published portfolio_items"
ON public.portfolio_items FOR SELECT TO public
USING (published = true);

DROP POLICY IF EXISTS "Admin full access portfolio_items" ON public.portfolio_items;
CREATE POLICY "Admin full access portfolio_items"
ON public.portfolio_items FOR ALL TO authenticated
USING (true) WITH CHECK (true);

-- Portfolio Collections RLS Policies
DROP POLICY IF EXISTS "Public can view portfolio_collections" ON public.portfolio_collections;
CREATE POLICY "Public can view portfolio_collections"
ON public.portfolio_collections FOR SELECT TO public
USING (true);

DROP POLICY IF EXISTS "Admin full access portfolio_collections" ON public.portfolio_collections;
CREATE POLICY "Admin full access portfolio_collections"
ON public.portfolio_collections FOR ALL TO authenticated
USING (true) WITH CHECK (true);

-- ==============================================================================
-- 10. Seed Initial Collections & Curated References
-- ==============================================================================

-- A. Standard 10 Collections
INSERT INTO public.collections (id, name, slug, description, display_order)
VALUES
  ('c1000000-0000-0000-0000-000000000001', 'UI & Components', 'ui-components', 'Component libraries, design kits, and interactive micro-interactions.', 1),
  ('c1000000-0000-0000-0000-000000000002', 'Landing Pages', 'landing-pages', 'High-converting SaaS, marketing, and product landing pages.', 2),
  ('c1000000-0000-0000-0000-000000000003', 'Portfolios', 'portfolios', 'Personal developer, designer, and studio portfolios showcasing exceptional craft.', 3),
  ('c1000000-0000-0000-0000-000000000004', 'Design Systems', 'design-systems', 'Comprehensive design language and documentation systems.', 4),
  ('c1000000-0000-0000-0000-000000000005', 'Animations & Interactions', 'animations-interactions', 'Motion design, transitions, and polished interactive experiences.', 5),
  ('c1000000-0000-0000-0000-000000000006', '3D & WebGL', '3d-webgl', 'Experimental WebGL, Three.js, shaders, and immersive 3D experiences.', 6),
  ('c1000000-0000-0000-0000-000000000007', 'AI Tools', 'ai-tools', 'AI-powered creative tools, generative UI, and assistive design utilities.', 7),
  ('c1000000-0000-0000-0000-000000000008', 'Developer Tools', 'developer-tools', 'Code generators, developer utilities, inspection, and productivity tools.', 8),
  ('c1000000-0000-0000-0000-000000000009', 'Fonts, Icons & Assets', 'fonts-icons-assets', 'Icon libraries, curated typography, illustrations, and digital design assets.', 9),
  ('c1000000-0000-0000-0000-000000000010', 'Inspiration & Experiments', 'inspiration-experiments', 'Creative coding experiments, visual galleries, and award-winning showcases.', 10)
ON CONFLICT (name) DO UPDATE SET
  slug = EXCLUDED.slug,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order;

-- B. Curated Portfolio References
INSERT INTO public.portfolio_items (id, url, title, domain, description, image, icon, tags, pinned, published)
VALUES
  (
    'p1000000-0000-0000-0000-000000000001',
    'https://21st.dev',
    '21st.dev — The NPM for Design Engineers',
    '21st.dev',
    'Open-source community component library with copy-paste Tailwind and React micro-interactions.',
    'https://image.thum.io/get/width/800/crop/600/https://21st.dev',
    'https://unavatar.io/21st.dev?fallback=https://icons.duckduckgo.com/ip3/21st.dev.ico',
    ARRAY['UI Components', 'Tailwind', 'React'],
    true,
    true
  ),
  (
    'p1000000-0000-0000-0000-000000000002',
    'https://ui.aceternity.com',
    'Aceternity UI',
    'ui.aceternity.com',
    'Trending animated components built with Framer Motion and Tailwind CSS for modern landing pages.',
    'https://image.thum.io/get/width/800/crop/600/https://ui.aceternity.com',
    'https://unavatar.io/ui.aceternity.com?fallback=https://icons.duckduckgo.com/ip3/ui.aceternity.com.ico',
    ARRAY['UI Components', 'Framer Motion', 'Animations'],
    true,
    true
  ),
  (
    'p1000000-0000-0000-0000-000000000003',
    'https://bruno-simon.com',
    'Bruno Simon',
    'bruno-simon.com',
    'Interactive 3D physics portfolio built with Three.js and custom vehicle simulation.',
    'https://image.thum.io/get/width/800/crop/600/https://bruno-simon.com',
    'https://unavatar.io/bruno-simon.com?fallback=https://icons.duckduckgo.com/ip3/bruno-simon.com.ico',
    ARRAY['3D / WebGL', 'Interactive', 'Creative Dev'],
    true,
    true
  ),
  (
    'p1000000-0000-0000-0000-000000000004',
    'https://pavelstetkevych.com',
    'Pavel Stetkevych',
    'pavelstetkevych.com',
    'Editorial digital product design portfolio with refined typography and micro-interactions.',
    'https://image.thum.io/get/width/800/crop/600/https://pavelstetkevych.com',
    'https://unavatar.io/pavelstetkevych.com?fallback=https://icons.duckduckgo.com/ip3/pavelstetkevych.com.ico',
    ARRAY['Design', 'Dark Mode', 'Product'],
    false,
    true
  ),
  (
    'p1000000-0000-0000-0000-000000000005',
    'https://magicui.design',
    'Magic UI',
    'magicui.design',
    'UI library for design engineers offering 50+ animated components for landing pages.',
    'https://image.thum.io/get/width/800/crop/600/https://magicui.design',
    'https://unavatar.io/magicui.design?fallback=https://icons.duckduckgo.com/ip3/magicui.design.ico',
    ARRAY['UI Components', 'React', 'Motion'],
    false,
    true
  ),
  (
    'p1000000-0000-0000-0000-000000000006',
    'https://siteinspire.com',
    'Siteinspire',
    'siteinspire.com',
    'Showcase of the finest web and interactive design from around the world.',
    'https://image.thum.io/get/width/800/crop/600/https://siteinspire.com',
    'https://unavatar.io/siteinspire.com?fallback=https://icons.duckduckgo.com/ip3/siteinspire.com.ico',
    ARRAY['Inspiration', 'Web Design', 'Showcase'],
    false,
    true
  ),
  (
    'p1000000-0000-0000-0000-000000000007',
    'https://rauno.me',
    'Rauno Freiberg',
    'rauno.me',
    'Design Engineer at Vercel. Crafting invisible details and high-polish user interfaces.',
    'https://image.thum.io/get/width/800/crop/600/https://rauno.me',
    'https://unavatar.io/rauno.me?fallback=https://icons.duckduckgo.com/ip3/rauno.me.ico',
    ARRAY['Design Engineering', 'Minimal', 'Craft'],
    false,
    true
  ),
  (
    'p1000000-0000-0000-0000-000000000008',
    'https://www.realtimecolors.com',
    'Realtime Colors',
    'realtimecolors.com',
    'Visualize UI color palettes and typography in real-time on actual website layouts.',
    'https://image.thum.io/get/width/800/crop/600/https://www.realtimecolors.com',
    'https://unavatar.io/realtimecolors.com?fallback=https://icons.duckduckgo.com/ip3/realtimecolors.com.ico',
    ARRAY['Colors', 'Design Tools', 'Generators'],
    false,
    true
  )
ON CONFLICT (url) DO NOTHING;

-- C. Connect References to Collections (Many-to-Many Relationships)
-- 21st.dev -> UI & Components, Developer Tools
INSERT INTO public.portfolio_collections (portfolio_id, collection_id)
SELECT p.id, c.id FROM public.portfolio_items p, public.collections c
WHERE p.url = 'https://21st.dev' AND c.name IN ('UI & Components', 'Developer Tools')
ON CONFLICT DO NOTHING;

-- Aceternity UI -> UI & Components, Landing Pages, Design Systems, Animations & Interactions
INSERT INTO public.portfolio_collections (portfolio_id, collection_id)
SELECT p.id, c.id FROM public.portfolio_items p, public.collections c
WHERE p.url = 'https://ui.aceternity.com' AND c.name IN ('UI & Components', 'Landing Pages', 'Design Systems', 'Animations & Interactions')
ON CONFLICT DO NOTHING;

-- Bruno Simon -> Portfolios, 3D & WebGL, Inspiration & Experiments
INSERT INTO public.portfolio_collections (portfolio_id, collection_id)
SELECT p.id, c.id FROM public.portfolio_items p, public.collections c
WHERE p.url = 'https://bruno-simon.com' AND c.name IN ('Portfolios', '3D & WebGL', 'Inspiration & Experiments')
ON CONFLICT DO NOTHING;

-- Pavel Stetkevych -> Portfolios
INSERT INTO public.portfolio_collections (portfolio_id, collection_id)
SELECT p.id, c.id FROM public.portfolio_items p, public.collections c
WHERE p.url = 'https://pavelstetkevych.com' AND c.name IN ('Portfolios')
ON CONFLICT DO NOTHING;

-- Magic UI -> UI & Components, Landing Pages, Animations & Interactions
INSERT INTO public.portfolio_collections (portfolio_id, collection_id)
SELECT p.id, c.id FROM public.portfolio_items p, public.collections c
WHERE p.url = 'https://magicui.design' AND c.name IN ('UI & Components', 'Landing Pages', 'Animations & Interactions')
ON CONFLICT DO NOTHING;

-- Siteinspire -> Inspiration & Experiments
INSERT INTO public.portfolio_collections (portfolio_id, collection_id)
SELECT p.id, c.id FROM public.portfolio_items p, public.collections c
WHERE p.url = 'https://siteinspire.com' AND c.name IN ('Inspiration & Experiments')
ON CONFLICT DO NOTHING;

-- Rauno Freiberg -> Portfolios, Design Systems, Animations & Interactions
INSERT INTO public.portfolio_collections (portfolio_id, collection_id)
SELECT p.id, c.id FROM public.portfolio_items p, public.collections c
WHERE p.url = 'https://rauno.me' AND c.name IN ('Portfolios', 'Design Systems', 'Animations & Interactions')
ON CONFLICT DO NOTHING;

-- Realtime Colors -> Developer Tools, Fonts, Icons & Assets
INSERT INTO public.portfolio_collections (portfolio_id, collection_id)
SELECT p.id, c.id FROM public.portfolio_items p, public.collections c
WHERE p.url = 'https://www.realtimecolors.com' AND c.name IN ('Developer Tools', 'Fonts, Icons & Assets')
ON CONFLICT DO NOTHING;
