import { type ReactNode } from 'react';
import {
  Pressable,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { MOTION } from '@/shared/constants';
import { motionMs } from '@/shared/lib/motion/motionMs';
import type { MotionsOfKind } from '@/shared/lib/motion/styles';
import { useResolvedMotionStyle } from '@/shared/lib/motion/useResolvedMotionStyle';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = Omit<PressableProps, 'style'> & {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  className?: string;
  motion?: false | MotionsOfKind<'press'>;
};

/** 탭 시 살짝 줄어드는 press feedback */
export function PressableScale({
  children,
  onPressIn,
  onPressOut,
  disabled,
  style,
  className,
  motion,
  ...rest
}: Props) {
  const { style: motionStyle, styleName } = useResolvedMotionStyle({
    component: 'pressableScale',
    allowedKind: 'press',
    motion,
  });
  const scale = useSharedValue(1);
  const active = styleName !== 'none';
  const pressScale =
    motionStyle.kind === 'press' ? motionStyle.scale : MOTION.press.scale;
  const durationKey =
    motionStyle.kind === 'press' ? motionStyle.duration : 'instant';
  const duration = motionMs(active, durationKey);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      accessibilityRole="button"
      disabled={disabled}
      className={className}
      style={[animatedStyle, style]}
      onPressIn={(e) => {
        if (active && !disabled) {
          scale.value = withTiming(pressScale, {
            duration,
            easing: Easing.out(Easing.quad),
          });
        }
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        if (active) {
          scale.value = withTiming(1, {
            duration,
            easing: Easing.out(Easing.quad),
          });
        }
        onPressOut?.(e);
      }}
      {...rest}
    >
      {children}
    </AnimatedPressable>
  );
}
