import { useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { formatDate } from '@/lib/utils'
import Modal from '@/components/shared/Modal'
import { Plus, Users, Mail, AlertCircle, CheckCircle } from 'lucide-react'

interface UserRow {
  id: string
  email: string | undefined
  created_at: string
  role: string
}

function useUsuarios() {
  return useQuery<UserRow[]>({
    queryKey: ['usuarios'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []
      return [{ id: user.id, email: user.email, created_at: user.created_at, role: 'admin' }]
    },
  })
}

export default function UsuariosPage() {
  const { data: usuarios = [] } = useUsuarios()
  const [modalOpen, setModalOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const handleCreate = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg('')

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/login` },
    })

    if (error) {
      setErrorMsg(error.message)
      setStatus('error')
      return
    }

    setStatus('success')
    setEmail('')
    setPassword('')
  }, [email, password])

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-semibold text-foreground">Usuários</h1>
          <p className="text-muted-foreground text-sm">Gerencie o acesso ao sistema</p>
        </div>
        <button onClick={() => { setModalOpen(true); setStatus('idle'); setEmail(''); setPassword('') }}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" /> Convidar Usuário
        </button>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-2">
        <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-amber-700">
          O gerenciamento completo de usuários requer a Supabase Admin API.
          Para criar usuários adicionais, use o painel do Supabase em <strong>Authentication &gt; Users</strong>.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-border overflow-hidden">
        {usuarios.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">Nenhum usuário</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  {['Email', 'Perfil', 'Criado em'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {usuarios.map((u) => (
                  <tr key={u.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                          <Mail className="w-3.5 h-3.5 text-primary" />
                        </div>
                        <span className="font-medium text-foreground">{u.email}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">Admin</span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{formatDate(u.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Convidar Usuário" size="sm">
        {status === 'success' ? (
          <div className="text-center py-4">
            <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-3" />
            <p className="font-medium text-foreground">Convite enviado!</p>
            <p className="text-sm text-muted-foreground mt-1">O usuário receberá um email para confirmar o acesso.</p>
            <button onClick={() => { setModalOpen(false); setStatus('idle') }} className="mt-4 h-9 px-5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">Fechar</button>
          </div>
        ) : (
          <form onSubmit={handleCreate} className="space-y-4">
            {status === 'error' && (
              <div className="flex items-center gap-2 text-destructive bg-destructive/10 rounded-lg px-3 py-2 text-xs">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />{errorMsg}
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Email *</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="usuario@email.com"
                className="w-full h-10 px-3 rounded-lg border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Senha temporária *</label>
              <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres"
                className="w-full h-10 px-3 rounded-lg border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setModalOpen(false)} className="flex-1 h-10 rounded-lg border border-input text-sm font-medium hover:bg-muted transition-colors">Cancelar</button>
              <button type="submit" disabled={status === 'loading'} className="flex-1 h-10 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-60">
                {status === 'loading' ? 'Enviando...' : 'Convidar'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}
