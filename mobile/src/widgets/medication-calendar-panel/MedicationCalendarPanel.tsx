import { Text, View } from 'react-native';
import type { CalendarMark } from '@/entities/medication/lib/calendar';
import { COLORS } from '@/shared/config/theme';
import { COPY } from '@/shared/copy';
import { Card, KokiIllustration } from '@/shared/ui';
import { MedCalendar } from './MedCalendar';

type Props = {
  visibleMonth: string;
  markedDates: Record<string, CalendarMark>;
  onDayPress: (day: { dateString: string }) => void;
  onMonthChange: (month: { year: number; month: number }) => void;
  /** F4 — 연속 ≥3일일 때만 */
  showStreak?: boolean;
  streakDays?: number;
};

/** 캘린더 + 복약 상태 범례 (+ 조건부 streak) */
export function MedicationCalendarPanel({
  visibleMonth,
  markedDates,
  onDayPress,
  onMonthChange,
  showStreak = false,
  streakDays,
}: Props) {
  return (
    <>
      {showStreak ? (
        <View className="items-center gap-1 py-1">
          <KokiIllustration variant="streak" size={88} />
          {streakDays != null ? (
            <Text className="text-sm font-semibold text-brand">
              {streakDays}일 연속이에요
            </Text>
          ) : null}
        </View>
      ) : null}
      <Card className="overflow-hidden p-0">
        <MedCalendar
          current={`${visibleMonth}-01`}
          markedDates={markedDates}
          onDayPress={onDayPress}
          onMonthChange={onMonthChange}
        />
      </Card>
      <View className="flex-row gap-3">
        <Text className="text-xs" style={{ color: COLORS.success }}>
          ● {COPY.calendar.legendDone}
        </Text>
        <Text className="text-xs" style={{ color: COLORS.warning }}>
          ● {COPY.calendar.legendPartial}
        </Text>
        <Text className="text-xs" style={{ color: COLORS.destructive }}>
          ● {COPY.calendar.legendMissed}
        </Text>
      </View>
    </>
  );
}
