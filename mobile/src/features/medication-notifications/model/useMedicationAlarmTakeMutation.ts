import { useMutation, useQueryClient } from '@tanstack/react-query';
import { buildCarePushCopy, invokeCarePush } from '@/entities/family';
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
  medicationIds: number[];
  /** 푸시 카피용 */
  nickname?: string | null;
  /** @deprecated 번복 불가 — true면 no-op */
  currentlyTaken?: boolean;
};

/** 알림 풀페이지에서 복약 체크 (해제 없음) */
export function useMedicationAlarmTakeMutation() {
  const qc = useQueryClient();

  return useMutation({
    mutationKey: medicationAlarmKeys.take(),
    mutationFn: async ({
      userId,
      familyId,
      medicationIds,
      nickname,
      currentlyTaken = false,
    }: TakeParams) => {
      // 체크 완료 번복은 지원하지 않음
      if (currentlyTaken) {
        return {
          userId,
          familyId,
          nickname,
          takenCount: 0,
          currentlyTaken: true,
        };
      }
      const ids = medicationIds.filter(
        (id) => Number.isFinite(id) && id > 0,
      );
      if (ids.length === 0) {
        throw new Error(ERRORS.med.checkFailed);
      }
      await Promise.all(
        ids.map((medicationId) =>
          toggleTaken({
            userId,
            familyId,
            medicationId,
            currentlyTaken: false,
          }),
        ),
      );
      return {
        userId,
        familyId,
        nickname,
        takenCount: ids.length,
        currentlyTaken: false,
      };
    },
    onSuccess: async ({
      userId,
      familyId,
      nickname,
      currentlyTaken,
    }) => {
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
      await qc.invalidateQueries({
        queryKey: medicationKeys.list(userId),
      });

      if (!currentlyTaken && familyId) {
        const copy = buildCarePushCopy('taken', nickname);
        void invokeCarePush({
          kind: 'taken',
          familyId,
          actorUserId: userId,
          title: copy.title,
          body: copy.body,
        });
      }
    },
    onError: (error) => showMutationError(ERRORS.med.checkFailed, error),
  });
}
