import { Pressable, View } from 'react-native';
import { COLORS, LAYOUT } from '@/shared/config/theme';
import { COPY } from '@/shared/copy';
import { Body, Icons, Caption, LabelSm, SectionTitle } from '@/shared/ui';

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
      <LabelSm tone="text" className="font-bold">
        {COPY.family.recentFeed}
      </LabelSm>
      {feedCount > 0 ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={COPY.family.seeMoreFeed}
          hitSlop={LAYOUT.hitSlop.md}
          onPress={onPress}
          className="flex-row items-center gap-0.5"
        >
          <Caption>{COPY.family.seeMoreFeed}</Caption>
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
      <SectionTitle tone="text" className="text-center">
        {dateLabel}
      </SectionTitle>
      <Body className="mt-0.5 text-center text-sm">{COPY.family.title}</Body>
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
