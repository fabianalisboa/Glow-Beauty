CREATE TABLE usuarios (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  senha VARCHAR(255) NOT NULL,
  perfil VARCHAR(30) NOT NULL,
  status VARCHAR(20) DEFAULT 'ativo'
);

CREATE TABLE clientes (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  telefone VARCHAR(20),
  email VARCHAR(100),
  data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(20) DEFAULT 'ativo'
);

CREATE TABLE profissionais (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  especialidade VARCHAR(100),
  telefone VARCHAR(20),
  email VARCHAR(100),
  status VARCHAR(20) DEFAULT 'ativo'
);

CREATE TABLE servicos (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  descricao TEXT,
  valor DECIMAL(10,2) NOT NULL,
  duracao_minutos INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'ativo'
);

CREATE TABLE agendamentos (
  id SERIAL PRIMARY KEY,
  cliente_id INTEGER REFERENCES clientes(id),
  profissional_id INTEGER REFERENCES profissionais(id),
  servico_id INTEGER REFERENCES servicos(id),
  data_agendamento DATE NOT NULL,
  horario TIME NOT NULL,
  status VARCHAR(30) DEFAULT 'pendente'
);

CREATE TABLE pagamentos (
  id SERIAL PRIMARY KEY,
  agendamento_id INTEGER REFERENCES agendamentos(id),
  valor DECIMAL(10,2) NOT NULL,
  forma_pagamento VARCHAR(50),
  data_pagamento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(30) DEFAULT 'pago'
);

CREATE TABLE produtos (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  categoria VARCHAR(100),
  quantidade INTEGER NOT NULL,
  valor_unitario DECIMAL(10,2),
  status VARCHAR(30)
);

CREATE TABLE movimentacoes_estoque (
  id SERIAL PRIMARY KEY,
  produto_id INTEGER REFERENCES produtos(id),
  tipo_movimentacao VARCHAR(20) NOT NULL,
  quantidade INTEGER NOT NULL,
  data_movimentacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  observacao TEXT
);