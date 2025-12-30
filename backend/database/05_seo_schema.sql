-- Migration: SEO Url Validation
-- Add slug column to articles table

ALTER TABLE public.articles
ADD COLUMN IF NOT EXISTS slug TEXT;

-- Create Uniqueness Constraint/Index
CREATE UNIQUE INDEX IF NOT EXISTS idx_articles_slug ON public.articles(slug);

-- Function to slugify title (Simple PG version, or we backfill via Python)
-- For now, allow nulls for existing, we will backfill via script.
