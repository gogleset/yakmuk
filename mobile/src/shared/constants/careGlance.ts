/** 보호자 glance 고정/교체 알림 — decisions #10 */
export const CARE_GLANCE = {
  channelId: 'care-glance',
  notificationId: 'yakmuk-care-glance',
  kind: 'care-glance',
  /** G1.3 stale — 분 */
  staleMinutes: 30,
  optStorageKey: '@yakmuk/care-glance-opt',
  updatedAtStorageKey: '@yakmuk/care-glance-updated-at',
} as const;

/** 주간 안부 인앱 — decisions #11 */
export const WEEKLY_DIGEST = {
  optStorageKey: '@yakmuk/weekly-digest-opt',
  dismissedWeekStorageKey: '@yakmuk/weekly-digest-dismissed-week',
  /** 집계 일수 (오늘 포함, KST) */
  dayCount: 7,
} as const;
