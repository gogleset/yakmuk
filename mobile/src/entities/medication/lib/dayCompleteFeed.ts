/** daily_logs.message — 하루 약 전부 복용 피드 마커 (유저 노출 X) */
export const DAY_COMPLETE_FEED_MARKER = 'day_complete' as const;

export function isDayCompleteFeedLog(log: {
  status: string | null;
  medicationId: number | null;
  message: string | null;
  condition?: string | null;
}): boolean {
  return (
    log.status === 'TAKEN' &&
    log.medicationId == null &&
    log.message === DAY_COMPLETE_FEED_MARKER &&
    !log.condition
  );
}
