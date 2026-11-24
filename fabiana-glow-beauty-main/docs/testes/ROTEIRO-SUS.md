# Roteiro de avaliação de usabilidade (SUS): Glow Beauty

Este documento descreve como a avaliação de usabilidade foi conduzida. Serve de base para a seção de metodologia do artigo e para a apresentação à banca.

## 1. Objetivo

Medir a facilidade de uso do sistema Glow Beauty por pessoas que representam os usuários reais: recepcionistas e profissionais da área da beleza. A medida é feita com o System Usability Scale (SUS), composto por 10 afirmações.

## 2. Participantes

- **Quantidade:** 5 a 10 pessoas. A recomendação para o SUS é de pelo menos 5.
- **Perfil:** pelo menos uma recepcionista e uma profissional da área da beleza. Quem nunca usou sistemas de agenda é bem-vindo, porque representa usuários com pouca familiaridade.
- **Exclusões:** pessoas que participaram do desenvolvimento do sistema.
- **Registro:** anotar, sem dados pessoais, o perfil de cada participante (função e tempo de experiência com sistemas de agenda).

## 3. Ética

- Apresentar o termo de consentimento livre e esclarecido antes de começar. Explicar que a participação é voluntária, que pode ser interrompida a qualquer momento e que as respostas são anônimas.
- Não gravar tela nem voz sem autorização por escrito.
- Não usar nomes reais dos participantes nos resultados. Use P1, P2, P3...
- Confirmar com o orientador se a instituição exige aprovação do comitê de ética para este tipo de coleta.

## 4. Ambiente

- Computador ou celular com navegador atualizado.
- Sistema publicado na versão de produção, com a base Glow Beauty.
- Uma conta de administrador de teste para as tarefas do painel.
- Não usar a conta real da Fabiana nem dados reais de clientes durante a avaliação.

## 5. Procedimento

1. **Acolhimento (2 min):** explicar o objetivo, o caráter anônimo e que o sistema é avaliado, não a pessoa.
2. **Tarefas (10 min):** o participante executa as tarefas abaixo, sem ajuda, em voz alta se quiser. O aplicador anota apenas se a tarefa foi concluída, se houve ajuda e onde a pessoa travou.
3. **Questionário SUS (3 min):** o participante responde às 10 afirmações sozinho, sem ver as respostas dos outros.
4. **Encerramento:** agradecer e perguntar se há algo que quis fazer e não conseguiu.

### Tarefas

| Código | Tarefa | Onde começar |
|---|---|---|
| T1 | Agendar um horário para um serviço, escolhendo profissional, data e horário | `/agendar` |
| T2 | Tentar agendar em um horário que já está ocupado e identificar a mensagem exibida | `/agendar` |
| T3 | Entrar no painel e localizar o agendamento criado em T1 | `/login`, depois `/admin/agendamentos` |
| T4 | Mudar o status desse agendamento | `/admin/agendamentos` |
| T5 | Cadastrar uma cliente nova | `/admin/clientes` |

**Para T2:** o aplicador informa o profissional, a data e o horário que já foram usados em T1 pelo participante, para que o conflito aconteça de forma natural.

**Registro por tarefa:** concluída sem ajuda / concluída com ajuda / não concluída. Tempo em segundos.

## 6. Questionário SUS

Responder cada afirmação em uma escala de 1 (discordo totalmente) a 5 (concordo totalmente).

1. Eu acho que gostaria de usar este sistema com frequência.
2. Achei o sistema desnecessariamente complexo.
3. Achei o sistema fácil de usar.
4. Acho que precisaria de ajuda de uma pessoa com conhecimento técnico para conseguir usar este sistema.
5. Achei que as várias funções do sistema estavam bem integradas.
6. Achei que o sistema tem muita inconsistência.
7. Imagino que a maioria das pessoas aprenderia a usar este sistema muito rapidamente.
8. Achei o sistema muito complicado de usar.
9. Me senti confiante ao usar o sistema.
10. Precisei aprender muitas coisas antes de conseguir usar o sistema.

## 7. Cálculo da pontuação

Para cada participante:

- **Itens ímpares (1, 3, 5, 7, 9):** subtrair 1 da resposta. A contribuição vai de 0 a 4.
- **Itens pares (2, 4, 6, 8, 10):** subtrair a resposta de 5. A contribuição vai de 0 a 4.
- **Soma** das 10 contribuições, multiplicada por 2,5. O resultado vai de 0 a 100.

**Exemplo:** respostas 4, 2, 5, 1, 4, 2, 4, 2, 5, 1.
- Ímpares: (4−1) + (5−1) + (4−1) + (4−1) + (5−1) = 3 + 4 + 3 + 3 + 4 = 17
- Pares: (5−2) + (5−1) + (5−2) + (5−2) + (5−1) = 3 + 4 + 3 + 3 + 4 = 17
- Soma: 34. Pontuação: 34 × 2,5 = **85**

**Interpretação usual (Bangor, Kortum e Miller, 2009):**
- Acima de 80,3: excelente.
- Entre 68 e 80,3: bom. A média de referência do SUS é 68.
- Abaixo de 68: abaixo da média, com problemas de usabilidade a investigar.

Para o conjunto de participantes, reportar a média, o desvio padrão e a mediana. Para cada item, reportar a média das respostas, para identificar os pontos de melhoria.

## 8. Como foi feito (texto para o artigo)

Preencher esta seção depois da coleta, com os dados reais.

- **Participantes:** [quantidade], com [perfis]. Perfis anotados sem identificação.
- **Período de coleta:** [datas].
- **Ambiente:** [navegador e dispositivo utilizados].
- **Procedimento:** cada participante executou as tarefas T1 a T5 e respondeu ao SUS ao final, sem ajuda do aplicador, conforme o roteiro em `docs/testes/ROTEIRO-SUS.md`.
- **Análise:** pontuação SUS calculada conforme Brooke (1996), com média, desvio padrão e mediana. Taxa de conclusão por tarefa e tempo médio por tarefa.
- **Limitações:** número reduzido de participantes; avaliação realizada em um único ambiente; aplicador conhecia o sistema.

## Referências

- Brooke, J. (1996). SUS: a "quick and dirty" usability scale. In: Jordan et al. (eds.), *Usability Evaluation in Industry*. Taylor and Francis.
- Bangor, A., Kortum, P. T., Miller, J. T. (2009). Determining what individual SUS scores mean. *Journal of Usability Studies*, 4(3), 114-123.
