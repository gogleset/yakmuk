import { Text, View } from 'react-native';
import type { DayMedicationEntry } from '@/entities/medication/lib/calendar';
import type { DailyLog } from '@/entities/medication/model/types';
import { CONDITION_LABEL } from '@/entities/medication';
import { COLORS, LAYOUT } from '@/shared/config/theme';
import { cn } from '@/shared/lib/cn';
import { COPY } from '@/shared/copy';
import { Body, EmptyHint, Icons, Muted } from '@/shared/ui';

type Props = {
  entries: DayMedicationEntry[];
  conditionLogs: DailyLog[];
};

/** 과거 날짜 복약·컨디션 기록 */
export function PastDayMedicationPanel({ entries, conditionLogs }: Props) {
  if (entries.length === 0 && conditionLogs.length === 0) {
    return <EmptyHint message={COPY.med.emptyPastDay} />;
  }

  return (
    <View className="gap-2">
      {entries.map((entry) => (
        <View
          key={entry.key}
          className={cn(
            'flex-row items-center gap-2 rounded-xl p-3.5',
            entry.taken ? 'bg-brand-soft' : 'bg-surface',
          )}
        >
          {entry.taken ? (
            <Icons.CheckCircle size={LAYOUT.icon.md} color={COLORS.brand} />
          ) : (
            <Icons.Circle size={LAYOUT.icon.md} color={COLORS.muted} />
          )}
          <Text className="flex-1 font-semibold text-brand">{entry.name}</Text>
          {entry.scheduledTime ? <Muted>{entry.scheduledTime}</Muted> : null}
        </View>
      ))}
      {conditionLogs.map((log) => (
        <View key={`c-${log.id}`} className="rounded-xl bg-surface p-3.5">
          <Text className="font-semibold text-brand">
            컨디션 {CONDITION_LABEL[log.condition!]}
          </Text>
          {log.message ? <Body className="mt-1">{log.message}</Body> : null}
        </View>
      ))}
    </View>
  );
}
