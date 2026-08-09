import { useEffect, useState } from 'react';
import {
  AccessibilityInfo,
  Pressable,
  StyleSheet,
  View,
  type LayoutChangeEvent,
} from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import type { DailyLog } from '@/entities/medication/model/types';
import { COLORS, LAYOUT } from '@/shared/config/theme';
import { MOTION } from '@/shared/constants';
import { COPY } from '@/shared/copy';
import { Caption, Icons } from '@/shared/ui';
import { FamilyActivityFeedItem } from './FamilyActivityFeed';
import { FamilyFeedDayHeader } from './FamilyFeedDayHeader';

type Props = {
  /** 날짜 헤더 — 오늘 / 어제 / 날짜 */
  title: string;
  items: DailyLog[];
  onItemPress?: (userId: string, nickname: string | null) => void;
};

const BLIND_EASING = Easing.out(Easing.cubic);

/** 뒤 레이어 peek — 앞 카드 아래로 살짝 비치는 iOS 알림 스택 */
function StackPeeks({ count }: { count: number }) {
  const { peekOffset, peekInset } = LAYOUT.feedStack;
  return (
    <>
      {Array.from({ length: count }, (_, index) => {
        const depth = count - index;
        return (
          <View
            key={depth}
            pointerEvents="none"
            className="absolute rounded-xl bg-surface"
            style={[
              LAYOUT.shadow.sameFill,
              {
                left: depth * peekInset,
                right: depth * peekInset,
                top: depth * peekOffset,
                bottom: -depth * peekOffset,
                zIndex: count - depth,
              },
            ]}
          />
        );
      })}
    </>
  );
}

/**
 * 날짜 그룹 피드 — 2개+면 스택.
 * 펼침 = 높이 블라인드 (fade 없음 · 트리 유지).
 */
export function FamilyActivityFeedStack({
  title,
  items,
  onItemPress,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  /** 접힘·애니메이션 중만 clip — 펼침 완료 후 visible이라 카드 shadow 안 잘림 */
  const [clipBlind, setClipBlind] = useState(true);
  const canStack = items.length > 1;
  const peekCount = canStack
    ? Math.min(LAYOUT.feedStack.peekCount, items.length - 1)
    : 0;

  const chevronRotation = useSharedValue(0);
  const firstHeight = useSharedValue(0);
  const fullHeight = useSharedValue(0);
  const blindHeight = useSharedValue(0);
  const hasMeasured = useSharedValue(0);
  /** 1=접힘(peek), 0=펼침 */
  const peekReveal = useSharedValue(1);

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

  const itemsKey = items.map((item) => item.id).join(',');
  useEffect(() => {
    // 접힘 UI만 리셋. height를 0으로 지우면 onLayout이 이미 지난 뒤라
    // 재측정이 안 되고 animateBlindTo가 early-return → chevron 펼침 불가
    setExpanded(false);
    setClipBlind(true);
    chevronRotation.value = 0;
    peekReveal.value = 1;
    if (firstHeight.value > 0) {
      blindHeight.value = firstHeight.value;
    }
  }, [itemsKey, chevronRotation, peekReveal, firstHeight, blindHeight]);

  const animateBlindTo = (nextExpanded: boolean) => {
    const collapsed = firstHeight.value;
    const opened = fullHeight.value;
    if (collapsed <= 0 || opened <= 0) return;

    // 접을 땐 바로 clip — 펼침 중 아래 카드가 비치지 않게
    if (!nextExpanded) setClipBlind(true);

    const duration = reduceMotion ? 0 : MOTION.duration.normal;
    const target = nextExpanded ? opened : collapsed;

    if (duration === 0) {
      blindHeight.value = target;
      peekReveal.value = nextExpanded ? 0 : 1;
      chevronRotation.value = nextExpanded ? 180 : 0;
      if (nextExpanded) setClipBlind(false);
      return;
    }

    blindHeight.value = withTiming(
      target,
      { duration, easing: BLIND_EASING },
      (finished) => {
        // 펼침 끝나면 overflow visible → 각 카드 sameFill shadow 노출
        if (finished && nextExpanded) {
          runOnJS(setClipBlind)(false);
        }
      },
    );
    peekReveal.value = withTiming(nextExpanded ? 0 : 1, {
      duration,
      easing: BLIND_EASING,
    });
    chevronRotation.value = withTiming(nextExpanded ? 180 : 0, {
      duration: MOTION.duration.fast,
      easing: BLIND_EASING,
    });
  };

  const onFirstCardLayout = (event: LayoutChangeEvent) => {
    const height = event.nativeEvent.layout.height;
    if (height <= 0) return;
    firstHeight.value = height;
    if (hasMeasured.value === 0) {
      blindHeight.value = height;
      if (fullHeight.value > 0) hasMeasured.value = 1;
    } else if (!expanded) {
      blindHeight.value = height;
    }
  };

  const onContentLayout = (event: LayoutChangeEvent) => {
    const height = event.nativeEvent.layout.height;
    if (height <= 0) return;
    fullHeight.value = height;
    if (hasMeasured.value === 0) {
      if (firstHeight.value > 0) {
        blindHeight.value = expanded ? height : firstHeight.value;
        hasMeasured.value = 1;
      }
    } else if (expanded) {
      blindHeight.value = height;
    }
  };

  const toggle = () => {
    if (!canStack) return;
    const next = !expanded;
    setExpanded(next);
    animateBlindTo(next);
  };

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${chevronRotation.value}deg` }],
  }));

  const blindStyle = useAnimatedStyle(() => {
    if (hasMeasured.value === 0 && blindHeight.value <= 0) {
      return { zIndex: 2 };
    }
    return {
      height: blindHeight.value,
      zIndex: 2,
    };
  });

  const peekMarginStyle = useAnimatedStyle(() => ({
    marginBottom:
      peekCount * LAYOUT.feedStack.peekOffset * peekReveal.value,
  }));

  /**
   * absoluteFill이면 블라인드 펼침과 함께 높이가 늘어나고,
   * Android elevation은 opacity 0이어도 긴 그림자로 남음 → 첫 카드 높이에 고정.
   */
  const peekLayerStyle = useAnimatedStyle(() => {
    const base = firstHeight.value;
    const peekExtra = peekCount * LAYOUT.feedStack.peekOffset;
    return {
      opacity: peekReveal.value,
      height: base > 0 ? base + peekExtra : undefined,
    };
  });

  if (items.length === 0) return null;

  if (!canStack) {
    return (
      <View className="gap-2.5">
        <FamilyFeedDayHeader title={title} />
        <FamilyActivityFeedItem item={items[0]!} onPress={onItemPress} />
      </View>
    );
  }

  return (
    <View className="gap-2.5">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          expanded
            ? COPY.family.feedStackCollapseA11y(title)
            : COPY.family.feedStackExpandA11y(title, items.length)
        }
        onPress={toggle}
        className="flex-row items-center justify-between pb-1 pt-1.5"
        hitSlop={LAYOUT.hitSlop.sm}
      >
        <Caption className="font-bold">{title}</Caption>
        <Animated.View style={chevronStyle}>
          <Icons.ChevronDown size={LAYOUT.icon.sm} color={COLORS.muted} />
        </Animated.View>
      </Pressable>

      {/* 트리 유지 — 높이만 블라인드로 열고 닫음 */}
      <Animated.View style={peekMarginStyle}>
        {/* 펼침 완료 후 unmount — Android elevation ghost 방지 */}
        {clipBlind || !expanded ? (
          <Animated.View
            pointerEvents="none"
            style={[
              peekLayerStyle,
              { position: 'absolute', left: 0, right: 0, top: 0, zIndex: 0 },
            ]}
          >
            <StackPeeks count={peekCount} />
          </Animated.View>
        ) : null}

        <Animated.View
          style={[
            blindStyle,
            // 접힘·애니 중 clip / 펼침 완료 후 visible (카드 shadow 유지)
            { overflow: clipBlind ? 'hidden' : 'visible' },
          ]}
        >
          <View className="gap-2.5" onLayout={onContentLayout}>
            {items.map((item, index) => (
              <View
                key={item.id}
                onLayout={index === 0 ? onFirstCardLayout : undefined}
              >
                <FamilyActivityFeedItem
                  item={item}
                  onPress={expanded ? onItemPress : undefined}
                />
              </View>
            ))}
          </View>
        </Animated.View>

        {/* 접힌 때만 전체 탭 → 펼침 (아이템 press 가로채기) */}
        {!expanded ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={COPY.family.feedStackExpandA11y(
              title,
              items.length,
            )}
            onPress={toggle}
            style={[StyleSheet.absoluteFill, { zIndex: 3 }]}
          />
        ) : null}
      </Animated.View>
    </View>
  );
}
