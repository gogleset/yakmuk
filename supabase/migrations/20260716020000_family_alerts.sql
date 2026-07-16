-- 가족 알림: BAD 컨디션 · stuck escalate (보호자가 runs를 못 보므로 별도 테이블)

create table public.family_alerts (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  kind text not null check (kind in ('bad_condition', 'stuck_escalate')),
  message text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  acked_at timestamptz
);

create index family_alerts_family_created_idx
  on public.family_alerts (family_id, created_at desc);

create index family_alerts_unacked_idx
  on public.family_alerts (family_id)
  where acked_at is null;

alter table public.family_alerts enable row level security;

-- 같은 가족이면 조회
create policy family_alerts_select on public.family_alerts
  for select using (family_id = public.current_family_id());

-- 본인 알림 insert (피보호자 기기 / 루프)
create policy family_alerts_insert on public.family_alerts
  for insert with check (
    family_id = public.current_family_id()
    and user_id = auth.uid()
  );

-- 보호자 ack · 본인 취소 등
create policy family_alerts_update on public.family_alerts
  for update using (family_id = public.current_family_id());

grant select, insert, update on public.family_alerts to authenticated;

alter publication supabase_realtime add table public.family_alerts;
