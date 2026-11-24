-- Fila de notificações (Telegram) disparadas por novos agendamentos.
begin;

-- Chat do Telegram da clínica (grupo ou pessoa da recepção que recebe os avisos)
alter table public.configuracoes add column if not exists telegram_chat_id text;

create table if not exists public.notificacoes_fila (
  id uuid primary key default gen_random_uuid(),
  clinica_id uuid not null references public.clinicas(id),
  agendamento_id uuid references public.agendamentos(id) on delete cascade,
  canal text not null default 'telegram' check (canal = 'telegram'),
  destinatario text not null,
  mensagem text not null,
  status text not null default 'pendente' check (status in ('pendente', 'enviada', 'falha')),
  tentativas int not null default 0,
  max_tentativas int not null default 3,
  proxima_tentativa_em timestamptz not null default now(),
  ultimo_erro text,
  enviada_em timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists notificacoes_fila_pendentes
  on public.notificacoes_fila (proxima_tentativa_em)
  where status = 'pendente';

alter table public.notificacoes_fila enable row level security;

create policy "isolamento_clinica" on public.notificacoes_fila for all to authenticated
  using (clinica_id = public.minha_clinica()) with check (clinica_id = public.minha_clinica());

create or replace function public.enfileirar_notificacao_agendamento()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  v_chat text;
  v_cliente text;
  v_servico text;
  v_profissional text;
begin
  select telegram_chat_id into v_chat from public.configuracoes where clinica_id = new.clinica_id;
  select nome into v_cliente from public.clientes where id = new.cliente_id;
  select nome into v_servico from public.servicos where id = new.servico_id;
  select nome into v_profissional from public.profissionais where id = new.profissional_id;

  insert into public.notificacoes_fila (clinica_id, agendamento_id, destinatario, mensagem, status, ultimo_erro)
  values (
    new.clinica_id,
    new.id,
    coalesce(v_chat, ''),
    format(E'Novo agendamento\nCliente: %s\nServiço: %s\nProfissional: %s\nData: %s às %s',
      coalesce(v_cliente, '-'),
      coalesce(v_servico, '-'),
      coalesce(v_profissional, 'Sem preferência'),
      to_char(new.data_agendamento, 'DD/MM/YYYY'),
      to_char(new.horario, 'HH24:MI')),
    case when v_chat is null then 'falha' else 'pendente' end,
    case when v_chat is null then 'telegram_chat_id não configurado na clínica' end
  );
  return new;
end;
$$;

drop trigger if exists agendamento_notifica on public.agendamentos;
create trigger agendamento_notifica
after insert on public.agendamentos
for each row execute function public.enfileirar_notificacao_agendamento();

commit;
