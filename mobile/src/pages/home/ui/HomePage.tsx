import { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/providers/AuthProvider';
import {
  buildDayMedicationEntries,
  buildMarkedDates,
  currentYearMonthKst,
} from '@/entities/medication';
import { useHomeMedicationQueries } from '@/entities/medication/model/queries';
import type { ConditionValue } from '@/entities/medication/model/types';
import {
  AddMedicationSheet,
  refreshAfterMedicationChange,
} from '@/features/add-medication';
import { useConditionLogMutation } from '@/features/condition-log';
import { useDailyMedicationCheckMutations } from '@/features/daily-medication-check';
import { syncMedicationNotifications } from '@/features/medication-notifications';
import { todayKstDateString } from '@/shared/lib/kst';
import { LAYOUT } from '@/shared/config/theme';
import { Fab, FadeEdges, Screen } from '@/shared/ui';
import { MedicationCalendarPanel } from '@/widgets/medication-calendar-panel';
import { PastDayMedicationPanel } from '@/widgets/past-day-medication-panel/PastDayMedicationPanel';
import { TodayMedicationPanel } from '@/widgets/today-medication-panel/TodayMedicationPanel';

/** 홈 — 복약 캘린더·오늘 체크·컨디션 */
export function HomePage() {
  const qc = useQueryClient();
  const { profile } = useAuth();
  const today = todayKstDateString();
  const [addOpen, setAddOpen] = useState(false);
  const [condition, setCondition] = useState<ConditionValue>('GOOD');
  const [message, setMessage] = useState('');
  const [selectedDate, setSelectedDate] = useState(today);
  const [visibleMonth, setVisibleMonth] = useState(currentYearMonthKst(today));

  const userId = profile?.id;
  const familyId = profile?.familyId;

  const {
    meds: medsQuery,
    calendarMeds: calendarMedsQuery,
    taken: takenQuery,
    logs: logsQuery,
  } = useHomeMedicationQueries({
    userId,
    todayKst: today,
    visibleMonth,
  });

  const pendingIds = useMemo(() => {
    const taken = takenQuery.data ?? new Set<number>();
    return (medsQuery.data ?? [])
      .filter((m) => !taken.has(m.id))
      .map((m) => m.id);
  }, [medsQuery.data, takenQuery.data]);

  const markedDates = useMemo(
    () =>
      buildMarkedDates(
        visibleMonth,
        calendarMedsQuery.data ?? [],
        logsQuery.data ?? [],
        selectedDate,
        today,
      ),
    [visibleMonth, calendarMedsQuery.data, logsQuery.data, selectedDate, today],
  );

  const selectedDayEntries = useMemo(
    () =>
      buildDayMedicationEntries(
        selectedDate,
        calendarMedsQuery.data ?? [],
        logsQuery.data ?? [],
      ),
    [calendarMedsQuery.data, logsQuery.data, selectedDate],
  );

  const selectedDayConditionLogs = useMemo(
    () =>
      (logsQuery.data ?? []).filter(
        (log) => log.logDate === selectedDate && log.condition,
      ),
    [logsQuery.data, selectedDate],
  );

  useEffect(() => {
    if (!medsQuery.data || !takenQuery.data) return;
    void syncMedicationNotifications(medsQuery.data, takenQuery.data);
  }, [medsQuery.data, takenQuery.data]);

  const takenMedIds = takenQuery.data ?? new Set<number>();

  const { toggle, remove } = useDailyMedicationCheckMutations({
    userId,
    familyId,
    takenMedIds,
    pendingIds,
  });

  const submitCondition = useConditionLogMutation({
    userId,
    familyId,
    condition,
    message,
    pendingIds,
  });

  const confirmDelete = (medId: number, name: string) => {
    Alert.alert('약을 삭제할까요?', `"${name}" 일정을 지울게요.`, [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => remove.mutate(medId),
      },
    ]);
  };

  const refreshAfterMedChange = () => refreshAfterMedicationChange(qc);

  return (
    <Screen>
      <ScrollView contentContainerClassName="gap-2.5 px-5 pb-24 pt-4">
        <MedicationCalendarPanel
          visibleMonth={visibleMonth}
          markedDates={markedDates}
          onDayPress={(day) => setSelectedDate(day.dateString)}
          onMonthChange={(month) => {
            const ym = `${month.year}-${String(month.month).padStart(2, '0')}`;
            setVisibleMonth(ym);
          }}
        />

        {selectedDate !== today ? (
          <PastDayMedicationPanel
            entries={selectedDayEntries}
            conditionLogs={selectedDayConditionLogs}
          />
        ) : (
          <TodayMedicationPanel
            meds={medsQuery.data ?? []}
            takenMedIds={takenMedIds}
            condition={condition}
            message={message}
            isError={medsQuery.isError}
            onConditionChange={setCondition}
            onMessageChange={setMessage}
            onToggle={(id) => toggle.mutate(id)}
            onDelete={confirmDelete}
            onSubmitCondition={() => submitCondition.mutate()}
          />
        )}
      </ScrollView>

      <FadeEdges top={LAYOUT.fade.top} bottom={LAYOUT.fade.bottomWithFab} />
      <Fab label="약 추가" onPress={() => setAddOpen(true)} />

      <AddMedicationSheet
        visible={addOpen}
        userId={userId}
        onClose={() => setAddOpen(false)}
        onAdded={refreshAfterMedChange}
      />
    </Screen>
  );
}
