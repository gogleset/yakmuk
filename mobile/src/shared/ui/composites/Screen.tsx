import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react';
import {
  ScrollView,
  SectionList,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ScrollViewProps,
  type SectionListProps,
  type ViewProps,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, LAYOUT } from '@/shared/config/theme';
import { FadeEdges } from '@/shared/ui/composites/FadeEdge';
import { cn } from '@/shared/lib/cn';

type FadeScrollContextValue = {
  /** 맨 위면 상단 fade 해제 */
  onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  scrollEventThrottle: number;
};

const ScreenFadeScrollContext = createContext<FadeScrollContextValue | null>(
  null,
);

/** 이 이상 스크롤해야 상단 fade 표시 (터치 지터 방지) */
const TOP_FADE_SHOW_AFTER_Y = 8;

function useScreenFadeScroll(): FadeScrollContextValue {
  const ctx = useContext(ScreenFadeScrollContext);
  return (
    ctx ?? {
      onScroll: () => undefined,
      scrollEventThrottle: 16,
    }
  );
}

/** Screen 안 ScrollView — fadeTop과 스크롤 연동 */
export function ScreenScrollView({
  onScroll,
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
    />
  );
}

/** Screen 안 SectionList — fadeTop과 스크롤 연동 */
export function ScreenSectionList<ItemT, SectionT>(
  props: SectionListProps<ItemT, SectionT>,
) {
  const fade = useScreenFadeScroll();
  const { onScroll, scrollEventThrottle, ...rest } = props;
  return (
    <SectionList
      {...rest}
      scrollEventThrottle={scrollEventThrottle ?? fade.scrollEventThrottle}
      onScroll={(event) => {
        fade.onScroll(event);
        onScroll?.(event);
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
  /** 하단 스크롤 fade */
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

  // 맨 위(y≈0)면 상단 fade 끔 — Android elevation이 헤더를 가리는 문제 방지
  const [topFadeVisible, setTopFadeVisible] = useState(false);

  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (fadeTop === false) return;
      const y = event.nativeEvent.contentOffset.y;
      const next = y > TOP_FADE_SHOW_AFTER_Y;
      setTopFadeVisible((prev) => (prev === next ? prev : next));
    },
    [fadeTop],
  );

  const fadeScrollValue: FadeScrollContextValue = {
    onScroll,
    scrollEventThrottle: 16,
  };

  const showTopFade = fadeTop !== false && topFadeVisible;

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
        {fadeTop || fadeBottom ? (
          <FadeEdges
            top={showTopFade ? topFadeHeight : false}
            bottom={fadeBottom}
          />
        ) : null}
      </View>
    </ScreenFadeScrollContext.Provider>
  );
}
