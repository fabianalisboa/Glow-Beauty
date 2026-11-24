-- Assistente de atendimento (RAG): só dados públicos da clínica, isolados por clinica_id.
create extension if not exists vector with schema extensions;

create table if not exists public.base_conhecimento (
  id uuid primary key default gen_random_uuid(),
  clinica_id uuid not null references public.clinicas(id) on delete cascade,
  fonte text not null,              -- 'servico', 'clinica' ou 'faq'
  titulo text not null,
  conteudo text not null,
  embedding extensions.vector(1536) not null,
  created_at timestamptz not null default now()
);
create index if not exists base_conhecimento_clinica on public.base_conhecimento (clinica_id);

create table if not exists public.assistente_log (
  id uuid primary key default gen_random_uuid(),
  clinica_id uuid not null references public.clinicas(id) on delete cascade,
  pergunta text not null,
  resposta text,
  trechos text[],
  ms integer,
  created_at timestamptz not null default now()
);
create index if not exists assistente_log_clinica_data on public.assistente_log (clinica_id, created_at desc);

alter table public.base_conhecimento enable row level security;
alter table public.assistente_log enable row level security;

create policy "isolamento_clinica" on public.base_conhecimento for all to authenticated
  using (clinica_id = public.minha_clinica()) with check (clinica_id = public.minha_clinica());
create policy "isolamento_clinica" on public.assistente_log for select to authenticated
  using (clinica_id = public.minha_clinica());

revoke all on public.base_conhecimento, public.assistente_log from anon;

-- Busca por similaridade (cosseno) restrita a UMA clínica. Só a Edge Function (service_role) chama.
create or replace function public.buscar_conhecimento(p_clinica uuid, p_emb extensions.vector(1536), p_k int default 4)
returns table (titulo text, conteudo text, similaridade float)
language sql stable set search_path = public, extensions
as $$
  select b.titulo, b.conteudo, 1 - (b.embedding <=> p_emb) as similaridade
  from public.base_conhecimento b
  where b.clinica_id = p_clinica
  order by b.embedding <=> p_emb
  limit p_k
$$;
revoke all on function public.buscar_conhecimento(uuid, extensions.vector, int) from public, anon, authenticated;
grant execute on function public.buscar_conhecimento(uuid, extensions.vector, int) to service_role;
