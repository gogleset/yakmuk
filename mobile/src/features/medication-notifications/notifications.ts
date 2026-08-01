import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';
import type { Medication } from '@/entities/medication/model/types';
import {
  cancelAndroidMedicationTriggers,
  ensureAndroidMedicationChannel,
  readAndroidScheduledFingerprints,
  scheduleAndroidMedicationAlarms,
} from '@/features/medication-notifications/androidNotifee';
import {
  MED_NOTIF_ID_PREFIX,
  MED_NOTIF_KIND,
  alarmFingerprint,
  buildExpectedSchedule,
  diffFingerprints,
  fingerprintsOf,
  medNotifIdentifier,
  type ExpectedMedAlarm,
} from '@/features/medication-notifications/fingerprint';
import { notifDebug } from '@/features/medication-notifications/notifDebug';
import { COPY } from '@/shared/copy';

export { notifDebug } from '@/features/medication-notifications/notifDebug';

/** Expo Go는 SDK 53+ 에서 notifications 제한 — 정적 import 시 경고/오류 발생 */
const isExpoGo =
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

type NotificationsModule = typeof import('expo-notifications');

let notificationsModule: NotificationsModule | null = null;
let handlerReady = false;

async function loadNotifications(): Promise<NotificationsModule | null> {
  if (isExpoGo) return null;
  if (notificationsModule) return notificationsModule;

  try {
    notificationsModule = await import('expo-notifications');
    if (!handlerReady) {
      notificationsModule.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowBanner: true,
          shouldShowList: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        }),
      });
      handlerReady = true;
    }
    return notificationsModule;
  } catch (e) {
    notifDebug('expo-notifications unavailable', {
      error: e instanceof Error ? e.message : String(e),
    });
    return null;
  }
}

/** 세션 캐시 — 거절 후 재요청하면 시스템 시트 → AppState 루프 */
let permissionCache: boolean | null = null;
let permissionInflight: Promise<boolean> | null = null;

/** 알림 권한 — undetermined일 때만 요청. 거절/Expo Go면 false */
export async function ensureNotificationPermission(): Promise<boolean> {
  if (permissionCache != null) return permissionCache;
  if (permissionInflight) return permissionInflight;

  permissionInflight = (async () => {
    const Notifications = await loadNotifications();
    if (!Notifications) {
      permissionCache = false;
      return false;
    }

    const current = await Notifications.getPermissionsAsync();
    if (current.granted) {
      permissionCache = true;
    } else if (current.canAskAgain === false) {
      // 이미 거절됨 — 시트 다시 띄우지 않음 (AppState 토글 방지)
      permissionCache = false;
      return false;
    } else {
      const asked = await Notifications.requestPermissionsAsync();
      permissionCache = asked.granted;
    }

    if (!permissionCache) return false;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('medication', {
        name: COPY.notif.channel,
        importance: Notifications.AndroidImportance.HIGH,
      });
      await ensureAndroidMedicationChannel();
    }

    return true;
  })().finally(() => {
    permissionInflight = null;
  });

  return permissionInflight;
}

/** 설정 화면 등에서 명시적으로 다시 물을 때 캐시 리셋 */
export function resetNotificationPermissionCache(): void {
  permissionCache = null;
}

async function cancelMedicationScheduled(
  Notifications: NotificationsModule,
): Promise<void> {
  const all = await Notifications.getAllScheduledNotificationsAsync();
  for (const item of all) {
    const id = item.identifier;
    const kind = (item.content.data as { kind?: string } | null)?.kind;
    if (id.startsWith(MED_NOTIF_ID_PREFIX) || kind === MED_NOTIF_KIND) {
      await Notifications.cancelScheduledNotificationAsync(id);
    }
  }
}

async function readScheduledFingerprints(
  Notifications: NotificationsModule,
): Promise<string[]> {
  const all = await Notifications.getAllScheduledNotificationsAsync();
  const fps: string[] = [];
  for (const item of all) {
    const data = item.content.data as {
      kind?: string;
      fingerprint?: string;
    } | null;
    if (
      data?.kind !== MED_NOTIF_KIND &&
      !item.identifier.startsWith(MED_NOTIF_ID_PREFIX)
    ) {
      continue;
    }
    if (typeof data?.fingerprint === 'string') {
      fps.push(data.fingerprint);
    }
  }
  return fps.sort();
}

async function scheduleAlarm(
  Notifications: NotificationsModule,
  alarm: ExpectedMedAlarm,
): Promise<void> {
  const fingerprint = alarmFingerprint(alarm);
  const content = {
    title: COPY.notif.doseTitle,
    body: COPY.notif.doseBody(alarm.name, alarm.scheduledTime),
    data: {
      kind: MED_NOTIF_KIND,
      medicationId: alarm.medicationId,
      scheduledTime: alarm.scheduledTime,
      name: alarm.name,
      fingerprint,
    },
    ...(Platform.OS === 'android' ? { channelId: 'medication' } : {}),
  };

  const identifier = medNotifIdentifier(alarm);

  if (alarm.weekdayKey === 'daily') {
    await Notifications.scheduleNotificationAsync({
      identifier,
      content,
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: alarm.hour,
        minute: alarm.minute,
      },
    });
    return;
  }

  await Notifications.scheduleNotificationAsync({
    identifier,
    content,
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
      weekday: alarm.weekdayKey,
      hour: alarm.hour,
      minute: alarm.minute,
    },
  });
}

async function reconcileWithExpo(
  expected: ReturnType<typeof buildExpectedSchedule>,
  expectedFp: string[],
): Promise<void> {
  const Notifications = await loadNotifications();
  if (!Notifications) {
    notifDebug('skip', { reason: 'no-module-or-expo-go' });
    return;
  }

  const ok = await ensureNotificationPermission();
  if (!ok) {
    notifDebug('skip', { reason: 'permission-denied' });
    return;
  }

  let scheduledFp: string[] = [];
  try {
    scheduledFp = await readScheduledFingerprints(Notifications);
  } catch (e) {
    notifDebug('read scheduled failed', {
      error: e instanceof Error ? e.message : String(e),
    });
  }

  notifDebug('reconcile start', {
    expected: expectedFp.length,
    scheduled: scheduledFp.length,
    expectedFp,
    scheduledFp,
    platform: Platform.OS,
  });

  const { missing, extra, inSync } = diffFingerprints(expectedFp, scheduledFp);
  if (inSync) {
    notifDebug('ok in-sync', { count: expectedFp.length, expectedFp });
    return;
  }

  notifDebug('mismatch', { missing, extra });

  try {
    await cancelMedicationScheduled(Notifications);
    for (const alarm of expected) {
      await scheduleAlarm(Notifications, alarm);
    }
    notifDebug('resync done', { scheduled: expected.length });
  } catch (e) {
    notifDebug('resync failed', {
      error: e instanceof Error ? e.message : String(e),
    });
  }
}

/**
 * 서버 meds vs OS 로컬 스케줄 reconcile.
 * Android = Notifee(+FSI), iOS = expo-notifications.
 */
export async function reconcileMedicationNotifications(
  medications: Medication[],
  takenIds: Set<number>,
): Promise<void> {
  if (isExpoGo) {
    notifDebug('skip', { reason: 'expo-go' });
    return;
  }

  const expected = buildExpectedSchedule(medications, takenIds);
  const expectedFp = fingerprintsOf(expected);

  if (Platform.OS === 'android') {
    const channelOk = await ensureAndroidMedicationChannel();
    if (!channelOk) {
      notifDebug('android fallback expo', { reason: 'notifee-missing' });
      await reconcileWithExpo(expected, expectedFp);
      return;
    }

    const ok = await ensureNotificationPermission();
    if (!ok) {
      notifDebug('skip', { reason: 'permission-denied' });
      return;
    }

    let scheduledFp: string[] = [];
    try {
      scheduledFp = await readAndroidScheduledFingerprints();
    } catch (e) {
      notifDebug('read android scheduled failed', {
        error: e instanceof Error ? e.message : String(e),
      });
    }

    notifDebug('reconcile start', {
      expected: expectedFp.length,
      scheduled: scheduledFp.length,
      expectedFp,
      scheduledFp,
      platform: 'android-notifee',
    });

    const { missing, extra, inSync } = diffFingerprints(
      expectedFp,
      scheduledFp,
    );
    if (inSync) {
      notifDebug('ok in-sync', { count: expectedFp.length, expectedFp });
      return;
    }
    notifDebug('mismatch', { missing, extra });

    try {
      await cancelAndroidMedicationTriggers();
      await scheduleAndroidMedicationAlarms(expected);
      notifDebug('resync done', {
        scheduled: expected.length,
        adapter: 'notifee',
      });
    } catch (e) {
      notifDebug('resync failed', {
        error: e instanceof Error ? e.message : String(e),
        adapter: 'notifee',
      });
    }
    return;
  }

  await reconcileWithExpo(expected, expectedFp);
}

/** @deprecated 이름 호환 — reconcile과 동일 */
export async function syncMedicationNotifications(
  medications: Medication[],
  takenIds: Set<number>,
): Promise<void> {
  return reconcileMedicationNotifications(medications, takenIds);
}
