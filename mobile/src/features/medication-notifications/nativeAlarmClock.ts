import { NativeModules, Platform } from 'react-native';
import { notifDebug } from '@/features/medication-notifications/notifDebug';

type AlarmClockNative = {
  scheduleAlarmClock: (
    triggerAtMs: number,
    requestCode: number,
    data: Record<string, string> | null,
  ) => Promise<boolean>;
  cancelAlarmClock: (requestCode: number) => Promise<boolean>;
  cancelAllAlarmClocks: () => Promise<boolean>;
};

function getNative(): AlarmClockNative | null {
  if (Platform.OS !== 'android') return null;
  const mod = NativeModules.YakmukAlarmLauncher as AlarmClockNative | undefined;
  if (
    !mod ||
    typeof mod.scheduleAlarmClock !== 'function' ||
    typeof mod.cancelAllAlarmClocks !== 'function'
  ) {
    return null;
  }
  return mod;
}

/** fingerprint → 안정적인 PendingIntent requestCode (양수 31bit) */
export function alarmClockRequestCode(fingerprint: string): number {
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    hash = (hash * 31 + fingerprint.charCodeAt(i)) | 0;
  }
  // 9702/9703 예약 구간 피하고 양수로
  const code = (hash === 0 ? 1 : Math.abs(hash)) % 900_000;
  return 10_000 + code;
}

function toStringMap(
  data: Record<string, unknown> | null | undefined,
): Record<string, string> | null {
  if (!data) return null;
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(data)) {
    if (v == null) continue;
    if (
      typeof v === 'string' ||
      typeof v === 'number' ||
      typeof v === 'boolean'
    ) {
      out[k] = String(v);
    }
  }
  return Object.keys(out).length > 0 ? out : null;
}

/**
 * 시계 알람과 동일 — 종료 상태에서도 AlarmFullScreenActivity를 시스템이 직접 기동.
 * Notifee 알림과 병행 (소리/트레이 + 강제 UI).
 */
export async function scheduleNativeAlarmClock(input: {
  triggerAtMs: number;
  fingerprint: string;
  data: Record<string, unknown>;
}): Promise<boolean> {
  const native = getNative();
  if (!native) {
    notifDebug('alarmClock skip', {
      reason: 'no-native',
      hasModule: !!NativeModules.YakmukAlarmLauncher,
      keys: NativeModules.YakmukAlarmLauncher
        ? Object.keys(NativeModules.YakmukAlarmLauncher)
        : [],
    });
    return false;
  }
  const requestCode = alarmClockRequestCode(input.fingerprint);
  try {
    await native.scheduleAlarmClock(
      input.triggerAtMs,
      requestCode,
      toStringMap(input.data),
    );
    notifDebug('alarmClock scheduled', {
      requestCode,
      at: new Date(input.triggerAtMs).toISOString(),
      fingerprint: input.fingerprint,
    });
    return true;
  } catch (e) {
    notifDebug('alarmClock schedule failed', {
      error: e instanceof Error ? e.message : String(e),
    });
    return false;
  }
}

export async function cancelAllNativeAlarmClocks(): Promise<void> {
  const native = getNative();
  if (!native) return;
  try {
    await native.cancelAllAlarmClocks();
    notifDebug('alarmClock cancelAll ok');
  } catch (e) {
    notifDebug('alarmClock cancelAll failed', {
      error: e instanceof Error ? e.message : String(e),
    });
  }
}
