import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import type { Profissional } from '@/types'

const FIELDS = 'id, nome, especialidade, telefone, email, status, created_at'

export function useProfissionais() {
  return useQuery<Profissional[]>({
    queryKey: ['profissionais'],
    queryFn: async () => {
      const { data, error } = await supabase.from('profissionais').select(FIELDS).order('nome')
      if (error) throw error
      return data ?? []
    },
  })
}

export function useUpsertProfissional() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (p: Partial<Profissional> & { nome: string }) => {
      const payload = { nome: p.nome, especialidade: p.especialidade ?? null, telefone: p.telefone ?? null, email: p.email ?? null, status: p.status ?? 'ativo' }
      if (p.id) {
        const { error } = await supabase.from('profissionais').update(payload).eq('id', p.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('profissionais').insert(payload)
        if (error) throw error
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['profissionais'] }),
  })
}

export function useDeleteProfissional() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('profissionais').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['profissionais'] }),
  })
}
