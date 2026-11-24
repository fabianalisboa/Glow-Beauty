import { useState, useCallback, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { formatCurrency, formatDate } from '@/lib/utils'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import ExportarBotoes from '@/components/shared/ExportarBotoes'
import { DollarSign, TrendingUp, CreditCard, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'
import { format, subMonths, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface PagamentoRow {
  id: string
  valor: number
  forma_pagamento: string | null
  data_pagamento: string
  status: string
  agendamentos: { clientes: { nome: string } | null; servicos: { nome: string } | null } | null
}

function useFinanceiro() {
  return useQuery<PagamentoRow[]>({
    queryKey: ['pagamentos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pagamentos')
        .select('id, valor, forma_pagamento, data_pagamento, status, agendamentos(clientes(nome), servicos(nome))')
        .order('data_pagamento', { ascending: false })
        .limit(100)
      if (error) throw error
      return (data ?? []) as unknown as PagamentoRow[]
    },
  })
}

function useChartReceita() {
  return useQuery<{ mes: string; receita: number }[]>({
    queryKey: ['chart-receita'],
    queryFn: async () => {
      const meses = Array.from({ length: 6 }, (_, i) => {
        const d = subMonths(new Date(), 5 - i)
        return format(d, 'yyyy-MM')
      })

      const { data } = await supabase
        .from('pagamentos')
        .select('valor, data_pagamento')
        .eq('status', 'pago')
        .gte('data_pagamento', `${meses[0]}-01`)

      return meses.map((m) => ({
        mes: format(parseISO(`${m}-01`), 'MMM', { locale: ptBR }),
        receita: (data ?? [])
          .filter((p) => p.data_pagamento.startsWith(m))
          .reduce((sum, p) => sum + Number(p.valor), 0),
      }))
    },
  })
}

const FORMA_LABELS: Record<string, string> = {
  dinheiro: 'Dinheiro', pix: 'Pix', cartao_credito: 'Cartão Crédito', cartao_debito: 'Cartão Débito',
}

export default function FinanceiroPage() {
  const { data: pagamentos = [], isLoading } = useFinanceiro()
  const { data: chartData = [] } = useChartReceita()

  const [filterStatusPag, setFilterStatusPag] = useState<'todos' | 'pago' | 'pendente'>('todos')
  const [filterForma, setFilterForma] = useState<string>('')
  const [filterMes, setFilterMes] = useState<string>('')
  const [sortBy, setSortBy] = useState<'data' | 'valor'>('data')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const toggleSort = useCallback((col: 'data' | 'valor') => {
    if (sortBy === col) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortBy(col); setSortDir('asc') }
  }, [sortBy])

  const formas = useMemo(
    () => ([...new Set(pagamentos.map((p) => p.forma_pagamento).filter(Boolean))].sort() as string[]),
    [pagamentos]
  )

  const meses = useMemo(
    () => ([...new Set(pagamentos.map((p) => p.data_pagamento.slice(0, 7)))].sort().reverse()),
    [pagamentos]
  )

  const pagamentosFiltrados = useMemo(() => {
    return pagamentos
      .filter((p) => filterStatusPag === 'todos' || p.status === filterStatusPag)
      .filter((p) => !filterForma || p.forma_pagamento === filterForma)
      .filter((p) => !filterMes || p.data_pagamento.startsWith(filterMes))
      .sort((a, b) => {
        if (sortBy === 'valor') return sortDir === 'asc' ? a.valor - b.valor : b.valor - a.valor
        return sortDir === 'asc'
          ? a.data_pagamento.localeCompare(b.data_pagamento)
          : b.data_pagamento.localeCompare(a.data_pagamento)
      })
  }, [pagamentos, filterStatusPag, filterForma, filterMes, sortBy, sortDir])

  // KPIs usam array completo
  const receitaTotal = pagamentos.filter((p) => p.status === 'pago').reduce((s, p) => s + Number(p.valor), 0)
  const pendente = pagamentos.filter((p) => p.status === 'pendente').reduce((s, p) => s + Number(p.valor), 0)
  const mesAtual = format(new Date(), 'yyyy-MM')
  const receitaMes = pagamentos.filter((p) => p.status === 'pago' && p.data_pagamento.startsWith(mesAtual)).reduce((s, p) => s + Number(p.valor), 0)

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-serif font-semibold text-foreground">Financeiro</h1>
          <p className="text-muted-foreground text-sm">Receitas e pagamentos</p>
        </div>
        <ExportarBotoes
          titulo="Financeiro"
          colunas={['Data', 'Cliente', 'Serviço', 'Forma de pagamento', 'Status', 'Valor (R$)']}
          linhas={pagamentosFiltrados.map((p) => [
            p.data_pagamento.slice(0, 10).split('-').reverse().join('/'),
            p.agendamentos?.clientes?.nome ?? '',
            p.agendamentos?.servicos?.nome ?? '',
            p.forma_pagamento ? (FORMA_LABELS[p.forma_pagamento] ?? p.forma_pagamento) : '',
            p.status,
            Number(p.valor).toFixed(2).replace('.', ','),
          ])}
        />
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Receita Total', value: formatCurrency(receitaTotal), icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Receita do Mês', value: formatCurrency(receitaMes), icon: TrendingUp, color: 'text-primary', bg: 'bg-rose-50' },
          { label: 'Aguardando Pagamento', value: formatCurrency(pendente), icon: CreditCard, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-xl border border-border p-4 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div>
              <p className="text-xl font-serif font-bold text-foreground">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Gráfico */}
      <div className="bg-white rounded-xl border border-border p-5">
        <h2 className="text-sm font-semibold text-foreground mb-4">Receita — últimos 6 meses</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData} margin={{ top: 0, right: 0, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0e6ea" />
            <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: number) => `R$${v}`} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(v: number) => [formatCurrency(v), 'Receita']} />
            <Bar dataKey="receita" fill="#c9748a" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Tabela de pagamentos */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground mb-3">Histórico de Pagamentos</h2>
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <select value={filterStatusPag} onChange={(e) => setFilterStatusPag(e.target.value as typeof filterStatusPag)}
                className="h-9 pl-3 pr-8 rounded-lg border border-input bg-background text-sm focus:outline-none appearance-none cursor-pointer">
                <option value="todos">Todos status</option>
                <option value="pago">Pago</option>
                <option value="pendente">Pendente</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            </div>
            <div className="relative">
              <select value={filterForma} onChange={(e) => setFilterForma(e.target.value)}
                className="h-9 pl-3 pr-8 rounded-lg border border-input bg-background text-sm focus:outline-none appearance-none cursor-pointer">
                <option value="">Todas formas</option>
                {formas.map((f) => (
                  <option key={f} value={f}>{FORMA_LABELS[f] ?? f}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            </div>
            <div className="relative">
              <select value={filterMes} onChange={(e) => setFilterMes(e.target.value)}
                className="h-9 pl-3 pr-8 rounded-lg border border-input bg-background text-sm focus:outline-none appearance-none cursor-pointer">
                <option value="">Todos meses</option>
                {meses.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            </div>
          </div>
        </div>
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground text-sm">Carregando...</div>
        ) : pagamentosFiltrados.length === 0 ? (
          <div className="p-12 text-center">
            <DollarSign className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">Nenhum pagamento encontrado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                    <button onClick={() => toggleSort('data')} className="flex items-center gap-1 hover:text-foreground transition-colors group">
                      Data
                      <span className="opacity-50 group-hover:opacity-100">
                        {sortBy === 'data' ? (sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />) : <ChevronsUpDown className="w-3 h-3" />}
                      </span>
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Cliente</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Serviço</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Forma</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                    <button onClick={() => toggleSort('valor')} className="flex items-center gap-1 hover:text-foreground transition-colors group">
                      Valor
                      <span className="opacity-50 group-hover:opacity-100">
                        {sortBy === 'valor' ? (sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />) : <ChevronsUpDown className="w-3 h-3" />}
                      </span>
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {pagamentosFiltrados.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(p.data_pagamento)}</td>
                    <td className="px-4 py-3 text-foreground">{p.agendamentos?.clientes?.nome ?? '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.agendamentos?.servicos?.nome ?? '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground">{FORMA_LABELS[p.forma_pagamento ?? ''] ?? p.forma_pagamento ?? '—'}</td>
                    <td className="px-4 py-3 font-semibold text-primary">{formatCurrency(Number(p.valor))}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${p.status === 'pago' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                        {p.status === 'pago' ? 'Pago' : 'Pendente'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
