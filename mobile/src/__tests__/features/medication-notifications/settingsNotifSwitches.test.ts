import {
  basicNotifSwitchOn,
  fullPageFsiSwitchOn,
  isFullPageSwitchDisabled,
} from '@/features/medication-notifications/lib/settingsNotifSwitches';

describe('settingsNotifSwitches', () => {
  it('basicNotifSwitchOn — granted만 true', () => {
    expect(basicNotifSwitchOn(true)).toBe(true);
    expect(basicNotifSwitchOn(false)).toBe(false);
  });

  it('fullPageFsiSwitchOn — allowed만 true', () => {
    expect(fullPageFsiSwitchOn('allowed')).toBe(true);
    expect(fullPageFsiSwitchOn('denied')).toBe(false);
    expect(fullPageFsiSwitchOn('unsupported')).toBe(false);
    expect(fullPageFsiSwitchOn('unavailable')).toBe(false);
  });

  it('isFullPageSwitchDisabled — 기본 알림 OFF면 disabled', () => {
    expect(isFullPageSwitchDisabled(false)).toBe(true);
    expect(isFullPageSwitchDisabled(true)).toBe(false);
  });
});
