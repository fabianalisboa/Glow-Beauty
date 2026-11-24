import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAgendamentos, useUpdateAgendamentoStatus, useDeleteAgendamento } from '@/hooks/useAgendamentos'
import { useProfissionais } from '@/hooks/useProfissionais'
import { formatDate, formatTime, formatCurrency } from '@/lib/utils'
import ExportarBotoes from '@/components/shared/ExportarBotoes'
import Modal from '@/components/shared/Modal'
import { Calendar, Search, Trash2, ChevronDown, MessageCircle, CalendarCheck, XCircle, ChevronsUpDown, ChevronUp } from 'lucide-react'
import type { Agendamento } from '@/types'
import { isToday, isThisWeek, isThisMonth, parseISO } from 'date-fns'

const STATUS_OPTIONS: Agendamento['status'][] = ['pendente', 'agendando', 'confirmado', 'concluido', 'cancelado']
const STATUS_LABELS: Record<string, string> = {
  pendente: 'Pendente', agendando: 'Agendando', confirmado: 'Confirmado', concluido: 'Concluído', cancelado: 'Cancelado'
}
const STATUS_COLORS: Record<string, string> = {
  pendente: 'bg-amber-50 text-amber-700 border-amber-200',
  agendando: 'bg-purple-50 text-purple-700 border-purple-200',
  confirmado: 'bg-blue-50 text-blue-700 border-blue-200',
  concluido: 'bg-green-50 text-green-700 border-green-200',
  cancelado: 'bg-red-50 text-red-600 border-red-200',
}

function whatsappUrl(telefone: string | null | undefined, cliente: string, servico: string, data: string, hora: string): string {
  if (!telefone) return '#'
  const digits = telefone.replace(/\D/g, '')
  const number = digits.startsWith('55') ? digits : `55${digits}`
  const msg = `Olá ${cliente}! Confirmando seu agendamento de ${servico} para ${data} às ${hora}. Qualquer dúvida estamos à disposição. — Glow Beauty ✨`
  return `https://wa.me/${number}?text=${encodeURIComponent(msg)}`
}

export default function AgendamentosPage() {
  const { data: agendamentos = [], isLoading } = useAgendamentos()
  const { data: profissionais = [] } = useProfissionais()
  const updateStatus = useUpdateAgendamentoStatus()
  const del = useDeleteAgendamento()
  const [searchParams] = useSearchParams()
  const highlightId = searchParams.get('highlight')
  const highlightRef = useRef<HTMLTableRowElement>(null)

  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('todos')
  const [filterPeriodo, setFilterPeriodo] = useState<string>('todos')
  const [filterProfissional, setFilterProfissional] = useState<string>('todos')
  const [sortBy, setSortBy] = useState<'data' | 'valor'>('data')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const toggleSort = useCallback((col: 'data' | 'valor') => {
    if (sortBy === col) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortBy(col); setSortDir('asc') }
  }, [sortBy])

  useEffect(() => {
    if (highlightId && highlightRef.current) {
      highlightRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [highlightId, agendamentos.length])

  const filtered = useMemo(() => {
    return agendamentos
      .filter((a) => {
        const matchSearch =
          (a.clientes?.nome ?? '').toLowerCase().includes(search.toLowerCase()) ||
          (a.servicos?.nome ?? '').toLowerCase().includes(search.toLowerCase()) ||
          (a.profissionais?.nome ?? '').toLowerCase().includes(search.toLowerCase())
        const matchStatus = filterStatus === 'todos' || a.status === filterStatus
        const matchProf = filterProfissional === 'todos' || a.profissional_id === filterProfissional
        let matchPeriodo = true
        if (filterPeriodo !== 'todos') {
          try {
            const d = parseISO(a.data_agendamento)
            if (filterPeriodo === 'hoje') matchPeriodo = isToday(d)
            else if (filterPeriodo === 'semana') matchPeriodo = isThisWeek(d, { weekStartsOn: 1 })
            else if (filterPeriodo === 'mes') matchPeriodo = isThisMonth(d)
          } catch { matchPeriodo = false }
        }
        return matchSearch && matchStatus && matchProf && matchPeriodo
      })
      .sort((a, b) => {
        if (sortBy === 'valor') {
          const va = a.servicos?.valor ?? 0
          const vb = b.servicos?.valor ?? 0
          return sortDir === 'asc' ? va - vb : vb - va
        }
        const da = `${a.data_agendamento}${a.horario}`
        const db = `${b.data_agendamento}${b.horario}`
        return sortDir === 'asc' ? da.localeCompare(db) : db.localeCompare(da)
      })
  }, [agendamentos, search, filterStatus, filterProfissional, filterPeriodo, sortBy, sortDir])

  const SortIcon = ({ col }: { col: 'data' | 'valor' }) =>
    sortBy === col
      ? sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
      : <ChevronsUpDown className="w-3 h-3 opacity-40" />

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-serif font-semibold text-foreground">Agendamentos</h1>
          <p className="text-muted-foreground text-sm">{filtered.length} de {agendamentos.length} exibidos</p>
        </div>
        <ExportarBotoes
          titulo="Agendamentos"
          colunas={['Data', 'Horário', 'Cliente', 'Serviço', 'Profissional', 'Status', 'Valor (R$)']}
          linhas={filtered.map((a) => [
            a.data_agendamento.slice(0, 10).split('-').reverse().join('/'),
            formatTime(a.horario),
            a.clientes?.nome ?? '',
            a.servicos?.nome ?? '',
            a.profissionais?.nome ?? '',
            STATUS_LABELS[a.status] ?? a.status,
            Number(a.servicos?.valor ?? 0).toFixed(2).replace('.', ','),
          ])}
        />
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Cliente, serviço ou profissional..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 h-9 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition"
          />
        </div>

        {[
          {
            value: filterStatus, onChange: setFilterStatus,
            options: [['todos', 'Todos status'], ...STATUS_OPTIONS.map((s) => [s, STATUS_LABELS[s]])]
          },
          {
            value: filterPeriodo, onChange: setFilterPeriodo,
            options: [['todos', 'Todo período'], ['hoje', 'Hoje'], ['semana', 'Esta semana'], ['mes', 'Este mês']]
          },
        ].map(({ value, onChange, options }, i) => (
          <div key={i} className="relative">
            <select
              value={value as string}
              onChange={(e) => (onChange as (v: string) => void)(e.target.value)}
              className="h-9 pl-3 pr-8 rounded-lg border border-input bg-background text-sm focus:outline-none appearance-none cursor-pointer"
            >
              {(options as [string, string][]).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          </div>
        ))}

        {profissionais.length > 0 && (
          <div className="relative">
            <select
              value={filterProfissional}
              onChange={(e) => setFilterProfissional(e.target.value)}
              className="h-9 pl-3 pr-8 rounded-lg border border-input bg-background text-sm focus:outline-none appearance-none cursor-pointer"
            >
              <option value="todos">Todos profissionais</option>
              {profissionais.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-border overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground text-sm">Carregando...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">Nenhum agendamento encontrado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                    <button onClick={() => toggleSort('data')} className="flex items-center gap-1 hover:text-foreground transition-colors">
                      Data / Hora <SortIcon col="data" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Cliente</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Serviço</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Profissional</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                    <button onClick={() => toggleSort('valor')} className="flex items-center gap-1 hover:text-foreground transition-colors">
                      Valor <SortIcon col="valor" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filtered.map((a) => {
                  const isHighlight = a.id === highlightId
                  const dataLabel = formatDate(a.data_agendamento)
                  const horaLabel = formatTime(a.horario)
                  return (
                    <tr
                      key={a.id}
                      ref={isHighlight ? highlightRef : undefined}
                      className={`transition-colors ${isHighlight ? 'bg-rose-50 ring-2 ring-inset ring-primary/30' : 'hover:bg-muted/20'}`}
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground text-xs">{dataLabel}</p>
                        <p className="text-muted-foreground text-xs">{horaLabel}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground">{a.clientes?.nome ?? '—'}</p>
                        {a.clientes?.telefone && (
                          <p className="text-xs text-muted-foreground">{a.clientes.telefone}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{a.servicos?.nome ?? '—'}</td>
                      <td className="px-4 py-3 text-muted-foreground">{a.profissionais?.nome ?? '—'}</td>
                      <td className="px-4 py-3 font-semibold text-primary text-xs">
                        {a.servicos?.valor ? formatCurrency(a.servicos.valor) : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={a.status}
                          onChange={(e) => updateStatus.mutate({ id: a.id, status: e.target.value as Agendamento['status'] })}
                          className={`text-xs rounded-md border px-2 py-1 focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer ${STATUS_COLORS[a.status] ?? ''}`}
                        >
                          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {a.status === 'pendente' && (
                            <>
                              <button
                                onClick={() => updateStatus.mutate({ id: a.id, status: 'confirmado' })}
                                title="Confirmar agendamento"
                                className="p-1.5 rounded hover:bg-green-50 text-muted-foreground hover:text-green-600 transition-colors"
                              >
                                <CalendarCheck className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => updateStatus.mutate({ id: a.id, status: 'cancelado' })}
                                title="Cancelar agendamento"
                                className="p-1.5 rounded hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-colors"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                          {a.clientes?.telefone && (
                            <a
                              href={whatsappUrl(a.clientes.telefone, a.clientes.nome ?? '', a.servicos?.nome ?? '', dataLabel, horaLabel)}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Enviar confirmação via WhatsApp"
                              onClick={() => updateStatus.mutate({ id: a.id, status: 'agendando' })}
                              className="p-1.5 rounded hover:bg-[#25D366]/10 text-muted-foreground hover:text-[#128C7E] transition-colors"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </a>
                          )}
                          <button
                            onClick={() => setConfirmDelete(a.id)}
                            title="Excluir"
                            className="p-1.5 rounded hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Excluir Agendamento" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Tem certeza que deseja excluir este agendamento?</p>
          <div className="flex gap-3">
            <button onClick={() => setConfirmDelete(null)} className="flex-1 h-10 rounded-lg border border-input text-sm font-medium hover:bg-muted transition-colors">Cancelar</button>
            <button
              onClick={() => { if (confirmDelete) del.mutate(confirmDelete); setConfirmDelete(null) }}
              disabled={del.isPending}
              className="flex-1 h-10 bg-destructive text-white rounded-lg text-sm font-medium hover:bg-destructive/90 transition-colors disabled:opacity-60"
            >
              Excluir
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
