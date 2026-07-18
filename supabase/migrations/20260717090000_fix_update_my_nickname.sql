-- update_my_nickname: PL/pgSQL 변수 nickname ↔ users.nickname 컬럼 충돌 수정

create or replace function public.update_my_nickname(p_nickname text)
returns public.users
language plpgsql
security definer
set search_path = public
as $$
declare
  u public.users;
  v_nickname text := nullif(trim(p_nickname), '');
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  if v_nickname is null then
    raise exception 'nickname required';
  end if;

  update public.users
  set nickname = v_nickname
  where id = auth.uid()
  returning * into u;

  if not found then
    raise exception 'profile not found';
  end if;

  return u;
end;
$$;
