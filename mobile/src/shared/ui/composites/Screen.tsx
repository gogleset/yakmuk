import type { ReactNode } from 'react';
import { View, type ViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, LAYOUT } from '@/shared/config/theme';
import { FadeEdges } from '@/shared/ui/composites/FadeEdge';
import { cn } from '@/shared/lib/cn';

type Props = ViewProps & {
  className?: string;
  children: ReactNode;
  /** 상단 safe area 패딩 (기본 true — 탭 header 없음) */
  safeTop?: boolean;
  /** 상단 스크롤 fade — true면 기본 높이, number면 커스텀 */
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

  return (
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
          top={fadeTop === false ? false : topFadeHeight}
          bottom={fadeBottom}
        />
      ) : null}
    </View>
  );
}
