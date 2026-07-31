import { MED_COLOR_DEFAULT } from '@/shared/constants/medColors';
import { LIMITS } from '@/shared/constants/limits';
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

/** 폼 상태용 — 문자열 doseAmount */
export type MedicationMetaFormFields = {
  efficacy: string;
  useMethod: string;
  storage: string;
  warning: string;
  doseAmount: string;
  doseUnit: string | null;
};

/** 메타 텍스트 글자 수 클램프 (검색 붙여넣기 등) */
export function clampMedMetaText(value: string | null | undefined): string {
  return (value ?? '').slice(0, LIMITS.medMetaMaxLength);
}

/** 용량 입력 — 숫자·소수점만, 정수/소수 자릿수 제한 */
export function sanitizeDoseAmountInput(raw: string): string {
  const cleaned = raw.replace(/[^0-9.]/g, '');
  if (!cleaned) return '';
  const dot = cleaned.indexOf('.');
  const maxIntLen = String(LIMITS.medDoseAmountMax).length;
  if (dot < 0) return cleaned.slice(0, maxIntLen);
  const intPart = cleaned.slice(0, dot).slice(0, maxIntLen);
  const fracPart = cleaned
    .slice(dot + 1)
    .replace(/\./g, '')
    .slice(0, 2);
  return `${intPart}.${fracPart}`;
}

export function parseDoseAmount(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : null;
}

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

/** 메타 폼 전체 유효성 — 글자수 · 용량 상한 · dose pair */
export function validateMedicationMetaForm(
  meta: MedicationMetaFormFields,
): string | null {
  const texts = [meta.efficacy, meta.useMethod, meta.storage, meta.warning];
  for (const text of texts) {
    if (text.length > LIMITS.medMetaMaxLength) return ERRORS.med.metaTooLong;
  }

  const amount = parseDoseAmount(meta.doseAmount);
  if (amount != null) {
    if (amount <= 0) return ERRORS.med.doseInvalid;
    if (amount > LIMITS.medDoseAmountMax) return ERRORS.med.doseTooLarge;
  }

  return validateDosePair(amount, meta.doseUnit);
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

  if (
    normalizedAmount != null &&
    (normalizedAmount <= 0 || normalizedAmount > LIMITS.medDoseAmountMax)
  ) {
    throw new Error(
      normalizedAmount > LIMITS.medDoseAmountMax
        ? ERRORS.med.doseTooLarge
        : ERRORS.med.doseInvalid,
    );
  }

  const pairErr = validateDosePair(normalizedAmount, doseUnit);
  if (pairErr) throw new Error(pairErr);

  const efficacy = clampMedMetaText(meta.efficacy?.trim() || '');
  const useMethod = clampMedMetaText(meta.useMethod?.trim() || '');
  const storage = clampMedMetaText(meta.storage?.trim() || '');
  const warning = clampMedMetaText(meta.warning?.trim() || '');

  return {
    item_seq: meta.itemSeq?.trim() || null,
    color: meta.color?.trim() || MED_COLOR_DEFAULT,
    efficacy: efficacy || null,
    use_method: useMethod || null,
    storage: storage || null,
    warning: warning || null,
    dose_amount: normalizedAmount,
    dose_unit: doseUnit,
  };
}
