import http from 'k6/http'
import { check, sleep } from 'k6'
import { Counter, Trend } from 'k6/metrics'

// Simulado: 5 pessoas agendando ao mesmo tempo, cada uma com o próprio cliente.
// Quem encontra o horário ocupado escolhe o próximo, como faria na tela.
// Variáveis: SUPABASE_URL, SUPABASE_ANON_KEY, DATA (data exclusiva da rodada, ex.: 2099-03-03)
const BASE = __ENV.SUPABASE_URL
const KEY = __ENV.SUPABASE_ANON_KEY
const DATA = __ENV.DATA
const SLUG = 'glow-beauty'
const PESSOAS = 5
const HORARIOS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
]
const MAX_TENTATIVAS = 6

const reservas = new Counter('reservas_concluidas')
const conflitos = new Counter('conflitos_encontrados')
const desistencias = new Counter('pessoas_sem_horario')
const errosInesperados = new Counter('erros_inesperados')
const latencia = new Trend('latencia_rpc', true)

export const options = {
  scenarios: {
    pessoas: { executor: 'per-vu-iterations', vus: PESSOAS, iterations: 1, maxDuration: '2m' },
  },
  thresholds: {
    reservas_concluidas: ['count==5'],
    erros_inesperados: ['count==0'],
    latencia_rpc: ['p(95)<2000'],
  },
}

const headers = { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' }

export function setup() {
  if (!DATA) throw new Error('Defina DATA, ex.: DATA=2099-03-03')
  const res = http.post(`${BASE}/rest/v1/rpc/agendamento_publico_dados`, JSON.stringify({ p_slug: SLUG }), { headers })
  const { servicos, profissionais } = res.json()
  if (!servicos.length || !profissionais.length) throw new Error('Sem serviço ou profissional ativo')
  return { servicoId: servicos[0].id, profissionalId: profissionais[0].id }
}

export default function (dados) {
  // Cada pessoa começa em um horário diferente, como em um dia normal de agenda
  let indice = (__VU - 1) % HORARIOS.length
  sleep(Math.random() * 0.5) // pequena variação no momento de clicar

  for (let tentativa = 1; tentativa <= MAX_TENTATIVAS; tentativa++) {
    const res = http.post(
      `${BASE}/rest/v1/rpc/criar_agendamento_publico`,
      JSON.stringify({
        p_slug: SLUG,
        p_nome: `Pessoa ${__VU}`,
        p_telefone: `(53) 91000-${String(__VU).padStart(4, '0')}`,
        p_email: null,
        p_servico_id: dados.servicoId,
        p_profissional_id: dados.profissionalId,
        p_data: DATA,
        p_horario: HORARIOS[indice],
        p_observacoes: 'simulado 5 usuários',
      }),
      { headers },
    )
    latencia.add(res.timings.duration)

    if (res.status === 200) {
      reservas.add(1)
      check(res, { 'reserva confirmada': (r) => r.status === 200 })
      return
    }

    if (res.body && res.body.includes('horario_ocupado')) {
      conflitos.add(1)
      indice = (indice + 1) % HORARIOS.length
      sleep(0.3 + Math.random() * 0.5) // tempo de ler a mensagem e escolher outro horário
      continue
    }

    errosInesperados.add(1)
    console.error(`Pessoa ${__VU}: status ${res.status} ${res.body}`)
    return
  }

  desistencias.add(1)
}
