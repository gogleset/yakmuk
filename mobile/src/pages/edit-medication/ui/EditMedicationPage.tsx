import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useRef } from 'react';
import { View } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/providers/AuthProvider';
import { useHomeMedicationQueries } from '@/entities/medication/model/queries';
import type { Medication } from '@/entities/medication/model/types';
import { refreshAfterMedicationChange } from '@/features/add-medication';
import {
  MedicationSheet,
  MedicationSheetSkeleton,
} from '@/features/medication-sheet';
import { ROUTES } from '@/shared/config/routes';
import { todayKstDateString } from '@/shared/lib/kst';
import { Body, Screen } from '@/shared/ui';

/** 약 수정 — 투명 페이지 + MedicationSheet edit */
export function EditMedicationPage() {
  const qc = useQueryClient();
  const { profile } = useAuth();
  const params = useLocalSearchParams<{
    medicationId?: string;
    userId?: string;
  }>();
  const userId = params.userId ?? profile?.id;
  const medicationId = Number(params.medicationId);
  const today = todayKstDateString();
  // replace 후 옛 id 소실해도 시트 닫힐 때까지 유지
  const sheetMedsRef = useRef<Medication[] | null>(null);

  const { meds } = useHomeMedicationQueries({
    userId,
    todayKst: today,
    visibleMonth: today.slice(0, 7),
  });

  const medication = useMemo(
    () => (meds.data ?? []).find((m) => m.id === medicationId) ?? null,
    [meds.data, medicationId],
  );

  const siblingMeds = useMemo(() => {
    if (!medication) return [];
    return (meds.data ?? []).filter((m) => m.name === medication.name);
  }, [meds.data, medication]);

  if (siblingMeds.length > 0) {
    sheetMedsRef.current = siblingMeds;
  }

  const sheetMeds = sheetMedsRef.current ?? siblingMeds;

  const onClose = () => {
    if (router.canGoBack()) router.back();
    else router.replace(ROUTES.home);
  };

  if (meds.isLoading && sheetMeds.length === 0) {
    return (
      <Screen className="bg-transparent">
        <MedicationSheetSkeleton />
      </Screen>
    );
  }

  if (!userId || !Number.isFinite(medicationId) || sheetMeds.length === 0) {
    return (
      <Screen className="items-center justify-center px-6">
        <Body>약을 찾을 수 없어요.</Body>
        <View className="h-4" />
        <Body className="underline" onPress={onClose}>
          돌아가기
        </Body>
      </Screen>
    );
  }

  return (
    <View className="flex-1 bg-transparent">
      <MedicationSheet
        mode="edit"
        userId={userId}
        medications={sheetMeds}
        onClose={onClose}
        onSaved={async () => {
          await refreshAfterMedicationChange(qc);
        }}
      />
    </View>
  );
}
