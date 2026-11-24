import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import type { Produto, MovimentacaoEstoque } from '@/types'

export function useProdutos() {
  return useQuery<Produto[]>({
    queryKey: ['produtos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('produtos')
        .select('id, nome, categoria, quantidade, valor_unitario, status, created_at')
        .order('nome')
      if (error) throw error
      return data ?? []
    },
  })
}

export function useUpsertProduto() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (p: Partial<Produto> & { nome: string; quantidade: number }) => {
      const payload = { nome: p.nome, categoria: p.categoria ?? null, quantidade: p.quantidade, valor_unitario: p.valor_unitario ?? null, status: p.status ?? 'ativo' }
      if (p.id) {
        const { error } = await supabase.from('produtos').update(payload).eq('id', p.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('produtos').insert(payload)
        if (error) throw error
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['produtos'] }),
  })
}

export function useMovimentacoes() {
  return useQuery<MovimentacaoEstoque[]>({
    queryKey: ['movimentacoes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('movimentacoes_estoque')
        .select('id, produto_id, tipo_movimentacao, quantidade, observacao, created_at, produtos(id, nome)')
        .order('created_at', { ascending: false })
        .limit(50)
      if (error) throw error
      return (data ?? []) as unknown as MovimentacaoEstoque[]
    },
  })
}

export function useRegistrarMovimentacao() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (m: { produto_id: string; tipo_movimentacao: 'entrada' | 'saida'; quantidade: number; observacao?: string }) => {
      const { error } = await supabase.from('movimentacoes_estoque').insert(m)
      if (error) throw error

      // Atualiza quantidade do produto
      const { data: produto } = await supabase.from('produtos').select('quantidade').eq('id', m.produto_id).single()
      if (produto) {
        const novaQtd = m.tipo_movimentacao === 'entrada'
          ? produto.quantidade + m.quantidade
          : produto.quantidade - m.quantidade
        await supabase.from('produtos').update({ quantidade: Math.max(0, novaQtd) }).eq('id', m.produto_id)
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['movimentacoes'] })
      qc.invalidateQueries({ queryKey: ['produtos'] })
    },
  })
}
