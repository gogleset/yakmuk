import { useEffect } from 'react';
import {
  AccessibilityInfo,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { MOTION } from '@/shared/constants/motion';
import { cn } from '@/shared/lib/cn';

type Props = {
  className?: string;
  style?: StyleProp<ViewStyle>;
  /** 접근성 — 기본 true면 reduce-motion 시 pulse 끔 */
  pulse?: boolean;
};

/**
 * 로딩 bone — empty(`Fallback`)와 별개.
 * fill: `bg-surface-soft` · pulse: MOTION.duration.normal
 */
export function Skeleton({ className, style, pulse = true }: Props) {
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (!pulse) return;
    let cancelled = false;
    void AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
      if (cancelled || reduce) return;
      opacity.value = withRepeat(
        withTiming(0.45, {
          duration: MOTION.duration.normal,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true,
      );
    });
    return () => {
      cancelled = true;
    };
  }, [opacity, pulse]);

  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      className={cn('rounded-xl bg-surface-soft', className)}
      style={[animStyle, style]}
    />
  );
}
