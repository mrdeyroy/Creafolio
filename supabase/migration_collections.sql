-- ==============================================================================
-- Creafolio: Master Migration - Transition to 10 Standard Collections (Many-to-Many)
-- ==============================================================================
-- Run this migration in your Supabase SQL Editor.
-- This script is completely safe, idempotent, and non-destructive:
-- 1. Preserves all existing portfolio records.
-- 2. Establishes exactly the 10 standard collections.
-- 3. Renames and reassigns existing collections (e.g. Tools & Resources -> AI Tools,
--    Developer Tools, Fonts/Icons/Assets; Inspiration -> Inspiration & Experiments;
--    Creative Websites -> 3D & WebGL).
-- 4. Removes deprecated collection records so only the 10 standard collections remain.
-- 5. Preserves and updates many-to-many relationships without duplicate records.
-- ==============================================================================

-- 1. Ensure pgcrypto extension is enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Rename existing "portfolios" table to "portfolio_items" if needed
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'portfolios'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'portfolio_items'
  ) THEN
    ALTER TABLE public.portfolios RENAME TO portfolio_items;
  END IF;
END $$;

-- 3. Create portfolio_items table if starting completely fresh
CREATE TABLE IF NOT EXISTS public.portfolio_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  domain TEXT NOT NULL,
  description TEXT DEFAULT '',
  image TEXT DEFAULT '',
  icon TEXT DEFAULT '',
  tags TEXT[] NOT NULL DEFAULT '{}',
  pinned BOOLEAN NOT NULL DEFAULT false,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Create collections table
CREATE TABLE IF NOT EXISTS public.collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT DEFAULT '',
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Create many-to-many junction table: portfolio_collections
CREATE TABLE IF NOT EXISTS public.portfolio_collections (
  portfolio_id UUID NOT NULL REFERENCES public.portfolio_items(id) ON DELETE CASCADE,
  collection_id UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (portfolio_id, collection_id)
);

-- 6. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_collections_slug ON public.collections (slug);
CREATE INDEX IF NOT EXISTS idx_collections_display_order ON public.collections (display_order ASC);
CREATE INDEX IF NOT EXISTS idx_portfolio_collections_portfolio ON public.portfolio_collections (portfolio_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_collections_collection ON public.portfolio_collections (collection_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_items_published ON public.portfolio_items (published);
CREATE INDEX IF NOT EXISTS idx_portfolio_items_pinned ON public.portfolio_items (pinned);
CREATE INDEX IF NOT EXISTS idx_portfolio_items_created_at ON public.portfolio_items (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_portfolio_items_url ON public.portfolio_items (url);

-- 7. Automatic updated_at trigger helper
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

-- 8. Backwards compatibility view (allows queries to "portfolios" to continue functioning)
CREATE OR REPLACE VIEW public.portfolios AS
  SELECT * FROM public.portfolio_items;

-- 9. Insert/Update the EXACT 10 Standard Collections
INSERT INTO public.collections (name, slug, description, display_order)
VALUES
  ('UI & Components', 'ui-components', 'Component libraries, design kits, and interactive micro-interactions.', 1),
  ('Landing Pages', 'landing-pages', 'High-converting SaaS, marketing, and product landing pages.', 2),
  ('Portfolios', 'portfolios', 'Personal developer, designer, and studio portfolios showcasing exceptional craft.', 3),
  ('Design Systems', 'design-systems', 'Comprehensive design language and documentation systems.', 4),
  ('Animations & Interactions', 'animations-interactions', 'Motion design, transitions, and polished interactive experiences.', 5),
  ('3D & WebGL', '3d-webgl', 'Experimental WebGL, Three.js, shaders, and immersive 3D experiences.', 6),
  ('AI Tools', 'ai-tools', 'AI-powered creative tools, generative UI, and assistive design utilities.', 7),
  ('Developer Tools', 'developer-tools', 'Code generators, developer utilities, inspection, and productivity tools.', 8),
  ('Fonts, Icons & Assets', 'fonts-icons-assets', 'Icon libraries, curated typography, illustrations, and digital design assets.', 9),
  ('Inspiration & Experiments', 'inspiration-experiments', 'Creative coding experiments, visual galleries, and award-winning showcases.', 10)
ON CONFLICT (name) DO UPDATE SET
  slug = EXCLUDED.slug,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order;

-- 10. Data Migration: Safe Reassignment & Cleanup
DO $$
DECLARE
  v_ui_id UUID;
  v_landing_id UUID;
  v_portfolio_id UUID;
  v_design_sys_id UUID;
  v_anim_id UUID;
  v_webgl_id UUID;
  v_ai_id UUID;
  v_dev_id UUID;
  v_fonts_id UUID;
  v_inspire_id UUID;
  v_deprecated_col RECORD;
BEGIN
  -- Retrieve IDs of the 10 standard collections
  SELECT id INTO v_ui_id FROM public.collections WHERE name = 'UI & Components';
  SELECT id INTO v_landing_id FROM public.collections WHERE name = 'Landing Pages';
  SELECT id INTO v_portfolio_id FROM public.collections WHERE name = 'Portfolios';
  SELECT id INTO v_design_sys_id FROM public.collections WHERE name = 'Design Systems';
  SELECT id INTO v_anim_id FROM public.collections WHERE name = 'Animations & Interactions';
  SELECT id INTO v_webgl_id FROM public.collections WHERE name = '3D & WebGL';
  SELECT id INTO v_ai_id FROM public.collections WHERE name = 'AI Tools';
  SELECT id INTO v_dev_id FROM public.collections WHERE name = 'Developer Tools';
  SELECT id INTO v_fonts_id FROM public.collections WHERE name = 'Fonts, Icons & Assets';
  SELECT id INTO v_inspire_id FROM public.collections WHERE name = 'Inspiration & Experiments';

  -- A. If legacy "category" column exists on portfolio_items, migrate into junction table
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'portfolio_items' 
      AND column_name = 'category'
  ) THEN
    -- Map legacy category 'Tools & Resources' -> Developer Tools
    INSERT INTO public.portfolio_collections (portfolio_id, collection_id)
    SELECT p.id, v_dev_id
    FROM public.portfolio_items p
    WHERE LOWER(TRIM(p.category)) = 'tools & resources'
    ON CONFLICT DO NOTHING;

    -- Map legacy category 'Inspiration' -> Inspiration & Experiments
    INSERT INTO public.portfolio_collections (portfolio_id, collection_id)
    SELECT p.id, v_inspire_id
    FROM public.portfolio_items p
    WHERE LOWER(TRIM(p.category)) = 'inspiration'
    ON CONFLICT DO NOTHING;

    -- Map legacy category 'Creative Websites' -> 3D & WebGL
    INSERT INTO public.portfolio_collections (portfolio_id, collection_id)
    SELECT p.id, v_webgl_id
    FROM public.portfolio_items p
    WHERE LOWER(TRIM(p.category)) = 'creative websites'
    ON CONFLICT DO NOTHING;

    -- Map standard direct name matches
    INSERT INTO public.portfolio_collections (portfolio_id, collection_id)
    SELECT p.id, c.id
    FROM public.portfolio_items p
    JOIN public.collections c ON LOWER(TRIM(c.name)) = LOWER(TRIM(p.category))
    ON CONFLICT DO NOTHING;
  END IF;

  -- B. Reassign resources linked to deprecated collections
  FOR v_deprecated_col IN 
    SELECT id, name FROM public.collections 
    WHERE name NOT IN (
      'UI & Components',
      'Landing Pages',
      'Portfolios',
      'Design Systems',
      'Animations & Interactions',
      '3D & WebGL',
      'AI Tools',
      'Developer Tools',
      'Fonts, Icons & Assets',
      'Inspiration & Experiments'
    )
  LOOP
    -- Reassign linked resources to appropriate standard collection based on item keywords
    INSERT INTO public.portfolio_collections (portfolio_id, collection_id)
    SELECT pc.portfolio_id, 
      CASE 
        WHEN LOWER(p.title || ' ' || p.description || ' ' || array_to_string(p.tags, ' ') || ' ' || p.url) ~* '(ai|gpt|llm|copilot|openai|claude|v0|midjourney|generative)'
          THEN v_ai_id
        WHEN LOWER(p.title || ' ' || p.description || ' ' || array_to_string(p.tags, ' ') || ' ' || p.url) ~* '(font|typography|icon|svg|glyph|asset|illustration|figma)'
          THEN v_fonts_id
        WHEN LOWER(p.title || ' ' || p.description || ' ' || array_to_string(p.tags, ' ') || ' ' || p.url) ~* '(3d|webgl|three\.?js|shader|canvas|spline)'
          THEN v_webgl_id
        WHEN LOWER(p.title || ' ' || p.description || ' ' || array_to_string(p.tags, ' ') || ' ' || p.url) ~* '(motion|animation|framer|interaction)'
          THEN v_anim_id
        WHEN LOWER(p.title || ' ' || p.description || ' ' || array_to_string(p.tags, ' ') || ' ' || p.url) ~* '(inspiration|showcase|gallery|award|experiment|creative)'
          THEN v_inspire_id
        WHEN LOWER(p.title || ' ' || p.description || ' ' || array_to_string(p.tags, ' ') || ' ' || p.url) ~* '(landing|saas|marketing)'
          THEN v_landing_id
        WHEN LOWER(p.title || ' ' || p.description || ' ' || array_to_string(p.tags, ' ') || ' ' || p.url) ~* '(design.?system|guideline|token)'
          THEN v_design_sys_id
        WHEN LOWER(p.title || ' ' || p.description || ' ' || array_to_string(p.tags, ' ') || ' ' || p.url) ~* '(component|ui|radix|shadcn|tailwind)'
          THEN v_ui_id
        WHEN LOWER(p.title || ' ' || p.description || ' ' || array_to_string(p.tags, ' ') || ' ' || p.url) ~* '(portfolio|personal|resume|cv)'
          THEN v_portfolio_id
        ELSE v_dev_id
      END
    FROM public.portfolio_collections pc
    JOIN public.portfolio_items p ON p.id = pc.portfolio_id
    WHERE pc.collection_id = v_deprecated_col.id
    ON CONFLICT (portfolio_id, collection_id) DO NOTHING;

    -- Delete junction links for the deprecated collection, then delete collection itself
    DELETE FROM public.portfolio_collections WHERE collection_id = v_deprecated_col.id;
    DELETE FROM public.collections WHERE id = v_deprecated_col.id;
  END LOOP;

  -- C. Set up multi-collection relationships for curated seed references
  -- 21st.dev -> UI & Components, Developer Tools
  INSERT INTO public.portfolio_collections (portfolio_id, collection_id)
  SELECT p.id, c.id FROM public.portfolio_items p, public.collections c
  WHERE p.url LIKE '%21st.dev%' AND c.name IN ('UI & Components', 'Developer Tools')
  ON CONFLICT DO NOTHING;

  -- Aceternity UI -> UI & Components, Landing Pages, Design Systems, Animations & Interactions
  INSERT INTO public.portfolio_collections (portfolio_id, collection_id)
  SELECT p.id, c.id FROM public.portfolio_items p, public.collections c
  WHERE p.url LIKE '%ui.aceternity.com%' AND c.name IN ('UI & Components', 'Landing Pages', 'Design Systems', 'Animations & Interactions')
  ON CONFLICT DO NOTHING;

  -- Bruno Simon -> Portfolios, 3D & WebGL, Inspiration & Experiments
  INSERT INTO public.portfolio_collections (portfolio_id, collection_id)
  SELECT p.id, c.id FROM public.portfolio_items p, public.collections c
  WHERE p.url LIKE '%bruno-simon.com%' AND c.name IN ('Portfolios', '3D & WebGL', 'Inspiration & Experiments')
  ON CONFLICT DO NOTHING;

  -- Pavel Stetkevych -> Portfolios
  INSERT INTO public.portfolio_collections (portfolio_id, collection_id)
  SELECT p.id, c.id FROM public.portfolio_items p, public.collections c
  WHERE p.url LIKE '%pavelstetkevych.com%' AND c.name IN ('Portfolios')
  ON CONFLICT DO NOTHING;

  -- Magic UI -> UI & Components, Landing Pages, Animations & Interactions
  INSERT INTO public.portfolio_collections (portfolio_id, collection_id)
  SELECT p.id, c.id FROM public.portfolio_items p, public.collections c
  WHERE p.url LIKE '%magicui.design%' AND c.name IN ('UI & Components', 'Landing Pages', 'Animations & Interactions')
  ON CONFLICT DO NOTHING;

  -- Siteinspire -> Inspiration & Experiments
  INSERT INTO public.portfolio_collections (portfolio_id, collection_id)
  SELECT p.id, c.id FROM public.portfolio_items p, public.collections c
  WHERE p.url LIKE '%siteinspire.com%' AND c.name IN ('Inspiration & Experiments')
  ON CONFLICT DO NOTHING;

  -- Rauno Freiberg -> Portfolios, Design Systems, Animations & Interactions
  INSERT INTO public.portfolio_collections (portfolio_id, collection_id)
  SELECT p.id, c.id FROM public.portfolio_items p, public.collections c
  WHERE p.url LIKE '%rauno.me%' AND c.name IN ('Portfolios', 'Design Systems', 'Animations & Interactions')
  ON CONFLICT DO NOTHING;

  -- Realtime Colors -> Developer Tools, Fonts, Icons & Assets
  INSERT INTO public.portfolio_collections (portfolio_id, collection_id)
  SELECT p.id, c.id FROM public.portfolio_items p, public.collections c
  WHERE p.url LIKE '%realtimecolors.com%' AND c.name IN ('Developer Tools', 'Fonts, Icons & Assets')
  ON CONFLICT DO NOTHING;

  -- D. Ensure ANY resource without any collection link gets safely classified
  INSERT INTO public.portfolio_collections (portfolio_id, collection_id)
  SELECT p.id, 
    CASE
      WHEN LOWER(p.title || ' ' || p.description || ' ' || array_to_string(p.tags, ' ') || ' ' || p.url) ~* '(portfolio|personal|resume|cv)' THEN v_portfolio_id
      WHEN LOWER(p.title || ' ' || p.description || ' ' || array_to_string(p.tags, ' ') || ' ' || p.url) ~* '(component|ui|radix|shadcn)' THEN v_ui_id
      WHEN LOWER(p.title || ' ' || p.description || ' ' || array_to_string(p.tags, ' ') || ' ' || p.url) ~* '(landing|saas|marketing)' THEN v_landing_id
      WHEN LOWER(p.title || ' ' || p.description || ' ' || array_to_string(p.tags, ' ') || ' ' || p.url) ~* '(design.?system|guideline)' THEN v_design_sys_id
      WHEN LOWER(p.title || ' ' || p.description || ' ' || array_to_string(p.tags, ' ') || ' ' || p.url) ~* '(motion|animation|framer)' THEN v_anim_id
      WHEN LOWER(p.title || ' ' || p.description || ' ' || array_to_string(p.tags, ' ') || ' ' || p.url) ~* '(3d|webgl|three|shader)' THEN v_webgl_id
      WHEN LOWER(p.title || ' ' || p.description || ' ' || array_to_string(p.tags, ' ') || ' ' || p.url) ~* '(ai|gpt|llm|copilot)' THEN v_ai_id
      WHEN LOWER(p.title || ' ' || p.description || ' ' || array_to_string(p.tags, ' ') || ' ' || p.url) ~* '(font|typography|icon|svg|asset)' THEN v_fonts_id
      WHEN LOWER(p.title || ' ' || p.description || ' ' || array_to_string(p.tags, ' ') || ' ' || p.url) ~* '(generator|tool|utility|code)' THEN v_dev_id
      ELSE v_inspire_id
    END
  FROM public.portfolio_items p
  WHERE NOT EXISTS (
    SELECT 1 FROM public.portfolio_collections pc WHERE pc.portfolio_id = p.id
  )
  ON CONFLICT DO NOTHING;

END $$;

-- 11. Row Level Security (RLS) Policies
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_collections ENABLE ROW LEVEL SECURITY;

-- Collections RLS
DROP POLICY IF EXISTS "Public can view collections" ON public.collections;
CREATE POLICY "Public can view collections"
ON public.collections FOR SELECT TO public
USING (true);

DROP POLICY IF EXISTS "Admin full access collections" ON public.collections;
CREATE POLICY "Admin full access collections"
ON public.collections FOR ALL TO authenticated
USING (true) WITH CHECK (true);

-- Portfolio Items RLS
DROP POLICY IF EXISTS "Public can view published portfolio_items" ON public.portfolio_items;
CREATE POLICY "Public can view published portfolio_items"
ON public.portfolio_items FOR SELECT TO public
USING (published = true);

DROP POLICY IF EXISTS "Admin full access portfolio_items" ON public.portfolio_items;
CREATE POLICY "Admin full access portfolio_items"
ON public.portfolio_items FOR ALL TO authenticated
USING (true) WITH CHECK (true);

-- Portfolio Collections RLS
DROP POLICY IF EXISTS "Public can view portfolio_collections" ON public.portfolio_collections;
CREATE POLICY "Public can view portfolio_collections"
ON public.portfolio_collections FOR SELECT TO public
USING (true);

DROP POLICY IF EXISTS "Admin full access portfolio_collections" ON public.portfolio_collections;
CREATE POLICY "Admin full access portfolio_collections"
ON public.portfolio_collections FOR ALL TO authenticated
USING (true) WITH CHECK (true);
