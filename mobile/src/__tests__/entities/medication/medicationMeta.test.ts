import { validateDosePair } from '@/entities/medication/lib/medicationMeta';
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
