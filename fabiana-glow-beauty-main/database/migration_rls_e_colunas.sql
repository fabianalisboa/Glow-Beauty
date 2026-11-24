-- ============================================================
-- MIGRATION COMPLETA: RLS policies + colunas ausentes
-- Executar no Supabase Dashboard > SQL Editor
-- ============================================================

-- ── 1. COLUNA image_url em servicos ─────────────────────────
ALTER TABLE servicos ADD COLUMN IF NOT EXISTS image_url TEXT;

-- ── 2. TABELA configuracoes (singleton) ──────────────────────
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

INSERT INTO configuracoes (id)
VALUES ('00000000-0000-0000-0000-000000000001'::uuid)
ON CONFLICT (id) DO NOTHING;

-- ── 3. STORAGE BUCKETS ───────────────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('servico-imagens', 'servico-imagens', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('glow-assets', 'glow-assets', true)
ON CONFLICT (id) DO NOTHING;

-- ── 4. RLS – habilitar em todas as tabelas ───────────────────
ALTER TABLE servicos          ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes          ENABLE ROW LEVEL SECURITY;
ALTER TABLE profissionais     ENABLE ROW LEVEL SECURITY;
ALTER TABLE agendamentos      ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagamentos        ENABLE ROW LEVEL SECURITY;
ALTER TABLE produtos          ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracoes     ENABLE ROW LEVEL SECURITY;

-- ── 5. POLICIES – servicos ───────────────────────────────────
DROP POLICY IF EXISTS "anon_select_servicos"   ON servicos;
DROP POLICY IF EXISTS "auth_all_servicos"      ON servicos;

CREATE POLICY "anon_select_servicos"
  ON servicos FOR SELECT USING (true);

CREATE POLICY "auth_all_servicos"
  ON servicos FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ── 6. POLICIES – clientes ───────────────────────────────────
DROP POLICY IF EXISTS "auth_all_clientes" ON clientes;

CREATE POLICY "auth_all_clientes"
  ON clientes FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ── 7. POLICIES – profissionais ──────────────────────────────
DROP POLICY IF EXISTS "anon_select_profissionais" ON profissionais;
DROP POLICY IF EXISTS "auth_all_profissionais"    ON profissionais;

CREATE POLICY "anon_select_profissionais"
  ON profissionais FOR SELECT USING (true);

CREATE POLICY "auth_all_profissionais"
  ON profissionais FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ── 8. POLICIES – agendamentos ───────────────────────────────
DROP POLICY IF EXISTS "anon_insert_agendamentos" ON agendamentos;
DROP POLICY IF EXISTS "auth_all_agendamentos"    ON agendamentos;

-- Público pode criar agendamento (página pública)
CREATE POLICY "anon_insert_agendamentos"
  ON agendamentos FOR INSERT WITH CHECK (true);

CREATE POLICY "auth_all_agendamentos"
  ON agendamentos FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ── 9. POLICIES – pagamentos ─────────────────────────────────
DROP POLICY IF EXISTS "auth_all_pagamentos" ON pagamentos;

CREATE POLICY "auth_all_pagamentos"
  ON pagamentos FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ── 10. POLICIES – produtos ──────────────────────────────────
DROP POLICY IF EXISTS "auth_all_produtos" ON produtos;

CREATE POLICY "auth_all_produtos"
  ON produtos FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ── 11. POLICIES – configuracoes ─────────────────────────────
DROP POLICY IF EXISTS "anon_select_configuracoes"  ON configuracoes;
DROP POLICY IF EXISTS "auth_select_configuracoes"  ON configuracoes;
DROP POLICY IF EXISTS "auth_update_configuracoes"  ON configuracoes;

-- Leitura pública (footer, CTA da homepage)
CREATE POLICY "anon_select_configuracoes"
  ON configuracoes FOR SELECT USING (true);

-- Escrita apenas autenticado
CREATE POLICY "auth_update_configuracoes"
  ON configuracoes FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- ── 12. POLICIES – storage buckets ───────────────────────────
-- servico-imagens
DROP POLICY IF EXISTS "pub_read_servico_img"    ON storage.objects;
DROP POLICY IF EXISTS "auth_write_servico_img"  ON storage.objects;

CREATE POLICY "pub_read_servico_img"
  ON storage.objects FOR SELECT USING (bucket_id = 'servico-imagens');

CREATE POLICY "auth_write_servico_img"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'servico-imagens');

CREATE POLICY "auth_update_servico_img"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'servico-imagens');

CREATE POLICY "auth_delete_servico_img"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'servico-imagens');

-- glow-assets
CREATE POLICY "pub_read_glow_assets"
  ON storage.objects FOR SELECT USING (bucket_id = 'glow-assets');

CREATE POLICY "auth_write_glow_assets"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'glow-assets');

CREATE POLICY "auth_update_glow_assets"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'glow-assets');

CREATE POLICY "auth_delete_glow_assets"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'glow-assets');

-- ── 13. movimentacoes_estoque (se existir) ───────────────────
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'movimentacoes_estoque') THEN
    ALTER TABLE movimentacoes_estoque ENABLE ROW LEVEL SECURITY;
    EXECUTE 'DROP POLICY IF EXISTS "auth_all_movimentacoes" ON movimentacoes_estoque';
    EXECUTE 'CREATE POLICY "auth_all_movimentacoes" ON movimentacoes_estoque FOR ALL TO authenticated USING (true) WITH CHECK (true)';
  END IF;
END $$;

-- ── Fim ──────────────────────────────────────────────────────
-- Após executar: recarregue o app e teste salvar um serviço.
