import { WEEKLY_DIGEST } from '@/shared/constants';

/** 기본 ON */
export function parseWeeklyDigestOpt(raw: string | null | undefined): boolean {
  if (raw === '0' || raw === 'false' || raw === 'off') return false;
  return true;
}

export async function getWeeklyDigestOpt(): Promise<boolean> {
  try {
    const AsyncStorage = (
      await import('@react-native-async-storage/async-storage')
    ).default;
    const raw = await AsyncStorage.getItem(WEEKLY_DIGEST.optStorageKey);
    return parseWeeklyDigestOpt(raw);
  } catch {
    return true;
  }
}

export async function setWeeklyDigestOpt(enabled: boolean): Promise<void> {
  const AsyncStorage = (
    await import('@react-native-async-storage/async-storage')
  ).default;
  await AsyncStorage.setItem(WEEKLY_DIGEST.optStorageKey, enabled ? '1' : '0');
}

export async function getDismissedWeeklyDigestWeek(): Promise<string | null> {
  try {
    const AsyncStorage = (
      await import('@react-native-async-storage/async-storage')
    ).default;
    return await AsyncStorage.getItem(WEEKLY_DIGEST.dismissedWeekStorageKey);
  } catch {
    return null;
  }
}

export async function dismissWeeklyDigestWeek(weekStartYmd: string): Promise<void> {
  const AsyncStorage = (
    await import('@react-native-async-storage/async-storage')
  ).default;
  await AsyncStorage.setItem(
    WEEKLY_DIGEST.dismissedWeekStorageKey,
    weekStartYmd,
  );
}

/** 같은 주 dismiss면 숨김 */
export function isWeeklyDigestDismissed(
  weekStartYmd: string,
  dismissedWeek: string | null,
): boolean {
  return !!dismissedWeek && dismissedWeek === weekStartYmd;
}
