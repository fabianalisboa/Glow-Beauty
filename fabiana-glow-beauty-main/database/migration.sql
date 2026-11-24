-- ============================================================
-- Fabiana Glow Beauty — Migration Principal
-- Execute no Supabase SQL Editor:
-- https://supabase.com/dashboard/project/vasoeaadevgwfnmdzqmp/sql
-- ============================================================

-- Clientes
CREATE TABLE IF NOT EXISTS clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(100) NOT NULL,
  telefone VARCHAR(20),
  email VARCHAR(100),
  status VARCHAR(20) DEFAULT 'ativo' CHECK (status IN ('ativo','inativo')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Profissionais
CREATE TABLE IF NOT EXISTS profissionais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(100) NOT NULL,
  especialidade VARCHAR(100),
  telefone VARCHAR(20),
  email VARCHAR(100),
  status VARCHAR(20) DEFAULT 'ativo' CHECK (status IN ('ativo','inativo')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Servicos
CREATE TABLE IF NOT EXISTS servicos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(100) NOT NULL,
  descricao TEXT,
  valor DECIMAL(10,2) NOT NULL DEFAULT 0,
  duracao_minutos INTEGER NOT NULL DEFAULT 60,
  status VARCHAR(20) DEFAULT 'ativo' CHECK (status IN ('ativo','inativo')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Agendamentos
CREATE TABLE IF NOT EXISTS agendamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL,
  profissional_id UUID REFERENCES profissionais(id) ON DELETE SET NULL,
  servico_id UUID REFERENCES servicos(id) ON DELETE SET NULL,
  data_agendamento DATE NOT NULL,
  horario TIME NOT NULL,
  status VARCHAR(30) DEFAULT 'pendente' CHECK (status IN ('pendente','confirmado','concluido','cancelado')),
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Pagamentos
CREATE TABLE IF NOT EXISTS pagamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agendamento_id UUID REFERENCES agendamentos(id) ON DELETE SET NULL,
  valor DECIMAL(10,2) NOT NULL DEFAULT 0,
  forma_pagamento VARCHAR(50),
  data_pagamento TIMESTAMPTZ DEFAULT now(),
  status VARCHAR(30) DEFAULT 'pago' CHECK (status IN ('pago','pendente','cancelado'))
);

-- Produtos
CREATE TABLE IF NOT EXISTS produtos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(100) NOT NULL,
  categoria VARCHAR(100),
  quantidade INTEGER NOT NULL DEFAULT 0,
  valor_unitario DECIMAL(10,2),
  status VARCHAR(30) DEFAULT 'ativo' CHECK (status IN ('ativo','inativo')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Movimentações de Estoque
CREATE TABLE IF NOT EXISTS movimentacoes_estoque (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  produto_id UUID REFERENCES produtos(id) ON DELETE SET NULL,
  tipo_movimentacao VARCHAR(20) NOT NULL CHECK (tipo_movimentacao IN ('entrada','saida')),
  quantidade INTEGER NOT NULL,
  observacao TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- RLS — Row Level Security
-- ============================================================
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE profissionais ENABLE ROW LEVEL SECURITY;
ALTER TABLE servicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE agendamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimentacoes_estoque ENABLE ROW LEVEL SECURITY;

-- Serviços: leitura pública (para landing page)
CREATE POLICY "servicos_public_read" ON servicos FOR SELECT USING (status = 'ativo');

-- Todos os módulos: acesso total para autenticados
CREATE POLICY "clientes_auth_all" ON clientes FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "profissionais_auth_all" ON profissionais FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "servicos_auth_all" ON servicos FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "agendamentos_auth_all" ON agendamentos FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "pagamentos_auth_all" ON pagamentos FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "produtos_auth_all" ON produtos FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "movimentacoes_auth_all" ON movimentacoes_estoque FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Agendamentos: anônimos podem inserir (formulário público de agendamento)
CREATE POLICY "agendamentos_public_insert" ON agendamentos FOR INSERT TO anon WITH CHECK (true);

-- ============================================================
-- Dados de exemplo (opcional)
-- ============================================================
INSERT INTO servicos (nome, descricao, valor, duracao_minutos) VALUES
  ('Limpeza de Pele', 'Limpeza profunda com extração e máscara hidratante', 120.00, 60),
  ('Design de Sobrancelhas', 'Modelagem com linha e coloração', 50.00, 30),
  ('Extensão de Cílios', 'Aplicação fio a fio em cílios naturais', 180.00, 120),
  ('Massagem Relaxante', 'Massagem corporal com óleos essenciais', 150.00, 60),
  ('Peeling Químico', 'Renovação celular com ácidos profissionais', 200.00, 45),
  ('Hidratação Capilar', 'Tratamento intensivo para cabelos ressecados', 80.00, 40)
ON CONFLICT DO NOTHING;
