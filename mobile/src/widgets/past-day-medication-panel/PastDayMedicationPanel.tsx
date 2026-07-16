import { Text, View } from 'react-native';
import type { DayMedicationEntry } from '@/entities/medication/lib/calendar';
import type { DailyLog } from '@/entities/medication/model/types';
import { CONDITION_LABEL } from '@/shared/lib/format';
import { COLORS, LAYOUT } from '@/shared/config/theme';
import { Body, Card, EmptyHint, Icons, Muted } from '@/shared/ui';

type Props = {
  entries: DayMedicationEntry[];
  conditionLogs: DailyLog[];
};

/** 과거 날짜 복약·컨디션 기록 */
export function PastDayMedicationPanel({ entries, conditionLogs }: Props) {
  if (entries.length === 0 && conditionLogs.length === 0) {
    return <EmptyHint message="이 날에는 먹을 약이 없어요." />;
  }

  return (
    <>
      {entries.map((entry) => (
        <Card key={entry.key} className="flex-row items-center gap-2">
          {entry.taken ? (
            <Icons.CheckCircle size={LAYOUT.icon.md} color={COLORS.brand} />
          ) : (
            <Icons.Circle size={LAYOUT.icon.md} color={COLORS.muted} />
          )}
          <Text className="flex-1 font-semibold text-brand">{entry.name}</Text>
          {entry.scheduledTime ? <Muted>{entry.scheduledTime}</Muted> : null}
        </Card>
      ))}
      {conditionLogs.map((log) => (
        <Card key={`c-${log.id}`}>
          <Text className="font-semibold text-brand">
            컨디션 {CONDITION_LABEL[log.condition!]}
          </Text>
          {log.message ? <Body className="mt-1">{log.message}</Body> : null}
        </Card>
      ))}
    </>
  );
}
