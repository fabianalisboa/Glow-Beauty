"""Gera Glow-Beauty-Pitch-SATHON.pptx (8 slides, modelo do professor). Uso: python gerar-pitch.py"""
from pathlib import Path
import qrcode
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE, MSO_CONNECTOR
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR

AQUI = Path(__file__).parent
URL_SISTEMA = "https://glow-beauty-rs.vercel.app"

BG, CARD, LINHA = "0B1220", "111A2E", "26334F"
AZUL, ROSA, BRANCO, CINZA = "38BDF8", "FB7185", "FFFFFF", "94A3B8"

prs = Presentation()
prs.slide_width, prs.slide_height = Inches(13.333), Inches(7.5)


def rgb(h): return RGBColor.from_string(h)


def slide(notas):
    s = prs.slides.add_slide(prs.slide_layouts[6])
    s.background.fill.solid()
    s.background.fill.fore_color.rgb = rgb(BG)
    s.notes_slide.notes_text_frame.text = notas
    return s


def texto(s, x, y, w, h, partes, tam=14, cor=BRANCO, negrito=False, alinh=PP_ALIGN.LEFT, ancora=MSO_ANCHOR.TOP):
    """partes: str ou lista de (texto, cor, negrito) na mesma linha."""
    tb = s.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.vertical_anchor = ancora
    p = tf.paragraphs[0]
    p.alignment = alinh
    if isinstance(partes, str):
        partes = [(partes, cor, negrito)]
    for t, c, b in partes:
        r = p.add_run()
        r.text = t
        r.font.size, r.font.bold, r.font.name = Pt(tam), b, "Arial"
        r.font.color.rgb = rgb(c)
    return tb


def caixa(s, x, y, w, h, topo=None, forma=MSO_SHAPE.ROUNDED_RECTANGLE, fundo=CARD):
    c = s.shapes.add_shape(forma, Inches(x), Inches(y), Inches(w), Inches(h))
    c.fill.solid()
    c.fill.fore_color.rgb = rgb(fundo)
    c.line.color.rgb = rgb(LINHA)
    if forma == MSO_SHAPE.ROUNDED_RECTANGLE:
        c.adjustments[0] = 0.05
    c.shadow.inherit = False
    if topo:
        b = s.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(x + 0.1), Inches(y), Inches(w - 0.2), Inches(0.05))
        b.fill.solid()
        b.fill.fore_color.rgb = rgb(topo)
        b.line.fill.background()
    return c


def cabecalho(s, kicker, titulo, sub):
    texto(s, 0.7, 0.4, 9, 0.3, kicker.upper(), 12, AZUL, True)
    texto(s, 0.7, 0.7, 10, 0.8, titulo, 34, BRANCO, True)
    texto(s, 0.7, 1.45, 10, 0.4, sub, 15, CINZA)
    ln = s.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.7), Inches(2.0), Inches(11.9), Inches(0.015))
    ln.fill.solid(); ln.fill.fore_color.rgb = rgb(LINHA); ln.line.fill.background()
    # Espaço reservado para o logo SATHON (canto superior direito) e UniSenac (rodapé)
    texto(s, 11.3, 0.35, 1.7, 0.3, "[logo SATHON]", 10, CINZA, alinh=PP_ALIGN.RIGHT)
    texto(s, 11.3, 7.05, 1.7, 0.3, "[logo UniSenac]", 10, CINZA, alinh=PP_ALIGN.RIGHT)


def chip(s, x, y, w, rotulo):
    c = caixa(s, x, y, w, 0.42, forma=MSO_SHAPE.ROUNDED_RECTANGLE, fundo="1B2740")
    c.adjustments[0] = 0.5
    texto(s, x, y, w, 0.42, rotulo, 12, BRANCO, False, PP_ALIGN.CENTER, MSO_ANCHOR.MIDDLE)


# 1. Capa -------------------------------------------------------------------------------
s = slide("Abertura: apresente o Glow Beauty em uma frase. Sistema de agendamento para clínicas de estética, "
          "em que cada clínica só enxerga os próprios dados e dois clientes nunca ficam no mesmo horário.")
b = s.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.7), Inches(2.0), Inches(0.08), Inches(3.4))
b.fill.solid(); b.fill.fore_color.rgb = rgb(AZUL); b.line.fill.background()
texto(s, 1.1, 1.9, 10, 0.4, "Seminário de Andamento — Projeto de Desenvolvimento | SATHON 2026", 14, AZUL, True)
texto(s, 1.1, 2.4, 11, 1.2, "GLOW BEAUTY", 60, BRANCO, True)
texto(s, 1.1, 3.7, 10.5, 0.9, "“Agenda sem conflito, dados de cada clínica protegidos”", 22, CINZA)
texto(s, 0.7, 6.0, 5, 0.3, "Instituição", 11, CINZA, True)
texto(s, 0.7, 6.3, 6, 0.4, "UniSenac Pelotas — ADS", 16, BRANCO)
texto(s, 6.5, 6.0, 5, 0.3, "Autora", 11, CINZA, True)
texto(s, 6.5, 6.3, 6, 0.4, "Fabiana Pinheiro Lisboa", 16, BRANCO)
texto(s, 11.3, 0.35, 1.7, 0.3, "[logo SATHON]", 10, CINZA, alinh=PP_ALIGN.RIGHT)
texto(s, 11.3, 7.05, 1.7, 0.3, "[logo UniSenac]", 10, CINZA, alinh=PP_ALIGN.RIGHT)

# 2. Problema ---------------------------------------------------------------------------
s = slide("Fale do dia a dia da clínica: agenda por telefone, mensagem e caderno. Conte um caso real da clínica parceira "
          "(sem inventar número). O problema é de organização e de segurança dos dados dos clientes.")
cabecalho(s, "Problema & Oportunidade", "Por que esta solução é necessária?", "O impacto das ineficiências atuais nas clínicas de estética")
cards = [
    (ROSA, "Dor principal", [("Agenda manual e espalhada: ", ROSA, True), ("telefone, mensagem e caderno. Dois clientes podem ser marcados no mesmo horário, com o mesmo profissional.", CINZA, False)]),
    (ROSA, "Consequência & custo", [("Tempo perdido e cliente frustrado: ", ROSA, True), ("remarcações, falta de aviso à equipe e dados de contato sem controle de acesso.", CINZA, False)]),
    (AZUL, "Público afetado", [("Pequenas clínicas de Pelotas: ", AZUL, True), ("clínicas de estética de pequeno porte que ainda agendam à mão. Falta uma opção simples e segura para esse porte.", CINZA, False)]),
]
for i, (cor, tit, corpo) in enumerate(cards):
    x = 0.7 + i * 4.05
    caixa(s, x, 2.5, 3.8, 3.9, topo=cor)
    texto(s, x + 0.3, 3.0, 3.2, 0.5, tit, 20, BRANCO, True)
    texto(s, x + 0.3, 3.7, 3.2, 2.5, corpo, 15)

# 3. Arquitetura ------------------------------------------------------------------------
s = slide("Explique em três blocos: tela (React), banco (Supabase) e os três pontos de maior complexidade: "
          "IA com RAG, fila assíncrona de notificações e horário único imposto pelo banco. Segurança: RLS por clínica.")
cabecalho(s, "Arquitetura & Complexidade Técnica", "Engenharia além do CRUD tradicional", "Fluxo de dados e destaques de alta complexidade")
caixa(s, 0.7, 2.4, 6.4, 4.4)
texto(s, 1.0, 2.5, 5.8, 0.4, "DIAGRAMA CONCEITUAL — FLUXO MACRO", 12, AZUL, True)
for y, t, sub in [(3.0, "Frontend (PWA)", "React + Vite, instalável no celular"), (4.0, "Supabase", "Autenticação, PostgreSQL e RLS por clínica")]:
    caixa(s, 1.0, y, 5.8, 0.8, fundo="1B2740")
    texto(s, 1.0, y + 0.05, 5.8, 0.4, t, 15, BRANCO, True, PP_ALIGN.CENTER)
    texto(s, 1.0, y + 0.42, 5.8, 0.35, sub, 11, CINZA, False, PP_ALIGN.CENTER)
caixa(s, 1.0, 5.0, 5.8, 1.6, fundo="2A1424").line.color.rgb = rgb(ROSA)
texto(s, 1.0, 5.03, 5.8, 0.3, "ALTA COMPLEXIDADE", 11, ROSA, True, PP_ALIGN.CENTER)
for i, t in enumerate(["IA com RAG (pgvector)", "Fila assíncrona (pg_cron + Telegram)", "Horário único no banco"]):
    caixa(s, 1.3, 5.35 + i * 0.4, 5.2, 0.34, fundo=BG)
    texto(s, 1.3, 5.35 + i * 0.4, 5.2, 0.34, t, 12, BRANCO, True, PP_ALIGN.CENTER, MSO_ANCHOR.MIDDLE)
caixa(s, 7.4, 2.4, 5.2, 4.4)
texto(s, 7.7, 2.55, 4.6, 0.4, "Desafio central", 17, BRANCO, True)
texto(s, 7.7, 2.95, 4.6, 1.0, [("Isolamento entre clínicas, ", AZUL, True), ("horário único sob concorrência e um assistente de IA que só usa dados públicos.", CINZA, False)], 12)
texto(s, 7.7, 4.0, 4.6, 0.4, "Resiliência & segurança", 17, BRANCO, True)
texto(s, 7.7, 4.4, 4.6, 1.0, [("RLS por clinica_id, ", AZUL, True), ("fila com novas tentativas, limite de uso da IA e LGPD: nenhum dado de cliente vai à IA.", CINZA, False)], 12)
texto(s, 7.7, 5.5, 4.6, 0.3, "STACK TECNOLÓGICA", 11, AZUL, True)
for i, t in enumerate(["React", "TypeScript", "Supabase", "Postgres", "pgvector", "OpenAI", "Telegram", "Vercel"]):
    chip(s, 7.7 + (i % 4) * 1.17, 5.85 + (i // 4) * 0.5, 1.1, t)

# 3b. Modelagem e regras de negócio -----------------------------------------------------
s = slide("Mostre o modelo de dados em 20 segundos: tudo gira em torno do agendamento, que liga cliente, profissional e serviço. "
          "Depois leia as regras de negócio: o importante é que elas são garantidas pelo banco, não pela tela.")
cabecalho(s, "Arquitetura & Complexidade Técnica", "Modelagem & regras de negócio", "O modelo de dados e as regras que o próprio banco garante")
caixa(s, 0.7, 2.3, 7.2, 4.6)
texto(s, 0.95, 2.35, 6.7, 0.3, "MODELAGEM (SIMPLIFICADA)", 12, AZUL, True)


def entidade(x, y, w, h, nome, campos, cor=LINHA):
    c = caixa(s, x, y, w, h, fundo="1B2740")
    c.line.color.rgb = rgb(cor)
    texto(s, x, y + 0.04, w, 0.3, nome, 12, BRANCO, True, PP_ALIGN.CENTER)
    texto(s, x, y + 0.36, w, h - 0.38, campos, 9, CINZA, False, PP_ALIGN.CENTER)


def liga(x1, y1, x2, y2):
    ln = s.shapes.add_connector(MSO_CONNECTOR.STRAIGHT, Inches(x1), Inches(y1), Inches(x2), Inches(y2))
    ln.line.color.rgb = rgb(AZUL)
    ln.line.width = Pt(1.5)


entidade(0.95, 2.7, 6.7, 0.55, "clinicas", "clinica_id em todas as tabelas, isolado por RLS", AZUL)
for i, (n, c) in enumerate([("clientes", "nome, telefone, e-mail"), ("profissionais", "nome, especialidade"), ("servicos", "nome, valor, duração")]):
    entidade(0.95 + i * 2.35, 3.5, 2.0, 0.8, n, c)
    liga(1.95 + i * 2.35, 4.3, 1.95 + i * 2.35, 4.6)
entidade(0.95, 4.6, 6.7, 0.8, "agendamentos", "cliente + profissional + serviço, data, horário, status", ROSA)
for i, (n, c) in enumerate([("pagamentos", "valor, forma, status"), ("notificacoes_fila", "Telegram, tentativas, erro")]):
    liga(1.95 + i * 2.35, 5.4, 1.95 + i * 2.35, 5.7)
    entidade(0.95 + i * 2.35, 5.7, 2.0, 0.8, n, c)
entidade(5.65, 5.7, 2.0, 0.8, "base_conhecimento", "trechos públicos + vetores (IA)")

caixa(s, 8.2, 2.3, 4.4, 4.6)
texto(s, 8.45, 2.35, 3.9, 0.3, "REGRAS DE NEGÓCIO", 12, ROSA, True)
regras = [
    ("1. Isolamento: ", "cada clínica só enxerga os próprios dados (RLS)."),
    ("2. Horário único: ", "um profissional não tem dois agendamentos ativos no mesmo dia e hora. Cancelar libera o horário."),
    ("3. Ciclo do agendamento: ", "pendente, confirmado e concluído, ou cancelado."),
    ("4. Aviso automático: ", "todo agendamento novo vai para uma fila e chega no Telegram, com 3 tentativas."),
    ("5. Visitante sem login: ", "agenda só por função do banco, sem acesso direto às tabelas."),
]
for i, (t, d) in enumerate(regras):
    texto(s, 8.45, 2.75 + i * 0.82, 3.95, 0.8, [(t, AZUL, True), (d, CINZA, False)], 11)

# 4. Progresso --------------------------------------------------------------------------
s = slide("Durante o vídeo (até 3 minutos, sem voz), comente ao vivo: página pública de agendamento, assistente de IA, "
          "painel da clínica, relatórios em Excel e PDF e o aviso no Telegram.")
cabecalho(s, "Progresso & Demonstração do Produto", "Status atual & demonstração da solução", "Módulos desenvolvidos e em operação")
caixa(s, 0.7, 2.4, 7.6, 4.4, fundo="1B2740")
o = s.shapes.add_shape(MSO_SHAPE.OVAL, Inches(4.2), Inches(3.4), Inches(0.9), Inches(0.9))
o.fill.solid(); o.fill.fore_color.rgb = rgb(AZUL); o.line.fill.background()
texto(s, 0.7, 4.5, 7.6, 0.5, "Vídeo de demonstração do sistema", 20, BRANCO, True, PP_ALIGN.CENTER)
texto(s, 0.7, 5.05, 7.6, 0.8, "[Inserir o vídeo aqui: até 3 min, sem voz, público]\nAgendamento público · assistente · painel · relatórios · Telegram", 12, CINZA, False, PP_ALIGN.CENTER)
caixa(s, 8.6, 2.4, 4.0, 4.4)
texto(s, 8.9, 2.55, 3.5, 0.3, "VALIDAÇÃO TÉCNICA", 12, AZUL, True)
texto(s, 8.9, 3.0, 3.5, 1.5, [("Em produção\n", BRANCO, True), ("Multi-clínica com RLS, agendamento público, painel, financeiro e relatórios em Excel e PDF.", CINZA, False)], 12)
texto(s, 8.9, 4.5, 3.5, 1.2, [("Funcional\n", BRANCO, True), ("Assistente de IA com RAG e fila de notificações no Telegram.", CINZA, False)], 12)
texto(s, 8.9, 5.6, 3.5, 0.3, "RELEASE ATIVA", 12, AZUL, True)
c = caixa(s, 8.9, 5.95, 3.4, 0.55, fundo="1B2740"); c.adjustments[0] = 0.5
texto(s, 8.9, 5.95, 3.4, 0.55, "v1.0.0 — Em homologação", 14, AZUL, True, PP_ALIGN.CENTER, MSO_ANCHOR.MIDDLE)

# 4b. Aviso no Telegram -----------------------------------------------------------------
s = slide("Mostre o celular: assim que a cliente confirma, a clínica recebe o aviso. Explique que a gravação do agendamento "
          "não espera o envio: o aviso vai para uma fila e, se falhar, o sistema tenta de novo 3 vezes.")
cabecalho(s, "Progresso & Demonstração do Produto", "Aviso automático no Telegram", "Da confirmação da cliente ao celular da clínica, sem travar a tela")
caixa(s, 0.7, 2.4, 5.6, 4.4)
passos = [
    ("1", "A cliente confirma o agendamento", "A tela grava e responde na hora."),
    ("2", "O banco coloca o aviso numa fila", "Um gatilho cria a mensagem, sem bloquear a gravação."),
    ("3", "Uma função envia ao Telegram", "O agendador roda a cada minuto."),
    ("4", "Se falhar, tenta de novo", "3 tentativas, com espera crescente, e o erro fica registrado."),
]
for i, (n, t, d) in enumerate(passos):
    y = 2.65 + i * 1.0
    o = s.shapes.add_shape(MSO_SHAPE.OVAL, Inches(1.0), Inches(y), Inches(0.5), Inches(0.5))
    o.fill.solid(); o.fill.fore_color.rgb = rgb(AZUL); o.line.fill.background()
    texto(s, 1.0, y, 0.5, 0.5, n, 14, BG, True, PP_ALIGN.CENTER, MSO_ANCHOR.MIDDLE)
    texto(s, 1.7, y - 0.05, 4.4, 0.35, t, 14, BRANCO, True)
    texto(s, 1.7, y + 0.3, 4.4, 0.5, d, 11, CINZA)
s.shapes.add_picture(str(AQUI / "img" / "telegram-notificacao.png"), Inches(6.7), Inches(2.4), Inches(5.9))
s.shapes.add_picture(str(AQUI / "img" / "telegram-mensagem.png"), Inches(7.4), Inches(4.35), Inches(4.5))
texto(s, 6.7, 6.6, 5.9, 0.3, "Aviso recebido no celular da clínica (Telegram)", 10, CINZA, False, PP_ALIGN.CENTER)

# 5. Metodologia ------------------------------------------------------------------------
s = slide("Bloco 1 são medições do sistema, já feitas. Bloco 2 é a usabilidade com profissionais reais de estética de Pelotas, "
          "em andamento. Destaque: 200 pessoas no mesmo horário, só 1 agendamento aceito. Assistente: 16 de 16 respostas corretas.")
cabecalho(s, "Metodologia de Avaliação", "Validação quantitativa e qualitativa", "Avaliação técnica do software e validação com usuárias reais")
caixa(s, 0.7, 2.4, 6.1, 4.4, topo=AZUL)
texto(s, 1.0, 2.6, 5.5, 0.3, "BLOCO 1 — AVALIAÇÃO TÉCNICA", 12, AZUL, True)
texto(s, 1.0, 2.95, 5.5, 0.4, "Testes de carga e concorrência (k6)", 17, BRANCO, True)
texto(s, 1.0, 3.4, 5.5, 1.4, [
    ("200 usuários no mesmo horário: ", AZUL, True), ("1 agendamento aceito, mediana de 729 ms.\n", CINZA, False),
    ("5 usuários simultâneos: ", AZUL, True), ("5 de 5 concluídos, p95 de 119 ms.\n", CINZA, False),
    ("Isolamento entre clínicas: ", AZUL, True), ("0 vazamentos, 0 políticas abertas.", CINZA, False)], 12)
texto(s, 1.0, 4.95, 5.5, 0.4, "Validação experimental do assistente", 17, BRANCO, True)
texto(s, 1.0, 5.4, 5.5, 1.3, [
    ("16 de 16 respostas corretas ", AZUL, True), ("em perguntas com resposta esperada e fora do escopo.\n", CINZA, False),
    ("Tempo de resposta: ", AZUL, True), ("mediana de 1,8 s.", CINZA, False)], 12)
caixa(s, 7.1, 2.4, 5.5, 4.4, topo=ROSA)
texto(s, 7.4, 2.6, 4.9, 0.3, "BLOCO 2 — VALIDAÇÃO & EXTENSÃO", 12, ROSA, True)
texto(s, 7.4, 2.95, 4.9, 0.4, "Teste de usabilidade (SUS)", 17, BRANCO, True)
texto(s, 7.4, 3.4, 4.9, 1.3, "Tarefas guiadas e questionário SUS com profissionais reais de estética de Pelotas (recepção e atendimento). Participação voluntária, anônima e com termo de consentimento.", 12, CINZA)
caixa(s, 7.4, 4.9, 4.9, 1.6, fundo="1B2740")
texto(s, 7.7, 5.0, 4.4, 0.3, "METODOLOGIA APLICADA", 12, AZUL, True)
texto(s, 7.7, 5.35, 4.4, 1.1, "Abordagem mista: medições quantitativas do sistema e avaliação qualitativa da experiência de uso.", 12, CINZA)

# 6. Encerramento -----------------------------------------------------------------------
s = slide("Feche com o cronograma: novembro para refinar e fazer a usabilidade, dezembro para entrega e Demo Day. "
          "Agradeça e deixe o contato e o QR do sistema publicado.")
cabecalho(s, "Encerramento & Banca Examinadora", "Reta final & próximos passos", "Planejamento até a entrega final e o Demo Day")
marcos = [
    (AZUL, "NOVEMBRO • MARCO 1", "Refinamento & carga", "Refinamento dos módulos críticos e consolidação dos testes de carga e do assistente."),
    (AZUL, "NOVEMBRO • MARCO 2", "Usabilidade & resultados", "Aplicação do teste de usabilidade (SUS) com profissionais de estética e análise dos resultados."),
    (ROSA, "DEZEMBRO • MARCO 3", "Entrega & Demo Day", "Entrega final do código e preparação completa para o Demo Day."),
]
for i, (cor, k, t, d) in enumerate(marcos):
    x = 0.7 + i * 4.05
    caixa(s, x, 2.3, 3.8, 1.9, topo=cor)
    texto(s, x + 0.25, 2.45, 3.4, 0.3, k, 11, cor, True)
    texto(s, x + 0.25, 2.8, 3.4, 0.4, t, 16, BRANCO, True)
    texto(s, x + 0.25, 3.25, 3.4, 0.9, d, 11, CINZA)
caixa(s, 0.7, 4.5, 11.9, 2.3, topo=AZUL)
texto(s, 1.1, 4.8, 7, 0.6, "Muito obrigada!", 28, BRANCO, True)
texto(s, 1.1, 5.4, 7, 0.7, "Estamos à disposição da banca examinadora para considerações, apontamentos e dúvidas.", 13, CINZA)
texto(s, 1.1, 6.15, 7, 0.3, "CONTATO", 11, AZUL, True)
texto(s, 1.1, 6.4, 7, 0.3, "fabianapinheirolisboa@gmail.com", 14, BRANCO)
qr = qrcode.make(URL_SISTEMA)
qr_arq = AQUI / "qr-sistema.png"
qr.save(qr_arq)
s.shapes.add_picture(str(qr_arq), Inches(9.6), Inches(4.75), Inches(1.9), Inches(1.9))
texto(s, 11.55, 5.1, 1.0, 1.2, "ACESSE O SISTEMA", 10, AZUL, True)

prs.core_properties.author = "Fabiana"
prs.core_properties.last_modified_by = "Fabiana"
prs.save(AQUI / "Glow-Beauty-Pitch-SATHON.pptx")
print("ok")
