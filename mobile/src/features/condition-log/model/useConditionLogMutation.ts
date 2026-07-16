import { Alert } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { submitCondition } from '@/entities/medication/api/submit-condition';
import type { ConditionValue } from '@/entities/medication/model/types';
import { conditionLogKeys } from '@/features/condition-log/model/queryKeys';
import { invalidateHomeActivity } from '@/shared/lib/query-invalidation';
import { showMutationError } from '@/shared/lib/mutation';

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
      if (!userId || !familyId) throw new Error('프로필을 불러오지 못했어요');
      await submitCondition({
        userId,
        familyId,
        condition,
        message,
        pendingIds,
      });
    },
    onSuccess: () => {
      void invalidateHomeActivity(qc);
      Alert.alert('저장했어요', '오늘 컨디션을 가족에게 전했어요');
    },
    onError: (error) => showMutationError('저장하지 못했어요', error),
  });
}
