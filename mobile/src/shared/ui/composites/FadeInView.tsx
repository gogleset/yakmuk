import { useEffect, type ReactNode } from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import {
  MOTION,
  staggerDelay,
  type MotionDuration,
} from '@/shared/constants/motion';
import { motionMs } from '@/shared/lib/motion/motionMs';
import type { MotionsOfKind } from '@/shared/lib/motion/styles';
import { useResolvedMotionStyle } from '@/shared/lib/motion/useResolvedMotionStyle';

type Props = {
  children: ReactNode;
  /**
   * 순차 등장 비트 (0=copy, 1=media, 2=action…).
   * delayMs 미지정 시 `step * MOTION.stagger.stepMs`.
   */
  step?: number;
  /** 등장 딜레이(ms). 있으면 step보다 우선 */
  delayMs?: number;
  /**
   * 페이드 길이 호환 — style은 enterFade, duration 키만 오버라이드.
   * stagger 화면은 보통 `fast`.
   */
  duration?: MotionDuration;
  motion?: false | MotionsOfKind<'enter'>;
  className?: string;
  style?: StyleProp<ViewStyle>;
};

/** 화면·블록 등장 — opacity + 살짝 위로 (design/motion.md) */
export function FadeInView({
  children,
  step,
  delayMs,
  duration = 'normal',
  motion,
  className,
  style,
}: Props) {
  const { style: motionStyle, styleName } = useResolvedMotionStyle({
    component: 'fadeInView',
    allowedKind: 'enter',
    motion,
  });

  const enterY =
    motionStyle.kind === 'enter' ? motionStyle.enterY : MOTION.offset.enterY;
  const styleDuration =
    motionStyle.kind === 'enter' ? motionStyle.duration : 'normal';
  const durationKey = duration !== 'normal' ? duration : styleDuration;
  const active = styleName !== 'none';

  const opacity = useSharedValue(active ? 0 : 1);
  const translateY = useSharedValue(active ? enterY : 0);
  const resolvedDelay =
    delayMs !== undefined
      ? delayMs
      : step !== undefined
        ? staggerDelay(step)
        : 0;
  const durationMs = motionMs(active, durationKey);

  useEffect(() => {
    if (!active) {
      opacity.value = 1;
      translateY.value = 0;
      return;
    }

    opacity.value = 0;
    translateY.value = enterY;
    const easing = Easing.out(Easing.cubic);
    opacity.value = withDelay(
      resolvedDelay,
      withTiming(1, { duration: durationMs, easing }),
    );
    translateY.value = withDelay(
      resolvedDelay,
      withTiming(0, { duration: durationMs, easing }),
    );
  }, [active, resolvedDelay, durationMs, enterY, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View className={className} style={[animatedStyle, style]}>
      {children}
    </Animated.View>
  );
}
