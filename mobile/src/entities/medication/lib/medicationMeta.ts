import { MED_COLOR_DEFAULT } from '@/shared/constants/medColors';
import { ERRORS } from '@/shared/copy';

/** 등록·수정 공통 메타 (스케줄 제외) */
export type MedicationMetaInput = {
  itemSeq?: string | null;
  color?: string;
  efficacy?: string | null;
  useMethod?: string | null;
  storage?: string | null;
  warning?: string | null;
  doseAmount?: number | null;
  doseUnit?: string | null;
};

/** dose 양쪽 null 또는 양쪽 있음 — 아니면 에러 메시지 */
export function validateDosePair(
  amount: number | null | undefined,
  unit: string | null | undefined,
): string | null {
  const hasAmount = amount != null && Number.isFinite(amount);
  const hasUnit = Boolean(unit && String(unit).trim());
  if (hasAmount === hasUnit) {
    if (hasAmount && (amount as number) <= 0) return ERRORS.med.doseInvalid;
    return null;
  }
  return ERRORS.med.dosePairRequired;
}

/** DB insert/update용 snake_case 컬럼 */
export function toMedicationMetaColumns(meta: MedicationMetaInput) {
  const rawAmount = meta.doseAmount;
  const doseAmount =
    rawAmount == null || Number.isNaN(Number(rawAmount))
      ? null
      : Number(rawAmount);
  const doseUnit = meta.doseUnit?.trim() || null;
  const normalizedAmount =
    doseAmount != null && Number.isFinite(doseAmount) ? doseAmount : null;

  const pairErr = validateDosePair(normalizedAmount, doseUnit);
  if (pairErr) throw new Error(pairErr);

  return {
    item_seq: meta.itemSeq?.trim() || null,
    color: meta.color?.trim() || MED_COLOR_DEFAULT,
    efficacy: meta.efficacy?.trim() || null,
    use_method: meta.useMethod?.trim() || null,
    storage: meta.storage?.trim() || null,
    warning: meta.warning?.trim() || null,
    dose_amount: normalizedAmount,
    dose_unit: doseUnit,
  };
}
