import { Pressable, Text, View } from 'react-native';
import { COLORS, LAYOUT } from '@/shared/config/theme';
import { Icons } from '@/shared/ui';

type Props = {
  /** YYYY-MM */
  visibleMonth: string;
  onPrevMonth: () => void;
  onNextMonth: () => void;
};

/** 월 타이틀 — ◀ N월 YYYY ▶ (StackHeader와 동일 사이즈·중립 톤) */
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
        className="p-0.5"
      >
        <Icons.ChevronLeft size={LAYOUT.icon.lg} color={COLORS.text} />
      </Pressable>
      <Text className="text-lg font-bold text-text">{title}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="다음 달"
        hitSlop={LAYOUT.hitSlop.md}
        onPress={onNextMonth}
        className="p-0.5"
      >
        <Icons.ChevronRight size={LAYOUT.icon.lg} color={COLORS.text} />
      </Pressable>
    </View>
  );
}
