-- 초대 클레임·재발급 시 리더 자리표 즉시 갱신
do $$
begin
  alter publication supabase_realtime add table public.family_invites;
exception
  when duplicate_object then null;
end $$;
