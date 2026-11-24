-- Remove serviços duplicados da Glow Beauty. Cada par: (mantido, removido).
-- Os agendamentos do removido passam para o mantido; a imagem é aproveitada se o mantido não tiver.
begin;

create temp table par (mantido uuid, removido uuid) on commit drop;
insert into par values
  ('d9a1404f-72d0-4477-bcff-06fc9f2eb646', 'eea1d736-c9ff-4fb9-b568-f3439fcc6086'), -- Design de Sobrancelhas (65 fica, 50 sai)
  ('26a776c0-b48e-40ee-884e-cfd1ad625f7f', '5b7e7b3a-9d83-4955-9652-951ea1382253'), -- Extensão de Cílios Fio a Fio (190 fica, 180 sai)
  ('a869e943-ea86-48a2-8260-fda5cf6cfbcc', 'd9606cb1-4a5d-4000-80c7-343ba2eaf90d'), -- Hidratação Capilar (90 fica, 80 sai)
  ('0c0adcba-393d-4534-be6c-43d525734c24', '8634d8b5-7be7-4c12-bd17-d63be223945f'), -- Limpeza de Pele Profunda (fica), Limpeza de Pele (sai)
  ('922f1c63-0e27-44e1-bd13-af8b6767578d', '73e9b012-ca92-4d62-bee9-605b0a1f61ef'), -- Massagem Relaxante Corporal (160 fica, 150 sai)
  ('bf0177b0-8b41-4a38-a3e2-96e8fa777cf3', 'e2f59fb8-6fd9-48fe-856f-a1137d802749'); -- Peeling Químico (220 fica, 200 sai)

update public.servicos m set image_url = r.image_url
from par join public.servicos r on r.id = par.removido
where m.id = par.mantido and m.image_url is null and r.image_url is not null;

update public.agendamentos a set servico_id = par.mantido
from par where a.servico_id = par.removido;

delete from public.servicos s using par where s.id = par.removido;

-- Evita novas duplicatas de nome na mesma clínica
create unique index if not exists servicos_nome_unico on public.servicos (clinica_id, lower(nome));

commit;
