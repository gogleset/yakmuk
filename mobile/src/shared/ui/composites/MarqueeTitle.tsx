import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, View } from 'react-native';
import { useMotion } from '@/providers/MotionProvider';
import { cn } from '@/shared/lib/cn';
import {
  TitleLg,
  textRoleVariants,
  textToneVariants,
} from '@/shared/ui/primitives/Typography';

type Props = {
  text: string;
  className?: string;
  /** 한 방향 스크롤에 걸리는 시간 (넘칠 때만) */
  durationMs?: number;
  /** false면 루프 정지 */
  motion?: false;
};

/**
 * 긴 타이틀용 — 컨테이너보다 길면 좌우로 천천히 왕복.
 * 짧으면 그대로 표시. Gate/`motion={false}`로 루프 off.
 */
export function MarqueeTitle({
  text,
  className,
  durationMs = 4500,
  motion,
}: Props) {
  const { motionActive } = useMotion();
  const loopAllowed = motionActive && motion !== false;
  const [containerWidth, setContainerWidth] = useState(0);
  const [textWidth, setTextWidth] = useState(0);
  const offset = useRef(new Animated.Value(0)).current;

  const overflow = textWidth > containerWidth && containerWidth > 0;
  const travel = Math.max(0, textWidth - containerWidth + 8);

  useEffect(() => {
    offset.stopAnimation();
    offset.setValue(0);
    if (!loopAllowed || !overflow || travel <= 0) return;

    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(900),
        Animated.timing(offset, {
          toValue: -travel,
          duration: durationMs,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.delay(900),
        Animated.timing(offset, {
          toValue: 0,
          duration: durationMs,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => {
      loop.stop();
      offset.stopAnimation();
    };
  }, [loopAllowed, overflow, travel, durationMs, offset]);

  return (
    <View
      className="min-w-0 flex-1 overflow-hidden"
      onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
    >
      {/* 너비 측정용 (화면 밖) */}
      <TitleLg
        className={cn('absolute opacity-0', className)}
        onLayout={(e) => setTextWidth(e.nativeEvent.layout.width)}
      >
        {text}
      </TitleLg>
      {/* typography: Animated.Text must stay RN */}
      <Animated.Text
        numberOfLines={1}
        className={cn(
          textRoleVariants({ role: 'titleLg' }),
          textToneVariants({ tone: 'brand' }),
          className,
        )}
        style={
          overflow
            ? { transform: [{ translateX: offset }], width: textWidth }
            : undefined
        }
      >
        {text}
      </Animated.Text>
    </View>
  );
}
