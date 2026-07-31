import { useMemo } from 'react';
import { Text, View } from 'react-native';
import type { DayMedicationEntry } from '@/entities/medication/lib/calendar';
import { groupTimedEntriesByScheduledTime } from '@/entities/medication/lib/timeSlots';
import { CONDITION_LABEL } from '@/entities/medication/lib/display';
import type { DailyLog } from '@/entities/medication/model/types';
import { TimeSlotMedAccordion } from '@/entities/medication';
import { COPY } from '@/shared/copy';
import { Body, EmptyHint } from '@/shared/ui';

type Props = {
  entries: DayMedicationEntry[];
  conditionLogs: DailyLog[];
  onOpenDetail?: (medId: number) => void;
};

/** 과거·다른 날 — 오늘 체크와 같은 시간대 아코디언 */
export function PastDayMedicationPanel({
  entries,
  conditionLogs,
  onOpenDetail,
}: Props) {
  const groups = useMemo(
    () => groupTimedEntriesByScheduledTime(entries),
    [entries],
  );

  if (entries.length === 0 && conditionLogs.length === 0) {
    return <EmptyHint message={COPY.med.emptyPastDay} />;
  }

  return (
    <View className="gap-3">
      {groups.length > 0 ? (
        <TimeSlotMedAccordion
          groups={groups}
          onPressKey={
            onOpenDetail
              ? (key) => {
                  // buildDayMedicationEntries: `med-${id}`
                  const match = /^med-(\d+)$/.exec(key);
                  if (!match) return;
                  const id = Number(match[1]);
                  if (!Number.isFinite(id)) return;
                  onOpenDetail(id);
                }
              : undefined
          }
        />
      ) : null}
      {conditionLogs.map((log) => (
        <View key={`c-${log.id}`} className="rounded-xl bg-surface-soft p-3.5">
          <Text className="font-semibold text-brand">
            컨디션 {CONDITION_LABEL[log.condition!]}
          </Text>
          {log.message ? <Body className="mt-1">{log.message}</Body> : null}
        </View>
      ))}
    </View>
  );
}
