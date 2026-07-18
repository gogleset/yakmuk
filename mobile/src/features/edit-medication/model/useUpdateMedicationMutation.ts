import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateMedication } from '@/entities/medication/api/update-medication';
import { editMedicationKeys } from '@/features/edit-medication/model/queryKeys';
import {
  invalidateHomeActivity,
  invalidateMedicationLists,
} from '@/shared/lib/query-invalidation';
import { showMutationError } from '@/shared/lib/mutation';
import { ERRORS } from '@/shared/copy';

type UpdateInput = {
  medicationId: number;
  name: string;
  scheduledTime: string;
  daysMask: string;
};

type Params = {
  onSuccess?: () => void | Promise<void>;
};

/** 약 수정 use case (보호자·본인) */
export function useUpdateMedicationMutation({ onSuccess }: Params = {}) {
  const qc = useQueryClient();

  return useMutation({
    mutationKey: editMedicationKeys.update(),
    mutationFn: (input: UpdateInput) => updateMedication(input),
    onSuccess: async () => {
      await invalidateMedicationLists(qc);
      await invalidateHomeActivity(qc);
      await onSuccess?.();
    },
    onError: (error) => showMutationError(ERRORS.med.updateFailed, error),
  });
}
