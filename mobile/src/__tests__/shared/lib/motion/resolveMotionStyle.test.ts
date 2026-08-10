import { resolveMotionStyle } from '@/shared/lib/motion/resolveMotionStyle';
import { motionMs } from '@/shared/lib/motion/motionMs';
import { MOTION } from '@/shared/constants/motion';

describe('resolveMotionStyle', () => {
  it('gate off → none', () => {
    expect(
      resolveMotionStyle({
        motionActive: false,
        motionProp: 'press',
        componentDefault: 'press',
        allowedKind: 'press',
      }),
    ).toBe('none');
  });

  it('motion false → none', () => {
    expect(
      resolveMotionStyle({
        motionActive: true,
        motionProp: false,
        componentDefault: 'press',
        allowedKind: 'press',
      }),
    ).toBe('none');
  });

  it('omit prop → componentDefault', () => {
    expect(
      resolveMotionStyle({
        motionActive: true,
        motionProp: undefined,
        componentDefault: 'enterFade',
        allowedKind: 'enter',
      }),
    ).toBe('enterFade');
  });

  it('kind mismatch → default + warn', () => {
    const onKindMismatch = jest.fn();
    expect(
      resolveMotionStyle({
        motionActive: true,
        motionProp: 'press',
        componentDefault: 'enterFade',
        allowedKind: 'enter',
        onKindMismatch,
      }),
    ).toBe('enterFade');
    expect(onKindMismatch).toHaveBeenCalledWith('press', 'enter');
  });

  it('valid override', () => {
    expect(
      resolveMotionStyle({
        motionActive: true,
        motionProp: 'press',
        componentDefault: 'press',
        allowedKind: 'press',
      }),
    ).toBe('press');
  });
});

describe('motionMs', () => {
  it('active → MOTION.duration', () => {
    expect(motionMs(true, 'normal')).toBe(MOTION.duration.normal);
  });

  it('inactive → 0', () => {
    expect(motionMs(false, 'normal')).toBe(0);
  });
});
