import Constants, { ExecutionEnvironment } from 'expo-constants';
import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { subscribeAndroidNotifeeOpen } from '@/features/medication-notifications/androidNotifee';
import { MED_NOTIF_KIND } from '@/features/medication-notifications/fingerprint';
import { notifDebug } from '@/features/medication-notifications/notifDebug';
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

function openAlarmFromData(data: Record<string, unknown> | null | undefined) {
  if (!data || data.kind !== MED_NOTIF_KIND) return;

  const medicationId = Number(data.medicationId);
  if (!Number.isFinite(medicationId) || medicationId <= 0) {
    notifDebug('response skip', { reason: 'bad-medicationId' });
    return;
  }

  const doseAmountRaw =
    typeof data.doseAmount === 'string' || typeof data.doseAmount === 'number'
      ? Number(data.doseAmount)
      : NaN;

  const href = medicationAlarmRoute({
    medicationId,
    name: typeof data.name === 'string' ? data.name : undefined,
    scheduledTime:
      typeof data.scheduledTime === 'string' ? data.scheduledTime : undefined,
    useMethod: typeof data.useMethod === 'string' ? data.useMethod : undefined,
    doseAmount: Number.isFinite(doseAmountRaw) ? doseAmountRaw : undefined,
    doseUnit: typeof data.doseUnit === 'string' ? data.doseUnit : undefined,
  });
  notifDebug('navigate alarm', { medicationId, href });
  router.push(href as never);
}

function openAlarmFromResponse(response: NotifResponse | null | undefined) {
  if (!response) return;
  openAlarmFromData(response.notification.request.content.data ?? {});
}

/**
 * 알림 탭 / cold start / Android FSI → /medication-alarm.
 * root layout에서 1회 마운트.
 */
export function MedicationNotificationResponseBridge() {
  const handledColdStart = useRef(false);

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

        if (!handledColdStart.current) {
          handledColdStart.current = true;
          const last =
            await Notifications.getLastNotificationResponseAsync();
          openAlarmFromResponse(last as NotifResponse | null);
        }

        expoSub = Notifications.addNotificationResponseReceivedListener(
          (response) => {
            openAlarmFromResponse(response as NotifResponse);
          },
        );
      } catch (e) {
        notifDebug('response bridge failed', {
          error: e instanceof Error ? e.message : String(e),
        });
      }
    })();

    return () => {
      expoSub?.remove();
      notifeeSub?.remove();
    };
  }, []);

  return null;
}
