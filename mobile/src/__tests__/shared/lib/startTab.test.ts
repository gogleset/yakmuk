import {
  DEFAULT_START_TAB,
  parseStartTab,
  startTabHref,
} from '@/shared/lib/startTab';

describe('parseStartTab', () => {
  it('home·family만 통과', () => {
    expect(parseStartTab('home')).toBe('home');
    expect(parseStartTab('family')).toBe('family');
  });

  it('없거나 깨진 값은 기본(기록)', () => {
    expect(parseStartTab(null)).toBe(DEFAULT_START_TAB);
    expect(parseStartTab(undefined)).toBe(DEFAULT_START_TAB);
    expect(parseStartTab('')).toBe(DEFAULT_START_TAB);
    expect(parseStartTab('settings')).toBe(DEFAULT_START_TAB);
    expect(parseStartTab('HOME')).toBe(DEFAULT_START_TAB);
  });

  it('기본값은 home', () => {
    expect(DEFAULT_START_TAB).toBe('home');
  });
});

describe('startTabHref', () => {
  it('home → 기록 탭, family → 가족 탭', () => {
    expect(startTabHref('home')).toBe('/(tabs)/home');
    expect(startTabHref('family')).toBe('/(tabs)/family');
  });
});
