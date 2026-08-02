import { useCallback, useRef, useState } from 'react';
import type {
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';

/** 스크롤 끝 판정 여유 — 터치 지터 방지 */
export const SCROLL_FADE_SLACK = 8;

export type ScrollFadeVisibility = {
  showTop: boolean;
  showBottom: boolean;
};

type ScrollMetrics = {
  offsetY: number;
  layoutHeight: number;
  contentHeight: number;
  insetTop: number;
  insetBottom: number;
};

function readInsets(event: NativeSyntheticEvent<NativeScrollEvent>): {
  insetTop: number;
  insetBottom: number;
} {
  const native = event.nativeEvent as NativeScrollEvent & {
    adjustedContentInset?: { top?: number; bottom?: number };
  };
  const adjusted = native.adjustedContentInset;
  const inset = native.contentInset;
  return {
    insetTop: adjusted?.top ?? inset?.top ?? 0,
    insetBottom: adjusted?.bottom ?? inset?.bottom ?? 0,
  };
}

/** 순수 계산 — 테스트·훅 공용 */
export function computeScrollFadeVisibility(input: {
  offsetY: number;
  layoutHeight: number;
  contentHeight: number;
  slack?: number;
  trackTop?: boolean;
  trackBottom?: boolean;
  insetTop?: number;
  insetBottom?: number;
}): ScrollFadeVisibility {
  const slack = input.slack ?? SCROLL_FADE_SLACK;
  const trackTop = input.trackTop !== false;
  const trackBottom = input.trackBottom !== false;
  const insetTop = input.insetTop ?? 0;
  const insetBottom = input.insetBottom ?? 0;
  const { offsetY, layoutHeight, contentHeight } = input;

  if (layoutHeight <= 0) {
    return { showTop: false, showBottom: false };
  }

  // inset 보정 — 시각적 맨 위/아래 (iOS adjustedContentInset)
  const atTop = offsetY + insetTop <= slack;
  const atBottom =
    offsetY + layoutHeight >= contentHeight - insetBottom - slack;
  const canScroll =
    contentHeight - insetTop - insetBottom > layoutHeight + slack;

  return {
    showTop: trackTop && canScroll && !atTop,
    showBottom: trackBottom && canScroll && !atBottom,
  };
}

type Options = {
  slack?: number;
  /** 상단 fade 추적 (기본 true) */
  top?: boolean;
  /** 하단 fade 추적 (기본 true) */
  bottom?: boolean;
};

/**
 * ScrollView FadeEdge 표시 — 맨 위/아래면 해당 쪽 fade 숨김.
 * onScroll · onScrollEnd · onLayout · onContentSizeChange를 ScrollView에 연결.
 */
export function useScrollFadeEdges(options: Options = {}) {
  const slack = options.slack ?? SCROLL_FADE_SLACK;
  const trackTop = options.top !== false;
  const trackBottom = options.bottom !== false;

  const [showTopFade, setShowTopFade] = useState(false);
  const [showBottomFade, setShowBottomFade] = useState(false);

  const metrics = useRef<ScrollMetrics>({
    offsetY: 0,
    layoutHeight: 0,
    contentHeight: 0,
    insetTop: 0,
    insetBottom: 0,
  });

  const sync = useCallback(() => {
    const m = metrics.current;
    const next = computeScrollFadeVisibility({
      offsetY: m.offsetY,
      layoutHeight: m.layoutHeight,
      contentHeight: m.contentHeight,
      slack,
      trackTop,
      trackBottom,
      insetTop: m.insetTop,
      insetBottom: m.insetBottom,
    });
    setShowTopFade((prev) => (prev === next.showTop ? prev : next.showTop));
    setShowBottomFade((prev) =>
      prev === next.showBottom ? prev : next.showBottom,
    );
  }, [slack, trackTop, trackBottom]);

  const applyScrollEvent = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { contentOffset, layoutMeasurement, contentSize } =
        event.nativeEvent;
      const insets = readInsets(event);
      metrics.current = {
        offsetY: contentOffset.y,
        layoutHeight: layoutMeasurement.height,
        contentHeight: contentSize.height,
        insetTop: insets.insetTop,
        insetBottom: insets.insetBottom,
      };
      sync();
    },
    [sync],
  );

  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      applyScrollEvent(event);
    },
    [applyScrollEvent],
  );

  /** 관성/드래그 종료 시 한 번 더 — 탑 복귀 시 offset 미갱신 보정 */
  const onScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      applyScrollEvent(event);
    },
    [applyScrollEvent],
  );

  const onLayout = useCallback(
    (event: LayoutChangeEvent) => {
      metrics.current.layoutHeight = event.nativeEvent.layout.height;
      sync();
    },
    [sync],
  );

  const onContentSizeChange = useCallback(
    (_width: number, height: number) => {
      metrics.current.contentHeight = height;
      sync();
    },
    [sync],
  );

  return {
    showTopFade,
    showBottomFade,
    onScroll,
    onScrollEnd,
    onLayout,
    onContentSizeChange,
    scrollEventThrottle: 16 as const,
  };
}
