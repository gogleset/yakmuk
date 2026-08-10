const STORAGE_KEY = 'yakmuk.motion.animations_enabled';

type OptListener = () => void;
const optListeners = new Set<OptListener>();

export function subscribeMotionPref(listener: OptListener): () => void {
  optListeners.add(listener);
  return () => {
    optListeners.delete(listener);
  };
}

function emitMotionPref(): void {
  for (const listener of optListeners) listener();
}

/** 기본 ON — null/깨진 값 → true */
export function parseMotionAnimationsEnabled(
  raw: string | null | undefined,
): boolean {
  if (raw === '0' || raw === 'false' || raw === 'off') return false;
  return true;
}

export async function getMotionAnimationsEnabled(): Promise<boolean> {
  try {
    const AsyncStorage = (
      await import('@react-native-async-storage/async-storage')
    ).default;
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return parseMotionAnimationsEnabled(raw);
  } catch {
    return true;
  }
}

export async function setMotionAnimationsEnabled(
  enabled: boolean,
): Promise<void> {
  const AsyncStorage = (
    await import('@react-native-async-storage/async-storage')
  ).default;
  await AsyncStorage.setItem(STORAGE_KEY, enabled ? '1' : '0');
  emitMotionPref();
}

export const MOTION_PREF_STORAGE_KEY = STORAGE_KEY;
