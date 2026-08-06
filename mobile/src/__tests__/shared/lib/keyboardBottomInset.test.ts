import {
  insetFromKeyboardEvent,
  metricsFromKeyboardEvent,
} from '@/shared/lib/keyboardBottomInset';

describe('metricsFromKeyboardEvent', () => {
  it('height로 메트릭 추출', () => {
    expect(
      metricsFromKeyboardEvent({
        endCoordinates: { height: 320, screenX: 0, screenY: 400, width: 390 },
      }),
    ).toEqual({ height: 320 });
  });

  it('없거나 0·음수면 null', () => {
    expect(metricsFromKeyboardEvent(null)).toBeNull();
    expect(metricsFromKeyboardEvent(undefined)).toBeNull();
    expect(
      metricsFromKeyboardEvent({
        endCoordinates: { height: 0, screenX: 0, screenY: 0, width: 0 },
      }),
    ).toBeNull();
  });
});

describe('insetFromKeyboardEvent', () => {
  it('Android는 키보드 높이 반영', () => {
    expect(
      insetFromKeyboardEvent({ height: 280.7 }, { platform: 'android' }),
    ).toBe(281);
  });

  it('iOS 기본은 0 (KAV와 이중 방지)', () => {
    expect(
      insetFromKeyboardEvent({ height: 300 }, { platform: 'ios' }),
    ).toBe(0);
  });

  it('iOS applyOnIos=true면 높이 사용', () => {
    expect(
      insetFromKeyboardEvent(
        { height: 300 },
        { platform: 'ios', applyOnIos: true },
      ),
    ).toBe(300);
  });

  it('메트릭 없으면 0', () => {
    expect(insetFromKeyboardEvent(null, { platform: 'android' })).toBe(0);
    expect(insetFromKeyboardEvent({ height: 0 }, { platform: 'android' })).toBe(
      0,
    );
  });
});
