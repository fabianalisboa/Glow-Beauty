import { useState, useCallback, useRef, useMemo } from 'react'
import { useServicos, useUpsertServico, useDeleteServico } from '@/hooks/useServicos'
import { formatCurrency } from '@/lib/utils'
import { supabase } from '@/integrations/supabase/client'
import Modal from '@/components/shared/Modal'
import StatusBadge from '@/components/shared/StatusBadge'
import { Plus, Search, Edit, Trash2, Scissors, Clock, ImagePlus, X, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'
import type { Servico } from '@/types'

const FALLBACK_IMG = '/Logo Glow Beauty.png'

type FormData = {
  nome: string
  descricao: string
  valor: string
  duracao_minutos: string
  status: 'ativo' | 'inativo'
  image_url: string
}

const EMPTY: FormData = {
  nome: '',
  descricao: '',
  valor: '',
  duracao_minutos: '60',
  status: 'ativo',
  image_url: '',
}

async function uploadServiceImage(file: File): Promise<string> {
  const ext = file.name.split('.').pop()
  const path = `${Date.now()}.${ext}`
  const { error } = await supabase.storage.from('servico-imagens').upload(path, file, { upsert: true })
  if (error) throw error
  const { data } = supabase.storage.from('servico-imagens').getPublicUrl(path)
  return data.publicUrl
}

export default function ServicosPage() {
  const { data: servicos = [], isLoading } = useServicos()
  const upsert = useUpsertServico()
  const del = useDeleteServico()

  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<'todos' | 'ativo' | 'inativo'>('todos')
  const [sortBy, setSortBy] = useState<string>('nome')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Servico | null>(null)
  const [form, setForm] = useState<FormData>(EMPTY)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string>('')
  const [saveError, setSaveError] = useState<string>('')
  const fileRef = useRef<HTMLInputElement>(null)

  const toggleSort = useCallback((col: string) => {
    if (sortBy === col) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortBy(col); setSortDir('asc') }
  }, [sortBy])

  const filtered = useMemo(() => {
    return servicos
      .filter((s) => s.nome.toLowerCase().includes(search.toLowerCase()))
      .filter((s) => filterStatus === 'todos' || s.status === filterStatus)
      .sort((a, b) => {
        if (sortBy === 'valor') {
          return sortDir === 'asc' ? a.valor - b.valor : b.valor - a.valor
        }
        if (sortBy === 'duracao_minutos') {
          return sortDir === 'asc' ? a.duracao_minutos - b.duracao_minutos : b.duracao_minutos - a.duracao_minutos
        }
        const valA = a.nome.toLowerCase()
        const valB = b.nome.toLowerCase()
        return sortDir === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA)
      })
  }, [servicos, search, filterStatus, sortBy, sortDir])

  const openCreate = useCallback(() => {
    setEditing(null)
    setForm(EMPTY)
    setImagePreview('')
    setSaveError('')
    setUploadError('')
    setModalOpen(true)
  }, [])

  const openEdit = useCallback((s: Servico) => {
    setEditing(s)
    setForm({
      nome: s.nome,
      descricao: s.descricao ?? '',
      valor: String(s.valor),
      duracao_minutos: String(s.duracao_minutos),
      status: s.status,
      image_url: s.image_url ?? '',
    })
    setImagePreview(s.image_url ?? '')
    setSaveError('')
    setUploadError('')
    setModalOpen(true)
  }, [])

  const handleImageChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadError('')
    const preview = URL.createObjectURL(file)
    setImagePreview(preview)
    setUploading(true)
    try {
      const url = await uploadServiceImage(file)
      setForm((p) => ({ ...p, image_url: url }))
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setUploadError(`Erro no upload: ${msg}`)
      setImagePreview(form.image_url)
      if (fileRef.current) fileRef.current.value = ''
    } finally {
      setUploading(false)
    }
  }, [form.image_url])

  const handleRemoveImage = useCallback(() => {
    setImagePreview('')
    setForm((p) => ({ ...p, image_url: '' }))
    if (fileRef.current) fileRef.current.value = ''
  }, [])

  const handleSave = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setSaveError('')
    const payload = {
      nome: form.nome,
      descricao: form.descricao || null,
      valor: parseFloat(form.valor),
      duracao_minutos: parseInt(form.duracao_minutos),
      status: form.status,
      image_url: form.image_url || null,
    }
    try {
      await upsert.mutateAsync(editing ? { ...payload, id: editing.id } : payload as Parameters<typeof upsert.mutateAsync>[0])
      setModalOpen(false)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setSaveError(`Erro ao salvar: ${msg}`)
    }
  }, [form, editing, upsert])

  const field = (f: keyof FormData, v: string) => setForm((p) => ({ ...p, [f]: v }))

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-semibold text-foreground">Serviços</h1>
          <p className="text-muted-foreground text-sm">{servicos.length} cadastrados</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" /> Novo Serviço
        </button>
      </div>

      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="search" placeholder="Buscar serviços..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 h-10 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition" />
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

      <div className="bg-white rounded-xl border border-border overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground text-sm">Carregando...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Scissors className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">Nenhum serviço encontrado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                    <button onClick={() => toggleSort('nome')} className="flex items-center gap-1 hover:text-foreground transition-colors group">
                      Serviço
                      <span className="opacity-50 group-hover:opacity-100">
                        {sortBy === 'nome' ? (sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />) : <ChevronsUpDown className="w-3 h-3" />}
                      </span>
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                    <button onClick={() => toggleSort('duracao_minutos')} className="flex items-center gap-1 hover:text-foreground transition-colors group">
                      Duração
                      <span className="opacity-50 group-hover:opacity-100">
                        {sortBy === 'duracao_minutos' ? (sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />) : <ChevronsUpDown className="w-3 h-3" />}
                      </span>
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                    <button onClick={() => toggleSort('valor')} className="flex items-center gap-1 hover:text-foreground transition-colors group">
                      Valor
                      <span className="opacity-50 group-hover:opacity-100">
                        {sortBy === 'valor' ? (sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />) : <ChevronsUpDown className="w-3 h-3" />}
                      </span>
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={s.image_url || FALLBACK_IMG}
                          alt={s.nome}
                          className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-border"
                          onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK_IMG }}
                        />
                        <div>
                          <p className="font-medium text-foreground">{s.nome}</p>
                          {s.descricao && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{s.descricao}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {s.duracao_minutos} min</span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-primary">{formatCurrency(s.valor)}</td>
                    <td className="px-4 py-3"><StatusBadge status={s.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={() => openEdit(s)} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"><Edit className="w-3.5 h-3.5" /></button>
                        <button onClick={() => setConfirmDelete(s.id)} className="p-1.5 rounded hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Serviço' : 'Novo Serviço'}>
        <form onSubmit={handleSave} className="space-y-4">
          {/* Imagem */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Imagem do serviço</label>
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-40 object-cover rounded-lg border border-input"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK_IMG }}
                />
                {uploading && (
                  <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xs font-medium">Enviando...</span>
                  </div>
                )}
                {!uploading && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow hover:bg-red-50 transition-colors"
                  >
                    <X className="w-3.5 h-3.5 text-muted-foreground hover:text-red-600" />
                  </button>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-full h-28 rounded-lg border-2 border-dashed border-input hover:border-primary/40 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary transition-colors"
              >
                <ImagePlus className="w-6 h-6" />
                <span className="text-xs">Clique para adicionar imagem</span>
                <span className="text-xs opacity-60">JPG, PNG ou WebP · máx. 5 MB</span>
              </button>
            )}
            {uploadError && (
              <p className="mt-1.5 text-xs text-red-600 bg-red-50 rounded-md px-3 py-2">{uploadError}</p>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Nome do serviço *</label>
            <input type="text" required value={form.nome} onChange={(e) => field('nome', e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Descrição</label>
            <textarea rows={2} value={form.descricao} onChange={(e) => field('descricao', e.target.value)} placeholder="Descreva o serviço..."
              className="w-full px-3 py-2 rounded-lg border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Valor (R$) *</label>
              <input type="number" required min="0" step="0.01" value={form.valor} onChange={(e) => field('valor', e.target.value)} placeholder="0,00"
                className="w-full h-10 px-3 rounded-lg border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Duração (min) *</label>
              <input type="number" required min="1" value={form.duracao_minutos} onChange={(e) => field('duracao_minutos', e.target.value)}
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
          {saveError && (
            <p className="text-xs text-red-600 bg-red-50 rounded-md px-3 py-2">{saveError}</p>
          )}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="flex-1 h-10 rounded-lg border border-input text-sm font-medium hover:bg-muted transition-colors">Cancelar</button>
            <button type="submit" disabled={upsert.isPending || uploading} className="flex-1 h-10 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-60">
              {upsert.isPending ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Excluir Serviço" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Tem certeza que deseja excluir este serviço?</p>
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
