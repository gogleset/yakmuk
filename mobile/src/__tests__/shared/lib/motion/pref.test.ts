import { parseMotionAnimationsEnabled } from '@/shared/lib/motion/pref';

describe('parseMotionAnimationsEnabled', () => {
  it('기본 ON', () => {
    expect(parseMotionAnimationsEnabled(null)).toBe(true);
    expect(parseMotionAnimationsEnabled(undefined)).toBe(true);
    expect(parseMotionAnimationsEnabled('1')).toBe(true);
  });

  it('off 값', () => {
    expect(parseMotionAnimationsEnabled('0')).toBe(false);
    expect(parseMotionAnimationsEnabled('false')).toBe(false);
    expect(parseMotionAnimationsEnabled('off')).toBe(false);
  });
});
