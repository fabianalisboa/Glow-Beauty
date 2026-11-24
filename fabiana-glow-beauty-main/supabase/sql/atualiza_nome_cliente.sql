-- Ao agendar com telefone já cadastrado na clínica, atualiza o nome do cliente.
begin;

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

  if not exists (select 1 from public.servicos where id = p_servico_id and clinica_id = v_clinica) then
    raise exception 'servico_invalido';
  end if;

  if p_profissional_id is not null and not exists (
    select 1 from public.profissionais where id = p_profissional_id and clinica_id = v_clinica
  ) then
    raise exception 'profissional_invalido';
  end if;

  select id into v_cliente from public.clientes
  where telefone = p_telefone and clinica_id = v_clinica
  limit 1;

  if v_cliente is null then
    insert into public.clientes (clinica_id, nome, telefone, email)
    values (v_clinica, p_nome, p_telefone, nullif(p_email, ''))
    returning id into v_cliente;
  else
    update public.clientes set nome = p_nome where id = v_cliente;
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

commit;
