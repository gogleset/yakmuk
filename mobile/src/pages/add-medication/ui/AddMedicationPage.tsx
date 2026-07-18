import { router, useLocalSearchParams } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/providers/AuthProvider';
import {
  AddMedicationFunnel,
  refreshAfterMedicationChange,
} from '@/features/add-medication';
import { ROUTES } from '@/shared/config/routes';

/** P3 약 추가 풀페이지 퍼널 */
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
    <AddMedicationFunnel
      userId={userId}
      onClose={onClose}
      onAdded={async () => {
        await refreshAfterMedicationChange(qc);
      }}
    />
  );
}
