import { useMutation, useQueryClient } from '@tanstack/react-query';
import { replaceMedicationSchedule } from '@/entities/medication/api/replace-medication-schedule';
import type { MedScheduleSlot } from '@/entities/medication/lib/daysMask';
import { editMedicationKeys } from '@/features/edit-medication/model/queryKeys';
import {
  invalidateHomeActivity,
  invalidateMedicationLists,
} from '@/shared/lib/query-invalidation';
import { showMutationError } from '@/shared/lib/mutation';
import { ERRORS } from '@/shared/copy';

type ReplaceInput = {
  userId: string;
  replaceMedicationIds: number[];
  name: string;
  slots: MedScheduleSlot[];
};

type Params = {
  onSuccess?: () => void | Promise<void>;
};

/** 약 일정 수정 — 같은 이름 슬롯 묶음 교체 */
export function useReplaceMedicationScheduleMutation({ onSuccess }: Params = {}) {
  const qc = useQueryClient();

  return useMutation({
    mutationKey: editMedicationKeys.replace(),
    mutationFn: (input: ReplaceInput) => replaceMedicationSchedule(input),
    onSuccess: async () => {
      await invalidateMedicationLists(qc);
      await invalidateHomeActivity(qc);
      await onSuccess?.();
    },
    onError: (error) => showMutationError(ERRORS.med.updateFailed, error),
  });
}
