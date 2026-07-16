import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteMedication } from '@/entities/medication/api/delete-medication';
import { toggleTaken } from '@/entities/medication/api/toggle-taken';
import { dailyMedicationCheckKeys } from '@/features/daily-medication-check/model/queryKeys';
import {
  invalidateHomeActivity,
  invalidateMedicationLists,
} from '@/shared/lib/query-invalidation';
import { showMutationError } from '@/shared/lib/mutation';

type Params = {
  userId: string | undefined;
  familyId: string | null | undefined;
  takenMedIds: Set<number>;
  pendingIds: number[];
};

/** 오늘 약 체크·삭제 use case */
export function useDailyMedicationCheckMutations({
  userId,
  familyId,
  takenMedIds,
  pendingIds,
}: Params) {
  const qc = useQueryClient();
  const invalidate = () => invalidateHomeActivity(qc);

  const toggle = useMutation({
    mutationKey: dailyMedicationCheckKeys.toggle(),
    mutationFn: async (medicationId: number) => {
      if (!userId || !familyId) throw new Error('프로필을 불러오지 못했어요');
      const currentlyTaken = takenMedIds.has(medicationId);
      const pendingIdsAfter = currentlyTaken
        ? [...pendingIds, medicationId]
        : pendingIds.filter((id) => id !== medicationId);
      await toggleTaken({
        userId,
        familyId,
        medicationId,
        currentlyTaken,
        pendingIdsAfter,
      });
    },
    onSuccess: () => void invalidate(),
    onError: (error) => showMutationError('체크하지 못했어요', error),
  });

  const remove = useMutation({
    mutationKey: dailyMedicationCheckKeys.remove(),
    mutationFn: deleteMedication,
    onSuccess: async () => {
      await invalidateMedicationLists(qc);
      await invalidate();
    },
    onError: (error) => showMutationError('삭제하지 못했어요', error),
  });

  return { toggle, remove };
}
