import { router, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/providers/AuthProvider';
import {
  AddMedicationSheet,
  refreshAfterMedicationChange,
} from '@/features/add-medication';
import { ROUTES } from '@/shared/config/routes';

/** 약 추가 — 투명 페이지 + BottomSheet */
export function AddMedicationPage() {
  const qc = useQueryClient();
  const { profile } = useAuth();
  const params = useLocalSearchParams<{ userId?: string }>();
  const userId = params.userId ?? profile?.id;

  const onClose = () => {
    if (router.canGoBack()) router.back();
    else router.replace(ROUTES.home);
  };

  return (
    <View className="flex-1 bg-transparent">
      <AddMedicationSheet
        userId={userId}
        onClose={onClose}
        onAdded={async () => {
          await refreshAfterMedicationChange(qc);
        }}
      />
    </View>
  );
}
