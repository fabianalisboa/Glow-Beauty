-- Mantém o agendamento mais antigo de cada profissional/data/horário duplicado
-- e marca os demais como cancelado (nada é apagado).
begin;

with ranqueados as (
  select id,
         row_number() over (
           partition by profissional_id, data_agendamento, horario
           order by created_at, id
         ) as posicao
  from public.agendamentos
  where status <> 'cancelado'
)
update public.agendamentos a
set status = 'cancelado',
    observacoes = trim(coalesce(a.observacoes, '') || ' [cancelado automaticamente: horario duplicado]')
from ranqueados r
where a.id = r.id and r.posicao > 1;

commit;
