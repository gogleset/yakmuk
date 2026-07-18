import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addMedications } from '@/entities/medication/api/add-medication';
import type { MedScheduleSlot } from '@/entities/medication/lib/daysMask';
import { addMedicationKeys } from '@/features/add-medication/model/queryKeys';
import {
  invalidateHomeActivity,
  invalidateMedicationLists,
} from '@/shared/lib/query-invalidation';
import { showMutationError } from '@/shared/lib/mutation';
import { ERRORS } from '@/shared/copy';

type AddMedicationsInput = {
  userId: string;
  name: string;
  slots: MedScheduleSlot[];
};

type Params = {
  onSuccess?: () => void | Promise<void>;
};

/** 약 추가 use case (다중 슬롯) */
export function useAddMedicationMutation({ onSuccess }: Params = {}) {
  const qc = useQueryClient();

  return useMutation({
    mutationKey: addMedicationKeys.add(),
    mutationFn: (input: AddMedicationsInput) => addMedications(input),
    onSuccess: async () => {
      await invalidateMedicationLists(qc);
      await invalidateHomeActivity(qc);
      await onSuccess?.();
    },
    onError: (error) => showMutationError(ERRORS.med.addFailed, error),
  });
}

export async function refreshAfterMedicationChange(
  qc: ReturnType<typeof useQueryClient>,
) {
  await invalidateMedicationLists(qc);
  await invalidateHomeActivity(qc);
}
