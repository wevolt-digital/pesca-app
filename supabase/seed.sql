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
INSERT INTO fish_species (name, scientific_name, image_url, description, average_weight, habitat, popular_baits)
VALUES
  (
    'Tucunaré',
    'Cichla spp.',
    'https://images.pexels.com/photos/1363995/pexels-photo-1363995.jpeg?auto=compress&cs=tinysrgb&w=600',
    'Peixe esportivo muito popular na Amazônia',
    '3-8 kg',
    ARRAY['Rios', 'Lagos', 'Represas'],
    ARRAY['Isca artificial', 'Peixe vivo']
  ),
  (
    'Pintado',
    'Pseudoplatystoma corruscans',
    'https://images.pexels.com/photos/1078058/pexels-photo-1078058.jpeg?auto=compress&cs=tinysrgb&w=600',
    'Peixe de couro muito apreciado',
    '10-20 kg',
    ARRAY['Rios'],
    ARRAY['Peixe vivo', 'Pedaços de peixe']
  ),
  (
    'Dourado',
    'Salminus brasiliensis',
    'https://images.pexels.com/photos/5799896/pexels-photo-5799896.jpeg?auto=compress&cs=tinysrgb&w=600',
    'O rei do rio, lutador poderoso',
    '5-15 kg',
    ARRAY['Rios'],
    ARRAY['Isca artificial', 'Peixe vivo']
  ),
  (
    'Pirarucu',
    'Arapaima gigas',
    'https://images.pexels.com/photos/1374510/pexels-photo-1374510.jpeg?auto=compress&cs=tinysrgb&w=600',
    'Maior peixe de água doce da Amazônia',
    '100-150 kg',
    ARRAY['Rios', 'Lagos'],
    ARRAY['Peixe vivo']
  ),
  (
    'Robalo',
    'Centropomus spp.',
    'https://images.pexels.com/photos/1374510/pexels-photo-1374510.jpeg?auto=compress&cs=tinysrgb&w=600',
    'Peixe costeiro muito esportivo',
    '2-6 kg',
    ARRAY['Oceano', 'Estuários'],
    ARRAY['Camarão', 'Isca artificial']
  ),
  (
    'Traíra',
    'Hoplias malabaricus',
    'https://images.pexels.com/photos/1125776/pexels-photo-1125776.jpeg?auto=compress&cs=tinysrgb&w=600',
    'Predador voraz encontrado em todo Brasil',
    '1-3 kg',
    ARRAY['Rios', 'Lagos', 'Represas'],
    ARRAY['Minhoca', 'Peixe vivo', 'Isca artificial']
  ),
  (
    'Tilápia',
    'Oreochromis niloticus',
    NULL,
    'Espécie introduzida, muito comum em represas e pesqueiros',
    '0.5-2 kg',
    ARRAY['Represas', 'Pesqueiros', 'Rios lentos'],
    ARRAY['Milho', 'Pão', 'Minhoca']
  ),
  (
    'Carpa',
    'Cyprinus carpio',
    NULL,
    'Espécie de origem asiática, popular em pesqueiros',
    '2-10 kg',
    ARRAY['Represas', 'Pesqueiros', 'Lagos'],
    ARRAY['Milho', 'Massa', 'Pellet']
  ),
  (
    'Pacu',
    'Piaractus mesopotamicus',
    NULL,
    'Peixe de escama do Pantanal e rios da bacia do Prata',
    '3-12 kg',
    ARRAY['Rios', 'Represas'],
    ARRAY['Fruta', 'Milho', 'Minhoca']
  ),
  (
    'Corvina',
    'Micropogonias furnieri',
    NULL,
    'Peixe marinho muito apreciado na pesca de praia',
    '1-4 kg',
    ARRAY['Oceano', 'Estuários'],
    ARRAY['Camarão', 'Lula', 'Isca artificial']
  )
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
