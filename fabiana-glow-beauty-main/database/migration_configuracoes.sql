-- ============================================================
-- MIGRATION: servicos.image_url + tabela configuracoes
-- Executar no Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. Adiciona coluna image_url em servicos (se ainda não existe)
ALTER TABLE servicos ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 2. Storage bucket para imagens dos serviços (ignore se já existe)
INSERT INTO storage.buckets (id, name, public)
VALUES ('servico-imagens', 'servico-imagens', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY IF NOT EXISTS "Public read servico-imagens"
  ON storage.objects FOR SELECT USING (bucket_id = 'servico-imagens');
CREATE POLICY IF NOT EXISTS "Auth insert servico-imagens"
  ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'servico-imagens');
CREATE POLICY IF NOT EXISTS "Auth update servico-imagens"
  ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'servico-imagens');
CREATE POLICY IF NOT EXISTS "Auth delete servico-imagens"
  ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'servico-imagens');

-- 3. Tabela configuracoes (única linha, padrão singleton)
CREATE TABLE IF NOT EXISTS configuracoes (
  id             UUID        PRIMARY KEY DEFAULT '00000000-0000-0000-0000-000000000001'::uuid,
  nome_clinica   TEXT        NOT NULL DEFAULT 'Glow Beauty',
  logo_url       TEXT,
  whatsapp       TEXT,
  telefone       TEXT,
  email          TEXT,
  endereco       TEXT,
  cidade         TEXT,
  instagram      TEXT,
  facebook       TEXT,
  tiktok         TEXT,
  horario_funcionamento TEXT,
  sobre          TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Row inicial (garante que a linha única existe)
INSERT INTO configuracoes (id)
VALUES ('00000000-0000-0000-0000-000000000001'::uuid)
ON CONFLICT (id) DO NOTHING;

-- RLS
ALTER TABLE configuracoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Authenticated read configuracoes"
  ON configuracoes FOR SELECT TO authenticated USING (true);
CREATE POLICY IF NOT EXISTS "Authenticated update configuracoes"
  ON configuracoes FOR UPDATE TO authenticated USING (true);

-- Storage bucket para logo
INSERT INTO storage.buckets (id, name, public)
VALUES ('glow-assets', 'glow-assets', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY IF NOT EXISTS "Public read glow-assets"
  ON storage.objects FOR SELECT USING (bucket_id = 'glow-assets');
CREATE POLICY IF NOT EXISTS "Auth insert glow-assets"
  ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'glow-assets');
CREATE POLICY IF NOT EXISTS "Auth update glow-assets"
  ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'glow-assets');
CREATE POLICY IF NOT EXISTS "Auth delete glow-assets"
  ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'glow-assets');
