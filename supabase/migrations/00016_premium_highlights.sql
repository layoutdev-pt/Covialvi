-- Nova tabela para gerir os 3 imóveis em destaque premium ("Em Foco")
CREATE TABLE premium_highlights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    position INTEGER NOT NULL CHECK (position >= 1 AND position <= 3),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- Garantir que cada posição (1, 2, 3) tem apenas 1 imóvel e que o imóvel só pode estar numa posição
    UNIQUE(position),
    UNIQUE(property_id)
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE premium_highlights ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
-- Leitura pública para todos os utilizadores
CREATE POLICY "Public read access to premium_highlights"
    ON premium_highlights FOR SELECT
    USING (true);

-- Permissões de escrita/alteração para administradores
CREATE POLICY "Admin full access to premium_highlights"
    ON premium_highlights FOR ALL
    USING (
        auth.uid() IN (
            SELECT id FROM profiles WHERE role IN ('admin', 'super_admin')
        )
    );
