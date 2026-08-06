/**
 * 설정 약 알림 스위치 ↔ OS 상태 매핑.
 * Switch.value는 항상 OS 진실 — 낙관적 setState로 어긋나게 두지 않음.
 */

export type AndroidFsiStatus =
  | 'allowed'
  | 'denied'
  | 'unsupported'
  | 'unavailable';

/** 기본 알림 스위치 — granted면 ON */
export function basicNotifSwitchOn(granted: boolean): boolean {
  return granted;
}

/** 풀페이지(FSI) 스위치 — allowed만 ON. unsupported/unavailable은 OFF */
export function fullPageFsiSwitchOn(status: AndroidFsiStatus): boolean {
  return status === 'allowed';
}

/** 기본 알림 OFF면 풀페이지 스위치 비활성 */
export function isFullPageSwitchDisabled(notifGranted: boolean): boolean {
  return !notifGranted;
}
