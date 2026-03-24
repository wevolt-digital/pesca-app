-- =============================================================================
-- FishingBR — Seed de dados de referência
-- Execute APÓS o schema.sql
-- Baseado nos dados de constants/mockData.ts
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Espécies de peixe
-- ON CONFLICT (name) DO NOTHING → idempotente via constraint fish_species_name_unique
-- id omitido: o banco gera o uuid via DEFAULT gen_random_uuid()
-- ---------------------------------------------------------------------------
INSERT INTO fish_species (name)
VALUES
  ('Tucunaré'),
  ('Pintado (Surubim)'),
  ('Dourado'),
  ('Pirarucu'),
  ('Robalo'),
  ('Traíra'),
  ('Tilápia'),
  ('Carpa'),
  ('Pacu'),
  ('Corvina'),
  ('Cachara'),
  ('Jaú'),
  ('Tambaqui'),
  ('Matrinxã'),
  ('Piraputanga'),
  ('Curimbatá'),
  ('Piranha-vermelha'),
  ('Lambari'),
  ('Jundiá'),
  ('Barbado'),
  ('Piapara'),
  ('Anchova'),
  ('Tainha'),
  ('Garoupa'),
  ('Vermelho (Cioba)'),
  ('Xaréu'),
  ('Olhete'),
  ('Atum-amarelo'),
  ('Agulhão-branco'),
  ('Mahi-mahi (Dourado do mar)')
ON CONFLICT (name) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Iscas / Lures
-- ON CONFLICT (name, type) DO NOTHING → idempotente via constraint lures_name_type_unique
-- ---------------------------------------------------------------------------
INSERT INTO lures (name, type, description)
VALUES
  ('Minhoca',            'natural',    'Isca natural clássica, eficaz para diversas espécies'),
  ('Camarão vivo',       'natural',    'Isca viva, excelente para robalo e corvina'),
  ('Peixe vivo',         'natural',    'Lambari, sardinha ou qualquer peixe pequeno como isca viva'),
  ('Pedaços de peixe',   'natural',    'Filé ou pedaço de peixe fresco como isca de fundo'),
  ('Milho',              'natural',    'Eficaz para tilápia, carpa e pacu'),
  ('Fruta (figo/manga)', 'natural',    'Isca de superfície para pacu e tambaqui'),
  ('Stick Bait',         'artificial', 'Isca de superfície para tucunaré e dourado'),
  ('Jig',                'jig',        'Isca de metal ou plástico para jigging vertical'),
  ('Isca de borracha',   'artificial', 'Soft plastic, imitando peixe ou camarão'),
  ('Popper',             'artificial', 'Isca de superfície com efeito splash'),
  ('Spinner',            'artificial', 'Lâmina giratória, eficaz em diversas espécies'),
  ('Mosca seca',         'fly',        'Para pesca com mosca em rios de correnteza'),
  ('Ninfa',              'fly',        'Mosca submersa, imitando larvas de inseto')
ON CONFLICT (name, type) DO NOTHING;
