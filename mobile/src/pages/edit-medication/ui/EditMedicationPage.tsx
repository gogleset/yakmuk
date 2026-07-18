import { router, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/providers/AuthProvider';
import { useHomeMedicationQueries } from '@/entities/medication/model/queries';
import { refreshAfterMedicationChange } from '@/features/add-medication';
import { EditMedicationFunnel } from '@/features/edit-medication';
import { ROUTES } from '@/shared/config/routes';
import { COLORS } from '@/shared/config/theme';
import { todayKstDateString } from '@/shared/lib/kst';
import { Body, Screen } from '@/shared/ui';

/** P4 약 수정 풀페이지 */
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

  const { meds } = useHomeMedicationQueries({
    userId,
    todayKst: today,
    visibleMonth: today.slice(0, 7),
  });

  const medication = useMemo(
    () => (meds.data ?? []).find((m) => m.id === medicationId) ?? null,
    [meds.data, medicationId],
  );

  const onClose = () => {
    if (router.canGoBack()) router.back();
    else router.replace(ROUTES.home);
  };

  if (meds.isLoading) {
    return (
      <Screen className="items-center justify-center">
        <ActivityIndicator color={COLORS.brand} />
      </Screen>
    );
  }

  if (!medication || !Number.isFinite(medicationId)) {
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
    <EditMedicationFunnel
      medication={medication}
      onClose={onClose}
      onUpdated={async () => {
        await refreshAfterMedicationChange(qc);
      }}
    />
  );
}
