-- ============================================================
-- SEED: fish_species (simplificado — apenas nome)
-- Cole no SQL Editor do Supabase e execute
-- ============================================================

INSERT INTO fish_species (name) VALUES
-- Água doce
('Tucunaré'),
('Dourado'),
('Pintado (Surubim)'),
('Cachara'),
('Jaú'),
('Pirarucu'),
('Traíra'),
('Pacu'),
('Tambaqui'),
('Matrinxã'),
('Piraputanga'),
('Curimbatá'),
('Piranha-vermelha'),
('Tilápia'),
('Lambari'),
('Jundiá'),
('Barbado'),
('Piapara'),
-- Água salgada
('Robalo'),
('Corvina'),
('Anchova'),
('Tainha'),
('Garoupa'),
('Vermelho (Cioba)'),
('Xaréu'),
('Olhete'),
('Atum-amarelo'),
('Agulhão-branco'),
('Mahi-mahi (Dourado do mar)')
ON CONFLICT (id) DO NOTHING;

-- Verificar resultado
SELECT id, name FROM fish_species ORDER BY name;
