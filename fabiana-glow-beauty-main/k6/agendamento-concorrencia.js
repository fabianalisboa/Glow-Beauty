import http from 'k6/http'
import { check } from 'k6'
import { Counter, Trend } from 'k6/metrics'

// Variáveis: SUPABASE_URL, SUPABASE_ANON_KEY, DATA (ex.: 2099-03-01), USUARIOS (padrão 50)
const BASE = __ENV.SUPABASE_URL
const KEY = __ENV.SUPABASE_ANON_KEY
const DATA = __ENV.DATA
const USUARIOS = Number(__ENV.USUARIOS || 50)
const SLUG = 'glow-beauty'
const HORARIO = '10:00'

const aceitos = new Counter('agendamentos_aceitos')
const conflitos = new Counter('conflitos_horario')
const errosInesperados = new Counter('erros_inesperados')
const latencia = new Trend('latencia_rpc', true)

export const options = {
  scenarios: {
    corrida: { executor: 'per-vu-iterations', vus: USUARIOS, iterations: 1, maxDuration: '1m' },
  },
  thresholds: {
    agendamentos_aceitos: ['count==1'],
    erros_inesperados: ['count==0'],
    latencia_rpc: ['p(95)<2000'],
  },
}

const headers = { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' }

export function setup() {
  if (!DATA) throw new Error('Defina DATA com uma data exclusiva da rodada, ex.: DATA=2099-03-01')

  const dados = http.post(`${BASE}/rest/v1/rpc/agendamento_publico_dados`, JSON.stringify({ p_slug: SLUG }), { headers })
  const { servicos, profissionais } = dados.json()
  if (!servicos.length || !profissionais.length) throw new Error('Sem serviço ou profissional ativo para testar')

  // Isolamento: o anônimo não pode ler clientes de nenhuma clínica
  const clientes = http.get(`${BASE}/rest/v1/clientes?select=id`, { headers })
  check(clientes, {
    'anon não lê clientes': (r) => r.status >= 400 || r.json().length === 0,
  })

  return { servicoId: servicos[0].id, profissionalId: profissionais[0].id }
}

export default function (dados) {
  const corpo = {
    p_slug: SLUG,
    p_nome: `Usuario ${__VU}`,
    p_telefone: `(53) 90000-${String(__VU).padStart(4, '0')}`,
    p_email: null,
    p_servico_id: dados.servicoId,
    p_profissional_id: dados.profissionalId,
    p_data: DATA,
    p_horario: HORARIO,
    p_observacoes: 'teste de concorrência k6',
  }

  const res = http.post(`${BASE}/rest/v1/rpc/criar_agendamento_publico`, JSON.stringify(corpo), { headers })
  latencia.add(res.timings.duration)

  if (res.status === 200) {
    aceitos.add(1)
  } else if (res.body && res.body.includes('horario_ocupado')) {
    conflitos.add(1)
  } else {
    errosInesperados.add(1)
    console.error(`VU ${__VU}: status ${res.status} ${res.body}`)
  }
}
