# Sistema de agendamento multi-clínica para estética: isolamento de dados, controle de conflitos e notificações assíncronas

> Rascunho. Seções marcadas com [A PREENCHER] dependem da aplicação do SUS com participantes.

## Resumo

Clínicas de estética dependem de agendamentos feitos por telefone e planilhas, o que gera horários duplicados e falta de controle sobre os dados dos clientes. Este trabalho apresenta o sistema Glow Beauty, uma aplicação web multi-clínica construída com Supabase (PostgreSQL), React e Telegram. A contribuição central está no banco de dados: isolamento entre clínicas por políticas de segurança em nível de linha (RLS), restrição de horário único imposta pelo próprio banco e uma fila de notificações com novas tentativas. Os testes mostram que, com 200 usuários disputando o mesmo horário, apenas um agendamento foi aceito e nenhum dado vazou entre clínicas. O tempo de resposta mediano foi de 729 ms nesse cenário. [A PREENCHER: resultado da avaliação de usabilidade, SUS.]

**Palavras-chave:** agendamento; multi-tenant; RLS; PostgreSQL; fila de mensagens; usabilidade.

## 1. Introdução

O agendamento de clínicas de estética costuma ser feito por telefone, mensagem e caderno. Esse modelo gera três problemas recorrentes: dois clientes podem ser marcados no mesmo horário com o mesmo profissional; as informações de contato dos clientes ficam sem controle de acesso; e o lembrete ao time depende de alguém lembrar de avisar.

Um sistema de agendamento resolve parte desses problemas, mas, quando atende mais de uma clínica no mesmo banco de dados, surge um risco adicional: um usuário de uma clínica pode acessar dados de outra. Além disso, a regra "não marcar dois clientes no mesmo horário" é frequentemente implementada apenas na interface, o que falha quando duas pessoas tentam agendar ao mesmo tempo.

Este trabalho apresenta o Glow Beauty, um sistema de agendamento multi-clínica que trata esses três pontos no banco de dados. As contribuições são: (i) isolamento entre clínicas com RLS, validado por teste; (ii) restrição de horário único imposta pelo banco, validada sob concorrência; (iii) fila de notificações com novas tentativas, para não bloquear a tela do usuário.

## 2. Trabalhos relacionados

[A PREENCHER: revisão de sistemas de agendamento para serviços de beleza e saúde, e de trabalhos sobre isolamento multi-tenant em bancos relacionais. Referências a levantar antes da submissão.]

## 3. Metodologia

### 3.1 Contexto e requisitos

O sistema atende a clínica Glow Beauty e foi desenvolvido com base em um escopo de 7 itens: isolamento entre clínicas, agendamento sem horários duplicados, notificações, testes de desempenho e segurança, avaliação de usabilidade, relatórios e documentação.

### 3.2 Arquitetura

A aplicação é um front-end em React e Vite, hospedado na Vercel, com banco PostgreSQL e autenticação no Supabase. Três decisões de arquitetura concentram o trabalho:

1. **Isolamento por `clinica_id`.** Cada tabela de dados recebe o identificador da clínica. Um vínculo entre o usuário autenticado e a clínica (`usuarios_clinica`) alimenta uma função auxiliar, `minha_clinica()`, usada por uma única política de RLS por tabela.
2. **Horário único no banco.** Um índice único parcial sobre `(profissional_id, data_agendamento, horario)`, aplicado a agendamentos com status diferente de cancelado, impede duplicidade mesmo sob concorrência. A validação na interface é apenas um aviso ao usuário.
3. **Agendamento público por função.** O visitante, sem login, não grava diretamente nas tabelas. Ele chama uma função do banco que localiza a clínica pelo identificador público, valida serviço e profissional, reutiliza ou cria o cliente e grava o agendamento.

### 3.3 Fila de notificações

Cada agendamento novo dispara um gatilho que grava uma mensagem na tabela `notificacoes_fila`, com status `pendente`. Um job do `pg_cron` chama, a cada minuto, uma Edge Function que envia as mensagens pela API do Telegram. Em caso de falha, a função aguarda 1, 2 e 3 minutos entre as tentativas e marca o item como `falha` após três tentativas, registrando o erro retornado. O envio não bloqueia a gravação do agendamento.

### 3.4 Ambiente de teste

Os testes foram executados no projeto Supabase em produção (região sa-east-1, PostgreSQL 17), com a versão atual do front-end. Os dados de teste foram mantidos no banco para rastreabilidade. As ferramentas foram o k6 (testes de carga), SQL direto para os testes de banco e o navegador para os testes de interface.

### 3.5 Procedimentos

- **Isolamento:** um usuário autenticado da clínica Glow Beauty foi simulado com o papel `authenticated`. Foram comparadas as linhas visíveis de duas clínicas e tentadas inserções e alterações na clínica alheia.
- **Concorrência:** script k6 com N usuários virtuais tentando gravar o mesmo profissional, data e horário no mesmo instante. Foram registrados agendamentos aceitos, conflitos (`horario_ocupado`), erros inesperados e tempo de resposta.
- **Simulado de uso simultâneo:** cinco usuários virtuais, cada um com cliente próprio, agendando em horários diferentes e, ao encontrar um horário ocupado, escolhendo outro.
- **Usabilidade:** questionário SUS aplicado a [A PREENCHER: quantidade] participantes, com perfis de recepção e profissionais da beleza, após tarefas guiadas. Procedimento detalhado em `docs/testes/ROTEIRO-SUS.md`.

## 4. Resultados

### 4.1 Isolamento entre clínicas

Antes da migração, havia 24 políticas de acesso nas tabelas de dados. Vinte e duas usavam condição verdadeira para todos os casos, ou seja, não restringiam nada. As outras duas filtravam apenas profissionais e serviços ativos. A tabela de clientes era legível pelo papel anônimo, isto é, por qualquer visitante com a chave pública da aplicação. Após a migração, nenhuma política usa condição verdadeira para todos os casos, e o papel anônimo perdeu os privilégios de tabela.

| Verificação | Resultado |
|---|---|
| Clientes da própria clínica visíveis ao usuário | 34 |
| Clientes de outra clínica visíveis | 0 |
| Inserção em outra clínica | bloqueada pela RLS |
| Alteração de registros de outra clínica | 0 linhas afetadas |
| Leitura de clientes pelo papel anônimo, via API | negada |

### 4.2 Horário único sob concorrência

Antes da restrição, havia 4 grupos com 8 agendamentos duplicados. O mais antigo de cada grupo foi mantido e os demais marcados como cancelados, sem exclusão.

| Usuários simultâneos | Aceitos | Conflitos | Erros inesperados | Mediana | p95 |
|---|---|---|---|---|---|
| 50 | 1 | 49 | 0 | 244 ms | 333 ms |
| 200 | 1 | 199 | 0 | 729 ms | 839 ms |

Em ambos os casos, o banco gravou exatamente um agendamento para o horário disputado. A mediana cresce cerca de três vezes quando a carga aumenta quatro vezes, o que indica que a limitação está na capacidade de atendimento simultâneo e não no custo da regra.

### 4.3 Simulado de cinco usuários

Os cinco usuários concluíram o agendamento, cada um com cliente próprio. Não houve erros inesperados. A mediana da função foi de 93 ms e o p95 de 119 ms. As cinco notificações correspondentes foram enviadas.

### 4.4 Notificações

Os agendamentos de teste geraram notificações enviadas com sucesso ao chat configurado da clínica. Um teste com chat inválido confirmou o comportamento de nova tentativa: três tentativas com espera crescente, seguidas de status `falha` com o motivo do erro gravado.

### 4.5 Usabilidade

[A PREENCHER: pontuação SUS média, desvio padrão e mediana; pontuação por item; taxa de conclusão das tarefas T1 a T5 e tempo médio.]

## 5. Discussão

**Isolamento.** A RLS resolve o isolamento sem depender do código da aplicação: mesmo uma consulta mal escrita no front-end não retorna dados de outra clínica. Ao mesmo tempo, a política depende de uma função auxiliar, e um erro nela afetaria todas as tabelas. Por isso, o teste de isolamento precisa ser repetido a cada mudança de política.

**Concorrência.** Validar a regra de horário no banco e não na interface foi a decisão que sustentou o resultado dos testes: com 200 usuários, nenhuma regra de aplicação teria evitado a disputa. O custo é que a mensagem de conflito chega ao usuário depois da tentativa, e não antes.

**Latência.** A função de agendamento respondeu em menos de 1 segundo até 200 usuários simultâneos. O aumento da latência com a carga sugere que, para clínicas com muitos agendamentos no mesmo minuto, seria necessário aumentar a capacidade do banco ou limitar a taxa de requisições.

**Notificações.** O desacoplamento por fila permite que a tela responda sem esperar o envio. Em contrapartida, o envio pode atrasar até um minuto, o intervalo do cron, e não há confirmação de leitura pelo Telegram.

## 6. Limitações

- **Escala:** os testes de concorrência usaram até 200 usuários em uma única rodada. Não foram medidos comportamentos de longa duração nem de picos sustentados.
- **Dados:** os testes foram executados no banco de produção da clínica, com dados de teste mantidos por decisão de rastreabilidade. Isso não afeta os resultados, mas deve ser limpo antes do uso real.
- **Canal de notificação:** o escopo original previa WhatsApp. O projeto adotou o Telegram. A decisão está registrada, mas o canal não é o que a clínica usa com os clientes.
- **Proteção do agendamento público:** a função pública não tem limite de requisições por visitante nem verificação anti-robô. Um visitante pode gerar muitas requisições, o que não foi testado.
- **Possível duplicidade de notificação:** duas execuções do cron simultâneas podem enviar o mesmo item duas vezes. Não ocorreu nos testes, mas não há trava de concorrência na função de envio.
- **Usabilidade:** a avaliação com [A PREENCHER: quantidade] participantes permite uma leitura exploratória, não estatisticamente robusta.
- **Relatórios:** a geração de relatórios em PDF e Excel não foi implementada.

## 7. Trabalhos futuros

- Limite de requisições e verificação anti-robô no agendamento público.
- Trava de concorrência na função de envio, por exemplo com status intermediário de processamento.
- Canal de notificação alinhado ao que a clínica usa com os clientes.
- Relatórios em PDF e Excel respeitando o `clinica_id`.
- Testes automatizados de RLS integrados à rotina de desenvolvimento.

## 8. Conclusão

O Glow Beauty mostra que, em um sistema de agendamento multi-clínica, as três garantias mais importantes (isolamento de dados, horário único e envio sem bloqueio da tela) podem ser impostas no banco de dados e validadas com testes objetivos. Os resultados de concorrência e isolamento foram obtidos em ambiente real. [A PREENCHER: conclusão sobre usabilidade.]

## Referências

[A PREENCHER: referências do trabalho, incluindo Brooke (1996) e Bangor, Kortum e Miller (2009), já citados no roteiro de usabilidade.]
