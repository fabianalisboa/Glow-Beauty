import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Building2 } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useUnidades } from '@/hooks/useUnidades'

// Só aparece para quem pertence a 2+ unidades (a dona da rede). Recepcionista não vê.
export default function SeletorUnidade() {
  const qc = useQueryClient()
  const [erro, setErro] = useState('')
  const { data: unidades } = useUnidades()

  const trocar = useMutation({
    mutationFn: async (clinicaId: string) => {
      const { error } = await supabase.rpc('trocar_clinica', { p_clinica: clinicaId })
      if (error) throw error
    },
    // Todos os dados em tela eram da unidade anterior: descarta o cache inteiro.
    onSuccess: () => qc.invalidateQueries(),
    onError: (e: Error) => setErro(`Não foi possível trocar de unidade: ${e.message}`),
  })

  if (!unidades || unidades.length < 2) return null
  const ativa = unidades.find((u) => u.ativa)

  return (
    <div className="flex items-center gap-2">
      <Building2 className="w-4 h-4 text-muted-foreground" />
      <select
        value={ativa?.clinica_id ?? ''}
        disabled={trocar.isPending}
        onChange={(e) => { setErro(''); trocar.mutate(e.target.value) }}
        aria-label="Unidade ativa"
        className="h-9 rounded-lg border border-border bg-white px-2 text-sm"
      >
        {unidades.map((u) => (
          <option key={u.clinica_id} value={u.clinica_id}>{u.clinicas?.nome ?? u.clinica_id}</option>
        ))}
      </select>
      {erro && <span className="text-xs text-destructive">{erro}</span>}
    </div>
  )
}
