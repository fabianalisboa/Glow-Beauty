import { useState, useRef, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { MessageCircle, X, Send, Loader2 } from 'lucide-react'

interface Mensagem {
  autor: 'cliente' | 'assistente'
  texto: string
  erro?: boolean
}

interface RespostaAssistente {
  resposta?: string
  erro?: string
}

const BOAS_VINDAS: Mensagem = {
  autor: 'assistente',
  texto: 'Olá! Posso ajudar com endereço, telefone, horário de atendimento e dúvidas sobre os procedimentos.',
}

export default function AssistenteChat({ slug }: { slug: string }) {
  const [aberto, setAberto] = useState(false)
  const [texto, setTexto] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [mensagens, setMensagens] = useState<Mensagem[]>([BOAS_VINDAS])
  const fim = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fim.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensagens, carregando])

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault()
    const pergunta = texto.trim()
    if (!pergunta || carregando) return
    setTexto('')
    setMensagens((m) => [...m, { autor: 'cliente', texto: pergunta }])
    setCarregando(true)
    const { data, error } = await supabase.functions.invoke<RespostaAssistente>('assistente', { body: { slug, pergunta } })
    setCarregando(false)
    if (error || !data?.resposta) {
      setMensagens((m) => [...m, {
        autor: 'assistente', erro: true,
        texto: data?.erro ?? 'Não consegui responder agora. Tente de novo em instantes ou fale com a clínica.',
      }])
      return
    }
    setMensagens((m) => [...m, { autor: 'assistente', texto: data.resposta as string }])
  }

  if (!aberto) {
    return (
      <button
        type="button" onClick={() => setAberto(true)} aria-label="Abrir assistente"
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2 h-12 px-4 rounded-full bg-primary text-primary-foreground shadow-lg hover:opacity-90 transition"
      >
        <MessageCircle className="w-5 h-5" /> <span className="text-sm font-medium">Dúvidas?</span>
      </button>
    )
  }

  return (
    <div className="fixed bottom-5 right-5 z-40 w-[calc(100vw-2.5rem)] max-w-sm h-[28rem] bg-white rounded-2xl shadow-2xl border border-border flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-primary text-primary-foreground">
        <span className="text-sm font-semibold">Assistente</span>
        <button type="button" onClick={() => setAberto(false)} aria-label="Fechar assistente"><X className="w-4 h-4" /></button>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2 text-sm">
        {mensagens.map((m, i) => (
          <div key={i} className={m.autor === 'cliente' ? 'flex justify-end' : 'flex justify-start'}>
            <p className={`max-w-[85%] px-3 py-2 rounded-xl ${
              m.autor === 'cliente' ? 'bg-primary text-primary-foreground' : m.erro ? 'bg-red-50 text-red-700' : 'bg-muted text-foreground'
            }`}>{m.texto}</p>
          </div>
        ))}
        {carregando && (
          <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /> Pensando...</div>
        )}
        <div ref={fim} />
      </div>
      <form onSubmit={enviar} className="flex gap-2 p-3 border-t border-border">
        <input
          value={texto} onChange={(e) => setTexto(e.target.value)} maxLength={300} placeholder="Escreva sua dúvida..."
          className="flex-1 h-9 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <button type="submit" disabled={carregando || !texto.trim()} aria-label="Enviar"
          className="h-9 w-9 flex items-center justify-center rounded-lg bg-primary text-primary-foreground disabled:opacity-50">
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  )
}
