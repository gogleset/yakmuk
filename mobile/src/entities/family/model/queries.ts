import { type QueryClient, useQueries } from '@tanstack/react-query';
import { useEffect } from 'react';
import { listAlerts } from '@/entities/family/api/list-alerts';
import { listFeed } from '@/entities/family/api/list-feed';
import { listTodayStatus } from '@/entities/family/api/list-today-status';
import { subscribeFeed } from '@/entities/family/api/subscribe-feed';
import { familyKeys } from '@/entities/family/model/queryKeys';

type FamilyScreenQueryParams = {
  familyId: string | null | undefined;
  todayKst: string;
  isGuardian: boolean;
};

export function useFamilyScreenQueries({
  familyId,
  todayKst,
  isGuardian,
}: FamilyScreenQueryParams) {
  const enabled = !!familyId;

  const [status, alerts, feed] = useQueries({
    queries: [
      {
        queryKey: familyKeys.status(familyId!, todayKst),
        queryFn: () => listTodayStatus(familyId!, todayKst),
        enabled: enabled && isGuardian,
      },
      {
        queryKey: familyKeys.alerts(familyId!),
        queryFn: () => listAlerts(familyId!),
        enabled: enabled && isGuardian,
      },
      {
        queryKey: familyKeys.feed(familyId!),
        queryFn: () => listFeed(familyId!),
        enabled,
      },
    ],
  });

  return { status, alerts, feed };
}

export function useFamilyFeedSubscription(
  familyId: string | null | undefined,
  qc: QueryClient,
): void {
  useEffect(() => {
    if (!familyId) return;
    return subscribeFeed(familyId, () => {
      void invalidateFamilyActivity(qc);
    });
  }, [familyId, qc]);
}

export async function invalidateFamilyActivity(qc: QueryClient): Promise<void> {
  await qc.invalidateQueries({ queryKey: familyKeys.all });
}
