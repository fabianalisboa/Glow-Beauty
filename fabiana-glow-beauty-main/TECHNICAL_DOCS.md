# Documentação Técnica — Glow Beauty

> Versão: 1.0 · Stack: React 18 + Vite 6 + Supabase + Vercel  
> Produção: [glow-beauty-rs.vercel.app](https://glow-beauty-rs.vercel.app)

---

## Índice

1. [Visão Geral](#1-visão-geral)
2. [Setup Local](#2-setup-local)
3. [Estrutura de Pastas](#3-estrutura-de-pastas)
4. [Variáveis de Ambiente](#4-variáveis-de-ambiente)
5. [Banco de Dados](#5-banco-de-dados)
6. [Autenticação e Autorização](#6-autenticação-e-autorização)
7. [Roteamento](#7-roteamento)
8. [Hooks (Camada de Dados)](#8-hooks-camada-de-dados)
9. [Componentes](#9-componentes)
10. [Estado e Cache](#10-estado-e-cache)
11. [Storage (Arquivos)](#11-storage-arquivos)
12. [Notificações](#12-notificações)
13. [Formulários e Validação](#13-formulários-e-validação)
14. [Utilitários](#14-utilitários)
15. [PWA e Service Worker](#15-pwa-e-service-worker)
16. [Build e Deploy](#16-build-e-deploy)
17. [Convenções de Código](#17-convenções-de-código)
18. [Diagramas Técnicos](#18-diagramas-técnicos)

---

## 1. Visão Geral

Sistema SaaS para gestão de clínica de beleza. Produto single-tenant com painel administrativo completo e portal público de agendamento.

### Stack Principal

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Frontend | React | 18.3.1 |
| Linguagem | TypeScript | 5.7.3 |
| Bundler | Vite | 6.3.5 |
| Roteamento | React Router | 6.28.1 |
| Server State | TanStack React Query | 5.62.16 |
| Client State | Zustand (instalado, não utilizado) | 5.0.3 |
| Forms | React Hook Form | 7.54.2 |
| Validação | Zod | 3.24.2 |
| Estilo | Tailwind CSS | 3.4.17 |
| Ícones | Lucide React | 0.511.0 |
| Gráficos | Recharts | 2.15.3 |
| Datas | date-fns | 4.1.0 |
| Backend | Supabase (Auth + PostgreSQL + Storage) | 2.49.4 |
| Deploy | Vercel + PWA (Workbox) | — |

### Modelo de Dados

```
clientes ─────┐
profissionais ─┼──► agendamentos ──► pagamentos
servicos ──────┘

produtos ──► movimentacoes_estoque

configuracoes (singleton)
```

---

## 2. Setup Local

### Pré-requisitos

- Node.js 18+
- npm ou pnpm
- Conta Supabase (ou acesso ao projeto `vasoeaadevgwfnmdzqmp`)

### Instalação

```bash
git clone <repo>
cd Fabiana-Glow-Beauty
npm install
```

### Configurar variáveis de ambiente

```bash
cp .env.example .env
# Edite .env com suas credenciais Supabase
```

### Rodar em desenvolvimento

```bash
npm run dev        # http://localhost:5175
```

### Scripts disponíveis

```bash
npm run dev        # Dev server com HMR
npm run build      # Build de produção (tsc -b && vite build)
npm run preview    # Preview do build local
npm run lint       # ESLint
```

### Primeiro acesso (Admin)

1. Acesse `/login`
2. Credenciais do superadmin: `fabianapinheirolisboa@gmail.com`
3. Senha via painel Supabase → Authentication → Users

---

## 3. Estrutura de Pastas

```
src/
├── App.tsx                    # Roteador raiz + controle de sessão
├── main.tsx                   # Bootstrap: React DOM + QueryClient
├── index.css                  # Estilos globais (Tailwind directives)
│
├── components/
│   ├── layout/
│   │   ├── AdminLayout.tsx    # Sidebar (9 itens) + topbar responsivo
│   │   └── PublicLayout.tsx   # Header sticky + footer para rotas públicas
│   └── shared/
│       ├── Modal.tsx          # Dialog genérico (backdrop + portal)
│       ├── NotificacaoBell.tsx # Badge de notificações + dropdown
│       └── StatusBadge.tsx    # Badge colorido por status string
│
├── pages/
│   ├── admin/
│   │   ├── DashboardPage.tsx  # KPIs, Recharts, próximos agendamentos
│   │   ├── ClientesPage.tsx   # CRUD clientes (tabela + modal)
│   │   ├── ProfissionaisPage.tsx
│   │   ├── ServicosPage.tsx   # CRUD + upload de imagem
│   │   ├── AgendamentosPage.tsx
│   │   ├── FinanceiroPage.tsx # Visualização de pagamentos
│   │   ├── EstoquePage.tsx    # Produtos + movimentações
│   │   ├── UsuariosPage.tsx   # Gestão de usuários auth
│   │   └── ConfiguracoesPage.tsx # Settings singleton + logo upload
│   ├── auth/
│   │   └── LoginPage.tsx      # Email/password form
│   └── public/
│       ├── HomePage.tsx       # Landing page com vitrine de serviços
│       └── AgendarPage.tsx    # Formulário público de agendamento
│
├── hooks/                     # Toda lógica de acesso a dados
│   ├── useAuth.ts
│   ├── useAgendamentos.ts
│   ├── useClientes.ts
│   ├── useConfiguracoes.ts
│   ├── useEstoque.ts
│   ├── useNotificacoes.ts
│   ├── useProfissionais.ts
│   └── useServicos.ts
│
├── integrations/
│   └── supabase/
│       └── client.ts          # Instância única do Supabase client
│
├── types/
│   └── index.ts               # Todas as interfaces TypeScript
│
└── lib/
    └── utils.ts               # cn(), formatCurrency(), formatDate(), etc.

database/                      # Migrations SQL
├── setup_completo.sql         # Schema completo + dados iniciais
├── migration_configuracoes.sql
└── migration_rls_e_colunas.sql

diagrams/                      # Diagramas técnicos (excalidraw + svg)
├── 01-arquitetura.{excalidraw,svg}
├── 02-fluxograma.{excalidraw,svg}
├── 03-sequencia.{excalidraw,svg}
└── 04-mindmap.{excalidraw,svg}
```

---

## 4. Variáveis de Ambiente

```env
# .env (nunca commitar)
VITE_SUPABASE_URL=https://vasoeaadevgwfnmdzqmp.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...          # Chave anônima (pública, OK no frontend)
```

> A `ANON_KEY` é segura no frontend pois o Supabase usa RLS para controlar acesso.  
> A `SERVICE_ROLE_KEY` **nunca** vai ao cliente — usar apenas em Edge Functions ou scripts de seed.

### Supabase Client

```ts
// src/integrations/supabase/client.ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```

---

## 5. Banco de Dados

**Projeto Supabase:** `vasoeaadevgwfnmdzqmp`  
**Region:** Padrão Supabase (us-east-1)  
**RLS:** Habilitado em todas as tabelas

### Schema Completo

#### `clientes`

```sql
CREATE TABLE clientes (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome        TEXT NOT NULL,
  telefone    TEXT,
  email       TEXT,
  status      TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo')),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);
```

#### `profissionais`

```sql
CREATE TABLE profissionais (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome         TEXT NOT NULL,
  especialidade TEXT,
  telefone     TEXT,
  email        TEXT,
  status       TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo')),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);
```

#### `servicos`

```sql
CREATE TABLE servicos (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome              TEXT NOT NULL,
  descricao         TEXT,
  valor             NUMERIC(10,2) NOT NULL,
  duracao_minutos   INTEGER DEFAULT 60,
  status            TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo')),
  image_url         TEXT,           -- bucket: servico-imagens
  created_at        TIMESTAMPTZ DEFAULT NOW()
);
```

#### `agendamentos`

```sql
CREATE TABLE agendamentos (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id        UUID REFERENCES clientes(id) ON DELETE SET NULL,
  profissional_id   UUID REFERENCES profissionais(id) ON DELETE SET NULL,
  servico_id        UUID REFERENCES servicos(id) ON DELETE SET NULL,
  data_agendamento  DATE NOT NULL,
  horario           TIME NOT NULL,
  status            TEXT DEFAULT 'pendente'
                    CHECK (status IN ('pendente','confirmado','concluido','cancelado')),
  observacoes       TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);
```

> **Nota:** `agendamentos` usa JOIN automático nas queries do hook. Ver `useAgendamentos.ts`.

#### `pagamentos`

```sql
CREATE TABLE pagamentos (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agendamento_id   UUID REFERENCES agendamentos(id) ON DELETE SET NULL,
  valor            NUMERIC(10,2) NOT NULL,
  forma_pagamento  TEXT,          -- pix, cartao, dinheiro, etc.
  data_pagamento   DATE,
  status           TEXT DEFAULT 'pendente'
                   CHECK (status IN ('pago','pendente','cancelado'))
);
```

#### `produtos`

```sql
CREATE TABLE produtos (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome           TEXT NOT NULL,
  categoria      TEXT,
  quantidade     INTEGER DEFAULT 0,
  valor_unitario NUMERIC(10,2),
  status         TEXT DEFAULT 'ativo',
  created_at     TIMESTAMPTZ DEFAULT NOW()
);
```

#### `movimentacoes_estoque`

```sql
CREATE TABLE movimentacoes_estoque (
  id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  produto_id          UUID REFERENCES produtos(id) ON DELETE SET NULL,
  tipo_movimentacao   TEXT NOT NULL CHECK (tipo_movimentacao IN ('entrada','saida')),
  quantidade          INTEGER NOT NULL,
  observacao          TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);
```

> **Trigger automático:** ao `INSERT` em `movimentacoes_estoque`, o hook `useRegistrarMovimentacao` também executa um `UPDATE` em `produtos.quantidade` (entrada: +, saída: −). Lógica no cliente, não trigger SQL.

#### `configuracoes` (singleton)

```sql
CREATE TABLE configuracoes (
  id                    UUID PRIMARY KEY DEFAULT '00000000-0000-0000-0000-000000000001',
  nome_clinica          TEXT,
  logo_url              TEXT,          -- bucket: glow-assets
  whatsapp              TEXT,
  telefone              TEXT,
  email                 TEXT,
  endereco              TEXT,
  cidade                TEXT,
  instagram             TEXT,
  facebook              TEXT,
  tiktok                TEXT,
  horario_funcionamento TEXT,
  sobre                 TEXT
);
```

> ID fixo: `00000000-0000-0000-0000-000000000001`. Sempre `upsert`, nunca `insert` duplicado.

### Relacionamentos (ERD simplificado)

```
clientes        ──(1:N)──► agendamentos ──(1:1)──► pagamentos
profissionais   ──(1:N)──► agendamentos
servicos        ──(1:N)──► agendamentos

produtos        ──(1:N)──► movimentacoes_estoque

configuracoes   (singleton, sem FK)
```

### Políticas RLS

#### Usuários autenticados (Admin)

Todas as tabelas têm políticas permissivas para usuários autenticados:

```sql
-- Exemplo para clientes (padrão replicado em todas as tabelas)
CREATE POLICY "auth_all" ON clientes
  FOR ALL USING (auth.role() = 'authenticated');
```

#### Usuários anônimos (Portal público `/agendar`)

```sql
-- Leitura de serviços e profissionais ativos (vitrine pública)
CREATE POLICY "anon_read_servicos" ON servicos
  FOR SELECT USING (status = 'ativo');

CREATE POLICY "anon_read_profissionais" ON profissionais
  FOR SELECT USING (status = 'ativo');

-- Criação de clientes (verificação de duplicata por telefone)
CREATE POLICY "anon_insert_clientes" ON clientes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "anon_select_clientes" ON clientes
  FOR SELECT USING (true);   -- necessário para lookup de duplicata

-- Criação de agendamentos públicos
CREATE POLICY "anon_insert_agendamentos" ON agendamentos
  FOR INSERT WITH CHECK (true);
```

---

## 6. Autenticação e Autorização

### Fluxo de Login

```
1. Usuário POST /login (email + password)
2. supabase.auth.signInWithPassword({ email, password })
3. Supabase valida → retorna { data: { session, user }, error }
4. SDK salva session em localStorage automaticamente
5. App.tsx detecta via supabase.auth.onAuthStateChange()
6. setSession(session) → ProtectedRoute libera /admin/*
```

### Implementação em `useAuth.ts`

```ts
export const useAuth = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    setLoading(false)
    return { data, error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return { loading, error, signIn, signOut }
}
```

### Controle de Sessão em `App.tsx`

```ts
const [session, setSession] = useState<Session | null>(null)
const [loading, setLoading] = useState(true)

useEffect(() => {
  supabase.auth.getSession().then(({ data: { session } }) => {
    setSession(session)
    setLoading(false)
  })

  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    setSession(session)
  })

  return () => subscription.unsubscribe()
}, [])
```

### `ProtectedRoute`

```tsx
const ProtectedRoute = ({ session, children }: { session: Session | null; children: ReactNode }) => {
  if (!session) return <Navigate to="/login" replace />
  return <>{children}</>
}
```

### Sem RBAC implementado

O sistema atual não implementa roles de usuário por nível. Qualquer usuário autenticado tem acesso total ao painel admin. Para adicionar RBAC:

1. Criar tabela `user_roles` com colunas `user_id`, `role`
2. Adicionar verificação de role no `ProtectedRoute`
3. Adicionar RLS granular por role nas tabelas sensíveis

---

## 7. Roteamento

### Configuração (React Router v6)

```tsx
// App.tsx
<BrowserRouter>
  <Routes>
    {/* Rotas públicas */}
    <Route element={<PublicLayout />}>
      <Route path="/"         element={<HomePage />} />
      <Route path="/agendar"  element={<AgendarPage />} />
    </Route>

    {/* Auth */}
    <Route path="/login" element={<LoginPage />} />

    {/* Admin (protegidas) */}
    <Route path="/admin" element={
      <ProtectedRoute session={session}>
        <AdminLayout />
      </ProtectedRoute>
    }>
      <Route index                   element={<Navigate to="dashboard" />} />
      <Route path="dashboard"        element={<DashboardPage />} />
      <Route path="clientes"         element={<ClientesPage />} />
      <Route path="profissionais"    element={<ProfissionaisPage />} />
      <Route path="servicos"         element={<ServicosPage />} />
      <Route path="agendamentos"     element={<AgendamentosPage />} />
      <Route path="financeiro"       element={<FinanceiroPage />} />
      <Route path="estoque"          element={<EstoquePage />} />
      <Route path="usuarios"         element={<UsuariosPage />} />
      <Route path="configuracoes"    element={<ConfiguracoesPage />} />
    </Route>

    {/* Fallback */}
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
</BrowserRouter>
```

### Tabela de Rotas

| Path | Componente | Acesso | Descrição |
|------|-----------|--------|-----------|
| `/` | `HomePage` | Público | Landing page + vitrine de serviços |
| `/agendar` | `AgendarPage` | Público (anônimo) | Formulário de agendamento |
| `/login` | `LoginPage` | Público | Login email/senha |
| `/admin/dashboard` | `DashboardPage` | Autenticado | KPIs, gráficos, próximos agendamentos |
| `/admin/clientes` | `ClientesPage` | Autenticado | CRUD de clientes |
| `/admin/profissionais` | `ProfissionaisPage` | Autenticado | CRUD de profissionais |
| `/admin/servicos` | `ServicosPage` | Autenticado | CRUD de serviços + upload de imagem |
| `/admin/agendamentos` | `AgendamentosPage` | Autenticado | CRUD + mudança de status |
| `/admin/financeiro` | `FinanceiroPage` | Autenticado | Registro e visualização de pagamentos |
| `/admin/estoque` | `EstoquePage` | Autenticado | Produtos + movimentações |
| `/admin/usuarios` | `UsuariosPage` | Autenticado | Gestão de contas Supabase Auth |
| `/admin/configuracoes` | `ConfiguracoesPage` | Autenticado | Dados da clínica + logo |

---

## 8. Hooks (Camada de Dados)

Todos os hooks usam **TanStack React Query** para server state. Mutations invalidam as queries relacionadas automaticamente.

### `useAuth`

```ts
// Assinatura
const { loading, error, signIn, signOut } = useAuth()

// Tipos
signIn: (email: string, password: string) => Promise<{ data: AuthResponse; error: AuthError | null }>
signOut: () => Promise<void>
loading: boolean
error: string | null
```

---

### `useClientes` / `useUpsertCliente` / `useDeleteCliente`

```ts
// Buscar todos os clientes (ordenados por nome)
const { data: clientes, isLoading, error } = useClientes()
// Query key: ['clientes']
// Query: SELECT id, nome, telefone, email, status, created_at, updated_at FROM clientes ORDER BY nome

// Criar ou atualizar cliente
const { mutate, isPending } = useUpsertCliente()
mutate({
  id?: string,          // se presente → UPDATE, senão → INSERT
  nome: string,
  telefone?: string,
  email?: string,
  status?: 'ativo' | 'inativo'
})
// Invalida: ['clientes']

// Deletar
const { mutate: deleteCliente } = useDeleteCliente()
deleteCliente(id: string)
// Invalida: ['clientes']
```

---

### `useAgendamentos` / `useUpdateAgendamentoStatus` / `useDeleteAgendamento`

```ts
const { data: agendamentos, isLoading } = useAgendamentos()
// Query key: ['agendamentos']
// Query com JOIN:
// SELECT
//   agendamentos.*,
//   clientes(nome, telefone),
//   profissionais(nome),
//   servicos(nome, valor, duracao_minutos)
// FROM agendamentos
// ORDER BY data_agendamento DESC, horario DESC

// Tipo retornado
interface Agendamento {
  id: string
  cliente_id: string | null
  profissional_id: string | null
  servico_id: string | null
  data_agendamento: string
  horario: string
  status: 'pendente' | 'confirmado' | 'concluido' | 'cancelado'
  observacoes: string | null
  created_at: string
  clientes: { nome: string; telefone: string | null } | null
  profissionais: { nome: string } | null
  servicos: { nome: string; valor: number; duracao_minutos: number } | null
}

// Atualizar status
const { mutate: updateStatus } = useUpdateAgendamentoStatus()
updateStatus({ id: string, status: 'pendente' | 'confirmado' | 'concluido' | 'cancelado' })

// Deletar
const { mutate: deleteAgendamento } = useDeleteAgendamento()
deleteAgendamento(id: string)
```

---

### `useServicos` / `useUpsertServico` / `useDeleteServico`

```ts
const { data: servicos, isLoading } = useServicos()
// Query key: ['servicos']
// Fallback: se coluna image_url não existir (migration antiga), retry sem ela

interface Servico {
  id: string
  nome: string
  descricao: string | null
  valor: number
  duracao_minutos: number
  status: 'ativo' | 'inativo'
  image_url: string | null
  created_at: string
}

const { mutate: upsertServico } = useUpsertServico()
upsertServico({
  id?: string,
  nome: string,
  descricao?: string,
  valor: number,
  duracao_minutos?: number,
  status?: 'ativo' | 'inativo',
  image_url?: string    // URL pública do Storage após upload
})
```

---

### `useProfissionais` / `useUpsertProfissional` / `useDeleteProfissional`

```ts
const { data: profissionais } = useProfissionais()
// SELECT id, nome, especialidade, telefone, email, status, created_at ORDER BY nome

interface Profissional {
  id: string
  nome: string
  especialidade: string | null
  telefone: string | null
  email: string | null
  status: 'ativo' | 'inativo'
  created_at: string
}
```

---

### `useProdutos` / `useUpsertProduto` / `useMovimentacoes` / `useRegistrarMovimentacao`

```ts
const { data: produtos } = useProdutos()
// SELECT id, nome, categoria, quantidade, valor_unitario, status, created_at

const { data: movimentacoes } = useMovimentacoes()
// SELECT *, produto:produtos(nome) ORDER BY created_at DESC LIMIT 50

const { mutate: registrarMovimentacao } = useRegistrarMovimentacao()
registrarMovimentacao({
  produto_id: string,
  tipo_movimentacao: 'entrada' | 'saida',
  quantidade: number,
  observacao?: string
})
// Side effect: UPDATE produtos SET quantidade = quantidade ± n WHERE id = produto_id
// Invalida: ['movimentacoes', 'produtos']
```

---

### `useConfiguracoes` / `useSaveConfiguracoes` / `uploadLogoUrl`

```ts
const { data: config } = useConfiguracoes()
// SELECT * FROM configuracoes WHERE id = '00000000-0000-0000-0000-000000000001' LIMIT 1

interface Configuracoes {
  id: string
  nome_clinica: string | null
  logo_url: string | null
  whatsapp: string | null
  telefone: string | null
  email: string | null
  endereco: string | null
  cidade: string | null
  instagram: string | null
  facebook: string | null
  tiktok: string | null
  horario_funcionamento: string | null
  sobre: string | null
}

const { mutate: saveConfig } = useSaveConfiguracoes()
saveConfig(Partial<Configuracoes>)
// Upsert com id fixo '00000000-0000-0000-0000-000000000001'

// Upload de logo (função async, fora do hook)
const logoUrl = await uploadLogoUrl(file: File): Promise<string>
// Upload para bucket 'glow-assets', path: logo/logo-{timestamp}.{ext}
// Retorna URL pública via supabase.storage.from('glow-assets').getPublicUrl(...)
```

---

### `useNotificacoes`

Sistema de polling baseado em `sessionStorage`. Não usa Supabase Realtime.

```ts
const {
  notificacoes,        // NotificacaoItem[]
  naoLidas,            // number (badge count)
  marcarLida,          // (id: string) => void
  marcarTodasLidas,    // () => void
} = useNotificacoes()

interface NotificacaoItem {
  id: string
  tipo: 'novo_agendamento'
  titulo: string
  mensagem: string
  lida: boolean
  created_at: string
  agendamento_id: string
}
```

**Implementação:**

```ts
// Intervalo de polling
const POLL_INTERVAL = 20_000  // 20 segundos

// Storage keys
const STORAGE_KEY = 'glow_notificacoes'   // JSON: NotificacaoItem[]
const LAST_CHECK_KEY = 'glow_last_check'  // ISO timestamp do último check

// Lógica:
// 1. Na montagem, carrega notificações do sessionStorage
// 2. setInterval de 20s para checar novos agendamentos criados após last_check
// 3. document.addEventListener('visibilitychange') → retoma polling ao voltar para a aba
// 4. Máximo de 25 notificações (slice do array)
```

---

## 9. Componentes

### `AdminLayout`

Wrapper de todas as rotas `/admin/*`. Renderiza sidebar fixa no desktop e drawer mobile.

```tsx
// Itens do sidebar (hardcoded)
const navItems = [
  { path: '/admin/dashboard',     label: 'Dashboard',     icon: LayoutDashboard },
  { path: '/admin/agendamentos',  label: 'Agendamentos',  icon: Calendar },
  { path: '/admin/clientes',      label: 'Clientes',      icon: Users },
  { path: '/admin/profissionais', label: 'Profissionais', icon: UserCheck },
  { path: '/admin/servicos',      label: 'Serviços',      icon: Scissors },
  { path: '/admin/financeiro',    label: 'Financeiro',    icon: DollarSign },
  { path: '/admin/estoque',       label: 'Estoque',       icon: Package },
  { path: '/admin/usuarios',      label: 'Usuários',      icon: Shield },
  { path: '/admin/configuracoes', label: 'Configurações', icon: Settings },
]

// Outlet do React Router renderiza o conteúdo da rota filha
```

**Responsividade:**
- Desktop (≥768px): sidebar fixa à esquerda, conteúdo com padding-left
- Mobile (<768px): sidebar ocultada, botão hambúrguer → drawer overlay

---

### `PublicLayout`

Header sticky com logo (carregado de `configuracoes.logo_url`), links de navegação e footer.

```tsx
// Links do header
- "Início" → /
- "Agendar" → /agendar
- Link WhatsApp → `https://wa.me/${config.whatsapp}`
```

---

### `Modal`

```tsx
interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

// Usa portal implícito via Tailwind fixed + z-index
// Fecha ao clicar no backdrop (div externo)
// Não fecha ao clicar no conteúdo (stopPropagation)
```

---

### `NotificacaoBell`

```tsx
// Renderiza ícone Bell (Lucide) com badge vermelho se naoLidas > 0
// Ao clicar → dropdown lista últimas notificações
// Cada item tem botão "Marcar como lida"
// Consome: useNotificacoes()
```

---

### `StatusBadge`

```tsx
interface StatusBadgeProps {
  status: string
}

// Mapeamento de cores por status:
// 'ativo' / 'confirmado' / 'pago' → verde
// 'inativo' / 'cancelado'        → vermelho
// 'pendente'                      → amarelo
// 'concluido'                     → azul
// default                         → cinza
```

---

## 10. Estado e Cache

### QueryClient (configurado em `main.tsx`)

```tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,   // 5 minutos antes de refetch automático
      retry: 1,                    // 1 retry em caso de erro
    },
  },
})
```

### Query Keys utilizadas

| Key | Hook | Invalidada por |
|-----|------|---------------|
| `['clientes']` | `useClientes` | `useUpsertCliente`, `useDeleteCliente` |
| `['agendamentos']` | `useAgendamentos` | `useUpdateAgendamentoStatus`, `useDeleteAgendamento` |
| `['servicos']` | `useServicos` | `useUpsertServico`, `useDeleteServico` |
| `['profissionais']` | `useProfissionais` | `useUpsertProfissional`, `useDeleteProfissional` |
| `['produtos']` | `useProdutos` | `useUpsertProduto`, `useRegistrarMovimentacao` |
| `['movimentacoes']` | `useMovimentacoes` | `useRegistrarMovimentacao` |
| `['configuracoes']` | `useConfiguracoes` | `useSaveConfiguracoes` |

### Padrão de Mutation

```ts
const { mutate, isPending, isError, error } = useMutation({
  mutationFn: async (payload) => {
    const { data, error } = await supabase.from('tabela').upsert(payload).select().single()
    if (error) throw error
    return data
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['tabela'] })
  },
  onError: (error) => {
    console.error('[Hook]', error)
    // Toast de erro na camada de UI
  },
})
```

---

## 11. Storage (Arquivos)

### Buckets configurados

| Bucket | Acesso | Uso |
|--------|--------|-----|
| `glow-assets` | Público | Logo da clínica |
| `servico-imagens` | Público | Fotos dos serviços |

### Upload de Logo

```ts
// src/hooks/useConfiguracoes.ts
export const uploadLogoUrl = async (file: File): Promise<string> => {
  const ext = file.name.split('.').pop()
  const path = `logo/logo-${Date.now()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('glow-assets')
    .upload(path, file, { upsert: true })

  if (uploadError) throw uploadError

  const { data } = supabase.storage.from('glow-assets').getPublicUrl(path)
  return data.publicUrl
}
```

### Upload de Imagem de Serviço

```ts
// Padrão idêntico, bucket diferente
const { error } = await supabase.storage
  .from('servico-imagens')
  .upload(`servicos/${Date.now()}-${file.name}`, file, { upsert: true })
```

> **Atenção:** Não há limpeza de arquivos antigos implementada. Ao substituir imagens, os arquivos anteriores permanecem no bucket.

---

## 12. Notificações

Sistema de polling sem WebSocket/Realtime. Decisão de design: simplicidade sobre latência.

```
Polling interval: 20 segundos
Storage: sessionStorage (não persiste entre abas/sessões)
Máximo de notificações: 25 (FIFO)
Trigger: agendamentos com status='pendente' criados após last_check
```

### Para migrar para Realtime (Supabase Subscriptions)

```ts
// Substituir o setInterval por:
const channel = supabase
  .channel('agendamentos_realtime')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'agendamentos',
    filter: "status=eq.pendente"
  }, (payload) => {
    // Adicionar à lista de notificações
    adicionarNotificacao(payload.new)
  })
  .subscribe()

return () => { supabase.removeChannel(channel) }
```

---

## 13. Formulários e Validação

**Stack:** React Hook Form + Zod + `@hookform/resolvers`

### Padrão de uso

```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({
  nome: z.string().min(2, 'Nome obrigatório'),
  telefone: z.string().min(10, 'Telefone inválido').optional(),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
})

type FormData = z.infer<typeof schema>

const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
  resolver: zodResolver(schema),
})

const onSubmit = (data: FormData) => {
  mutate(data)
}
```

### Formulário público `/agendar`

Campos do `AgendarPage`:

```ts
const agendarSchema = z.object({
  nome:            z.string().min(2),
  telefone:        z.string().min(10),
  email:           z.string().email().optional().or(z.literal('')),
  servico_id:      z.string().uuid(),
  profissional_id: z.string().uuid(),
  data_agendamento: z.string().min(1),
  horario:         z.string().min(1),
  observacoes:     z.string().optional(),
})
```

**Fluxo de submissão:**

```ts
// 1. Verifica cliente duplicado por telefone
const { data: existente } = await supabase
  .from('clientes')
  .select('id')
  .eq('telefone', data.telefone)
  .maybeSingle()

// 2a. Reusa cliente existente
const clienteId = existente?.id

// 2b. Cria novo cliente (acesso anônimo, RLS permite INSERT)
if (!clienteId) {
  const { data: novoCliente } = await supabase
    .from('clientes')
    .insert({ nome: data.nome, telefone: data.telefone, email: data.email })
    .select('id')
    .single()
  clienteId = novoCliente.id
}

// 3. Cria agendamento
await supabase.from('agendamentos').insert({
  cliente_id: clienteId,
  profissional_id: data.profissional_id,
  servico_id: data.servico_id,
  data_agendamento: data.data_agendamento,
  horario: data.horario,
  observacoes: data.observacoes,
  status: 'pendente'
})
```

---

## 14. Utilitários

**Arquivo:** `src/lib/utils.ts`

```ts
// Merge de classes Tailwind (clsx + tailwind-merge)
export const cn = (...inputs: ClassValue[]): string =>
  twMerge(clsx(inputs))

// Formato monetário BRL
export const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
// Exemplo: formatCurrency(150) → "R$ 150,00"

// Data DD/MM/YYYY
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString + 'T00:00:00')
  return format(date, 'dd/MM/yyyy', { locale: ptBR })
}

// Hora HH:MM (remove segundos se houver)
export const formatTime = (timeString: string): string =>
  timeString.substring(0, 5)

// Telefone (XX) XXXXX-XXXX
export const formatPhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0,2)}) ${cleaned.slice(2,7)}-${cleaned.slice(7)}`
  }
  return phone
}
```

---

## 15. PWA e Service Worker

**Plugin:** `vite-plugin-pwa` + Workbox

### Configuração (`vite.config.ts`)

```ts
VitePWA({
  registerType: 'autoUpdate',
  workbox: {
    runtimeCaching: [{
      urlPattern: /^https:\/\/vasoeaadevgwfnmdzqmp\.supabase\.co\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'supabase-cache',
        expiration: { maxAgeSeconds: 300 },  // 5 minutos
      },
    }],
  },
  manifest: {
    name: 'Glow Beauty',
    short_name: 'Glow Beauty',
    theme_color: '#ec4899',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  },
})
```

**Estratégia de cache:** `NetworkFirst` para chamadas Supabase (sempre tenta rede, usa cache como fallback).

---

## 16. Build e Deploy

### Build de produção

```bash
npm run build
# Executa: tsc -b && vite build
# Output: dist/
```

### Code Splitting (chunks manuais)

```ts
// vite.config.ts
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'vendor-react':    ['react', 'react-dom', 'react-router-dom'],
        'vendor-supabase': ['@supabase/supabase-js'],
        'vendor-query':    ['@tanstack/react-query'],
        'vendor-charts':   ['recharts'],
        'vendor-forms':    ['react-hook-form', 'zod', '@hookform/resolvers'],
      },
    },
  },
}
```

### Deploy Vercel

Configuração em `.vercel/project.json`:

```json
{
  "projectId": "<id>",
  "orgId": "<org>"
}
```

**Variáveis de ambiente no Vercel:**
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

**SPA Routing:** O Vercel serve `index.html` para todas as rotas (comportamento padrão para projetos Vite detectados automaticamente). Se houver 404 em refresh, adicionar `vercel.json`:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### CI/CD

Não há pipeline configurado. Deploy automático via Vercel ao push na branch `main` (integração GitHub).

---

## 17. Convenções de Código

### TypeScript

```ts
// ✅ Tipos explícitos para retornos não-triviais
const formatData = (raw: RawData): FormattedData => { ... }

// ❌ Proibido
const foo: any = ...
// @ts-ignore
```

### React

```ts
// ✅ Functional components com tipos de props separados
interface ClienteCardProps {
  cliente: Cliente
  onEdit: (id: string) => void
}

const ClienteCard = ({ cliente, onEdit }: ClienteCardProps): JSX.Element => { ... }

// ✅ useCallback em funções passadas como prop
const handleEdit = useCallback((id: string) => { ... }, [dep])

// ❌ Proibido: useEffect sem deps explicadas
useEffect(() => { ... }, []) // deve ter comentário explicando
```

### Ordem de imports

```ts
import React, { useState, useCallback } from 'react'        // 1. React
import { Button } from '@/components/ui/button'             // 2. UI
import { supabase } from '@/integrations/supabase/client'   // 3. Integrations
import { useClientes } from '@/hooks/useClientes'           // 4. Hooks
import type { Cliente } from './tipos'                       // 5. Tipos locais
```

### Nomenclatura

| Artefato | Padrão | Exemplo |
|----------|--------|---------|
| Componente | PascalCase | `AgendamentoCard.tsx` |
| Hook | `use` + camelCase | `useAgendamentos.ts` |
| Utilitário | camelCase | `formatCurrency.ts` |
| Interface/Type | PascalCase | `Agendamento` |
| Constante | UPPER_SNAKE | `MAX_NOTIFICACOES` |
| Página | PascalCase + Page | `AgendamentosPage.tsx` |

### Tratamento de erros Supabase

```ts
// Padrão obrigatório em todo await supabase...
const { data, error } = await supabase.from('tabela').select(...)
if (error) {
  console.error('[NomeDoHook]', error)
  toast.error(error.message ?? 'Erro inesperado')
  return
}
```

### Queries Supabase

```ts
// ✅ Sempre listar campos explicitamente
.select('id, nome, status, created_at')

// ❌ Proibido
.select('*')

// ✅ Estado de loading obrigatório em fetches
const { data, isLoading } = useClientes()
if (isLoading) return <Skeleton />
```

---

## 18. Diagramas Técnicos

Gerados automaticamente em `diagrams/`. Editáveis via [excalidraw.com](https://excalidraw.com).

| Arquivo | Conteúdo |
|---------|---------|
| [01-arquitetura.svg](diagrams/01-arquitetura.svg) | Stack completo em 3 camadas: SPA → SDK → Supabase Platform |
| [02-fluxograma.svg](diagrams/02-fluxograma.svg) | Ciclo completo de agendamento (público + admin) |
| [03-sequencia.svg](diagrams/03-sequencia.svg) | Interações Auth + Booking + Notificação |
| [04-mindmap.svg](diagrams/04-mindmap.svg) | Mapa de funcionalidades por módulo |

---

## Apêndice A — Tipos TypeScript (`src/types/index.ts`)

```ts
export interface Cliente {
  id: string
  nome: string
  telefone: string | null
  email: string | null
  status: 'ativo' | 'inativo'
  created_at: string
  updated_at: string
}

export interface Profissional {
  id: string
  nome: string
  especialidade: string | null
  telefone: string | null
  email: string | null
  status: 'ativo' | 'inativo'
  created_at: string
}

export interface Servico {
  id: string
  nome: string
  descricao: string | null
  valor: number
  duracao_minutos: number
  status: 'ativo' | 'inativo'
  image_url: string | null
  created_at: string
}

export interface Agendamento {
  id: string
  cliente_id: string | null
  profissional_id: string | null
  servico_id: string | null
  data_agendamento: string
  horario: string
  status: 'pendente' | 'confirmado' | 'concluido' | 'cancelado'
  observacoes: string | null
  created_at: string
  clientes?: { nome: string; telefone: string | null } | null
  profissionais?: { nome: string } | null
  servicos?: { nome: string; valor: number; duracao_minutos: number } | null
}

export interface Pagamento {
  id: string
  agendamento_id: string | null
  valor: number
  forma_pagamento: string | null
  data_pagamento: string | null
  status: 'pago' | 'pendente' | 'cancelado'
}

export interface Produto {
  id: string
  nome: string
  categoria: string | null
  quantidade: number
  valor_unitario: number | null
  status: 'ativo' | 'inativo'
  created_at: string
}

export interface MovimentacaoEstoque {
  id: string
  produto_id: string | null
  tipo_movimentacao: 'entrada' | 'saida'
  quantidade: number
  observacao: string | null
  created_at: string
  produtos?: { nome: string } | null
}

export interface Configuracoes {
  id: string
  nome_clinica: string | null
  logo_url: string | null
  whatsapp: string | null
  telefone: string | null
  email: string | null
  endereco: string | null
  cidade: string | null
  instagram: string | null
  facebook: string | null
  tiktok: string | null
  horario_funcionamento: string | null
  sobre: string | null
}
```

---

## Apêndice B — Checklist de Adição de Novo Módulo

Ao criar um novo módulo (ex: `avaliacoes`):

```
[ ] 1. Migration SQL com CREATE TABLE + RLS policies (database/migration_avaliacoes.sql)
[ ] 2. Aplicar migration no Supabase Dashboard (SQL Editor)
[ ] 3. Regenerar tipos: supabase gen types typescript --project-id vasoeaadevgwfnmdzqmp
[ ] 4. Adicionar interface em src/types/index.ts
[ ] 5. Criar src/hooks/useAvaliacoes.ts (useQuery + useMutation)
[ ] 6. Criar src/pages/admin/AvaliacoesPage.tsx
[ ] 7. Adicionar rota em App.tsx: <Route path="avaliacoes" element={<AvaliacoesPage />} />
[ ] 8. Adicionar item no navItems do AdminLayout.tsx
[ ] 9. Testar RLS: autenticado consegue CRUD, anônimo não acessa (se privado)
[ ] 10. Testar invalidação de query após mutations
```

---

*Documentação gerada em 26/06/2026 · Glow Beauty v1.0*
*Desenvolvido por Fabiana Pinheiro Lisboa · Glow-Beauty*
