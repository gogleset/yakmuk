import { useMutation, useQueryClient } from '@tanstack/react-query';
import { upsertAlert } from '@/entities/family/api/upsert-alert';
import { deleteMedication } from '@/entities/medication/api/delete-medication';
import { toggleTaken } from '@/entities/medication/api/toggle-taken';
import { stepDayLoop } from '@/entities/medication/lib/loop/dayLoop';
import { dailyMedicationCheckKeys } from '@/features/daily-medication-check/model/queryKeys';
import { createSupabaseLoopStore } from '@/shared/lib/loop/supabaseLoopStore';
import {
  invalidateHomeActivity,
  invalidateMedicationLists,
} from '@/shared/lib/query-invalidation';
import { showMutationError } from '@/shared/lib/mutation';
import { COPY, ERRORS } from '@/shared/copy';

const loopStore = createSupabaseLoopStore();

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
      if (!userId || !familyId) throw new Error(ERRORS.auth.profileLoadFailed);
      const currentlyTaken = takenMedIds.has(medicationId);
      const pendingIdsAfter = currentlyTaken
        ? [...pendingIds, medicationId]
        : pendingIds.filter((id) => id !== medicationId);

      await toggleTaken({
        userId,
        familyId,
        medicationId,
        currentlyTaken,
      });

      await stepDayLoop({
        store: loopStore,
        userId,
        trigger: 'in_app',
        plan: { action: 'toggle_medication', medicationId },
        actResult: {
          kind: 'toggle_medication',
          payload: { medicationId, taken: !currentlyTaken },
        },
        pendingMedicationIds: pendingIdsAfter,
        onStuckEscalate: async (info) => {
          await upsertAlert({
            familyId,
            userId,
            kind: 'stuck_escalate',
            message: COPY.alert.medCheckStalled,
            payload: {
              runId: info.runId,
              pendingHash: info.pendingHash,
              pendingCount: info.pendingCount,
              dateKst: info.dateKst,
            },
          });
        },
      });
    },
    onSuccess: () => void invalidate(),
    onError: (error) => showMutationError(ERRORS.med.checkFailed, error),
  });

  const remove = useMutation({
    mutationKey: dailyMedicationCheckKeys.remove(),
    mutationFn: deleteMedication,
    onSuccess: async () => {
      await invalidateMedicationLists(qc);
      await invalidate();
    },
    onError: (error) => showMutationError(ERRORS.med.deleteFailed, error),
  });

  /** 오늘 남은 약 전부 taken */
  const markAllTaken = useMutation({
    mutationKey: dailyMedicationCheckKeys.markAll(),
    mutationFn: async () => {
      if (!userId || !familyId) throw new Error(ERRORS.auth.profileLoadFailed);
      if (pendingIds.length === 0) return;

      for (const medicationId of pendingIds) {
        await toggleTaken({
          userId,
          familyId,
          medicationId,
          currentlyTaken: false,
        });
      }

      await stepDayLoop({
        store: loopStore,
        userId,
        trigger: 'in_app',
        plan: { action: 'toggle_medication', medicationId: pendingIds[0]! },
        actResult: {
          kind: 'toggle_medication',
          payload: { medicationId: pendingIds[0]!, taken: true },
        },
        pendingMedicationIds: [],
        onStuckEscalate: async (info) => {
          await upsertAlert({
            familyId,
            userId,
            kind: 'stuck_escalate',
            message: COPY.alert.medCheckStalled,
            payload: {
              runId: info.runId,
              pendingHash: info.pendingHash,
              pendingCount: info.pendingCount,
              dateKst: info.dateKst,
            },
          });
        },
      });
    },
    onSuccess: () => void invalidate(),
    onError: (error) => showMutationError(ERRORS.med.checkFailed, error),
  });

  return { toggle, remove, markAllTaken };
}
