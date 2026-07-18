import { Alert } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { upsertAlert } from '@/entities/family/api/upsert-alert';
import { submitCondition } from '@/entities/medication/api/submit-condition';
import { stepDayLoop } from '@/entities/medication/lib/loop/dayLoop';
import type { ConditionValue } from '@/entities/medication/model/types';
import { conditionLogKeys } from '@/features/condition-log/model/queryKeys';
import { createSupabaseLoopStore } from '@/shared/lib/loop/supabaseLoopStore';
import { invalidateHomeActivity } from '@/shared/lib/query-invalidation';
import { showMutationError } from '@/shared/lib/mutation';
import { COPY, ERRORS } from '@/shared/copy';
import { todayKstDateString } from '@/shared/lib/kst';

const loopStore = createSupabaseLoopStore();

type Params = {
  userId: string | undefined;
  familyId: string | null | undefined;
  condition: ConditionValue;
  message: string;
  pendingIds: number[];
};

/** 컨디션 기록 use case */
export function useConditionLogMutation({
  userId,
  familyId,
  condition,
  message,
  pendingIds,
}: Params) {
  const qc = useQueryClient();

  return useMutation({
    mutationKey: conditionLogKeys.submit(),
    mutationFn: async () => {
      if (!userId || !familyId) throw new Error(ERRORS.auth.profileLoadFailed);

      await submitCondition({
        userId,
        familyId,
        condition,
        message,
      });

      if (condition === 'BAD') {
        await upsertAlert({
          familyId,
          userId,
          kind: 'bad_condition',
          message: message.trim() || COPY.condition.defaultBadMessage,
          payload: { dateKst: todayKstDateString(), condition: 'BAD' },
        });
      }

      await stepDayLoop({
        store: loopStore,
        userId,
        trigger: 'in_app',
        plan: { action: 'submit_condition', condition },
        actResult: {
          kind: 'submit_condition',
          payload: { condition },
        },
        pendingMedicationIds: pendingIds,
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
    onSuccess: () => {
      void invalidateHomeActivity(qc);
      Alert.alert(COPY.condition.savedTitle, COPY.condition.savedBody);
    },
    onError: (error) => showMutationError(ERRORS.condition.saveFailed, error),
  });
}
