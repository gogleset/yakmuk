import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Alert, Platform } from 'react-native';
import type { Medication } from '@/entities/medication/model/types';
import {
  cancelAndroidMedicationTriggers,
  ensureAndroidMedicationChannel,
  getAndroidExactAlarmStatus,
  getAndroidFullScreenIntentStatus,
  openAndroidExactAlarmSettings,
  openAndroidFullScreenIntentSettings,
  readAndroidScheduledFingerprints,
  scheduleAndroidMedicationAlarms,
} from '@/features/medication-notifications/androidNotifee';
import {
  MED_NOTIF_ID_PREFIX,
  MED_NOTIF_KIND,
  alarmFingerprint,
  alarmNotifData,
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

/** exact alarm 설정 유도 Alert — 세션당 1회 (AppState 루프 방지) */
let exactAlarmPromptedThisSession = false;
let fsiPromptedThisSession = false;

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
      await Notifications.setNotificationChannelAsync('medication-alarm', {
        name: COPY.notif.channel,
        importance: Notifications.AndroidImportance.HIGH,
        bypassDnd: true,
        vibrationPattern: [0, 250, 250, 250],
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

/** 조회만 — 시트 안 띄움. 설정 스위치 동기화용 */
export async function getNotificationPermissionGranted(): Promise<boolean> {
  const Notifications = await loadNotifications();
  if (!Notifications) return false;
  try {
    const current = await Notifications.getPermissionsAsync();
    const granted = current.granted;
    permissionCache = granted;
    return granted;
  } catch {
    return false;
  }
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
    data: alarmNotifData(alarm, fingerprint),
    ...(Platform.OS === 'android' ? { channelId: 'medication-alarm' } : {}),
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

    // Android 12+: 알림 권한과 별개 — 꺼져 있으면 스케줄은 잡혀도 발화 안 됨
    const exactAlarm = await getAndroidExactAlarmStatus();
    const fsiStatus = await getAndroidFullScreenIntentStatus();
    notifDebug('exact-alarm', { status: exactAlarm });
    notifDebug('fsi-permission', { status: fsiStatus });
    if (exactAlarm === 'disabled') {
      if (!exactAlarmPromptedThisSession) {
        exactAlarmPromptedThisSession = true;
        Alert.alert(COPY.notif.exactAlarmTitle, COPY.notif.exactAlarmBody, [
          { text: COPY.notif.exactAlarmLater, style: 'cancel' },
          {
            text: COPY.notif.exactAlarmOpen,
            onPress: () => {
              void openAndroidExactAlarmSettings();
            },
          },
        ]);
      }
      // Notifee DB엔 남아 in-sync처럼 보여도 AlarmManager는 드롭 → 스케줄 등록 보류
      notifDebug('skip', { reason: 'exact-alarm-disabled' });
      return;
    }

    // FSI 거부여도 스케줄은 계속 (헤드업 폴백). 세션 1회만 안내.
    if (fsiStatus === 'denied' && !fsiPromptedThisSession) {
      fsiPromptedThisSession = true;
      Alert.alert(COPY.notif.fsiTitle, COPY.notif.fsiBody, [
        { text: COPY.notif.exactAlarmLater, style: 'cancel' },
        {
          text: COPY.notif.exactAlarmOpen,
          onPress: () => {
            void openAndroidFullScreenIntentSettings();
          },
        },
      ]);
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
      exactAlarm,
      fsiStatus,
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
