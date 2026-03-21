-- =============================================================================
-- FishingBR — Configuração de Storage Buckets
-- Execute no Supabase Dashboard → SQL Editor
-- Idempotente: seguro para re-execução sem erros
-- (Alternativamente, crie os buckets pela UI do Storage e aplique só as policies)
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Bucket: catch-photos
-- Fotos de capturas registradas pelos usuários
-- ---------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'catch-photos',
  'catch-photos',
  true,                          -- leitura pública (URLs diretas nas páginas)
  5242880,                       -- limite de 5 MB por arquivo
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Bucket: spot-photos
-- Fotos dos pontos de pesca
-- ---------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'spot-photos',
  'spot-photos',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Bucket: avatars
-- Fotos de perfil dos usuários
-- ---------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  2097152,                       -- limite de 2 MB para avatars
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Policies: catch-photos
-- Convenção de path: {user_id}/{uuid}.{ext}
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "catch-photos: leitura pública"   ON storage.objects;
DROP POLICY IF EXISTS "catch-photos: upload pelo dono"  ON storage.objects;
DROP POLICY IF EXISTS "catch-photos: update pelo dono"  ON storage.objects;
DROP POLICY IF EXISTS "catch-photos: delete pelo dono"  ON storage.objects;

-- Qualquer pessoa pode visualizar
CREATE POLICY "catch-photos: leitura pública"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'catch-photos');

-- Apenas usuário autenticado pode fazer upload na própria pasta
CREATE POLICY "catch-photos: upload pelo dono"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'catch-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Apenas o dono pode atualizar; WITH CHECK garante que o arquivo
-- não pode ser movido para a pasta de outro usuário durante o update
CREATE POLICY "catch-photos: update pelo dono"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'catch-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id = 'catch-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Apenas o dono pode deletar
CREATE POLICY "catch-photos: delete pelo dono"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'catch-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ---------------------------------------------------------------------------
-- Policies: spot-photos
-- Convenção de path: {user_id}/{uuid}.{ext}
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "spot-photos: leitura pública"   ON storage.objects;
DROP POLICY IF EXISTS "spot-photos: upload pelo dono"  ON storage.objects;
DROP POLICY IF EXISTS "spot-photos: update pelo dono"  ON storage.objects;
DROP POLICY IF EXISTS "spot-photos: delete pelo dono"  ON storage.objects;

CREATE POLICY "spot-photos: leitura pública"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'spot-photos');

CREATE POLICY "spot-photos: upload pelo dono"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'spot-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "spot-photos: update pelo dono"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'spot-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id = 'spot-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "spot-photos: delete pelo dono"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'spot-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ---------------------------------------------------------------------------
-- Policies: avatars
-- Convenção de path: {user_id}/avatar.{ext}
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "avatars: leitura pública"                ON storage.objects;
DROP POLICY IF EXISTS "avatars: upload pelo próprio usuário"    ON storage.objects;
DROP POLICY IF EXISTS "avatars: update pelo próprio usuário"    ON storage.objects;
DROP POLICY IF EXISTS "avatars: delete pelo próprio usuário"    ON storage.objects;

-- Path do avatar: {user_id}/avatar.{ext} — o user_id é o primeiro segmento
CREATE POLICY "avatars: leitura pública"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "avatars: upload pelo próprio usuário"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "avatars: update pelo próprio usuário"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "avatars: delete pelo próprio usuário"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
