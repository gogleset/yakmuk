import { type QueryClient, useQueries, useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { listAlerts } from '@/entities/family/api/list-alerts';
import { listFamilyMembers } from '@/entities/family/api/list-family-members';
import { listFeed } from '@/entities/family/api/list-feed';
import { listTodayStatus } from '@/entities/family/api/list-today-status';
import { subscribeFeed } from '@/entities/family/api/subscribe-feed';
import { familyKeys } from '@/entities/family/model/queryKeys';

type FamilyScreenQueryParams = {
  familyId: string | null | undefined;
  todayKst: string;
};

/** 가족 탭 — 전원 대칭 조회 */
export function useFamilyScreenQueries({
  familyId,
  todayKst,
}: FamilyScreenQueryParams) {
  const enabled = !!familyId;

  const [status, alerts, feed, members] = useQueries({
    queries: [
      {
        queryKey: familyKeys.status(familyId!, todayKst),
        queryFn: () => listTodayStatus(familyId!, todayKst),
        enabled,
      },
      {
        queryKey: familyKeys.alerts(familyId!),
        queryFn: () => listAlerts(familyId!),
        enabled,
      },
      {
        queryKey: familyKeys.feed(familyId!),
        queryFn: () => listFeed(familyId!),
        enabled,
      },
      {
        queryKey: familyKeys.members(familyId!),
        queryFn: () => listFamilyMembers(familyId!),
        enabled,
      },
    ],
  });

  return { status, alerts, feed, members };
}

export function useFamilyMembersQuery(familyId: string | null | undefined) {
  return useQuery({
    queryKey: familyKeys.members(familyId!),
    queryFn: () => listFamilyMembers(familyId!),
    enabled: !!familyId,
  });
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
