import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import {
  familyKeys,
  listTodayStatus,
  type CareRecipientTodayStatus,
} from '@/entities/family';
import { useAuth } from '@/providers/AuthProvider';
import { todayKstDateString } from '@/shared/lib/kst';
import { buildGlanceLine } from './lib/buildGlanceLine';
import {
  getCareGlanceOpt,
  getCareGlanceUpdatedAt,
  isCareGlanceStale,
  subscribeCareGlanceOpt,
} from './lib/careGlanceOpt';
import { isGlanceViewerRole, pickGlanceMember } from './lib/pickGlanceMember';
import { syncCareGlance } from './syncCareGlance';

function glanceSyncKey(
  members: CareRecipientTodayStatus[],
  myUserId: string | undefined,
): string {
  const m = pickGlanceMember(members, myUserId);
  if (!m) return 'empty';
  return `${m.userId}:${buildGlanceLine(m)}`;
}

/**
 * 보호자 glance 알림 동기화 — 포그라운드·today status·Realtime invalidate.
 * 피보호자·옵트 OFF면 cancel.
 */
export function CareGlanceSync() {
  const { profile } = useAuth();
  const qc = useQueryClient();
  const userId = profile?.id;
  const familyId = profile?.familyId;
  const role = profile?.role;
  const today = todayKstDateString();
  const running = useRef(false);
  const lastKey = useRef<string | null>(null);
  const appState = useRef<AppStateStatus>(AppState.currentState);

  const isViewer = isGlanceViewerRole(role);

  const statusQuery = useQuery({
    queryKey: familyKeys.status(familyId ?? '', today),
    queryFn: () => listTodayStatus(familyId!, today),
    enabled: !!familyId && isViewer,
  });

  const members = statusQuery.data;

  useEffect(() => {
    if (!userId) {
      lastKey.current = null;
      void syncCareGlance({
        role: null,
        myUserId: null,
        members: [],
        force: true,
      });
      return;
    }

    if (!isViewer || !members) {
      if (!isViewer) {
        lastKey.current = null;
        void syncCareGlance({
          role,
          myUserId: userId,
          members: [],
          force: true,
        });
      }
      return;
    }

    const key = glanceSyncKey(members, userId);
    if (lastKey.current === key) return;
    if (running.current) return;

    running.current = true;
    lastKey.current = key;
    void syncCareGlance({
      role,
      myUserId: userId,
      members,
      force: true,
    }).finally(() => {
      running.current = false;
    });
  }, [isViewer, userId, role, members]);

  useEffect(() => {
    return subscribeCareGlanceOpt(() => {
      lastKey.current = null;
      if (!userId || !isViewer) {
        void syncCareGlance({
          role,
          myUserId: userId,
          members: [],
          force: true,
        });
        return;
      }
      if (familyId) {
        void qc.invalidateQueries({
          queryKey: familyKeys.status(familyId, todayKstDateString()),
        });
      }
      void syncCareGlance({
        role,
        myUserId: userId,
        members: members ?? [],
        force: true,
      });
    });
  }, [userId, isViewer, role, familyId, members, qc]);

  useEffect(() => {
    const onChange = (next: AppStateStatus) => {
      const prev = appState.current;
      appState.current = next;
      if (next !== 'active' || prev === 'active' || !userId || !isViewer) {
        return;
      }

      void (async () => {
        const opt = await getCareGlanceOpt();
        if (!opt) {
          lastKey.current = null;
          void syncCareGlance({
            role,
            myUserId: userId,
            members: [],
            force: true,
          });
          return;
        }
        const updatedAt = await getCareGlanceUpdatedAt();
        if (isCareGlanceStale(updatedAt) || lastKey.current != null) {
          lastKey.current = null;
          if (familyId) {
            void qc.invalidateQueries({
              queryKey: familyKeys.status(familyId, todayKstDateString()),
            });
          }
        }
      })();
    };
    const sub = AppState.addEventListener('change', onChange);
    return () => sub.remove();
  }, [userId, isViewer, role, familyId, qc]);

  return null;
}
