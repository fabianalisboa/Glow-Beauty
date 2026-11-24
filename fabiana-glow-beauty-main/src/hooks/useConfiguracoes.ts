import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'

export interface Configuracoes {
  id: string
  nome_clinica: string
  logo_url: string | null
  whatsapp: string | null
  telefone: string | null
  email: string | null
  endereco: string | null
  cidade: string | null
  instagram: string | null
  facebook: string | null
  tiktok: string | null
  horario_funcionamento: string | null
  sobre: string | null
}

// Uma linha de configuracoes por clínica; a RLS já devolve só a da unidade ativa.
const FIELDS = 'id, nome_clinica, logo_url, whatsapp, telefone, email, endereco, cidade, instagram, facebook, tiktok, horario_funcionamento, sobre'

export function useConfiguracoes() {
  return useQuery<Configuracoes>({
    queryKey: ['configuracoes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('configuracoes')
        .select(FIELDS)
        .single()
      if (error) throw error
      return data as Configuracoes
    },
  })
}

export function useSaveConfiguracoes() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (config: Partial<Omit<Configuracoes, 'id'>> & { id: string }) => {
      const { id, ...campos } = config
      const { error } = await supabase
        .from('configuracoes')
        .update({ ...campos, updated_at: new Date().toISOString() } as Record<string, unknown>)
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['configuracoes'] }),
  })
}

export async function uploadLogoUrl(file: File, configId: string): Promise<string> {
  const ext = file.name.split('.').pop()
  const path = `logo-${configId}.${ext}` // um arquivo por filial: não sobrescreve o logo das outras
  const { error } = await supabase.storage
    .from('glow-assets')
    .upload(path, file, { upsert: true })
  if (error) throw error
  const { data } = supabase.storage.from('glow-assets').getPublicUrl(path)
  return data.publicUrl
}
