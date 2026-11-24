export interface Cliente {
  id: string
  nome: string
  telefone: string | null
  email: string | null
  status: 'ativo' | 'inativo'
  created_at: string
  updated_at: string
}

export interface Profissional {
  id: string
  nome: string
  especialidade: string | null
  telefone: string | null
  email: string | null
  status: 'ativo' | 'inativo'
  created_at: string
}

export interface Servico {
  id: string
  nome: string
  descricao: string | null
  valor: number
  duracao_minutos: number
  status: 'ativo' | 'inativo'
  image_url?: string | null
  created_at: string
}

export interface Agendamento {
  id: string
  cliente_id: string
  profissional_id: string
  servico_id: string
  data_agendamento: string
  horario: string
  status: 'pendente' | 'agendando' | 'confirmado' | 'concluido' | 'cancelado'
  observacoes: string | null
  created_at: string
  clientes?: Pick<Cliente, 'id' | 'nome' | 'telefone'>
  profissionais?: Pick<Profissional, 'id' | 'nome'>
  servicos?: Pick<Servico, 'id' | 'nome' | 'valor' | 'duracao_minutos'>
}

export interface Pagamento {
  id: string
  agendamento_id: string
  valor: number
  forma_pagamento: string | null
  data_pagamento: string
  status: 'pago' | 'pendente' | 'cancelado'
}

export interface Produto {
  id: string
  nome: string
  categoria: string | null
  quantidade: number
  valor_unitario: number | null
  status: 'ativo' | 'inativo'
  created_at: string
}

export interface MovimentacaoEstoque {
  id: string
  produto_id: string
  tipo_movimentacao: 'entrada' | 'saida'
  quantidade: number
  observacao: string | null
  created_at: string
  produtos?: Pick<Produto, 'id' | 'nome'>
}

export interface KpiData {
  totalClientes: number
  agendamentosHoje: number
  receitaMes: number
  produtosCriticos: number
}
