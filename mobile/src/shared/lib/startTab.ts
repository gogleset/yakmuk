/** 앱 진입 시 첫 탭 — 설정 탭은 후보 아님 */
export type StartTab = 'home' | 'family';

export const DEFAULT_START_TAB: StartTab = 'home';

/** 기기 로컬 전용 — 계정 동기화 없음 */
export const START_TAB_STORAGE_KEY = '@yakmuk/start-tab';

/** ROUTES.home / ROUTES.family 와 동일 (테스트가 RN에 안 묶이게 리터럴) */
export type StartTabHref = '/(tabs)/home' | '/(tabs)/family';

/** 깨진·빈 값 → 기본(기록) */
export function parseStartTab(raw: string | null | undefined): StartTab {
  if (raw === 'home' || raw === 'family') return raw;
  return DEFAULT_START_TAB;
}

export function startTabHref(tab: StartTab): StartTabHref {
  return tab === 'family' ? '/(tabs)/family' : '/(tabs)/home';
}

export async function getStartTab(): Promise<StartTab> {
  try {
    // lazy — unit test가 AsyncStorage/RN을 안 끌어오게
    const AsyncStorage = (
      await import('@react-native-async-storage/async-storage')
    ).default;
    const raw = await AsyncStorage.getItem(START_TAB_STORAGE_KEY);
    return parseStartTab(raw);
  } catch {
    return DEFAULT_START_TAB;
  }
}

export async function setStartTab(tab: StartTab): Promise<void> {
  const next = parseStartTab(tab);
  const AsyncStorage = (
    await import('@react-native-async-storage/async-storage')
  ).default;
  await AsyncStorage.setItem(START_TAB_STORAGE_KEY, next);
}
