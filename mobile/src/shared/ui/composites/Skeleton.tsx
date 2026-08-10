import { useEffect } from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { cn } from '@/shared/lib/cn';
import { motionMs } from '@/shared/lib/motion/motionMs';
import type { MotionsOfKind } from '@/shared/lib/motion/styles';
import { useResolvedMotionStyle } from '@/shared/lib/motion/useResolvedMotionStyle';

type Props = {
  className?: string;
  style?: StyleProp<ViewStyle>;
  /** false면 pulse 끔 (레거시) — motion={false} 권장 */
  pulse?: boolean;
  motion?: false | MotionsOfKind<'loop'>;
};

/**
 * 로딩 bone — empty(`Fallback`)와 별개.
 * fill: `bg-surface-soft` · pulse: skeletonPulse
 */
export function Skeleton({
  className,
  style,
  pulse = true,
  motion,
}: Props) {
  const { styleName, style: motionStyle } = useResolvedMotionStyle({
    component: 'skeleton',
    allowedKind: 'loop',
    motion,
  });
  const opacity = useSharedValue(1);
  const active = pulse && styleName !== 'none';
  const durationKey =
    motionStyle.kind === 'loop' ? motionStyle.duration : 'normal';
  const duration = motionMs(active, durationKey);

  useEffect(() => {
    if (!active || duration === 0) {
      opacity.value = 1;
      return;
    }
    opacity.value = withRepeat(
      withTiming(0.45, {
        duration,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true,
    );
    return () => {
      opacity.value = 1;
    };
  }, [opacity, active, duration]);

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
