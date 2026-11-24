import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'

export interface Unidade {
  clinica_id: string
  ativa: boolean
  papel: 'dona' | 'recepcao'
  clinicas: { nome: string; slug: string } | null
}

export function useUnidades() {
  return useQuery<Unidade[]>({
    queryKey: ['unidades'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('usuarios_clinica')
        .select('clinica_id, ativa, papel, clinicas(nome, slug)')
      if (error) throw error
      return data as unknown as Unidade[]
    },
  })
}

const ERROS: Record<string, string> = {
  slug_em_uso: 'Esse endereço já está em uso. Escolha outro.',
  dados_invalidos: 'Informe o nome e um endereço só com letras minúsculas, números e hífen.',
  sem_permissao: 'Só a dona da rede pode criar filiais.',
}

export function useCriarFilial() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ nome, slug }: { nome: string; slug: string }) => {
      const { error } = await supabase.rpc('criar_filial', { p_nome: nome, p_slug: slug })
      if (error) {
        const chave = Object.keys(ERROS).find((k) => error.message.includes(k))
        throw new Error(chave ? ERROS[chave] : `Erro ao criar filial: ${error.message}`)
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['unidades'] }),
  })
}
