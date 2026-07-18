import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import {
  buildDayMedicationEntries,
  buildMarkedDates,
  currentYearMonthKst,
} from '@/entities/medication';
import { useHomeMedicationQueries } from '@/entities/medication/model/queries';
import type { Medication } from '@/entities/medication/model/types';
import {
  AddMedicationSheet,
  refreshAfterMedicationChange,
} from '@/features/add-medication';
import { useDailyMedicationCheckMutations } from '@/features/daily-medication-check';
import { EditMedicationSheet } from '@/features/edit-medication';
import { todayKstDateString } from '@/shared/lib/kst';
import { COLORS, LAYOUT } from '@/shared/config/theme';
import { ACTIONS, COPY } from '@/shared/copy';
import {
  Fab,
  Icons,
  PageTitle,
  Screen,
  SectionHeader,
} from '@/shared/ui';
import { GuardianMedManagePanel } from '@/widgets/guardian-med-manage-panel';
import { MedicationCalendarPanel } from '@/widgets/medication-calendar-panel';
import { PastDayMedicationPanel } from '@/widgets/past-day-medication-panel';
import { canManageMemberMeds } from '@/entities/user';

/** 가족 멤버 복약·컨디션 (가족장·보호자 → 피보호자 약 관리) */
export function FamilyMemberPage() {
  const qc = useQueryClient();
  const { profile } = useAuth();
  const params = useLocalSearchParams<{
    userId: string;
    nickname?: string;
    role?: string;
  }>();

  const userId = String(params.userId ?? '');
  const nickname = params.nickname
    ? decodeURIComponent(String(params.nickname))
    : '가족';
  const memberRole = params.role ? String(params.role) : null;

  const canManageMeds = canManageMemberMeds(profile?.role, memberRole);
  const today = todayKstDateString();
  const [selectedDate, setSelectedDate] = useState(today);
  const [visibleMonth, setVisibleMonth] = useState(currentYearMonthKst(today));
  const [addOpen, setAddOpen] = useState(false);
  const [editingMed, setEditingMed] = useState<Medication | null>(null);

  const {
    meds: medsQuery,
    calendarMeds: calendarMedsQuery,
    logs: logsQuery,
  } = useHomeMedicationQueries({
    userId: userId || undefined,
    todayKst: today,
    visibleMonth,
  });

  const { remove } = useDailyMedicationCheckMutations({
    userId,
    familyId: profile?.familyId,
    takenMedIds: new Set(),
    pendingIds: [],
  });

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

  const refreshMeds = () => refreshAfterMedicationChange(qc);

  const confirmDelete = (med: Medication) => {
    Alert.alert(COPY.med.deleteTitle, COPY.med.deleteBody(med.name), [
      { text: ACTIONS.cancel, style: 'cancel' },
      {
        text: ACTIONS.delete,
        style: 'destructive',
        onPress: () => remove.mutate(med.id),
      },
    ]);
  };

  return (
    <Screen
      fadeTop={LAYOUT.fade.top}
      fadeBottom={
        canManageMeds ? LAYOUT.fade.bottomWithFab : LAYOUT.fade.bottomPlain
      }
    >
      <View className="flex-row items-center gap-2 px-5 pt-2">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="뒤로"
          hitSlop={LAYOUT.hitSlop.md}
          onPress={() => router.back()}
          className="p-1"
        >
          <Icons.ChevronLeft size={LAYOUT.icon.xl} color={COLORS.brand} />
        </Pressable>
        <View className="flex-1">
          <PageTitle className="text-[22px]">{nickname}</PageTitle>
        </View>
      </View>

      <ScrollView
        contentContainerClassName={
          canManageMeds ? 'gap-2.5 px-5 pt-3' : 'gap-2.5 px-5 pb-10 pt-3'
        }
        contentContainerStyle={
          canManageMeds
            ? { paddingBottom: LAYOUT.scroll.paddingBottomWithFab }
            : undefined
        }
        keyboardShouldPersistTaps="handled"
      >
        {!userId ? (
          <Text className="text-brand-muted">멤버를 찾을 수 없어요.</Text>
        ) : (
          <>
            <MedicationCalendarPanel
              visibleMonth={visibleMonth}
              markedDates={markedDates}
              onDayPress={(day) => setSelectedDate(day.dateString)}
              onMonthChange={(month) => {
                const ym = `${month.year}-${String(month.month).padStart(2, '0')}`;
                setVisibleMonth(ym);
              }}
            />

            <PastDayMedicationPanel
              entries={selectedDayEntries}
              conditionLogs={selectedDayConditionLogs}
            />

            {canManageMeds ? (
              <>
                <SectionHeader title="등록된 약" />
                <GuardianMedManagePanel
                  meds={medsQuery.data ?? []}
                  isError={medsQuery.isError}
                  onEdit={setEditingMed}
                  onDelete={confirmDelete}
                />
              </>
            ) : null}
          </>
        )}
      </ScrollView>

      {canManageMeds ? (
        <>
          <Fab label={COPY.med.addFab} onPress={() => setAddOpen(true)} />
          <AddMedicationSheet
            visible={addOpen}
            userId={userId}
            onClose={() => setAddOpen(false)}
            onAdded={refreshMeds}
          />
          <EditMedicationSheet
            visible={editingMed != null}
            medication={editingMed}
            onClose={() => setEditingMed(null)}
            onUpdated={refreshMeds}
          />
        </>
      ) : null}
    </Screen>
  );
}
