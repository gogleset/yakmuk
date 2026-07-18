import { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/providers/AuthProvider';
import {
  buildDayMedicationEntries,
  buildMarkedDates,
  currentYearMonthKst,
  isMedScheduledOnDate,
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
import { ACTIONS, COPY } from '@/shared/copy';
import { Fab, FadeInView, Screen } from '@/shared/ui';
import { MedicationCalendarPanel } from '@/widgets/medication-calendar-panel';
import { PastDayMedicationPanel } from '@/widgets/past-day-medication-panel';
import { TodayMedicationPanel } from '@/widgets/today-medication-panel';

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

  // 오늘 days_mask에 해당하는 약만 체크/알림 대상
  const todayMeds = useMemo(
    () =>
      (medsQuery.data ?? []).filter((m) => isMedScheduledOnDate(m, today)),
    [medsQuery.data, today],
  );

  const pendingIds = useMemo(() => {
    const taken = takenQuery.data ?? new Set<number>();
    return todayMeds.filter((m) => !taken.has(m.id)).map((m) => m.id);
  }, [todayMeds, takenQuery.data]);

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
    // 전체 med 넘김 — sync 내부에서 days_mask로 WEEKLY/DAILY 분기
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
    Alert.alert(COPY.med.deleteTitle, COPY.med.deleteBody(name), [
      { text: ACTIONS.cancel, style: 'cancel' },
      {
        text: ACTIONS.delete,
        style: 'destructive',
        onPress: () => remove.mutate(medId),
      },
    ]);
  };

  const refreshAfterMedChange = () => refreshAfterMedicationChange(qc);

  const takenCount = todayMeds.filter((m) => takenMedIds.has(m.id)).length;
  const progressLabel =
    todayMeds.length === 0
      ? undefined
      : pendingIds.length === 0
        ? COPY.med.allDoneToday
        : COPY.med.remainingToday(pendingIds.length) +
          (takenCount > 0
            ? ` · ${COPY.med.progressFraction(takenCount, todayMeds.length)}`
            : '');

  return (
    <Screen
      fadeTop={LAYOUT.fade.top}
      fadeBottom={LAYOUT.fade.bottomWithFab}
    >
      <ScrollView
        contentContainerClassName="gap-2.5 px-5 pt-4"
        contentContainerStyle={{
          paddingBottom: LAYOUT.scroll.paddingBottomWithFab,
        }}
      >
        <FadeInView className="gap-2.5">
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
              meds={todayMeds}
              takenMedIds={takenMedIds}
              condition={condition}
              message={message}
              isError={medsQuery.isError}
              progressLabel={progressLabel}
              emptyMessage={
                (medsQuery.data?.length ?? 0) > 0
                  ? COPY.med.emptyToday
                  : undefined
              }
              onConditionChange={setCondition}
              onMessageChange={setMessage}
              onToggle={(id) => toggle.mutate(id)}
              onDelete={confirmDelete}
              onSubmitCondition={() => submitCondition.mutate()}
              onAddPress={() => setAddOpen(true)}
            />
          )}
        </FadeInView>
      </ScrollView>

      <Fab label={COPY.med.addFab} onPress={() => setAddOpen(true)} />

      <AddMedicationSheet
        visible={addOpen}
        userId={userId}
        onClose={() => setAddOpen(false)}
        onAdded={refreshAfterMedChange}
      />
    </Screen>
  );
}
