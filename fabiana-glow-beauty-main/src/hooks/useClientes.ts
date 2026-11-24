import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import type { Cliente } from '@/types'

const FIELDS = 'id, nome, telefone, email, status, created_at, updated_at'

export function useClientes() {
  return useQuery<Cliente[]>({
    queryKey: ['clientes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clientes')
        .select(FIELDS)
        .order('nome')
      if (error) throw error
      return data ?? []
    },
  })
}

export function useUpsertCliente() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (cliente: Partial<Cliente> & { nome: string }) => {
      const payload = { nome: cliente.nome, telefone: cliente.telefone ?? null, email: cliente.email ?? null, status: cliente.status ?? 'ativo' }
      if (cliente.id) {
        const { error } = await supabase.from('clientes').update({ ...payload, updated_at: new Date().toISOString() }).eq('id', cliente.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('clientes').insert(payload)
        if (error) throw error
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clientes'] }),
  })
}

export function useDeleteCliente() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('clientes').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clientes'] }),
  })
}
