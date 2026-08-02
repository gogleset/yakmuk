import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';
import { readAndroidInitialNotificationData } from '@/features/medication-notifications/androidNotifee';
import { MED_NOTIF_KIND } from '@/features/medication-notifications/fingerprint';
import { notifDebug } from '@/features/medication-notifications/notifDebug';
import {
  consumePendingAlarmOpen,
  peekPendingAlarmOpen,
  stashPendingAlarmOpen,
} from '@/features/medication-notifications/pendingAlarmOpen';
import { medicationAlarmRoute } from '@/shared/config/routes';

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

function hrefFromPending(
  pending: Record<string, string>,
): string | null {
  const medicationId = Number(pending.medicationId);
  if (!Number.isFinite(medicationId) || medicationId <= 0) {
    return null;
  }
  const doseAmountRaw = pending.doseAmount ? Number(pending.doseAmount) : NaN;
  return medicationAlarmRoute({
    medicationId,
    name: pending.name,
    scheduledTime: pending.scheduledTime,
    useMethod: pending.useMethod,
    doseAmount: Number.isFinite(doseAmountRaw) ? doseAmountRaw : undefined,
    doseUnit: pending.doseUnit,
  });
}

/**
 * pending / Notifee initial → 알람 href.
 *
 * 앱 종료 후 FSI 기동 시 headless JS(AsyncStorage stash)와 메인 번들이
 * 레이스하므로 수 초간 폴링한다. 한 번 null이면 home Redirect로 끝장나는 걸 방지.
 */
export async function resolveColdStartAlarmHref(): Promise<string | null> {
  if (Constants.executionEnvironment === ExecutionEnvironment.StoreClient) {
    return null;
  }

  const attempts = Platform.OS === 'android' ? 10 : 1;
  const gapMs = 250;

  notifDebug('cold start resolve begin', { attempts });

  for (let i = 0; i < attempts; i++) {
    // 1) headless onBackgroundEvent가 AsyncStorage에 쓴 pending
    let pending = await peekPendingAlarmOpen();
    if (pending) {
      notifDebug('cold start from pending', {
        attempt: i,
        medicationId: pending.medicationId,
      });
    }

    // 2) FSI Activity 기동 시 Notifee initial (소비형 — 반복 호출 OK, 없으면 null)
    if (!pending && Platform.OS === 'android') {
      const initial = await readAndroidInitialNotificationData();
      if (initial?.kind === MED_NOTIF_KIND) {
        await stashPendingAlarmOpen(initial);
        pending = await peekPendingAlarmOpen();
        notifDebug('cold start from initial', {
          attempt: i,
          medicationId: pending?.medicationId,
        });
      }
    }

    if (pending) {
      const href = hrefFromPending(pending);
      if (!href) {
        await consumePendingAlarmOpen();
        notifDebug('cold start skip', { reason: 'bad-medicationId' });
        return null;
      }
      await consumePendingAlarmOpen();
      notifDebug('cold start alarm href', {
        medicationId: pending.medicationId,
        href,
        attempt: i,
      });
      const { markColdStartAlarmHandled } = await import(
        '@/features/medication-notifications/coldStartAlarmFlag'
      );
      markColdStartAlarmHandled();
      return href;
    }

    if (i < attempts - 1) await sleep(gapMs);
  }

  notifDebug('cold start none', { polledMs: attempts * gapMs });
  return null;
}
