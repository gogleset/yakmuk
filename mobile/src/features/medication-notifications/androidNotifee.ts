import { NativeModules, Platform } from 'react-native';
import type { ExpectedMedAlarm } from '@/features/medication-notifications/fingerprint';
import {
  MED_NOTIF_ID_PREFIX,
  MED_NOTIF_KIND,
  alarmFingerprint,
  alarmNotifData,
  medNotifIdentifier,
} from '@/features/medication-notifications/fingerprint';
import {
  cancelAllNativeAlarmClocks,
  scheduleNativeAlarmClock,
} from '@/features/medication-notifications/nativeAlarmClock';
import { notifDebug } from '@/features/medication-notifications/notifDebug';
import { COPY } from '@/shared/copy';

type NotifeeNs = typeof import('@notifee/react-native');
type NotifeeApi = NotifeeNs['default'];

type LoadedNotifee = {
  api: NotifeeApi;
  ns: NotifeeNs;
};

let cached: LoadedNotifee | null = null;

/** Metro/Hermes: dynamic import에서 default가 빠질 수 있음 */
function resolveNotifeeApi(ns: NotifeeNs): NotifeeApi | null {
  const fromDefault = ns.default;
  if (fromDefault && typeof fromDefault.displayNotification === 'function') {
    return fromDefault;
  }
  // CJS interop — API가 모듈 루트에 붙는 경우
  const asApi = ns as unknown as NotifeeApi;
  if (typeof asApi.displayNotification === 'function') {
    return asApi;
  }
  return null;
}

async function loadNotifee(): Promise<LoadedNotifee | null> {
  if (cached) return cached;
  try {
    const ns = await import('@notifee/react-native');
    const api = resolveNotifeeApi(ns);
    if (!api) {
      notifDebug('notifee unavailable', { reason: 'no-api' });
      return null;
    }
    cached = { api, ns };
    return cached;
  } catch (e) {
    notifDebug('notifee unavailable', {
      error: e instanceof Error ? e.message : String(e),
    });
    return null;
  }
}

/** 다음 발생 시각 (로컬) — daily 또는 expo weekday(1=일…7=토) */
function nextTriggerDate(alarm: ExpectedMedAlarm): Date {
  const now = new Date();
  const next = new Date(now);
  next.setSeconds(0, 0);
  next.setHours(alarm.hour, alarm.minute, 0, 0);

  if (alarm.weekdayKey === 'daily') {
    if (next.getTime() <= now.getTime()) {
      next.setDate(next.getDate() + 1);
    }
    return next;
  }

  // JS getDay: 0=일…6=토 · expo weekday: 1=일…7=토 → getDay = weekdayKey - 1
  const targetGetDay = alarm.weekdayKey - 1;
  for (let i = 0; i < 8; i++) {
    const candidate = new Date(now);
    candidate.setDate(now.getDate() + i);
    candidate.setHours(alarm.hour, alarm.minute, 0, 0);
    if (
      candidate.getDay() === targetGetDay &&
      candidate.getTime() > now.getTime()
    ) {
      return candidate;
    }
  }
  next.setDate(next.getDate() + 7);
  return next;
}

/** 표시 중인 복약 알림 취소 — 소리/진동 루프 끊기 */
export async function cancelDisplayedMedicationNotifications(): Promise<void> {
  const loaded = await loadNotifee();
  if (!loaded) return;
  try {
    const displayed = await loaded.api.getDisplayedNotifications();
    const ids = displayed
      .filter((n) => {
        const id = n.id ?? n.notification?.id ?? '';
        const kind = (n.notification?.data as { kind?: string } | undefined)
          ?.kind;
        const channel = n.notification?.android?.channelId;
        return (
          id.startsWith(MED_NOTIF_ID_PREFIX) ||
          kind === MED_NOTIF_KIND ||
          channel === 'medication-alarm'
        );
      })
      .map((n) => n.id ?? n.notification?.id)
      .filter((id): id is string => Boolean(id));
    if (ids.length > 0) {
      await loaded.api.cancelDisplayedNotifications(ids);
      notifDebug('cancel displayed', { ids });
    }
  } catch (e) {
    notifDebug('cancel displayed failed', {
      error: e instanceof Error ? e.message : String(e),
    });
  }
}

/**
 * Android 14+ USE_FULL_SCREEN_INTENT 실제 허용 여부.
 * 꺼져 있으면 잠금/화면꺼짐에서도 FSI Activity가 안 뜨고 헤드업만.
 */
export async function getAndroidFullScreenIntentStatus(): Promise<
  'allowed' | 'denied' | 'unsupported' | 'unavailable'
> {
  if (Platform.OS !== 'android') return 'unsupported';
  const mod = NativeModules.YakmukAlarmLauncher as
    | { canUseFullScreenIntent?: () => Promise<boolean> }
    | undefined;
  if (!mod || typeof mod.canUseFullScreenIntent !== 'function') {
    return 'unavailable';
  }
  try {
    const ok = await mod.canUseFullScreenIntent();
    return ok ? 'allowed' : 'denied';
  } catch (e) {
    notifDebug('fsi status failed', {
      error: e instanceof Error ? e.message : String(e),
    });
    return 'unavailable';
  }
}

export async function ensureAndroidMedicationChannel(): Promise<boolean> {
  const loaded = await loadNotifee();
  if (!loaded) return false;
  const { AndroidImportance } = loaded.ns;
  // 새 채널 id — 예전 medication 채널 importance가 낮게 고정됐을 수 있음
  try {
    await loaded.api.createChannel({
      id: 'medication-alarm',
      name: COPY.notif.channel,
      importance: AndroidImportance.HIGH,
      sound: 'default',
      vibration: true,
      bypassDnd: true,
    });
  } catch (e) {
    // bypassDnd 실패 시 기본 채널만
    notifDebug('channel create fallback', {
      error: e instanceof Error ? e.message : String(e),
    });
    await loaded.api.createChannel({
      id: 'medication-alarm',
      name: COPY.notif.channel,
      importance: AndroidImportance.HIGH,
      sound: 'default',
      vibration: true,
    });
  }
  return true;
}

/**
 * Android 12+ 정확 알람(Alarms & reminders) — POST_NOTIFICATIONS와 별개.
 * DISABLED면 AlarmManager 트리거가 조용히 안 뜸 (Notifee DB엔 잡혀 in-sync처럼 보임).
 */
export async function getAndroidExactAlarmStatus(): Promise<
  'enabled' | 'disabled' | 'unsupported' | 'unavailable'
> {
  const loaded = await loadNotifee();
  if (!loaded) return 'unavailable';
  try {
    const settings = await loaded.api.getNotificationSettings();
    const { AndroidNotificationSetting } = loaded.ns;
    const alarm = settings.android?.alarm;
    if (alarm === AndroidNotificationSetting.ENABLED) return 'enabled';
    if (alarm === AndroidNotificationSetting.NOT_SUPPORTED) return 'unsupported';
    return 'disabled';
  } catch (e) {
    notifDebug('exact-alarm status failed', {
      error: e instanceof Error ? e.message : String(e),
    });
    return 'unavailable';
  }
}

/** 시스템「알람 및 리마인더」설정 화면 */
export async function openAndroidExactAlarmSettings(): Promise<boolean> {
  const loaded = await loadNotifee();
  if (!loaded) return false;
  try {
    await loaded.api.openAlarmPermissionSettings();
    return true;
  } catch (e) {
    notifDebug('exact-alarm settings open failed', {
      error: e instanceof Error ? e.message : String(e),
    });
    return false;
  }
}

export async function readAndroidScheduledFingerprints(): Promise<string[]> {
  const loaded = await loadNotifee();
  if (!loaded) return [];
  const triggers = await loaded.api.getTriggerNotifications();
  const fps: string[] = [];
  for (const item of triggers) {
    const id = item.notification.id ?? '';
    const data = item.notification.data as
      | { kind?: string; fingerprint?: string }
      | undefined;
    if (!id.startsWith(MED_NOTIF_ID_PREFIX) && data?.kind !== MED_NOTIF_KIND) {
      continue;
    }
    if (typeof data?.fingerprint === 'string') {
      fps.push(data.fingerprint);
    }
  }
  return fps.sort();
}

export async function cancelAndroidMedicationTriggers(): Promise<void> {
  const loaded = await loadNotifee();
  if (!loaded) return;
  const triggers = await loaded.api.getTriggerNotifications();
  const ids: string[] = [];
  for (const item of triggers) {
    const id = item.notification.id ?? '';
    const kind = (item.notification.data as { kind?: string } | undefined)?.kind;
    if (id.startsWith(MED_NOTIF_ID_PREFIX) || kind === MED_NOTIF_KIND) {
      ids.push(id);
    }
  }
  if (ids.length > 0) {
    await loaded.api.cancelTriggerNotifications(ids);
  }
  // Notifee와 별도 — Activity 강제 기동용 AlarmClock도 정리
  await cancelAllNativeAlarmClocks();
}

/** 복약 알림 공통 android 옵션 — FSI로 AlarmFullScreenActivity 기동 */
function medicationAndroidNotifOpts(loaded: LoadedNotifee) {
  const {
    AndroidImportance,
    AndroidCategory,
    AndroidVisibility,
    AndroidLaunchActivityFlag,
  } = loaded.ns;

  const launchFlags = [
    AndroidLaunchActivityFlag.NEW_TASK,
    AndroidLaunchActivityFlag.CLEAR_TOP,
    AndroidLaunchActivityFlag.SINGLE_TOP,
    AndroidLaunchActivityFlag.REORDER_TO_FRONT,
  ];

  return {
    channelId: 'medication-alarm',
    category: AndroidCategory.ALARM,
    importance: AndroidImportance.HIGH,
    visibility: AndroidVisibility.PUBLIC,
    lightUpScreen: true,
    // 탭 → 일반 기동
    pressAction: {
      id: 'default',
      launchActivity: 'default',
      launchActivityFlags: launchFlags,
    },
    // 잠금/화면꺼짐 → 전용 FSI Activity.
    // launchActivityFlags 넣지 않음 — Notifee 기본(NEW_TASK|RESET_TASK) 유지.
    // 커스텀 flags가 FSI PendingIntent를 깨는 기기 있음.
    fullScreenAction: {
      id: 'default',
      launchActivity: 'com.jinlabs.yakok.AlarmFullScreenActivity',
    },
    // 무한 울림 금지 — 한 번만 (구버전 loopSound:true 트리거는 fp 태그로 재등록)
    ongoing: false,
    autoCancel: true,
    loopSound: false,
    sound: 'default',
    // 알림음/진동 상한 — OEM이 ALARM 카테고리 루프해도 알림 자체는 사라짐
    timeoutAfter: 60_000,
  };
}

/** AlarmClock 트리거 — Doze/종료 후에도 깨우기 가장 확실 */
function alarmClockTrigger(
  loaded: LoadedNotifee,
  timestamp: number,
  repeatFrequency?: number,
) {
  const { TriggerType, AlarmType } = loaded.ns;
  // TriggerType이 런타임 enum이라 리터럴 narrowing이 안 됨 → 캐스팅
  return {
    type: TriggerType.TIMESTAMP,
    timestamp,
    ...(repeatFrequency != null ? { repeatFrequency } : {}),
    alarmManager: {
      type: AlarmType.SET_ALARM_CLOCK,
    },
  } as import('@notifee/react-native').TimestampTrigger;
}

export async function scheduleAndroidMedicationAlarms(
  alarms: ExpectedMedAlarm[],
): Promise<void> {
  const loaded = await loadNotifee();
  if (!loaded) {
    throw new Error('notifee-unavailable');
  }
  const { RepeatFrequency } = loaded.ns;

  await ensureAndroidMedicationChannel();
  const androidOpts = medicationAndroidNotifOpts(loaded);

  for (const alarm of alarms) {
    const fingerprint = alarmFingerprint(alarm);
    const id = medNotifIdentifier(alarm);
    const nextAt = nextTriggerDate(alarm);
    const timestamp = nextAt.getTime();

    notifDebug('schedule trigger', {
      id,
      fingerprint,
      nextAt: nextAt.toISOString(),
      local: `${nextAt.getFullYear()}-${String(nextAt.getMonth() + 1).padStart(2, '0')}-${String(nextAt.getDate()).padStart(2, '0')} ${String(nextAt.getHours()).padStart(2, '0')}:${String(nextAt.getMinutes()).padStart(2, '0')}`,
      alarmType: 'SET_ALARM_CLOCK+FSI',
    });

    await loaded.api.createTriggerNotification(
      {
        id,
        title: COPY.notif.doseTitle,
        body: COPY.notif.doseBody(alarm.name, alarm.scheduledTime),
        data: alarmNotifData(alarm, fingerprint),
        android: androidOpts,
      },
      alarmClockTrigger(
        loaded,
        timestamp,
        alarm.weekdayKey === 'daily'
          ? RepeatFrequency.DAILY
          : RepeatFrequency.WEEKLY,
      ),
    );

    // 강제 UI — AlarmManager가 Activity를 직접 기동 (앱 종료·잠금해제 포함)
    await scheduleNativeAlarmClock({
      triggerAtMs: timestamp,
      fingerprint,
      data: alarmNotifData(alarm, fingerprint),
    });
  }
}

/**
 * __DEV__ — N초 뒤 1회 트리거. exact alarm / AlarmManager 발화 검증용.
 */
export async function scheduleAndroidTestTriggerInSeconds(
  seconds: number,
): Promise<'ok' | 'unavailable' | 'exact-alarm-disabled'> {
  const loaded = await loadNotifee();
  if (!loaded) return 'unavailable';

  const alarmStatus = await getAndroidExactAlarmStatus();
  if (alarmStatus === 'disabled') return 'exact-alarm-disabled';

  await ensureAndroidMedicationChannel();
  const androidOpts = medicationAndroidNotifOpts(loaded);

  const delaySec = Math.max(5, Math.floor(seconds));
  const timestamp = Date.now() + delaySec * 1000;
  const fingerprint = `test|delay|${timestamp}`;

  await loaded.api.createTriggerNotification(
    {
      id: `${MED_NOTIF_ID_PREFIX}delay-test`,
      title: COPY.notif.doseTitle,
      body: COPY.notif.testDelayBody(delaySec),
      data: {
        kind: MED_NOTIF_KIND,
        medicationId: '0',
        scheduledTime: 'test',
        name: '테스트',
        fingerprint,
      },
      android: androidOpts,
    },
    alarmClockTrigger(loaded, timestamp),
  );

  notifDebug('delay test scheduled', {
    delaySec,
    at: new Date(timestamp).toISOString(),
  });
  return 'ok';
}

/** Notifee 초기/포그라운드 이벤트를 알람 라우트로 연결 */
export async function readAndroidInitialNotificationData(): Promise<Record<
  string,
  unknown
> | null> {
  const loaded = await loadNotifee();
  if (!loaded) return null;
  try {
    const initial = await loaded.api.getInitialNotification();
    const data = initial?.notification?.data;
    if (data && typeof data === 'object') {
      return data as Record<string, unknown>;
    }
  } catch (e) {
    notifDebug('initial notification read failed', {
      error: e instanceof Error ? e.message : String(e),
    });
  }
  return null;
}

export async function subscribeAndroidNotifeeOpen(
  onOpen: (data: Record<string, unknown>) => void,
): Promise<{ remove: () => void } | null> {
  const loaded = await loadNotifee();
  if (!loaded) return null;

  // getInitialNotification은 cold start 게이트(Index)가 소비 — 여기선 포그라운드만
  const unsub = loaded.api.onForegroundEvent(({ type, detail }) => {
    const EventType = loaded.ns.EventType;
    // PRESS=탭 · DELIVERED=발화(포그라운드/FSI 직후) → 풀페이지
    if (
      type === EventType.PRESS ||
      type === EventType.ACTION_PRESS ||
      type === EventType.DELIVERED
    ) {
      const data = detail.notification?.data;
      if (data && (data as { kind?: string }).kind === MED_NOTIF_KIND) {
        onOpen(data as Record<string, unknown>);
      }
    }
  });
  return { remove: unsub };
}

/** Android 14+ 전체 화면 알림 설정 (실패 시 앱 알림 설정) */
export async function openAndroidFullScreenIntentSettings(): Promise<boolean> {
  const { Linking } = await import('react-native');
  const pkg = 'com.jinlabs.yakok';
  try {
    // 기기/API에 따라 Activity 없을 수 있음 → 알림 설정으로 폴백
    await Linking.sendIntent(
      'android.settings.MANAGE_APP_USE_FULL_SCREEN_INTENT',
    );
    return true;
  } catch (e1) {
    notifDebug('fsi settings primary failed', {
      error: e1 instanceof Error ? e1.message : String(e1),
    });
    try {
      await Linking.sendIntent('android.settings.APP_NOTIFICATION_SETTINGS', [
        { key: 'android.provider.extra.APP_PACKAGE', value: pkg },
      ]);
      return true;
    } catch (e2) {
      notifDebug('fsi settings open failed', {
        error: e2 instanceof Error ? e2.message : String(e2),
      });
      return false;
    }
  }
}

/**
 * Android FSI 테스트.
 * - lockScreen(기본): N초 뒤 트리거 → 잠가야 진짜 풀스크린
 * - immediate: 포그라운드 즉시 display (헤드업+라우트만, FSI 아님)
 */
export async function fireAndroidFullScreenTestAlarm(input?: {
  medicationId?: number;
  name?: string;
  scheduledTime?: string;
  useMethod?: string | null;
  doseAmount?: number | null;
  doseUnit?: string | null;
  /** 잠금 검증용 지연(초). 기본 15. immediate면 무시 */
  delaySeconds?: number;
  mode?: 'lock-screen' | 'immediate';
}): Promise<
  'ok' | 'unavailable' | 'permission-denied' | 'exact-alarm-disabled'
> {
  const loaded = await loadNotifee();
  if (!loaded) return 'unavailable';

  const mode = input?.mode ?? 'lock-screen';

  try {
    const settings = await loaded.api.getNotificationSettings();
    if (settings.authorizationStatus < 1) {
      await loaded.api.requestPermission();
    }
  } catch (e) {
    notifDebug('fsi permission check failed', {
      error: e instanceof Error ? e.message : String(e),
    });
  }

  if (mode === 'lock-screen') {
    const alarmStatus = await getAndroidExactAlarmStatus();
    if (alarmStatus === 'disabled') return 'exact-alarm-disabled';
    const fsiStatus = await getAndroidFullScreenIntentStatus();
    if (fsiStatus === 'denied') return 'permission-denied';
  }

  await ensureAndroidMedicationChannel();

  const medicationId = input?.medicationId ?? 3;
  const name = input?.name ?? '테스트 약';
  const scheduledTime = input?.scheduledTime ?? '지금';
  const fingerprint = `test|fsi|${Date.now()}`;
  const alarmData = alarmNotifData(
    {
      medicationId,
      name,
      scheduledTime,
      hour: 0,
      minute: 0,
      weekdayKey: 'daily',
      useMethod: input?.useMethod ?? null,
      doseAmount: input?.doseAmount ?? null,
      doseUnit: input?.doseUnit ?? null,
    },
    fingerprint,
  );

  const androidOpts = medicationAndroidNotifOpts(loaded);

  try {
    if (mode === 'immediate') {
      await loaded.api.displayNotification({
        id: `${MED_NOTIF_ID_PREFIX}fsi-test`,
        title: COPY.notif.doseTitle,
        body: COPY.notif.doseBody(name, scheduledTime),
        data: alarmData,
        android: androidOpts,
      });
      notifDebug('fsi test immediate', { medicationId, name });
      return 'ok';
    }

    const delaySec = Math.max(5, Math.floor(input?.delaySeconds ?? 15));
    const timestamp = Date.now() + delaySec * 1000;
    await loaded.api.createTriggerNotification(
      {
        id: `${MED_NOTIF_ID_PREFIX}fsi-test`,
        title: COPY.notif.doseTitle,
        body: COPY.notif.doseBody(name, scheduledTime),
        data: alarmData,
        android: androidOpts,
      },
      alarmClockTrigger(loaded, timestamp),
    );
    // 강제 기동 본체 — Notifee와 별도 setAlarmClock → AlarmReceiver → FSI
    await scheduleNativeAlarmClock({
      triggerAtMs: timestamp,
      fingerprint,
      data: alarmData,
    });
    notifDebug('fsi lock-screen scheduled', {
      medicationId,
      delaySec,
      at: new Date(timestamp).toISOString(),
      // 네이티브 = setAlarmClock → AlarmReceiver → FSI notify (화면 OFF 시 시스템 기동)
      alarmType: 'SET_ALARM_CLOCK+FSI',
    });
    return 'ok';
  } catch (e) {
    notifDebug('fsi test failed', {
      error: e instanceof Error ? e.message : String(e),
    });
    return 'unavailable';
  }
}
