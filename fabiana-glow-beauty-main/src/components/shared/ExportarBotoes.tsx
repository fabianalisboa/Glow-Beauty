import { useState } from 'react'
import { FileSpreadsheet, FileText } from 'lucide-react'

interface Props {
  titulo: string
  colunas: string[]
  linhas: string[][]
}

const escaparHtml = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

export default function ExportarBotoes({ titulo, colunas, linhas }: Props) {
  const [erro, setErro] = useState<string | null>(null)
  const vazio = linhas.length === 0
  const arquivo = `${titulo.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().slice(0, 10)}`

  // Excel: CSV com ';' e BOM UTF-8, que o Excel em português abre direto com acentos e colunas certas
  const exportarExcel = () => {
    const celula = (v: string) => `"${v.replace(/"/g, '""')}"`
    const csv = [colunas, ...linhas].map((l) => l.map(celula).join(';')).join('\r\n')
    const url = URL.createObjectURL(new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `${arquivo}.csv`
    a.click()
    URL.revokeObjectURL(url)
    setErro(null)
  }

  // PDF: abre uma página só com a tabela e chama a impressão; o usuário escolhe "Salvar como PDF"
  const exportarPdf = () => {
    const w = window.open('', '_blank')
    if (!w) {
      setErro('O navegador bloqueou a janela do PDF. Permita pop-ups para este site e tente de novo.')
      return
    }
    const cab = colunas.map((c) => `<th>${escaparHtml(c)}</th>`).join('')
    const corpo = linhas.map((l) => `<tr>${l.map((c) => `<td>${escaparHtml(c)}</td>`).join('')}</tr>`).join('')
    w.document.write(`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>${escaparHtml(arquivo)}</title>
<style>body{font-family:Arial,sans-serif;padding:24px}h1{font-size:18px}p{color:#666;font-size:12px}
table{border-collapse:collapse;width:100%;font-size:12px}th,td{border:1px solid #ccc;padding:6px;text-align:left}th{background:#f5e9ed}</style></head>
<body><h1>Glow Beauty - ${escaparHtml(titulo)}</h1><p>Gerado em ${new Date().toLocaleString('pt-BR')} - ${linhas.length} registro(s)</p>
<table><thead><tr>${cab}</tr></thead><tbody>${corpo}</tbody></table></body></html>`)
    w.document.close()
    w.focus()
    w.print()
    setErro(null)
  }

  const classe = 'inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-input bg-background text-sm hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed'

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex gap-2">
        <button type="button" onClick={exportarExcel} disabled={vazio} className={classe} title={vazio ? 'Nada para exportar' : 'Baixar planilha (Excel)'}>
          <FileSpreadsheet className="w-4 h-4" /> Excel
        </button>
        <button type="button" onClick={exportarPdf} disabled={vazio} className={classe} title={vazio ? 'Nada para exportar' : 'Gerar PDF'}>
          <FileText className="w-4 h-4" /> PDF
        </button>
      </div>
      {erro && <p className="text-xs text-red-600">{erro}</p>}
    </div>
  )
}
