# Pitch SATHON 2026: como vamos usar o modelo

Modelo original: `docs/apresentacao/SATHON-2026-Pitch-modelo.pdf` (6 slides, UniSenac Pelotas, ADS).
Formato final (slides ou PDF): a decidir pela Fabiana, depois que as respostas do formulário chegarem.

## Os 6 slides do modelo e o que entra em cada um

| # | Slide | O que o modelo pede | O que temos / falta |
|---|---|---|---|
| 1 | Capa | Nome do projeto, slogan, autores | Nome: Glow Beauty. FALTA: slogan e nomes dos autores |
| 2 | Problema e oportunidade | Dor principal, consequência e custo, público afetado | Base no artigo (seção 1): agenda por telefone/planilha, horário duplicado, dados sem controle. FALTA: confirmar com a Fabiana um número real (ex.: quantos conflitos por mês) |
| 3 | Arquitetura e complexidade técnica | Diagrama macro, desafio central, resiliência e segurança, stack | O modelo traz stack de exemplo (React Native, NestJS, Redis, RabbitMQ, IA/RAG). NÃO é a nossa. A real: React + Vite + TypeScript, Supabase (Postgres + RLS + Edge Functions + pg_cron), Telegram, Vercel. Desafio central real: isolamento por RLS, horário único no banco, fila de notificações com retentativa. Não citar IA/RAG nem RabbitMQ |
| 4 | Progresso e demonstração | Vídeo sem voz, validação técnica, versão (modelo: v0.8.0) | FALTA: gravar o vídeo (sem voz, público), subir e testar em aba anônima; definir a versão real |
| 5 | Metodologia de avaliação | Bloco 1: carga/estresse (k6) e validação experimental. Bloco 2: usabilidade com público real de Pelotas | Bloco 1 pronto (k6, 200 usuários, 5 simultâneos, isolamento). Bloco 2 depende do SUS. "Precisão/sensibilidade do algoritmo" do modelo não se aplica; trocar por taxa de conflito, latência e isolamento |
| 6 | Encerramento | Cronograma nov/dez, contato, QR do repositório | Marcos do modelo: nov = refinamento e carga; nov = artigo e resultados; dez = entrega e Demo Day. FALTA: QR do repositório/protótipo e contatos da equipe |

## Observações

- DECISÃO (28/10/2026): IA e RAG ENTRAM no escopo, para o projeto ficar semelhante ao pitch. Só vão para o slide depois de implementados e medidos. Se não ficarem prontos até o marco 2 de novembro, saem do slide.
- Proposta mínima de IA/RAG: assistente de atendimento que responde dúvidas do cliente (serviços, preços, duração, horários, cuidados) com base nos dados da própria clínica. Postgres com pgvector (já no Supabase), Edge Function que busca os trechos e chama o modelo, isolamento por `clinica_id` com RLS. Sem trocar a stack.
- DECIDIDO (28/10/2026): modelo = API gratuita do Gemini Flash (embeddings e geração no plano free). Só dados públicos da clínica; nenhum dado de cliente vai à IA. Limitação a citar no artigo: o plano free tem limite de requisições por minuto e por dia, e o Google pode usar entradas do plano free para melhorar produtos, por isso só dados públicos. Chave fica como secret da Edge Function, nunca no frontend.
- Isso encaixa na "validação experimental" do slide 5: taxa de acerto (perguntas com resposta esperada), precisão da recuperação, tempo de resposta, e respostas que vazam dado de outra clínica (esperado: 0).
- Mensageria assíncrona: já existe (fila `notificacoes_fila` + pg_cron + Edge Function). Pode ser apresentada com esse nome. NestJS, Redis, RabbitMQ e React Native não existem e não entram, salvo decisão em contrário.
- Os demais itens do modelo devem ser trocados por fatos que os testes comprovam.
- Números já medidos (fonte: `docs/testes/RESULTADOS.md`): 200 usuários no mesmo horário = 1 agendamento aceito, mediana 729 ms; 5 usuários simultâneos = 5 de 5, mediana 93 ms, p95 119 ms; 0 policies abertas; 0 vazamentos entre clínicas.
- Contatos que aparecem no modelo (agluz@senacrs.com.br, angelogl@gmail.com) são da coordenação. Confirmar se ficam no slide final.
- Próxima etapa: receber o formulário preenchido (`docs/FORMULARIO-PARA-PREENCHER.txt`), então montar o pitch.

## Respostas da Fabiana (28/10/2026)

- Artigo: NÃO é cobrado agora. Foco no projeto e no pitch. Prazo do artigo, se voltar: 3 de dezembro, sem mínimo de referências.
- Usabilidade: amiga dona de uma estética e uma funcionária aceitaram participar (2 pessoas reais). É amostra pequena: tratar como estudo qualitativo, sem média estatística. Ideal chegar a 5 se possível.
- Relatórios exportáveis: querem. Feito em 28/10/2026 (botões Excel e PDF em Agendamentos e Financeiro).
- Autor: apenas Fabiana. Slogan aprovado: "Agenda sem conflito, dados de cada clínica protegidos".
- Formato: slides, usando o modelo do professor.
- Vídeo: no máximo 3 minutos, sem voz.
- E-mail de contato: fabianapinheirolisboa@gmail.com
- Repositório: NÃO público. Slide 6 sem QR do repositório; usar o link do sistema publicado (Vercel) ou deixar o QR para depois.
- Versão do slide 4: é o rótulo do sistema (ex.: "v1.0.0 - Em Homologação"). Pendente definir.
- Problema (slide 2): ela disse que "inventa na hora". NÃO inventar número. Usar só o que for real (relato da clínica parceira) ou texto sem número.
- Melhorias do semestre passado (APRESENTACAO.md, slide 12): relatórios exportáveis (feito), lembrete ao cliente (hoje há aviso à clínica via Telegram), multi-unidade (feito), app nativo, pagamento online. Confirmar quais ainda entram.

## Slides prontos (28/10/2026)

Arquivo: `docs/apresentacao/Glow-Beauty-Pitch-SATHON.pptx` (6 slides, 16:9, com notas do apresentador). Gerado por `docs/apresentacao/gerar-pitch.py`.

Para usar no Canva: Criar um design > Importar arquivo > escolher o .pptx. Tudo fica editável.

Falta fazer no Canva ou no PowerPoint:
- Colocar os logos da SATHON e da UniSenac (marcados como [logo ...]).
- Inserir o vídeo no slide 4 (até 3 min, sem voz, público).
- Confirmar o nome completo da autora (está "Fabiana Pinheiro Lisboa", deduzido do e-mail).
- Confirmar a versão (v1.0.0 - Em homologação) e que o endereço do QR (https://glow-beauty-rs.vercel.app) ainda é o do sistema publicado.
- Slide 2: se a clínica parceira der um relato ou número real, acrescentar. Não inventar.
- Slide 5: atualizar com o resultado do SUS quando for aplicado (hoje diz "tarefas guiadas e questionário", sem resultado).
