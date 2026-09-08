-- users.expo_push_token → push_token (벤더 중립. Android FCM 토큰을 넣는다.)
-- 기존 마이그레이션 in-place 수정 금지.

alter table public.users rename column expo_push_token to push_token;

comment on column public.users.push_token is
  '디바이스 푸시 토큰. 구 expo_push_token. Android는 FCM.';

-- transfer_member_identity INSERT 컬럼 목록 동기 (최신 본문 = 20260801064304)
create or replace function public.transfer_member_identity(
  p_old_user_id uuid,
  p_new_user_id uuid,
  p_nickname text default null
)
returns public.users
language plpgsql
security definer
set search_path = public
as $$
declare
  old_u public.users;
  new_u public.users;
  display_name text;
begin
  if p_old_user_id = p_new_user_id then
    select * into new_u from public.users where id = p_old_user_id;
    return new_u;
  end if;

  select * into old_u from public.users where id = p_old_user_id for update;
  if not found then
    raise exception 'member not found';
  end if;

  if exists (
    select 1 from public.users
    where id = p_new_user_id and family_id is not null
  ) then
    raise exception 'already in a family';
  end if;

  delete from public.users
  where id = p_new_user_id and family_id is null;

  display_name := coalesce(nullif(trim(p_nickname), ''), old_u.nickname);

  insert into public.users (id, nickname, invited_as, role, family_id, push_token, force_sign_out_at)
  values (
    p_new_user_id,
    display_name,
    old_u.invited_as,
    old_u.role,
    old_u.family_id,
    null,
    null
  );

  update public.medications set user_id = p_new_user_id where user_id = p_old_user_id;
  update public.daily_logs set user_id = p_new_user_id where user_id = p_old_user_id;
  update public.family_alerts set user_id = p_new_user_id where user_id = p_old_user_id;
  update public.runs set owner_user_id = p_new_user_id where owner_user_id = p_old_user_id;
  update public.family_invites set claimed_by = p_new_user_id where claimed_by = p_old_user_id;
  update public.family_invites set reentry_user_id = p_new_user_id where reentry_user_id = p_old_user_id;
  update public.member_recovery_codes set user_id = p_new_user_id where user_id = p_old_user_id;

  delete from public.users where id = p_old_user_id;

  select * into new_u from public.users where id = p_new_user_id;
  return new_u;
end;
$$;
