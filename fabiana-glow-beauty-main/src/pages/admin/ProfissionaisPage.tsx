import { useState, useCallback, useMemo } from 'react'
import { useProfissionais, useUpsertProfissional, useDeleteProfissional } from '@/hooks/useProfissionais'
import { formatPhone } from '@/lib/utils'
import Modal from '@/components/shared/Modal'
import StatusBadge from '@/components/shared/StatusBadge'
import { Plus, Search, Edit, Trash2, UserCog, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'
import type { Profissional } from '@/types'

type FormData = Pick<Profissional, 'nome' | 'especialidade' | 'telefone' | 'email' | 'status'>
const EMPTY: FormData = { nome: '', especialidade: '', telefone: '', email: '', status: 'ativo' }

export default function ProfissionaisPage() {
  const { data: profissionais = [], isLoading } = useProfissionais()
  const upsert = useUpsertProfissional()
  const del = useDeleteProfissional()

  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<'todos' | 'ativo' | 'inativo'>('todos')
  const [filterEspecialidade, setFilterEspecialidade] = useState<string>('')
  const [sortBy, setSortBy] = useState<string>('nome')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Profissional | null>(null)
  const [form, setForm] = useState<FormData>(EMPTY)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const toggleSort = useCallback((col: string) => {
    if (sortBy === col) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortBy(col); setSortDir('asc') }
  }, [sortBy])

  const especialidades = useMemo(() =>
    ([...new Set(profissionais.map((p) => p.especialidade).filter(Boolean))].sort() as string[])
  , [profissionais])

  const filtered = useMemo(() => {
    return profissionais
      .filter((p) =>
        p.nome.toLowerCase().includes(search.toLowerCase()) ||
        (p.especialidade ?? '').toLowerCase().includes(search.toLowerCase())
      )
      .filter((p) => filterStatus === 'todos' || p.status === filterStatus)
      .filter((p) => !filterEspecialidade || p.especialidade === filterEspecialidade)
      .sort((a, b) => {
        const valA = a.nome.toLowerCase()
        const valB = b.nome.toLowerCase()
        return sortDir === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA)
      })
  }, [profissionais, search, filterStatus, filterEspecialidade, sortBy, sortDir])

  const openCreate = useCallback(() => { setEditing(null); setForm(EMPTY); setModalOpen(true) }, [])
  const openEdit = useCallback((p: Profissional) => {
    setEditing(p)
    setForm({ nome: p.nome, especialidade: p.especialidade ?? '', telefone: p.telefone ?? '', email: p.email ?? '', status: p.status })
    setModalOpen(true)
  }, [])

  const handleSave = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    await upsert.mutateAsync(editing ? { ...form, id: editing.id } : form)
    setModalOpen(false)
  }, [form, editing, upsert])

  const field = (f: keyof FormData, v: string) => setForm((p) => ({ ...p, [f]: v }))

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-semibold text-foreground">Profissionais</h1>
          <p className="text-muted-foreground text-sm">{profissionais.length} cadastradas</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" /> Nova Profissional
        </button>
      </div>

      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="search" placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 h-10 rounded-lg border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition" />
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
              className="h-9 pl-3 pr-8 rounded-lg border border-input bg-background text-sm focus:outline-none appearance-none cursor-pointer">
              <option value="todos">Todos status</option>
              <option value="ativo">Ativa</option>
              <option value="inativo">Inativa</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          </div>
          <div className="relative">
            <select value={filterEspecialidade} onChange={(e) => setFilterEspecialidade(e.target.value)}
              className="h-9 pl-3 pr-8 rounded-lg border border-input bg-background text-sm focus:outline-none appearance-none cursor-pointer">
              <option value="">Todas especialidades</option>
              {especialidades.map((e) => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground text-sm">Carregando...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <UserCog className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">{search ? 'Nenhuma encontrada' : 'Nenhuma profissional cadastrada'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                    <button onClick={() => toggleSort('nome')} className="flex items-center gap-1 hover:text-foreground transition-colors group">
                      Nome
                      <span className="opacity-50 group-hover:opacity-100">
                        {sortBy === 'nome' ? (sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />) : <ChevronsUpDown className="w-3 h-3" />}
                      </span>
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Especialidade</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Telefone</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground">{p.nome}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.especialidade ?? '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.telefone ? formatPhone(p.telefone) : '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.email ?? '—'}</td>
                    <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={() => openEdit(p)} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" aria-label="Editar"><Edit className="w-3.5 h-3.5" /></button>
                        <button onClick={() => setConfirmDelete(p.id)} className="p-1.5 rounded hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-colors" aria-label="Excluir"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Profissional' : 'Nova Profissional'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Nome *</label>
            <input type="text" required value={form.nome} onChange={(e) => field('nome', e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Especialidade</label>
            <input type="text" value={form.especialidade ?? ''} onChange={(e) => field('especialidade', e.target.value)} placeholder="Ex: Esteticista, Maquiadora"
              className="w-full h-10 px-3 rounded-lg border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Telefone</label>
              <input type="tel" value={form.telefone ?? ''} onChange={(e) => field('telefone', e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Status</label>
              <select value={form.status} onChange={(e) => field('status', e.target.value as FormData['status'])}
                className="w-full h-10 px-3 rounded-lg border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="ativo">Ativa</option>
                <option value="inativo">Inativa</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Email</label>
            <input type="email" value={form.email ?? ''} onChange={(e) => field('email', e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="flex-1 h-10 rounded-lg border border-input text-sm font-medium hover:bg-muted transition-colors">Cancelar</button>
            <button type="submit" disabled={upsert.isPending} className="flex-1 h-10 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-60">
              {upsert.isPending ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Excluir Profissional" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Tem certeza que deseja excluir esta profissional?</p>
          <div className="flex gap-3">
            <button onClick={() => setConfirmDelete(null)} className="flex-1 h-10 rounded-lg border border-input text-sm font-medium hover:bg-muted transition-colors">Cancelar</button>
            <button onClick={() => confirmDelete && del.mutate(confirmDelete)} disabled={del.isPending}
              className="flex-1 h-10 bg-destructive text-white rounded-lg text-sm font-medium hover:bg-destructive/90 transition-colors disabled:opacity-60">
              {del.isPending ? 'Excluindo...' : 'Excluir'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
