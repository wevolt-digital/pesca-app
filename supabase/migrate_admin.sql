-- =============================================================================
-- Migração: Sistema Admin
-- Adiciona role em profiles e campos de promoção em catches
-- Idempotente: seguro para re-execução sem erros
-- Execute no Supabase Dashboard → SQL Editor
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Enum: user_role
-- ---------------------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('user', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ---------------------------------------------------------------------------
-- 2. Coluna role em profiles
-- ---------------------------------------------------------------------------
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS role user_role NOT NULL DEFAULT 'user';

-- ---------------------------------------------------------------------------
-- 3. Colunas de promoção em catches
-- ---------------------------------------------------------------------------
ALTER TABLE catches
  ADD COLUMN IF NOT EXISTS is_promoted  boolean     NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS promoted_by  uuid        REFERENCES profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS promoted_at  timestamptz;

CREATE INDEX IF NOT EXISTS catches_is_promoted_idx ON catches (is_promoted) WHERE is_promoted = true;

-- ---------------------------------------------------------------------------
-- 4. RLS: somente admins podem promover/despromover catches
-- ---------------------------------------------------------------------------

-- Remove policies antigas se existirem (para re-execução segura)
DROP POLICY IF EXISTS "Dono pode editar captura"           ON catches;
DROP POLICY IF EXISTS "Admin pode promover captura"        ON catches;
DROP POLICY IF EXISTS "Admin pode editar spot"             ON fishing_spots;
DROP POLICY IF EXISTS "Admin pode deletar spot"            ON fishing_spots;

-- Dono edita apenas os campos que lhe pertencem (exceto campos de promoção)
CREATE POLICY "Dono pode editar captura"
  ON catches FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admin pode atualizar qualquer catch (inclusive campos de promoção)
CREATE POLICY "Admin pode promover captura"
  ON catches FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admin pode editar qualquer spot
CREATE POLICY "Admin pode editar spot"
  ON fishing_spots FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admin pode deletar qualquer spot
CREATE POLICY "Admin pode deletar spot"
  ON fishing_spots FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
