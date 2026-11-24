-- Criar filial pela tela (só a dona). Rodar depois de multi_filiais.sql.
-- Cria clínica + linha de configurações + vínculo da dona, tudo numa função só.
begin;

alter table public.usuarios_clinica
  add column if not exists papel text not null default 'dona' check (papel in ('dona', 'recepcao'));

create or replace function public.criar_filial(p_nome text, p_slug text)
returns uuid
language plpgsql security definer set search_path = public
as $$
declare
  v_id uuid;
begin
  if not exists (select 1 from public.usuarios_clinica where user_id = auth.uid() and ativa and papel = 'dona') then
    raise exception 'sem_permissao';
  end if;
  if coalesce(trim(p_nome), '') = '' or p_slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$' then
    raise exception 'dados_invalidos';
  end if;

  insert into public.clinicas (slug, nome) values (p_slug, trim(p_nome)) returning id into v_id;
  -- id explícito: o default da coluna é um UUID fixo (só serve para a primeira clínica)
  insert into public.configuracoes (id, clinica_id, nome_clinica) values (gen_random_uuid(), v_id, trim(p_nome));
  insert into public.usuarios_clinica (user_id, clinica_id, ativa, papel) values (auth.uid(), v_id, false, 'dona');
  return v_id;
exception
  when unique_violation then
    raise exception 'slug_em_uso';
end;
$$;

revoke execute on function public.criar_filial(text, text) from public, anon;
grant execute on function public.criar_filial(text, text) to authenticated;

commit;

-- Recepcionista de uma filial (papel recepcao, 1 unidade, ativa):
-- insert into public.usuarios_clinica (user_id, clinica_id, ativa, papel)
-- select 'UUID-DA-RECEPCIONISTA', id, true, 'recepcao' from public.clinicas where slug = 'glow-beauty-centro';
