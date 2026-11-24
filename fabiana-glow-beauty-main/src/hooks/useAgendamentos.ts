import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import type { Agendamento } from '@/types'

const FIELDS = `
  id, cliente_id, profissional_id, servico_id,
  data_agendamento, horario, status, observacoes, created_at,
  clientes(id, nome, telefone),
  profissionais(id, nome),
  servicos(id, nome, valor, duracao_minutos)
`

export function useAgendamentos() {
  return useQuery<Agendamento[]>({
    queryKey: ['agendamentos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agendamentos')
        .select(FIELDS)
        .order('data_agendamento', { ascending: false })
        .order('horario', { ascending: false })
      if (error) throw error
      return (data ?? []) as unknown as Agendamento[]
    },
  })
}

export function useUpdateAgendamentoStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Agendamento['status'] }) => {
      const { error } = await supabase.from('agendamentos').update({ status }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['agendamentos'] }),
  })
}

export function useDeleteAgendamento() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('agendamentos').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['agendamentos'] }),
  })
}
