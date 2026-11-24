-- Teste de isolamento entre clínicas. Tudo é desfeito no final (raise proposital).
do $$
declare
  v_user uuid;
  v_outra uuid := gen_random_uuid();
  v_visiveis_glow int;
  v_visiveis_outra int;
  v_clinicas_outra int;
  v_insert_bloqueado text;
  v_update_bloqueado int;
begin
  select user_id into v_user from public.usuarios_clinica
  where clinica_id = '00000000-0000-0000-0000-000000000001' limit 1;

  -- Dados de outra clínica (como postgres, antes de trocar de papel)
  insert into public.clinicas (id, slug, nome) values (v_outra, 'teste-isolamento', 'Clinica Teste');
  insert into public.clientes (clinica_id, nome, telefone) values (v_outra, 'Cliente Outra Clinica', '00000000000');

  -- Age como o usuário da Glow Beauty
  set local role authenticated;
  perform set_config('request.jwt.claims', json_build_object('sub', v_user, 'role', 'authenticated')::text, true);

  select count(*) into v_visiveis_glow from public.clientes where clinica_id = '00000000-0000-0000-0000-000000000001';
  select count(*) into v_visiveis_outra from public.clientes where clinica_id = v_outra;
  select count(*) into v_clinicas_outra from public.clinicas where id = v_outra;

  begin
    insert into public.clientes (clinica_id, nome, telefone) values (v_outra, 'Invasao', '11111111111');
    v_insert_bloqueado := 'NAO (insert foi aceito)';
  exception when others then
    v_insert_bloqueado := 'SIM (' || sqlerrm || ')';
  end;

  update public.clientes set nome = 'Alterado' where clinica_id = v_outra;
  get diagnostics v_update_bloqueado = row_count;

  reset role;

  raise exception 'ISOLAMENTO | clientes_glow_visiveis=% | clientes_outra_visiveis=% | clinica_outra_visivel=% | insert_outra_bloqueado=% | updates_outra_afetados=%',
    v_visiveis_glow, v_visiveis_outra, v_clinicas_outra, v_insert_bloqueado, v_update_bloqueado;
end $$;
