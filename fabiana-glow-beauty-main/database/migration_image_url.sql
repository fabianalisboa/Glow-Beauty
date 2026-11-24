-- Migration: adiciona image_url na tabela servicos + bucket Supabase Storage
-- Executar no Supabase Dashboard → SQL Editor

ALTER TABLE servicos ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Criar bucket público para imagens de serviços
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'servico-imagens',
  'servico-imagens',
  true,
  5242880,
  ARRAY['image/jpeg','image/png','image/webp','image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Políticas de acesso ao storage
CREATE POLICY "Imagens de servico publicas" ON storage.objects
  FOR SELECT USING (bucket_id = 'servico-imagens');

CREATE POLICY "Admin pode fazer upload de imagens" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'servico-imagens');

CREATE POLICY "Admin pode deletar imagens" ON storage.objects
  FOR DELETE USING (bucket_id = 'servico-imagens');

CREATE POLICY "Admin pode atualizar imagens" ON storage.objects
  FOR UPDATE USING (bucket_id = 'servico-imagens');
