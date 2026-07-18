import { Text, View } from 'react-native';
import type { CalendarMark } from '@/entities/medication/lib/calendar';
import { COLORS } from '@/shared/config/theme';
import { COPY } from '@/shared/copy';
import { Card } from '@/shared/ui';
import { MedCalendar } from './MedCalendar';

type Props = {
  visibleMonth: string;
  markedDates: Record<string, CalendarMark>;
  onDayPress: (day: { dateString: string }) => void;
  onMonthChange: (month: { year: number; month: number }) => void;
};

/** 캘린더 + 복약 상태 범례 */
export function MedicationCalendarPanel({
  visibleMonth,
  markedDates,
  onDayPress,
  onMonthChange,
}: Props) {
  return (
    <>
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
