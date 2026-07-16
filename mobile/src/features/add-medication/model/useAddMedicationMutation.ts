import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addMedication } from '@/entities/medication/api/add-medication';
import { addMedicationKeys } from '@/features/add-medication/model/queryKeys';
import {
  invalidateHomeActivity,
  invalidateMedicationLists,
} from '@/shared/lib/query-invalidation';
import { showMutationError } from '@/shared/lib/mutation';

type AddMedicationInput = {
  userId: string;
  name: string;
  scheduledTime: string;
};

type Params = {
  onSuccess?: () => void | Promise<void>;
};

/** 약 추가 use case */
export function useAddMedicationMutation({ onSuccess }: Params = {}) {
  const qc = useQueryClient();

  return useMutation({
    mutationKey: addMedicationKeys.add(),
    mutationFn: (input: AddMedicationInput) => addMedication(input),
    onSuccess: async () => {
      await invalidateMedicationLists(qc);
      await invalidateHomeActivity(qc);
      await onSuccess?.();
    },
    onError: (error) => showMutationError('추가하지 못했어요', error),
  });
}

export async function refreshAfterMedicationChange(qc: ReturnType<typeof useQueryClient>) {
  await invalidateMedicationLists(qc);
  await invalidateHomeActivity(qc);
}
