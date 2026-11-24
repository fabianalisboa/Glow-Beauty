-- Migração: multi-tenant (clinica_id), RLS por clínica, horário único,
-- agendamento público via funções RPC. Rodar em transação.
begin;

-- 1. Clínicas e vínculo usuário -> clínica
create table if not exists public.clinicas (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  nome text not null,
  created_at timestamptz default now()
);

insert into public.clinicas (id, slug, nome)
values ('00000000-0000-0000-0000-000000000001', 'glow-beauty', 'Glow Beauty')
on conflict (id) do nothing;

create table if not exists public.usuarios_clinica (
  user_id uuid primary key references auth.users(id) on delete cascade,
  clinica_id uuid not null references public.clinicas(id)
);

-- Usuários existentes passam a pertencer à Glow Beauty (única clínica atual)
insert into public.usuarios_clinica (user_id, clinica_id)
select id, '00000000-0000-0000-0000-000000000001' from auth.users
on conflict (user_id) do nothing;

alter table public.clinicas enable row level security;
alter table public.usuarios_clinica enable row level security;

create policy "usuario_ve_proprio_vinculo" on public.usuarios_clinica
  for select to authenticated
  using (user_id = auth.uid());

create policy "usuario_ve_propria_clinica" on public.clinicas
  for select to authenticated
  using (id = (select clinica_id from public.usuarios_clinica where user_id = auth.uid()));

create or replace function public.minha_clinica()
returns uuid
language sql stable security definer set search_path = public
as $$
  select clinica_id from public.usuarios_clinica where user_id = auth.uid()
$$;

-- 2. clinica_id nas 8 tabelas, com backfill para a Glow Beauty
alter table public.agendamentos add column if not exists clinica_id uuid references public.clinicas(id);
update public.agendamentos set clinica_id = '00000000-0000-0000-0000-000000000001' where clinica_id is null;
alter table public.agendamentos alter column clinica_id set not null;
alter table public.agendamentos alter column clinica_id set default public.minha_clinica();

alter table public.clientes add column if not exists clinica_id uuid references public.clinicas(id);
update public.clientes set clinica_id = '00000000-0000-0000-0000-000000000001' where clinica_id is null;
alter table public.clientes alter column clinica_id set not null;
alter table public.clientes alter column clinica_id set default public.minha_clinica();

alter table public.configuracoes add column if not exists clinica_id uuid references public.clinicas(id);
update public.configuracoes set clinica_id = '00000000-0000-0000-0000-000000000001' where clinica_id is null;
alter table public.configuracoes alter column clinica_id set not null;
alter table public.configuracoes alter column clinica_id set default public.minha_clinica();

alter table public.movimentacoes_estoque add column if not exists clinica_id uuid references public.clinicas(id);
update public.movimentacoes_estoque set clinica_id = '00000000-0000-0000-0000-000000000001' where clinica_id is null;
alter table public.movimentacoes_estoque alter column clinica_id set not null;
alter table public.movimentacoes_estoque alter column clinica_id set default public.minha_clinica();

alter table public.pagamentos add column if not exists clinica_id uuid references public.clinicas(id);
update public.pagamentos set clinica_id = '00000000-0000-0000-0000-000000000001' where clinica_id is null;
alter table public.pagamentos alter column clinica_id set not null;
alter table public.pagamentos alter column clinica_id set default public.minha_clinica();

alter table public.produtos add column if not exists clinica_id uuid references public.clinicas(id);
update public.produtos set clinica_id = '00000000-0000-0000-0000-000000000001' where clinica_id is null;
alter table public.produtos alter column clinica_id set not null;
alter table public.produtos alter column clinica_id set default public.minha_clinica();

alter table public.profissionais add column if not exists clinica_id uuid references public.clinicas(id);
update public.profissionais set clinica_id = '00000000-0000-0000-0000-000000000001' where clinica_id is null;
alter table public.profissionais alter column clinica_id set not null;
alter table public.profissionais alter column clinica_id set default public.minha_clinica();

alter table public.servicos add column if not exists clinica_id uuid references public.clinicas(id);
update public.servicos set clinica_id = '00000000-0000-0000-0000-000000000001' where clinica_id is null;
alter table public.servicos alter column clinica_id set not null;
alter table public.servicos alter column clinica_id set default public.minha_clinica();

-- 3. Remove TODOS os policies atuais das 8 tabelas (todos usam true)
do $$
declare r record;
begin
  for r in
    select schemaname, tablename, policyname from pg_policies
    where schemaname = 'public'
      and tablename in ('agendamentos','clientes','configuracoes','movimentacoes_estoque',
                        'pagamentos','produtos','profissionais','servicos')
  loop
    execute format('drop policy %I on %I.%I', r.policyname, r.schemaname, r.tablename);
  end loop;
end $$;

-- 4. Um policy por tabela: usuário logado só vê e altera a própria clínica
create policy "isolamento_clinica" on public.agendamentos for all to authenticated
  using (clinica_id = public.minha_clinica()) with check (clinica_id = public.minha_clinica());
create policy "isolamento_clinica" on public.clientes for all to authenticated
  using (clinica_id = public.minha_clinica()) with check (clinica_id = public.minha_clinica());
create policy "isolamento_clinica" on public.configuracoes for all to authenticated
  using (clinica_id = public.minha_clinica()) with check (clinica_id = public.minha_clinica());
create policy "isolamento_clinica" on public.movimentacoes_estoque for all to authenticated
  using (clinica_id = public.minha_clinica()) with check (clinica_id = public.minha_clinica());
create policy "isolamento_clinica" on public.pagamentos for all to authenticated
  using (clinica_id = public.minha_clinica()) with check (clinica_id = public.minha_clinica());
create policy "isolamento_clinica" on public.produtos for all to authenticated
  using (clinica_id = public.minha_clinica()) with check (clinica_id = public.minha_clinica());
create policy "isolamento_clinica" on public.profissionais for all to authenticated
  using (clinica_id = public.minha_clinica()) with check (clinica_id = public.minha_clinica());
create policy "isolamento_clinica" on public.servicos for all to authenticated
  using (clinica_id = public.minha_clinica()) with check (clinica_id = public.minha_clinica());

-- 5. anon perde todos os grants em tabelas; passa a usar só as funções abaixo
revoke all on all tables in schema public from anon;
alter default privileges in schema public revoke all on tables from anon;

-- 6. Horário único: impede dois agendamentos no mesmo profissional/data/hora
create unique index if not exists agendamentos_horario_unico
  on public.agendamentos (profissional_id, data_agendamento, horario)
  where status <> 'cancelado';

-- 7. Página pública: lista serviços e profissionais de uma clínica (por slug)
create or replace function public.agendamento_publico_dados(p_slug text)
returns json
language sql stable security definer set search_path = public
as $$
  select json_build_object(
    'servicos', coalesce((
      select json_agg(json_build_object('id', s.id, 'nome', s.nome, 'valor', s.valor, 'duracao_minutos', s.duracao_minutos))
      from public.servicos s
      join public.clinicas c on c.id = s.clinica_id
      where c.slug = p_slug and s.status = 'ativo'
    ), '[]'::json),
    'profissionais', coalesce((
      select json_agg(json_build_object('id', p.id, 'nome', p.nome))
      from public.profissionais p
      join public.clinicas c on c.id = p.clinica_id
      where c.slug = p_slug and p.status = 'ativo'
    ), '[]'::json)
  )
$$;

-- 8. Página pública: cria cliente (se novo) e agendamento na clínica do slug
create or replace function public.criar_agendamento_publico(
  p_slug text, p_nome text, p_telefone text, p_email text,
  p_servico_id uuid, p_profissional_id uuid, p_data date, p_horario time, p_observacoes text
)
returns uuid
language plpgsql security definer set search_path = public
as $$
declare
  v_clinica uuid;
  v_cliente uuid;
  v_agendamento uuid;
begin
  select id into v_clinica from public.clinicas where slug = p_slug;
  if v_clinica is null then
    raise exception 'clinica_nao_encontrada';
  end if;

  if not exists (select 1 from public.servicos where id = p_servico_id and clinica_id = v_clinica)
     or not exists (select 1 from public.profissionais where id = p_profissional_id and clinica_id = v_clinica) then
    raise exception 'servico_ou_profissional_invalido';
  end if;

  select id into v_cliente from public.clientes
  where telefone = p_telefone and clinica_id = v_clinica
  limit 1;

  if v_cliente is null then
    insert into public.clientes (clinica_id, nome, telefone, email)
    values (v_clinica, p_nome, p_telefone, nullif(p_email, ''))
    returning id into v_cliente;
  end if;

  insert into public.agendamentos (clinica_id, cliente_id, servico_id, profissional_id, data_agendamento, horario, observacoes)
  values (v_clinica, v_cliente, p_servico_id, p_profissional_id, p_data, p_horario, p_observacoes)
  returning id into v_agendamento;

  return v_agendamento;
exception
  when unique_violation then
    raise exception 'horario_ocupado';
end;
$$;

revoke execute on function public.criar_agendamento_publico(text, text, text, text, uuid, uuid, date, time, text) from public;
grant execute on function public.criar_agendamento_publico(text, text, text, text, uuid, uuid, date, time, text) to anon, authenticated;
grant execute on function public.agendamento_publico_dados(text) to anon, authenticated;

commit;
