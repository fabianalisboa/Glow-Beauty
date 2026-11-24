-- ============================================================
-- FABIANA GLOW BEAUTY — Setup Completo
-- Execute TUDO de uma vez no SQL Editor:
-- https://supabase.com/dashboard/project/vasoeaadevgwfnmdzqmp/sql/new
-- ============================================================

-- ============================================================
-- 1. TABELAS
-- ============================================================

CREATE TABLE IF NOT EXISTS profissionais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(100) NOT NULL,
  especialidade VARCHAR(100),
  telefone VARCHAR(20),
  email VARCHAR(100),
  status VARCHAR(20) DEFAULT 'ativo' CHECK (status IN ('ativo','inativo')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(100) NOT NULL,
  telefone VARCHAR(20),
  email VARCHAR(100),
  status VARCHAR(20) DEFAULT 'ativo' CHECK (status IN ('ativo','inativo')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS servicos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(100) NOT NULL,
  descricao TEXT,
  valor DECIMAL(10,2) NOT NULL DEFAULT 0,
  duracao_minutos INTEGER NOT NULL DEFAULT 60,
  status VARCHAR(20) DEFAULT 'ativo' CHECK (status IN ('ativo','inativo')),
  created_at TIMESTAMPTZ DEFAULT now()
);

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

CREATE TABLE IF NOT EXISTS pagamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agendamento_id UUID REFERENCES agendamentos(id) ON DELETE SET NULL,
  valor DECIMAL(10,2) NOT NULL DEFAULT 0,
  forma_pagamento VARCHAR(50),
  data_pagamento TIMESTAMPTZ DEFAULT now(),
  status VARCHAR(30) DEFAULT 'pago' CHECK (status IN ('pago','pendente','cancelado'))
);

CREATE TABLE IF NOT EXISTS produtos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(100) NOT NULL,
  categoria VARCHAR(100),
  quantidade INTEGER NOT NULL DEFAULT 0,
  valor_unitario DECIMAL(10,2),
  status VARCHAR(30) DEFAULT 'ativo' CHECK (status IN ('ativo','inativo')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS movimentacoes_estoque (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  produto_id UUID REFERENCES produtos(id) ON DELETE SET NULL,
  tipo_movimentacao VARCHAR(20) NOT NULL CHECK (tipo_movimentacao IN ('entrada','saida')),
  quantidade INTEGER NOT NULL,
  observacao TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 2. RLS — POLÍTICAS PERMISSIVAS (NÃO TRAVAM O APP)
-- ============================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE clientes            ENABLE ROW LEVEL SECURITY;
ALTER TABLE profissionais       ENABLE ROW LEVEL SECURITY;
ALTER TABLE servicos            ENABLE ROW LEVEL SECURITY;
ALTER TABLE agendamentos        ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagamentos          ENABLE ROW LEVEL SECURITY;
ALTER TABLE produtos            ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimentacoes_estoque ENABLE ROW LEVEL SECURITY;

-- Remover policies antigas (se existirem)
DROP POLICY IF EXISTS "clientes_auth_all"          ON clientes;
DROP POLICY IF EXISTS "profissionais_auth_all"     ON profissionais;
DROP POLICY IF EXISTS "servicos_auth_all"          ON servicos;
DROP POLICY IF EXISTS "servicos_public_read"       ON servicos;
DROP POLICY IF EXISTS "agendamentos_auth_all"      ON agendamentos;
DROP POLICY IF EXISTS "agendamentos_public_insert" ON agendamentos;
DROP POLICY IF EXISTS "pagamentos_auth_all"        ON pagamentos;
DROP POLICY IF EXISTS "produtos_auth_all"          ON produtos;
DROP POLICY IF EXISTS "movimentacoes_auth_all"     ON movimentacoes_estoque;

-- CLIENTES
-- Usuários autenticados: acesso total
CREATE POLICY "clientes_auth_all" ON clientes
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
-- Anônimo pode inserir (formulário público de agendamento)
CREATE POLICY "clientes_anon_insert" ON clientes
  FOR INSERT TO anon WITH CHECK (true);
-- Anônimo pode ler para checar duplicata por telefone
CREATE POLICY "clientes_anon_select" ON clientes
  FOR SELECT TO anon USING (true);

-- PROFISSIONAIS
-- Autenticados: acesso total
CREATE POLICY "profissionais_auth_all" ON profissionais
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
-- Anônimo pode ler (para exibir no formulário de agendamento)
CREATE POLICY "profissionais_anon_read" ON profissionais
  FOR SELECT TO anon USING (status = 'ativo');

-- SERVIÇOS
-- Autenticados: acesso total
CREATE POLICY "servicos_auth_all" ON servicos
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
-- Anônimo pode ler serviços ativos (landing page + formulário)
CREATE POLICY "servicos_anon_read" ON servicos
  FOR SELECT TO anon USING (status = 'ativo');

-- AGENDAMENTOS
-- Autenticados: acesso total
CREATE POLICY "agendamentos_auth_all" ON agendamentos
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
-- Anônimo pode inserir (formulário público)
CREATE POLICY "agendamentos_anon_insert" ON agendamentos
  FOR INSERT TO anon WITH CHECK (true);

-- PAGAMENTOS
-- Autenticados: acesso total
CREATE POLICY "pagamentos_auth_all" ON pagamentos
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- PRODUTOS
-- Autenticados: acesso total
CREATE POLICY "produtos_auth_all" ON produtos
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- MOVIMENTAÇÕES DE ESTOQUE
-- Autenticados: acesso total
CREATE POLICY "movimentacoes_auth_all" ON movimentacoes_estoque
  FOR ALL TO authenticated USING (true) WITH CHECK (true);


-- ============================================================
-- 3. DADOS DE EXEMPLO
-- ============================================================

-- Profissionais
INSERT INTO profissionais (nome, especialidade, telefone, email, status) VALUES
  ('Fabiana Lisboa',    'Esteticista Facial',        '(53) 99123-4567', 'fabiana@glowbeauty.com',  'ativo'),
  ('Carla Mendes',      'Extensão de Cílios',         '(53) 99234-5678', 'carla@glowbeauty.com',    'ativo'),
  ('Juliana Ferreira',  'Massagista e Corporal',      '(53) 99345-6789', 'juliana@glowbeauty.com',  'ativo'),
  ('Patrícia Oliveira', 'Design de Sobrancelhas',     '(53) 99456-7890', 'patricia@glowbeauty.com', 'ativo'),
  ('Renata Costa',      'Coloração e Tratamentos',    '(53) 99567-8901', 'renata@glowbeauty.com',   'inativo')
ON CONFLICT DO NOTHING;

-- Serviços
INSERT INTO servicos (nome, descricao, valor, duracao_minutos, status) VALUES
  ('Limpeza de Pele Profunda',   'Higienização completa com extração, esfoliação e máscara hidratante. Indicada para todos os tipos de pele.',        120.00, 60,  'ativo'),
  ('Design de Sobrancelhas',     'Modelagem personalizada com linha e henna. Realça o olhar e define o contorno do rosto.',                            55.00,  30,  'ativo'),
  ('Extensão de Cílios Fio a Fio','Aplicação artesanal com fios de seda premium. Resultado natural e duradouro por até 4 semanas.',                   190.00, 120, 'ativo'),
  ('Massagem Relaxante Corporal', 'Massagem com óleos essenciais aromáticos. Alivia tensões, melhora circulação e proporciona bem-estar total.',       160.00, 60,  'ativo'),
  ('Peeling Químico',             'Renovação celular com ácidos profissionais (AHA/BHA). Trata manchas, linhas finas e poros dilatados.',              220.00, 45,  'ativo'),
  ('Hidratação Capilar',          'Tratamento intensivo de hidratação para cabelos ressecados, com máscara nutritiva e selagem dos fios.',               90.00, 50,  'ativo'),
  ('Drenagem Linfática Facial',   'Técnica manual que reduz inchaço, melhora a oxigenação da pele e promove o contorno facial.',                      130.00, 45,  'ativo'),
  ('Micropigmentação de Lábios',  'Técnica semipermanente para realçar a cor e o contorno dos lábios. Dura até 2 anos.',                              350.00, 150, 'ativo'),
  ('Manicure e Pedicure',         'Cuidado completo das unhas com esmaltação de longa duração e hidratação das cutículas.',                            70.00,  60,  'ativo'),
  ('Pacote Noiva Completo',       'Maquiagem, penteado, limpeza de pele e extensão de cílios. Inclui teste 30 dias antes do evento.',                 800.00, 300, 'ativo')
ON CONFLICT DO NOTHING;

-- Clientes
INSERT INTO clientes (nome, telefone, email, status) VALUES
  ('Ana Paula Rodrigues',   '(53) 99611-1111', 'ana.paula@email.com',   'ativo'),
  ('Beatriz Santos Silva',  '(53) 99622-2222', 'beatriz@email.com',     'ativo'),
  ('Camila Pereira',        '(53) 99633-3333', 'camila@email.com',      'ativo'),
  ('Daniela Medeiros',      '(53) 99644-4444', 'daniela@email.com',     'ativo'),
  ('Eduarda Fonseca',       '(53) 99655-5555', 'eduarda@email.com',     'ativo'),
  ('Fernanda Lima',         '(53) 99666-6666', 'fernanda@email.com',    'ativo'),
  ('Gabriela Souza',        '(53) 99677-7777', 'gabriela@email.com',    'ativo'),
  ('Helena Carvalho',       '(53) 99688-8888', 'helena@email.com',      'ativo'),
  ('Isabela Teixeira',      '(53) 99699-9999', 'isabela@email.com',     'ativo'),
  ('Juliana Machado',       '(53) 99700-0001', 'juliana.m@email.com',   'ativo'),
  ('Karen Alves',           '(53) 99700-0002', 'karen@email.com',       'ativo'),
  ('Larissa Gomes',         '(53) 99700-0003', 'larissa@email.com',     'ativo'),
  ('Mariana Rocha',         '(53) 99700-0004', 'mariana@email.com',     'ativo'),
  ('Natália Borges',        '(53) 99700-0005', 'natalia@email.com',     'ativo'),
  ('Olivia Ramos',          '(53) 99700-0006', 'olivia@email.com',      'ativo'),
  ('Patricia Azevedo',      '(53) 99700-0007', 'patricia.a@email.com',  'ativo'),
  ('Rafaela Nunes',         '(53) 99700-0008', 'rafaela@email.com',     'ativo'),
  ('Simone Martins',        '(53) 99700-0009', 'simone@email.com',      'inativo'),
  ('Tatiana Ribeiro',       '(53) 99700-0010', 'tatiana@email.com',     'ativo'),
  ('Vanessa Correia',       '(53) 99700-0011', 'vanessa@email.com',     'ativo')
ON CONFLICT DO NOTHING;

-- Agendamentos (usamos subqueries para pegar os IDs)
INSERT INTO agendamentos (cliente_id, profissional_id, servico_id, data_agendamento, horario, status, observacoes)
SELECT
  c.id, p.id, s.id,
  data_ag, horario_ag, status_ag, obs
FROM (VALUES
  ('Ana Paula Rodrigues',   'Fabiana Lisboa',    'Limpeza de Pele Profunda',      CURRENT_DATE + 1, '09:00'::TIME, 'confirmado', NULL),
  ('Beatriz Santos Silva',  'Carla Mendes',      'Extensão de Cílios Fio a Fio',  CURRENT_DATE + 1, '10:00'::TIME, 'confirmado', 'Prefere fios curvados'),
  ('Camila Pereira',        'Patrícia Oliveira', 'Design de Sobrancelhas',         CURRENT_DATE + 1, '11:30'::TIME, 'pendente',   NULL),
  ('Daniela Medeiros',      'Juliana Ferreira',  'Massagem Relaxante Corporal',    CURRENT_DATE + 2, '09:00'::TIME, 'confirmado', 'Atenção ao ombro direito'),
  ('Eduarda Fonseca',       'Fabiana Lisboa',    'Peeling Químico',                CURRENT_DATE + 2, '14:00'::TIME, 'pendente',   NULL),
  ('Fernanda Lima',         'Carla Mendes',      'Extensão de Cílios Fio a Fio',  CURRENT_DATE + 3, '10:00'::TIME, 'confirmado', NULL),
  ('Gabriela Souza',        'Renata Costa',      'Hidratação Capilar',             CURRENT_DATE + 3, '13:00'::TIME, 'pendente',   NULL),
  ('Helena Carvalho',       'Fabiana Lisboa',    'Drenagem Linfática Facial',      CURRENT_DATE + 4, '09:30'::TIME, 'confirmado', NULL),
  ('Isabela Teixeira',      'Patrícia Oliveira', 'Design de Sobrancelhas',         CURRENT_DATE + 4, '11:00'::TIME, 'pendente',   NULL),
  ('Juliana Machado',       'Juliana Ferreira',  'Massagem Relaxante Corporal',    CURRENT_DATE + 5, '10:00'::TIME, 'confirmado', NULL),
  ('Karen Alves',           'Fabiana Lisboa',    'Limpeza de Pele Profunda',       CURRENT_DATE - 2, '09:00'::TIME, 'concluido',  NULL),
  ('Larissa Gomes',         'Carla Mendes',      'Extensão de Cílios Fio a Fio',  CURRENT_DATE - 3, '14:00'::TIME, 'concluido',  NULL),
  ('Mariana Rocha',         'Patrícia Oliveira', 'Micropigmentação de Lábios',     CURRENT_DATE - 4, '10:00'::TIME, 'concluido',  'Cliente VIP'),
  ('Natália Borges',        'Juliana Ferreira',  'Massagem Relaxante Corporal',    CURRENT_DATE - 5, '15:00'::TIME, 'concluido',  NULL),
  ('Olivia Ramos',          'Fabiana Lisboa',    'Peeling Químico',                CURRENT_DATE - 6, '09:00'::TIME, 'cancelado',  'Cancelou por viagem'),
  ('Ana Paula Rodrigues',   'Fabiana Lisboa',    'Limpeza de Pele Profunda',       CURRENT_DATE - 7, '09:00'::TIME, 'concluido',  NULL),
  ('Beatriz Santos Silva',  'Carla Mendes',      'Extensão de Cílios Fio a Fio',  CURRENT_DATE - 10,'10:00'::TIME, 'concluido',  NULL),
  ('Patricia Azevedo',      'Patrícia Oliveira', 'Design de Sobrancelhas',         CURRENT_DATE - 12,'11:00'::TIME, 'concluido',  NULL),
  ('Rafaela Nunes',         'Juliana Ferreira',  'Drenagem Linfática Facial',      CURRENT_DATE - 15,'14:00'::TIME, 'concluido',  NULL),
  ('Tatiana Ribeiro',       'Fabiana Lisboa',    'Pacote Noiva Completo',          CURRENT_DATE + 14,'09:00'::TIME, 'confirmado', 'Casamento em 2 semanas')
) AS v(cliente_nome, prof_nome, serv_nome, data_ag, horario_ag, status_ag, obs)
JOIN clientes      c ON c.nome = v.cliente_nome
JOIN profissionais p ON p.nome = v.prof_nome
JOIN servicos      s ON s.nome = v.serv_nome
ON CONFLICT DO NOTHING;

-- Pagamentos (para agendamentos concluídos)
INSERT INTO pagamentos (agendamento_id, valor, forma_pagamento, data_pagamento, status)
SELECT
  a.id,
  s.valor,
  forma,
  a.created_at + INTERVAL '1 hour',
  'pago'
FROM agendamentos a
JOIN servicos s ON s.id = a.servico_id
JOIN (VALUES
  ('Karen Alves',    'pix'),
  ('Larissa Gomes',  'cartao_credito'),
  ('Mariana Rocha',  'dinheiro'),
  ('Natália Borges', 'pix'),
  ('Ana Paula Rodrigues', 'cartao_debito'),
  ('Beatriz Santos Silva','cartao_credito'),
  ('Patricia Azevedo',    'pix'),
  ('Rafaela Nunes',       'dinheiro')
) AS v(cliente_nome, forma) ON v.cliente_nome = (
  SELECT nome FROM clientes WHERE id = a.cliente_id
)
WHERE a.status = 'concluido'
ON CONFLICT DO NOTHING;

-- Produtos
INSERT INTO produtos (nome, categoria, quantidade, valor_unitario, status) VALUES
  ('Ácido Hialurônico Concentrado',   'Facial',      12, 85.00,  'ativo'),
  ('Máscara Hidratante Intensiva',    'Facial',      24, 45.00,  'ativo'),
  ('Óleo de Argan Premium',           'Capilar',      8, 120.00, 'ativo'),
  ('Sérum Vitamina C 20%',            'Facial',       6, 95.00,  'ativo'),
  ('Creme Antirrugas Noturno',        'Facial',      15, 75.00,  'ativo'),
  ('Esfoliante Corporal de Bambu',    'Corporal',    30, 35.00,  'ativo'),
  ('Óleo de Massagem Relaxante',      'Corporal',    18, 55.00,  'ativo'),
  ('Pigmento Micropigmentação Nude',  'Micropig',     4, 180.00, 'ativo'),
  ('Pigmento Micropigmentação Rose',  'Micropig',     3, 180.00, 'ativo'),
  ('Luvas Descartáveis (caixa 100)',  'Descartável', 20, 25.00,  'ativo'),
  ('Máscara Facial de Colágeno',      'Facial',       2, 60.00,  'ativo'),
  ('Filtro Solar FPS 60',             'Facial',       9, 40.00,  'ativo'),
  ('Peeling Enzimático',              'Facial',       7, 110.00, 'ativo'),
  ('Gel para Sobrancelha',            'Sobrancelha',  0, 28.00,  'ativo'),
  ('Cola para Extensão de Cílios',    'Cílios',      11, 65.00,  'ativo')
ON CONFLICT DO NOTHING;

-- Movimentações de estoque
INSERT INTO movimentacoes_estoque (produto_id, tipo_movimentacao, quantidade, observacao)
SELECT p.id, tipo, qtd, obs
FROM (VALUES
  ('Ácido Hialurônico Concentrado',  'entrada', 20, 'Compra inicial do fornecedor'),
  ('Ácido Hialurônico Concentrado',  'saida',    8, 'Uso em atendimentos — junho'),
  ('Máscara Hidratante Intensiva',   'entrada', 30, 'Compra inicial'),
  ('Máscara Hidratante Intensiva',   'saida',    6, 'Uso em limpezas de pele'),
  ('Óleo de Argan Premium',          'entrada', 12, 'Compra inicial'),
  ('Óleo de Argan Premium',          'saida',    4, 'Uso em hidratações capilares'),
  ('Sérum Vitamina C 20%',           'entrada', 10, 'Compra inicial'),
  ('Sérum Vitamina C 20%',           'saida',    4, 'Uso em protocolos faciais'),
  ('Esfoliante Corporal de Bambu',   'entrada', 30, 'Compra inicial'),
  ('Gel para Sobrancelha',           'entrada', 10, 'Compra inicial'),
  ('Gel para Sobrancelha',           'saida',   10, 'Uso em designs — zerou estoque'),
  ('Cola para Extensão de Cílios',   'entrada', 15, 'Compra inicial'),
  ('Cola para Extensão de Cílios',   'saida',    4, 'Uso em extensões — junho'),
  ('Máscara Facial de Colágeno',     'entrada',  5, 'Compra inicial'),
  ('Máscara Facial de Colágeno',     'saida',    3, 'Uso em tratamentos especiais')
) AS v(prod_nome, tipo, qtd, obs)
JOIN produtos p ON p.nome = v.prod_nome
ON CONFLICT DO NOTHING;

-- ============================================================
-- 4. VERIFICAÇÃO FINAL
-- ============================================================
SELECT
  'profissionais'       AS tabela, COUNT(*) AS registros FROM profissionais UNION ALL
SELECT 'clientes',        COUNT(*) FROM clientes         UNION ALL
SELECT 'servicos',        COUNT(*) FROM servicos         UNION ALL
SELECT 'agendamentos',    COUNT(*) FROM agendamentos     UNION ALL
SELECT 'pagamentos',      COUNT(*) FROM pagamentos       UNION ALL
SELECT 'produtos',        COUNT(*) FROM produtos         UNION ALL
SELECT 'movimentacoes',   COUNT(*) FROM movimentacoes_estoque
ORDER BY tabela;
