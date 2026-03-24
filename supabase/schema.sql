-- =============================================================================
-- FishingBR — Schema inicial
-- Execute no Supabase Dashboard → SQL Editor
-- Idempotente: seguro para re-execução sem erros
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- Protegidos contra re-execução via bloco DO com EXCEPTION
-- ---------------------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE spot_type AS ENUM ('river', 'lake', 'ocean', 'reservoir', 'fishery');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE lure_type AS ENUM ('artificial', 'natural', 'fly', 'jig', 'other');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ---------------------------------------------------------------------------
-- Tabela: profiles
-- Criada automaticamente após cadastro via trigger no auth.users
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
  id          uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username    text        UNIQUE NOT NULL,
  name        text        NOT NULL,
  avatar_url  text,
  bio         text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- Constraint protegida: só adiciona se ainda não existir
DO $$ BEGIN
  ALTER TABLE profiles
    ADD CONSTRAINT profiles_username_format
    CHECK (username ~ '^[a-z0-9_]{3,30}$');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ---------------------------------------------------------------------------
-- Tabela: fish_species
-- Tabela de referência — populada via seed.sql
-- UNIQUE em name: evita espécies duplicadas no seed/re-seed
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS fish_species (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text        NOT NULL,
  created_at      timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fish_species_name_unique UNIQUE (name)
);

-- ---------------------------------------------------------------------------
-- Tabela: lures
-- Tabela de referência — populada via seed.sql
-- UNIQUE em (name, type): mesmo nome pode existir em tipos diferentes
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS lures (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text        NOT NULL,
  type        lure_type   NOT NULL,
  description text,
  image_url   text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT lures_name_type_unique UNIQUE (name, type)
);

-- ---------------------------------------------------------------------------
-- Tabela: fishing_spots
-- Checks de coordenadas geográficas válidas
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS fishing_spots (
  id            uuid             PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text             NOT NULL,
  lat           double precision NOT NULL CHECK (lat BETWEEN -90  AND 90),
  lng           double precision NOT NULL CHECK (lng BETWEEN -180 AND 180),
  city          text             NOT NULL,
  state         char(2)          NOT NULL CHECK (state ~ '^[A-Z]{2}$'),
  type          spot_type        NOT NULL,
  rating        numeric(3,2)     NOT NULL DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  total_catches integer          NOT NULL DEFAULT 0 CHECK (total_catches >= 0),
  description   text,
  added_by      uuid             REFERENCES profiles(id) ON DELETE SET NULL,
  photos        text[]           NOT NULL DEFAULT '{}',
  created_at    timestamptz      NOT NULL DEFAULT now(),
  updated_at    timestamptz      NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS fishing_spots_type_idx     ON fishing_spots (type);
CREATE INDEX IF NOT EXISTS fishing_spots_state_idx    ON fishing_spots (state);
CREATE INDEX IF NOT EXISTS fishing_spots_added_by_idx ON fishing_spots (added_by);

-- ---------------------------------------------------------------------------
-- Tabela: catches
-- Checks de peso, comprimento e coordenadas
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS catches (
  id               uuid             PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid             NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  species_id       uuid             REFERENCES fish_species(id) ON DELETE SET NULL,
  species_name     text             NOT NULL,
  weight           numeric(8,3)     NOT NULL CHECK (weight > 0),           -- kg
  length           numeric(6,1)     CHECK (length IS NULL OR length > 0),  -- cm
  lure_id          uuid             REFERENCES lures(id) ON DELETE SET NULL,
  bait_description text             NOT NULL,
  lat              double precision NOT NULL CHECK (lat BETWEEN -90  AND 90),
  lng              double precision NOT NULL CHECK (lng BETWEEN -180 AND 180),
  location_name    text             NOT NULL,
  fishing_spot_id  uuid             REFERENCES fishing_spots(id) ON DELETE SET NULL,
  photo_url        text,
  notes            text,
  caught_at        timestamptz      NOT NULL DEFAULT now(),
  likes_count      integer          NOT NULL DEFAULT 0 CHECK (likes_count >= 0),
  comments_count   integer          NOT NULL DEFAULT 0 CHECK (comments_count >= 0),
  created_at       timestamptz      NOT NULL DEFAULT now(),
  updated_at       timestamptz      NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS catches_user_id_idx      ON catches (user_id);
CREATE INDEX IF NOT EXISTS catches_caught_at_idx    ON catches (caught_at DESC);
CREATE INDEX IF NOT EXISTS catches_fishing_spot_idx ON catches (fishing_spot_id);
CREATE INDEX IF NOT EXISTS catches_species_id_idx   ON catches (species_id);

-- ---------------------------------------------------------------------------
-- Tabela: catch_likes
-- Relacionamento N:N entre catches e profiles
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS catch_likes (
  catch_id    uuid        NOT NULL REFERENCES catches(id) ON DELETE CASCADE,
  user_id     uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (catch_id, user_id)
);

-- ---------------------------------------------------------------------------
-- Função: atualiza updated_at automaticamente
-- CREATE OR REPLACE é idempotente por natureza
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Triggers de updated_at — DROP IF EXISTS garante re-execução segura
DROP TRIGGER IF EXISTS set_profiles_updated_at     ON profiles;
DROP TRIGGER IF EXISTS set_fishing_spots_updated_at ON fishing_spots;
DROP TRIGGER IF EXISTS set_catches_updated_at       ON catches;

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_fishing_spots_updated_at
  BEFORE UPDATE ON fishing_spots
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_catches_updated_at
  BEFORE UPDATE ON catches
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- ---------------------------------------------------------------------------
-- Função: cria profile automaticamente ao registrar usuário no Auth
--
-- Normalização do username:
--   1. Usa metadata 'username' ou prefixo do e-mail como ponto de partida
--   2. Converte para lowercase
--   3. Remove todos os caracteres fora de [a-z0-9_]
--   4. Se ficar com menos de 3 chars, substitui por fallback baseado no uuid
--   5. Trunca para 24 chars (reserva espaço para sufixo de conflito)
--   6. Se houver colisão de username, adiciona sufixo único de 6 chars do uuid
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  raw_input      text;
  clean_username text;
  final_username text;
  uuid_fragment  text;
BEGIN
  -- Fragmento do uuid sem hífens, usado como fallback e sufixo anti-colisão
  uuid_fragment := replace(NEW.id::text, '-', '');

  -- 1. Ponto de partida: metadata 'username' → prefixo do e-mail → 'user'
  raw_input := COALESCE(
    NULLIF(trim(NEW.raw_user_meta_data->>'username'), ''),
    NULLIF(split_part(NEW.email, '@', 1), ''),
    'user'
  );

  -- 2. Lowercase + remoção de caracteres inválidos
  clean_username := regexp_replace(lower(raw_input), '[^a-z0-9_]', '', 'g');

  -- 3. Fallback seguro se resultado for vazio ou curto demais
  IF length(clean_username) < 3 THEN
    clean_username := 'user_' || substr(uuid_fragment, 1, 10);
  END IF;

  -- 4. Trunca para 24 chars (deixa margem para sufixo "_xxxxxx" = +7)
  clean_username := substr(clean_username, 1, 24);

  -- 5. Resolve colisões de username com sufixo do uuid
  final_username := clean_username;
  IF EXISTS (SELECT 1 FROM public.profiles WHERE username = final_username) THEN
    final_username := substr(clean_username, 1, 23) || '_' || substr(uuid_fragment, 1, 6);
  END IF;

  INSERT INTO public.profiles (id, username, name, avatar_url)
  VALUES (
    NEW.id,
    final_username,
    COALESCE(NULLIF(trim(NEW.raw_user_meta_data->>'name'), ''), 'Novo Pescador'),
    NULLIF(trim(COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      NEW.raw_user_meta_data->>'picture',
      ''
    )), '')
  );

  RETURN NEW;
END;
$$;

-- Trigger de novo usuário — DROP IF EXISTS garante re-execução segura
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ---------------------------------------------------------------------------
-- Row Level Security (RLS)
-- Policies recriadas com DROP IF EXISTS para idempotência
-- ---------------------------------------------------------------------------

-- profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Perfis visíveis para todos"           ON profiles;
DROP POLICY IF EXISTS "Usuário edita apenas o próprio perfil" ON profiles;

CREATE POLICY "Perfis visíveis para todos"
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Usuário edita apenas o próprio perfil"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- fishing_spots
ALTER TABLE fishing_spots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Spots visíveis para todos"          ON fishing_spots;
DROP POLICY IF EXISTS "Usuário autenticado pode criar spot" ON fishing_spots;
DROP POLICY IF EXISTS "Criador pode editar o spot"         ON fishing_spots;
DROP POLICY IF EXISTS "Criador pode deletar o spot"        ON fishing_spots;

CREATE POLICY "Spots visíveis para todos"
  ON fishing_spots FOR SELECT USING (true);

CREATE POLICY "Usuário autenticado pode criar spot"
  ON fishing_spots FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Criador pode editar o spot"
  ON fishing_spots FOR UPDATE USING (auth.uid() = added_by);

CREATE POLICY "Criador pode deletar o spot"
  ON fishing_spots FOR DELETE USING (auth.uid() = added_by);

-- fish_species (somente leitura para usuários)
ALTER TABLE fish_species ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Espécies visíveis para todos" ON fish_species;

CREATE POLICY "Espécies visíveis para todos"
  ON fish_species FOR SELECT USING (true);

-- lures (somente leitura para usuários)
ALTER TABLE lures ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Iscas visíveis para todos" ON lures;

CREATE POLICY "Iscas visíveis para todos"
  ON lures FOR SELECT USING (true);

-- catches
ALTER TABLE catches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Capturas visíveis para todos"            ON catches;
DROP POLICY IF EXISTS "Usuário autenticado pode registrar captura" ON catches;
DROP POLICY IF EXISTS "Dono pode editar captura"                ON catches;
DROP POLICY IF EXISTS "Dono pode deletar captura"               ON catches;

CREATE POLICY "Capturas visíveis para todos"
  ON catches FOR SELECT USING (true);

CREATE POLICY "Usuário autenticado pode registrar captura"
  ON catches FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Dono pode editar captura"
  ON catches FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Dono pode deletar captura"
  ON catches FOR DELETE USING (auth.uid() = user_id);

-- catch_likes
ALTER TABLE catch_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Likes visíveis para todos"     ON catch_likes;
DROP POLICY IF EXISTS "Usuário autenticado pode curtir" ON catch_likes;
DROP POLICY IF EXISTS "Usuário pode descurtir"        ON catch_likes;

CREATE POLICY "Likes visíveis para todos"
  ON catch_likes FOR SELECT USING (true);

CREATE POLICY "Usuário autenticado pode curtir"
  ON catch_likes FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuário pode descurtir"
  ON catch_likes FOR DELETE USING (auth.uid() = user_id);
