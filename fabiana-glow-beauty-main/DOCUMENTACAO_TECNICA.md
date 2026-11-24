# Glow Beauty — Documentação Técnica

**Versão:** 1.0.0  
**Data:** Junho/2026  
**Organização:** Fabiana P. Lisboa 
**Ambiente de produção:** https://glow-beauty-rs.vercel.app

---

## 1. Visão Geral

O **Glow Beauty** é um sistema web de gestão para clínicas de beleza, desenvolvido como SaaS. Permite gerenciar agendamentos, clientes, profissionais, serviços, estoque e financeiro — com painel administrativo completo e página pública para agendamento online.

---

## 2. Stack Tecnológica

| Camada | Tecnologia | Versão |
|---|---|---|
| Frontend | React | 18.3.1 |
| Linguagem | TypeScript | 5.7.3 (strict) |
| Build | Vite | 6.3.5 |
| Estilo | Tailwind CSS | 3.4.17 |
| Roteamento | React Router DOM | 6.28.1 |
| State / Cache | TanStack Query | 5.x |
| State Global | Zustand | 5.x |
| Forms | React Hook Form + Zod | 7.x / 3.x |
| Gráficos | Recharts | 2.x |
| Datas | date-fns | 4.x |
| Ícones | Lucide React | 0.511 |
| Backend | Supabase (Auth + PostgreSQL + Storage + Realtime) | 2.49 |
| Deploy | Vercel | — |
| PWA | vite-plugin-pwa + Workbox | — |

---

## 3. Arquitetura

```
Browser (React SPA)
    │
    ├── Rotas Públicas   → HomePage, AgendarPage
    ├── Autenticação     → LoginPage → Supabase Auth (JWT)
    └── Rotas Admin      → ProtectedRoute → AdminLayout
            │
            ├── DashboardPage
            ├── ClientesPage
            ├── ProfissionaisPage
            ├── ServicosPage
            ├── AgendamentosPage
            ├── FinanceiroPage
            ├── EstoquePage
            ├── UsuariosPage
            └── ConfiguracoesPage

Supabase (BaaS)
    ├── Auth           → Email/Password + JWT
    ├── PostgreSQL     → Dados relacionais + RLS
    ├── Realtime       → Notificações de novos agendamentos
    └── Storage        → Bucket: servico-imagens
```

### Fluxo de Autenticação

1. Usuário faz login via `/login` (email + senha)
2. Supabase Auth retorna `Session` com JWT
3. `App.tsx` mantém estado de sessão via `onAuthStateChange`
4. `ProtectedRoute` redireciona para `/login` se não autenticado
5. Todas as queries são feitas com o cliente Supabase autenticado

---

## 4. Estrutura de Pastas

```
src/
├── App.tsx                   # Roteamento principal
├── main.tsx                  # Entrypoint
├── index.css                 # Estilos globais Tailwind
├── components/
│   ├── layout/
│   │   ├── AdminLayout.tsx   # Layout admin (sidebar + topbar + notificações)
│   │   └── PublicLayout.tsx  # Layout público
│   ├── shared/
│   │   └── NotificacaoBell.tsx  # Sino de notificações com dropdown
│   └── ui/                   # Componentes de UI reutilizáveis
├── hooks/
│   ├── useAuth.ts            # Sessão Supabase
│   ├── useAgendamentos.ts    # CRUD agendamentos + TanStack Query
│   ├── useClientes.ts        # CRUD clientes
│   ├── useProfissionais.ts   # CRUD profissionais
│   ├── useServicos.ts        # CRUD serviços + upload imagem
│   ├── useEstoque.ts         # CRUD estoque
│   ├── useNotificacoes.ts    # Realtime INSERT em agendamentos
│   └── useConfiguracoes.ts   # Config da clínica
├── integrations/
│   └── supabase/
│       ├── client.ts         # createClient com variáveis de ambiente
│       └── types.ts          # Tipos gerados pelo Supabase CLI
├── pages/
│   ├── admin/                # Páginas do painel administrativo
│   ├── auth/                 # LoginPage
│   └── public/               # HomePage + AgendarPage
├── types/                    # Interfaces TypeScript globais
└── lib/                      # Utilitários (cn, formatters)
```

---

## 5. Banco de Dados

### Tabelas Principais

| Tabela | Descrição |
|---|---|
| `clientes` | Cadastro de clientes (nome, telefone, email) |
| `profissionais` | Profissionais da clínica (nome, especialidade, ativo) |
| `servicos` | Serviços oferecidos (nome, preço, duração, image_url) |
| `agendamentos` | Agendamentos (cliente, profissional, serviço, data/hora, status) |
| `financeiro` | Lançamentos financeiros (receitas/despesas) |
| `estoque` | Itens de estoque (produto, quantidade, mínimo) |
| `usuarios` | Usuários do sistema (vinculados ao Supabase Auth) |
| `configuracoes` | Configurações da clínica (nome, horário, etc.) |

### Status de Agendamento

```
pendente → confirmado → concluido
                  └──→ cancelado
```

### Storage

- **Bucket:** `servico-imagens`
- Aceita: `image/jpeg`, `image/png`, `image/webp`
- Tamanho máximo: 5MB
- Acesso: público (URL direta)

### Migrations Versionadas

```
database/
├── glow_beauty.sql              # Schema inicial
├── migration.sql                # Ajustes gerais
├── migration_configuracoes.sql  # Tabela de configurações
├── migration_image_url.sql      # ADD COLUMN image_url em servicos
├── migration_rls_e_colunas.sql  # RLS policies
└── setup_completo.sql           # Setup full (dev/staging)
```

---

## 6. Funcionalidades

### Painel Administrativo

| Módulo | Funcionalidades |
|---|---|
| **Dashboard** | KPIs dinâmicos (hoje/semana/mês/ano), gráficos Recharts, agendamentos do dia |
| **Clientes** | CRUD completo, busca, ordenação por coluna |
| **Profissionais** | CRUD, ativar/desativar, filtros |
| **Serviços** | CRUD + upload de imagem (Storage), categoria, preço, duração |
| **Agendamentos** | CRUD, filtro por data/profissional/status, highlight por `?highlight={id}` |
| **Financeiro** | Lançamentos, categorias, saldo, filtros |
| **Estoque** | Controle de produtos, alertas de estoque mínimo |
| **Usuários** | Gestão de acesso ao sistema |
| **Configurações** | Dados da clínica, horários de funcionamento |

### Notificações Realtime

- `useNotificacoes.ts` assina canal Supabase Realtime para INSERT em `agendamentos`
- `NotificacaoBell.tsx` exibe badge com contagem e dropdown de ações
- Ações disponíveis: Confirmar, Cancelar, WhatsApp, Ver agendamento
- Navegação para agendamento com `?highlight={id}` para destaque visual
- Estado persistido em `sessionStorage`

### Área Pública

- **HomePage** (`/`) — apresentação da clínica
- **AgendarPage** (`/agendar`) — formulário de agendamento online sem login

### PWA

- Configurado via `vite-plugin-pwa` + Workbox
- Instalável como app no celular/desktop

---

## 7. Variáveis de Ambiente

```env
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
```

> Arquivo `.env` na raiz do projeto (nunca commitado).

---

## 8. Deploy

- **Plataforma:** Vercel
- **URL produção:** https://glow-beauty-rs.vercel.app
- **GitHub:** https://github.com/fabianalisboa/Glow-Beauty.git
- **Build command:** `npm run build` (tsc + vite build)
- **Output dir:** `dist`
- **SPA Routing:** `vercel.json` com rewrite `/*` → `/index.html`

---

## 9. Scripts

```bash
npm run dev      # Servidor de desenvolvimento → http://localhost:5175
npm run build    # Build de produção (TypeScript + Vite)
npm run lint     # ESLint
npm run preview  # Preview do build local
```

---

## 10. Padrões Adotados

- **TypeScript strict** — sem `any`, tipos explícitos em todos os módulos
- **Hooks customizados** — toda lógica de dados em `src/hooks/`
- **TanStack Query** — cache, loading/error states, refetch automático
- **Zod** — validação de formulários no lado do cliente
- **Tailwind CSS** — utility-first, sem CSS externo
- **Componentes funcionais** — sem class components
- **Nomeação:** componentes PascalCase, hooks `useCamelCase`, arquivos `kebab-case.tsx`
