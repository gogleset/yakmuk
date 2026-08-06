-- Edge (care-push / announce-push)는 service_role 클라이언트로 public.users 등을 읽음.
-- 테이블이 postgres 소유 + default ACL이 service_role에 Dxtm만 줘서 SELECT가 거부됨.
-- authenticated에는 이미 grant 있음 · service_role만 보강.

grant select, insert, update, delete on all tables in schema public to service_role;
grant usage, select on all sequences in schema public to service_role;

alter default privileges in schema public
  grant select, insert, update, delete on tables to service_role;
alter default privileges in schema public
  grant usage, select on sequences to service_role;
