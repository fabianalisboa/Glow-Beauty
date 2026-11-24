-- Rede com várias filiais: um usuário pode pertencer a várias clínicas e escolhe a ativa.
-- Dados continuam 100% separados por filial (clinica_id + RLS). Nada muda nas políticas das 8 tabelas:
-- elas usam minha_clinica(), que agora devolve a clínica ATIVA do usuário.
-- Recepcionista = 1 linha em usuarios_clinica (vê só a sua unidade). Dona = 1 linha por filial.
begin;

alter table public.usuarios_clinica add column if not exists ativa boolean not null default false;
update public.usuarios_clinica set ativa = true;  -- quem já existe tem 1 clínica: ela é a ativa

alter table public.usuarios_clinica drop constraint usuarios_clinica_pkey;
alter table public.usuarios_clinica add primary key (user_id, clinica_id);
create unique index if not exists usuarios_clinica_uma_ativa on public.usuarios_clinica (user_id) where ativa;

create or replace function public.minha_clinica()
returns uuid
language sql stable security definer set search_path = public
as $$
  select clinica_id from public.usuarios_clinica where user_id = auth.uid() and ativa
$$;

-- Usuário vê todas as clínicas às quais pertence (antes: subselect escalar, quebraria com 2+ linhas)
drop policy "usuario_ve_propria_clinica" on public.clinicas;
create policy "usuario_ve_suas_clinicas" on public.clinicas
  for select to authenticated
  using (id in (select clinica_id from public.usuarios_clinica where user_id = auth.uid()));

-- Troca a unidade ativa (só entre as que o usuário pertence)
create or replace function public.trocar_clinica(p_clinica uuid)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  if not exists (select 1 from public.usuarios_clinica where user_id = auth.uid() and clinica_id = p_clinica) then
    raise exception 'clinica_nao_permitida';
  end if;
  update public.usuarios_clinica set ativa = false where user_id = auth.uid() and ativa;
  update public.usuarios_clinica set ativa = true where user_id = auth.uid() and clinica_id = p_clinica;
end;
$$;

revoke execute on function public.trocar_clinica(uuid) from public, anon;
grant execute on function public.trocar_clinica(uuid) to authenticated;

commit;

-- ---------------------------------------------------------------------------
-- Abrir uma filial nova para a dona (rodar à mão no SQL Editor; trocar os valores):
--
-- with c as (
--   insert into public.clinicas (slug, nome) values ('glow-beauty-centro', 'Glow Beauty Centro') returning id
-- ), cfg as (
--   insert into public.configuracoes (clinica_id, nome_clinica) select id, 'Glow Beauty Centro' from c
-- )
-- insert into public.usuarios_clinica (user_id, clinica_id)
-- select 'UUID-DA-DONA', id from c;
-- (a filial precisa da linha em configuracoes; depois a dona troca de unidade no topo do painel
--  e preenche serviços, profissionais etc. Se configuracoes tiver outras colunas NOT NULL sem default,
--  inclua-as no insert.)
--
-- Recepcionista de uma filial: só o vínculo, com ativa = true (ela tem uma única unidade):
-- insert into public.usuarios_clinica (user_id, clinica_id, ativa)
-- select 'UUID-DA-RECEPCIONISTA', id, true from public.clinicas where slug = 'glow-beauty-centro';
-- ---------------------------------------------------------------------------
