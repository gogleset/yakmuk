import { Text, View } from 'react-native';
import type { CalendarMark } from '@/entities/medication/lib/calendar';
import { COLORS, LAYOUT } from '@/shared/config/theme';
import { COPY } from '@/shared/copy';
import { KokiIllustration } from '@/shared/ui';
import { MedCalendar } from './MedCalendar';
import { MonthHeader } from './MonthHeader';

type Props = {
  visibleMonth: string;
  markedDates: Record<string, CalendarMark>;
  onDayPress: (day: { dateString: string }) => void;
  onMonthChange: (month: { year: number; month: number }) => void;
  /** F4 — 연속 ≥3일일 때만 */
  showStreak?: boolean;
  streakDays?: number;
};

function shiftYearMonth(visibleMonth: string, delta: number): {
  year: number;
  month: number;
} {
  const [yearRaw, monthRaw] = visibleMonth.split('-').map(Number);
  const year = yearRaw || new Date().getFullYear();
  const month = monthRaw || 1;
  const date = new Date(year, month - 1 + delta, 1);
  return { year: date.getFullYear(), month: date.getMonth() + 1 };
}

/** 월 헤더 + 캘린더 + 복약 상태 범례 (+ 조건부 streak) */
export function MedicationCalendarPanel({
  visibleMonth,
  markedDates,
  onDayPress,
  onMonthChange,
  showStreak = false,
  streakDays,
}: Props) {
  return (
    <View className="gap-2.5">
      {showStreak ? (
        <View className="items-center gap-1 py-1">
          <KokiIllustration variant="streak" size={88} />
          {streakDays != null ? (
            <Text className="text-sm font-semibold text-brand">
              {COPY.med.streakDays(streakDays)}
            </Text>
          ) : null}
        </View>
      ) : null}

      <MonthHeader
        visibleMonth={visibleMonth}
        onPrevMonth={() => onMonthChange(shiftYearMonth(visibleMonth, -1))}
        onNextMonth={() => onMonthChange(shiftYearMonth(visibleMonth, 1))}
      />

      {/* canvas on canvas — soft shadow로 구분 (overflow는 안쪽만) */}
      <View className="rounded-xl bg-canvas" style={LAYOUT.shadow.sameFill}>
        <View className="overflow-hidden rounded-xl">
          <MedCalendar
            key={visibleMonth}
            current={`${visibleMonth}-01`}
            markedDates={markedDates}
            onDayPress={onDayPress}
            onMonthChange={onMonthChange}
          />
        </View>
      </View>

      <View className="flex-row items-center justify-evenly">
        <Text className="text-xs" style={{ color: COLORS.muted }}>
          ● {COPY.calendar.legendScheduled}
        </Text>
        <Text className="text-xs" style={{ color: COLORS.sky }}>
          ● {COPY.calendar.legendDone}
        </Text>
        <Text className="text-xs" style={{ color: COLORS.warning }}>
          ● {COPY.calendar.legendPartial}
        </Text>
        <Text className="text-xs" style={{ color: COLORS.destructive }}>
          ● {COPY.calendar.legendMissed}
        </Text>
      </View>
    </View>
  );
}
