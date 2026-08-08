import {
  insetFromKeyboardEvent,
  metricsFromKeyboardEvent,
  sheetKeyboardLayout,
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
    expect(insetFromKeyboardEvent({ height: 300 }, { platform: 'ios' })).toBe(
      0,
    );
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

describe('sheetKeyboardLayout', () => {
  it('키보드 없으면 lift 0', () => {
    expect(
      sheetKeyboardLayout({
        keyboardHeight: 0,
        windowHeight: 800,
        screenHeight: 800,
      }),
    ).toEqual({ lift: 0, availableHeight: 800 });
  });

  it('adjustResize로 window가 줄면 lift 0', () => {
    expect(
      sheetKeyboardLayout({
        keyboardHeight: 300,
        windowHeight: 500,
        screenHeight: 800,
      }),
    ).toEqual({ lift: 0, availableHeight: 500 });
  });

  it('window가 안 줄면 시트를 키보드만큼 올림', () => {
    expect(
      sheetKeyboardLayout({
        keyboardHeight: 300,
        windowHeight: 780,
        screenHeight: 800,
      }),
    ).toEqual({ lift: 300, availableHeight: 500 });
  });
});
