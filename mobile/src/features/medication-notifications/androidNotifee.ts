import type { ExpectedMedAlarm } from '@/features/medication-notifications/fingerprint';
import {
  MED_NOTIF_ID_PREFIX,
  MED_NOTIF_KIND,
  alarmFingerprint,
  alarmNotifData,
  medNotifIdentifier,
} from '@/features/medication-notifications/fingerprint';
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

export async function ensureAndroidMedicationChannel(): Promise<boolean> {
  const loaded = await loadNotifee();
  if (!loaded) return false;
  const { AndroidImportance } = loaded.ns;
  await loaded.api.createChannel({
    id: 'medication',
    name: COPY.notif.channel,
    importance: AndroidImportance.HIGH,
    sound: 'default',
  });
  return true;
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
}

export async function scheduleAndroidMedicationAlarms(
  alarms: ExpectedMedAlarm[],
): Promise<void> {
  const loaded = await loadNotifee();
  if (!loaded) {
    throw new Error('notifee-unavailable');
  }
  const {
    AndroidImportance,
    AndroidCategory,
    TriggerType,
    RepeatFrequency,
  } = loaded.ns;

  await ensureAndroidMedicationChannel();

  for (const alarm of alarms) {
    const fingerprint = alarmFingerprint(alarm);
    const id = medNotifIdentifier(alarm);
    const timestamp = nextTriggerDate(alarm).getTime();

    await loaded.api.createTriggerNotification(
      {
        id,
        title: COPY.notif.doseTitle,
        body: COPY.notif.doseBody(alarm.name, alarm.scheduledTime),
        data: alarmNotifData(alarm, fingerprint),
        android: {
          channelId: 'medication',
          category: AndroidCategory.ALARM,
          importance: AndroidImportance.HIGH,
          pressAction: { id: 'default', launchActivity: 'default' },
          // 잠금/백그라운드 풀스크린 시도
          fullScreenAction: { id: 'default', launchActivity: 'default' },
        },
      },
      {
        type: TriggerType.TIMESTAMP,
        timestamp,
        repeatFrequency:
          alarm.weekdayKey === 'daily'
            ? RepeatFrequency.DAILY
            : RepeatFrequency.WEEKLY,
        alarmManager: { allowWhileIdle: true },
      },
    );
  }
}

/** Notifee 초기/포그라운드 이벤트를 알람 라우트로 연결 */
export async function subscribeAndroidNotifeeOpen(
  onOpen: (data: Record<string, unknown>) => void,
): Promise<{ remove: () => void } | null> {
  const loaded = await loadNotifee();
  if (!loaded) return null;

  const initial = await loaded.api.getInitialNotification();
  if (initial?.notification.data) {
    onOpen(initial.notification.data as Record<string, unknown>);
  }

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

/**
 * Android FSI 즉시 테스트 — 잠금화면이면 풀스크린, 아니면 헤드업+풀페이지 라우트.
 * Expo Go/미설치 시 unavailable.
 */
export async function fireAndroidFullScreenTestAlarm(input?: {
  medicationId?: number;
  name?: string;
  scheduledTime?: string;
  useMethod?: string | null;
  doseAmount?: number | null;
  doseUnit?: string | null;
}): Promise<'ok' | 'unavailable' | 'permission-denied'> {
  const loaded = await loadNotifee();
  if (!loaded) return 'unavailable';

  const { AndroidImportance, AndroidCategory, AndroidVisibility } = loaded.ns;

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

  await ensureAndroidMedicationChannel();

  const medicationId = input?.medicationId ?? 3;
  const name = input?.name ?? '테스트 약';
  const scheduledTime = input?.scheduledTime ?? '지금';
  const fingerprint = `test|fsi|${Date.now()}`;
  // 테스트용 최소 ExpectedMedAlarm — weekday/hour는 data에 안 실림
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

  try {
    await loaded.api.displayNotification({
      id: `${MED_NOTIF_ID_PREFIX}fsi-test`,
      title: COPY.notif.doseTitle,
      body: COPY.notif.doseBody(name, scheduledTime),
      data: alarmData,
      android: {
        channelId: 'medication',
        category: AndroidCategory.ALARM,
        importance: AndroidImportance.HIGH,
        visibility: AndroidVisibility.PUBLIC,
        pressAction: { id: 'default', launchActivity: 'default' },
        fullScreenAction: { id: 'default', launchActivity: 'default' },
        // 테스트용 — 화면 켜진 상태에서도 눈에 띄게
        ongoing: true,
        autoCancel: true,
      },
    });
    notifDebug('fsi test fired', { medicationId, name });
    return 'ok';
  } catch (e) {
    notifDebug('fsi test failed', {
      error: e instanceof Error ? e.message : String(e),
    });
    return 'unavailable';
  }
}
