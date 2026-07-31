import {
  formatMedDose,
  resolveMedFormIconId,
} from '@/shared/constants/medDoseUnits';

describe('resolveMedFormIconId', () => {
  it('미설정·tablet·mg → 알약', () => {
    expect(resolveMedFormIconId(null)).toBe('tablet');
    expect(resolveMedFormIconId(undefined)).toBe('tablet');
    expect(resolveMedFormIconId('tablet')).toBe('tablet');
    expect(resolveMedFormIconId('mg')).toBe('tablet');
  });

  it('capsule → 캡슐', () => {
    expect(resolveMedFormIconId('capsule')).toBe('capsule');
  });

  it('packet·g → 가루', () => {
    expect(resolveMedFormIconId('packet')).toBe('powder');
    expect(resolveMedFormIconId('g')).toBe('powder');
  });

  it('ml·drop·spoon → 물약', () => {
    expect(resolveMedFormIconId('ml')).toBe('liquid');
    expect(resolveMedFormIconId('drop')).toBe('liquid');
    expect(resolveMedFormIconId('spoon')).toBe('liquid');
  });

  it('patch → 필름', () => {
    expect(resolveMedFormIconId('patch')).toBe('film');
  });

  it('알 수 없는 단위 → 알약', () => {
    expect(resolveMedFormIconId('unknown')).toBe('tablet');
  });
});

describe('formatMedDose', () => {
  it('둘 다 있을 때만 포맷', () => {
    expect(formatMedDose(1, 'tablet')).toBe('1정');
    expect(formatMedDose(5, 'ml')).toBe('5ml');
    expect(formatMedDose(null, 'tablet')).toBeNull();
    expect(formatMedDose(1, null)).toBeNull();
  });
});
