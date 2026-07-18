import { Pressable, Text, View } from 'react-native';
import { COLORS, LAYOUT } from '@/shared/config/theme';
import { Icons } from '@/shared/ui';

type Props = {
  /** YYYY-MM */
  visibleMonth: string;
  onPrevMonth: () => void;
  onNextMonth: () => void;
};

/** 월 타이틀 — ◀ N월 YYYY ▶ (탭 루트 헤더 크롬 없음) */
export function MonthHeader({
  visibleMonth,
  onPrevMonth,
  onNextMonth,
}: Props) {
  const [year, month] = visibleMonth.split('-');
  const monthNumber = Number(month);
  const title =
    Number.isFinite(monthNumber) && year
      ? `${monthNumber}월 ${year}`
      : visibleMonth;

  return (
    <View className="flex-row items-center justify-between px-1 py-1">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="이전 달"
        hitSlop={LAYOUT.hitSlop.md}
        onPress={onPrevMonth}
        className="p-2"
      >
        <Icons.ChevronLeft size={LAYOUT.icon.xl} color={COLORS.brand} />
      </Pressable>
      <Text className="text-lg font-bold text-brand">{title}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="다음 달"
        hitSlop={LAYOUT.hitSlop.md}
        onPress={onNextMonth}
        className="p-2"
      >
        <Icons.ChevronRight size={LAYOUT.icon.xl} color={COLORS.brand} />
      </Pressable>
    </View>
  );
}
