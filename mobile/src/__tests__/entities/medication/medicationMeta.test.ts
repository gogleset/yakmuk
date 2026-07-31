import {
  clampMedMetaText,
  parseDoseAmount,
  sanitizeDoseAmountInput,
  validateDosePair,
  validateMedicationMetaForm,
} from '@/entities/medication/lib/medicationMeta';
import { LIMITS } from '@/shared/constants/limits';
import { ERRORS } from '@/shared/copy';

describe('validateDosePair', () => {
  it('둘 다 없으면 OK', () => {
    expect(validateDosePair(null, null)).toBeNull();
  });

  it('둘 다 있으면 OK', () => {
    expect(validateDosePair(1, 'tablet')).toBeNull();
  });

  it('한쪽만 있으면 에러', () => {
    expect(validateDosePair(1, null)).toBe(ERRORS.med.dosePairRequired);
    expect(validateDosePair(null, 'tablet')).toBe(ERRORS.med.dosePairRequired);
  });

  it('0 이하는 무효', () => {
    expect(validateDosePair(0, 'tablet')).toBe(ERRORS.med.doseInvalid);
  });
});

describe('clampMedMetaText', () => {
  it('한도 초과면 자른다', () => {
    const long = '가'.repeat(LIMITS.medMetaMaxLength + 10);
    expect(clampMedMetaText(long).length).toBe(LIMITS.medMetaMaxLength);
  });
});

describe('sanitizeDoseAmountInput', () => {
  it('숫자·소수점만', () => {
    expect(sanitizeDoseAmountInput('12a.3b4')).toBe('12.34');
  });

  it('소수 둘째까지', () => {
    expect(sanitizeDoseAmountInput('1.234')).toBe('1.23');
  });
});

describe('validateMedicationMetaForm', () => {
  const empty = {
    efficacy: '',
    useMethod: '',
    storage: '',
    warning: '',
    doseAmount: '',
    doseUnit: null as string | null,
  };

  it('빈 메타 OK', () => {
    expect(validateMedicationMetaForm(empty)).toBeNull();
  });

  it('글자 수 초과', () => {
    expect(
      validateMedicationMetaForm({
        ...empty,
        efficacy: '가'.repeat(LIMITS.medMetaMaxLength + 1),
      }),
    ).toBe(ERRORS.med.metaTooLong);
  });

  it('용량 상한 초과', () => {
    expect(
      validateMedicationMetaForm({
        ...empty,
        doseAmount: String(LIMITS.medDoseAmountMax + 1),
        doseUnit: 'tablet',
      }),
    ).toBe(ERRORS.med.doseTooLarge);
  });

  it('용량만 있으면 pair 에러', () => {
    expect(
      validateMedicationMetaForm({
        ...empty,
        doseAmount: '1',
        doseUnit: null,
      }),
    ).toBe(ERRORS.med.dosePairRequired);
  });
});

describe('parseDoseAmount', () => {
  it('빈 문자열 null', () => {
    expect(parseDoseAmount('')).toBeNull();
  });

  it('숫자 파싱', () => {
    expect(parseDoseAmount('1.5')).toBe(1.5);
  });
});
