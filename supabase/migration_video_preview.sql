-- ==============================================================================
-- Creafolio: Add Smooth Video Previews Migration
-- ==============================================================================
-- Safe, idempotent migration to add video preview support to existing portfolio items.
-- Run this in your Supabase SQL Editor if you already have the portfolio_items table.
-- ==============================================================================

-- 1. Add video column (optional direct MP4/WebM/stream URL)
ALTER TABLE public.portfolio_items 
ADD COLUMN IF NOT EXISTS video TEXT DEFAULT NULL;

-- 2. Add preview_type column (defaults to 'image', can be 'image' or 'video')
ALTER TABLE public.portfolio_items 
ADD COLUMN IF NOT EXISTS preview_type TEXT NOT NULL DEFAULT 'image';

-- 3. In case the legacy portfolios table is also being used directly:
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'portfolios' AND table_type = 'BASE TABLE'
  ) THEN
    ALTER TABLE public.portfolios ADD COLUMN IF NOT EXISTS video TEXT DEFAULT NULL;
    ALTER TABLE public.portfolios ADD COLUMN IF NOT EXISTS preview_type TEXT NOT NULL DEFAULT 'image';
  END IF;
END $$;

-- 4. Re-create or refresh view if portfolios is a view
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.views 
    WHERE table_schema = 'public' AND table_name = 'portfolios'
  ) THEN
    CREATE OR REPLACE VIEW public.portfolios AS
      SELECT * FROM public.portfolio_items;
  END IF;
END $$;

-- 5. Helpful Column Comments
COMMENT ON COLUMN public.portfolio_items.video IS 'Optional direct MP4/WebM video URL or animated preview stream.';
COMMENT ON COLUMN public.portfolio_items.preview_type IS 'Primary card preview type: "image" or "video". Defaults to "image".';

-- 6. Performance Index for video preview filtering
CREATE INDEX IF NOT EXISTS idx_portfolio_items_preview_type 
ON public.portfolio_items (preview_type);
