-- 약 삭제 시 체크 기록 유지: soft delete
alter table public.medications
  add column if not exists deleted_at timestamptz;

create index if not exists medications_user_active_idx
  on public.medications (user_id)
  where deleted_at is null;
