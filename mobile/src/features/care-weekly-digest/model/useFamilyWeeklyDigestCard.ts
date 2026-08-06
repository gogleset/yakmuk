import { useCallback, useEffect, useState } from 'react';
import {
  useWeeklyDigestQuery,
  weekStartMondayKst,
  type WeeklyDigestView,
} from '@/entities/family';
import type { UserRole } from '@/entities/user/model/types';
import {
  dismissWeeklyDigestWeek,
  getDismissedWeeklyDigestWeek,
  getWeeklyDigestOpt,
  isWeeklyDigestDismissed,
} from '@/features/care-weekly-digest/lib/weeklyDigestOpt';

function isDigestViewerRole(role: UserRole | null | undefined): boolean {
  return role === 'family_leader' || role === 'guardian';
}

type Params = {
  familyId: string | null | undefined;
  todayKst: string;
  role: UserRole | null | undefined;
};

/** 보호자 · 옵트 ON · 미dismiss 주만 카드 노출 */
export function useFamilyWeeklyDigestCard({
  familyId,
  todayKst,
  role,
}: Params): {
  digest: WeeklyDigestView | null;
  visible: boolean;
  onAck: () => void;
} {
  const isViewer = isDigestViewerRole(role);
  const weekStart = weekStartMondayKst(todayKst);
  const [optOn, setOptOn] = useState(true);
  const [dismissedWeek, setDismissedWeek] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const [opt, dismissed] = await Promise.all([
        getWeeklyDigestOpt(),
        getDismissedWeeklyDigestWeek(),
      ]);
      if (cancelled) return;
      setOptOn(opt);
      setDismissedWeek(dismissed);
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [weekStart]);

  const query = useWeeklyDigestQuery(
    familyId,
    todayKst,
    isViewer && optOn && ready,
  );

  const dismissed = isWeeklyDigestDismissed(weekStart, dismissedWeek);
  const digest = query.data ?? null;
  const visible =
    isViewer && optOn && ready && !dismissed && digest != null;

  const onAck = useCallback(() => {
    setDismissedWeek(weekStart);
    void dismissWeeklyDigestWeek(weekStart);
  }, [weekStart]);

  return { digest, visible, onAck };
}
