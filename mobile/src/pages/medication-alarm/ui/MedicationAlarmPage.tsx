import { router, useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';
import { useMedicationAlarmTakeMutation } from '@/features/medication-notifications';
import { useAuth } from '@/providers/AuthProvider';
import { ACTIONS, COPY } from '@/shared/copy';
import { Button, Screen } from '@/shared/ui';

function firstParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? '';
  return value ?? '';
}

/** 약 알림 탭/FSI → 풀페이지 복약 확인 */
export function MedicationAlarmPage() {
  const { profile } = useAuth();
  const params = useLocalSearchParams<{
    medicationId?: string | string[];
    name?: string | string[];
    scheduledTime?: string | string[];
  }>();

  const medicationId = Number(firstParam(params.medicationId));
  const name = firstParam(params.name) || COPY.notif.doseTitle;
  const scheduledTime = firstParam(params.scheduledTime);

  const take = useMedicationAlarmTakeMutation();

  const onTake = () => {
    if (!profile?.id || !profile.familyId) {
      // mutation onError와 동일 톤 — 프로필 없으면 진행 불가
      return;
    }
    if (!Number.isFinite(medicationId) || medicationId <= 0) {
      return;
    }
    take.mutate(
      {
        userId: profile.id,
        familyId: profile.familyId,
        medicationId,
      },
      {
        onSuccess: () => {
          if (router.canGoBack()) router.back();
          else router.replace('/(tabs)/home');
        },
      },
    );
  };

  const onClose = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/home');
  };

  return (
    <Screen className="bg-canvas">
      <View className="flex-1 justify-between px-6 py-8">
        <View className="gap-3 pt-10">
          {scheduledTime ? (
            <Text className="text-sm font-semibold text-muted">
              {scheduledTime}
            </Text>
          ) : null}
          <Text className="text-3xl font-bold text-brand">
            {COPY.notif.doseTitle}
          </Text>
          <Text className="text-xl font-semibold text-ink">{name}</Text>
        </View>

        <View className="gap-3 pb-4">
          <Button
            label={COPY.notif.alarmTaken}
            onPress={onTake}
            disabled={
              take.isPending ||
              !profile?.id ||
              !profile.familyId ||
              !Number.isFinite(medicationId)
            }
          />
          <Button
            label={ACTIONS.close}
            variant="ghost"
            onPress={onClose}
            disabled={take.isPending}
          />
        </View>
      </View>
    </Screen>
  );
}
