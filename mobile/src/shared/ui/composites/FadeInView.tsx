import { useEffect, useState, type ReactNode } from 'react';
import { AccessibilityInfo, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { MOTION } from '@/shared/constants';

type Props = {
  children: ReactNode;
  /** 등장 딜레이(ms). stagger용 */
  delayMs?: number;
  className?: string;
  style?: StyleProp<ViewStyle>;
};

/** 화면·블록 등장 — opacity + 살짝 위로 (design §7) */
export function FadeInView({
  children,
  delayMs = 0,
  className,
  style,
}: Props) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(MOTION.offset.enterY as number);
  const [reduceMotion, setReduceMotion] = useState(false);

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

    const duration = MOTION.duration.normal;
    const easing = Easing.out(Easing.cubic);
    opacity.value = withDelay(delayMs, withTiming(1, { duration, easing }));
    translateY.value = withDelay(delayMs, withTiming(0, { duration, easing }));
  }, [reduceMotion, delayMs, opacity, translateY]);

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
