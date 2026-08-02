import Constants, { ExecutionEnvironment } from 'expo-constants';
import { router, useRootNavigationState } from 'expo-router';
import { useEffect, useRef } from 'react';
import {
  AppState,
  InteractionManager,
  Platform,
  type AppStateStatus,
} from 'react-native';
import { subscribeAndroidNotifeeOpen } from '@/features/medication-notifications/androidNotifee';
import { wasColdStartAlarmHandled } from '@/features/medication-notifications/coldStartAlarmFlag';
import { MED_NOTIF_KIND } from '@/features/medication-notifications/fingerprint';
import { notifDebug } from '@/features/medication-notifications/notifDebug';
import { consumePendingAlarmOpen } from '@/features/medication-notifications/pendingAlarmOpen';
import { useAuth } from '@/providers/AuthProvider';
import { medicationAlarmRoute } from '@/shared/config/routes';

const isExpoGo =
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

type NotifResponse = {
  notification: {
    request: {
      content: {
        data?: Record<string, unknown> | null;
      };
    };
  };
};

/** nav ready 이후에만 push — useLinking 마운트 전 setState 경고 방지 */
function pushAlarmWhenReady(href: string, navReady: boolean) {
  if (!navReady) {
    notifDebug('navigate alarm defer', { reason: 'nav-not-ready', href });
    return;
  }
  notifDebug('navigate alarm', { href, mode: 'push-deferred' });
  const task = InteractionManager.runAfterInteractions(() => {
    setTimeout(() => {
      try {
        router.push(href as never);
      } catch (e) {
        notifDebug('navigate alarm failed', {
          error: e instanceof Error ? e.message : String(e),
        });
      }
    }, 50);
  });
  return () => {
    task.cancel?.();
  };
}

function hrefFromData(data: Record<string, unknown> | null | undefined): string | null {
  if (!data || data.kind !== MED_NOTIF_KIND) return null;

  const medicationId = Number(data.medicationId);
  if (!Number.isFinite(medicationId) || medicationId <= 0) {
    notifDebug('response skip', { reason: 'bad-medicationId' });
    return null;
  }

  const doseAmountRaw =
    typeof data.doseAmount === 'string' || typeof data.doseAmount === 'number'
      ? Number(data.doseAmount)
      : NaN;

  return medicationAlarmRoute({
    medicationId,
    name: typeof data.name === 'string' ? data.name : undefined,
    scheduledTime:
      typeof data.scheduledTime === 'string' ? data.scheduledTime : undefined,
    useMethod: typeof data.useMethod === 'string' ? data.useMethod : undefined,
    doseAmount: Number.isFinite(doseAmountRaw) ? doseAmountRaw : undefined,
    doseUnit: typeof data.doseUnit === 'string' ? data.doseUnit : undefined,
  });
}

/**
 * 포그라운드 알림 탭 / warm FSI → /medication-alarm push.
 * cold start(프로세스 기동)는 Index Redirect가 담당 — 여기선 중복 push 안 함.
 */
export function MedicationNotificationResponseBridge() {
  const { loading } = useAuth();
  const navigationState = useRootNavigationState();
  const navReady = !!navigationState?.key;
  const appState = useRef<AppStateStatus>(AppState.currentState);
  const handledExpoCold = useRef(false);
  const bootFlushDone = useRef(false);
  // 이벤트는 왔지만 nav 미준비면 여기 쌓았다가 flush
  const pendingHref = useRef<string | null>(null);

  const openAlarmFromData = (data: Record<string, unknown> | null | undefined) => {
    const href = hrefFromData(data);
    if (!href) return;
    if (!navReady) {
      pendingHref.current = href;
      notifDebug('navigate alarm stash', { href });
      return;
    }
    pushAlarmWhenReady(href, true);
  };

  // nav ready 되면 stash 소비
  useEffect(() => {
    if (!navReady || !pendingHref.current) return;
    const href = pendingHref.current;
    pendingHref.current = null;
    pushAlarmWhenReady(href, true);
  }, [navReady]);

  useEffect(() => {
    if (isExpoGo) return;

    let expoSub: { remove: () => void } | undefined;
    let notifeeSub: { remove: () => void } | null = null;

    void (async () => {
      try {
        if (Platform.OS === 'android') {
          notifeeSub = await subscribeAndroidNotifeeOpen((data) => {
            openAlarmFromData(data);
          });
        }

        const Notifications = await import('expo-notifications');
        expoSub = Notifications.addNotificationResponseReceivedListener(
          (response) => {
            openAlarmFromData(
              (response as NotifResponse).notification.request.content.data ??
                {},
            );
          },
        );
      } catch (e) {
        notifDebug('response bridge failed', {
          error: e instanceof Error ? e.message : String(e),
        });
      }
    })();

    const onAppState = (next: AppStateStatus) => {
      const prev = appState.current;
      appState.current = next;
      if (next === 'active' && prev !== 'active' && !loading) {
        void (async () => {
          const pending = await consumePendingAlarmOpen();
          if (pending) {
            notifDebug('flush pending', { medicationId: pending.medicationId });
            openAlarmFromData(pending);
          }
        })();
      }
    };
    const appSub = AppState.addEventListener('change', onAppState);

    return () => {
      expoSub?.remove();
      notifeeSub?.remove();
      appSub.remove();
    };
    // openAlarmFromData는 navReady 클로저 — navReady 변경 시 재구독
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, navReady]);

  // cold start pending은 Index가 소비·Redirect. Bridge는 Index가 못 잡았을 때만 폴백.
  useEffect(() => {
    if (isExpoGo || loading || !navReady) return;
    if (bootFlushDone.current) return;
    bootFlushDone.current = true;

    let cancelled = false;
    void (async () => {
      await new Promise<void>((r) => setTimeout(r, 2800));
      if (cancelled || wasColdStartAlarmHandled()) {
        notifDebug('bridge boot flush skip', {
          coldStartHandled: wasColdStartAlarmHandled(),
        });
        return;
      }
      const pending = await consumePendingAlarmOpen();
      if (pending) {
        notifDebug('flush pending', { medicationId: pending.medicationId });
        openAlarmFromData(pending);
      }

      if (handledExpoCold.current || cancelled) return;
      handledExpoCold.current = true;
      try {
        const Notifications = await import('expo-notifications');
        const last = await Notifications.getLastNotificationResponseAsync();
        openAlarmFromData(
          (last as NotifResponse | null)?.notification.request.content.data ??
            {},
        );
      } catch {
        // ignore
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, navReady]);

  return null;
}
