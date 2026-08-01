import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { listMedications } from '@/entities/medication/api/list-medications';
import { listTodayTaken } from '@/entities/medication/api/list-today-taken';
import { medicationKeys } from '@/entities/medication/model/queryKeys';
import type { Medication } from '@/entities/medication/model/types';
import {
  notifDebug,
  reconcileMedicationNotifications,
} from '@/features/medication-notifications/notifications';
import { registerExpoPushToken } from '@/features/medication-notifications/registerExpoPushToken';
import { useAuth } from '@/providers/AuthProvider';
import { todayKstDateString } from '@/shared/lib/kst';

/** meds/taken 참조가 바뀌어도 내용 같으면 reconcile 스킵용 */
function scheduleSyncKey(meds: Medication[], taken: Set<number>): string {
  const medPart = meds
    .map(
      (m) =>
        `${m.id}:${m.scheduledTime}:${m.daysMask}:${m.notificationEnabled !== false ? 1 : 0}`,
    )
    .join(',');
  const takenPart = [...taken].sort((a, b) => a - b).join(',');
  return `${medPart}|${takenPart}`;
}

/**
 * 앱 시작·포그라운드 복귀·meds/taken 변경 시 로컬 약 알림 reconcile.
 * Auth 아래 QueryClient 안에서만 마운트.
 */
export function MedicationNotificationSync() {
  const { profile } = useAuth();
  const userId = profile?.id;
  const today = todayKstDateString();
  const qc = useQueryClient();
  const running = useRef(false);
  const pushRegistered = useRef<string | null>(null);
  const lastSyncKey = useRef<string | null>(null);
  const appState = useRef<AppStateStatus>(AppState.currentState);

  const medsQuery = useQuery({
    queryKey: medicationKeys.list(userId ?? ''),
    queryFn: () => listMedications(userId!),
    enabled: !!userId,
  });

  const takenQuery = useQuery({
    queryKey: medicationKeys.taken(userId ?? '', today),
    queryFn: () => listTodayTaken(userId!, today),
    enabled: !!userId,
  });

  const medsData = medsQuery.data;
  const takenData = takenQuery.data;

  // 공지용 Expo push token (EAS 없으면 skip)
  useEffect(() => {
    if (!userId) {
      pushRegistered.current = null;
      return;
    }
    if (pushRegistered.current === userId) return;
    pushRegistered.current = userId;
    void registerExpoPushToken(userId);
  }, [userId]);

  useEffect(() => {
    if (!userId || !medsData || !takenData) return;

    const key = scheduleSyncKey(medsData, takenData);
    if (lastSyncKey.current === key) return;
    if (running.current) return;

    running.current = true;
    lastSyncKey.current = key;
    notifDebug('hook', { reason: 'query-data', meds: medsData.length });
    void reconcileMedicationNotifications(medsData, takenData).finally(() => {
      running.current = false;
    });
  }, [userId, medsData, takenData]);

  useEffect(() => {
    const onChange = (next: AppStateStatus) => {
      const prev = appState.current;
      appState.current = next;
      // background/inactive → active 만 (권한 시트 등으로 인한 중복 active 무시하려면 prev 체크)
      if (next !== 'active' || prev === 'active' || !userId) return;

      notifDebug('hook', { reason: 'appstate-active', from: prev });
      // 포그라운드 복귀 시 강제 재reconcile 허용
      lastSyncKey.current = null;
      void qc.invalidateQueries({ queryKey: medicationKeys.list(userId) });
      void qc.invalidateQueries({
        queryKey: medicationKeys.taken(userId, todayKstDateString()),
      });
    };
    const sub = AppState.addEventListener('change', onChange);
    return () => sub.remove();
  }, [userId, qc]);

  return null;
}
