-- 약 메타(공공 item_seq·효능 등) · 구분 색 · 용량(양+단위)
-- dose_amount / dose_unit: 둘 다 null 이거나 둘 다 있어야 함

alter table public.medications
  add column item_seq text null,
  add column color text not null default 'teal',
  add column efficacy text null,
  add column use_method text null,
  add column storage text null,
  add column warning text null,
  add column dose_amount numeric null,
  add column dose_unit text null;

alter table public.medications
  add constraint medications_dose_pair_chk
  check (
    (dose_amount is null and dose_unit is null)
    or (dose_amount is not null and dose_unit is not null)
  );

alter table public.medications
  add constraint medications_dose_amount_positive_chk
  check (dose_amount is null or dose_amount > 0);

alter table public.medications
  add constraint medications_dose_unit_chk
  check (
    dose_unit is null
    or dose_unit in (
      'tablet',
      'capsule',
      'ml',
      'mg',
      'g',
      'packet',
      'drop',
      'patch',
      'spoon'
    )
  );

comment on column public.medications.item_seq is '공공 e약은요 품목기준코드 (검색 선택 시)';
comment on column public.medications.color is '앱 내 구분 색 키 (MED_COLORS)';
comment on column public.medications.dose_unit is '용량 단위 키 (MED_DOSE_UNITS)';
