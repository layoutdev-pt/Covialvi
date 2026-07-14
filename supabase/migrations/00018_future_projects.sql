-- Verifica e cria a tabela future_projects caso não exista
CREATE TABLE IF NOT EXISTS public.future_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    location TEXT,
    expected_launch_date DATE,
    status TEXT DEFAULT 'planning',
    image_url TEXT,
    features JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Permissões básicas (RLS) para permitir que qualquer pessoa leia (para a frontpage/api)
ALTER TABLE public.future_projects ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'future_projects' AND policyname = 'Projetos futuros visíveis para todos'
    ) THEN
        CREATE POLICY "Projetos futuros visíveis para todos" ON public.future_projects
            FOR SELECT USING (true);
    END IF;
END $$;

-- Forçar a atualização da cache do schema do Supabase (PostgREST)
NOTIFY pgrst, 'reload schema';
