import { CARE_GLANCE } from '@/shared/constants';

type OptListener = () => void;
const optListeners = new Set<OptListener>();

/** 설정 토글 후 Sync가 즉시 반영 */
export function subscribeCareGlanceOpt(listener: OptListener): () => void {
  optListeners.add(listener);
  return () => {
    optListeners.delete(listener);
  };
}

function emitCareGlanceOpt(): void {
  for (const listener of optListeners) listener();
}

/** 기본 ON — null/깨진 값 → true */
export function parseCareGlanceOpt(raw: string | null | undefined): boolean {
  if (raw === '0' || raw === 'false' || raw === 'off') return false;
  return true;
}

export async function getCareGlanceOpt(): Promise<boolean> {
  try {
    const AsyncStorage = (
      await import('@react-native-async-storage/async-storage')
    ).default;
    const raw = await AsyncStorage.getItem(CARE_GLANCE.optStorageKey);
    return parseCareGlanceOpt(raw);
  } catch {
    return true;
  }
}

export async function setCareGlanceOpt(enabled: boolean): Promise<void> {
  const AsyncStorage = (
    await import('@react-native-async-storage/async-storage')
  ).default;
  await AsyncStorage.setItem(CARE_GLANCE.optStorageKey, enabled ? '1' : '0');
  emitCareGlanceOpt();
}

export async function getCareGlanceUpdatedAt(): Promise<number | null> {
  try {
    const AsyncStorage = (
      await import('@react-native-async-storage/async-storage')
    ).default;
    const raw = await AsyncStorage.getItem(CARE_GLANCE.updatedAtStorageKey);
    if (!raw) return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

export async function setCareGlanceUpdatedAt(ms: number): Promise<void> {
  const AsyncStorage = (
    await import('@react-native-async-storage/async-storage')
  ).default;
  await AsyncStorage.setItem(CARE_GLANCE.updatedAtStorageKey, String(ms));
}

/** stale 초과면 true */
export function isCareGlanceStale(
  updatedAtMs: number | null,
  nowMs = Date.now(),
  staleMinutes = CARE_GLANCE.staleMinutes,
): boolean {
  if (updatedAtMs == null) return true;
  return nowMs - updatedAtMs > staleMinutes * 60_000;
}
