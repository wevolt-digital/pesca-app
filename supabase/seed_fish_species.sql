-- ============================================================
-- SEED: fish_species (simplificado — apenas nome)
-- Cole no SQL Editor do Supabase e execute
-- ============================================================

INSERT INTO fish_species (name) VALUES
-- Água doce
('Acará'), ('Apapá'), ('Armau'), ('Arraia'), ('Aruanã'),
('Bagre-africano'), ('Barbado'), ('Bicuda'), ('Black Bass'),
('Cachapira'), ('Cachara'), ('Cachorra'), ('Caparari'),
('Carpa cabeçuda'), ('Carpa capim'), ('Carpa comum'), ('Carpa húngara'), ('Carpa koi'),
('Cascudo'), ('Catfish'), ('Corvina de água doce'), ('Curimba'),
('Dourado'), ('Jacundá'), ('Jaú'), ('Jundiá'), ('Lambari'),
('Mandi'), ('Matrinxã'), ('Oscar'), ('Pacu'), ('Patinga'),
('Piapara'), ('Piau'), ('Piavuçu'), ('Pincachara'), ('Pintado'),
('Piraíba'), ('Piranha-preta'), ('Piranha-vermelha'), ('Pirapitinga'),
('Piraputanga'), ('Pirarara'), ('Pirarucu'), ('Surubim-chicote'),
('Tabarana'), ('Tambacu'), ('Tambaqui'), ('Tambatinga'),
('Tilápia'), ('Tilápia do Nilo'), ('Tilápia Saint-Peter'),
('Traíra comum'), ('Traíra Tornasol'), ('Traírão'), ('Truta arco-íris'),
('Tucunaré Açu'), ('Tucunaré Amarelo'), ('Tucunaré Azul'),
('Tucunaré Paca'), ('Tucunaré Paca-Açu'), ('Tucunaré Pinima'),
-- Água salgada
('Robalo-peva'), ('Robalo-flecha'), ('Tarpon'), ('Tainha'),
('Anchova'), ('Xaréu'), ('Olhete'), ('Garoupa'), ('Badejo'),
('Pargo'), ('Cioba'), ('Vermelho'), ('Caranha'), ('Enchova'),
('Cavala'), ('Sororoca'), ('Atum-amarelo'), ('Atum-azul'),
('Barracuda'), ('Bonito'), ('Dourado do mar'), ('Marlim'), ('Pampo'),
('Sargo'), ('Corvina de água salgada'), ('Pescada'), ('Linguado'),
('Bagre do mar'), ('Cação'), ('Ubarana'), ('Baiacu'),
('Olho-de-boi'), ('Cherne'), ('Piracanjuba')
ON CONFLICT (name) DO NOTHING;

-- Verificar resultado
SELECT id, name FROM fish_species ORDER BY name;
