import { scrollYToRevealField } from '@/shared/lib/scrollToRevealField';

describe('scrollYToRevealField', () => {
  const base = {
    fieldHeight: 48,
    viewportHeight: 400,
    keyboardInset: 0,
    footerHeight: 0,
    currentScrollY: 0,
    gap: 12,
  };

  it('이미 보이면 null', () => {
    expect(
      scrollYToRevealField({
        ...base,
        fieldY: 100,
      }),
    ).toBeNull();
  });

  it('하단이 잘리면 아래로 스크롤', () => {
    // available = 400 - 12 = 388; fieldBottom = 420 → target = 420 - 388 = 32
    expect(
      scrollYToRevealField({
        ...base,
        fieldY: 372,
        fieldHeight: 48,
      }),
    ).toBe(32);
  });

  it('keyboardInset·footer만큼 가용 높이 감소', () => {
    // available = 400 - 200 - 40 - 12 = 148; fieldBottom = 300 → target = 152
    expect(
      scrollYToRevealField({
        ...base,
        fieldY: 252,
        fieldHeight: 48,
        keyboardInset: 200,
        footerHeight: 40,
      }),
    ).toBe(152);
  });

  it('상단이 잘리면 위로 스크롤', () => {
    expect(
      scrollYToRevealField({
        ...base,
        fieldY: 50,
        currentScrollY: 100,
      }),
    ).toBe(38); // fieldY - gap
  });

  it('viewport 비정상이면 null', () => {
    expect(
      scrollYToRevealField({
        ...base,
        viewportHeight: 0,
        fieldY: 500,
      }),
    ).toBeNull();
  });
});
