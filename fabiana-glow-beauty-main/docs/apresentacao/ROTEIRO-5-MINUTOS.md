# Roteiro de 5 minutos: Glow Beauty (SATHON 2026)

Escrito para ser falado pela Fabiana, na ordem exata dos 8 slides de `Glow-Beauty-Pitch-SATHON.pptx`. Cerca de 700 palavras, em ritmo calmo. O vídeo é mudo: ela comenta ao vivo, e as falas do slide 5 acompanham as cenas.

**Principal funcionalidade:** agendamento online sem conflito de horário, feito pela cliente sem precisar ligar.

**Diferencial:** as regras mais importantes (quem vê cada dado e o horário único) são garantidas pelo banco de dados, não pela tela. Por isso continuam valendo mesmo com 200 pessoas tentando ao mesmo tempo. Além disso, o assistente de IA só usa informações públicas da clínica.

| Tempo | Slide | Assunto |
|---|---|---|
| 0:00 a 0:25 | 1 | Abertura |
| 0:25 a 1:00 | 2 | Problema |
| 1:00 a 1:50 | 3 e 4 | Arquitetura, modelagem e regras |
| 1:50 a 3:20 | 5 e 6 | Vídeo e aviso no Telegram |
| 3:20 a 4:30 | 7 | Como validamos |
| 4:30 a 5:00 | 8 | Próximos passos |

---

## Slide 1 | 0:00 a 0:25 | Abertura

"Boa tarde. Eu sou a Fabiana e vou apresentar o Glow Beauty, um sistema de agendamento para clínicas de estética. A ideia cabe em uma frase: agenda sem conflito, com os dados de cada clínica protegidos."

## Slide 2 | 0:25 a 1:00 | Problema

"Muita clínica pequena ainda agenda por telefone, mensagem e caderno. Isso gera três problemas. Dois clientes marcados no mesmo horário com o mesmo profissional. A equipe sem aviso quando entra um agendamento novo. E dados de clientes sem controle de quem pode ver.

O Glow Beauty resolve isso com uma função principal: a cliente agenda sozinha, pela internet, e o sistema garante que o horário não se repete."

*(Se a clínica parceira der um caso real, conte aqui em uma frase. Sem número inventado.)*

## Slide 3 | 1:00 a 1:25 | Arquitetura

"Por dentro, a tela é feita em React e funciona como aplicativo no celular. O banco é o Supabase, com PostgreSQL. Três partes dão a complexidade técnica: um assistente de inteligência artificial, uma fila que envia os avisos sem travar a tela, e a regra de horário único, que fica dentro do banco."

## Slide 4 | 1:25 a 1:50 | Modelagem e regras de negócio

"O modelo é simples: tudo gira em torno do agendamento, que liga cliente, profissional e serviço. Todas as tabelas carregam o identificador da clínica.

E aqui está o diferencial: as regras estão no banco. Cada clínica só enxerga os próprios dados. Um profissional não pode ter dois agendamentos ativos no mesmo dia e hora, e cancelar libera o horário. Se a regra ficasse só na tela, duas pessoas clicando juntas furariam a regra. No banco, não."

## Slide 5 | 1:50 a 2:55 | Vídeo da demonstração

*(O vídeo roda sem voz. Fale junto com as cenas.)*

- **Cena 1, preenchimento:** "Esta é a página que a cliente vê. Ela escolhe o serviço, o profissional, a data e o horário. Não precisa de login."
- **Cena 2, assistente:** "Aqui o assistente de IA. Ela pergunta o horário de atendimento e o preço de um procedimento, e ele responde na hora. Ele só usa informações públicas da clínica. Nenhum dado de cliente chega à IA."
- **Cena 3, confirmação e painel:** "Ao confirmar, o agendamento entra no painel da clínica. Aqui estão agenda, clientes, financeiro e estoque."
- **Cena 4, relatórios:** "E os relatórios saem em Excel e PDF com um clique."

## Slide 6 | 2:55 a 3:20 | Aviso no Telegram

"Assim que a cliente confirma, a clínica recebe este aviso no celular. A gravação do agendamento não espera o envio: o aviso vai para uma fila, e se falhar o sistema tenta de novo três vezes."

## Slide 7 | 3:20 a 4:30 | Como validamos

"Para provar o que eu disse, eu testei. Coloquei 200 usuários virtuais tentando o mesmo horário ao mesmo tempo. Só um agendamento foi aceito, com resposta mediana de 729 milissegundos. No isolamento entre clínicas, zero vazamentos. E testei o assistente com 16 perguntas, incluindo perguntas fora do assunto e tentativas de enganar a IA. Acertou as 16, em menos de 2 segundos.

Falta a parte humana: aplicar o teste de usabilidade com profissionais reais de estética de Pelotas, que já está combinado."

## Slide 8 | 4:30 a 5:00 | Próximos passos

"Em novembro, refinamento e o teste de usabilidade. Em dezembro, entrega final e Demo Day. O sistema já está publicado, e o QR code leva até ele. Obrigada, e fico à disposição para as perguntas."

---

## Se a banca perguntar

- **Por que o horário único no banco e não na tela?** Porque a tela não enxerga outra pessoa clicando ao mesmo tempo. O banco é o único ponto por onde tudo passa.
- **A IA acessa dados de clientes?** Não. Ela só lê serviços, preços, endereço, telefone e horário, que já são públicos na página.
- **E se a IA errar?** Ela é instruída a responder só com o que está no cadastro e, na dúvida, orientar a falar com a clínica. Nos testes, recusou as 4 perguntas fora do escopo.
- **Quantas pessoas usaram?** O teste de usabilidade está em andamento, com duas profissionais reais. É uma amostra pequena, então será análise qualitativa.
- **Por que Telegram e não WhatsApp?** O Telegram tem API gratuita e simples para o aviso à clínica. O WhatsApp exige conta comercial paga.
- **O que é RLS?** É uma regra do banco que filtra cada consulta pela clínica de quem está logado. Mesmo com um erro na tela, uma clínica não consegue ler os dados da outra.

## Se o tempo for menor

- Corte o slide 8 para uma frase.
- No slide 7, fique só nos 200 usuários e no resultado do assistente.
- O vídeo sozinho já mostra a funcionalidade principal.

## Dica de ensaio

Leia em voz alta com um cronômetro. Se passar de 5 minutos, o corte mais fácil é a explicação da arquitetura (slide 3), já que o slide 4 repete a ideia com mais detalhe.
