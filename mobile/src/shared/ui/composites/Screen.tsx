import {
  createContext,
  useContext,
  type ReactNode,
} from 'react';
import {
  ScrollView,
  SectionList,
  View,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ScrollViewProps,
  type SectionListProps,
  type ViewProps,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, LAYOUT } from '@/shared/config/theme';
import { FadeEdges } from '@/shared/ui/composites/FadeEdge';
import { useScrollFadeEdges } from '@/shared/ui/composites/useScrollFadeEdges';
import { cn } from '@/shared/lib/cn';

type FadeScrollContextValue = {
  onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  onScrollEnd: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  onLayout: (event: LayoutChangeEvent) => void;
  onContentSizeChange: (width: number, height: number) => void;
  scrollEventThrottle: number;
};

const ScreenFadeScrollContext = createContext<FadeScrollContextValue | null>(
  null,
);

function useScreenFadeScroll(): FadeScrollContextValue {
  const ctx = useContext(ScreenFadeScrollContext);
  return (
    ctx ?? {
      onScroll: () => undefined,
      onScrollEnd: () => undefined,
      onLayout: () => undefined,
      onContentSizeChange: () => undefined,
      scrollEventThrottle: 16,
    }
  );
}

/** Screen 안 ScrollView — FadeEdge와 스크롤 연동 */
export function ScreenScrollView({
  onScroll,
  onScrollEndDrag,
  onMomentumScrollEnd,
  onLayout,
  onContentSizeChange,
  scrollEventThrottle,
  ...rest
}: ScrollViewProps) {
  const fade = useScreenFadeScroll();
  return (
    <ScrollView
      {...rest}
      scrollEventThrottle={scrollEventThrottle ?? fade.scrollEventThrottle}
      onScroll={(event) => {
        fade.onScroll(event);
        onScroll?.(event);
      }}
      onScrollEndDrag={(event) => {
        fade.onScrollEnd(event);
        onScrollEndDrag?.(event);
      }}
      onMomentumScrollEnd={(event) => {
        fade.onScrollEnd(event);
        onMomentumScrollEnd?.(event);
      }}
      onLayout={(event) => {
        fade.onLayout(event);
        onLayout?.(event);
      }}
      onContentSizeChange={(w, h) => {
        fade.onContentSizeChange(w, h);
        onContentSizeChange?.(w, h);
      }}
    />
  );
}

/** Screen 안 SectionList — FadeEdge와 스크롤 연동 */
export function ScreenSectionList<ItemT, SectionT>(
  props: SectionListProps<ItemT, SectionT>,
) {
  const fade = useScreenFadeScroll();
  const {
    onScroll,
    onScrollEndDrag,
    onMomentumScrollEnd,
    onLayout,
    onContentSizeChange,
    scrollEventThrottle,
    ...rest
  } = props;
  return (
    <SectionList
      {...rest}
      scrollEventThrottle={scrollEventThrottle ?? fade.scrollEventThrottle}
      onScroll={(event) => {
        fade.onScroll(event);
        onScroll?.(event);
      }}
      onScrollEndDrag={(event) => {
        fade.onScrollEnd(event);
        onScrollEndDrag?.(event);
      }}
      onMomentumScrollEnd={(event) => {
        fade.onScrollEnd(event);
        onMomentumScrollEnd?.(event);
      }}
      onLayout={(event) => {
        fade.onLayout(event);
        onLayout?.(event);
      }}
      onContentSizeChange={(w, h) => {
        fade.onContentSizeChange(w, h);
        onContentSizeChange?.(w, h);
      }}
    />
  );
}

type Props = ViewProps & {
  className?: string;
  children: ReactNode;
  /** 상단 safe area 패딩 (기본 true — 탭 header 없음) */
  safeTop?: boolean;
  /** 상단 스크롤 fade — true면 기본 높이, number면 커스텀. 맨 위면 자동 숨김 */
  fadeTop?: boolean | number;
  /** 하단 스크롤 fade — 맨 아래면 자동 숨김 */
  fadeBottom?: boolean | number;
};

/** 캔버스 배경 스크린 래퍼 (+ 옵션 fade) */
export function Screen({
  className,
  children,
  safeTop = true,
  fadeTop = false,
  fadeBottom = false,
  style,
  ...rest
}: Props) {
  const insets = useSafeAreaInsets();
  const topPad = safeTop ? insets.top : 0;
  // safe area까지 포함해 상단 fade가 콘텐츠 위에서 보이도록
  const topFadeHeight =
    fadeTop === false
      ? 0
      : topPad +
        (typeof fadeTop === 'number' ? fadeTop : LAYOUT.fade.defaultTop);

  const trackTop = fadeTop !== false;
  const trackBottom = fadeBottom !== false;

  const {
    showTopFade,
    showBottomFade,
    onScroll,
    onScrollEnd,
    onLayout,
    onContentSizeChange,
    scrollEventThrottle,
  } = useScrollFadeEdges({
    top: trackTop,
    bottom: trackBottom,
  });

  const fadeScrollValue: FadeScrollContextValue = {
    onScroll,
    onScrollEnd,
    onLayout,
    onContentSizeChange,
    scrollEventThrottle,
  };

  return (
    <ScreenFadeScrollContext.Provider value={fadeScrollValue}>
      <View
        className={cn('flex-1 bg-canvas', className)}
        style={[{ backgroundColor: COLORS.canvas }, style]}
        {...rest}
      >
        <View className="flex-1" style={{ paddingTop: topPad }}>
          {children}
        </View>
        {trackTop || trackBottom ? (
          <FadeEdges
            top={trackTop && showTopFade ? topFadeHeight : false}
            bottom={
              trackBottom && showBottomFade
                ? typeof fadeBottom === 'number'
                  ? fadeBottom
                  : true
                : false
            }
          />
        ) : null}
      </View>
    </ScreenFadeScrollContext.Provider>
  );
}
