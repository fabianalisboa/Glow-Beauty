import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { formatDate, formatTime } from '@/lib/utils'

export interface Notificacao {
  id: string
  agendamento_id: string
  cliente_nome: string
  cliente_telefone: string | null
  servico_nome: string
  profissional_nome: string
  data_agendamento: string
  horario: string
  dataLabel: string
  horaLabel: string
  lida: boolean
  createdAt: number
}

const STORAGE_KEY = 'glow_notificacoes'
const LAST_CHECK_KEY = 'glow_last_check'
const POLL_MS = 20_000 // verifica a cada 20 segundos

function loadStored(): Notificacao[] {
  try { return JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? '[]') }
  catch { return [] }
}

function saveStored(list: Notificacao[]): void {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

// Retorna timestamp da última verificação (ou agora se é a primeira vez)
function getLastCheck(): string {
  const v = sessionStorage.getItem(LAST_CHECK_KEY)
  if (v) return v
  const now = new Date().toISOString()
  sessionStorage.setItem(LAST_CHECK_KEY, now)
  return now
}

function setLastCheck(ts: string): void {
  sessionStorage.setItem(LAST_CHECK_KEY, ts)
}

export function useNotificacoes() {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>(loadStored)

  const addNotificacao = useCallback((n: Notificacao) => {
    setNotificacoes((prev) => {
      if (prev.some((x) => x.agendamento_id === n.agendamento_id)) return prev
      const updated = [n, ...prev].slice(0, 25)
      saveStored(updated)
      return updated
    })
  }, [])

  const checkNew = useCallback(async () => {
    const since = getLastCheck()
    const now = new Date().toISOString()

    try {
      const { data: rows, error } = await supabase
        .from('agendamentos')
        .select('id, created_at, data_agendamento, horario, cliente_id, servico_id, profissional_id')
        .gt('created_at', since)
        .order('created_at', { ascending: false })
        .limit(10)

      // Atualiza lastCheck independente de erro para não repetir
      setLastCheck(now)

      if (error || !rows || rows.length === 0) return

      // Busca dados relacionados para cada novo agendamento
      for (const row of rows) {
        const [clienteRes, servicoRes, profissionalRes] = await Promise.all([
          supabase.from('clientes').select('nome, telefone').eq('id', row.cliente_id).single(),
          supabase.from('servicos').select('nome').eq('id', row.servico_id).single(),
          supabase.from('profissionais').select('nome').eq('id', row.profissional_id).single(),
        ])

        addNotificacao({
          id: crypto.randomUUID(),
          agendamento_id: row.id,
          cliente_nome: clienteRes.data?.nome ?? 'Cliente',
          cliente_telefone: clienteRes.data?.telefone ?? null,
          servico_nome: servicoRes.data?.nome ?? 'Serviço',
          profissional_nome: profissionalRes.data?.nome ?? 'Profissional',
          data_agendamento: row.data_agendamento,
          horario: row.horario,
          dataLabel: formatDate(row.data_agendamento),
          horaLabel: formatTime(row.horario),
          lida: false,
          createdAt: new Date(row.created_at).getTime(),
        })
      }
    } catch {
      // falha silenciosa — tenta novamente no próximo ciclo
    }
  }, [addNotificacao])

  useEffect(() => {
    // Verifica imediatamente ao montar
    checkNew()

    // Polling a cada 20 segundos
    const interval = setInterval(checkNew, POLL_MS)

    // Verifica ao voltar para a aba (após ausência do usuário)
    const onFocus = () => { if (document.visibilityState === 'visible') checkNew() }
    document.addEventListener('visibilitychange', onFocus)

    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', onFocus)
    }
  }, [checkNew])

  const marcarLida = useCallback((agendamento_id: string) => {
    setNotificacoes((prev) => {
      const updated = prev.map((n) =>
        n.agendamento_id === agendamento_id ? { ...n, lida: true } : n
      )
      saveStored(updated)
      return updated
    })
  }, [])

  const marcarTodasLidas = useCallback(() => {
    setNotificacoes((prev) => {
      const updated = prev.map((n) => ({ ...n, lida: true }))
      saveStored(updated)
      return updated
    })
  }, [])

  const remover = useCallback((agendamento_id: string) => {
    setNotificacoes((prev) => {
      const updated = prev.filter((n) => n.agendamento_id !== agendamento_id)
      saveStored(updated)
      return updated
    })
  }, [])

  const limparTodas = useCallback(() => {
    setNotificacoes([])
    sessionStorage.removeItem(STORAGE_KEY)
  }, [])

  const naoLidas = notificacoes.filter((n) => !n.lida).length

  return { notificacoes, naoLidas, marcarLida, marcarTodasLidas, remover, limparTodas }
}
