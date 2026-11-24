// Indexa a base da clínica e faz perguntas ao assistente. Uso: node testes/assistente-teste.mjs "pergunta"
// As chaves são lidas pelo CLI e nunca impressas.
import { execFileSync } from 'node:child_process'

const REF = 'vasoeaadevgwfnmdzqmp'
const SLUG = 'glow-beauty'
const saida = execFileSync('node', ['C:/Users/ACER/.claude/supabase/sb.js', 'projects', 'api-keys', '--project-ref', REF, '-o', 'json'], { encoding: 'utf8' })
const chaves = JSON.parse(saida.slice(saida.indexOf('[')))
const anon = chaves.find((k) => k.name === 'anon')?.api_key
const service = chaves.find((k) => k.name === 'service_role')?.api_key
if (!anon || !service) throw new Error('Chaves não encontradas')

const chamar = async (corpo, token) => {
  const r = await fetch(`https://${REF}.supabase.co/functions/v1/assistente`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, apikey: anon },
    body: JSON.stringify({ slug: SLUG, ...corpo }),
  })
  return { status: r.status, corpo: await r.json() }
}

if (process.argv[2] === '--indexar') {
  console.log(await chamar({ acao: 'indexar' }, service))
} else {
  for (const p of process.argv.slice(2)) console.log(p, '=>', JSON.stringify(await chamar({ pergunta: p }, anon)))
}
