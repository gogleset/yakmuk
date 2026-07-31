/** 용량 단위 — DB medications_dose_unit_chk 와 동기 */
export const MED_DOSE_UNITS = [
  { id: 'tablet', label: '정' },
  { id: 'capsule', label: '캡슐' },
  { id: 'ml', label: 'ml' },
  { id: 'mg', label: 'mg' },
  { id: 'g', label: 'g' },
  { id: 'packet', label: '포' },
  { id: 'drop', label: '방울' },
  { id: 'patch', label: '매' },
  { id: 'spoon', label: '스푼' },
] as const;

export type MedDoseUnitId = (typeof MED_DOSE_UNITS)[number]['id'];

/** 리스트 아이콘용 내복약 형태 */
export type MedFormIconId =
  | 'tablet'
  | 'capsule'
  | 'powder'
  | 'liquid'
  | 'film';

const MED_DOSE_UNIT_IDS = new Set<string>(MED_DOSE_UNITS.map((u) => u.id));

export function isMedDoseUnitId(value: string): value is MedDoseUnitId {
  return MED_DOSE_UNIT_IDS.has(value);
}

export function medDoseUnitLabel(unitId: string): string {
  const found = MED_DOSE_UNITS.find((u) => u.id === unitId);
  return found?.label ?? unitId;
}

/**
 * dose_unit → 약 형태 아이콘.
 * 미설정·tablet·mg = 알약(기본). mg는 함량 표기가 많아 알약으로.
 */
export function resolveMedFormIconId(
  unitId: string | null | undefined,
): MedFormIconId {
  if (!unitId) return 'tablet';
  switch (unitId) {
    case 'capsule':
      return 'capsule';
    case 'packet':
    case 'g':
      return 'powder';
    case 'ml':
    case 'drop':
    case 'spoon':
      return 'liquid';
    case 'patch':
      return 'film';
    case 'tablet':
    case 'mg':
    default:
      return 'tablet';
  }
}

/** MedRow 캡션 — `1정`, `5ml` */
export function formatMedDose(
  amount: number | null,
  unitId: string | null,
): string | null {
  if (amount == null || unitId == null) return null;
  const label = medDoseUnitLabel(unitId);
  // 정수면 소수 생략
  const amountText = Number.isInteger(amount)
    ? String(amount)
    : String(amount);
  return `${amountText}${label}`;
}
