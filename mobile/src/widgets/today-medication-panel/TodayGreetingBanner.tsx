import { useEffect, useRef, useState } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  Text,
  View,
} from 'react-native';
import type { ConditionValue } from '@/entities/medication/model/types';
import { CONDITION_LABEL } from '@/entities/medication/lib/display';
import { COLORS, LIMITS } from '@/shared/config/theme';
import { COPY } from '@/shared/copy';
import { cn } from '@/shared/lib/cn';
import { KokiIllustration, type KokiVariant } from '@/shared/ui';

function kokiForCondition(value: ConditionValue): KokiVariant {
  if (value === 'GOOD') return 'happy';
  if (value === 'BAD') return 'worried';
  return 'thinking';
}

type Props = {
  allDone: boolean;
  savedCondition?: ConditionValue | null;
  savedMessage?: string | null;
};

/**
 * 오늘 인사 배너.
 * 컨디션을 남겼으면 완료 인사 ↔ 컨디션을 가로 슬라이드 (스와이프 · 5초 자동).
 */
export function TodayGreetingBanner({
  allDone,
  savedCondition = null,
  savedMessage = null,
}: Props) {
  const scrollRef = useRef<ScrollView>(null);
  const [bannerWidth, setBannerWidth] = useState(0);
  const [page, setPage] = useState(0);
  const pageRef = useRef(0);
  pageRef.current = page;

  const showCarousel = Boolean(savedCondition);
  const pageCount = showCarousel ? 2 : 1;

  const goToPage = (next: number, animated = true) => {
    if (bannerWidth <= 0) return;
    const clamped = ((next % pageCount) + pageCount) % pageCount;
    scrollRef.current?.scrollTo({
      x: clamped * bannerWidth,
      animated,
    });
    setPage(clamped);
  };

  // 5초마다 다음 페이지 (유저가 스와이프해도 interval이 이어서 넘김)
  useEffect(() => {
    if (!showCarousel || bannerWidth <= 0) return;
    const id = setInterval(() => {
      goToPage(pageRef.current + 1);
    }, LIMITS.todayBannerAutoAdvanceMs);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- goToPage는 width/pageCount에 묶임
  }, [showCarousel, bannerWidth, pageCount]);

  const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (bannerWidth <= 0) return;
    const next = Math.round(e.nativeEvent.contentOffset.x / bannerWidth);
    setPage(Math.min(Math.max(next, 0), pageCount - 1));
  };

  const greeting = (
    <View className="flex-row items-center gap-2.5 px-3.5 py-2.5">
      <View className="min-w-0 flex-1 gap-0.5">
        <Text className="text-base font-bold leading-5 text-brand">
          {allDone ? COPY.med.checkPromptDone : COPY.med.checkPromptTitle}
        </Text>
      </View>
      <KokiIllustration variant={allDone ? 'done' : 'cheer'} size={64} />
    </View>
  );

  if (!showCarousel || !savedCondition) {
    return (
      <View className="overflow-hidden rounded-2xl bg-surface-soft">
        {greeting}
      </View>
    );
  }

  const label = CONDITION_LABEL[savedCondition];
  const conditionSlide = (
    <View className="flex-row items-center gap-2.5 px-3.5 py-2.5">
      <View className="min-w-0 flex-1 gap-0.5">
        <Text className="text-base font-bold leading-5 text-brand">
          {COPY.condition.savedPrompt(label)}
        </Text>
        {savedMessage?.trim() ? (
          <Text className="text-xs text-brand-muted" numberOfLines={2}>
            {savedMessage.trim()}
          </Text>
        ) : null}
      </View>
      <KokiIllustration
        variant={kokiForCondition(savedCondition)}
        size={64}
        accessibilityLabel={label}
      />
    </View>
  );

  return (
    <View
      className="overflow-hidden rounded-2xl bg-surface-soft"
      onLayout={(e) => {
        const w = e.nativeEvent.layout.width;
        if (w > 0 && w !== bannerWidth) setBannerWidth(w);
      }}
    >
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        onMomentumScrollEnd={onMomentumEnd}
        scrollEventThrottle={16}
      >
        <View style={{ width: bannerWidth || undefined }}>{greeting}</View>
        <View style={{ width: bannerWidth || undefined }}>
          {conditionSlide}
        </View>
      </ScrollView>
      <View className="flex-row items-center justify-center gap-1.5 pb-2">
        {Array.from({ length: pageCount }).map((_, i) => (
          <View
            key={`dot-${i}`}
            className={cn('h-1.5 rounded-full', i === page ? 'w-4' : 'w-1.5')}
            style={{
              backgroundColor:
                i === page ? COLORS.brand : COLORS.disabled,
            }}
          />
        ))}
      </View>
    </View>
  );
}
