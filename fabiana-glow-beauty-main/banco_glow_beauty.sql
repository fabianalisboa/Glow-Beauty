CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    perfil VARCHAR(30) NOT NULL
);

CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    telefone VARCHAR(20),
    email VARCHAR(100),
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE profissionais (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    especialidade VARCHAR(100),
    telefone VARCHAR(20),
    email VARCHAR(100)
);

CREATE TABLE servicos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    valor DECIMAL(10,2),
    duracao_minutos INTEGER
);

CREATE TABLE agendamentos (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER REFERENCES clientes(id),
    profissional_id INTEGER REFERENCES profissionais(id),
    servico_id INTEGER REFERENCES servicos(id),
    data_hora TIMESTAMP NOT NULL,
    status VARCHAR(30)
);

CREATE TABLE pagamentos (
    id SERIAL PRIMARY KEY,
    agendamento_id INTEGER REFERENCES agendamentos(id),
    valor DECIMAL(10,2),
    forma_pagamento VARCHAR(50),
    data_pagamento TIMESTAMP
);

CREATE TABLE produtos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100),
    quantidade INTEGER,
    valor_unitario DECIMAL(10,2)
);

CREATE TABLE movimentacoes_estoque (
    id SERIAL PRIMARY KEY,
    produto_id INTEGER REFERENCES produtos(id),
    tipo_movimentacao VARCHAR(20),
    quantidade INTEGER,
    data_movimentacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);