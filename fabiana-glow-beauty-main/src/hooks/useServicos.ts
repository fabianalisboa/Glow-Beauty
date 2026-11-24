import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import type { Servico } from '@/types'

const FIELDS_BASE = 'id, nome, descricao, valor, duracao_minutos, status, created_at'

export function useServicos() {
  return useQuery<Servico[]>({
    queryKey: ['servicos'],
    queryFn: async () => {
      // Tenta com image_url; se falhar (coluna não existe), repete sem
      const { data, error } = await supabase
        .from('servicos')
        .select(`${FIELDS_BASE}, image_url`)
        .order('nome')
      if (error) {
        const { data: fallback, error: err2 } = await supabase
          .from('servicos')
          .select(FIELDS_BASE)
          .order('nome')
        if (err2) throw err2
        return (fallback ?? []).map((s) => ({ ...s, image_url: null }))
      }
      return data ?? []
    },
  })
}

export function useUpsertServico() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (s: Partial<Servico> & { nome: string; valor: number; duracao_minutos: number }) => {
      const base = {
        nome: s.nome,
        descricao: s.descricao ?? null,
        valor: s.valor,
        duracao_minutos: s.duracao_minutos,
        status: s.status ?? 'ativo',
      }
      const withImg = { ...base, image_url: s.image_url ?? null }

      const exec = async (payload: typeof base | typeof withImg) => {
        if (s.id) {
          return supabase.from('servicos').update(payload).eq('id', s.id)
        }
        return supabase.from('servicos').insert(payload)
      }

      const { error } = await exec(withImg)
      if (error) {
        // Coluna image_url ainda não existe no banco → salva sem ela
        if (error.code === '42703') {
          const { error: err2 } = await exec(base)
          if (err2) throw err2
        } else {
          throw error
        }
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['servicos'] }),
  })
}

export function useDeleteServico() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('servicos').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['servicos'] }),
  })
}
