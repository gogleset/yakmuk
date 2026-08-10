import { type QueryClient, useQueries, useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { listAlerts } from '@/entities/family/api/list-alerts';
import { listFamilyMembers } from '@/entities/family/api/list-family-members';
import { listFeed } from '@/entities/family/api/list-feed';
import { listFeedDayReads } from '@/entities/family/api/list-feed-day-reads';
import { listTodayStatus } from '@/entities/family/api/list-today-status';
import { listWeeklyDigest } from '@/entities/family/api/list-weekly-digest';
import { subscribeFamilyRoster } from '@/entities/family/api/subscribe-family-roster';
import { subscribeFeed } from '@/entities/family/api/subscribe-feed';
import { weekStartMondayKst } from '@/entities/family/lib/buildWeeklyDigest';
import { familyKeys } from '@/entities/family/model/queryKeys';
import { invalidateFamilyInvites } from '@/entities/user/model/queries';
import { LIMITS } from '@/shared/constants';
import { addDaysKst } from '@/shared/lib/kst';

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
  const feedSince = addDaysKst(
    todayKst,
    -(LIMITS.familyFeedWindowDays - 1),
  );

  const [status, alerts, feed, members, feedDayReads] = useQueries({
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
        queryKey: familyKeys.feed(familyId!, feedSince),
        queryFn: () =>
          listFeed(familyId!, { sinceLogDate: feedSince }),
        enabled,
      },
      {
        queryKey: familyKeys.members(familyId!),
        queryFn: () => listFamilyMembers(familyId!),
        enabled,
      },
      {
        queryKey: familyKeys.feedDayReads(familyId!),
        queryFn: () => listFeedDayReads(familyId!),
        enabled,
      },
    ],
  });

  return { status, alerts, feed, members, feedDayReads };
}

export function useFamilyMembersQuery(familyId: string | null | undefined) {
  return useQuery({
    queryKey: familyKeys.members(familyId!),
    queryFn: () => listFamilyMembers(familyId!),
    enabled: !!familyId,
  });
}

/** 보호자 주간 안부 — weekStart로 캐시 */
export function useWeeklyDigestQuery(
  familyId: string | null | undefined,
  todayKst: string,
  enabled = true,
) {
  const weekStart = weekStartMondayKst(todayKst);
  return useQuery({
    queryKey: familyKeys.weeklyDigest(familyId ?? '', weekStart),
    queryFn: () => listWeeklyDigest(familyId!, todayKst),
    enabled: !!familyId && enabled,
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

/** 초대 클레임·멤버 입퇴장 → 초대/멤버/상태 즉시 무효화 */
export function useFamilyRosterSubscription(
  familyId: string | null | undefined,
  qc: QueryClient,
): void {
  useEffect(() => {
    if (!familyId) return;
    return subscribeFamilyRoster(familyId, () => {
      void Promise.all([
        invalidateFamilyActivity(qc),
        invalidateFamilyInvites(qc),
      ]);
    });
  }, [familyId, qc]);
}

export async function invalidateFamilyActivity(qc: QueryClient): Promise<void> {
  await qc.invalidateQueries({ queryKey: familyKeys.all });
}
