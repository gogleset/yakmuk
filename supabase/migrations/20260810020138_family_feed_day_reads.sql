-- 가족 최근 소식: 보호자별 일자 읽음 (펼침/단건 노출 시)

create table public.family_feed_day_reads (
  user_id uuid not null references public.users(id) on delete cascade,
  family_id uuid not null references public.families(id) on delete cascade,
  log_date date not null,
  read_at timestamptz not null default now(),
  primary key (user_id, family_id, log_date)
);

create index family_feed_day_reads_family_user_idx
  on public.family_feed_day_reads (family_id, user_id, log_date desc);

alter table public.family_feed_day_reads enable row level security;

-- 본인 읽음만 조회
create policy family_feed_day_reads_select on public.family_feed_day_reads
  for select using (
    family_id = public.current_family_id()
    and user_id = auth.uid()
  );

create policy family_feed_day_reads_insert on public.family_feed_day_reads
  for insert with check (
    family_id = public.current_family_id()
    and user_id = auth.uid()
  );

create policy family_feed_day_reads_update on public.family_feed_day_reads
  for update using (
    family_id = public.current_family_id()
    and user_id = auth.uid()
  );

grant select, insert, update on public.family_feed_day_reads to authenticated;
