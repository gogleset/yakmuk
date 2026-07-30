import { useEffect, useState, type ReactNode } from 'react';
import { AccessibilityInfo, type StyleProp, type ViewStyle } from 'react-native';
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

type Props = {
  children: ReactNode;
  /**
   * 순차 등장 비트 (0=copy, 1=media, 2=action…).
   * delayMs 미지정 시 `step * MOTION.stagger.stepMs`.
   */
  step?: number;
  /** 등장 딜레이(ms). 있으면 step보다 우선 */
  delayMs?: number;
  /** 페이드 길이 — stagger 화면은 보통 `fast` */
  duration?: MotionDuration;
  className?: string;
  style?: StyleProp<ViewStyle>;
};

/** 화면·블록 등장 — opacity + 살짝 위로 (design §10) */
export function FadeInView({
  children,
  step,
  delayMs,
  duration = 'normal',
  className,
  style,
}: Props) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(MOTION.offset.enterY as number);
  const [reduceMotion, setReduceMotion] = useState(false);
  const resolvedDelay =
    delayMs !== undefined
      ? delayMs
      : step !== undefined
        ? staggerDelay(step)
        : 0;
  const durationMs = MOTION.duration[duration];

  useEffect(() => {
    let cancelled = false;
    void AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (!cancelled) setReduceMotion(enabled);
    });
    const sub = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReduceMotion,
    );
    return () => {
      cancelled = true;
      sub.remove();
    };
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      opacity.value = 1;
      translateY.value = 0;
      return;
    }

    const easing = Easing.out(Easing.cubic);
    opacity.value = withDelay(
      resolvedDelay,
      withTiming(1, { duration: durationMs, easing }),
    );
    translateY.value = withDelay(
      resolvedDelay,
      withTiming(0, { duration: durationMs, easing }),
    );
  }, [reduceMotion, resolvedDelay, durationMs, opacity, translateY]);

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
