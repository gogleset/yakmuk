-- 슬롯(약 행)별 로컬 알림 on/off. 기본 on.
alter table public.medications
  add column notification_enabled boolean not null default true;

comment on column public.medications.notification_enabled is
  '로컬 약 알림 스케줄 등록 여부 (서버 푸시 아님)';
