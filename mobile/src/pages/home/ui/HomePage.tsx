import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, RefreshControl, ScrollView } from 'react-native';
import { useAuth } from '@/providers/AuthProvider';
import {
  buildDayMedicationEntries,
  buildMarkedDates,
  computeStreakDays,
  currentYearMonthKst,
  invalidateMedicationActivity,
  isMedScheduledOnDate,
} from '@/entities/medication';
import { useHomeMedicationQueries } from '@/entities/medication/model/queries';
import type { ConditionValue } from '@/entities/medication/model/types';
import { useConditionLogMutation } from '@/features/condition-log';
import { useDailyMedicationCheckMutations } from '@/features/daily-medication-check';
import { syncMedicationNotifications } from '@/features/medication-notifications';
import { ROUTES } from '@/shared/config/routes';
import { todayKstDateString } from '@/shared/lib/kst';
import { COLORS, LAYOUT } from '@/shared/config/theme';
import { ACTIONS, COPY } from '@/shared/copy';
import {
  Fab,
  FadeInView,
  KokiIllustration,
  RichEmptyState,
  Screen,
} from '@/shared/ui';
import { MedicationCalendarPanel } from '@/widgets/medication-calendar-panel';
import { PastDayMedicationPanel } from '@/widgets/past-day-medication-panel';
import { TodayMedicationPanel } from '@/widgets/today-medication-panel';

/** 홈(기록) — 역할 무관 동일 UI (가족장·보호자·피보호자) */
export function HomePage() {
  const { profile, refreshProfile } = useAuth();
  const qc = useQueryClient();
  const today = todayKstDateString();
  const [condition, setCondition] = useState<ConditionValue>('GOOD');
  const [message, setMessage] = useState('');
  const [selectedDate, setSelectedDate] = useState(today);
  const [visibleMonth, setVisibleMonth] = useState(currentYearMonthKst(today));
  const [refreshing, setRefreshing] = useState(false);

  const userId = profile?.id;
  const familyId = profile?.familyId;

  const {
    meds: medsQuery,
    calendarMeds: calendarMedsQuery,
    taken: takenQuery,
    logs: logsQuery,
    streakLogs: streakLogsQuery,
  } = useHomeMedicationQueries({
    userId,
    todayKst: today,
    visibleMonth,
  });

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([refreshProfile(), invalidateMedicationActivity(qc)]);
    } finally {
      setRefreshing(false);
    }
  };

  const registeredMeds = medsQuery.data ?? [];
  const hasRegisteredMeds = registeredMeds.length > 0;

  const todayMeds = useMemo(
    () => registeredMeds.filter((m) => isMedScheduledOnDate(m, today)),
    [registeredMeds, today],
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

  const streakDays = useMemo(
    () =>
      computeStreakDays(
        calendarMedsQuery.data ?? [],
        streakLogsQuery.data ?? [],
        today,
      ),
    [calendarMedsQuery.data, streakLogsQuery.data, today],
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

  const { toggle, remove, markAllTaken } = useDailyMedicationCheckMutations({
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

  const openAdd = () => router.push(ROUTES.addMedication);

  const onMonthChange = (month: { year: number; month: number }) => {
    const ym = `${month.year}-${String(month.month).padStart(2, '0')}`;
    setVisibleMonth(ym);
  };

  // 셸 = 캘린더. 아래만 empty / 오늘 체크 / 과거일
  const showTodayCheck =
    hasRegisteredMeds && selectedDate === today;
  const showPastDay = hasRegisteredMeds && selectedDate !== today;
  const showFab = hasRegisteredMeds;
  const allDone = todayMeds.length > 0 && pendingIds.length === 0;

  return (
    <Screen
      fadeTop={LAYOUT.fade.top}
      fadeBottom={
        showFab ? LAYOUT.fade.bottomWithFab : LAYOUT.fade.bottomPlain
      }
    >
      <ScrollView
        contentContainerClassName="gap-3 px-5 pt-2"
        contentContainerStyle={{
          paddingBottom: showFab
            ? LAYOUT.scroll.paddingBottomWithFab
            : LAYOUT.fade.bottomPlain,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void onRefresh()}
            tintColor={COLORS.brand}
            colors={[COLORS.brand]}
          />
        }
      >
        <FadeInView className="gap-3">
          <MedicationCalendarPanel
            visibleMonth={visibleMonth}
            markedDates={markedDates}
            showStreak={hasRegisteredMeds && streakDays >= 3}
            streakDays={streakDays}
            onDayPress={(day) => setSelectedDate(day.dateString)}
            onMonthChange={onMonthChange}
          />

          {!hasRegisteredMeds ? (
            <RichEmptyState
              layout="card"
              title={
                medsQuery.isError
                  ? COPY.med.loadFailed
                  : COPY.med.emptyRegistered
              }
              message={
                medsQuery.isError
                  ? COPY.common.retryLater
                  : COPY.med.emptyRegisteredHint
              }
              illustration={
                <KokiIllustration variant="thinking" size={88} />
              }
              ctaLabel={
                medsQuery.isError ? undefined : COPY.med.emptyRegisteredCta
              }
              onCtaPress={medsQuery.isError ? undefined : openAdd}
            />
          ) : null}

          {showTodayCheck ? (
            <TodayMedicationPanel
              meds={todayMeds}
              takenMedIds={takenMedIds}
              condition={condition}
              message={message}
              isError={medsQuery.isError}
              emptyMessage={
                todayMeds.length === 0 ? COPY.med.emptyToday : undefined
              }
              emptyHint={
                todayMeds.length === 0 ? COPY.med.emptyTodayHint : undefined
              }
              onConditionChange={setCondition}
              onMessageChange={setMessage}
              onToggle={(id) => toggle.mutate(id)}
              onDelete={confirmDelete}
              onSubmitCondition={() => submitCondition.mutate()}
              onMarkAllTaken={() => markAllTaken.mutate()}
              markAllPending={markAllTaken.isPending}
              onAddPress={openAdd}
              allDone={allDone}
            />
          ) : null}

          {showPastDay ? (
            <PastDayMedicationPanel
              entries={selectedDayEntries}
              conditionLogs={selectedDayConditionLogs}
            />
          ) : null}
        </FadeInView>
      </ScrollView>

      {showFab ? <Fab label={COPY.med.addFab} onPress={openAdd} /> : null}
    </Screen>
  );
}
