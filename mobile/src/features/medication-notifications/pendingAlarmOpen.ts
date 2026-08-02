import AsyncStorage from '@react-native-async-storage/async-storage';
import { MED_NOTIF_KIND } from '@/features/medication-notifications/fingerprint';
import { notifDebug } from '@/features/medication-notifications/notifDebug';

const STORAGE_KEY = 'yakmuk:pending_alarm_open';

/** 프로세스 살아 있을 때 즉시 소비용 */
let memoryPending: Record<string, string> | null = null;

function normalizeData(
  data: Record<string, unknown>,
): Record<string, string> | null {
  if (data.kind !== MED_NOTIF_KIND) return null;
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value == null) continue;
    out[key] = String(value);
  }
  return out;
}

/** 백그라운드/FSI 이벤트 → 브리지가 포그라운드에서 라우팅 */
export async function stashPendingAlarmOpen(
  data: Record<string, unknown>,
): Promise<void> {
  const normalized = normalizeData(data);
  if (!normalized) return;
  memoryPending = normalized;
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  } catch (e) {
    notifDebug('pending stash failed', {
      error: e instanceof Error ? e.message : String(e),
    });
  }
  notifDebug('pending stashed', {
    medicationId: normalized.medicationId,
    fingerprint: normalized.fingerprint,
  });
}

export async function consumePendingAlarmOpen(): Promise<Record<
  string,
  string
> | null> {
  const fromMemory = memoryPending;
  memoryPending = null;

  let fromStore: Record<string, string> | null = null;
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) {
      await AsyncStorage.removeItem(STORAGE_KEY);
      fromStore = JSON.parse(raw) as Record<string, string>;
    }
  } catch (e) {
    notifDebug('pending consume failed', {
      error: e instanceof Error ? e.message : String(e),
    });
  }

  return fromMemory ?? fromStore;
}

/** consume 없이 조회 — cold start 게이트용 */
export async function peekPendingAlarmOpen(): Promise<Record<
  string,
  string
> | null> {
  if (memoryPending) return memoryPending;
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Record<string, string>;
  } catch {
    return null;
  }
}
