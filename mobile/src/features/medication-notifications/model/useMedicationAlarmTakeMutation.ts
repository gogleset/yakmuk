import { useMutation, useQueryClient } from '@tanstack/react-query';
import { listMedications } from '@/entities/medication/api/list-medications';
import { listTodayTaken } from '@/entities/medication/api/list-today-taken';
import { toggleTaken } from '@/entities/medication/api/toggle-taken';
import { medicationKeys } from '@/entities/medication/model/queryKeys';
import { medicationAlarmKeys } from '@/features/medication-notifications/model/queryKeys';
import { reconcileMedicationNotifications } from '@/features/medication-notifications/notifications';
import { ERRORS } from '@/shared/copy';
import { todayKstDateString } from '@/shared/lib/kst';
import { showMutationError } from '@/shared/lib/mutation';
import { invalidateHomeActivity } from '@/shared/lib/query-invalidation';

type TakeParams = {
  userId: string;
  familyId: string;
  medicationId: number;
};

/** 알림 풀페이지에서 복약 체크 */
export function useMedicationAlarmTakeMutation() {
  const qc = useQueryClient();

  return useMutation({
    mutationKey: medicationAlarmKeys.take(),
    mutationFn: async ({ userId, familyId, medicationId }: TakeParams) => {
      if (!Number.isFinite(medicationId) || medicationId <= 0) {
        throw new Error(ERRORS.med.checkFailed);
      }
      await toggleTaken({
        userId,
        familyId,
        medicationId,
        currentlyTaken: false,
      });
      return { userId };
    },
    onSuccess: async ({ userId }) => {
      await invalidateHomeActivity(qc);
      const today = todayKstDateString();
      const [meds, taken] = await Promise.all([
        listMedications(userId),
        listTodayTaken(userId, today),
      ]);
      await reconcileMedicationNotifications(meds, taken);
      await qc.invalidateQueries({
        queryKey: medicationKeys.taken(userId, today),
      });
    },
    onError: (error) => showMutationError(ERRORS.med.checkFailed, error),
  });
}
