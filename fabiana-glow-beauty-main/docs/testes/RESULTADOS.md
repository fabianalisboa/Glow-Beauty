# Resultados dos testes: Glow Beauty

Data de execução: 27/10/2026. Ambiente: Supabase `glow-beauty` (sa-east-1), Postgres 17.

Nenhum dado de teste foi apagado. Os registros ficam no banco para demonstração.

## 1. Isolamento entre clínicas

Multi-tenant por `clinica_id`. Migração em `supabase/sql/migracao_multitenant.sql`.

| Verificação | Resultado |
|---|---|
| Tabelas com `clinica_id` | 9 (8 do sistema + `usuarios_clinica`) |
| Policies com `true` (acesso irrestrito) | 0 (antes: todas) |
| Policies `isolamento_clinica` | 8 |
| Agendamentos sem clínica | 0 |
| Grants do `anon` nas tabelas | 0 |

Teste com usuário real da Glow Beauty (papel `authenticated`), em `testes/teste_isolamento.sql`:

| Verificação | Resultado | Esperado |
|---|---|---|
| Clientes da Glow Beauty visíveis | 34 | > 0 (controle) |
| Clientes de outra clínica visíveis | 0 | 0 |
| Clínica de outra clínica visível | 0 | 0 |
| Inserir cliente em outra clínica | Bloqueado pelo RLS | Bloqueado |
| Alterar clientes de outra clínica | 0 linhas | 0 |

Anônimo via API (script k6, `setup`): não lê a tabela `clientes`. **Passou.**

## 2. Agendamentos sem horário duplicado

Restrição: índice único parcial em `(profissional_id, data_agendamento, horario)` para status diferente de `cancelado`.

**Limpeza antes da restrição:** 4 grupos duplicados (8 agendamentos). Em cada grupo, o mais antigo foi mantido e os demais foram marcados como `cancelado`, com nota em `observacoes`. Nada foi apagado. Depois da limpeza: 0 grupos duplicados.

**Teste de regra no banco:** primeiro agendamento aceito; segundo no mesmo profissional, data e horário recusado com `horario_ocupado`. Teste em transação desfeita.

**Teste de concorrência (k6, `k6/agendamento-concorrencia.js`):** todos os usuários tentam o mesmo horário ao mesmo tempo.

| Medida | 50 usuários (01/03/2099) | 200 usuários (02/03/2099) |
|---|---|---|
| Tentativas | 50 | 200 |
| Agendamentos aceitos | 1 | 1 |
| Conflitos (`horario_ocupado`) | 49 | 199 |
| Erros inesperados | 0 | 0 |
| Tempo de resposta, mediana | 244 ms | 729 ms |
| Tempo de resposta, p95 | 333 ms | 839 ms |

No banco, cada horário de teste tem exatamente 1 agendamento. **Passou.**

Nota sobre o k6: o painel marca `http_req_failed` em 96% e 99%. Isso acontece porque os conflitos chegam como HTTP 400. Para a análise, use `conflitos_horario` e `erros_inesperados`.

**Teste pelo navegador:** a mensagem "Este horário já está ocupado" apareceu na página. Depois, um horário livre foi confirmado com sucesso e gravado com `clinica_id` da Glow Beauty.

## 3. Notificações pelo Telegram

Fila `notificacoes_fila` com trigger em novos agendamentos. Envio por Edge Function (`supabase/functions/enviar-notificacoes`) chamada por `pg_cron` a cada minuto.

| Cenário | Resultado |
|---|---|
| Agendamento novo entra na fila | Sim (trigger) |
| Envio com chat correto | `enviada`, recebido no Telegram |
| Chat inválido (403 do Telegram) | 3 tentativas com espera crescente, depois `falha` com o erro gravado |
| Clínica sem chat configurado | Entra como `falha`, com o motivo registrado |

O envio não bloqueia a tela: o formulário grava o agendamento e a mensagem é processada depois pelo cron.

## 4. Validação de telefone

Erro encontrado: telefone com mais de 20 caracteres gerava erro `22001` no banco. Correção: máscara `(53) 99999-9999`, limite de 15 caracteres e validação no formulário. Verificado no navegador.

## 5. Simulado com 5 pessoas usando ao mesmo tempo

Script: `k6/simulado-5-usuarios.js`. Data da rodada: 03/03/2099.

**Como foi feito:** cinco usuários virtuais, cada um com cliente próprio, executam o agendamento público ao mesmo tempo. Cada pessoa começa em um horário diferente, como em um dia normal da agenda. Quando encontra um horário ocupado, escolhe o próximo, com uma pausa de meio segundo para simular a leitura da mensagem.

| Medida | Resultado | Esperado |
|---|---|---|
| Pessoas que concluíram o agendamento | 5 de 5 | 5 |
| Conflitos de horário encontrados | 0 | Qualquer valor, desde que a pessoa escolha outro horário |
| Erros inesperados | 0 | 0 |
| Tempo de resposta da função, mediana | 93 ms | Abaixo de 2 s |
| Tempo de resposta da função, p95 | 119 ms | Abaixo de 2 s |
| Tempo total por pessoa, p95 | 572 ms | Referência |

Resultado: **passou**. Os 5 agendamentos foram gravados, cada um com cliente próprio, na clínica Glow Beauty. As 5 notificações foram enviadas ao chat configurado da clínica (`enviada`, verificado no banco).

## Pendências

- **Item 4:** rodada com mais de 200 usuários, se for necessária para o artigo.
- **Item 5, SUS:** roteiro pronto em `docs/testes/ROTEIRO-SUS.md`, com a metodologia. Falta a aplicação com 5 a 10 pessoas, com termo de consentimento.
- **Item 6, relatórios PDF e Excel:** não iniciado. É o primeiro item a cortar, se faltar tempo.
- **Item 7, artigo:** não iniciado. Este documento e o roteiro do SUS servem de base para as tabelas e a metodologia.

## Arquivos de apoio

- `supabase/sql/`: migrações e ajustes aplicados, na ordem de execução.
- `testes/teste_isolamento.sql`: teste de isolamento.
- `k6/agendamento-concorrencia.js`: teste de concorrência.
- `supabase/functions/enviar-notificacoes/index.ts`: envio das notificações.

## 6. Assistente de atendimento (IA com RAG)

Data da rodada: 28/10/2026. Página pública de agendamento, só dados públicos da clínica (serviços, endereço, telefone, horário, sobre). Nenhum dado de cliente é enviado à IA.

Arquitetura: Edge Function `assistente` gera o vetor da pergunta (`text-embedding-3-small`), busca os 4 trechos mais próximos da clínica no `pgvector` (função `buscar_conhecimento`, restrita por `clinica_id`) e pede a resposta ao `gpt-4o-mini` com instrução de usar só o contexto. Limite de 100 perguntas por hora por clínica. Cada pergunta fica registrada em `assistente_log`.

Script: `testes/assistente-avaliacao.mjs`, 16 perguntas (12 com resposta esperada no cadastro, 4 fora do escopo ou tentativa de burlar as regras).

| Medida | Resultado |
|---|---|
| Respostas corretas | 16 de 16 (100%) |
| Perguntas fora do escopo recusadas | 4 de 4 |
| Tempo de resposta, mediana | 1885 ms |
| Tempo de resposta, máximo | 2930 ms |

Limitações: conjunto pequeno, escrito pelos próprios desenvolvedores, avaliação por palavras esperadas (não por leitura humana). A base da Glow Beauty tem serviços repetidos com preços diferentes (ex.: Peeling Químico R$ 200 e R$ 220), o que pode gerar resposta ambígua; recomenda-se limpar o cadastro.
