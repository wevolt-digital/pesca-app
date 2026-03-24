-- ============================================================
-- MIGRATION: Simplificar fish_species — manter apenas id, name, created_at
-- Execute no SQL Editor do Supabase
-- ============================================================

ALTER TABLE fish_species
  DROP COLUMN IF EXISTS scientific_name,
  DROP COLUMN IF EXISTS image_url,
  DROP COLUMN IF EXISTS description,
  DROP COLUMN IF EXISTS average_weight,
  DROP COLUMN IF EXISTS habitat,
  DROP COLUMN IF EXISTS popular_baits;

-- Verificar resultado
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'fish_species' ORDER BY ordinal_position;
