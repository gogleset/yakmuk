import { useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import {
  buildMarkedDates,
  currentYearMonthKst,
} from '@/entities/medication';
import { useHomeMedicationQueries } from '@/entities/medication/model/queries';
import type { Medication } from '@/entities/medication/model/types';
import { useDailyMedicationCheckMutations } from '@/features/daily-medication-check';
import {
  addMedicationRoute,
  editMedicationRoute,
} from '@/shared/config/routes';
import { todayKstDateString } from '@/shared/lib/kst';
import { LAYOUT } from '@/shared/config/theme';
import { ACTIONS, COPY } from '@/shared/copy';
import {
  Body,
  Fab,
  FadeInView,
  Screen,
  ScreenScrollView,
  StackHeader,
} from '@/shared/ui';
import { GuardianMedManagePanel, MedManageListSkeleton } from '@/widgets/guardian-med-manage-panel';
import { MedicationCalendarPanel } from '@/widgets/medication-calendar-panel';
import { canManageMemberMeds } from '@/entities/user';

/** 가족 멤버 — 캘린더 이력 + 등록 약 관리 (체크는 본인 홈만) */
export function FamilyMemberPage() {
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
      <StackHeader title={nickname} />

      <ScreenScrollView
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
        <FadeInView className="gap-2.5">
          {!userId ? (
            <Body>멤버를 찾을 수 없어요.</Body>
          ) : (
            <>
              <FadeInView step={0}>
                <MedicationCalendarPanel
                  visibleMonth={visibleMonth}
                  markedDates={markedDates}
                  onDayPress={(day) => setSelectedDate(day.dateString)}
                  onMonthChange={(month) => {
                    const ym = `${month.year}-${String(month.month).padStart(2, '0')}`;
                    setVisibleMonth(ym);
                  }}
                />
              </FadeInView>

              {canManageMeds ? (
                <FadeInView step={1}>
                  {medsQuery.isLoading && !medsQuery.data ? (
                    <MedManageListSkeleton />
                  ) : (
                    <GuardianMedManagePanel
                      meds={medsQuery.data ?? []}
                      isError={medsQuery.isError}
                      onEdit={(med) =>
                        router.push(editMedicationRoute(med.id, userId))
                      }
                      onDelete={confirmDelete}
                    />
                  )}
                </FadeInView>
              ) : null}
            </>
          )}
        </FadeInView>
      </ScreenScrollView>

      {canManageMeds ? (
        <Fab
          label={COPY.med.addFab}
          onPress={() => router.push(addMedicationRoute(userId))}
        />
      ) : null}
    </Screen>
  );
}
