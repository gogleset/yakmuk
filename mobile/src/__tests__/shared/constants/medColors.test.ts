import {
  medColorSoftFill,
  resolveMedColorHex,
} from '@/shared/constants/medColors';

describe('medColorSoftFill', () => {
  it('설정색 hex를 흐린 rgba로', () => {
    const hex = resolveMedColorHex('coral');
    expect(hex).toBe('#C46B5A');
    expect(medColorSoftFill('coral', 0.2)).toBe('rgba(196, 107, 90, 0.2)');
  });

  it('기본 alpha 0.2', () => {
    expect(medColorSoftFill('teal')).toBe('rgba(77, 134, 121, 0.2)');
  });
});
