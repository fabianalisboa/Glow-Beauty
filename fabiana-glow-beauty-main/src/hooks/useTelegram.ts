import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'

export interface TelegramConfig {
  clinica_id: string
  telegram_chat_id: string | null
}

export interface UltimoAviso {
  status: 'pendente' | 'enviada' | 'falha'
  ultimo_erro: string | null
  enviada_em: string | null
  created_at: string
}

// Só no admin: o hook público de configurações não pode carregar o ID do chat.
export function useTelegramConfig() {
  return useQuery<TelegramConfig>({
    queryKey: ['telegram-config'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('configuracoes')
        .select('clinica_id, telegram_chat_id')
        .single()
      if (error) throw error
      return data as TelegramConfig
    },
  })
}

export function useUltimoAviso(clinicaId: string | undefined) {
  return useQuery<UltimoAviso | null>({
    queryKey: ['telegram-ultimo-aviso', clinicaId],
    enabled: !!clinicaId,
    refetchInterval: 15_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notificacoes_fila')
        .select('status, ultimo_erro, enviada_em, created_at')
        .eq('clinica_id', clinicaId as string)
        .order('created_at', { ascending: false })
        .limit(1)
      if (error) throw error
      return (data?.[0] as UltimoAviso | undefined) ?? null
    },
  })
}

export function useSalvarTelegramChatId() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ clinicaId, chatId }: { clinicaId: string; chatId: string | null }) => {
      const { error } = await supabase
        .from('configuracoes')
        .update({ telegram_chat_id: chatId, updated_at: new Date().toISOString() })
        .eq('clinica_id', clinicaId)
      if (error) throw error

      // A fila guarda o destinatário na hora do agendamento: os avisos pendentes passam para o ID novo.
      if (chatId) {
        const { error: filaErr } = await supabase
          .from('notificacoes_fila')
          .update({ destinatario: chatId })
          .eq('clinica_id', clinicaId)
          .eq('status', 'pendente')
        if (filaErr) throw filaErr
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['telegram-config'] }),
  })
}

// Enfileira uma mensagem de teste; o job do pg_cron envia em até 1 minuto.
export function useEnviarTesteTelegram() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ clinicaId, chatId }: { clinicaId: string; chatId: string }) => {
      const { error } = await supabase.from('notificacoes_fila').insert({
        clinica_id: clinicaId,
        destinatario: chatId,
        mensagem: 'Teste do Glow Beauty: os avisos de novo agendamento chegam neste chat.',
      })
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['telegram-ultimo-aviso'] }),
  })
}
