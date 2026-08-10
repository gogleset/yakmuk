import { useEffect, useRef, useState } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  View,
} from 'react-native';
import { COLORS, LIMITS } from '@/shared/config/theme';
import { cn } from '@/shared/lib/cn';
import { FamilyCareAlertCard } from './FamilyCareAlertCard';
import type { CareAlertSlide } from './model/types';

/** 슬라이드 간 간격 (paging 페이지 안쪽 paddingRight) */
const SLIDE_GAP = 12;

type Props = {
  slides: CareAlertSlide[];
  onAck: (slideId: string) => void;
};

/** 케어 알림 가로 캐러셀 + 자동 슬라이드 + pill dots (비면 empty) */
export function FamilyCareAlertCarousel({ slides, onAck }: Props) {
  const scrollRef = useRef<ScrollView>(null);
  const [bannerWidth, setBannerWidth] = useState(0);
  const [page, setPage] = useState(0);
  const pageRef = useRef(0);
  pageRef.current = page;

  const pageCount = slides.length;

  const goToPage = (next: number, animated = true) => {
    if (bannerWidth <= 0 || pageCount <= 0) return;
    const clamped = ((next % pageCount) + pageCount) % pageCount;
    scrollRef.current?.scrollTo({
      x: clamped * bannerWidth,
      animated,
    });
    setPage(clamped);
  };

  // ack로 슬라이드 줄면 페이지 클램프 + 스크롤 보정
  useEffect(() => {
    if (slides.length === 0) {
      setPage(0);
      return;
    }
    setPage((prev) => {
      const clamped = Math.min(prev, slides.length - 1);
      if (clamped !== prev && bannerWidth > 0) {
        requestAnimationFrame(() => {
          scrollRef.current?.scrollTo({
            x: clamped * bannerWidth,
            animated: true,
          });
        });
      }
      return clamped;
    });
  }, [slides.length, bannerWidth]);

  // 자동 슬라이드 (TodayGreetingBanner와 동일 간격)
  useEffect(() => {
    if (pageCount <= 1 || bannerWidth <= 0) return;
    const id = setInterval(() => {
      goToPage(pageRef.current + 1);
    }, LIMITS.todayBannerAutoAdvanceMs);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- goToPage는 width/pageCount에 묶임
  }, [pageCount, bannerWidth]);

  if (slides.length === 0) return null;

  const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (bannerWidth <= 0) return;
    const next = Math.round(e.nativeEvent.contentOffset.x / bannerWidth);
    setPage(Math.min(Math.max(next, 0), pageCount - 1));
  };

  return (
    <View
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
        {slides.map((slide, index) => (
          <View
            key={slide.id}
            style={{
              width: bannerWidth || undefined,
              paddingRight: index < slides.length - 1 ? SLIDE_GAP : 0,
            }}
          >
            <FamilyCareAlertCard
              slide={slide}
              onAck={() => onAck(slide.id)}
            />
          </View>
        ))}
      </ScrollView>
      {slides.length > 1 ? (
        <View className="mt-2 flex-row items-center justify-center gap-1.5">
          {slides.map((slide, i) => (
            <View
              key={`dot-${slide.id}`}
              className={cn(
                'h-1.5 rounded-full',
                i === page ? 'w-4' : 'w-1.5',
              )}
              style={{
                backgroundColor: i === page ? COLORS.brand : COLORS.disabled,
              }}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}
