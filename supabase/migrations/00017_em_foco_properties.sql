-- Eliminar a tabela premium_highlights existente
DROP TABLE IF EXISTS premium_highlights CASCADE;

-- Adicionar a nova coluna "em_foco" à tabela properties
ALTER TABLE properties
ADD COLUMN em_foco BOOLEAN NOT NULL DEFAULT false;

-- Opcional: Criar um índice para optimizar consultas de imóveis em foco
CREATE INDEX IF NOT EXISTS idx_properties_em_foco ON properties(em_foco) WHERE em_foco = true;
