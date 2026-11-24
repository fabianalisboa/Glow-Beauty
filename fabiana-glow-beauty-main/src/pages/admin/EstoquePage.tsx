import { useState, useCallback, useMemo } from 'react'
import { useProdutos, useUpsertProduto, useMovimentacoes, useRegistrarMovimentacao } from '@/hooks/useEstoque'
import { formatCurrency, formatDate } from '@/lib/utils'
import Modal from '@/components/shared/Modal'
import StatusBadge from '@/components/shared/StatusBadge'
import { Plus, Search, Edit, Package, ArrowUp, ArrowDown, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'
import type { Produto } from '@/types'

type FormProduto = { nome: string; categoria: string; quantidade: string; valor_unitario: string; status: 'ativo' | 'inativo' }
const EMPTY_P: FormProduto = { nome: '', categoria: '', quantidade: '0', valor_unitario: '', status: 'ativo' }

type FormMov = { produto_id: string; tipo_movimentacao: 'entrada' | 'saida'; quantidade: string; observacao: string }
const EMPTY_M: FormMov = { produto_id: '', tipo_movimentacao: 'entrada', quantidade: '1', observacao: '' }

export default function EstoquePage() {
  const { data: produtos = [], isLoading } = useProdutos()
  const { data: movimentacoes = [] } = useMovimentacoes()
  const upsert = useUpsertProduto()
  const registrar = useRegistrarMovimentacao()

  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<'produtos' | 'movimentacoes'>('produtos')
  const [prodModal, setProdModal] = useState(false)
  const [movModal, setMovModal] = useState(false)
  const [editing, setEditing] = useState<Produto | null>(null)
  const [formP, setFormP] = useState<FormProduto>(EMPTY_P)
  const [formM, setFormM] = useState<FormMov>(EMPTY_M)

  // Filtros e sort — Produtos
  const [filterStatus, setFilterStatus] = useState<'todos' | 'ativo' | 'inativo'>('todos')
  const [filterCategoria, setFilterCategoria] = useState<string>('')
  const [filterCriticos, setFilterCriticos] = useState<boolean>(false)
  const [sortBy, setSortBy] = useState<string>('nome')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  // Filtros — Movimentações
  const [filterTipoMov, setFilterTipoMov] = useState<'todos' | 'entrada' | 'saida'>('todos')

  const toggleSort = useCallback((col: string) => {
    if (sortBy === col) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortBy(col); setSortDir('asc') }
  }, [sortBy])

  const categorias = useMemo(
    () => ([...new Set(produtos.map((p) => p.categoria).filter(Boolean))].sort() as string[]),
    [produtos]
  )

  const filtered = useMemo(() => {
    return produtos
      .filter((p) =>
        p.nome.toLowerCase().includes(search.toLowerCase()) ||
        (p.categoria ?? '').toLowerCase().includes(search.toLowerCase())
      )
      .filter((p) => filterStatus === 'todos' || p.status === filterStatus)
      .filter((p) => !filterCategoria || p.categoria === filterCategoria)
      .filter((p) => !filterCriticos || (p.quantidade < 5 && p.status === 'ativo'))
      .sort((a, b) => {
        if (sortBy === 'quantidade') {
          return sortDir === 'asc' ? a.quantidade - b.quantidade : b.quantidade - a.quantidade
        }
        if (sortBy === 'valor_unitario') {
          return sortDir === 'asc'
            ? (a.valor_unitario ?? 0) - (b.valor_unitario ?? 0)
            : (b.valor_unitario ?? 0) - (a.valor_unitario ?? 0)
        }
        const valA = a.nome.toLowerCase()
        const valB = b.nome.toLowerCase()
        return sortDir === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA)
      })
  }, [produtos, search, filterStatus, filterCategoria, filterCriticos, sortBy, sortDir])

  const movimentacoesFiltradas = useMemo(() => {
    return movimentacoes.filter((m) =>
      filterTipoMov === 'todos' || m.tipo_movimentacao === filterTipoMov
    )
  }, [movimentacoes, filterTipoMov])

  const criticos = produtos.filter((p) => p.quantidade < 5 && p.status === 'ativo')

  const openCreate = useCallback(() => { setEditing(null); setFormP(EMPTY_P); setProdModal(true) }, [])
  const openEdit = useCallback((p: Produto) => {
    setEditing(p)
    setFormP({ nome: p.nome, categoria: p.categoria ?? '', quantidade: String(p.quantidade), valor_unitario: p.valor_unitario ? String(p.valor_unitario) : '', status: p.status })
    setProdModal(true)
  }, [])

  const openMov = useCallback((prodId?: string) => {
    setFormM({ ...EMPTY_M, produto_id: prodId ?? '' })
    setMovModal(true)
  }, [])

  const handleSaveProd = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      nome: formP.nome, categoria: formP.categoria || null, quantidade: parseInt(formP.quantidade),
      valor_unitario: formP.valor_unitario ? parseFloat(formP.valor_unitario) : null, status: formP.status,
    }
    await upsert.mutateAsync(editing ? { ...payload, id: editing.id } : payload as Parameters<typeof upsert.mutateAsync>[0])
    setProdModal(false)
  }, [formP, editing, upsert])

  const handleSaveMov = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    await registrar.mutateAsync({ produto_id: formM.produto_id, tipo_movimentacao: formM.tipo_movimentacao, quantidade: parseInt(formM.quantidade), observacao: formM.observacao || undefined })
    setMovModal(false)
  }, [formM, registrar])

  const fp = (f: keyof FormProduto, v: string) => setFormP((p) => ({ ...p, [f]: v }))
  const fm = (f: keyof FormMov, v: string) => setFormM((p) => ({ ...p, [f]: v }))

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-semibold text-foreground">Estoque</h1>
          <p className="text-muted-foreground text-sm">{produtos.length} produtos · {criticos.length} críticos</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => openMov()} className="flex items-center gap-2 border border-input bg-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-muted transition-colors">
            <ArrowUp className="w-4 h-4" /> Movimentação
          </button>
          <button onClick={openCreate} className="flex items-center gap-2 bg-primary text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
            <Plus className="w-4 h-4" /> Produto
          </button>
        </div>
      </div>

      {criticos.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-2">
          <Package className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-700 font-medium">{criticos.length} produto(s) com estoque crítico (menos de 5 unidades)</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit">
        {(['produtos', 'movimentacoes'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors capitalize ${tab === t ? 'bg-white shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
            {t === 'movimentacoes' ? 'Movimentações' : 'Produtos'}
          </button>
        ))}
      </div>

      {tab === 'produtos' ? (
        <>
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="search" placeholder="Buscar produtos..." value={search} onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 h-10 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition" />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
                  className="h-9 pl-3 pr-8 rounded-lg border border-input bg-background text-sm focus:outline-none appearance-none cursor-pointer">
                  <option value="todos">Todos status</option>
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
              </div>
              <div className="relative">
                <select value={filterCategoria} onChange={(e) => setFilterCategoria(e.target.value)}
                  className="h-9 pl-3 pr-8 rounded-lg border border-input bg-background text-sm focus:outline-none appearance-none cursor-pointer">
                  <option value="">Todas categorias</option>
                  {categorias.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
              </div>
              <label className="flex items-center gap-1.5 text-sm text-muted-foreground cursor-pointer select-none">
                <input type="checkbox" checked={filterCriticos} onChange={(e) => setFilterCriticos(e.target.checked)}
                  className="rounded border-input" />
                Só críticos
              </label>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            {isLoading ? (
              <div className="p-8 text-center text-muted-foreground text-sm">Carregando...</div>
            ) : filtered.length === 0 ? (
              <div className="p-12 text-center">
                <Package className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">Nenhum produto cadastrado</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 border-b border-border">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                        <button onClick={() => toggleSort('nome')} className="flex items-center gap-1 hover:text-foreground transition-colors group">
                          Produto
                          <span className="opacity-50 group-hover:opacity-100">
                            {sortBy === 'nome' ? (sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />) : <ChevronsUpDown className="w-3 h-3" />}
                          </span>
                        </button>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Categoria</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                        <button onClick={() => toggleSort('quantidade')} className="flex items-center gap-1 hover:text-foreground transition-colors group">
                          Estoque
                          <span className="opacity-50 group-hover:opacity-100">
                            {sortBy === 'quantidade' ? (sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />) : <ChevronsUpDown className="w-3 h-3" />}
                          </span>
                        </button>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                        <button onClick={() => toggleSort('valor_unitario')} className="flex items-center gap-1 hover:text-foreground transition-colors group">
                          Valor Unit.
                          <span className="opacity-50 group-hover:opacity-100">
                            {sortBy === 'valor_unitario' ? (sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />) : <ChevronsUpDown className="w-3 h-3" />}
                          </span>
                        </button>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {filtered.map((p) => (
                      <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3 font-medium text-foreground">{p.nome}</td>
                        <td className="px-4 py-3 text-muted-foreground">{p.categoria ?? '—'}</td>
                        <td className="px-4 py-3">
                          <span className={`font-semibold ${p.quantidade < 5 ? 'text-amber-600' : 'text-foreground'}`}>{p.quantidade}</span>
                          {p.quantidade < 5 && <span className="ml-1 text-xs text-amber-600">⚠️</span>}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{p.valor_unitario ? formatCurrency(p.valor_unitario) : '—'}</td>
                        <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 justify-end">
                            <button onClick={() => openEdit(p)} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"><Edit className="w-3.5 h-3.5" /></button>
                            <button onClick={() => openMov(p.id)} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Registrar movimentação"><ArrowUp className="w-3.5 h-3.5" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <select value={filterTipoMov} onChange={(e) => setFilterTipoMov(e.target.value as typeof filterTipoMov)}
                className="h-9 pl-3 pr-8 rounded-lg border border-input bg-background text-sm focus:outline-none appearance-none cursor-pointer">
                <option value="todos">Todos tipos</option>
                <option value="entrada">Entrada</option>
                <option value="saida">Saída</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            </div>
          </div>
          <div className="bg-white rounded-xl border border-border overflow-hidden">
          {movimentacoesFiltradas.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground text-sm">Nenhuma movimentação registrada</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    {['Data', 'Produto', 'Tipo', 'Quantidade', 'Observação'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {movimentacoesFiltradas.map((m) => (
                    <tr key={m.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(m.created_at)}</td>
                      <td className="px-4 py-3 text-foreground">{m.produtos?.nome ?? '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${m.tipo_movimentacao === 'entrada' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {m.tipo_movimentacao === 'entrada' ? <ArrowDown className="w-3 h-3" /> : <ArrowUp className="w-3 h-3" />}
                          {m.tipo_movimentacao === 'entrada' ? 'Entrada' : 'Saída'}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium">{m.quantidade}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{m.observacao ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          </div>
        </div>
      )}

      {/* Modal produto */}
      <Modal open={prodModal} onClose={() => setProdModal(false)} title={editing ? 'Editar Produto' : 'Novo Produto'}>
        <form onSubmit={handleSaveProd} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Nome *</label>
            <input type="text" required value={formP.nome} onChange={(e) => fp('nome', e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Categoria</label>
              <input type="text" value={formP.categoria} onChange={(e) => fp('categoria', e.target.value)} placeholder="Ex: Hidratante"
                className="w-full h-10 px-3 rounded-lg border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Quantidade</label>
              <input type="number" min="0" required value={formP.quantidade} onChange={(e) => fp('quantidade', e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Valor unitário</label>
              <input type="number" min="0" step="0.01" value={formP.valor_unitario} onChange={(e) => fp('valor_unitario', e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Status</label>
              <select value={formP.status} onChange={(e) => fp('status', e.target.value as FormProduto['status'])}
                className="w-full h-10 px-3 rounded-lg border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setProdModal(false)} className="flex-1 h-10 rounded-lg border border-input text-sm font-medium hover:bg-muted transition-colors">Cancelar</button>
            <button type="submit" disabled={upsert.isPending} className="flex-1 h-10 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-60">
              {upsert.isPending ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal movimentação */}
      <Modal open={movModal} onClose={() => setMovModal(false)} title="Registrar Movimentação" size="sm">
        <form onSubmit={handleSaveMov} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Produto *</label>
            <select required value={formM.produto_id} onChange={(e) => fm('produto_id', e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="">Selecione</option>
              {produtos.map((p) => <option key={p.id} value={p.id}>{p.nome} (estoque: {p.quantidade})</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Tipo</label>
              <select value={formM.tipo_movimentacao} onChange={(e) => fm('tipo_movimentacao', e.target.value as FormMov['tipo_movimentacao'])}
                className="w-full h-10 px-3 rounded-lg border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="entrada">Entrada</option>
                <option value="saida">Saída</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Quantidade</label>
              <input type="number" required min="1" value={formM.quantidade} onChange={(e) => fm('quantidade', e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Observação</label>
            <input type="text" value={formM.observacao} onChange={(e) => fm('observacao', e.target.value)} placeholder="Opcional"
              className="w-full h-10 px-3 rounded-lg border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setMovModal(false)} className="flex-1 h-10 rounded-lg border border-input text-sm font-medium hover:bg-muted transition-colors">Cancelar</button>
            <button type="submit" disabled={registrar.isPending} className="flex-1 h-10 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-60">
              {registrar.isPending ? 'Salvando...' : 'Registrar'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
