import { createClient } from 'npm:@supabase/supabase-js@2.49.4'

type Pendente = {
  id: string
  destinatario: string
  mensagem: string
  tentativas: number
  max_tentativas: number
}

const LOTE = 20

Deno.serve(async (req) => {
  if (req.headers.get('x-cron-secret') !== Deno.env.get('CRON_SECRET')) {
    return new Response('não autorizado', { status: 401 })
  }

  const token = Deno.env.get('TELEGRAM_BOT_TOKEN')
  if (!token) {
    return new Response('TELEGRAM_BOT_TOKEN não configurado', { status: 500 })
  }

  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

  const { data, error } = await supabase
    .from('notificacoes_fila')
    .select('id, destinatario, mensagem, tentativas, max_tentativas')
    .eq('status', 'pendente')
    .lte('proxima_tentativa_em', new Date().toISOString())
    .order('created_at')
    .limit(LOTE)
  if (error) throw error

  let enviadas = 0
  let falhas = 0

  for (const item of (data ?? []) as Pendente[]) {
    let erro: string | null = null
    try {
      const resposta = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: item.destinatario, text: item.mensagem }),
      })
      if (!resposta.ok) erro = `Telegram ${resposta.status}: ${await resposta.text()}`
    } catch (e) {
      erro = e instanceof Error ? e.message : String(e)
    }

    if (erro === null) {
      const { error: upErr } = await supabase
        .from('notificacoes_fila')
        .update({ status: 'enviada', enviada_em: new Date().toISOString(), ultimo_erro: null, tentativas: item.tentativas + 1 })
        .eq('id', item.id)
      if (upErr) throw upErr
      enviadas++
      continue
    }

    console.error(`Falha ao enviar notificação ${item.id}: ${erro}`)
    const tentativas = item.tentativas + 1
    // Espera crescente: 1, 2, 3... minutos entre as tentativas
    const { error: upErr } = await supabase
      .from('notificacoes_fila')
      .update({
        tentativas,
        status: tentativas >= item.max_tentativas ? 'falha' : 'pendente',
        ultimo_erro: erro,
        proxima_tentativa_em: new Date(Date.now() + tentativas * 60_000).toISOString(),
      })
      .eq('id', item.id)
    if (upErr) throw upErr
    falhas++
  }

  return Response.json({ processadas: enviadas + falhas, enviadas, falhas })
})

// ponytail: sem lock; duas execuções simultâneas do cron podem enviar o mesmo item.
// Upgrade: marcar como 'processando' antes do envio, se o cron começar a se sobrepor.
