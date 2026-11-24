import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, CheckCheck, Trash2, MessageCircle, CalendarCheck, XCircle, X } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useNotificacoes } from '@/hooks/useNotificacoes'
import type { Agendamento } from '@/types'

function whatsappUrl(telefone: string | null, mensagem: string): string {
  if (!telefone) return '#'
  const digits = telefone.replace(/\D/g, '')
  const number = digits.startsWith('55') ? digits : `55${digits}`
  return `https://wa.me/${number}?text=${encodeURIComponent(mensagem)}`
}

export default function NotificacaoBell() {
  const navigate = useNavigate()
  const { notificacoes, naoLidas, marcarLida, marcarTodasLidas, remover, limparTodas } = useNotificacoes()
  const [open, setOpen] = useState(false)
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({})
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleOpen = useCallback(() => {
    setOpen((v) => !v)
  }, [])

  const handleVer = useCallback((agendamentoId: string) => {
    marcarLida(agendamentoId)
    navigate(`/admin/agendamentos?highlight=${agendamentoId}`)
    setOpen(false)
  }, [marcarLida, navigate])

  const handleAction = useCallback(async (
    agendamentoId: string,
    status: Agendamento['status']
  ) => {
    setActionLoading((p) => ({ ...p, [agendamentoId]: true }))
    await supabase.from('agendamentos').update({ status }).eq('id', agendamentoId)
    marcarLida(agendamentoId)
    setActionLoading((p) => ({ ...p, [agendamentoId]: false }))
  }, [marcarLida])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={handleOpen}
        className="relative w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
        aria-label="Notificações"
      >
        <Bell className="w-5 h-5 text-muted-foreground" />
        {naoLidas > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary rounded-full flex items-center justify-center text-[10px] font-bold text-white leading-none">
            {naoLidas > 9 ? '9+' : naoLidas}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 w-96 max-h-[540px] bg-white rounded-2xl shadow-2xl border border-border z-50 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border flex-shrink-0">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">Notificações</span>
              {naoLidas > 0 && (
                <span className="bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{naoLidas}</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {naoLidas > 0 && (
                <button
                  onClick={marcarTodasLidas}
                  title="Marcar todas como lidas"
                  className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                </button>
              )}
              {notificacoes.length > 0 && (
                <button
                  onClick={limparTodas}
                  title="Limpar todas"
                  className="p-1.5 rounded hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded hover:bg-muted text-muted-foreground transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="overflow-y-auto flex-1">
            {notificacoes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Bell className="w-10 h-10 text-muted-foreground/20 mb-3" />
                <p className="text-sm text-muted-foreground">Nenhuma notificação</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Novos agendamentos aparecerão aqui</p>
              </div>
            ) : (
              notificacoes.map((n) => (
                <div
                  key={n.id}
                  className={`p-4 border-b border-border/50 last:border-0 transition-colors ${!n.lida ? 'bg-rose-50/50' : 'bg-white'}`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        {!n.lida && <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />}
                        <p className="text-sm font-semibold text-foreground truncate">{n.cliente_nome}</p>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{n.servico_nome}</p>
                      <p className="text-xs text-primary font-medium mt-0.5">
                        {n.dataLabel} às {n.horaLabel} · {n.profissional_nome}
                      </p>
                    </div>
                    <button
                      onClick={() => remover(n.agendamento_id)}
                      className="p-1 rounded hover:bg-muted text-muted-foreground/50 hover:text-muted-foreground flex-shrink-0 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <button
                      onClick={() => handleAction(n.agendamento_id, 'confirmado')}
                      disabled={!!actionLoading[n.agendamento_id]}
                      className="flex items-center gap-1 text-xs bg-green-100 text-green-700 hover:bg-green-200 px-2.5 py-1 rounded-full font-medium transition-colors disabled:opacity-50"
                    >
                      <CalendarCheck className="w-3 h-3" /> Confirmar
                    </button>
                    <button
                      onClick={() => handleAction(n.agendamento_id, 'cancelado')}
                      disabled={!!actionLoading[n.agendamento_id]}
                      className="flex items-center gap-1 text-xs bg-red-100 text-red-600 hover:bg-red-200 px-2.5 py-1 rounded-full font-medium transition-colors disabled:opacity-50"
                    >
                      <XCircle className="w-3 h-3" /> Cancelar
                    </button>
                    {n.cliente_telefone && (
                      <a
                        href={whatsappUrl(
                          n.cliente_telefone,
                          `Olá ${n.cliente_nome}! Seu agendamento de ${n.servico_nome} foi recebido para ${n.dataLabel} às ${n.horaLabel}. Confirmaremos em breve. — Glow Beauty`
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs bg-[#25D366]/10 text-[#128C7E] hover:bg-[#25D366]/20 px-2.5 py-1 rounded-full font-medium transition-colors"
                        onClick={() => marcarLida(n.agendamento_id)}
                      >
                        <MessageCircle className="w-3 h-3" /> WhatsApp
                      </a>
                    )}
                    <button
                      onClick={() => handleVer(n.agendamento_id)}
                      className="flex items-center gap-1 text-xs bg-muted text-muted-foreground hover:bg-muted/80 px-2.5 py-1 rounded-full font-medium transition-colors"
                    >
                      Ver detalhes
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
