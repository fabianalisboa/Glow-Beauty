import { useState, useCallback, useMemo } from 'react'
import { useClientes, useUpsertCliente, useDeleteCliente } from '@/hooks/useClientes'
import { formatDate, formatPhone } from '@/lib/utils'
import Modal from '@/components/shared/Modal'
import StatusBadge from '@/components/shared/StatusBadge'
import { Plus, Search, Edit, Trash2, UserRound, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'
import type { Cliente } from '@/types'

type FormData = Pick<Cliente, 'nome' | 'telefone' | 'email' | 'status'>

const EMPTY: FormData = { nome: '', telefone: '', email: '', status: 'ativo' }

export default function ClientesPage() {
  const { data: clientes = [], isLoading } = useClientes()
  const upsert = useUpsertCliente()
  const del = useDeleteCliente()

  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<'todos' | 'ativo' | 'inativo'>('todos')
  const [sortBy, setSortBy] = useState<string>('nome')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Cliente | null>(null)
  const [form, setForm] = useState<FormData>(EMPTY)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const toggleSort = useCallback((col: string) => {
    if (sortBy === col) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortBy(col); setSortDir('asc') }
  }, [sortBy])

  const filtered = useMemo(() => {
    return clientes
      .filter((c) =>
        c.nome.toLowerCase().includes(search.toLowerCase()) ||
        (c.email ?? '').toLowerCase().includes(search.toLowerCase()) ||
        (c.telefone ?? '').includes(search)
      )
      .filter((c) => filterStatus === 'todos' || c.status === filterStatus)
      .sort((a, b) => {
        let valA: string
        let valB: string
        if (sortBy === 'created_at') {
          valA = a.created_at ?? ''
          valB = b.created_at ?? ''
        } else {
          valA = a.nome.toLowerCase()
          valB = b.nome.toLowerCase()
        }
        return sortDir === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA)
      })
  }, [clientes, search, filterStatus, sortBy, sortDir])

  const openCreate = useCallback(() => {
    setEditing(null)
    setForm(EMPTY)
    setModalOpen(true)
  }, [])

  const openEdit = useCallback((c: Cliente) => {
    setEditing(c)
    setForm({ nome: c.nome, telefone: c.telefone ?? '', email: c.email ?? '', status: c.status })
    setModalOpen(true)
  }, [])

  const handleSave = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    await upsert.mutateAsync(editing ? { ...form, id: editing.id } : form)
    setModalOpen(false)
  }, [form, editing, upsert])

  const handleDelete = useCallback(async (id: string) => {
    await del.mutateAsync(id)
    setConfirmDelete(null)
  }, [del])

  const field = (f: keyof FormData, v: string) => setForm((p) => ({ ...p, [f]: v }))

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-semibold text-foreground">Clientes</h1>
          <p className="text-muted-foreground text-sm">{clientes.length} cadastrados</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" /> Novo Cliente
        </button>
      </div>

      {/* Search + Filters */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="search" placeholder="Buscar clientes..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 h-10 rounded-lg border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition" />
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
              className="h-9 pl-3 pr-8 rounded-lg border border-input bg-background text-sm focus:outline-none appearance-none cursor-pointer">
              <option value="todos">Todos status</option>
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground text-sm">Carregando...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <UserRound className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">{search ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}</p>
            {!search && <button onClick={openCreate} className="mt-3 text-primary text-sm font-medium hover:underline">Cadastrar primeiro cliente</button>}
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Telefone</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                    <button onClick={() => toggleSort('created_at')} className="flex items-center gap-1 hover:text-foreground transition-colors group">
                      Cadastro
                      <span className="opacity-50 group-hover:opacity-100">
                        {sortBy === 'created_at' ? (sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />) : <ChevronsUpDown className="w-3 h-3" />}
                      </span>
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground">{c.nome}</td>
                    <td className="px-4 py-3 text-muted-foreground">{c.telefone ? formatPhone(c.telefone) : '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground">{c.email ?? '—'}</td>
                    <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{formatDate(c.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={() => openEdit(c)} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" aria-label="Editar"><Edit className="w-3.5 h-3.5" /></button>
                        <button onClick={() => setConfirmDelete(c.id)} className="p-1.5 rounded hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-colors" aria-label="Excluir"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal criar/editar */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Cliente' : 'Novo Cliente'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Nome completo *</label>
            <input type="text" required value={form.nome} onChange={(e) => field('nome', e.target.value)} placeholder="Nome do cliente"
              className="w-full h-10 px-3 rounded-lg border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Telefone</label>
              <input type="tel" value={form.telefone ?? ''} onChange={(e) => field('telefone', e.target.value)} placeholder="(53) 99999-9999"
                className="w-full h-10 px-3 rounded-lg border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Status</label>
              <select value={form.status} onChange={(e) => field('status', e.target.value as FormData['status'])}
                className="w-full h-10 px-3 rounded-lg border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Email</label>
            <input type="email" value={form.email ?? ''} onChange={(e) => field('email', e.target.value)} placeholder="email@exemplo.com"
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

      {/* Confirmação de exclusão */}
      <Modal open={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Excluir Cliente" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.</p>
          <div className="flex gap-3">
            <button onClick={() => setConfirmDelete(null)} className="flex-1 h-10 rounded-lg border border-input text-sm font-medium hover:bg-muted transition-colors">Cancelar</button>
            <button onClick={() => confirmDelete && handleDelete(confirmDelete)} disabled={del.isPending}
              className="flex-1 h-10 bg-destructive text-white rounded-lg text-sm font-medium hover:bg-destructive/90 transition-colors disabled:opacity-60">
              {del.isPending ? 'Excluindo...' : 'Excluir'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
