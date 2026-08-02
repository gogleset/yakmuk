import {
  SCROLL_FADE_SLACK,
  computeScrollFadeVisibility,
} from '@/shared/ui/composites/useScrollFadeEdges';

describe('computeScrollFadeVisibility', () => {
  it('레이아웃 없으면 둘 다 숨김', () => {
    expect(
      computeScrollFadeVisibility({
        offsetY: 0,
        layoutHeight: 0,
        contentHeight: 500,
      }),
    ).toEqual({ showTop: false, showBottom: false });
  });

  it('스크롤 불필요면 둘 다 숨김', () => {
    expect(
      computeScrollFadeVisibility({
        offsetY: 0,
        layoutHeight: 400,
        contentHeight: 300,
      }),
    ).toEqual({ showTop: false, showBottom: false });
  });

  it('맨 위 — top 숨김 · bottom 표시', () => {
    expect(
      computeScrollFadeVisibility({
        offsetY: 0,
        layoutHeight: 200,
        contentHeight: 600,
      }),
    ).toEqual({ showTop: false, showBottom: true });
  });

  it('맨 아래 — bottom 숨김 · top 표시', () => {
    expect(
      computeScrollFadeVisibility({
        offsetY: 400,
        layoutHeight: 200,
        contentHeight: 600,
      }),
    ).toEqual({ showTop: true, showBottom: false });
  });

  it('중간 — 둘 다 표시', () => {
    expect(
      computeScrollFadeVisibility({
        offsetY: 100,
        layoutHeight: 200,
        contentHeight: 600,
      }),
    ).toEqual({ showTop: true, showBottom: true });
  });

  it('slack 이내면 top으로 간주', () => {
    expect(
      computeScrollFadeVisibility({
        offsetY: SCROLL_FADE_SLACK,
        layoutHeight: 200,
        contentHeight: 600,
      }),
    ).toEqual({ showTop: false, showBottom: true });
  });

  it('insetTop 있으면 시각적 맨 위 보정', () => {
    // offsetY=-44 + insetTop=44 → visual 0 → top 숨김
    expect(
      computeScrollFadeVisibility({
        offsetY: -44,
        layoutHeight: 200,
        contentHeight: 600,
        insetTop: 44,
      }),
    ).toEqual({ showTop: false, showBottom: true });
  });

  it('trackTop false면 top 항상 숨김', () => {
    expect(
      computeScrollFadeVisibility({
        offsetY: 100,
        layoutHeight: 200,
        contentHeight: 600,
        trackTop: false,
      }),
    ).toEqual({ showTop: false, showBottom: true });
  });
});
