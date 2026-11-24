import { useState, useCallback, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useParams, useSearchParams } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'
import { formatCurrency } from '@/lib/utils'
import { Sparkles, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import type { Servico, Profissional } from '@/types'
import AssistenteChat from '@/components/public/AssistenteChat'

const SLUG_PADRAO = 'glow-beauty'
const ERRO_GENERICO = 'Não foi possível realizar o agendamento. Tente novamente.'
const HORARIO_OCUPADO = 'Este horário já está ocupado. Escolha outro horário.'

type DadosPublicos = {
  servicos: Pick<Servico, 'id' | 'nome' | 'valor' | 'duracao_minutos'>[]
  profissionais: Pick<Profissional, 'id' | 'nome'>[]
}

interface FormData {
  nome: string
  telefone: string
  email: string
  servico_id: string
  profissional_id: string
  data_agendamento: string
  horario: string
  observacoes: string
}

const INITIAL_FORM: FormData = {
  nome: '', telefone: '', email: '',
  servico_id: '', profissional_id: '',
  data_agendamento: '', horario: '', observacoes: '',
}

const HORARIOS = [
  '09:00','09:30','10:00','10:30','11:00','11:30',
  '13:00','13:30','14:00','14:30','15:00','15:30',
  '16:00','16:30','17:00','17:30','18:00','18:30',
]

function today() {
  return new Date().toISOString().split('T')[0]
}

// Formata como (53) 99999-9999 ou (53) 9999-9999, aceitando no máximo 11 dígitos
function formatarTelefone(valor: string) {
  const d = valor.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 2) return d
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

export default function AgendarPage() {
  const CLINICA_SLUG = useParams().slug ?? SLUG_PADRAO
  const [searchParams] = useSearchParams()
  const preServico = searchParams.get('servico') ?? ''
  const [form, setForm] = useState<FormData>({ ...INITIAL_FORM, servico_id: preServico })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const { data: dados, isLoading: carregandoDados, isError: erroDados } = useQuery<DadosPublicos>({
    queryKey: ['dados-agendar', CLINICA_SLUG],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('agendamento_publico_dados', { p_slug: CLINICA_SLUG })
      if (error) throw error
      return data as DadosPublicos
    },
  })
  const servicos = dados?.servicos ?? []
  const profissionais = dados?.profissionais ?? []

  // Pré-seleciona serviço quando vem de ?servico=id
  useEffect(() => {
    if (preServico && servicos.length > 0) {
      const existe = servicos.some((s) => s.id === preServico)
      if (existe) setForm((p) => ({ ...p, servico_id: preServico }))
    }
  }, [preServico, servicos])

  const servicoSelecionado = servicos.find((s) => s.id === form.servico_id)

  const handleChange = useCallback((field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }, [])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg('')

    try {
      const { error } = await supabase.rpc('criar_agendamento_publico', {
        p_slug: CLINICA_SLUG,
        p_nome: form.nome,
        p_telefone: form.telefone,
        p_email: form.email || null,
        p_servico_id: form.servico_id,
        p_profissional_id: form.profissional_id || null,
        p_data: form.data_agendamento,
        p_horario: form.horario,
        p_observacoes: form.observacoes || null,
      })

      if (error) {
        setErrorMsg(error.message.includes('horario_ocupado') ? HORARIO_OCUPADO : ERRO_GENERICO)
        setStatus('error')
        return
      }

      setStatus('success')
      setForm(INITIAL_FORM)
    } catch {
      setErrorMsg(ERRO_GENERICO)
      setStatus('error')
    }
  }, [form])

  if (status === 'success') {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md animate-fade-up">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-9 h-9 text-green-600" />
          </div>
          <h2 className="text-2xl font-serif font-semibold text-foreground mb-3">Agendamento Confirmado!</h2>
          <p className="text-muted-foreground mb-6">
            Recebemos sua solicitação. Entraremos em contato para confirmar o seu horário.
          </p>
          <button
            onClick={() => setStatus('idle')}
            className="bg-primary text-white px-7 py-3 rounded-full text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Fazer outro agendamento
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="py-16 px-4 bg-gradient-to-br from-rose-50 via-white to-pink-50 min-h-screen">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-3xl font-serif font-semibold text-foreground mb-2">Agendar Horário</h1>
          <p className="text-muted-foreground">Preencha os dados abaixo e entraremos em contato para confirmar.</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-border p-6 md:p-8">
          {erroDados && (
            <div className="flex items-center gap-2 text-destructive bg-destructive/10 rounded-lg px-3 py-2.5 text-sm mb-5">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              Não foi possível carregar os serviços. Atualize a página.
            </div>
          )}

          {status === 'error' && (
            <div className="flex items-center gap-2 text-destructive bg-destructive/10 rounded-lg px-3 py-2.5 text-sm mb-5">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Dados pessoais */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3 pb-2 border-b border-border">Seus dados</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5" htmlFor="nome">Nome completo *</label>
                  <input id="nome" type="text" required value={form.nome} onChange={(e) => handleChange('nome', e.target.value)}
                    placeholder="Seu nome" className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5" htmlFor="telefone">Telefone / WhatsApp *</label>
                  <input id="telefone" type="tel" required maxLength={15} pattern="\(\d{2}\) \d{4,5}-\d{4}"
                    title="Digite o telefone com DDD, no formato (53) 99999-9999"
                    value={form.telefone} onChange={(e) => handleChange('telefone', formatarTelefone(e.target.value))}
                    placeholder="(53) 99999-9999" className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5" htmlFor="email">Email</label>
                  <input id="email" type="email" value={form.email} onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="opcional" className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition" />
                </div>
              </div>
            </div>

            {/* Serviço */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3 pb-2 border-b border-border">Serviço</h3>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5" htmlFor="servico">Serviço desejado *</label>
                <select id="servico" required value={form.servico_id} onChange={(e) => handleChange('servico_id', e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition">
                  <option value="">{carregandoDados ? 'Carregando serviços...' : 'Selecione um serviço'}</option>
                  {servicos.map((s) => (
                    <option key={s.id} value={s.id}>{s.nome} — {formatCurrency(s.valor)}</option>
                  ))}
                </select>
              </div>

              {servicoSelecionado && (
                <div className="mt-3 bg-rose-50 rounded-lg px-4 py-3 border border-rose-100 flex items-center gap-3">
                  <Clock className="w-4 h-4 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-foreground">{servicoSelecionado.nome}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(servicoSelecionado.valor)} · {servicoSelecionado.duracao_minutos} min
                    </p>
                  </div>
                </div>
              )}

              {profissionais.length > 0 && (
                <div className="mt-4">
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5" htmlFor="profissional">Profissional (opcional)</label>
                  <select id="profissional" value={form.profissional_id} onChange={(e) => handleChange('profissional_id', e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition">
                    <option value="">Sem preferência</option>
                    {profissionais.map((p) => (
                      <option key={p.id} value={p.id}>{p.nome}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Data e horário */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3 pb-2 border-b border-border">Data e Horário</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5" htmlFor="data">Data *</label>
                  <input id="data" type="date" required min={today()} value={form.data_agendamento}
                    onChange={(e) => handleChange('data_agendamento', e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5" htmlFor="horario">Horário *</label>
                  <select id="horario" required value={form.horario} onChange={(e) => handleChange('horario', e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition">
                    <option value="">Selecione</option>
                    {HORARIOS.map((h) => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Observações */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5" htmlFor="obs">Observações</label>
              <textarea id="obs" rows={3} value={form.observacoes} onChange={(e) => handleChange('observacoes', e.target.value)}
                placeholder="Alergias, preferências ou informações importantes..."
                className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition resize-none" />
            </div>

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full h-11 bg-primary text-white rounded-full text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-md shadow-primary/25"
            >
              {status === 'loading' ? 'Enviando...' : 'Confirmar Agendamento'}
            </button>

            <p className="text-center text-xs text-muted-foreground">
              Após o envio, entraremos em contato para confirmar seu horário.
            </p>
          </form>
        </div>
      </div>
      <AssistenteChat slug={CLINICA_SLUG} />
    </div>
  )
}
