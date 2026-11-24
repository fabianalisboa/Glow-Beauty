import { useState, useMemo, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { formatCurrency, formatDate, formatTime } from '@/lib/utils'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { Users, Calendar, DollarSign, Package, TrendingUp, Clock } from 'lucide-react'
import type { Agendamento } from '@/types'
import {
  format, subDays, parseISO,
  startOfWeek, endOfWeek,
  startOfMonth, endOfMonth,
  startOfYear, endOfYear,
  eachDayOfInterval, eachMonthOfInterval,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'

type Periodo = 'hoje' | 'semana' | 'mes' | 'ano'

const PERIODO_LABELS: Record<Periodo, string> = {
  hoje: 'Hoje',
  semana: 'Esta Semana',
  mes: 'Este Mês',
  ano: 'Este Ano',
}

function getRange(periodo: Periodo): { from: string; to: string } {
  const today = new Date()
  if (periodo === 'hoje') {
    const d = format(today, 'yyyy-MM-dd')
    return { from: d, to: d }
  }
  if (periodo === 'semana') {
    return {
      from: format(startOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
      to: format(endOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
    }
  }
  if (periodo === 'mes') {
    return {
      from: format(startOfMonth(today), 'yyyy-MM-dd'),
      to: format(endOfMonth(today), 'yyyy-MM-dd'),
    }
  }
  return {
    from: format(startOfYear(today), 'yyyy-MM-dd'),
    to: format(endOfYear(today), 'yyyy-MM-dd'),
  }
}

interface DashboardKpis {
  totalClientes: number
  totalAgendamentos: number
  receita: number
  produtosCriticos: number
}

function useDashboard(periodo: Periodo) {
  return useQuery<DashboardKpis>({
    queryKey: ['dashboard-kpis', periodo],
    queryFn: async () => {
      const { from, to } = getRange(periodo)

      const [clientes, agendamentos, pagamentos, produtosCriticos] = await Promise.all([
        supabase.from('clientes').select('id', { count: 'exact', head: true }).eq('status', 'ativo'),
        supabase.from('agendamentos').select('id', { count: 'exact', head: true })
          .gte('data_agendamento', from).lte('data_agendamento', to).neq('status', 'cancelado'),
        supabase.from('pagamentos').select('valor')
          .gte('data_pagamento', from).lte('data_pagamento', to).eq('status', 'pago'),
        supabase.from('produtos').select('id', { count: 'exact', head: true })
          .lt('quantidade', 5).eq('status', 'ativo'),
      ])

      return {
        totalClientes: clientes.count ?? 0,
        totalAgendamentos: agendamentos.count ?? 0,
        receita: (pagamentos.data ?? []).reduce((sum, p) => sum + Number(p.valor), 0),
        produtosCriticos: produtosCriticos.count ?? 0,
      }
    },
  })
}

function useProximosAgendamentos() {
  return useQuery<Agendamento[]>({
    queryKey: ['proximos-agendamentos'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0]
      const { data, error } = await supabase
        .from('agendamentos')
        .select('id, data_agendamento, horario, status, clientes(id, nome, telefone), servicos(id, nome, valor, duracao_minutos), profissionais(id, nome)')
        .gte('data_agendamento', today)
        .neq('status', 'cancelado')
        .order('data_agendamento')
        .order('horario')
        .limit(10)
      if (error) throw error
      return (data ?? []) as unknown as Agendamento[]
    },
  })
}

function useChartData(periodo: Periodo) {
  return useQuery<{ dia: string; total: number }[]>({
    queryKey: ['chart-agendamentos', periodo],
    queryFn: async () => {
      const today = new Date()

      if (periodo === 'ano') {
        const from = format(startOfYear(today), 'yyyy-MM-dd')
        const to = format(endOfYear(today), 'yyyy-MM-dd')
        const { data } = await supabase
          .from('agendamentos').select('data_agendamento')
          .gte('data_agendamento', from).lte('data_agendamento', to).neq('status', 'cancelado')
        const months = eachMonthOfInterval({ start: startOfYear(today), end: today })
        return months.map((m) => ({
          dia: format(m, 'MMM', { locale: ptBR }),
          total: (data ?? []).filter((a) => a.data_agendamento.startsWith(format(m, 'yyyy-MM'))).length,
        }))
      }

      if (periodo === 'mes') {
        const from = format(startOfMonth(today), 'yyyy-MM-dd')
        const to = format(endOfMonth(today), 'yyyy-MM-dd')
        const { data } = await supabase
          .from('agendamentos').select('data_agendamento')
          .gte('data_agendamento', from).lte('data_agendamento', to).neq('status', 'cancelado')
        const days = eachDayOfInterval({ start: startOfMonth(today), end: today })
        return days.map((d) => ({
          dia: format(d, 'd'),
          total: (data ?? []).filter((a) => a.data_agendamento === format(d, 'yyyy-MM-dd')).length,
        }))
      }

      // hoje ou semana → últimos 7 dias
      const dias = Array.from({ length: 7 }, (_, i) => {
        const d = subDays(today, 6 - i)
        return format(d, 'yyyy-MM-dd')
      })
      const { data } = await supabase
        .from('agendamentos').select('data_agendamento')
        .gte('data_agendamento', dias[0]).lte('data_agendamento', dias[6]).neq('status', 'cancelado')
      return dias.map((d) => ({
        dia: format(parseISO(d), 'EEE', { locale: ptBR }),
        total: (data ?? []).filter((a) => a.data_agendamento === d).length,
      }))
    },
  })
}

const STATUS_COLORS: Record<string, string> = {
  pendente: 'bg-amber-100 text-amber-700',
  confirmado: 'bg-blue-100 text-blue-700',
  concluido: 'bg-green-100 text-green-700',
  cancelado: 'bg-red-100 text-red-700',
}

const STATUS_LABELS: Record<string, string> = {
  pendente: 'Pendente',
  confirmado: 'Confirmado',
  concluido: 'Concluído',
  cancelado: 'Cancelado',
}

export default function DashboardPage() {
  const [periodo, setPeriodo] = useState<Periodo>('mes')
  const { data: kpis, isLoading: kpiLoading } = useDashboard(periodo)
  const { data: proximos = [] } = useProximosAgendamentos()
  const { data: chartData = [] } = useChartData(periodo)

  const handlePeriodo = useCallback((p: Periodo) => setPeriodo(p), [])

  const periodoLabel = PERIODO_LABELS[periodo]

  const kpiCards = useMemo(() => [
    { label: 'Clientes Ativos', value: kpis?.totalClientes ?? 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: `Agendamentos — ${periodoLabel}`, value: kpis?.totalAgendamentos ?? 0, icon: Calendar, color: 'text-primary', bg: 'bg-rose-50' },
    { label: `Receita — ${periodoLabel}`, value: formatCurrency(kpis?.receita ?? 0), icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Estoque Crítico', value: kpis?.produtosCriticos ?? 0, icon: Package, color: 'text-amber-600', bg: 'bg-amber-50' },
  ], [kpis, periodoLabel])

  const chartTitle = periodo === 'ano'
    ? 'Agendamentos por mês'
    : periodo === 'mes'
    ? 'Agendamentos — dias do mês'
    : 'Agendamentos — últimos 7 dias'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-serif font-semibold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Visão geral do seu negócio</p>
        </div>

        {/* Filtro de período */}
        <div className="flex rounded-lg border border-input overflow-hidden bg-background">
          {(Object.keys(PERIODO_LABELS) as Periodo[]).map((p) => (
            <button
              key={p}
              onClick={() => handlePeriodo(p)}
              className={`px-3 py-1.5 text-xs font-medium transition-colors border-r border-input last:border-0 ${
                periodo === p
                  ? 'bg-primary text-white'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {PERIODO_LABELS[p]}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-xl border border-border p-4 flex flex-col gap-3">
            <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div>
              {kpiLoading ? (
                <div className="h-7 w-16 rounded bg-muted animate-pulse mb-1" />
              ) : (
                <p className="text-2xl font-serif font-bold text-foreground">{value}</p>
              )}
              <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Gráfico */}
        <div className="bg-white rounded-xl border border-border p-5">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">{chartTitle}</h2>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0e6ea" />
              <XAxis dataKey="dia" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #f0e6ea' }}
                formatter={(v: number) => [v, 'Agendamentos']}
              />
              <Bar dataKey="total" fill="#c9748a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Próximos agendamentos */}
        <div className="bg-white rounded-xl border border-border p-5">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Próximos Agendamentos</h2>
          </div>
          {proximos.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">Nenhum agendamento próximo</p>
          ) : (
            <div className="space-y-3">
              {proximos.map((a) => (
                <div key={a.id} className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0">
                  <div className="text-center min-w-[44px]">
                    <p className="text-xs font-bold text-primary">{formatTime(a.horario)}</p>
                    <p className="text-[10px] text-muted-foreground">{formatDate(a.data_agendamento)}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{a.clientes?.nome ?? '—'}</p>
                    <p className="text-xs text-muted-foreground truncate">{a.servicos?.nome ?? '—'}</p>
                  </div>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[a.status] ?? ''}`}>
                    {STATUS_LABELS[a.status] ?? a.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

