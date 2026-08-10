import { useMutation, useQueryClient } from '@tanstack/react-query';
import { markFeedDayRead } from '@/entities/family/api/mark-feed-day-read';
import { familyKeys, familyMutationKeys } from '@/entities/family/model/queryKeys';

type MarkArgs = {
  familyId: string;
  logDate: string;
};

export function useMarkFeedDayReadMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: familyMutationKeys.markFeedDayRead(),
    mutationFn: ({ familyId, logDate }: MarkArgs) =>
      markFeedDayRead(familyId, logDate),
    onSuccess: (_data, { familyId }) => {
      void qc.invalidateQueries({
        queryKey: familyKeys.feedDayReads(familyId),
      });
    },
  });
}
