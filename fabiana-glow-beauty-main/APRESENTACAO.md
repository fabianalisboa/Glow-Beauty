# Glow Beauty
## Sistema de Gestão para Clínicas de Beleza

**Apresentação — Pré Banca**  
Junho / 2026

---

## Slide 1 — O Problema

Clínicas de beleza gerenciam **tudo no papel ou no WhatsApp**:

- Agendamentos anotados em caderno ou agenda física
- Sem controle de estoque de produtos
- Sem visão financeira consolidada
- Cliente precisa ligar para agendar
- Sem histórico centralizado de clientes

> **Resultado:** perda de horários, falta de produto em hora errada, sem visão do negócio.

---

## Slide 2 — A Solução

**Glow Beauty** é um sistema web completo de gestão para clínicas de beleza.

- Acessa pelo navegador (desktop ou celular)
- Painel administrativo para a clínica
- Agendamento online para os clientes
- Tudo integrado em tempo real

🌐 **https://glow-beauty-rs.vercel.app**

---

## Slide 3 — Funcionalidades

| Módulo | O que faz |
|---|---|
| 📊 **Dashboard** | KPIs do dia/semana/mês/ano em tempo real |
| 👩 **Clientes** | Cadastro e histórico completo |
| 💅 **Profissionais** | Gestão da equipe |
| ✂️ **Serviços** | Catálogo com imagem, preço e duração |
| 📅 **Agendamentos** | Controle completo de agenda |
| 💰 **Financeiro** | Receitas, despesas e saldo |
| 📦 **Estoque** | Controle de produtos com alerta de mínimo |
| 🔔 **Notificações** | Novos agendamentos em tempo real |
| 🌐 **Área Pública** | Agendamento online sem login |

---

## Slide 4 — Arquitetura do Sistema

```
Cliente (Navegador)
        │
        ▼
   React SPA (Vite)
        │
        ├─ Área pública ──────► Agendamento online
        └─ Área admin ────────► Painel completo
                │
                ▼
          Supabase (BaaS)
                │
       ┌────────┼────────┐
       ▼        ▼        ▼
    Auth    PostgreSQL  Realtime
  (Login)   (Dados)   (Notificações)
                │
            Storage
           (Imagens)
```

**Deploy:** Vercel (CI/CD automático via GitHub)

---

## Slide 5 — Stack Tecnológica

### Frontend
- **React 18** + **TypeScript** (strict)
- **Vite** — build ultrarrápido
- **Tailwind CSS** — design system utilitário
- **TanStack Query** — cache e sincronização de dados
- **React Router DOM v6** — roteamento SPA

### Backend / Infraestrutura
- **Supabase** — Auth, PostgreSQL, Realtime, Storage
- **Vercel** — deploy automático, CDN global
- **PWA** — instalável como app no celular

---

## Slide 6 — Banco de Dados

**8 tabelas relacionais no PostgreSQL:**

```
clientes ──────┐
profissionais ─┤
servicos ──────┼──► agendamentos ──► financeiro
configuracoes  │
estoque        │
usuarios ──────┘
```

- Índices otimizados para busca por data e status
- Constraints de integridade referencial
- Migrations versionadas para evolução segura do schema

---

## Slide 7 — Destaque Técnico: Notificações em Tempo Real

```
Nova marcação pelo cliente
         │
         ▼
  INSERT em agendamentos (Supabase)
         │
         ▼
  Realtime WebSocket ─────► Painel Admin
         │                       │
         ▼                       ▼
  useNotificacoes.ts      NotificacaoBell.tsx
  (hook Supabase)         (sino + badge + dropdown)
         │
         ▼
  Ações: Confirmar │ Cancelar │ WhatsApp │ Ver
```

A clínica recebe **alerta instantâneo** sem precisar recarregar a página.

---

## Slide 8 — Destaque Técnico: Agendamento Online

O cliente acessa **/agendar** sem precisar de login:

1. Escolhe o serviço (com foto e preço)
2. Escolhe o profissional
3. Escolhe data e horário disponível
4. Preenche nome e telefone
5. Confirma → agendamento salvo → clínica recebe notificação

> **Zero fricção para o cliente, zero trabalho manual para a clínica.**

---

## Slide 9 — Dashboard em Números

O painel exibe métricas em **tempo real** com filtro de período:

```
┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│  Hoje       │ │  Semana     │ │  Mês        │ │  Ano        │
└─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘

KPIs:
• Total de agendamentos no período
• Receita do período
• Novos clientes
• Taxa de confirmação

Gráfico de evolução de agendamentos (Recharts)
Lista dos próximos agendamentos do dia
```

---

## Slide 10 — Segurança

| Camada | Proteção |
|---|---|
| **Autenticação** | Supabase Auth com JWT |
| **Rotas protegidas** | `ProtectedRoute` redireciona sem sessão |
| **Validação de formulários** | Zod + React Hook Form (client-side) |
| **TypeScript strict** | Sem `any`, tipagem total |
| **Variáveis de ambiente** | Chaves nunca expostas no código |
| **HTTPS** | Forçado pela Vercel em produção |

---

## Slide 11 — Resultados

✅ Sistema completo e funcional em produção  
✅ Deploy automático via GitHub → Vercel  
✅ Responsivo (desktop e mobile)  
✅ Instalável como PWA  
✅ Notificações em tempo real  
✅ Agendamento online sem atrito  
✅ Painel com visão total do negócio  

**URL:** https://glow-beauty-rs.vercel.app  
**GitHub:** https://github.com/fabianalisboa/Glow-Beauty.git

---

## Slide 12 — Próximos Passos

- [ ] Relatórios exportáveis (PDF/Excel)
- [ ] Envio automático de lembrete de agendamento via WhatsApp
- [ ] Multi-unidade (expansão para outras clínicas)
- [ ] App mobile nativo (React Native)
- [ ] Integração com pagamento online

---

*Desenvolvido com React + TypeScript + Supabase + Vercel*  
*Fabiana Pinheiro Lisboa · Glow-Beauty — 2026*  
*Email: fabianapinheirolisboa@gmail.com*
