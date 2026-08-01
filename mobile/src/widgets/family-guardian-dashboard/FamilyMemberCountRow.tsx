import { Pressable, Text, View } from 'react-native';
import { COLORS, LAYOUT } from '@/shared/config/theme';
import { COPY } from '@/shared/copy';
import { Icons, Muted } from '@/shared/ui';

type FeedHeaderProps = {
  feedCount: number;
  onPress: () => void;
};

/** 최근 소식 섹션 헤더 — 0개면 더보기 숨김 */
export function FamilyFeedSectionHeader({
  feedCount,
  onPress,
}: FeedHeaderProps) {
  return (
    <View className="mt-1 flex-row items-center justify-between gap-2">
      <Text className="text-sm font-bold text-text">
        {COPY.family.recentFeed}
      </Text>
      {feedCount > 0 ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={COPY.family.seeMoreFeed}
          hitSlop={LAYOUT.hitSlop.md}
          onPress={onPress}
          className="flex-row items-center gap-0.5"
        >
          <Muted className="text-xs">{COPY.family.seeMoreFeed}</Muted>
          <Icons.ChevronRight size={LAYOUT.icon.sm} color={COLORS.muted} />
        </Pressable>
      ) : null}
    </View>
  );
}

type PageHeaderProps = {
  dateLabel: string;
  onBellPress: () => void;
};

/** 가족 탭 헤더 — 가운데 날짜·제목 · 우측 알림 (이미지 없음) */
export function FamilyTabHeader({ dateLabel, onBellPress }: PageHeaderProps) {
  return (
    <View className="relative items-center justify-center px-10 py-1">
      <Text className="text-center text-base font-bold text-text">
        {dateLabel}
      </Text>
      <Text className="mt-0.5 text-center text-sm text-brand-muted">
        {COPY.family.title}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="알림"
        hitSlop={LAYOUT.hitSlop.md}
        onPress={onBellPress}
        className="absolute right-0 top-0.5 p-1"
      >
        <Icons.Bell size={LAYOUT.icon.md} color={COLORS.text} />
      </Pressable>
    </View>
  );
}
