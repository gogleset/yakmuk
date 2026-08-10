import { resolveMotionActive } from '@/shared/lib/motion/resolveMotionActive';

describe('resolveMotionActive', () => {
  it('all clear → true', () => {
    expect(
      resolveMotionActive({
        animationsEnabledUser: true,
        lowPowerMode: false,
        osReduceMotion: false,
      }),
    ).toBe(true);
  });

  it('user off → false', () => {
    expect(
      resolveMotionActive({
        animationsEnabledUser: false,
        lowPowerMode: false,
        osReduceMotion: false,
      }),
    ).toBe(false);
  });

  it('low power → false', () => {
    expect(
      resolveMotionActive({
        animationsEnabledUser: true,
        lowPowerMode: true,
        osReduceMotion: false,
      }),
    ).toBe(false);
  });

  it('os reduce → false', () => {
    expect(
      resolveMotionActive({
        animationsEnabledUser: true,
        lowPowerMode: false,
        osReduceMotion: true,
      }),
    ).toBe(false);
  });
});
